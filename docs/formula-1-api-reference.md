# Deportix API — Referencia Formula 1 (F1)

**Versión:** v1 · **Deporte (catálogo):** `f1` · **Base URL:** `https://deportix-api.vercel.app`

Guía para consumir los datos de **Formula 1** cargados en Firestore. F1 **no** usa el contrato genérico `/v1/leagues/{id}/teams|matches|standings` (modelo distinto: carreras, pilotos, constructores).

Hay **dos superficies** F1:

| Superficie | Prefijo | Envelope | Uso |
| --- | --- | --- | --- |
| **AppQD (spec §4.2)** | `/api/f1/*` | `{ data, meta }` (igual que `/v1/*`) | Portal AppQD |
| **BFF API-Sports** | `/formula-1/*` | Envelope completo api-sports | Flutter / clientes legacy |

Detalle del contrato AppQD: [`api-contract.md`](./api-contract.md#appqd-f1-apif1-read-only). Documentación interactiva: [`/docs`](http://localhost:3000/docs) (tags **AppQD F1** y **BFF Formula 1**). Fuente OpenAPI: [`openapi/openapi.yaml`](../openapi/openapi.yaml).

---

## 1. Descubrir cobertura

Antes de integrar, consulta qué hay cargado:

```bash
curl "https://deportix-api.vercel.app/v1/sports"
curl "https://deportix-api.vercel.app/v1/data-status"
```

En `data-status`, el deporte `f1` reporta cobertura a nivel colección (`teams`, `matches` → carreras, `standings` → campeonato de pilotos). F1 no aparece en la tabla de *featured leagues* de soccer/NFL.

Inventario de campos Firestore (generado): [`firebase-data-inventory.md`](./firebase-data-inventory.md).

---

## 2. Envelope de respuesta

Igual que American Football: envelope **completo** api-sports.

```json
{
  "get": "races",
  "parameters": { "season": "2024" },
  "errors": [],
  "results": 24,
  "paging": { "current": 1, "total": 1 },
  "response": []
}
```

- **`response`**: array de recursos (aunque sea un solo ítem).
- **`errors`**: array vacío en éxito; en error HTTP 400 suele incluir `{ "parameters": "…" }`.
- **`503`**: Firebase no configurado (`DATA_SOURCE_NOT_CONFIGURED` vía mensaje en `errors`).

---

## 3. Identificadores

| Concepto | Detalle |
| --- | --- |
| **`id` en respuestas** | UUID de Firestore (canónico). |
| **Filtros `id`, `team`, `race`, …** | Aceptan UUID **o** `external_id` del proveedor (fallback de lectura). |
| **Temporadas** | Año entero (`2024`, `2025`, …), alineado al campo `season` en carreras y rankings. |

---

## 4. Endpoints (solo lectura)

| Método | Ruta | Query params | Firestore |
| --- | --- | --- | --- |
| GET | `/formula-1/timezone` | — | `reference_timezones` |
| GET | `/formula-1/seasons` | — | años distintos en `f1_races` |
| GET | `/formula-1/teams` | `id`, `search` | `f1_teams` |
| GET | `/formula-1/drivers` | `id`, `team`, `search` | `f1_drivers` |
| GET | `/formula-1/circuits` | `id`, `search` | `f1_circuits` |
| GET | `/formula-1/competitions` | `id`, `search` | `f1_competitions` |
| GET | `/formula-1/races` | `id`, `season`, `type`, `circuit`, `competition` | `f1_races` |
| GET | `/formula-1/rankings` | **`race`** (requerido), `driver`, `team`, `id` | `f1_race_rankings` |
| GET | `/formula-1/rankings/drivers` | **`season`** (requerido), `driver`, `team`, `id` | `f1_rankings` |
| GET | `/formula-1/rankings/teams` | **`season`** (requerido), `team`, `id` | `f1_team_rankings` |

No hay POST/PATCH/DELETE en F1: la carga es operacional directo en Firestore.

---

## 5. Flujos de consumo recomendados

### Calendario de una temporada

```bash
curl "https://deportix-api.vercel.app/formula-1/seasons"
curl "https://deportix-api.vercel.app/formula-1/races?season=2024&type=Race"
```

Cada carrera incluye `competition`, `circuit`, `date`, `status`, `laps`, etc.

### Campeonato de pilotos y constructores

```bash
curl "https://deportix-api.vercel.app/formula-1/rankings/drivers?season=2024"
curl "https://deportix-api.vercel.app/formula-1/rankings/teams?season=2024"
```

### Resultado de una carrera (orden de llegada)

1. Obtén el `id` de la carrera (`GET /formula-1/races?season=2024`).
2. Consulta rankings de carrera:

```bash
curl "https://deportix-api.vercel.app/formula-1/rankings?race=<race-uuid>"
```

### Plantilla y pilotos de un equipo

```bash
curl "https://deportix-api.vercel.app/formula-1/teams"
curl "https://deportix-api.vercel.app/formula-1/drivers?team=<team-uuid>"
```

---

## 6. Ejemplo en JavaScript

```js
const BASE = 'https://deportix-api.vercel.app';

async function f1SeasonOverview(year) {
  const [racesRes, driversRes, teamsRes] = await Promise.all([
    fetch(`${BASE}/formula-1/races?season=${year}&type=Race`),
    fetch(`${BASE}/formula-1/rankings/drivers?season=${year}`),
    fetch(`${BASE}/formula-1/rankings/teams?season=${year}`),
  ]);

  const races = (await racesRes.json()).response;
  const drivers = (await driversRes.json()).response;
  const constructors = (await teamsRes.json()).response;

  return { races, drivers, constructors };
}
```

---

## 7. Qué **no** usar para F1

| Superficie | Comportamiento con F1 |
| --- | --- |
| `GET /v1/leagues?sport=f1` | Puede listar ligas vacías o ajenas al modelo F1 cargado. |
| `GET /v1/leagues/{id}/teams` | **`404 DATA_NOT_AVAILABLE`** si la liga es de deporte `f1`. |
| BFF soccer `/fixtures`, `/standings` | Solo fútbol. |
| `/american-football/*` | NFL, no F1. |

---

## 8. Volúmenes de datos (referencia)

Cifras reales del proyecto `deportix-api-dac8e` (ver [`data-availability.md`](./data-availability.md) tras `pnpm data:inspect`):

| Colección | Uso en API |
| --- | --- |
| `f1_teams` | Constructores |
| `f1_drivers` | Pilotos |
| `f1_circuits` | Circuitos |
| `f1_competitions` | Nombre del GP |
| `f1_races` | Calendario / sesiones |
| `f1_rankings` | Campeonato pilotos |
| `f1_team_rankings` | Campeonato constructores |
| `f1_race_rankings` | Clasificación por carrera |

---

## 9. Contrato general Deportix

Errores del envelope `/v1`, CORS, health y versionado: [`api-contract.md`](./api-contract.md).

Soccer (referencia paralela del contrato `/v1`): [`football-api-reference.md`](./football-api-reference.md).
