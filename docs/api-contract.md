# API Contract — Deportix API

The OpenAPI 3.1 document is the **single source of truth**: [`openapi/openapi.yaml`](../openapi/openapi.yaml),
served at `GET /v1/openapi.json` and rendered with **Swagger UI** at `GET /docs`.

The spec documents **two surfaces**:

| Surface | Base paths | Response envelope | Consumers |
| --- | --- | --- | --- |
| **Deportix API** | `/v1/*` | `{ data, meta }` | Portal, internal tools |
| **BFF (API-Sports)** | `/countries`, `/leagues`, `/fixtures`, … | `{ response, results, errors }` | Flutter app (soccer) |

---

## Deportix API `/v1`

- **Base path:** `/v1` · **Methods:** `GET` (read), `POST` (match create), `PATCH` (match edit), `DELETE` (match remove) · **Dates:** ISO-8601, **UTC**.
- **Identifiers:** path params (`leagueId`, `teamId`, `matchId`) accept the API's `id` or the provider
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
| POST | `/v1/leagues/{leagueId}/matches` | Create a match. Defaults to **current season**; use `?season=` (year) or body `seasonId` for any season. Returns `201`. |
| PATCH | `/v1/leagues/{leagueId}/matches/{matchId}` | Partially update a match. JSON body with only the fields to change. Returns the updated match. |
| DELETE | `/v1/leagues/{leagueId}/matches/{matchId}` | Permanently delete a match. Returns `204 No Content`. |
| GET | `/v1/teams/{teamId}` | A team (searched across sport collections). |
| GET | `/v1/teams/{teamId}/matches` | A team's matches. Same filters as league matches. |
| GET | `/v1/openapi.json` | The OpenAPI document. |
| GET | `/docs` | Swagger UI (interactive reference). |

---

## BFF — API-Sports compatibility (soccer)

Read-only endpoints that mirror API-Sports Football v3. Change only the **base URL** in Flutter;
paths and query params stay the same.

| Method | Path | Required params | Notes |
| --- | --- | --- | --- |
| GET | `/countries` | — | `?name`, `?code` optional filters. |
| GET | `/leagues` | — | `?id`, `?country`, `?season`, `?current` filters. |
| GET | `/leagues/seasons` | — | Global list of season years. |
| GET | `/fixtures` | `league` and/or `team`, or `id`/`ids` | Full filter set in OpenAPI. |
| GET | `/fixtures/rounds` | `league`, `season` | Returns round name strings. |
| GET | `/standings` | `league`, `season` | Nested `league.standings` table. |

**Envelope**
```json
{ "response": [], "results": 0, "errors": {} }
```

**Errors** use the same envelope with `errors: { "parameters": "…" }` (HTTP 400) instead of the Deportix `{ error }` shape.

---

## Deportix response envelopes

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
| `INVALID_REQUEST_BODY` | 400 | PATCH body is missing, malformed, or invalid. |
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

## Match create (POST)

`POST /v1/leagues/{leagueId}/matches` creates a match in a league season.

**Season targeting** (pick one approach):

| Mechanism | Example | Notes |
| --- | --- | --- |
| *(omit both)* | `POST .../matches` | Uses the **current season** (`current: true`, or most recent). |
| Query `?season=` | `POST .../matches?season=2025` | Season **year** (same as GET list). |
| Body `seasonId` | `{ "seasonId": "se_ar25", ... }` | Season document id or provider `externalId`. |
| Both | `?season=2025` + `"seasonId": "se_ar25"` | Must refer to the **same** season. |

Required body fields:

| Field | Required | Notes |
| --- | --- | --- |
| `date` | yes | ISO-8601 kick-off / game date (UTC). |
| `home` | yes | `{ teamId }` required; `name`, `logo`, `score` optional. |
| `away` | yes | Same shape as `home`. Must differ from `home.teamId`. |
| `status` | no | Defaults to `NS`. |
| `round`, `venue`, `externalId` | no | Optional metadata. |

Team ids must belong to the league. Names/logos are copied from the roster when omitted.

**Example — current season (default):**
```bash
curl -X POST "https://deportix-api.vercel.app/v1/leagues/128/matches" \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-11-08T21:00:00.000Z","home":{"teamId":"tm_boca"},"away":{"teamId":"tm_river"}}'
```

**Example — specific season by year:**
```bash
curl -X POST "https://deportix-api.vercel.app/v1/leagues/128/matches?season=2025" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-03-01T21:00:00.000Z","home":{"teamId":"tm_boca"},"away":{"teamId":"tm_river"}}'
```

Response: `201 Created` with the standard **resource** envelope.

## Match update (PATCH)

`PATCH /v1/leagues/{leagueId}/matches/{matchId}` accepts a JSON object with **only the fields to
change**. At least one property is required. Names mirror the public `Match` resource:

| Field | Type | Notes |
| --- | --- | --- |
| `externalId` | string \| null | Provider id. |
| `seasonId` | string \| null | Season document id. |
| `date` | ISO-8601 string \| null | Kick-off / game date (UTC). |
| `status` | string \| null | Raw status code (e.g. `NS`, `FT`). |
| `round` | string \| null | Round label. |
| `venue` | string \| null | Venue name. |
| `home` / `away` | object | Partial side update: `teamId`, `name`, `logo`, `score`. |

**Example — set final score (soccer):**
```bash
curl -X PATCH "https://deportix-api.vercel.app/v1/leagues/128/matches/m1" \
  -H "Content-Type: application/json" \
  -d '{"status":"FT","home":{"score":2},"away":{"score":1}}'
```

Response: `200` with the standard **resource** envelope containing the updated `Match`.

## Match delete (DELETE)

`DELETE /v1/leagues/{leagueId}/matches/{matchId}` permanently removes the match document from
Firestore. The match must belong to the league in the path. Returns **`204 No Content`** on success
(no response body).

**Example:**
```bash
curl -X DELETE "https://deportix-api.vercel.app/v1/leagues/128/matches/m1"
```

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
