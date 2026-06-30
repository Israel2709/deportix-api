# Data Availability
_Generated 2026-06-30T01:58:38.504Z from project `deportix-api-dac8e`. All figures are real Firestore counts._
## Headline findings
- **Sports present:** `nfl`, `soccer`, `f1` (3).
- **Leagues:** 1230. **Seasons:** 0.
- **NFL & F1** exist as `sports` entries but have **no leagues and no team/game collections** loaded — their endpoints return empty collections (honest "no data yet").
- **Liga MX (ext 262)** has season metadata only (no teams/matches/standings loaded yet).
- Other soccer leagues (e.g. Liga Profesional Argentina ext 128, Ligue 1 ext 61) are data-rich and exercise the full endpoint set.
- Coverage is **partial and uneven** by design of the manual loading process.
## Sport-level coverage
| Sport | Name | Leagues | Team docs | Match docs | Standing docs |
| --- | --- | ---: | ---: | ---: | ---: |
| `nfl` | NFL | 0 | 0 | 0 | 0 |
| `soccer` | Soccer | 1230 | 15386 | 0 | 0 |
| `f1` | Formula 1 | 0 | 0 | 0 | 0 |
## Featured leagues (configured in `src/lib/firebase/featured-leagues.ts`)
| External id | League | Sport | Teams | Matches | Standings | Seasons |
| --- | --- | --- | ---: | ---: | ---: | --- |
| 262 | Liga MX | soccer | 18 | 153 | 0 | 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016 |
| 128 | Liga Profesional Argentina | soccer | 24 | 4874 | 332 | 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015 |
| 61 | Ligue 1 | soccer | 0 | 5870 | 314 | 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010 |
| 71 | Serie A | soccer | 1 | 3717 | 180 | 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010 |
| 253 | Major League Soccer | soccer | 0 | 0 | 0 | 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012 |
## Endpoints publishable now (data-backed)
- `GET /v1/health`, `GET /v1/data-status`, `GET /v1/openapi.json`, `GET /docs` — always.
- `GET /v1/sports` — 3 sports.
- `GET /v1/leagues`, `GET /v1/leagues/{id}` — full catalog.
- `GET /v1/leagues/{id}/seasons` — seasons exist for most leagues (incl. Liga MX).
- `GET /v1/leagues/{id}/teams|matches|standings` — populated for data-rich soccer leagues; empty (but valid) for Liga MX until loaded.
- `GET /v1/teams/{id}`, `GET /v1/teams/{id}/matches` — for teams that exist.
## Pending / not available
- **NFL**: no leagues or `nfl_*` collections in this project. NFL endpoints return empty until data is loaded. (Would require `nfl_teams`/`nfl_games`/`nfl_standings` + an NFL league document.)
- **Liga MX teams/matches/standings**: pending until those docs are loaded for league ext 262.
- **statistics**: not modeled in Firestore — coverage flag is always `false`.
- **F1**: intentionally excluded from the generic league/team endpoints (different model).
## Suggested future normalizations / snapshots
- A precomputed `data-status` snapshot document to avoid per-request `count()` fan-out.
- Composite indexes (e.g. `league_id` + match date) if server-side sorted/paginated match queries are introduced.
- Optional denormalized team names on NFL games (soccer matches already carry them).