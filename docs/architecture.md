# Architecture — Deportix API

## Overview

**Deportix API** is a public, read-only REST API over an existing Cloud Firestore, built with
Next.js (App Router) and deployable to Vercel. A separate portal (`deportix-portal`) consumes the
API; it never touches Firebase.

```
Firestore (project: deportix-api-dac8e)
        │   Firebase Admin SDK  (server-only, Node.js runtime)
        ▼
deportix-api  ──>  Public REST API  /v1  (GET-only, CORS open)
        │   HTTPS + JSON
        ▼
deportix-portal  ──>  consumes ONLY NEXT_PUBLIC_API_BASE_URL
```

## Layers

| Layer | Location | Responsibility |
| --- | --- | --- |
| Route handlers | `app/v1/**/route.ts` | Parse/validate query + path params, call repositories, return the uniform envelope. Thin. |
| Cross-cutting | `src/lib/api/*` | `handler.ts` (envelope, CORS, ETag/304, error mapping, request id), `errors.ts`, `responses.ts`, `cors.ts`, `cache.ts`, `query-validation.ts`, `with-auth.ts`, `route-helpers.ts`, `serializers.ts`. |
| Sport registry | `src/lib/firebase/sport-registry.ts` | Maps a sport slug → its Firestore collections + field names. The adapter that lets generic routes work over sport-specific data. |
| Repositories | `src/lib/firebase/repositories/*` | All Firestore reads. Equality-only queries + in-memory shaping. Return public DTOs. |
| Admin bootstrap | `src/lib/firebase/admin.ts` | Lazy, cached Firebase Admin init from 3 env vars. Server-only. |
| Contracts | `src/lib/contracts/dto.ts` | Public DTO shapes. |
| OpenAPI | `openapi/openapi.yaml` → `src/generated/openapi.ts` | Source of truth, built into a bundled module served at `/v1/openapi.json` and rendered at `/docs` (Swagger UI). |

## The adapter (key decision)

The public contract is **generic** (`/v1/leagues/{id}/teams|matches|standings`,
`/v1/teams/{id}`), but Firestore is **sport-specific and flat** (`soccer_*`, `nfl_*`, `f1_*`,
no subcollections). A league document references a sport; the **sport registry** resolves the
slug and selects the right collections + field names. Nested route shapes are emulated with flat
queries filtered by `league_id` / `season_id` / `team_id`.

- Adding a sport = one entry in `sport-registry.ts`.
- F1 is intentionally excluded from the generic team/match/standings endpoints (it has a
  fundamentally different model); it still appears in `/v1/sports` and `/v1/data-status`.

## Query strategy & why it's resilient

Repositories use **equality-only Firestore queries** (`where('field','==',value)`) plus
`count()` aggregations, then filter/sort/paginate **in memory** on capped result sets
(`DEFAULT_FETCH_CAP`). Equality queries only need Firestore's automatic single-field indexes, so
the API never depends on composite indexes — which matters because the platform's Firestore is
**read-only to us** (we cannot create indexes, change rules, or write data). See
[caching.md](./caching.md) for the planned snapshot/aggregate optimization.

`/v1/leagues/{id}/matches` defaults to the league's **current season** when no `season`/date
filter is given, so a request never pulls a league's entire (potentially thousands) match history.

## Request lifecycle

1. `getRoute(withAuth(handler))` wraps every GET. It generates a `requestId`, resolves async
   `params`, parses `searchParams`, and calls the handler.
2. The handler validates input (Zod / helpers → `400`), calls repositories, and returns a
   `collection` / `resource` / `raw` result.
3. The wrapper serializes the uniform envelope, sets CORS + `Cache-Control` + a weak `ETag`,
   answers `304` on a matching `If-None-Match`, and maps any thrown `ApiError`/`ZodError`/unknown
   error to the uniform error envelope.

## Security posture (MVP)

- Read-only: only `GET` (+ `OPTIONS` preflight). No write/admin/sync endpoints exist or are exposed.
- No raw Firestore access, internal collections (`sync_logs`, `ingestion_*`), `_sources`, rules,
  or credentials are ever surfaced.
- Credentials live only in env vars (never in the repo). `admin.ts` is server-only (Node runtime).
- CORS is open and explicitly **not** a security mechanism — see [api-contract.md](./api-contract.md).
- `with-auth.ts` is the seam for future API keys / rate limiting / plans (see
  [scaling-future.md](./scaling-future.md)).
