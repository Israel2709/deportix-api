# American football API reference (BFF)

BFF American football endpoints mirror **api-sports American Football v1** under the prefix `/american-football/*`.

Sport slug in the Deportix catalog: **`american-football`** (not to be confused with the NFL league).

## Envelope

All responses use the full api-sports envelope:

```json
{
  "get": "games",
  "parameters": { "league": "1", "season": "2022" },
  "errors": [],
  "results": 1,
  "paging": { "current": 1, "total": 1 },
  "response": []
}
```

Contract fixtures live in [`tests/fixtures/api-sports-nfl/`](../tests/fixtures/api-sports-nfl/).

## Endpoints

| Method | Path | Query / body |
|--------|------|--------------|
| GET/POST/PATCH/DELETE | `/american-football/timezone` | write: `{ timezone }` or `{ timezone, newTimezone }` |
| GET/POST/DELETE | `/american-football/seasons` | write: `{ year }`; scope with `?league=` |
| GET/POST/PATCH/DELETE | `/american-football/countries` | `name`; body: `{ name, code, flag }` (Football v3 shape) |
| GET/POST/PATCH/DELETE | `/american-football/leagues` | `id, name, country_id, country, type, season, search` |
| GET/POST | `/american-football/games` | `league+season+timezone`, `id`, `league+season+team` |
| PATCH/DELETE | `/american-football/games/{gameId}` | body = api-sports game object |
| GET/POST/PATCH/DELETE | `/american-football/teams` | `league`, `season` (required on GET) |
| GET/POST/PATCH/DELETE | `/american-football/standings` | `league`, `season`, `conference` |

## Notes

- **`/american-football/countries`** uses the Football v3 `{ name, code, flag }` shape even though api-sports American Football does not expose `/countries`.
- **CRUD bodies** must match the objects returned in `response[]` (same shape as api-sports).
- Data is loaded manually from the Deportix portal; empty collections return `response: []`.
- Optional live fixture capture: `APISPORTS_KEY=... tsx scripts/capture-api-sports-nfl.ts`

OpenAPI / Swagger: all `/american-football/*` operations and schemas are documented under tag **BFF American Football** at [`/docs`](http://localhost:3000/docs) (source: [`openapi/openapi.yaml`](../openapi/openapi.yaml)).

## Example fixtures

- Games: [`games-list.json`](../tests/fixtures/api-sports-nfl/games-list.json)
- Standings: [`standings.json`](../tests/fixtures/api-sports-nfl/standings.json)
- Leagues: [`leagues.json`](../tests/fixtures/api-sports-nfl/leagues.json)
