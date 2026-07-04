# Decisions & Risks

## Key decisions

1. **Both projects are Next.js (App Router) + TypeScript strict**, deployed as two independent Vercel
   projects (not a monorepo). The portal uses the `NEXT_PUBLIC_` env convention, confirming Next.

2. **Generic public contract over sport-specific flat data** via a sport registry
   (`sport-registry.ts`). Keeps `/v1` stable while the underlying collections are `soccer_*` /
   `nfl_*` / `f1_*`. See [architecture.md](./architecture.md).

3. **Equality-only Firestore queries + in-memory shaping.** The platform's Firestore is read-only to
   us; we cannot create composite indexes. Equality queries use automatic single-field indexes, so
   the API never fails on a missing index. Trade-off: bounded in-memory work; mitigated by current-
   season defaults and fetch caps. See [caching.md](./caching.md).

4. **Public ids = document id, with `external_id` accepted as a fallback.** Lets consumers use the
   clean provider id (e.g. `262` for Liga MX) without us leaking only-internal UUIDs as the sole key.

5. **`data-status` derives coverage from real `count()`s** for every sport plus a *curated featured
   set* of leagues (`featured-leagues.ts`). Deriving per-league coverage for all 1,200+ leagues on
   every request is impractical, so the league *selection* is configured while coverage stays derived
   — the controlled-config approach the brief allows. Documented and maintainable by `external_id`.

6. **F1 excluded from generic team/match/standings endpoints** (different model); visible in
   `/v1/sports` and `/v1/data-status`.

7. **OpenAPI YAML is the source of truth**, compiled to a bundled TS module (`src/generated`) for
   reliable serving on Vercel without runtime filesystem access.

8. **Auth seam reserved** (`with-auth.ts`) so API keys / rate limiting / plans drop in without
   touching `/v1`. See [scaling-future.md](./scaling-future.md).

## What the audit revealed (project `deportix-api-dac8e`)

- 3 sports: `soccer`, `american-football`, `f1`. **American football and F1 have no leagues**, and there are **no `nfl_*`
  collections** — american football is registered as a sport only. F1 has its own `f1_*` collections (out of scope
  for generic endpoints).
- **Soccer is data-rich**: ~1,230 leagues, ~15k teams, ~70k matches, ~4k standings; ~1,227 leagues
  have a current season.
- **Liga MX (ext 262)** has season metadata (2016–2025, 2025 current) but **0 teams/matches/
  standings** and **no 2026 season** — its game data is not loaded in this project.
- Data is **partial and uneven** by design of the manual loading process.

Full figures: [firebase-data-inventory.md](./firebase-data-inventory.md),
[data-availability.md](./data-availability.md).

## Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| **Liga MX / Apertura 2026 sparse** (no teams/matches; no 2026 season yet). | API returns valid empty collections; portal shows honest empty states. No data invented. Appears automatically when loaded. |
| **NFL has no data** in this project. | NFL endpoints return empty; `data-status` shows NFL coverage all-false; portal shows "No data loaded yet". Re-runs the audit once data lands. |
| **Two candidate Firestore projects** (`deportix-api-dac8e` vs `raziel-app-hub`). | Defaulted to `deportix-api-dac8e` (matches the web config + `deportix-front`, and the audit found rich data). Switch via env vars if needed. |
| **Large match histories** (tens of thousands of docs). | Equality queries + fetch cap + current-season default bound every read. |
| **Composite indexes unavailable** for sorted/paginated server-side queries. | In-memory sort/paginate on capped sets; documented snapshot/index path for the future. |
| **`FIREBASE_PRIVATE_KEY` newline handling** across local/Vercel. | Normalized at runtime; documented in [firebase-setup.md](./firebase-setup.md). |
| **`data-status` per-request fan-out** could grow. | Bounded today (few sports + curated leagues); snapshot document planned. |
| **Statistics not modeled** in Firestore. | `coverage.statistics` is always `false`; documented. |

## Assumptions

- The platform's Firestore schema (snake_case, flat, UUID id + `external_id`, denormalized soccer
  matches) is stable; the sport registry centralizes any future field-name changes.
- Manual data loading happens out-of-band; this project never writes. Re-run `pnpm data:inspect`
  after loads to refresh the inventory.
