# Firebase Data Inventory

_Generated 2026-06-30T01:58:36.464Z from project `deportix-api-dac8e` — read-only sample of up to 3 docs/collection._

> Sanitized: field names + inferred types + truncated examples only. No full documents, no secrets.

## Collections

| Collection | Documents | Fields | Internal |
| --- | ---: | ---: | :---: |
| `leagues` | 1230 | 10 |  |
| `soccer_teams` | 15386 | 7 |  |

### `leagues`

- Documents: **1230** (sampled 3)
- Sample ids: `004a2310-c508-4bbd-84f8-7073fdcc6ad8`, `0063639b-bfb8-44f8-952f-d1449ee1ac01`, `00ef2a40-638a-4207-b7b1-f3152f1d2d6a`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `_sources` | object | — | { league_logo } |
| `country_id` | string | relation | 2fad2a75-5e68-424b-9918-8cfdcb50af7c |
| `created_at` | date-string | — | 2026-06-04T23:07:52.787Z |
| `external_id` | string | relation | 179 |
| `id` | string | relation | 004a2310-c508-4bbd-84f8-7073fdcc6ad8 |
| `logo` | string | — | https://firebasestorage.googleapis.com/v0/b/deportix-api-… |
| `name` | string | — | Premiership |
| `sport_id` | string | relation | cdce9b99-4e5c-493d-b79c-6c60439bd604 |
| `type` | string | — | League |
| `updated_at` | date-string | — | 2026-06-05T20:52:39.557Z |

### `soccer_teams`

- Documents: **15386** (sampled 3)
- Sample ids: `0007768c-1bd1-478a-ae74-1ff8d1e5ac7c`, `0007da34-5394-47b9-a5f3-303a4cd06605`, `00083378-c497-4e89-b7c8-a12f2ef3a4c9`

| Field | Type(s) | Flags | Example |
| --- | --- | --- | --- |
| `_sources` | object | — | { team_logo, venue_image } |
| `created_at` | date-string | — | 2026-06-05T09:55:41.791Z |
| `external_id` | string | relation | 12354 |
| `id` | string | relation | 0007768c-1bd1-478a-ae74-1ff8d1e5ac7c |
| `league_id` | string | relation | 3205b253-eccf-4549-8158-6bb2b87c4da1 |
| `team` | object | — | { id, name, code, country, founded, national, … } |
| `venue` | object | — | { id, name, address, city, capacity, surface, … } |
