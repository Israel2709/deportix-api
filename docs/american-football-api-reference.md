# American football API reference (BFF)

BFF American football endpoints mirror **api-sports American Football v1** under the prefix `/american-football/*`.

Sport slug in the Deportix catalog: **`american-football`** (not to be confused with the NFL league).

## Envelope

All responses use the full api-sports envelope:

```json
{
  "get": "games",
  "parameters": { "league": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "season": "2022" },
  "errors": [],
  "results": 1,
  "paging": { "current": 1, "total": 1 },
  "response": []
}
```

Contract fixtures live in [`tests/fixtures/api-sports-nfl/`](../tests/fixtures/api-sports-nfl/) (legacy numeric ids for import validation only).

## Canonical IDs

| Surface | `id` in responses | POST/PATCH bodies |
|---------|-------------------|-------------------|
| **BFF `/american-football/*`** | Firestore document UUID (`string`, RFC 4122) | **Must not** include resource `id` fields on create; references (`league.id`, `team.id`, …) must be existing UUIDs |
| **`/v1/*`** | Document UUID; `externalId` when a provider id exists | Out of scope for manual NFL loading |

- GET query params accept a **canonical UUID**; legacy `external_id` lookup is supported as a deprecated fallback on reads.
- Schemas are **strict** — extra fields (including client-supplied ids on create) return `400`.

## Endpoints

| Method | Path | Query / body |
|--------|------|--------------|
| GET/POST/PATCH/DELETE | `/american-football/timezone` | write: `{ timezone }` or `{ timezone, newTimezone }` |
| GET/POST/DELETE | `/american-football/seasons` | write: `{ year }`; scope with `?league=` (UUID) |
| GET/POST/PATCH/DELETE | `/american-football/countries` | `name`; body: `{ name, code, flag }` (Football v3 shape) |
| GET/POST/PATCH/DELETE | `/american-football/leagues` | `id`, `name`, `country_id`, `country`, `type`, `season`, `search` |
| GET/POST | `/american-football/games` | `league+season+timezone`, `id`, `league+season+team` |
| PATCH/DELETE | `/american-football/games/{gameId}` | body = game create shape (no `game.id`; use `?replace=true` for full replace) |
| GET/POST/PATCH/DELETE | `/american-football/teams` | `league`, `season` (required on GET); `league` UUID required on POST |
| GET/POST/PATCH/DELETE | `/american-football/standings` | `league`, `season`, `conference` |

## Create vs response shapes

POST bodies use `*CreateBody` schemas (OpenAPI). Responses add server-assigned UUIDs:

- **League** — POST: `{ league: { name, … }, country, seasons }` → response adds `league.id`
- **Team** — POST: `{ name, logo?, altLogo? }` → response adds `id`
- **Game** — POST: `{ game: { … }, league, teams, scores? }` (no `game.id`) → response adds `game.id`
- **Standing** — POST: `{ league, team, … }` (no top-level `id`) → response adds `id`

## Recommended load order

1. **Leagues** — POST; copy `response[0].league.id` (UUID)
2. **Seasons** — POST `{ year }` with `?league=<uuid>` if needed
3. **Teams** — POST with `?league=<uuid>`
4. **Games** — POST; `league.id` and `teams.*.id` must reference existing UUIDs (teams are **not** auto-created)
5. **Standings** — POST; `team.id` and `league.id` must exist

## Notes

- **`/american-football/countries`** uses the Football v3 `{ name, code, flag }` shape even though api-sports American Football does not expose `/countries`.
- Data is loaded manually from the Deportix portal; empty collections return `response: []`.
- Reset NFL layer: `pnpm data:reset-american-football -- --confirm`
- Optional live fixture capture: `APISPORTS_KEY=... tsx scripts/capture-api-sports-nfl.ts`

OpenAPI / Swagger: all `/american-football/*` operations and schemas are documented under tag **BFF American Football** at [`/docs`](http://localhost:3000/docs) (source: [`openapi/openapi.yaml`](../openapi/openapi.yaml)).

## Example POST (league)

```json
{
  "league": { "name": "NFL", "type": "league", "logo": "https://media.api-sports.io/american-football/leagues/1.png" },
  "country": { "name": "USA", "code": "US", "flag": "https://media.api-sports.io/flags/us.svg" },
  "seasons": [{ "year": 2022, "start": "2022-08-05", "end": "2023-02-12", "current": true }]
}
```

Response includes `"league": { "id": "<uuid>", … }`.

## Example fixtures

- Games: [`games-list.json`](../tests/fixtures/api-sports-nfl/games-list.json) (legacy import shape)
- Standings: [`standings.json`](../tests/fixtures/api-sports-nfl/standings.json)
- Leagues: [`leagues.json`](../tests/fixtures/api-sports-nfl/leagues.json)
