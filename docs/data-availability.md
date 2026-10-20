# Data Availability
_Generated 2026-10-20T07:44:14.527Z from project `deportix-api-dac8e`. All figures are real Firestore counts._
## Headline findings
- **Sports present:** `american-football`, `soccer`, `nfl`, `f1` (4).
- **Leagues:** 0. **Seasons:** 0.
- **F1** uses dedicated collections (`f1_*`) — competitions 0, circuits 0, drivers 0, teams 0, races 0, rankings 0 / team 0 / race 0. Served by BFF `/formula-1/*`, not generic `/v1` league routes.
- Coverage is **partial and uneven** by design of the manual loading process.
## Sport-level coverage
| Sport | Name | Leagues | Team docs | Match docs | Standing docs |
| --- | --- | ---: | ---: | ---: | ---: |
| `american-football` | NFL | 1 | 0 | 0 | 0 |
| `soccer` | Soccer | 1230 | 0 | 0 | 0 |
| `nfl` | NFL | 0 | 0 | 0 | 0 |
| `f1` | Formula 1 | 0 | 0 | 0 | 0 |
## Featured leagues (configured in `src/lib/firebase/featured-leagues.ts`)
| External id | League | Sport | Teams | Matches | Standings | Seasons |
| --- | --- | --- | ---: | ---: | ---: | --- |
| 262 | Liga MX | soccer | 18 | 153 | 0 | 2026 |
| 128 | Liga Profesional Argentina | soccer | 24 | 495 | 30 | 2026 |
| 61 | Ligue 1 | soccer | 0 | 0 | 0 | — |
| 71 | Serie A | soccer | 1 | 0 | 0 | 2026 |
| 253 | Major League Soccer | soccer | 0 | 0 | 0 | 2026 |
## Endpoints publishable now (data-backed)
- `GET /v1/health`, `GET /v1/data-status`, `GET /v1/openapi.json`, `GET /docs` — always.
- `GET /v1/sports` — 3 sports.
- `GET /v1/leagues`, `GET /v1/leagues/{id}` — full catalog.
- `GET /v1/leagues/{id}/seasons` — seasons exist for most leagues (incl. Liga MX).
- `GET /v1/leagues/{id}/teams|matches|standings` — populated for data-rich soccer leagues; empty (but valid) for Liga MX until loaded.
- `GET /v1/teams/{id}`, `GET /v1/teams/{id}/matches` — for teams that exist.
- `GET /formula-1/*` — seasons, competitions, circuits, drivers, teams, races, rankings (when F1 collections are loaded).
## Pending / not available
- **statistics**: not modeled in Firestore — coverage flag is always `false`.
- **F1**: intentionally excluded from the generic `/v1` league/team endpoints (different model); use `/formula-1/*`.
## Suggested future normalizations / snapshots
- A precomputed `data-status` snapshot document to avoid per-request `count()` fan-out.
- Composite indexes (e.g. `league_id` + match date) if server-side sorted/paginated match queries are introduced.
- Optional denormalized team names on NFL games (soccer matches already carry them).