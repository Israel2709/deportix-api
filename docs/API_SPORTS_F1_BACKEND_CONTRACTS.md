# API-Sports Formula 1: contratos para backend

Documento técnico para integrar los endpoints de parrilla de salida, vueltas
rápidas, paradas en pits y zonas horarias de API-Sports Formula 1.

Las estructuras de este documento fueron verificadas contra respuestas reales
de API-Sports usando la carrera `race=50`.

## 1. Configuración general

### Base URL del proveedor

```text
https://v1.formula-1.api-sports.io
```

> Si el backend publica rutas internas con el prefijo `/formula-1`, ese prefijo
> pertenece al API propio. No debe agregarse al URL del proveedor.

### Autenticación

```http
x-apisports-key: <API_KEY>
```

La llave debe permanecer en el backend y obtenerse desde secretos o variables
de entorno. Nunca debe enviarse al cliente móvil o web.

### Envelope general

Todos los endpoints regresan un objeto con esta forma:

```json
{
  "get": "string",
  "parameters": {},
  "errors": [],
  "results": 0,
  "response": []
}
```

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `get` | `string` | Nombre interno del recurso solicitado. |
| `parameters` | `object` o `array` | Parámetros reconocidos por el proveedor. |
| `errors` | `array` u `object` | Vacío cuando la solicitud fue exitosa; debe validarse antes de consumir `response`. |
| `results` | `number` | Cantidad de elementos dentro de `response`. |
| `response` | `array` | Datos solicitados. |

## 2. Parrilla de salida

Obtiene la posición de salida de cada piloto para una carrera.

### Request al proveedor

```http
GET /rankings/startinggrid?race={raceId}
```

| Parámetro | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `race` | `number` | Sí | ID de carrera o sesión obtenido desde `/races`. |

### Response

```json
{
  "get": "rankings",
  "parameters": {
    "race": "50"
  },
  "errors": [],
  "results": 20,
  "response": [
    {
      "race": {
        "id": 50
      },
      "driver": {
        "id": 20,
        "name": "Lewis Hamilton",
        "abbr": "HAM",
        "number": 44,
        "image": "https://media.api-sports.io/formula-1/drivers/20.png"
      },
      "team": {
        "id": 5,
        "name": "Mercedes-AMG Petronas",
        "logo": "https://media.api-sports.io/formula-1/teams/5.png"
      },
      "position": 1,
      "time": "1:20.486"
    }
  ]
}
```

### Campos de `response[]`

| Campo | Tipo |
| --- | --- |
| `race.id` | `number` |
| `driver.id` | `number` |
| `driver.name` | `string` |
| `driver.abbr` | `string` |
| `driver.number` | `number` |
| `driver.image` | `string` |
| `team.id` | `number` |
| `team.name` | `string` |
| `team.logo` | `string` |
| `position` | `number` |
| `time` | `string` |

Para obtener la pole position se debe buscar el registro con `position === 1`.
No se recomienda asumir que siempre será el primer elemento del arreglo.

## 3. Ranking de vueltas rápidas

Obtiene la mejor vuelta de cada piloto y su posición dentro del ranking de la
carrera.

### Request al proveedor

```http
GET /rankings/fastestlaps?race={raceId}
```

| Parámetro | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `race` | `number` | Sí | ID de carrera o sesión obtenido desde `/races`. |

### Response

```json
{
  "get": "rankings",
  "parameters": {
    "race": "50"
  },
  "errors": [],
  "results": 20,
  "response": [
    {
      "race": {
        "id": 50
      },
      "driver": {
        "id": 5,
        "name": "Valtteri Bottas",
        "abbr": "BOT",
        "number": 77,
        "image": "https://media.api-sports.io/formula-1/drivers/5.png"
      },
      "team": {
        "id": 5,
        "name": "Mercedes-AMG Petronas",
        "logo": "https://media.api-sports.io/formula-1/teams/5.png"
      },
      "position": 1,
      "lap": 57,
      "time": "1:25.580",
      "avg_speed": "223.075"
    }
  ]
}
```

### Campos de `response[]`

| Campo | Tipo |
| --- | --- |
| `race.id` | `number` |
| `driver.*` | Igual que en `startinggrid`. |
| `team.*` | Igual que en `startinggrid`. |
| `position` | `number` |
| `lap` | `number` |
| `time` | `string` |
| `avg_speed` | `string` |

`avg_speed` llega como texto. Si se necesita operar con ese valor, el backend
debe convertirlo explícitamente a número y manejar valores ausentes o inválidos.
La vuelta más rápida corresponde al registro con `position === 1`.

## 4. Paradas en pits

Obtiene las paradas realizadas durante una carrera.

### Request al proveedor

```http
GET /pitstops?race={raceId}
```

| Parámetro | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `race` | `number` | Sí | ID de carrera obtenido desde `/races`. |

### Response

```json
{
  "get": "pitstop",
  "parameters": {
    "race": "50"
  },
  "errors": [],
  "results": 22,
  "response": [
    {
      "race": {
        "id": 50
      },
      "driver": {
        "id": 52,
        "name": "Robert Kubica",
        "abbr": "KUB",
        "number": 88,
        "image": "https://media.api-sports.io/formula-1/drivers/52.png"
      },
      "team": {
        "id": 12,
        "name": "Williams F1 Team",
        "logo": "https://media.api-sports.io/formula-1/teams/12.png"
      },
      "stops": 1,
      "lap": 1,
      "time": "32.997",
      "total_time": "32.997"
    }
  ]
}
```

### Campos de `response[]`

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `race.id` | `number` | ID de la carrera. |
| `driver.*` | `object` | Datos del piloto. |
| `team.*` | `object` | Datos del equipo. |
| `stops` | `number` | Número acumulado de paradas del piloto. |
| `lap` | `number` | Vuelta en la que ocurrió la parada. |
| `time` | `string` | Duración de esa parada. |
| `total_time` | `string` | Tiempo acumulado de las paradas del piloto. |

Un piloto puede aparecer varias veces en `response`, una vez por cada parada.
Por lo tanto, `driver.id` no es una llave única para esta colección.

## 5. Zonas horarias

Obtiene las zonas horarias IANA aceptadas por el proveedor.

### Request al proveedor

```http
GET /timezone
```

No recibe parámetros.

### Response

```json
{
  "get": "timezone",
  "parameters": [],
  "errors": [],
  "results": 425,
  "response": [
    "Africa/Abidjan",
    "America/Mexico_City",
    "Europe/London",
    "UTC"
  ]
}
```

Cada elemento de `response` es un `string`. Para fechas mostradas en México se
debe utilizar `America/Mexico_City` y no un offset fijo, para respetar las reglas
de la zona horaria.

## 6. Contratos TypeScript sugeridos

```ts
type ApiSportsErrors = unknown[] | Record<string, string>;

interface ApiSportsEnvelope<T> {
  get: string;
  parameters: Record<string, string> | unknown[];
  errors: ApiSportsErrors;
  results: number;
  response: T[];
}

interface F1RaceReference {
  id: number;
}

interface F1DriverReference {
  id: number;
  name: string;
  abbr: string;
  number: number;
  image: string;
}

interface F1TeamReference {
  id: number;
  name: string;
  logo: string;
}

interface F1StartingGridEntry {
  race: F1RaceReference;
  driver: F1DriverReference;
  team: F1TeamReference;
  position: number;
  time: string;
}

interface F1FastestLapEntry {
  race: F1RaceReference;
  driver: F1DriverReference;
  team: F1TeamReference;
  position: number;
  lap: number;
  time: string;
  avg_speed: string;
}

interface F1PitStopEntry {
  race: F1RaceReference;
  driver: F1DriverReference;
  team: F1TeamReference;
  stops: number;
  lap: number;
  time: string;
  total_time: string;
}

type StartingGridResponse = ApiSportsEnvelope<F1StartingGridEntry>;
type FastestLapsResponse = ApiSportsEnvelope<F1FastestLapEntry>;
type PitStopsResponse = ApiSportsEnvelope<F1PitStopEntry>;
type TimezoneResponse = ApiSportsEnvelope<string>;
```

## 7. Ejemplo de consumo desde Node.js

```js
const axios = require("axios");

const f1Api = axios.create({
  baseURL: "https://v1.formula-1.api-sports.io",
  timeout: 10000,
  headers: {
    "x-apisports-key": process.env.API_SPORTS_KEY,
  },
});

async function getStartingGrid(raceId) {
  const {data} = await f1Api.get("/rankings/startinggrid", {
    params: {race: raceId},
  });

  const hasErrors = Array.isArray(data.errors)
    ? data.errors.length > 0
    : data.errors && Object.keys(data.errors).length > 0;

  if (hasErrors) {
    throw new Error(`API-Sports error: ${JSON.stringify(data.errors)}`);
  }

  return Array.isArray(data.response) ? data.response : [];
}
```

## 8. Consideraciones para el backend

- Validar que `raceId` sea un entero positivo antes de llamar al proveedor.
- Tratar `parameters.race` como texto en la respuesta, aunque se envíe un número.
- No utilizar el valor de `get` para decidir el tipo del resultado: ambos
  rankings regresan `"rankings"` y pit stops regresa `"pitstop"` en singular.
- Validar `errors` y confirmar que `response` sea un arreglo.
- Buscar ganadores por `position === 1`; no depender del orden del arreglo.
- Conservar los tiempos como texto, ya que pueden usar formatos diferentes
  dependiendo de su duración.
- Aplicar caché a resultados terminados, porque dejan de cambiar después de que
  el proveedor publica la información definitiva.
- Evitar registrar headers completos para no exponer `x-apisports-key`.

