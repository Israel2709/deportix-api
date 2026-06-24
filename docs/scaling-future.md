# Future: API Keys, Rate Limiting, Plans & Monetization

None of this is implemented in the MVP. The architecture is prepared so these can be added
**without breaking `/v1`**. This document is the playbook.

## The seam: `with-auth.ts`

Every route is wrapped as `getRoute(withAuth(handler))`. Today `withAuth` is a pass-through. It is
the single place to introduce access control:

```ts
// future shape (illustrative)
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (ctx) => {
    const key = ctx.request.headers.get('x-api-key') ?? bearer(ctx.request);
    const consumer = await resolveApiKey(key);          // throws ApiError('UNAUTHORIZED') / 401
    await enforceRateLimit(consumer, ctx);              // throws ApiError('RATE_LIMITED') / 429
    enforcePlan(consumer, ctx);                         // plan/qurota gating
    return handler({ ...ctx, consumer });
  };
}
```

Because routes never read auth directly, none of them change. Add the new error codes
(`UNAUTHORIZED`, `RATE_LIMITED`, `QUOTA_EXCEEDED`) to `errors.ts` with their statuses.

## API keys (phase 1)

- Store keys + metadata in a **separate** Firestore collection or KV (NOT the sports data, which
  stays read-only). Hash keys at rest.
- Accept `x-api-key` or `Authorization: Bearer`. Resolve → consumer record (plan, limits, status).
- Keep `/v1` public initially by allowing anonymous access at a low tier; tighten later via config.
- Admin endpoints to mint/revoke keys live **outside** the public surface (separate route group,
  protected, never under `/v1`).

## Rate limiting (phase 2)

- Per-key fixed/sliding window in Vercel KV / Upstash Redis. Edge middleware or `withAuth`.
- Return `429` + `Retry-After` + `X-RateLimit-*` headers.
- CORS is not a limiter — limits are enforced server-side regardless of origin.

## Plans & monetization (phase 3)

- Plan tiers map to quotas (req/day), rate, and feature flags (e.g. historical data, statistics).
- Billing (e.g. Stripe) integrates in the key-management service, **not** in `/v1` read paths.
- `enforcePlan` gates features by reading the consumer's plan; read endpoints stay shape-compatible.

## CORS tightening

Already centralized in `cors.ts`. Set `CORS_ALLOWED_ORIGINS` to a comma-separated allow-list to
restrict browser reads to known portals/domains. This complements (does not replace) API-key auth.

## Data freshness at scale

Introduce a precomputed `data-status` / aggregate **snapshot** (see [caching.md](./caching.md)) so
coverage and hot lists are single-document reads. The snapshot is produced by the ingestion side
(out of scope here); the API only reads it.

## Guardrails

- Keep the public surface **read-only**. Any write/admin/sync capability stays in a separate,
  protected service — never under `/v1`.
- Add capabilities **additively** within `/v1`; reserve `/v2` for breaking changes.
