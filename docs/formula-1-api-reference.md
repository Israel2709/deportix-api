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
| Parrilla de salida | `/formula-1/rankings/startinggrid?race=` |
| Vueltas rápidas | `/formula-1/rankings/fastestlaps?race=` |
| Paradas en pits | `/formula-1/pitstops?race=` |
| Estado del evento | `race.status` |
| Clasificación temporada | `/formula-1/rankings/drivers`, `/formula-1/rankings/teams` |
| Zonas horarias | `/formula-1/timezone` |

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
| `f1_starting_grids` | Starting grid rows per race |
| `f1_fastest_laps` | Fastest lap ranking per race |
| `f1_pitstops` | Pit stop history per race (driver may appear multiple times) |
| `reference_timezones` | Shared IANA timezone catalog (also used by American Football) |

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/formula-1/seasons` | Distinct years from `f1_races` |
| GET/POST/PATCH/DELETE | `/formula-1/competitions` | `id` / `name` / `search`; `location: { country, city }` |
| GET/POST/PATCH/DELETE | `/formula-1/circuits` | + `country` (string) + `image` |
| GET/POST/PATCH/DELETE | `/formula-1/teams` | Constructors |
| GET/POST/PATCH/DELETE | `/formula-1/drivers` | + `abbr` / `image` / `number`; filter `team` |
| GET/POST/PATCH/DELETE | `/formula-1/races` | List requires `season` (unless `id`) |
| GET/PATCH/DELETE | `/formula-1/races/{raceId}` | Path id variants |
| GET/POST/PATCH/DELETE | `/formula-1/rankings/drivers` | Requires `season` on GET |
| GET/POST/PATCH/DELETE | `/formula-1/rankings/teams` | Requires `season` on GET |
| GET/POST/PATCH/DELETE | `/formula-1/rankings/races` | Requires `race` on GET |
| GET/POST/PATCH/DELETE | `/formula-1/rankings/startinggrid` | Requires `race` on GET |
| GET/POST/PATCH/DELETE | `/formula-1/rankings/fastestlaps` | Requires `race` on GET |
| GET/POST/PATCH/DELETE | `/formula-1/pitstops` | Requires `race` on GET |
| GET/POST/PATCH/DELETE | `/formula-1/timezone` | Shared timezone catalog; write via body |

Session-detail GETs (`startinggrid`, `fastestlaps`, `pitstops`) return an empty `response` until rows are loaded via POST or external ingest.

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
5. `GET /formula-1/rankings/startinggrid?race=<uuid>` — grid
6. `GET /formula-1/rankings/fastestlaps?race=<uuid>` — fastest laps
7. `GET /formula-1/pitstops?race=<uuid>` — pit stops

## Create order (writes)

1. Competitions + circuits + teams  
2. Drivers (`teamId` optional but must exist when set)  
3. Races (`competitionId`, `circuitId`)  
4. Rankings (drivers / teams / race results)  
5. Starting grid / fastest laps / pit stops (`raceId`, `driverId`)

OpenAPI / Swagger: tag **`bff-formula-1`** at [`/docs?tag=bff-formula-1`](https://deportix-api.vercel.app/docs?tag=bff-formula-1).
