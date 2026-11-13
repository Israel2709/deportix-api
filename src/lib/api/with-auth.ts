import type { NextRequest } from 'next/server';
import { assertAuthenticated } from '@/lib/api/assert-authenticated';

export type { AuthenticatedUser } from '@/lib/api/assert-authenticated';
export { assertAuthenticated } from '@/lib/api/assert-authenticated';

const PUBLIC_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

interface AuthableContext {
  request: NextRequest;
}

/**
 * Requires a valid Firebase ID token for mutating methods (POST/PUT/PATCH/DELETE).
 * GET/HEAD/OPTIONS stay public so App QD / other clients can keep reading data.
 *
 * Usage:
 *   export const GET = getRoute(withAuth(async (ctx) => { ... }));
 *   export const POST = postRoute(withAuth(async (ctx) => { ... }));
 *
 * Write wrappers (`postRoute` / BFF write factories) also call `assertAuthenticated`
 * so BFF mutations are protected even when a route forgets `withAuth`.
 */
export function withAuth<C extends AuthableContext, R>(handler: (ctx: C) => Promise<R>) {
  return async (ctx: C): Promise<R> => {
    const method = ctx.request.method.toUpperCase();
    if (!PUBLIC_METHODS.has(method)) {
      await assertAuthenticated(ctx.request);
    }
    return handler(ctx);
  };
}
