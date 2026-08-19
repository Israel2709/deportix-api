# Firebase Data Inventory

_Generated 2026-08-01T04:35:38.484Z from project `deportix-api-dac8e` — read-only sample of up to 15 docs/collection._

> Sanitized: field names + inferred types + truncated examples only. No full documents, no secrets.

## Collections

| Collection | Documents | Fields | Internal |
| --- | ---: | ---: | :---: |
| `countries` | 169 | 8 |  |
| `f1_circuits` | 37 | 7 |  |
| `f1_drivers` | 75 | 6 |  |
| `f1_races` | 2404 | 13 |  |
| `f1_rankings` | 335 | 9 |  |
| `f1_teams` | 20 | 6 |  |
| `leagues` | 1231 | 10 |  |
| `seasons` | 8215 | 9 |  |
| `sports` | 3 | 6 |  |

### `countries`

- Documents: **169** (sampled 15)
- Sample ids: `02d9323a-bc77-4f5e-9074-4339d81aa8a3`, `0325db00-063d-49ca-a9a3-e0390b7eda42`, `037cedac-604f-474f-adb6-eceb7fd88fc4`, `05a42909-25cd-4939-9536-a519d448e358`, `09b3d74b-7266-4078-8691-d574cb7e82ac`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `_sources` | object | — | { flag } |
| `code` | string | — | CO |
| `created_at` | date-string | — | 2026-06-04T23:03:05.954Z |
| `external_id` | string | relation | CO |
| `flag` | string | — | https://firebasestorage.googleapis.com/v0/b/deportix-api-… |
| `id` | string | relation | 02d9323a-bc77-4f5e-9074-4339d81aa8a3 |
| `name` | string | — | Colombia |
| `updated_at` | date-string | — | 2026-06-05T20:57:38.287Z |

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

### `leagues`

- Documents: **1231** (sampled 15)
- Sample ids: `004a2310-c508-4bbd-84f8-7073fdcc6ad8`, `0063639b-bfb8-44f8-952f-d1449ee1ac01`, `00ef2a40-638a-4207-b7b1-f3152f1d2d6a`, `017ff12e-9de1-44ab-83fd-5fb38ef29b02`, `01a438f8-e45c-4986-8d61-670f4fcaf4f8`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `_sources` | object | — | { league_logo } |
| `country_id` | string \| null | relation, nullable | 2fad2a75-5e68-424b-9918-8cfdcb50af7c |
| `created_at` | date-string | — | 2026-06-04T23:07:52.787Z |
| `external_id` | string | relation | 179 |
| `id` | string | relation | 004a2310-c508-4bbd-84f8-7073fdcc6ad8 |
| `logo` | string | — | https://firebasestorage.googleapis.com/v0/b/deportix-api-… |
| `name` | string | — | Premiership |
| `sport_id` | string | relation | cdce9b99-4e5c-493d-b79c-6c60439bd604 |
| `type` | string | — | League |
| `updated_at` | date-string | — | 2026-06-05T20:52:39.557Z |

### `seasons`

- Documents: **8215** (sampled 15)
- Sample ids: `0003a291-f46b-422d-b2ca-27ee6f031d4c`, `00067b23-5a45-4e50-b6e4-1b85ceef8e63`, `002d54fe-f7bd-4de9-862a-78fad6d01162`, `003d3799-f7db-45a7-973a-aed11683e4e3`, `0041f00b-e26d-4975-95f2-1e1d9c3c0ee3`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `created_at` | date-string | — | 2026-06-04T23:11:27.352Z |
| `current` | boolean | — | false |
| `end_date` | date-string | — | 2013-11-09T00:00:00.000Z |
| `external_id` | string | relation | 329-2013 |
| `id` | string | relation | 0003a291-f46b-422d-b2ca-27ee6f031d4c |
| `league_id` | string | relation | 3119d682-0185-4e8d-b767-fc6abc8f9b85 |
| `start_date` | date-string | — | 2013-03-02T00:00:00.000Z |
| `updated_at` | date-string | — | 2026-06-05T22:50:50.129Z |
| `year` | number | — | 2013 |

### `sports`

- Documents: **3** (sampled 3)
- Sample ids: `9590fe3b-8c93-491c-965d-d5510d55f7f4`, `cdce9b99-4e5c-493d-b79c-6c60439bd604`, `ec2c0620-7616-427d-a8f6-80aa0fa25517`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `created_at` | date-string | — | 2026-06-04T23:02:55.117Z |
| `id` | string | relation | 9590fe3b-8c93-491c-965d-d5510d55f7f4 |
| `logo` | null | nullable | null |
| `name` | string | — | NFL |
| `slug` | string | — | american-football |
| `updated_at` | date-string | — | 2026-06-05T01:08:54.965Z |
