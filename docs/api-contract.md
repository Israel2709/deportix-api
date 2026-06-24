# API Contract — Deportix API `/v1`

The OpenAPI 3.1 document is the source of truth: [`openapi/openapi.yaml`](../openapi/openapi.yaml),
served at `GET /v1/openapi.json` and rendered interactively at `GET /docs`. This page summarizes it.

- **Base path:** `/v1` · **Methods:** `GET` only · **Dates:** ISO-8601, **UTC**.
- **Identifiers:** path params (`leagueId`, `teamId`) accept the API's `id` or the provider
  `externalId` (e.g. `262` for Liga MX).

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/v1/health` | Liveness + `dataSourceConfigured`. Never touches Firestore. |
| GET | `/v1/data-status` | Coverage per sport + curated featured leagues (derived from real counts). |
| GET | `/v1/sports` | Sports catalog. |
| GET | `/v1/leagues` | Leagues. `?sport=`, `?sort=name|-name`, `?page`, `?pageSize`. |
| GET | `/v1/leagues/{leagueId}` | A league. |
| GET | `/v1/leagues/{leagueId}/seasons` | Seasons for the league. |
| GET | `/v1/leagues/{leagueId}/teams` | Teams. NFL also: `?conference=`, `?division=`. |
| GET | `/v1/leagues/{leagueId}/standings` | Standings. `?season=` (defaults to current season). |
| GET | `/v1/leagues/{leagueId}/matches` | Matches. `?season`,`?from`,`?to`,`?date`,`?teamId`,`?status`,`?sort=date|-date`. Defaults to current season. |
| GET | `/v1/teams/{teamId}` | A team (searched across sport collections). |
| GET | `/v1/teams/{teamId}/matches` | A team's matches. Same filters as league matches. |
| GET | `/v1/openapi.json` | The OpenAPI document. |
| GET | `/docs` | Scalar reference UI. |

## Response envelopes

**Collection**
```json
{ "data": [], "meta": { "apiVersion": "v1", "updatedAt": "2026-06-23T00:00:00.000Z",
  "pagination": { "page": 1, "pageSize": 20, "total": 0 } } }
```
**Resource**
```json
{ "data": {}, "meta": { "apiVersion": "v1", "updatedAt": "2026-06-23T00:00:00.000Z" } }
```
**Error**
```json
{ "error": { "code": "INVALID_QUERY_PARAMETER", "message": "…", "requestId": "req_…" } }
```

## Error codes

| Code | HTTP | When |
| --- | --- | --- |
| `INVALID_QUERY_PARAMETER` | 400 | A query param is malformed or out of range. |
| `INVALID_PATH_PARAMETER` | 400 | A path param is missing/invalid. |
| `RESOURCE_NOT_FOUND` | 404 | League/team id does not exist. |
| `DATA_NOT_AVAILABLE` | 404 | Resource type not served for this entity (e.g. generic endpoints for an F1 league). |
| `DATA_SOURCE_NOT_CONFIGURED` | 503 | Firebase Admin env vars are not set. |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected error (details never leaked; logged with the requestId). |

Every response includes `X-Request-Id`; error bodies echo it as `requestId`.

## Query parameters

| Param | Type | Default | Max | Notes |
| --- | --- | --- | --- | --- |
| `page` | integer ≥ 1 | 1 | — | |
| `pageSize` | integer ≥ 1 | 20 | 100 | |
| `sport` | string | — | — | Sport slug filter on `/v1/leagues`. Unknown → empty page. |
| `season` | integer (year) | current season | — | e.g. `2026`. Unknown season → empty collection. |
| `from` / `to` | date (`YYYY-MM-DD` or ISO) | — | — | Inclusive match-date bounds, UTC. |
| `date` | date | — | — | Exact day. **Mutually exclusive** with `from`/`to` (else `400`). |
| `teamId` | string | — | — | Filter matches involving a team. |
| `status` | string | — | — | Raw status code (e.g. `NS`, `FT`, `1H`). |
| `conference` / `division` | string | — | — | NFL team filters. |
| `sort` | enum | `name` / `-date` | — | Whitelisted per endpoint; `-` prefix = descending. |

**Empty results** return `200` with an empty `data` array — not an error. Coverage is partial; use
`/v1/data-status` to discover what exists.

## Examples

**cURL**
```bash
curl https://deportix-api.vercel.app/v1/leagues/262
curl "https://deportix-api.vercel.app/v1/leagues/128/standings?season=2026"
```

**fetch (browser)**
```js
const res = await fetch('https://deportix-api.vercel.app/v1/leagues/128/matches?pageSize=10');
const { data, meta } = await res.json();
```

**Node**
```js
const res = await fetch(`${process.env.DEPORTIX_API}/v1/data-status`);
if (!res.ok) throw new Error((await res.json()).error.code);
const { data } = await res.json();
```

## Versioning policy

The contract is versioned under `/v1`. Additive changes (new endpoints/fields/optional params)
ship within `/v1`. Breaking changes would introduce `/v2`; `/v1` keeps working. Future auth, rate
limiting and plans will be layered in via `with-auth` without changing `/v1` response shapes.

## Coverage (at time of writing)

Derived live by `/v1/data-status`. Snapshot: **soccer** is data-rich across many leagues
(e.g. Liga Profesional Argentina, Ligue 1); **Liga MX** has season metadata only (no teams/matches/
standings loaded yet); **NFL** and **F1** exist as sports but NFL has no leagues/collections loaded.
NFL coverage is partial and evolving — the portal and `data-status` reflect new data automatically.
