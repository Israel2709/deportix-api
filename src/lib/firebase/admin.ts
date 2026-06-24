import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { ApiError } from '@/lib/api/errors';

/**
 * Firebase Admin SDK bootstrap. SERVER-ONLY (Node.js runtime). Never import this from a
 * client component or the Edge runtime. Credentials come exclusively from environment
 * variables — there is no service-account file in the repo.
 */

interface ServiceAccountCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

let cachedDb: Firestore | null = null;

function readCredentials(): ServiceAccountCredentials | null {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawPrivateKey) return null;

  // Vercel stores the key with real newlines; .env files store the literal "\n".
  // Normalize both to real newlines so cert() accepts the PEM.
  const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

  return { projectId, clientEmail, privateKey };
}

/** True when all three Firebase Admin env vars are present. */
export function isDataSourceConfigured(): boolean {
  return readCredentials() !== null;
}

/**
 * Returns a cached Firestore instance, initializing the Admin app on first use.
 * Throws `DATA_SOURCE_NOT_CONFIGURED` (-> HTTP 503) when credentials are missing, so the
 * API degrades gracefully instead of crashing when env vars are not yet set.
 */
export function getDb(): Firestore {
  if (cachedDb) return cachedDb;

  const credentials = readCredentials();
  if (!credentials) {
    throw new ApiError(
      'DATA_SOURCE_NOT_CONFIGURED',
      'The data source is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.',
    );
  }

  const app: App =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: credentials.projectId,
        clientEmail: credentials.clientEmail,
        privateKey: credentials.privateKey,
      }),
      projectId: credentials.projectId,
    });

  cachedDb = getFirestore(app);
  return cachedDb;
}
