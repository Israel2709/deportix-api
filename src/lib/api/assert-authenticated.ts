import type { NextRequest } from 'next/server';
import { ApiError, unauthorized } from '@/lib/api/errors';
import { getAdminAuth } from '@/lib/firebase/admin';

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
}

function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization');
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() || null;
}

/**
 * Verifies `Authorization: Bearer <Firebase ID token>` and returns the user.
 * Throws `UNAUTHORIZED` (401) when missing/invalid, or `DATA_SOURCE_NOT_CONFIGURED` (503)
 * when Firebase Admin credentials are not set.
 *
 * Kept in a separate module from `handler.ts` / `with-auth.ts` to avoid circular imports
 * that crash route evaluation at runtime (HTTP 500 HTML from Next).
 */
export async function assertAuthenticated(
  request: NextRequest,
): Promise<AuthenticatedUser> {
  const token = extractBearerToken(request);
  if (!token) {
    throw unauthorized();
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const detail =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code?: unknown }).code)
        : err instanceof Error
          ? err.message
          : 'unknown';
    console.error(`[auth] verifyIdToken failed: ${detail}`);
    throw unauthorized('Invalid or expired authentication token.');
  }
}
