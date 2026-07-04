import { getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { ApiError } from '@/lib/api/errors';
import { getDb, isDataSourceConfigured, resolveStorageBucket } from './admin';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

export function isStorageConfigured(): boolean {
  return isDataSourceConfigured();
}

export function publicStorageUrl(objectPath: string): string {
  const bucket = resolveStorageBucket();
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

/** Normalize browser-reported types and sniff magic bytes when the type is missing or generic. */
export function normalizeImageContentType(contentType: string, buffer: Buffer): string {
  const base = contentType.toLowerCase().split(';')[0]?.trim() ?? '';
  if (base === 'image/jpg') return 'image/jpeg';
  if (base && base !== 'application/octet-stream' && ALLOWED_TYPES.has(base)) return base;

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  const head = buffer.toString('utf8', 0, Math.min(buffer.length, 256)).trimStart();
  if (head.startsWith('<svg') || head.includes('<svg')) return 'image/svg+xml';

  return base || 'application/octet-stream';
}

function isBucketNotFound(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: number | string; message?: string };
  if (e.code === 404 || e.code === '404') return true;
  const msg = e.message?.toLowerCase() ?? '';
  return msg.includes('bucket does not exist') || msg.includes('specified bucket');
}

function isUniformBucketAccessError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.message.toLowerCase().includes('uniform bucket-level access');
}

function storageConfigurationError(bucket: string): ApiError {
  const credentials = resolveStorageBucket();
  return new ApiError(
    'DATA_SOURCE_NOT_CONFIGURED',
    `Storage bucket "${bucket}" was not found or is not accessible. In Firebase Console → Storage, copy the bucket name into FIREBASE_STORAGE_BUCKET (e.g. ${credentials}). Legacy projects may use {projectId}.appspot.com.`,
  );
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

  const contentType = normalizeImageContentType(input.contentType, input.buffer);
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

  getDb();
  const app = getApps()[0];
  if (!app) {
    throw new ApiError('DATA_SOURCE_NOT_CONFIGURED', 'Firebase Admin is not initialized.');
  }

  const bucketName = resolveStorageBucket();
  const bucket = getStorage(app).bucket(bucketName);
  const file = bucket.file(objectPath);

  try {
    await file.save(input.buffer, {
      metadata: {
        contentType,
        cacheControl: 'public, max-age=31536000',
      },
    });
  } catch (err) {
    if (isBucketNotFound(err)) throw storageConfigurationError(bucketName);
    throw err;
  }

  try {
    await file.makePublic();
  } catch (err) {
    // Buckets with uniform bucket-level access reject per-object ACL updates; public read
    // must be configured at bucket/IAM level instead.
    if (!isUniformBucketAccessError(err)) throw err;
  }

  return publicStorageUrl(objectPath);
}
