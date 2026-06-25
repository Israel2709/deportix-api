import type { RouteContext } from './handler';

/**
 * Placeholder for the future authentication / rate-limiting / plan-gating layer.
 *
 * In the MVP the API is fully public, so this is a pass-through. It exists so that when
 * API keys, rate limits, quotas, or paid plans are introduced, they can be wired in HERE
 * without changing any route or breaking the `/v1` contract:
 *
 *   export const GET = getRoute(withAuth(async (ctx) => { ... }));
 *
 * A real implementation would read an `Authorization` / `x-api-key` header from
 * `ctx.request`, validate it, attach the resolved consumer/plan to the context, enforce
 * rate limits, and throw an `ApiError` (e.g. a future `UNAUTHORIZED` / `RATE_LIMITED`) on
 * failure — all transparent to the route body.
 */
export function withAuth<C extends RouteContext>(handler: (ctx: C) => Promise<import('./handler').RouteOutput>) {
  return handler;
}
