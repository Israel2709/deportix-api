# Caching & Performance

## Cache-Control policies

Defined in `src/lib/api/cache.ts` and applied by the route wrapper:

| Policy | Value | Used by |
| --- | --- | --- |
| `none` | `no-store` | `/v1/health`, error responses |
| `dynamic` | `public, max-age=0, s-maxage=30, stale-while-revalidate=60` | matches |
| `standard` | `public, max-age=0, s-maxage=300, stale-while-revalidate=600` | leagues, teams, standings, seasons, data-status |
| `reference` | `public, max-age=0, s-maxage=3600, stale-while-revalidate=86400` | sports, OpenAPI |

`max-age=0` keeps **browsers** from caching, so a manual Firestore edit is visible on refresh,
while `s-maxage` lets Vercel's **shared CDN** absorb repeated reads and
`stale-while-revalidate` avoids a latency cliff at expiry. TTLs are deliberately short so manual
data loads surface quickly — caching never hides recent updates beyond `s-maxage` seconds.

## ETags / conditional requests

Every successful response carries a weak `ETag` (SHA-1 of the JSON body). A request with a matching
`If-None-Match` gets `304 Not Modified` with no body. Note: responses whose `meta.updatedAt` falls
back to "now" (e.g. `data-status`) produce a fresh ETag each call, so `304` only benefits responses
whose body is byte-stable (most collections, where `updatedAt` derives from the data).

## Read efficiency

- **Equality-only queries** (`where('field','==',value)`) use automatic single-field indexes —
  no composite indexes required (we cannot create them; Firestore is read-only to us).
- **`count()` aggregations** power `data-status` coverage cheaply (no document reads).
- **Current-season default** on match endpoints bounds reads to one season instead of a league's
  full history.
- **Conservative pagination**: `pageSize` default 20, max 100; fetches are capped
  (`DEFAULT_FETCH_CAP`) so a single request can never pull an unbounded collection into memory.

## Known limitations & future work (not implemented in the MVP)

- **Per-request fan-out**: `data-status` and some list endpoints issue several queries. A
  precomputed **snapshot document** (e.g. `public_data_status`) refreshed by the (out-of-scope)
  ingestion side would remove the fan-out. The API would read one doc.
- **Server-side sorted pagination** over large match sets would need **composite indexes**
  (e.g. `league_id` + `fixture_date`) and cursor-based paging. Documented, not built — the in-memory
  approach is correct and bounded for the MVP.
- **Aggregates** (top scorers, form tables, statistics) are not modeled in Firestore yet.
