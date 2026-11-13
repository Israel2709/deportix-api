import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { ApiError } from '@/lib/api/errors';

/**
 * Firebase Admin SDK bootstrap. SERVER-ONLY (Node.js runtime). Never import this from a
 * client component or the Edge runtime. Credentials come exclusively from environment
 * variables — there is no service-account file in the repo.
 *
 * ID tokens are verified with `jose` + Google's JWKS — not `firebase-admin/auth`.
 * Loading `firebase-admin/auth` on Vercel crashes with ERR_REQUIRE_ESM (jwks-rsa → jose@6).
 */

interface ServiceAccountCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export interface VerifiedIdToken {
  uid: string;
  email: string | null;
  payload: JWTPayload;
}

let cachedDb: Firestore | null = null;

/** Google JWKS for Firebase Auth ID tokens (shared across warm instances). */
const firebaseAuthJwks = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
);

function readCredentials(): ServiceAccountCredentials | null {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawPrivateKey) return null;

  // Secret Manager / .env footguns: wrapping quotes, CRLF, and literal "\n" escapes.
  // Vercel/App Hosting may store real newlines; local .env usually keeps \n as two chars.
  let privateKey = rawPrivateKey.trim();
  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');

  return { projectId, clientEmail, privateKey };
}

/** Exposed for storage bucket resolution (same credentials as Firestore). */
export function readCredentialsForStorage(): ServiceAccountCredentials | null {
  return readCredentials();
}

/** True when all three Firebase Admin env vars are present. */
export function isDataSourceConfigured(): boolean {
  return readCredentials() !== null;
}

/**
 * Firebase Storage bucket name. Prefer FIREBASE_STORAGE_BUCKET; otherwise the default bucket
 * for projects created after 2024 ({projectId}.firebasestorage.app). Legacy buckets use
 * {projectId}.appspot.com — set the env var explicitly if uploads fail with "bucket not found".
 */
export function resolveStorageBucket(): string {
  const explicit = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  if (explicit) return explicit.replace(/^gs:\/\//, '');

  const credentials = readCredentials();
  if (!credentials) {
    throw new ApiError('DATA_SOURCE_NOT_CONFIGURED', 'Storage is not configured.');
  }
  return `${credentials.projectId}.firebasestorage.app`;
}

function getOrInitAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const credentials = readCredentials();
  if (!credentials) {
    throw new ApiError(
      'DATA_SOURCE_NOT_CONFIGURED',
      'The data source is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.',
    );
  }

  return initializeApp({
    credential: cert({
      projectId: credentials.projectId,
      clientEmail: credentials.clientEmail,
      privateKey: credentials.privateKey,
    }),
    projectId: credentials.projectId,
    storageBucket: resolveStorageBucket(),
  });
}

/**
 * Returns a cached Firestore instance, initializing the Admin app on first use.
 * Throws `DATA_SOURCE_NOT_CONFIGURED` (-> HTTP 503) when credentials are missing, so the
 * API degrades gracefully instead of crashing when env vars are not yet set.
 */
export function getDb(): Firestore {
  if (cachedDb) return cachedDb;
  cachedDb = getFirestore(getOrInitAdminApp());
  return cachedDb;
}

/**
 * Verifies a Firebase Auth ID token with Google's JWKS via `jose`.
 * Does not load `firebase-admin/auth` (that path crashes on Vercel: ERR_REQUIRE_ESM).
 * Requires `FIREBASE_PROJECT_ID` (same project that issued the token).
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedIdToken> {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId) {
    throw new ApiError(
      'DATA_SOURCE_NOT_CONFIGURED',
      'The data source is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.',
    );
  }

  const { payload } = await jwtVerify(idToken, firebaseAuthJwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  const uid =
    (typeof payload.user_id === 'string' && payload.user_id) ||
    (typeof payload.sub === 'string' && payload.sub) ||
    '';
  if (!uid) {
    throw new Error('Firebase ID token missing uid/sub');
  }

  return {
    uid,
    email: typeof payload.email === 'string' ? payload.email : null,
    payload,
  };
}
