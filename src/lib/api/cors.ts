/**
 * Centralized CORS handling for the public read-only API.
 *
 * SECURITY NOTE: For a *public* API, CORS is NOT a security mechanism. It only controls
 * which browser origins may read responses from JS; anyone can still call the API directly
 * (curl, server-to-server). Real access control will arrive later via API keys (see
 * `with-auth.ts`). This helper is centralized so the allow-list can be tightened by setting
 * `CORS_ALLOWED_ORIGINS` without touching any route.
 */

function configuredOrigins(): string[] {
  const raw = process.env.CORS_ALLOWED_ORIGINS?.trim();
  if (!raw || raw === '*') return ['*'];
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/** Resolve the `Access-Control-Allow-Origin` value for a given request origin. */
export function resolveAllowOrigin(requestOrigin: string | null): string {
  const allowed = configuredOrigins();
  if (allowed.includes('*')) return '*';
  if (requestOrigin && allowed.includes(requestOrigin)) return requestOrigin;
  // Not allowed: echo the first configured origin so the browser blocks the read.
  return allowed[0] ?? 'null';
}

/** Apply CORS headers (and `Vary` when origin-specific) to a Headers instance. */
export function applyCorsHeaders(headers: Headers, requestOrigin: string | null): void {
  const allowOrigin = resolveAllowOrigin(requestOrigin);
  headers.set('Access-Control-Allow-Origin', allowOrigin);
  if (allowOrigin !== '*') headers.append('Vary', 'Origin');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, If-None-Match, x-rapidapi-key, x-apisports-key, x-rapidapi-host');
  headers.set('Access-Control-Max-Age', '86400');
}
