# Firebase Data Inventory

_Generated 2026-08-19T19:22:32.340Z from project `deportix-api-dac8e` — read-only sample of up to 15 docs/collection._

> Sanitized: field names + inferred types + truncated examples only. No full documents, no secrets.

## Collections

| Collection | Documents | Fields | Internal |
| --- | ---: | ---: | :---: |
| `f1_circuits` | 37 | 7 |  |
| `f1_competitions` | 39 | 5 |  |
| `f1_drivers` | 75 | 6 |  |
| `f1_race_rankings` | 6136 | 11 |  |
| `f1_races` | 2404 | 13 |  |
| `f1_rankings` | 335 | 9 |  |
| `f1_team_rankings` | 156 | 7 |  |
| `f1_teams` | 20 | 6 |  |

### `f1_circuits`

- Documents: **37** (sampled 15)
- Sample ids: `077f4768-a329-47ce-b2d2-1c9aab27e0f4`, `08fdeb19-4990-4294-98ce-736c75ac1be4`, `0cf1f74b-a6c7-42ea-b54e-a0d790cce80e`, `18709598-78f3-433a-9dfd-9cade384cfae`, `19c7f3f7-cb2e-4f7a-9932-d26497ec7b68`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `country` | string | — | Turkey |
| `created_at` | date-string | — | 2026-06-19T04:51:54.165Z |
| `external_id` | string | relation | 28 |
| `id` | string | relation | 077f4768-a329-47ce-b2d2-1c9aab27e0f4 |
| `image` | string | — | https://media.api-sports.io/formula-1/circuits/28.png |
| `name` | string | — | Intercity Istanbul Park |
| `updated_at` | date-string | — | 2026-06-19T05:07:03.703Z |

### `f1_competitions`

- Documents: **39** (sampled 15)
- Sample ids: `03f5ac88-18ed-47c3-9f2b-81b9649ee88b`, `07e018c5-4792-4c5c-9bf0-649953f55d1e`, `0d76683b-9997-480b-818b-a3d1880ff480`, `145c9480-2876-422b-a150-f4b9d4450fc3`, `1a68a421-a477-4a0e-99ba-483b64214e87`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `created_at` | date-string | — | 2026-06-19T04:51:46.554Z |
| `external_id` | string | relation | 94 |
| `id` | string | relation | 03f5ac88-18ed-47c3-9f2b-81b9649ee88b |
| `name` | string | — | GP of Malaysia |
| `updated_at` | date-string | — | 2026-06-19T05:01:27.428Z |

### `f1_drivers`

- Documents: **75** (sampled 15)
- Sample ids: `02ca7a5b-667f-40f3-b47b-c3c0d24494e6`, `05d1efec-c734-43f8-b60c-cdcf31c771ae`, `08415bbc-138c-4782-9d0c-c20c75544a24`, `095ce527-efc1-481a-b5fb-a5f490688008`, `0dd98183-7bc1-4337-8c83-9bf1e41b773f`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `created_at` | date-string | — | 2026-06-19T04:54:21.722Z |
| `external_id` | string | relation | 97 |
| `id` | string | relation | 02ca7a5b-667f-40f3-b47b-c3c0d24494e6 |
| `name` | string | — | Oscar Piastri |
| `number` | number | — | 81 |
| `team_id` | string | relation | 805a8d71-8816-4cf2-8b66-e5fadac5660f |

### `f1_race_rankings`

- Documents: **6136** (sampled 15)
- Sample ids: `00065aa1-3013-4ef1-89e4-b392af85ea5f`, `0012ccbd-d363-4320-a013-4ad543714464`, `00249282-9fef-49de-9e99-c59550437958`, `002da42e-f721-4ba2-a543-cc29d02c70a3`, `003719a0-8c91-455f-add8-b9e9787ebdde`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `created_at` | date-string | — | 2026-06-19T05:24:58.879Z |
| `driver_id` | string | relation | 4180d7cb-a84a-447e-8574-a063bffd208a |
| `external_id` | string | relation | 785-19 |
| `gap` | null | nullable | null |
| `grid` | string | — | 3 |
| `id` | string | relation | 00065aa1-3013-4ef1-89e4-b392af85ea5f |
| `laps` | number | — | 59 |
| `pits` | number | — | 2 |
| `position` | number | — | 1 |
| `race_id` | string | relation | 35aaf347-cbcd-4469-b0ed-87b15ffcbd80 |
| `time` | string | — | 2:00:26.144 |

### `f1_races`

- Documents: **2404** (sampled 15)
- Sample ids: `000955f1-a02e-46e0-bcf8-aed756d5dc2f`, `002414fb-567c-40ef-bbb4-6fc8a65276bd`, `0026d00f-5ef9-46f6-9bdc-8490dff39e3b`, `003b3b0a-0f73-41f5-82c3-49f1ed701616`, `0042d207-53ec-497b-9ebc-a5c5d22f0754`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `circuit_id` | string | relation | b7489610-5bd9-44d6-837e-8069750a9ad4 |
| `competition_id` | string | relation | eb8383b1-ca57-4141-9fde-162165b1625e |
| `created_at` | date-string | — | 2026-06-19T05:10:59.013Z |
| `distance` | string \| null | nullable | 306.3 Kms |
| `external_id` | string | relation | 1942 |
| `id` | string | relation | 000955f1-a02e-46e0-bcf8-aed756d5dc2f |
| `laps_current` | null | nullable | null |
| `laps_total` | number \| null | nullable | 62 |
| `race_date` | date-string | — | 2024-09-22T12:00:00.000Z |
| `season` | number | — | 2024 |
| `status` | string | — | Completed |
| `timezone` | string | — | utc |
| `type` | string | — | Race |

### `f1_rankings`

- Documents: **335** (sampled 15)
- Sample ids: `01731e52-2b68-4702-beb9-4ee760747fd4`, `0262558d-1ee0-4868-8636-7165da81b9c0`, `02e11b47-0007-4f73-9545-d9a400c20214`, `04c8a63b-293a-4f93-a46b-e5d19b961e8d`, `050069ed-8eb0-408c-ad46-b454f973afab`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `behind` | number | — | 421 |
| `created_at` | date-string | — | 2026-06-19T05:17:02.673Z |
| `driver_id` | string | relation | 253c55e9-ff82-4a66-9a9d-99fc3e619aa1 |
| `external_id` | string | relation | 2024-2 |
| `id` | string | relation | 01731e52-2b68-4702-beb9-4ee760747fd4 |
| `points` | number \| null | nullable | 16 |
| `position` | number | — | 15 |
| `season` | number | — | 2024 |
| `wins` | number | — | 0 |

### `f1_team_rankings`

- Documents: **156** (sampled 15)
- Sample ids: `01143b6f-76b1-471a-81de-9918e8dddaa8`, `019dcb28-ca47-461e-acc3-2010eff990c2`, `01fce8da-8ae5-4cad-938a-668f96110ce2`, `04b6852d-7847-4534-b6b6-ec75cf5a6356`, `062c2a48-391b-4658-bebe-58135a73dcd3`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `created_at` | date-string | — | 2026-06-19T05:16:37.111Z |
| `external_id` | string | relation | 2021-18 |
| `id` | string | relation | 01143b6f-76b1-471a-81de-9918e8dddaa8 |
| `points` | number | — | 13 |
| `position` | number | — | 9 |
| `season` | number | — | 2021 |
| `team_id` | string | relation | cd080878-377d-4819-9497-20448fb009cb |

### `f1_teams`

- Documents: **20** (sampled 15)
- Sample ids: `1224a122-3288-4f32-9dc3-d4ac8c409f2c`, `1927986e-3fbe-44a4-8683-99443ebde90f`, `389796a8-4971-4c06-a341-d5ce44610e7a`, `3c15b03c-b3dd-4535-9955-ae86650a6f0f`, `44f055b0-57a0-4e1b-b19f-351b2b17af17`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `created_at` | date-string | — | 2026-06-19T04:52:07.011Z |
| `external_id` | string | relation | 13 |
| `id` | string | relation | 1224a122-3288-4f32-9dc3-d4ac8c409f2c |
| `logo` | string | — | https://media.api-sports.io/formula-1/teams/13.png |
| `name` | string | — | Alpine F1 Team |
| `updated_at` | date-string | — | 2026-06-19T04:53:55.056Z |
