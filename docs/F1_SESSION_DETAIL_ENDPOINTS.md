# F1 BFF — endpoints nuevos (consumo)

Documentación para clientes (app / portal) de los recursos Formula 1 agregados al BFF Deportix.

**Base path:** `/formula-1`  
**Envelope:** igual que el resto del BFF F1 / American Football:

```json
{
  "get": "string",
  "parameters": {},
  "errors": [],
  "results": 0,
  "paging": { "current": 1, "total": 1 },
  "response": []
}
```

**IDs:** UUID canónicos de Firestore. En lecturas, `race` acepta UUID (y fallback deprecado por `external_id`).

**Driver ref unificado:** en drivers, rankings y session-detail el nested `driver` expone
`id`, `name`, `abbr`, `number`, `image` (pueden ser `null` hasta que la ingesta los escriba en `f1_drivers`).

**Competition:** `location: { country, city } | null` en competitions y en `competition` anidado de races.

**Estado de datos:** hasta que exista ingesta o carga manual, `startinggrid`, `fastestlaps` y `pitstops` pueden devolver `response: []`. Timezone puede devolver defaults del catálogo compartido.

Swagger: tag `bff-formula-1` en `/docs?tag=bff-formula-1`.

---

## Lista de endpoints

### 1. Parrilla de salida

| Method | Path | Query |
| --- | --- | --- |
| `GET` | `/formula-1/rankings/startinggrid` | **`race`** (requerido) |
| `POST` | `/formula-1/rankings/startinggrid` | — |
| `PATCH` | `/formula-1/rankings/startinggrid` | **`id`** (requerido) |
| `DELETE` | `/formula-1/rankings/startinggrid` | **`id`** (requerido) |

**Ejemplo lectura**

```http
GET /formula-1/rankings/startinggrid?race=<raceUuid>
```

**Ítem en `response[]`**

| Campo | Tipo | Notas |
| --- | --- | --- |
| `race.id` | `string` (UUID) | |
| `driver.id` | `string` (UUID) | |
| `driver.name` | `string` | |
| `driver.abbr` | `string \| null` | opcional |
| `driver.number` | `number \| null` | opcional |
| `driver.image` | `string \| null` | opcional |
| `team` | `object \| null` | `{ id, name, logo? }` |
| `position` | `number` | pole = `position === 1` (no asumir índice 0) |
| `time` | `string \| null` | conservar como texto |

**Body create (POST)**

```json
{
  "raceId": "<uuid>",
  "driverId": "<uuid>",
  "position": 1,
  "time": "1:20.486"
}
```

---

### 2. Ranking de vueltas rápidas

| Method | Path | Query |
| --- | --- | --- |
| `GET` | `/formula-1/rankings/fastestlaps` | **`race`** (requerido) |
| `POST` | `/formula-1/rankings/fastestlaps` | — |
| `PATCH` | `/formula-1/rankings/fastestlaps` | **`id`** (requerido) |
| `DELETE` | `/formula-1/rankings/fastestlaps` | **`id`** (requerido) |

**Ejemplo lectura**

```http
GET /formula-1/rankings/fastestlaps?race=<raceUuid>
```

**Ítem en `response[]`**

| Campo | Tipo | Notas |
| --- | --- | --- |
| `race.id` | `string` (UUID) | |
| `driver.*` | igual que starting grid | |
| `team` | `object \| null` | |
| `position` | `number` | vuelta más rápida = `position === 1` |
| `lap` | `number` | |
| `time` | `string \| null` | |
| `avg_speed` | `string \| null` | llega como texto; convertir a número solo si se opera |

**Body create (POST)**

```json
{
  "raceId": "<uuid>",
  "driverId": "<uuid>",
  "position": 1,
  "lap": 57,
  "time": "1:25.580",
  "avg_speed": "223.075"
}
```

---

### 3. Paradas en pits

| Method | Path | Query |
| --- | --- | --- |
| `GET` | `/formula-1/pitstops` | **`race`** (requerido) |
| `POST` | `/formula-1/pitstops` | — |
| `PATCH` | `/formula-1/pitstops` | **`id`** (requerido) |
| `DELETE` | `/formula-1/pitstops` | **`id`** (requerido) |

**Ejemplo lectura**

```http
GET /formula-1/pitstops?race=<raceUuid>
```

**Ítem en `response[]`**

| Campo | Tipo | Notas |
| --- | --- | --- |
| `race.id` | `string` (UUID) | |
| `driver.*` | igual que starting grid | un piloto puede aparecer **varias** veces |
| `team` | `object \| null` | |
| `stops` | `number` | número acumulado de paradas del piloto |
| `lap` | `number` | vuelta de esa parada |
| `time` | `string \| null` | duración de esa parada |
| `total_time` | `string \| null` | acumulado de paradas del piloto |

**Body create (POST)**

```json
{
  "raceId": "<uuid>",
  "driverId": "<uuid>",
  "stops": 1,
  "lap": 12,
  "time": "2.401",
  "total_time": "2.401"
}
```

---

### 4. Zonas horarias

| Method | Path | Body |
| --- | --- | --- |
| `GET` | `/formula-1/timezone` | — |
| `POST` | `/formula-1/timezone` | `{ "timezone": "America/Mexico_City" }` |
| `PATCH` | `/formula-1/timezone` | `{ "timezone": "Old/Name", "newTimezone": "New/Name" }` |
| `DELETE` | `/formula-1/timezone` | `{ "timezone": "America/Mexico_City" }` |

**Ejemplo lectura**

```http
GET /formula-1/timezone
```

**`response`:** arreglo de strings IANA, p. ej. `"America/Mexico_City"`, `"UTC"`.

Para fechas en México usar `America/Mexico_City` (no un offset fijo).

---

## Flujo de lectura sugerido

1. `GET /formula-1/seasons`
2. `GET /formula-1/races?season=<year>` — obtener `race.id`
3. Por carrera:
   - `GET /formula-1/rankings/races?race=<uuid>` — resultado (posiciones)
   - `GET /formula-1/rankings/startinggrid?race=<uuid>`
   - `GET /formula-1/rankings/fastestlaps?race=<uuid>`
   - `GET /formula-1/pitstops?race=<uuid>`
4. `GET /formula-1/timezone` — si se necesitan zonas IANA

---

## Notas para el consumidor

- Validar `errors` del envelope antes de usar `response`.
- No usar el campo `get` para discriminar tipo de ranking (`startinggrid` / `fastestlaps` comparten familia de paths).
- Tiempos siempre como `string`.
- PATCH/DELETE de grid, laps y pits identifican el renglón con `?id=<entryUuid>` (no el `raceId`).
- Estos recursos son independientes de los campos `grid` / `pits` en `/formula-1/rankings/races`.

Referencia completa del BFF F1: [formula-1-api-reference.md](./formula-1-api-reference.md).  
Contrato del proveedor API-Sports (origen): [API_SPORTS_F1_BACKEND_CONTRACTS.md](./API_SPORTS_F1_BACKEND_CONTRACTS.md).
