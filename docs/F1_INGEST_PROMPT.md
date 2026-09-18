# Prompt: ingestas F1 (starting grid, fastest laps, pit stops, timezone)

Copia y pega el bloque siguiente en el repo de ingestas / sync (o en un agent de ese repo).

---

## Prompt

```text
Contexto
========
El API BFF Deportix (`deportix-api`) ya expone estos endpoints Formula 1 bajo `/formula-1/*`
(envelope API-Sports completo). Los datos viven en Firestore; el BFF NO llama al proveedor
en runtime. Falta poblar las colecciones nuevas mediante ingesta desde API-Sports Formula 1.

Proveedor
---------
- Base URL: https://v1.formula-1.api-sports.io
- Header: x-apisports-key: <API_KEY>  (solo backend / secretos; nunca al cliente)
- Envelope: { get, parameters, errors, results, response }
- Validar `errors` (array u object) antes de consumir `response`.
- Conservar tiempos y `avg_speed` como string.

Endpoints del proveedor a integrar
----------------------------------
1) GET /rankings/startinggrid?race={providerRaceId}
2) GET /rankings/fastestlaps?race={providerRaceId}
3) GET /pitstops?race={providerRaceId}
4) GET /timezone  (sin params; response = string[] IANA)

Contrato verificado (ejemplo race=50 del proveedor) y shapes: ver docs del API
`API_SPORTS_F1_BACKEND_CONTRACTS.md` / shapes equivalentes abajo.

Destino en Firestore (proyecto Deportix)
----------------------------------------
Colecciones nuevas (crear docs con UUID canónico como id de documento):

A) f1_starting_grids
   Campos:
   - race_id: string (UUID de f1_races)
   - driver_id: string (UUID de f1_drivers)
   - position: number
   - time: string | null
   - id, created_at, updated_at (como el resto de docs F1)
   - recomendado: external_id o clave de dedupe (p.ej. `${providerRaceId}:${providerDriverId}:grid`)

B) f1_fastest_laps
   - race_id, driver_id (UUIDs)
   - position: number
   - lap: number
   - time: string | null
   - avg_speed: string | null  (NO convertir a number al persistir)
   - id, created_at, updated_at
   - dedupe recomendado por race+driver o race+position

C) f1_pitstops
   - race_id, driver_id (UUIDs)
   - stops: number
   - lap: number
   - time: string | null
   - total_time: string | null
   - id, created_at, updated_at
   - IMPORTANTE: un piloto puede tener N filas; NO usar solo driver_id como llave única.
     Dedupe sugerido: `${providerRaceId}:${providerDriverId}:${stops}:${lap}`

D) reference_timezones (catálogo compartido con American Football)
   - nombre IANA por documento (mismo patrón que ya use el repo para NFL/AF timezone)
   - incluir America/Mexico_City si aún no está
   - idempotente / upsert por nombre

Resolución de IDs (crítico)
--------------------------
El proveedor usa IDs numéricos (race.id, driver.id, team.id).
El BFF usa UUIDs de Firestore.

La ingesta DEBE:
1. Resolver provider race id → documento en f1_races (vía external_id u mapping existente).
2. Resolver provider driver id → documento en f1_drivers (vía external_id).
3. Escribir race_id / driver_id con esos UUIDs.
4. Si race o driver no existen aún, NO inventar UUIDs sueltos: o bien
   (a) fallar/skip con log, o
   (b) seguir el orden de ingesta F1 ya existente (competitions → circuits → teams →
       drivers → races → rankings) y solo después session-detail.

Team no se guarda en estas colecciones: el BFF deriva team desde f1_drivers.team_id.

Alternativa de escritura vía HTTP (si el ingest no escribe Firestore directo)
--------------------------------------------------------------------------
POST al BFF (misma forma):

POST /formula-1/rankings/startinggrid
  { "raceId": "<uuid>", "driverId": "<uuid>", "position": 1, "time": "1:20.486" }

POST /formula-1/rankings/fastestlaps
  { "raceId": "<uuid>", "driverId": "<uuid>", "position": 1, "lap": 57,
    "time": "1:25.580", "avg_speed": "223.075" }

POST /formula-1/pitstops
  { "raceId": "<uuid>", "driverId": "<uuid>", "stops": 1, "lap": 12,
    "time": "2.401", "total_time": "2.401" }

POST /formula-1/timezone
  { "timezone": "America/Mexico_City" }

Preferir el patrón de ingestas F1/NFL ya usado en ESTE repo (Firestore directo vs HTTP).
No duplicar lógica de mapeo si ya hay cliente API-Sports F1.

Comportamiento esperado
-----------------------
- Ingesta por carrera (provider race id) o por temporada (iterar races ya sincronizadas).
- Idempotente: re-correr no debe duplicar filas (upsert por clave de dedupe).
- Tras carrera Completed, los datos cambian poco → cache/re-sync menos frecuente OK.
- No loguear headers con x-apisports-key.
- Validar raceId del proveedor como entero positivo antes de llamar al API.
- No usar el campo `get` del envelope para tipar (`rankings` es ambiguo entre grid y laps;
  pitstops viene como `pitstop`).

Shape proveedor (response[])
----------------------------
Starting grid:
  { race:{id}, driver:{id,name,abbr,number,image}, team:{id,name,logo}, position, time }

Fastest laps:
  { race:{id}, driver:{...}, team:{...}, position, lap, time, avg_speed }

Pit stops:
  { race:{id}, driver:{...}, team:{...}, stops, lap, time, total_time }

Timezone:
  response: ["Africa/Abidjan", "America/Mexico_City", "UTC", ...]

Tarea
-----
1. Explorar cómo este repo ya ingesta F1 (races/drivers/rankings) y timezone de otros deportes.
2. Agregar jobs/scripts/mappers para startinggrid, fastestlaps, pitstops y timezone.
3. Reusar cliente HTTP, secrets, logging y upsert del patrón existente.
4. Documentar comando de ejecución, env vars y orden relativo a la sync de races/drivers.
5. Incluir prueba mínima (fixture o dry-run) con race de ejemplo del proveedor.

Entregable
----------
- Código de ingesta integrado al pipeline F1 existente
- README / nota de cómo correrlo
- Confirmación de colecciones y campos escritos
```

---

## Addendum (campos de catálogo que el BFF ya expone)

El BFF ya declara y mapea estos campos. Si siguen `null` o ausentes en Firestore, la
ingesta de catálogo F1 debe escribirlos:

### `f1_circuits`
- `country`: **string** (ej. `"Monaco"`). No guardar objeto anidado; si el proveedor
  trae `{ name, code }`, persistir solo el nombre en `country`.
- `image`: string URL (ya se usa).

### `f1_drivers`
- `abbr`: string (ej. `"HAM"`, `"PIA"`)
- `image`: string URL (`https://media.api-sports.io/formula-1/drivers/{id}.png`)
- Además de `name`, `number`, `team_id`, `external_id`

Estos campos alimentan:
- `GET /formula-1/drivers`
- `driver` anidado en rankings/drivers, rankings/races, startinggrid, fastestlaps, pitstops

### `f1_competitions`
- `location`: objeto `{ country: string | null, city: string | null }` (shape API-Sports)
- Ejemplo: `{ "country": "Monaco", "city": "Monte Carlo" }`
- Aparece en `GET /formula-1/competitions` y en `competition` anidado de `/formula-1/races`

### Escritura vía BFF (alternativa)
```json
PATCH /formula-1/drivers?id=<uuid>
{ "abbr": "PIA", "image": "https://media.api-sports.io/formula-1/drivers/97.png" }

PATCH /formula-1/circuits?id=<uuid>
{ "country": "Monaco" }

PATCH /formula-1/competitions?id=<uuid>
{ "location": { "country": "Monaco", "city": "Monte Carlo" } }
```

Prioridad de sync de catálogo: competitions (con location) → circuits (con country) →
teams → drivers (con abbr + image) → races → session-detail.
