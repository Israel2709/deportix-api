# Formula 1 API reference (BFF)

BFF Formula 1 endpoints follow the **api-sports Formula-1** shape under `/formula-1/*`, with the
same full envelope used by the American Football BFF.

Sport slug in the Deportix catalog: **`f1`**.

Aligned with the DeportiX functional design for F1:

| Blueprint element | BFF resource |
| --- | --- |
| Participantes (varios pilotos) | `/formula-1/drivers` (+ teams) |
| Calendario | `/formula-1/races?season=` |
| Sede / circuito | `/formula-1/circuits` |
| Evento (GP / sesión) | competitions + races |
| Resultado (posiciones) | `/formula-1/rankings/races?race=` |
| Estado del evento | `race.status` |
| Clasificación temporada | `/formula-1/rankings/drivers`, `/formula-1/rankings/teams` |

F1 stays **out of** generic `/v1/leagues/.../teams|matches|standings` (`genericEndpointsSupported: false`).

## Envelope

```json
{
  "get": "races",
  "parameters": { "season": "2024" },
  "errors": [],
  "results": 1,
  "paging": { "current": 1, "total": 1 },
  "response": []
}
```

## Firestore collections

| Collection | Role |
| --- | --- |
| `f1_competitions` | Grand Prix competitions |
| `f1_circuits` | Circuits |
| `f1_teams` | Constructors |
| `f1_drivers` | Drivers (participants) |
| `f1_races` | Calendar sessions (Race, Practice, Qualifying, Sprint, …) |
| `f1_rankings` | Drivers championship |
| `f1_team_rankings` | Constructors championship |
| `f1_race_rankings` | Per-race results (positions) |

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/formula-1/seasons` | Distinct years from `f1_races` |
| GET/POST/PATCH/DELETE | `/formula-1/competitions` | `id` / `name` / `search` |
| GET/POST/PATCH/DELETE | `/formula-1/circuits` | + `country` |
| GET/POST/PATCH/DELETE | `/formula-1/teams` | Constructors |
| GET/POST/PATCH/DELETE | `/formula-1/drivers` | Participants; filter `team` |
| GET/POST/PATCH/DELETE | `/formula-1/races` | List requires `season` (unless `id`) |
| GET/PATCH/DELETE | `/formula-1/races/{raceId}` | Path id variants |
| GET/POST/PATCH/DELETE | `/formula-1/rankings/drivers` | Requires `season` on GET |
| GET/POST/PATCH/DELETE | `/formula-1/rankings/teams` | Requires `season` on GET |
| GET/POST/PATCH/DELETE | `/formula-1/rankings/races` | Requires `race` on GET |

## Canonical IDs

- Responses expose Firestore document UUIDs.
- POST bodies must **not** include resource `id` fields.
- Nested refs (`competitionId`, `circuitId`, `driverId`, `teamId`, `raceId`) must be existing UUIDs.
- GET query params accept document UUID; `external_id` is accepted as a deprecated read fallback via `resolveDoc`.

## Recommended read flow (portal / consumers)

1. `GET /formula-1/seasons`
2. `GET /formula-1/races?season=2024` — calendar
3. `GET /formula-1/rankings/drivers?season=2024` — championship
4. `GET /formula-1/rankings/races?race=<uuid>` — session results (positions)

## Create order (writes)

1. Competitions + circuits + teams  
2. Drivers (`teamId` optional but must exist when set)  
3. Races (`competitionId`, `circuitId`)  
4. Rankings (drivers / teams / race results)

OpenAPI / Swagger: tag **`bff-formula-1`** at [`/docs?tag=bff-formula-1`](https://deportix-api.vercel.app/docs?tag=bff-formula-1).
