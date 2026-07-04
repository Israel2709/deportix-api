---
title: Deportix API — Referencia Football (Soccer)
author: Deportix API
date: June 2026
---

# Deportix API — Referencia Football (Soccer)

**Versión:** v1 · **Deporte:** `soccer` · **Base URL:** `https://deportix-api.vercel.app`

Documento de referencia para todos los endpoints y recursos disponibles para **fútbol** (soccer) en Deportix API. Fórmula 1 (`f1`) y NFL (`nfl`) quedan fuera de este documento.

---

## 1. Convenciones generales

| Concepto | Detalle |
| --- | --- |
| Prefijo | `/v1` |
| Formato | JSON, UTF-8 |
| Fechas | ISO-8601, **UTC** |
| Identificadores | Path params aceptan el `id` interno o el `externalId` del proveedor (ej. `262` = Liga MX) |
| Autenticación | No requerida en MVP (acceso operacional restringido) |
| CORS | Abierto (`*`) — GET, POST, PATCH, DELETE, OPTIONS |

### Envelopes de respuesta

**Colección (200)**
```json
{
  "data": [],
  "meta": {
    "apiVersion": "v1",
    "updatedAt": "2026-06-23T00:00:00.000Z",
    "pagination": { "page": 1, "pageSize": 20, "total": 0 }
  }
}
```

**Recurso (200 / 201)**
```json
{
  "data": {},
  "meta": { "apiVersion": "v1", "updatedAt": "2026-06-23T00:00:00.000Z" }
}
```

**Error**
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "League not found.",
    "requestId": "req_abc123"
  }
}
```

**Eliminación exitosa:** `204 No Content` (sin body).

### Códigos de error

| Código | HTTP | Cuándo |
| --- | --- | --- |
| `INVALID_QUERY_PARAMETER` | 400 | Query param inválido |
| `INVALID_REQUEST_BODY` | 400 | Body JSON inválido o campos incorrectos |
| `INVALID_PATH_PARAMETER` | 400 | Path param faltante |
| `RESOURCE_NOT_FOUND` | 404 | Liga, equipo o partido no existe |
| `DATA_NOT_AVAILABLE` | 404 | Temporada no encontrada, liga sin temporada actual, etc. |
| `DATA_SOURCE_NOT_CONFIGURED` | 503 | Firebase no configurado |
| `INTERNAL_SERVER_ERROR` | 500 | Error inesperado |

### Parámetros de consulta comunes

| Param | Tipo | Default | Máx | Uso |
| --- | --- | --- | --- | --- |
| `page` | int ≥ 1 | 1 | — | Paginación |
| `pageSize` | int ≥ 1 | 20 | 100 | Items por página |
| `sport` | string | — | — | Filtrar ligas: `soccer` |
| `season` | int (año) | temporada actual | — | ej. `2026` |
| `from` / `to` | fecha ISO | — | — | Rango de fechas de partido (UTC) |
| `date` | fecha | — | — | Día exacto; excluyente con `from`/`to` |
| `teamId` | string | — | — | Filtrar partidos de un equipo |
| `status` | string | — | — | Código de estado (`NS`, `FT`, `1H`, …) |
| `sort` | enum | `-date` / `name` | — | Orden permitido por endpoint |

---

## 2. Meta y catálogo

### GET `/v1/health`

Sonda de vida. No consulta Firestore.

**Respuesta `data`:** `{ status, apiVersion, dataSourceConfigured, timestamp }`

---

### GET `/v1/data-status`

Cobertura real por deporte y ligas destacadas. **Recomendado** antes de construir UI.

**Respuesta `data.sports[]` (filtrar `slug: "soccer"`):**
- `leagueCount`, `coverage.teams`, `coverage.matches`, `coverage.standings`, `coverage.statistics`

**Respuesta `data.leagues[]`:** ligas destacadas con `availableSeasons[]` y flags de cobertura.

---

### GET `/v1/sports`

Lista deportes. Football = entrada con `slug: "soccer"`.

| Query | Descripción |
| --- | --- |
| `page`, `pageSize` | Paginación |

---

### GET `/v1/leagues?sport=soccer`

Lista ligas de fútbol.

| Query | Descripción |
| --- | --- |
| `sport=soccer` | **Obligatorio** para limitar a football |
| `sort` | `name` (asc) o `-name` (desc) |
| `page`, `pageSize` | Paginación |

**Objeto League (`data[]`):**

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | string | Id del documento |
| `externalId` | string \| null | Id del proveedor |
| `name` | string \| null | Nombre de la liga |
| `type` | string \| null | Tipo (ej. League) |
| `sport` | string \| null | `"soccer"` |
| `country` | string \| null | País |
| `logo` | string \| null | URL del logo |
| `updatedAt` | string \| null | Última actualización |

---

### GET `/v1/leagues/{leagueId}`

Detalle de una liga de fútbol. Mismo schema `League`.

**Ejemplo:** `GET /v1/leagues/262` (Liga MX por externalId)

---

## 3. Recursos de liga (football)

Todos los endpoints siguientes aplican a ligas con `sport: "soccer"`.

### GET `/v1/leagues/{leagueId}/seasons`

Temporadas de la liga, ordenadas por año descendente.

**Objeto Season (`data[]`):**

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | string | Id del documento |
| `leagueId` | string \| null | Liga padre |
| `year` | int \| null | Año (ej. 2026) |
| `startDate` | string \| null | Inicio |
| `endDate` | string \| null | Fin |
| `current` | boolean | Temporada actual |
| `externalId` | string \| null | Id del proveedor |

---

### GET `/v1/leagues/{leagueId}/teams`

Equipos de la liga.

| Query | Descripción |
| --- | --- |
| `page`, `pageSize` | Paginación |

**Objeto Team (`data[]`) — campos relevantes para soccer:**

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | string | Id del documento |
| `externalId` | string \| null | Id del proveedor |
| `sport` | string \| null | `"soccer"` |
| `leagueId` | string \| null | Liga |
| `name` | string \| null | Nombre |
| `code` | string \| null | Código (ej. TIG) |
| `country` | string \| null | País |
| `logo` | string \| null | URL logo |
| `altName` | string \| null | Nombre alternativo |
| `altLogo` | string \| null | Logo alternativo |
| `venue` | object \| null | `{ id, name, city, capacity }` |
| `updatedAt` | string \| null | Última actualización |

---

### GET `/v1/leagues/{leagueId}/standings?season={year}`

Tabla de posiciones. Default: temporada **actual**.

| Query | Descripción |
| --- | --- |
| `season` | Año (ej. `2026`). Si no existe → colección vacía |

**Objeto Standing (`data[]`):**

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `teamId` | string \| null | Equipo |
| `teamName` | string \| null | Nombre resuelto |
| `points` | int \| null | Puntos |
| `played` | int \| null | Jugados |
| `wins` | int \| null | Ganados |
| `draws` | int \| null | Empates |
| `losses` | int \| null | Perdidos |

---

### GET `/v1/leagues/{leagueId}/matches`

Lista partidos de la liga.

| Query | Descripción |
| --- | --- |
| `season` | Año. Default: temporada actual (si no hay filtro de fecha) |
| `from`, `to` | Rango de fechas inclusive |
| `date` | Día exacto (mutuamente excluyente con `from`/`to`) |
| `teamId` | Partidos donde participa el equipo |
| `status` | Filtro por estado |
| `sort` | `date` o `-date` (default `-date`) |
| `page`, `pageSize` | Paginación |

**Objeto Match (`data[]`):**

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | string | Id del documento |
| `externalId` | string \| null | Id del proveedor |
| `sport` | string \| null | `"soccer"` |
| `leagueId` | string \| null | Liga |
| `seasonId` | string \| null | Temporada |
| `date` | string \| null | Fecha/hora kick-off (UTC) |
| `status` | string \| null | `NS`, `FT`, `1H`, `2H`, … |
| `round` | string \| null | Jornada (ej. Clausura - 16) |
| `venue` | string \| null | Estadio |
| `home` | MatchSide | `{ teamId, name, logo, score }` |
| `away` | MatchSide | `{ teamId, name, logo, score }` |
| `updatedAt` | string \| null | Última actualización |

---

### POST `/v1/leagues/{leagueId}/matches`

**Crea** un partido. Respuesta: **201 Created**.

#### Temporada destino

| Mecanismo | Ejemplo | Comportamiento |
| --- | --- | --- |
| *(ninguno)* | `POST .../matches` | Temporada **actual** |
| Query `?season=` | `?season=2025` | Por año |
| Body `seasonId` | `"seasonId": "..."` | Por id o externalId |
| Ambos | `?season=2025` + `seasonId` | Deben coincidir |

#### Body (JSON)

| Campo | Requerido | Descripción |
| --- | --- | --- |
| `date` | **sí** | ISO-8601 UTC |
| `home.teamId` | **sí** | Equipo local (id o externalId) |
| `away.teamId` | **sí** | Equipo visitante (distinto al local) |
| `status` | no | Default `NS` |
| `round` | no | Jornada |
| `venue` | no | Estadio |
| `externalId` | no | Id del proveedor |
| `seasonId` | no | Temporada (alternativa a `?season=`) |
| `home/away.name`, `logo`, `score` | no | Se toman del roster si se omiten |

**Ejemplo — temporada actual:**
```bash
curl -X POST "https://deportix-api.vercel.app/v1/leagues/128/matches" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-11-08T21:00:00.000Z",
    "round": "Clausura - 16",
    "venue": "La Bombonera",
    "home": { "teamId": "tm_boca" },
    "away": { "teamId": "tm_river" }
  }'
```

**Ejemplo — temporada 2025:**
```bash
curl -X POST "https://deportix-api.vercel.app/v1/leagues/128/matches?season=2025" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-03-01T21:00:00.000Z",
    "home": { "teamId": "tm_boca" },
    "away": { "teamId": "tm_river" }
  }'
```

---

### PATCH `/v1/leagues/{leagueId}/matches/{matchId}`

**Actualización parcial.** Solo enviar campos a modificar. Respuesta: **200** con el partido actualizado.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `externalId` | string \| null | |
| `seasonId` | string \| null | Cambiar temporada |
| `date` | string \| null | Actualiza `fixture_date` y campos denormalizados |
| `status` | string \| null | |
| `round` | string \| null | |
| `venue` | string \| null | |
| `home` / `away` | object | Parcial: `teamId`, `name`, `logo`, `score` |

Al menos **un** campo requerido.

**Ejemplo — marcar resultado:**
```bash
curl -X PATCH "https://deportix-api.vercel.app/v1/leagues/128/matches/m1" \
  -H "Content-Type: application/json" \
  -d '{"status":"FT","home":{"score":2},"away":{"score":1}}'
```

---

### DELETE `/v1/leagues/{leagueId}/matches/{matchId}`

Elimina permanentemente el partido. Respuesta: **204 No Content**.

```bash
curl -X DELETE "https://deportix-api.vercel.app/v1/leagues/128/matches/m1"
```

---

## 4. Equipos (cross-league)

### GET `/v1/teams/{teamId}`

Busca un equipo de fútbol por id o externalId en todas las colecciones `soccer_teams`.

Respuesta: envelope de recurso con objeto `Team`.

---

### GET `/v1/teams/{teamId}/matches`

Partidos del equipo (local o visitante).

| Query | Descripción |
| --- | --- |
| `season` | Año de temporada |
| `from`, `to`, `date` | Filtros de fecha |
| `status` | Estado |
| `sort` | `date` / `-date` |
| `page`, `pageSize` | Paginación |

Respuesta: colección de `Match`.

---

## 5. Estados de partido (soccer)

Códigos comunes en `status`:

| Código | Significado |
| --- | --- |
| `NS` | Not Started — programado |
| `1H` | Primer tiempo |
| `HT` | Medio tiempo |
| `2H` | Segundo tiempo |
| `FT` | Finalizado |
| `AET` | Tras tiempo extra |
| `PEN` | Definido por penales |
| `PST` | Postpuesto |
| `CANC` | Cancelado |
| `ABD` | Abandonado |

---

## 6. Flujo típico (portal / backoffice)

1. `GET /v1/data-status` — verificar cobertura soccer
2. `GET /v1/leagues?sport=soccer` — listar ligas
3. `GET /v1/leagues/{id}/seasons` — temporadas disponibles
4. `GET /v1/leagues/{id}/teams` — roster
5. `GET /v1/leagues/{id}/matches?season=2026` — fixture
6. `POST /v1/leagues/{id}/matches` — alta de partido
7. `PATCH /v1/leagues/{id}/matches/{matchId}` — actualizar marcador/estado
8. `DELETE /v1/leagues/{id}/matches/{matchId}` — baja

---

## 7. Referencia interactiva

- OpenAPI JSON: `GET /v1/openapi.json`
- UI Scalar: `GET /docs`

---

*Generado desde Deportix API v1 — sport slug `soccer`.*
