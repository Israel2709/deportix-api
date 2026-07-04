import { getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { ApiError } from '@/lib/api/errors';
import { getDb, isDataSourceConfigured, readCredentialsForStorage } from './admin';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

function bucketName(): string {
  const explicit = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  if (explicit) return explicit;
  const creds = readCredentialsForStorage();
  if (!creds) throw new ApiError('DATA_SOURCE_NOT_CONFIGURED', 'Storage is not configured.');
  return `${creds.projectId}.appspot.com`;
}

export function isStorageConfigured(): boolean {
  return isDataSourceConfigured();
}

export function publicStorageUrl(objectPath: string): string {
  const bucket = bucketName();
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(objectPath)}?alt=media`;
}

function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'bin';
  }
}

export interface UploadImageInput {
  buffer: Buffer;
  contentType: string;
  purpose: string;
  entityId?: string | null;
}

/** Upload an image to Firebase Storage and return its public URL. */
export async function uploadImage(input: UploadImageInput): Promise<string> {
  if (!isStorageConfigured()) {
    throw new ApiError(
      'DATA_SOURCE_NOT_CONFIGURED',
      'Storage is not configured. Set Firebase Admin credentials and FIREBASE_STORAGE_BUCKET.',
    );
  }

  const contentType = input.contentType.toLowerCase();
  if (!ALLOWED_TYPES.has(contentType)) {
    throw new ApiError(
      'INVALID_REQUEST_BODY',
      'Unsupported image type. Allowed: PNG, JPEG, WebP, SVG.',
    );
  }
  if (input.buffer.byteLength > MAX_BYTES) {
    throw new ApiError('INVALID_REQUEST_BODY', 'Image must be 5 MB or smaller.');
  }

  const safePurpose = input.purpose.replace(/[^a-z0-9_-]/gi, '_').slice(0, 40) || 'asset';
  const safeEntity = (input.entityId ?? 'misc').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  const ext = extensionForContentType(contentType);
  const objectPath = `uploads/${safePurpose}/${safeEntity}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  // Ensures Firebase Admin is initialized (same path as Firestore reads).
  getDb();
  const app = getApps()[0];
  if (!app) {
    throw new ApiError('DATA_SOURCE_NOT_CONFIGURED', 'Firebase Admin is not initialized.');
  }

  const bucket = getStorage(app).bucket(bucketName());
  const file = bucket.file(objectPath);
  await file.save(input.buffer, {
    metadata: {
      contentType,
      cacheControl: 'public, max-age=31536000',
    },
  });
  await file.makePublic();

  return publicStorageUrl(objectPath);
}
