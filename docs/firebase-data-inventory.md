# Firebase Data Inventory

_Generated 2026-06-23T22:10:56.826Z from project `deportix-api-dac8e` — read-only sample of up to 15 docs/collection._

> Sanitized: field names + inferred types + truncated examples only. No full documents, no secrets.

## Collections

| Collection | Documents | Fields | Internal |
| --- | ---: | ---: | :---: |
| `countries` | 169 | 8 |  |
| `f1_circuits` | 37 | 7 |  |
| `f1_competitions` | 39 | 5 |  |
| `f1_drivers` | 75 | 6 |  |
| `f1_race_rankings` | 6136 | 11 |  |
| `f1_races` | 2404 | 13 |  |
| `f1_rankings` | 335 | 9 |  |
| `f1_team_rankings` | 156 | 7 |  |
| `f1_teams` | 20 | 6 |  |
| `leagues` | 1230 | 10 |  |
| `seasons` | 8213 | 9 |  |
| `soccer_matches` | 70408 | 16 |  |
| `soccer_rounds` | 176599 | 7 |  |
| `soccer_standings` | 4153 | 12 |  |
| `soccer_teams` | 15386 | 8 |  |
| `sports` | 3 | 6 |  |
| `ingestion_state` | 1 | 5 | yes |
| `sync_logs` | 528 | 10 | yes |

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

### `leagues`

- Documents: **1230** (sampled 15)
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

- Documents: **8213** (sampled 15)
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

### `soccer_matches`

- Documents: **70408** (sampled 15)
- Sample ids: `0000d716-534a-4294-8869-4040446e3687`, `000100b8-ed1e-4128-9325-ff5b131783cd`, `0003da34-1efd-449a-a507-690d900b490c`, `00051699-cb2d-4209-b8fc-1a0185e845f1`, `00051e74-139a-441e-95c2-a51f221b6a75`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `away_team_id` | string | relation | 866076ca-a5e6-4edd-af71-26285b48e1e1 |
| `created_at` | date-string | — | 2026-06-05T00:58:43.836Z |
| `external_id` | string | relation | 1044888 |
| `fixture` | object | — | { id, referee, timezone, date, timestamp, periods, … } |
| `fixture_date` | date-string | — | 2023-08-13T13:00:00.000Z |
| `goals` | object | — | { home, away } |
| `home_team_id` | string | relation | 8feb422a-1000-4e51-b308-c1517347098d |
| `id` | string | relation | 0000d716-534a-4294-8869-4040446e3687 |
| `league` | object | — | { id, name, country, logo, flag, season, … } |
| `league_id` | string | relation | 47bdf5fc-94ef-44c0-9a21-170be298711b |
| `score` | object | — | { halftime, fulltime, extratime, penalty } |
| `season_id` | string | relation | 3c7da237-b277-4936-a106-b26778ab20fd |
| `status` | string | — | FT |
| `teams` | object | — | { home, away } |
| `updated_at` | date-string | — | 2026-06-05T01:41:12.496Z |
| `venue` | string | — | Stade de la Mosson-Mondial 98 |

### `soccer_rounds`

- Documents: **176599** (sampled 15)
- Sample ids: `00013297-6c07-4f1c-a274-317909db62e9`, `000135c7-8160-4405-a2c7-afb04dbc8a11`, `0002338d-a836-4d87-b10c-67c59f6e3561`, `00024dfc-0b99-4102-a2d6-700fd136c5f1`, `0002d873-12f6-4048-b2ca-84bce9571470`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `created_at` | date-string | — | 2026-06-06T04:35:02.222Z |
| `external_id` | string | relation | 170-2022-r5 |
| `id` | string | relation | 00013297-6c07-4f1c-a274-317909db62e9 |
| `league_id` | string | relation | 59d7be7a-ecf7-4fb3-812d-6ab1648c4675 |
| `name` | string | — | Regular Season - 5 |
| `position` | number | — | 5 |
| `season_id` | string | relation | 39cb9c59-5a71-4283-bc7a-aa4f860ead7d |

### `soccer_standings`

- Documents: **4153** (sampled 15)
- Sample ids: `000777f3-196b-4591-80bd-dad5fc43e067`, `001f04b4-8502-46d9-a77b-be66f5f4a60b`, `00283695-c2ed-43db-987d-f476d9bc99a8`, `002e164c-2852-4b12-83d0-6ceda4cf073e`, `002f052e-5188-4285-a5cb-57dd6f2c9c28`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `created_at` | date-string | — | 2026-06-17T03:37:18.681Z |
| `draws` | number | — | 0 |
| `external_id` | string | relation | 313-2018-3346 |
| `id` | string | relation | 000777f3-196b-4591-80bd-dad5fc43e067 |
| `league_id` | string | relation | 9eac6dc0-284c-403b-8b2f-09268cc5dc13 |
| `losses` | number | — | 3 |
| `played` | number | — | 18 |
| `points` | number | — | 45 |
| `season_id` | string | relation | 1c4eb83a-2541-43d6-a478-ef38f755e3c3 |
| `team_id` | string | relation | 8634fb90-d6f1-4d7e-8557-66801800ce39 |
| `updated_at` | date-string | — | 2026-06-17T03:37:20.360Z |
| `wins` | number | — | 15 |

### `soccer_teams`

- Documents: **15386** (sampled 15)
- Sample ids: `0007768c-1bd1-478a-ae74-1ff8d1e5ac7c`, `0007da34-5394-47b9-a5f3-303a4cd06605`, `00083378-c497-4e89-b7c8-a12f2ef3a4c9`, `001a9d91-3bd9-487d-967f-aae2940dccff`, `00220bcd-5468-45e4-9ab5-3077d65ae02d`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `_sources` | object | — | { team_logo, venue_image } |
| `created_at` | date-string | — | 2026-06-05T09:55:41.791Z |
| `external_id` | string | relation | 12354 |
| `id` | string | relation | 0007768c-1bd1-478a-ae74-1ff8d1e5ac7c |
| `league_id` | string | relation | 3205b253-eccf-4549-8158-6bb2b87c4da1 |
| `team` | object | — | { id, name, code, country, founded, national, … } |
| `updated_at` | date-string | — | 2026-06-05T11:51:09.505Z |
| `venue` | object | — | { id, name, address, city, capacity, surface, … } |

### `sports`

- Documents: **3** (sampled 3)
- Sample ids: `9590fe3b-8c93-491c-965d-d5510d55f7f4`, `cdce9b99-4e5c-493d-b79c-6c60439bd604`, `ec2c0620-7616-427d-a8f6-80aa0fa25517`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `created_at` | date-string | — | 2026-06-04T23:02:55.117Z |
| `id` | string | relation | 9590fe3b-8c93-491c-965d-d5510d55f7f4 |
| `logo` | null | nullable | null |
| `name` | string | — | NFL |
| `slug` | string | — | nfl |
| `updated_at` | date-string | — | 2026-06-05T01:08:54.965Z |

### `ingestion_state` _(internal — never exposed publicly)_

- Documents: **1** (sampled 1)
- Sample ids: `f1`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `league_external_id` | null | relation, nullable | null |
| `season_year` | number | — | 2026 |
| `sport` | string | — | f1 |
| `step` | string | — | season |
| `updated_at` | date-string | — | 2026-06-19T05:13:18.519Z |

### `sync_logs` _(internal — never exposed publicly)_

- Documents: **528** (sampled 15)
- Sample ids: `000749f2-d9ac-4bfb-bdfc-7f801a0f9b17`, `00621ba0-f74e-44c9-940e-578a83c2b103`, `0076d8a6-3df3-4e86-b829-edd808746d16`, `01a59218-380f-4ebe-b491-e8dd9e0a1923`, `01d3e67c-ed10-408b-8c82-1b46a4a77be3`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `duration_ms` | number | — | 253 |
| `endpoint` | string | — | GET /standings?league=312&season=2022 |
| `errors` | array | — | [0 item(s)] |
| `finished_at` | date-string | — | 2026-06-17T03:09:18.187Z |
| `id` | string | relation | 000749f2-d9ac-4bfb-bdfc-7f801a0f9b17 |
| `inserted` | number | — | 0 |
| `processed` | number | — | 1 |
| `sport` | string | — | soccer |
| `started_at` | date-string | — | 2026-06-17T03:09:17.934Z |
| `updated` | number | — | 0 |
