import type { NextRequest } from 'next/server';
import { ApiError, unauthorized } from '@/lib/api/errors';
import type { RouteContext } from './handler';
import { getAdminAuth } from '@/lib/firebase/admin';

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
}

const PUBLIC_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

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
    throw unauthorized('Invalid or expired authentication token.');
  }
}

/**
 * Requires a valid Firebase ID token for mutating methods (POST/PUT/PATCH/DELETE).
 * GET/HEAD/OPTIONS stay public so App QD can keep reading published data.
 *
 * Usage:
 *   export const GET = getRoute(withAuth(async (ctx) => { ... }));
 *   export const POST = postRoute(withAuth(async (ctx) => { ... }));
 *
 * Write wrappers (`postRoute` / BFF write factories) also call `assertAuthenticated`
 * so BFF mutations are protected even when a route forgets `withAuth`.
 */
export function withAuth<C extends RouteContext, R>(handler: (ctx: C) => Promise<R>) {
  return async (ctx: C): Promise<R> => {
    const method = ctx.request.method.toUpperCase();
    if (!PUBLIC_METHODS.has(method)) {
      await assertAuthenticated(ctx.request);
    }
    return handler(ctx);
  };
}
