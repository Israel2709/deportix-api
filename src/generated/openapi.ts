/* AUTO-GENERATED from openapi/openapi.yaml by scripts/build-openapi.ts. Do not edit by hand. */
export const openapiDocument = {
  "openapi": "3.1.0",
  "info": {
    "title": "Deportix API",
    "description": "**Deportix API** is a public sports-data API powered by Cloud Firestore.\n\nIt exposes three complementary surfaces:\n\n**Deportix API** (`/v1/*`) — versioned REST with `{ data, meta }` envelope. Used by the\nDeportix portal and internal tooling. Supports match management (POST / PATCH / DELETE).\n\n**BFF — API-Sports soccer** (`/countries`, `/leagues`, `/fixtures`, …) — read-only\nendpoints that mirror API-Sports Football v3 paths and response shape\n(`{ response, results, errors }`). Intended for the Flutter soccer app.\n\n**BFF American Football** (`/american-football/*`) — American Football BFF with the **full**\nenvelope (`get`, `parameters`, `errors`, `results`, `paging`, `response`). Supports GET and\nCRUD (POST / PATCH / DELETE) for manual data loading from the Deportix portal.\n**Canonical IDs:** server-generated UUIDs (Firestore document ids) are returned in `response[]`.\nPOST bodies must **not** include resource ids; reference existing entities by UUID in nested\n`league.id`, `team.id`, etc. Legacy api-sports numeric ids are accepted only as a read lookup\nfallback on PATCH/DELETE query params until old data is gone.\n\n**BFF Formula 1** (`/formula-1/*`) — Formula 1 BFF (api-sports Formula-1 shaped) with the same\nfull envelope. Maps F1 Firestore collections (`f1_competitions`, `f1_circuits`, `f1_drivers`,\n`f1_teams`, `f1_races`, `f1_rankings`, `f1_team_rankings`, `f1_race_rankings`) to competitions,\ncircuits, drivers (participants), teams, races (calendar/events), and rankings (results /\nchampionship standings). Not served by generic `/v1` league/team/match routes.\n\n**BFF Tennis** (`/tennis/*`) — Tennis-native BFF for App QD (quiniela) and the Deportix\nbackoffice. Full envelope. Models tournament editions, Main Draw rounds, players, entries,\nmatches and an explicit bracket graph. Draft vs published: list endpoints default to\n`published=true` (App QD). Use `published=all` in the backoffice. Not served by generic `/v1`\nleague/team/match routes. Scope v1: Grand Slam / ATP 1000 / WTA 1000, singles only.\n\n## MVP notes & limitations\n- **Mostly read-only.** All list/get endpoints use `GET`. Match management is available via\n  `POST /v1/leagues/{leagueId}/matches` (create — defaults to current season, or target any\n  season via `?season=` / body `seasonId`),\n  `PATCH /v1/leagues/{leagueId}/matches/{matchId}` (partial update) and\n  `DELETE /v1/leagues/{leagueId}/matches/{matchId}` (permanent removal). Authentication\n  and rate limiting are not enforced yet; access is restricted operationally to authorized\n  platform users.\n- **Partial coverage is expected.** The platform is fed manually. Some resources may be\n  empty or incomplete. Use `GET /v1/data-status` to discover exactly what is available.\n- **American football coverage is partial and evolving** as data is loaded; some sub-resources may\n  return empty collections or be unavailable.\n- **Liga MX — Apertura 2026** starts in July 2026; depending on load progress, matches\n  and standings may not yet exist even when teams do.\n- **CORS is open** (`Access-Control-Allow-Origin: *`) on read endpoints. CORS is not a\n  security mechanism for a public API; it only governs browser reads.\n- **Dates** are ISO-8601 and interpreted in **UTC**.\n\n## Identifiers\nPath identifiers (`leagueId`, `teamId`) are the resource's stable id as returned by the\nAPI. The external provider id is also accepted as a fallback lookup.\n",
    "version": "1.0.0",
    "contact": {
      "name": "Deportix API"
    },
    "license": {
      "name": "Proprietary"
    }
  },
  "servers": [
    {
      "url": "/",
      "description": "Same-origin (relative) — works in every environment"
    },
    {
      "url": "https://deportix-api.vercel.app",
      "description": "Production (placeholder — replace with the real deployment URL)"
    }
  ],
  "tags": [
    {
      "name": "Meta",
      "description": "Service metadata and data coverage"
    },
    {
      "name": "Catalog",
      "description": "Sports and leagues catalog"
    },
    {
      "name": "Leagues",
      "description": "League resources and their sub-resources"
    },
    {
      "name": "Teams",
      "description": "Team resources"
    },
    {
      "name": "BFF",
      "description": "API-Sports compatible layer for soccer (Flutter). Returns `{ response, results, errors }`.\nLeague/team/fixture ids in query params use provider `externalId` values (e.g. `262` for Liga MX).\n"
    },
    {
      "name": "bff-american-football",
      "description": "**BFF American Football** — API-Sports American Football v1 compatibility under `/american-football/*`.\nReturns the full api-sports envelope (`get`, `parameters`, `errors`, `results`, `paging`, `response`).\nSupports CRUD for portal data loading. Swagger deep link — `/docs?tag=bff-american-football`.\n"
    },
    {
      "name": "bff-formula-1",
      "description": "**BFF Formula 1** — Formula 1 BFF under `/formula-1/*` (api-sports Formula-1 shape). Full envelope\n(`get`, `parameters`, `errors`, `results`, `paging`, `response`). Sport slug `f1`.\nCompetitions ≈ Grand Prix events; races ≈ calendar sessions; rankings ≈ results / standings.\nSwagger deep link — `/docs?tag=bff-formula-1`.\n"
    },
    {
      "name": "bff-tennis",
      "description": "**BFF Tennis** — Tennis-native BFF under `/tennis/*` for App QD and the Deportix backoffice.\nFull envelope (`get`, `parameters`, `errors`, `results`, `paging`, `response`). Sport slug `tennis`.\nTournaments are editions (e.g. US Open 2026 Men's Singles). Matches carry the bracket graph\n(`competitor1SourceMatchId`, `winnerToMatchId`, …). BYE is an entry type, not a fake match.\nSwagger deep link — `/docs?tag=bff-tennis`.\n"
    }
  ],
  "paths": {
    "/v1/health": {
      "get": {
        "tags": [
          "Meta"
        ],
        "summary": "Health check",
        "description": "Liveness probe. Reports API version and whether the data source is configured. Does not query Firestore.",
        "operationId": "getHealth",
        "responses": {
          "200": {
            "description": "Service is up.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HealthResource"
                },
                "example": {
                  "data": {
                    "status": "ok",
                    "apiVersion": "v1",
                    "dataSourceConfigured": true,
                    "storageConfigured": true,
                    "timestamp": "2026-06-23T00:00:00.000Z"
                  },
                  "meta": {
                    "apiVersion": "v1",
                    "updatedAt": "2026-06-23T00:00:00.000Z"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/uploads": {
      "post": {
        "tags": [
          "Meta"
        ],
        "summary": "Upload image to Firebase Storage",
        "description": "Accepts `multipart/form-data` with an image file. Returns a public Firebase Storage URL\nfor league/team logos and country flags (used by the Deportix portal).\n",
        "operationId": "uploadImage",
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "required": [
                  "file"
                ],
                "properties": {
                  "file": {
                    "type": "string",
                    "format": "binary",
                    "description": "PNG, JPEG, WebP, or SVG (max 5 MB)."
                  },
                  "purpose": {
                    "type": "string",
                    "enum": [
                      "logo",
                      "alt_logo",
                      "flag",
                      "league_logo",
                      "team_logo",
                      "asset"
                    ],
                    "default": "asset"
                  },
                  "entityId": {
                    "type": "string",
                    "description": "Optional id used in the storage path (league id, team id, etc.)."
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Image uploaded.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UploadResource"
                },
                "example": {
                  "data": {
                    "url": "https://firebasestorage.googleapis.com/v0/b/deportix.appspot.com/o/uploads%2Fleague_logo%2F1%2F1730000000000-abc.png?alt=media"
                  },
                  "meta": {
                    "apiVersion": "v1",
                    "updatedAt": "2026-06-23T00:00:00.000Z"
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/InvalidRequestBody"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/v1/data-status": {
      "get": {
        "tags": [
          "Meta"
        ],
        "summary": "Data coverage status",
        "description": "Per-league coverage derived from real document counts in Firestore. Key endpoint of\nthe MVP: lets consumers discover what data exists before building UI around it.\n",
        "operationId": "getDataStatus",
        "responses": {
          "200": {
            "description": "Coverage summary.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DataStatusResource"
                },
                "example": {
                  "data": {
                    "leagues": [
                      {
                        "id": "8f1c...e2",
                        "externalId": "262",
                        "name": "Liga MX",
                        "sport": "soccer",
                        "availableSeasons": [
                          2026
                        ],
                        "coverage": {
                          "teams": true,
                          "matches": true,
                          "standings": false,
                          "statistics": false
                        },
                        "updatedAt": "2026-06-23T00:00:00.000Z"
                      },
                      {
                        "id": "a91d...77",
                        "externalId": "1",
                        "name": "NFL",
                        "sport": "american-football",
                        "availableSeasons": [],
                        "coverage": {
                          "teams": true,
                          "matches": false,
                          "standings": false,
                          "statistics": false
                        },
                        "updatedAt": "2026-06-23T00:00:00.000Z"
                      }
                    ],
                    "sports": [
                      {
                        "id": "cdce9b99",
                        "slug": "soccer",
                        "name": "Soccer",
                        "leagueCount": 1230,
                        "coverage": {
                          "teams": true,
                          "matches": true,
                          "standings": true,
                          "statistics": false
                        }
                      },
                      {
                        "id": "9590fe3b",
                        "slug": "american-football",
                        "name": "American Football",
                        "leagueCount": 0,
                        "coverage": {
                          "teams": false,
                          "matches": false,
                          "standings": false,
                          "statistics": false
                        }
                      }
                    ]
                  },
                  "meta": {
                    "apiVersion": "v1",
                    "updatedAt": "2026-06-23T00:00:00.000Z"
                  }
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/v1/sports": {
      "get": {
        "tags": [
          "Catalog"
        ],
        "summary": "List sports",
        "operationId": "listSports",
        "parameters": [
          {
            "$ref": "#/components/parameters/page"
          },
          {
            "$ref": "#/components/parameters/pageSize"
          }
        ],
        "responses": {
          "200": {
            "description": "A page of sports.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SportCollection"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/v1/countries": {
      "get": {
        "tags": [
          "Catalog"
        ],
        "summary": "List countries (global catalog)",
        "description": "Shared country catalog for all sports. Backed by the Firestore `countries` collection.\nSame data as BFF `/countries` and `/american-football/countries`.\n",
        "operationId": "listCatalogCountries",
        "parameters": [
          {
            "$ref": "#/components/parameters/page"
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 250,
              "maximum": 500
            }
          },
          {
            "name": "name",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "code",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Paginated country catalog.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CountryCollection"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "Catalog"
        ],
        "summary": "Create country",
        "operationId": "createCatalogCountry",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CatalogCountry"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Country created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CountryResource"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/InvalidRequestBody"
          }
        }
      },
      "patch": {
        "tags": [
          "Catalog"
        ],
        "summary": "Update country",
        "operationId": "updateCatalogCountry",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "code",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CatalogCountry"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Country updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CountryResource"
                }
              }
            }
          },
          "404": {
            "$ref": "#/components/responses/ResourceNotFound"
          }
        }
      },
      "delete": {
        "tags": [
          "Catalog"
        ],
        "summary": "Delete country",
        "operationId": "deleteCatalogCountry",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "code",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Country deleted."
          },
          "404": {
            "$ref": "#/components/responses/ResourceNotFound"
          }
        }
      }
    },
    "/v1/league-types": {
      "get": {
        "tags": [
          "Catalog"
        ],
        "summary": "List league types (global catalog)",
        "description": "Shared league type catalog for all sports. Backed by the Firestore `league_types` collection.\nValues match api-sports `league.type` (e.g. `league`, `cup`).\n",
        "operationId": "listCatalogLeagueTypes",
        "parameters": [
          {
            "$ref": "#/components/parameters/page"
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 50,
              "maximum": 100
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Paginated league type catalog.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LeagueTypeCollection"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/v1/game-stages": {
      "get": {
        "tags": [
          "Catalog"
        ],
        "summary": "List game stages (American Football catalog)",
        "description": "Shared game stage catalog for American Football BFF. Backed by the Firestore `game_stages` collection.\nValues match api-sports American Football v1 `game.stage` (e.g. `Regular Season`, `Wild Card`).\n",
        "operationId": "listCatalogGameStages",
        "parameters": [
          {
            "$ref": "#/components/parameters/page"
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 50,
              "maximum": 100
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Paginated game stage catalog.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GameStageCollection"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/v1/leagues": {
      "get": {
        "tags": [
          "Catalog",
          "Leagues"
        ],
        "summary": "List leagues",
        "operationId": "listLeagues",
        "parameters": [
          {
            "$ref": "#/components/parameters/page"
          },
          {
            "$ref": "#/components/parameters/pageSize"
          },
          {
            "name": "sport",
            "in": "query",
            "description": "Filter leagues by sport slug (e.g. `soccer`, `american-football`).",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "sort",
            "in": "query",
            "description": "Sort by `name` (default) or `name`/`-name`.",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "name",
                "-name"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "A page of leagues.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LeagueCollection"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/InvalidQueryParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/v1/leagues/{leagueId}": {
      "get": {
        "tags": [
          "Leagues"
        ],
        "summary": "Get a league",
        "operationId": "getLeague",
        "parameters": [
          {
            "$ref": "#/components/parameters/leagueId"
          }
        ],
        "responses": {
          "200": {
            "description": "The league.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LeagueResource"
                }
              }
            }
          },
          "404": {
            "$ref": "#/components/responses/ResourceNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/v1/leagues/{leagueId}/seasons": {
      "get": {
        "tags": [
          "Leagues"
        ],
        "summary": "List a league's seasons",
        "operationId": "listLeagueSeasons",
        "parameters": [
          {
            "$ref": "#/components/parameters/leagueId"
          },
          {
            "$ref": "#/components/parameters/page"
          },
          {
            "$ref": "#/components/parameters/pageSize"
          }
        ],
        "responses": {
          "200": {
            "description": "A page of seasons (may be empty).",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SeasonCollection"
                }
              }
            }
          },
          "404": {
            "$ref": "#/components/responses/ResourceNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/v1/leagues/{leagueId}/teams": {
      "get": {
        "tags": [
          "Leagues",
          "Teams"
        ],
        "summary": "List a league's teams",
        "operationId": "listLeagueTeams",
        "parameters": [
          {
            "$ref": "#/components/parameters/leagueId"
          },
          {
            "$ref": "#/components/parameters/page"
          },
          {
            "$ref": "#/components/parameters/pageSize"
          },
          {
            "name": "conference",
            "in": "query",
            "description": "NFL only — filter by conference (e.g. `AFC`, `NFC`).",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "division",
            "in": "query",
            "description": "NFL only — filter by division.",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "A page of teams (may be empty).",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TeamCollection"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/InvalidQueryParameter"
          },
          "404": {
            "$ref": "#/components/responses/ResourceNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/v1/leagues/{leagueId}/standings": {
      "get": {
        "tags": [
          "Leagues"
        ],
        "summary": "List a league's standings",
        "description": "Standings for a season. Defaults to the league's current season when `season` is omitted.",
        "operationId": "listLeagueStandings",
        "parameters": [
          {
            "$ref": "#/components/parameters/leagueId"
          },
          {
            "$ref": "#/components/parameters/season"
          }
        ],
        "responses": {
          "200": {
            "description": "Standings rows (may be empty when not yet loaded).",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/StandingCollection"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/InvalidQueryParameter"
          },
          "404": {
            "$ref": "#/components/responses/ResourceNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/v1/leagues/{leagueId}/matches": {
      "get": {
        "tags": [
          "Leagues"
        ],
        "summary": "List a league's matches",
        "operationId": "listLeagueMatches",
        "parameters": [
          {
            "$ref": "#/components/parameters/leagueId"
          },
          {
            "$ref": "#/components/parameters/page"
          },
          {
            "$ref": "#/components/parameters/pageSize"
          },
          {
            "$ref": "#/components/parameters/season"
          },
          {
            "$ref": "#/components/parameters/from"
          },
          {
            "$ref": "#/components/parameters/to"
          },
          {
            "$ref": "#/components/parameters/date"
          },
          {
            "$ref": "#/components/parameters/teamId"
          },
          {
            "$ref": "#/components/parameters/status"
          },
          {
            "name": "sort",
            "in": "query",
            "description": "Sort by match date. `date` ascending or `-date` descending (default `-date`).",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "date",
                "-date"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "A page of matches (may be empty).",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MatchCollection"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/InvalidQueryParameter"
          },
          "404": {
            "$ref": "#/components/responses/ResourceNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "Leagues"
        ],
        "summary": "Create a match",
        "description": "Creates a new match for the league. By default the match is assigned to the **current\nseason** (marked `current`, or the most recent one as fallback). To target another\nseason, pass `?season=` (year, e.g. `2025`) and/or body `seasonId` (document id or\nprovider `externalId`). When both are sent they must refer to the same season.\n\n`home.teamId` and `away.teamId` must refer to teams belonging to the league (API id or\nprovider `externalId`). Team names and logos are denormalized from the league roster when\nomitted in the body.\n\nReturns `201 Created` with the new match in the standard resource envelope.\n",
        "operationId": "createLeagueMatch",
        "parameters": [
          {
            "$ref": "#/components/parameters/leagueId"
          },
          {
            "$ref": "#/components/parameters/season"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/MatchCreate"
              },
              "example": {
                "date": "2026-11-08T21:00:00.000Z",
                "status": "NS",
                "round": "Clausura - 16",
                "venue": "Estadio Monumental",
                "home": {
                  "teamId": "tm_boca"
                },
                "away": {
                  "teamId": "tm_river"
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "The created match.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MatchResource"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/InvalidRequestBody"
          },
          "404": {
            "$ref": "#/components/responses/ResourceNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/v1/leagues/{leagueId}/matches/{matchId}": {
      "patch": {
        "tags": [
          "Leagues"
        ],
        "summary": "Update a league match",
        "description": "Partially updates a match belonging to the given league. Only the fields present in\nthe request body are modified; omitted fields are left unchanged.\n\nPath identifiers accept the API `id` or the provider `externalId`. The match must\nbelong to the league resolved from `{leagueId}`.\n\n**Soccer** denormalized fields (`fixture_date`, nested `goals`, `teams`, `league.round`,\netc.) are kept in sync when you update the corresponding public fields (`date`, `home.score`,\n`round`, …). **NFL** uses flat fields such as `game_date`, `home_score` and `away_score`.\n",
        "operationId": "updateLeagueMatch",
        "parameters": [
          {
            "$ref": "#/components/parameters/leagueId"
          },
          {
            "$ref": "#/components/parameters/matchIdPath"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/MatchUpdate"
              },
              "examples": {
                "updateScore": {
                  "summary": "Set final score (soccer)",
                  "value": {
                    "status": "FT",
                    "home": {
                      "score": 2
                    },
                    "away": {
                      "score": 1
                    }
                  }
                },
                "reschedule": {
                  "summary": "Change kick-off time",
                  "value": {
                    "date": "2026-11-08T22:00:00.000Z"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "The updated match.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MatchResource"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/InvalidRequestBody"
          },
          "404": {
            "$ref": "#/components/responses/ResourceNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "Leagues"
        ],
        "summary": "Delete a league match",
        "description": "Permanently removes a match from Firestore. The match must belong to the league\nresolved from `{leagueId}`. Path identifiers accept the API `id` or the provider\n`externalId`.\n\nReturns `204 No Content` on success (no response body).\n",
        "operationId": "deleteLeagueMatch",
        "parameters": [
          {
            "$ref": "#/components/parameters/leagueId"
          },
          {
            "$ref": "#/components/parameters/matchIdPath"
          }
        ],
        "responses": {
          "204": {
            "description": "Match deleted successfully."
          },
          "404": {
            "$ref": "#/components/responses/ResourceNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/v1/teams/{teamId}": {
      "get": {
        "tags": [
          "Teams"
        ],
        "summary": "Get a team",
        "operationId": "getTeam",
        "parameters": [
          {
            "$ref": "#/components/parameters/teamIdPath"
          }
        ],
        "responses": {
          "200": {
            "description": "The team.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TeamResource"
                }
              }
            }
          },
          "404": {
            "$ref": "#/components/responses/ResourceNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/v1/teams/{teamId}/matches": {
      "get": {
        "tags": [
          "Teams"
        ],
        "summary": "List a team's matches",
        "operationId": "listTeamMatches",
        "parameters": [
          {
            "$ref": "#/components/parameters/teamIdPath"
          },
          {
            "$ref": "#/components/parameters/page"
          },
          {
            "$ref": "#/components/parameters/pageSize"
          },
          {
            "$ref": "#/components/parameters/season"
          },
          {
            "$ref": "#/components/parameters/from"
          },
          {
            "$ref": "#/components/parameters/to"
          },
          {
            "$ref": "#/components/parameters/date"
          },
          {
            "$ref": "#/components/parameters/status"
          },
          {
            "name": "sort",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "date",
                "-date"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "A page of matches for the team (may be empty).",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MatchCollection"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/InvalidQueryParameter"
          },
          "404": {
            "$ref": "#/components/responses/ResourceNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/countries": {
      "get": {
        "tags": [
          "BFF"
        ],
        "summary": "List countries (API-Sports)",
        "description": "Soccer reference data. Filter by `name` (substring) or `code` (ISO, exact).",
        "operationId": "bffListCountries",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "code",
            "in": "query",
            "schema": {
              "type": "string",
              "example": "MX"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "API-Sports envelope with country objects.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSportsCountryList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BffInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/leagues": {
      "get": {
        "tags": [
          "BFF"
        ],
        "summary": "List leagues (API-Sports)",
        "description": "Soccer leagues with nested `seasons[]`. Filter by `id` (provider league id), `country`\n(name substring), `season` (year — league must have that season), or `current=true`.\n",
        "operationId": "bffListLeagues",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "description": "Provider league id (e.g. `262`).",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "country",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "season",
            "in": "query",
            "schema": {
              "type": "integer",
              "example": 2026
            }
          },
          {
            "name": "current",
            "in": "query",
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "API-Sports envelope with league, country, and seasons entries.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSportsLeagueList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BffInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/leagues/seasons": {
      "get": {
        "tags": [
          "BFF"
        ],
        "summary": "List global season years (API-Sports)",
        "description": "Distinct season years across all leagues in the platform.",
        "operationId": "bffListGlobalSeasons",
        "responses": {
          "200": {
            "description": "API-Sports envelope with an array of years (integers).",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSportsIntegerList"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/fixtures": {
      "get": {
        "tags": [
          "BFF"
        ],
        "summary": "List fixtures (API-Sports)",
        "description": "Soccer matches in API-Sports shape (`fixture`, `league`, `teams`, `goals`).\nRequires `league` and/or `team` (provider ids), or `id` / `ids` for direct lookup.\nSupports `season`, `date`, `from`/`to`, `round`, `status`, `last`, `next`, `live`.\n",
        "operationId": "bffListFixtures",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "ids",
            "in": "query",
            "description": "Hyphen-separated fixture ids (e.g. `1-2-3`).",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "live",
            "in": "query",
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "league",
            "in": "query",
            "description": "Provider league id (required unless `id`, `ids`, or `team` is set).",
            "schema": {
              "type": "string",
              "example": "262"
            }
          },
          {
            "name": "season",
            "in": "query",
            "schema": {
              "type": "integer",
              "example": 2026
            }
          },
          {
            "name": "team",
            "in": "query",
            "description": "Provider team id.",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "date",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "from",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "to",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "round",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string",
              "example": "NS"
            }
          },
          {
            "name": "venue",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "last",
            "in": "query",
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "next",
            "in": "query",
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "timezone",
            "in": "query",
            "description": "Accepted for compatibility; dates are stored in UTC.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "API-Sports envelope with fixture objects.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSportsFixtureList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BffInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/fixtures/rounds": {
      "get": {
        "tags": [
          "BFF"
        ],
        "summary": "List fixture rounds (API-Sports)",
        "description": "Round name strings for a league season. `league` and `season` are required.",
        "operationId": "bffListFixtureRounds",
        "parameters": [
          {
            "name": "league",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "example": "262"
            }
          },
          {
            "name": "season",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "example": 2026
            }
          },
          {
            "name": "current",
            "in": "query",
            "description": "When `season` is omitted, use the league's current season.",
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "API-Sports envelope with round name strings.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSportsStringList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BffInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/standings": {
      "get": {
        "tags": [
          "BFF"
        ],
        "summary": "List standings (API-Sports)",
        "description": "League standings table for a season. `league` and `season` are required.",
        "operationId": "bffListStandings",
        "parameters": [
          {
            "name": "league",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "example": "262"
            }
          },
          {
            "name": "season",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "example": 2026
            }
          }
        ],
        "responses": {
          "200": {
            "description": "API-Sports envelope with nested league.standings table objects.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSportsStandingsList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BffInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/american-football/timezone": {
      "get": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "List timezones",
        "description": "IANA timezone strings for the `games` endpoint. Seeds common defaults when the catalog is empty.",
        "operationId": "americanFootballListTimezones",
        "responses": {
          "200": {
            "description": "Full api-sports envelope with timezone strings in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsTimezoneList"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Add timezone",
        "operationId": "americanFootballCreateTimezone",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballTimezoneCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Timezone created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsTimezoneList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Rename timezone",
        "operationId": "americanFootballUpdateTimezone",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballTimezoneUpdateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Timezone updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsTimezoneList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Delete timezone",
        "operationId": "americanFootballDeleteTimezone",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballTimezoneDeleteBody"
              }
            }
          }
        },
        "responses": {
          "204": {
            "description": "Timezone deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/american-football/seasons": {
      "get": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "List NFL season years",
        "description": "Distinct season years across NFL leagues in the platform.",
        "operationId": "americanFootballListSeasons",
        "responses": {
          "200": {
            "description": "Full api-sports envelope with integer years in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsIntegerList"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Register season year",
        "description": "Creates a season document on the first NFL league when leagues already exist.",
        "operationId": "americanFootballCreateSeasonYear",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballSeasonYearBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Season year registered.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsIntegerList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Update season metadata",
        "description": "Updates start/end dates, current flag, and coverage for an existing season year on the league.",
        "operationId": "americanFootballUpdateSeasonYear",
        "parameters": [
          {
            "name": "league",
            "in": "query",
            "required": true,
            "description": "Canonical league UUID.",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballSeasonItem"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Season year updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsIntegerList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Delete season year",
        "description": "Removes all season documents matching the year across NFL leagues.",
        "operationId": "americanFootballDeleteSeasonYear",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballSeasonYearBody"
              }
            }
          }
        },
        "responses": {
          "204": {
            "description": "Season year deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/american-football/countries": {
      "get": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "List countries",
        "description": "Football v3 country shape (`{ name, code, flag }`). Filter by `name` substring.",
        "operationId": "americanFootballListCountries",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Full api-sports envelope with country objects in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsCountryList"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Create country",
        "operationId": "americanFootballCreateCountry",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballCountryItem"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Country created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsCountryList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Update country",
        "operationId": "americanFootballUpdateCountry",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "required": true,
            "description": "Country name key to update.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballCountryItem"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Country updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsCountryList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Delete country",
        "operationId": "americanFootballDeleteCountry",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Country deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/american-football/leagues": {
      "get": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "List NFL leagues",
        "description": "League entries with nested `seasons[]` and NFL-specific `coverage` objects.",
        "operationId": "americanFootballListLeagues",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "description": "Canonical league UUID (or legacy external id)",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "name",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "country_id",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "country",
            "in": "query",
            "description": "Country name substring",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "type",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "season",
            "in": "query",
            "description": "Filter leagues that include this season year",
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Full api-sports envelope with league entries in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsLeagueList"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Create NFL league",
        "description": "Creates the league and nested seasons. Body must not include `league.id` — the server assigns a UUID.",
        "operationId": "americanFootballCreateLeague",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballLeagueCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "League created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsLeagueList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Update NFL league",
        "operationId": "americanFootballUpdateLeague",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "description": "Canonical league UUID or legacy external id (deprecated).",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballLeagueCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "League updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsLeagueList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Delete NFL league",
        "operationId": "americanFootballDeleteLeague",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "League deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/american-football/games": {
      "get": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "List or lookup NFL games",
        "description": "Three query modes:\n- `league` + `season` (+ optional `timezone`) — games in a season\n- `id` — single game by canonical UUID (legacy external id accepted as fallback)\n- `league` + `season` + `team` — games for a team (UUIDs)\n",
        "operationId": "americanFootballListGames",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "description": "Game UUID",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "league",
            "in": "query",
            "description": "League UUID",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "season",
            "in": "query",
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "team",
            "in": "query",
            "description": "Team UUID",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "timezone",
            "in": "query",
            "description": "Accepted for api-sports compatibility; dates stored UTC",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Full api-sports envelope with game objects in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsGameList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Create NFL game",
        "description": "Body must not include `game.id`. `teams.*.id` and `league.id` must reference existing UUIDs.",
        "operationId": "americanFootballCreateGame",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballGameCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Game created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsGameList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/american-football/games/{gameId}": {
      "get": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Get NFL game by id",
        "operationId": "americanFootballGetGame",
        "parameters": [
          {
            "name": "gameId",
            "in": "path",
            "required": true,
            "description": "Game UUID or legacy external id (deprecated).",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Full api-sports envelope; use `response[0]` as the game detail.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsGameList"
                }
              }
            }
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Update NFL game",
        "description": "Default: merge partial fields into stored api-sports payload.\nPass `replace=true` to require a full `AmericanFootballGameCreateBody`.\n",
        "operationId": "americanFootballPatchGame",
        "parameters": [
          {
            "name": "gameId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "replace",
            "in": "query",
            "description": "When `true`, body must be a complete game object (without `game.id`).",
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballGameCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Game updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsGameList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Delete NFL game",
        "operationId": "americanFootballDeleteGame",
        "parameters": [
          {
            "name": "gameId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Game deleted."
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/american-football/teams": {
      "get": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "List NFL teams",
        "description": "Teams for a league and season. Both query params are required.",
        "operationId": "americanFootballListTeams",
        "parameters": [
          {
            "name": "league",
            "in": "query",
            "required": true,
            "description": "League UUID",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "season",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Full api-sports envelope with `{ id, name, logo }` team objects.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsTeamList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Create NFL team",
        "description": "Body must not include `id` — server assigns UUID. Query `league` is the league UUID.",
        "operationId": "americanFootballCreateTeam",
        "parameters": [
          {
            "name": "league",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballTeamCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Team created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsTeamList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Update NFL team",
        "operationId": "americanFootballUpdateTeam",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "description": "Team UUID or legacy external id (deprecated).",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballTeamCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Team updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsTeamList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Delete NFL team",
        "operationId": "americanFootballDeleteTeam",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Team deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/american-football/standings": {
      "get": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "List NFL standings",
        "description": "Standing rows for a league and season. Optional `conference` filter.",
        "operationId": "americanFootballListStandings",
        "parameters": [
          {
            "name": "league",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "season",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "conference",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Full api-sports envelope with standing rows in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsStandingList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Create standing row",
        "description": "Body must not include row `id`. `team.id` and `league.id` must be existing UUIDs.",
        "operationId": "americanFootballCreateStanding",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballStandingCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Standing row created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsStandingList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Update standing row",
        "operationId": "americanFootballUpdateStanding",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "description": "Standing row UUID.",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AmericanFootballStandingCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Standing row updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AmericanFootballApiSportsStandingList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-american-football"
        ],
        "summary": "Delete standing row",
        "operationId": "americanFootballDeleteStanding",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Standing row deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/formula-1/seasons": {
      "get": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "List F1 season years",
        "description": "Distinct season years present on `f1_races` (calendar source of truth).",
        "operationId": "formula1ListSeasons",
        "responses": {
          "200": {
            "description": "Full api-sports envelope with integer years in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsIntegerList"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/formula-1/competitions": {
      "get": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "List Grand Prix competitions",
        "operationId": "formula1ListCompetitions",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "name",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Competitions in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsCompetitionList"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Create competition",
        "operationId": "formula1CreateCompetition",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1CompetitionCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Competition created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsCompetitionList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Update competition",
        "operationId": "formula1UpdateCompetition",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1CompetitionCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Competition updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsCompetitionList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Delete competition",
        "operationId": "formula1DeleteCompetition",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Competition deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/formula-1/circuits": {
      "get": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "List circuits",
        "operationId": "formula1ListCircuits",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "name",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "country",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Circuits in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsCircuitList"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Create circuit",
        "operationId": "formula1CreateCircuit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1CircuitCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Circuit created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsCircuitList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Update circuit",
        "operationId": "formula1UpdateCircuit",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1CircuitCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Circuit updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsCircuitList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Delete circuit",
        "operationId": "formula1DeleteCircuit",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Circuit deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/formula-1/teams": {
      "get": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "List constructor teams",
        "operationId": "formula1ListTeams",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "name",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Teams in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsTeamList"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Create team",
        "operationId": "formula1CreateTeam",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1TeamCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Team created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsTeamList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Update team",
        "operationId": "formula1UpdateTeam",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1TeamCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Team updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsTeamList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Delete team",
        "operationId": "formula1DeleteTeam",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Team deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/formula-1/drivers": {
      "get": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "List drivers (participants)",
        "operationId": "formula1ListDrivers",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "name",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "team",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Team UUID filter"
          },
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Drivers in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsDriverList"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Create driver",
        "operationId": "formula1CreateDriver",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1DriverCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Driver created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsDriverList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Update driver",
        "operationId": "formula1UpdateDriver",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1DriverCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Driver updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsDriverList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Delete driver",
        "operationId": "formula1DeleteDriver",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Driver deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/formula-1/races": {
      "get": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "List races (calendar / events)",
        "description": "Session calendar for a season (Race, Practice, Qualifying, Sprint, …).\n`season` is required unless `id` is provided.\n",
        "operationId": "formula1ListRaces",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "season",
            "in": "query",
            "schema": {
              "type": "integer"
            },
            "description": "Required for list"
          },
          {
            "name": "competition",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "type",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "example": "Race"
          },
          {
            "name": "date",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "YYYY-MM-DD prefix filter"
          }
        ],
        "responses": {
          "200": {
            "description": "Races in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsRaceList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Create race session",
        "operationId": "formula1CreateRace",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1RaceCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Race created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsRaceList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Update race session",
        "operationId": "formula1UpdateRace",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1RaceCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Race updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsRaceList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Delete race session",
        "operationId": "formula1DeleteRace",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Race deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/formula-1/races/{raceId}": {
      "get": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Get race by id",
        "operationId": "formula1GetRace",
        "parameters": [
          {
            "name": "raceId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Single race in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsRaceList"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Update race by path id",
        "operationId": "formula1PatchRaceById",
        "parameters": [
          {
            "name": "raceId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1RaceCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Race updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsRaceList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Delete race by path id",
        "operationId": "formula1DeleteRaceById",
        "parameters": [
          {
            "name": "raceId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Race deleted."
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/formula-1/rankings/drivers": {
      "get": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Drivers championship standings",
        "operationId": "formula1ListDriverRankings",
        "parameters": [
          {
            "name": "season",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "driver",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "team",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Driver rankings in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsDriverRankingList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Create driver ranking row",
        "operationId": "formula1CreateDriverRanking",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1DriverRankingCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Ranking created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsDriverRankingList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Update driver ranking row",
        "operationId": "formula1UpdateDriverRanking",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1DriverRankingCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Ranking updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsDriverRankingList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Delete driver ranking row",
        "operationId": "formula1DeleteDriverRanking",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Ranking deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/formula-1/rankings/teams": {
      "get": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Constructors championship standings",
        "operationId": "formula1ListTeamRankings",
        "parameters": [
          {
            "name": "season",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "team",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Team rankings in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsTeamRankingList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Create team ranking row",
        "operationId": "formula1CreateTeamRanking",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1TeamRankingCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Ranking created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsTeamRankingList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Update team ranking row",
        "operationId": "formula1UpdateTeamRanking",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1TeamRankingCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Ranking updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsTeamRankingList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Delete team ranking row",
        "operationId": "formula1DeleteTeamRanking",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Ranking deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/formula-1/rankings/races": {
      "get": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Race results (positions)",
        "description": "Finishing classification for a race session. `race` (UUID) is required.",
        "operationId": "formula1ListRaceRankings",
        "parameters": [
          {
            "name": "race",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Race result rows in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsRaceRankingList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Create race result row",
        "operationId": "formula1CreateRaceRanking",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1RaceRankingCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Result created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsRaceRankingList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Update race result row",
        "operationId": "formula1UpdateRaceRanking",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Formula1RaceRankingCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Result updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Formula1ApiSportsRaceRankingList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-formula-1"
        ],
        "summary": "Delete race result row",
        "operationId": "formula1DeleteRaceRanking",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Result deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/tennis/players": {
      "get": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "List tennis players",
        "description": "Permanent player catalog. Defaults to published players (`published=true`).",
        "operationId": "tennisListPlayers",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "country",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "ISO country code"
          },
          {
            "$ref": "#/components/parameters/TennisPublished"
          }
        ],
        "responses": {
          "200": {
            "description": "Players in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsPlayerList"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Create player",
        "operationId": "tennisCreatePlayer",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisPlayerCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Player created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsPlayerList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Update player",
        "operationId": "tennisUpdatePlayer",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisPlayerCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Player updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsPlayerList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Delete player",
        "operationId": "tennisDeletePlayer",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Player deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      }
    },
    "/tennis/players/{playerId}": {
      "get": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Get player",
        "operationId": "tennisGetPlayer",
        "parameters": [
          {
            "name": "playerId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Player in `response` (empty if missing).",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsPlayerList"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Update player by path id",
        "operationId": "tennisPatchPlayerById",
        "parameters": [
          {
            "name": "playerId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisPlayerCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Player updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsPlayerList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Delete player by path id",
        "operationId": "tennisDeletePlayerById",
        "parameters": [
          {
            "name": "playerId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Player deleted."
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      }
    },
    "/tennis/tournaments": {
      "get": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "List tournament editions",
        "description": "App QD should call this with the default `published=true`.",
        "operationId": "tennisListTournaments",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "year",
            "in": "query",
            "schema": {
              "type": "integer",
              "example": 2026
            }
          },
          {
            "name": "category",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "grand_slam",
                "atp_1000",
                "wta_1000"
              ]
            }
          },
          {
            "name": "gender",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "male",
                "female"
              ]
            }
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "upcoming",
                "active",
                "finished",
                "cancelled"
              ]
            }
          },
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "$ref": "#/components/parameters/TennisPublished"
          }
        ],
        "responses": {
          "200": {
            "description": "Tournaments in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsTournamentList"
                }
              }
            }
          },
          "503": {
            "$ref": "#/components/responses/DataSourceNotConfigured"
          }
        }
      },
      "post": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Create tournament edition",
        "operationId": "tennisCreateTournament",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisTournamentCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Tournament created as an unpublished draft.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsTournamentList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Update tournament",
        "operationId": "tennisUpdateTournament",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisTournamentCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Tournament updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsTournamentList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Delete tournament",
        "operationId": "tennisDeleteTournament",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Tournament deleted."
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      }
    },
    "/tennis/tournaments/{tournamentId}": {
      "get": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Get tournament edition",
        "operationId": "tennisGetTournament",
        "parameters": [
          {
            "name": "tournamentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Tournament in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsTournamentList"
                }
              }
            }
          }
        }
      },
      "patch": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Update tournament by path id",
        "operationId": "tennisPatchTournamentById",
        "parameters": [
          {
            "name": "tournamentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisTournamentCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Tournament updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsTournamentList"
                }
              }
            }
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Delete tournament by path id",
        "operationId": "tennisDeleteTournamentById",
        "parameters": [
          {
            "name": "tournamentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Tournament deleted."
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      }
    },
    "/tennis/tournaments/{tournamentId}/publish": {
      "post": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Publish tournament",
        "description": "Marks the tournament as published so App QD can list it. Rounds and matches are\noptional: a tournament may be announced before the Main Draw exists. If rounds,\nentries or matches are already loaded they are published too. TBD competitors\n(null player, no source match) are allowed — official draws often land days\nbefore the event.\n",
        "operationId": "tennisPublishTournament",
        "parameters": [
          {
            "name": "tournamentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Published tournament.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsTournamentList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      }
    },
    "/tennis/tournaments/{tournamentId}/rounds": {
      "get": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "List rounds of a tournament",
        "operationId": "tennisListTournamentRounds",
        "parameters": [
          {
            "name": "tournamentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "$ref": "#/components/parameters/TennisPublished"
          }
        ],
        "responses": {
          "200": {
            "description": "Rounds ordered by `roundNumber`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsRoundList"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Create round in a tournament",
        "operationId": "tennisCreateTournamentRound",
        "parameters": [
          {
            "name": "tournamentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisRoundNestedCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Round created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsRoundList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          }
        }
      }
    },
    "/tennis/tournaments/{tournamentId}/entries": {
      "get": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "List Main Draw entries",
        "operationId": "tennisListTournamentEntries",
        "parameters": [
          {
            "name": "tournamentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "$ref": "#/components/parameters/TennisPublished"
          }
        ],
        "responses": {
          "200": {
            "description": "Entries with nested player.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsEntryList"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Add player to Main Draw",
        "operationId": "tennisCreateTournamentEntry",
        "parameters": [
          {
            "name": "tournamentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisEntryNestedCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Entry created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsEntryList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          }
        }
      }
    },
    "/tennis/tournaments/{tournamentId}/matches": {
      "get": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "List Main Draw matches (bracket)",
        "description": "Future matches exist even when competitors are still `null` (TBD).",
        "operationId": "tennisListTournamentMatches",
        "parameters": [
          {
            "name": "tournamentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "round",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/TennisMatchStatus"
            }
          },
          {
            "$ref": "#/components/parameters/TennisPublished"
          }
        ],
        "responses": {
          "200": {
            "description": "Matches ordered by round then bracketPosition.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsMatchList"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Create match in the bracket",
        "operationId": "tennisCreateTournamentMatch",
        "parameters": [
          {
            "name": "tournamentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisMatchNestedCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Match created. `matchId` is permanent across reschedules and substitutions.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsMatchList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          }
        }
      }
    },
    "/tennis/rounds": {
      "get": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "List rounds",
        "operationId": "tennisListRounds",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "tournament",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Required unless `id` is set"
          },
          {
            "$ref": "#/components/parameters/TennisPublished"
          }
        ],
        "responses": {
          "200": {
            "description": "Rounds in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsRoundList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          }
        }
      },
      "post": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Create round",
        "operationId": "tennisCreateRound",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisRoundCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Round created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsRoundList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Update round",
        "operationId": "tennisUpdateRound",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisRoundNestedCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Round updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsRoundList"
                }
              }
            }
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Delete round",
        "operationId": "tennisDeleteRound",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Round deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      }
    },
    "/tennis/rounds/{roundId}": {
      "get": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Get round",
        "operationId": "tennisGetRound",
        "parameters": [
          {
            "name": "roundId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Round in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsRoundList"
                }
              }
            }
          }
        }
      },
      "patch": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Update round by path id",
        "operationId": "tennisPatchRoundById",
        "parameters": [
          {
            "name": "roundId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisRoundNestedCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Round updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsRoundList"
                }
              }
            }
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Delete round by path id",
        "operationId": "tennisDeleteRoundById",
        "parameters": [
          {
            "name": "roundId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Round deleted."
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      }
    },
    "/tennis/rounds/{roundId}/publish": {
      "post": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Publish a round",
        "description": "Marks the round as published. Matches in the round are published too, even when\ncompetitors are still TBD. Use this when the round structure is known but the\nofficial draw has not been released yet.\n",
        "operationId": "tennisPublishRound",
        "parameters": [
          {
            "name": "roundId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Round published.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsRoundList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      }
    },
    "/tennis/entries": {
      "get": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "List entries",
        "operationId": "tennisListEntries",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "tournament",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "player",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "$ref": "#/components/parameters/TennisPublished"
          }
        ],
        "responses": {
          "200": {
            "description": "Entries in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsEntryList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          }
        }
      },
      "post": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Create entry",
        "operationId": "tennisCreateEntry",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisEntryCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Entry created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsEntryList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Update entry (seed, ranking, entryType)",
        "operationId": "tennisUpdateEntry",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisEntryNestedCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Entry updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsEntryList"
                }
              }
            }
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Delete entry",
        "operationId": "tennisDeleteEntry",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Entry deleted."
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      }
    },
    "/tennis/entries/{entryId}": {
      "get": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Get entry",
        "operationId": "tennisGetEntry",
        "parameters": [
          {
            "name": "entryId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Entry in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsEntryList"
                }
              }
            }
          }
        }
      },
      "patch": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Update entry by path id",
        "operationId": "tennisPatchEntryById",
        "parameters": [
          {
            "name": "entryId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisEntryNestedCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Entry updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsEntryList"
                }
              }
            }
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Delete entry by path id",
        "operationId": "tennisDeleteEntryById",
        "parameters": [
          {
            "name": "entryId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Entry deleted."
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      }
    },
    "/tennis/matches": {
      "get": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "List matches",
        "operationId": "tennisListMatches",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "tournament",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "round",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/TennisMatchStatus"
            }
          },
          {
            "$ref": "#/components/parameters/TennisPublished"
          }
        ],
        "responses": {
          "200": {
            "description": "Matches in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsMatchList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          }
        }
      },
      "post": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Create match",
        "operationId": "tennisCreateMatch",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisMatchCreateBody"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Match created.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsMatchList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          }
        }
      },
      "patch": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Update match",
        "description": "Reschedules and competitor substitutions keep the same `id`. Substituting a competitor\nafter the matchup was published sets `competitorChanged=true`.\n",
        "operationId": "tennisUpdateMatch",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisMatchNestedCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Match updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsMatchList"
                }
              }
            }
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Delete match",
        "operationId": "tennisDeleteMatch",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Match deleted."
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      }
    },
    "/tennis/matches/{matchId}": {
      "get": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Get match",
        "operationId": "tennisGetMatch",
        "parameters": [
          {
            "name": "matchId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Match in `response`.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsMatchList"
                }
              }
            }
          }
        }
      },
      "patch": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Update match by path id",
        "operationId": "tennisPatchMatchById",
        "parameters": [
          {
            "name": "matchId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisMatchNestedCreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Match updated.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsMatchList"
                }
              }
            }
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      },
      "delete": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Delete match by path id",
        "operationId": "tennisDeleteMatchById",
        "parameters": [
          {
            "name": "matchId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Match deleted."
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      }
    },
    "/tennis/matches/{matchId}/result": {
      "post": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Record match result and advance the bracket",
        "description": "Stores the official winner/loser, set scores and `resultType`. A normal result must be\nconsistent with the set tally. Retirement, walkover and disqualification require an\nexplicit `winnerId` (the player who advances). On success the winner is copied into\n`winnerToPosition` of `winnerToMatchId`.\n",
        "operationId": "tennisRecordMatchResult",
        "parameters": [
          {
            "name": "matchId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TennisMatchResultBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Match with result, published.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsMatchList"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/AmericanFootballInvalidParameter"
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      }
    },
    "/tennis/matches/{matchId}/publish": {
      "post": {
        "tags": [
          "bff-tennis"
        ],
        "summary": "Publish a single match",
        "operationId": "tennisPublishMatch",
        "parameters": [
          {
            "name": "matchId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Match published.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TennisApiSportsMatchList"
                }
              }
            }
          },
          "404": {
            "$ref": "#/components/responses/AmericanFootballNotFound"
          }
        }
      }
    },
    "/v1/openapi.json": {
      "get": {
        "tags": [
          "Meta"
        ],
        "summary": "OpenAPI document",
        "description": "This document, served as JSON. Rendered interactively at `GET /docs` (Swagger UI).",
        "operationId": "getOpenApi",
        "responses": {
          "200": {
            "description": "The OpenAPI 3.1 document.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "parameters": {
      "page": {
        "name": "page",
        "in": "query",
        "description": "1-based page number.",
        "required": false,
        "schema": {
          "type": "integer",
          "minimum": 1,
          "default": 1
        }
      },
      "pageSize": {
        "name": "pageSize",
        "in": "query",
        "description": "Items per page.",
        "required": false,
        "schema": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "default": 20
        }
      },
      "TennisPublished": {
        "name": "published",
        "in": "query",
        "description": "`true` (default) returns only published records for App QD.\n`false` returns drafts. `all` returns everything (backoffice).\n",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            true,
            false,
            "all"
          ],
          "default": "true"
        }
      },
      "season": {
        "name": "season",
        "in": "query",
        "description": "Season year (e.g. `2026`).",
        "required": false,
        "schema": {
          "type": "integer",
          "example": 2026
        }
      },
      "from": {
        "name": "from",
        "in": "query",
        "description": "Inclusive lower bound for match date (YYYY-MM-DD or ISO-8601, UTC).",
        "required": false,
        "schema": {
          "type": "string",
          "format": "date"
        }
      },
      "to": {
        "name": "to",
        "in": "query",
        "description": "Inclusive upper bound for match date (YYYY-MM-DD or ISO-8601, UTC).",
        "required": false,
        "schema": {
          "type": "string",
          "format": "date"
        }
      },
      "date": {
        "name": "date",
        "in": "query",
        "description": "Exact match date (YYYY-MM-DD, UTC). Mutually exclusive with `from`/`to`.",
        "required": false,
        "schema": {
          "type": "string",
          "format": "date"
        }
      },
      "status": {
        "name": "status",
        "in": "query",
        "description": "Filter by raw match status code (e.g. `NS`, `FT`, `1H`).",
        "required": false,
        "schema": {
          "type": "string"
        }
      },
      "teamId": {
        "name": "teamId",
        "in": "query",
        "description": "Filter matches involving this team id.",
        "required": false,
        "schema": {
          "type": "string"
        }
      },
      "leagueId": {
        "name": "leagueId",
        "in": "path",
        "required": true,
        "description": "League id (or external provider id).",
        "schema": {
          "type": "string"
        }
      },
      "teamIdPath": {
        "name": "teamId",
        "in": "path",
        "required": true,
        "description": "Team id (or external provider id).",
        "schema": {
          "type": "string"
        }
      },
      "matchIdPath": {
        "name": "matchId",
        "in": "path",
        "required": true,
        "description": "Match id (or external provider id).",
        "schema": {
          "type": "string"
        }
      }
    },
    "responses": {
      "InvalidQueryParameter": {
        "description": "One or more query parameters are invalid.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            },
            "example": {
              "error": {
                "code": "INVALID_QUERY_PARAMETER",
                "message": "The \"season\" parameter must be a 4-digit year (e.g. 2026).",
                "requestId": "req_2f9c..."
              }
            }
          }
        }
      },
      "InvalidRequestBody": {
        "description": "Request body is missing, malformed, or invalid.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            },
            "example": {
              "error": {
                "code": "INVALID_REQUEST_BODY",
                "message": "At least one field must be provided.",
                "requestId": "req_2f9c..."
              }
            }
          }
        }
      },
      "ResourceNotFound": {
        "description": "The requested resource does not exist.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            },
            "example": {
              "error": {
                "code": "RESOURCE_NOT_FOUND",
                "message": "League not found.",
                "requestId": "req_2f9c..."
              }
            }
          }
        }
      },
      "DataSourceNotConfigured": {
        "description": "The server is missing Firebase Admin credentials.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            },
            "example": {
              "error": {
                "code": "DATA_SOURCE_NOT_CONFIGURED",
                "message": "The data source is not configured.",
                "requestId": "req_2f9c..."
              }
            }
          }
        }
      },
      "BffInvalidParameter": {
        "description": "Invalid query parameter (API-Sports soccer error envelope).",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ApiSportsErrorEnvelope"
            },
            "example": {
              "response": [],
              "results": 0,
              "errors": {
                "parameters": "The \"league\" parameter is required."
              }
            }
          }
        }
      },
      "AmericanFootballInvalidParameter": {
        "description": "Invalid query or request body (full api-sports NFL envelope).",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/AmericanFootballApiSportsErrorEnvelope"
            },
            "example": {
              "get": "teams",
              "parameters": {
                "league": "1"
              },
              "errors": {
                "parameters": "The \"season\" parameter is required."
              },
              "results": 0,
              "paging": {
                "current": 1,
                "total": 1
              },
              "response": []
            }
          }
        }
      },
      "AmericanFootballNotFound": {
        "description": "Resource not found (full api-sports NFL envelope).",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/AmericanFootballApiSportsErrorEnvelope"
            },
            "example": {
              "get": "games",
              "parameters": {},
              "errors": {
                "resource": "Game not found."
              },
              "results": 0,
              "paging": {
                "current": 1,
                "total": 1
              },
              "response": []
            }
          }
        }
      }
    },
    "schemas": {
      "ApiSportsEnvelope": {
        "type": "object",
        "required": [
          "response",
          "results",
          "errors"
        ],
        "properties": {
          "response": {
            "type": "array",
            "items": {}
          },
          "results": {
            "type": "integer",
            "example": 0
          },
          "errors": {
            "type": "object",
            "additionalProperties": {
              "type": "string"
            }
          }
        }
      },
      "ApiSportsErrorEnvelope": {
        "allOf": [
          {
            "$ref": "#/components/schemas/ApiSportsEnvelope"
          }
        ],
        "example": {
          "response": [],
          "results": 0,
          "errors": {
            "parameters": "Invalid query parameter."
          }
        }
      },
      "ApiSportsCountry": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "example": "Mexico"
          },
          "code": {
            "type": [
              "string",
              "null"
            ],
            "example": "MX"
          },
          "flag": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "ApiSportsCountryList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/ApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ApiSportsCountry"
                }
              }
            }
          }
        ]
      },
      "ApiSportsLeagueEntry": {
        "type": "object",
        "properties": {
          "league": {
            "type": "object",
            "properties": {
              "id": {
                "type": [
                  "integer",
                  "string",
                  "null"
                ],
                "example": 262
              },
              "name": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "type": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "logo": {
                "type": [
                  "string",
                  "null"
                ]
              }
            }
          },
          "country": {
            "type": "object",
            "properties": {
              "name": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "code": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "flag": {
                "type": [
                  "string",
                  "null"
                ]
              }
            }
          },
          "seasons": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "year": {
                  "type": [
                    "integer",
                    "null"
                  ]
                },
                "start": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "format": "date"
                },
                "end": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "format": "date"
                },
                "current": {
                  "type": "boolean"
                },
                "coverage": {
                  "type": "object",
                  "additionalProperties": {
                    "type": "boolean"
                  }
                }
              }
            }
          }
        }
      },
      "ApiSportsLeagueList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/ApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ApiSportsLeagueEntry"
                }
              }
            }
          }
        ]
      },
      "ApiSportsIntegerList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/ApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              }
            }
          }
        ]
      },
      "ApiSportsStringList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/ApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          }
        ]
      },
      "ApiSportsFixture": {
        "type": "object",
        "description": "API-Sports fixture object (subset — see Firestore `soccer_matches` blobs).",
        "properties": {
          "fixture": {
            "type": "object",
            "additionalProperties": true
          },
          "league": {
            "type": "object",
            "additionalProperties": true
          },
          "teams": {
            "type": "object",
            "additionalProperties": true
          },
          "goals": {
            "type": "object",
            "additionalProperties": true
          },
          "score": {
            "type": "object",
            "additionalProperties": true
          }
        }
      },
      "ApiSportsFixtureList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/ApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ApiSportsFixture"
                }
              }
            }
          }
        ]
      },
      "ApiSportsStandingsList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/ApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "league": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": [
                            "integer",
                            "string",
                            "null"
                          ]
                        },
                        "name": {
                          "type": [
                            "string",
                            "null"
                          ]
                        },
                        "country": {
                          "type": [
                            "string",
                            "null"
                          ]
                        },
                        "logo": {
                          "type": [
                            "string",
                            "null"
                          ]
                        },
                        "flag": {
                          "type": [
                            "string",
                            "null"
                          ]
                        },
                        "season": {
                          "type": "integer"
                        },
                        "standings": {
                          "type": "array",
                          "items": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "additionalProperties": true
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      },
      "AmericanFootballApiSportsEnvelope": {
        "type": "object",
        "required": [
          "get",
          "parameters",
          "errors",
          "results",
          "response"
        ],
        "properties": {
          "get": {
            "type": "string",
            "description": "Endpoint name echoed by api-sports.",
            "example": "games"
          },
          "parameters": {
            "oneOf": [
              {
                "type": "object",
                "additionalProperties": true
              },
              {
                "type": "array",
                "items": {}
              }
            ]
          },
          "errors": {
            "oneOf": [
              {
                "type": "array",
                "items": {}
              },
              {
                "type": "object",
                "additionalProperties": {
                  "type": "string"
                }
              }
            ]
          },
          "results": {
            "type": "integer",
            "description": "Length of `response`."
          },
          "paging": {
            "type": "object",
            "properties": {
              "current": {
                "type": "integer",
                "example": 1
              },
              "total": {
                "type": "integer",
                "example": 1
              }
            }
          },
          "response": {
            "type": "array",
            "items": {}
          }
        }
      },
      "AmericanFootballApiSportsErrorEnvelope": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          }
        ],
        "example": {
          "get": "teams",
          "parameters": {
            "league": "1"
          },
          "errors": {
            "parameters": "The \"season\" parameter is required."
          },
          "results": 0,
          "paging": {
            "current": 1,
            "total": 1
          },
          "response": []
        }
      },
      "AmericanFootballCanonicalId": {
        "type": "string",
        "format": "uuid",
        "description": "Server-assigned Firestore document id exposed in BFF responses.",
        "example": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
      },
      "AmericanFootballCountryRef": {
        "type": "object",
        "required": [
          "name"
        ],
        "properties": {
          "name": {
            "type": "string",
            "example": "USA"
          },
          "code": {
            "type": [
              "string",
              "null"
            ],
            "example": "US"
          },
          "flag": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "AmericanFootballCountryItem": {
        "type": "object",
        "required": [
          "name"
        ],
        "properties": {
          "name": {
            "type": "string",
            "example": "USA"
          },
          "code": {
            "type": [
              "string",
              "null"
            ],
            "example": "US"
          },
          "flag": {
            "type": [
              "string",
              "null"
            ],
            "example": "https://media.api-sports.io/flags/us.svg"
          }
        }
      },
      "AmericanFootballTeamRef": {
        "type": "object",
        "required": [
          "id",
          "name"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/AmericanFootballCanonicalId"
          },
          "name": {
            "type": "string",
            "example": "Miami Dolphins"
          },
          "logo": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "AmericanFootballTeamCreateBody": {
        "type": "object",
        "required": [
          "name"
        ],
        "description": "POST/PATCH body — id is assigned by the server on create.",
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string",
            "example": "Miami Dolphins"
          },
          "logo": {
            "type": [
              "string",
              "null"
            ]
          },
          "altLogo": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "AmericanFootballTeamItem": {
        "type": "object",
        "required": [
          "id",
          "name"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/AmericanFootballCanonicalId"
          },
          "name": {
            "type": "string",
            "example": "Miami Dolphins"
          },
          "logo": {
            "type": [
              "string",
              "null"
            ],
            "example": "https://media.api-sports.io/american-football/teams/25.png"
          },
          "altLogo": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "AmericanFootballGameDate": {
        "type": "object",
        "properties": {
          "timezone": {
            "type": [
              "string",
              "null"
            ],
            "example": "UTC"
          },
          "date": {
            "type": [
              "string",
              "null"
            ],
            "format": "date",
            "example": "2022-09-30"
          },
          "time": {
            "type": [
              "string",
              "null"
            ],
            "example": "00:00"
          },
          "timestamp": {
            "type": [
              "integer",
              "null"
            ],
            "example": 1664496000
          }
        }
      },
      "AmericanFootballGameVenue": {
        "type": "object",
        "properties": {
          "name": {
            "type": [
              "string",
              "null"
            ]
          },
          "city": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "AmericanFootballGameStatus": {
        "type": "object",
        "properties": {
          "short": {
            "type": [
              "string",
              "null"
            ],
            "example": "FT"
          },
          "long": {
            "type": [
              "string",
              "null"
            ],
            "example": "Finished"
          },
          "timer": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "AmericanFootballQuarterScores": {
        "type": "object",
        "properties": {
          "quarter_1": {
            "type": [
              "integer",
              "null"
            ]
          },
          "quarter_2": {
            "type": [
              "integer",
              "null"
            ]
          },
          "quarter_3": {
            "type": [
              "integer",
              "null"
            ]
          },
          "quarter_4": {
            "type": [
              "integer",
              "null"
            ]
          },
          "overtime": {
            "type": [
              "integer",
              "null"
            ]
          },
          "total": {
            "type": [
              "integer",
              "null"
            ]
          }
        }
      },
      "AmericanFootballGameCore": {
        "type": "object",
        "required": [
          "id"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/AmericanFootballCanonicalId"
          },
          "stage": {
            "type": [
              "string",
              "null"
            ],
            "example": "Regular Season"
          },
          "week": {
            "type": [
              "string",
              "null"
            ],
            "example": "5"
          },
          "date": {
            "$ref": "#/components/schemas/AmericanFootballGameDate"
          },
          "venue": {
            "$ref": "#/components/schemas/AmericanFootballGameVenue"
          },
          "status": {
            "$ref": "#/components/schemas/AmericanFootballGameStatus"
          }
        }
      },
      "AmericanFootballGameCoreCreate": {
        "type": "object",
        "description": "Game fields for POST/PATCH — no `id`; assigned on create.",
        "additionalProperties": false,
        "properties": {
          "stage": {
            "type": [
              "string",
              "null"
            ],
            "example": "Regular Season"
          },
          "week": {
            "type": [
              "string",
              "null"
            ],
            "example": "5"
          },
          "date": {
            "$ref": "#/components/schemas/AmericanFootballGameDate"
          },
          "venue": {
            "$ref": "#/components/schemas/AmericanFootballGameVenue"
          },
          "status": {
            "$ref": "#/components/schemas/AmericanFootballGameStatus"
          }
        }
      },
      "AmericanFootballGameLeagueRef": {
        "type": "object",
        "required": [
          "id",
          "name"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/AmericanFootballCanonicalId"
          },
          "name": {
            "type": "string",
            "example": "NFL"
          },
          "season": {
            "oneOf": [
              {
                "type": "integer"
              },
              {
                "type": "string"
              }
            ],
            "example": "2022"
          },
          "logo": {
            "type": [
              "string",
              "null"
            ]
          },
          "country": {
            "$ref": "#/components/schemas/AmericanFootballCountryRef"
          }
        }
      },
      "AmericanFootballGameTeams": {
        "type": "object",
        "required": [
          "home",
          "away"
        ],
        "properties": {
          "home": {
            "$ref": "#/components/schemas/AmericanFootballTeamRef"
          },
          "away": {
            "$ref": "#/components/schemas/AmericanFootballTeamRef"
          }
        }
      },
      "AmericanFootballGameScores": {
        "type": "object",
        "properties": {
          "home": {
            "$ref": "#/components/schemas/AmericanFootballQuarterScores"
          },
          "away": {
            "$ref": "#/components/schemas/AmericanFootballQuarterScores"
          }
        }
      },
      "AmericanFootballGameItem": {
        "type": "object",
        "required": [
          "game",
          "league",
          "teams"
        ],
        "description": "Game object returned in `response[]` after GET/POST/PATCH.",
        "properties": {
          "game": {
            "$ref": "#/components/schemas/AmericanFootballGameCore"
          },
          "league": {
            "$ref": "#/components/schemas/AmericanFootballGameLeagueRef"
          },
          "teams": {
            "$ref": "#/components/schemas/AmericanFootballGameTeams"
          },
          "scores": {
            "$ref": "#/components/schemas/AmericanFootballGameScores"
          }
        }
      },
      "AmericanFootballGameCreateBody": {
        "type": "object",
        "required": [
          "game",
          "league",
          "teams"
        ],
        "description": "POST/PATCH body — `game` has no `id`; teams and league must reference existing UUIDs.",
        "additionalProperties": false,
        "properties": {
          "game": {
            "$ref": "#/components/schemas/AmericanFootballGameCoreCreate"
          },
          "league": {
            "$ref": "#/components/schemas/AmericanFootballGameLeagueRef"
          },
          "teams": {
            "$ref": "#/components/schemas/AmericanFootballGameTeams"
          },
          "scores": {
            "$ref": "#/components/schemas/AmericanFootballGameScores"
          }
        }
      },
      "AmericanFootballLeagueCore": {
        "type": "object",
        "required": [
          "id",
          "name"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/AmericanFootballCanonicalId"
          },
          "name": {
            "type": "string",
            "example": "NFL"
          },
          "type": {
            "type": [
              "string",
              "null"
            ],
            "example": "league"
          },
          "logo": {
            "type": [
              "string",
              "null"
            ]
          },
          "altLogo": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "AmericanFootballLeagueCoreCreate": {
        "type": "object",
        "required": [
          "name"
        ],
        "description": "League fields for POST/PATCH — no `id` on create.",
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string",
            "example": "NFL"
          },
          "type": {
            "type": [
              "string",
              "null"
            ],
            "example": "league"
          },
          "logo": {
            "type": [
              "string",
              "null"
            ]
          },
          "altLogo": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "AmericanFootballSeasonCoverage": {
        "type": "object",
        "description": "NFL-specific coverage flags (api-sports American Football v1).",
        "properties": {
          "games": {
            "type": "object",
            "properties": {
              "events": {
                "type": "boolean"
              },
              "statisitcs": {
                "type": "object",
                "description": "Typo preserved from api-sports documentation.",
                "properties": {
                  "teams": {
                    "type": "boolean"
                  },
                  "players": {
                    "type": "boolean"
                  }
                }
              }
            }
          },
          "statistics": {
            "type": "object",
            "properties": {
              "season": {
                "type": "object",
                "properties": {
                  "players": {
                    "type": "boolean"
                  }
                }
              }
            }
          },
          "players": {
            "type": "boolean"
          },
          "injuries": {
            "type": "boolean"
          },
          "standings": {
            "type": "boolean"
          }
        }
      },
      "AmericanFootballSeasonItem": {
        "type": "object",
        "required": [
          "year",
          "current"
        ],
        "properties": {
          "year": {
            "type": "integer",
            "example": 2022
          },
          "start": {
            "type": [
              "string",
              "null"
            ],
            "format": "date"
          },
          "end": {
            "type": [
              "string",
              "null"
            ],
            "format": "date"
          },
          "current": {
            "type": "boolean"
          },
          "coverage": {
            "$ref": "#/components/schemas/AmericanFootballSeasonCoverage"
          }
        }
      },
      "AmericanFootballLeagueItem": {
        "type": "object",
        "required": [
          "league",
          "country",
          "seasons"
        ],
        "properties": {
          "league": {
            "$ref": "#/components/schemas/AmericanFootballLeagueCore"
          },
          "country": {
            "$ref": "#/components/schemas/AmericanFootballCountryRef"
          },
          "seasons": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/AmericanFootballSeasonItem"
            }
          }
        }
      },
      "AmericanFootballLeagueCreateBody": {
        "type": "object",
        "required": [
          "league",
          "country",
          "seasons"
        ],
        "description": "POST/PATCH body — league id is assigned on create.",
        "additionalProperties": false,
        "properties": {
          "league": {
            "$ref": "#/components/schemas/AmericanFootballLeagueCoreCreate"
          },
          "country": {
            "$ref": "#/components/schemas/AmericanFootballCountryRef"
          },
          "seasons": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/AmericanFootballSeasonItem"
            }
          }
        }
      },
      "AmericanFootballStandingLeagueRef": {
        "type": "object",
        "required": [
          "id",
          "name"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/AmericanFootballCanonicalId"
          },
          "name": {
            "type": "string",
            "example": "NFL"
          },
          "season": {
            "oneOf": [
              {
                "type": "integer"
              },
              {
                "type": "string"
              }
            ],
            "example": 2022
          },
          "logo": {
            "type": [
              "string",
              "null"
            ]
          },
          "country": {
            "$ref": "#/components/schemas/AmericanFootballCountryRef"
          }
        }
      },
      "AmericanFootballPointsBlock": {
        "type": "object",
        "properties": {
          "for": {
            "type": [
              "integer",
              "null"
            ]
          },
          "against": {
            "type": [
              "integer",
              "null"
            ]
          },
          "difference": {
            "type": [
              "integer",
              "null"
            ]
          }
        }
      },
      "AmericanFootballRecords": {
        "type": "object",
        "properties": {
          "home": {
            "type": [
              "string",
              "null"
            ],
            "example": "2-0"
          },
          "road": {
            "type": [
              "string",
              "null"
            ],
            "example": "1-1"
          },
          "conference": {
            "type": [
              "string",
              "null"
            ]
          },
          "division": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "AmericanFootballNcaaConference": {
        "type": "object",
        "properties": {
          "won": {
            "type": [
              "integer",
              "null"
            ]
          },
          "lost": {
            "type": [
              "integer",
              "null"
            ]
          },
          "points": {
            "type": "object",
            "properties": {
              "for": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "against": {
                "type": [
                  "integer",
                  "null"
                ]
              }
            }
          }
        }
      },
      "AmericanFootballStandingItem": {
        "type": "object",
        "required": [
          "id",
          "league",
          "team"
        ],
        "description": "Standing row returned in `response[]`.",
        "properties": {
          "id": {
            "$ref": "#/components/schemas/AmericanFootballCanonicalId"
          },
          "league": {
            "$ref": "#/components/schemas/AmericanFootballStandingLeagueRef"
          },
          "conference": {
            "type": [
              "string",
              "null"
            ],
            "example": "American Football Conference"
          },
          "division": {
            "type": [
              "string",
              "null"
            ],
            "example": "East"
          },
          "position": {
            "type": [
              "integer",
              "null"
            ],
            "example": 1
          },
          "team": {
            "$ref": "#/components/schemas/AmericanFootballTeamRef"
          },
          "won": {
            "type": [
              "integer",
              "null"
            ]
          },
          "lost": {
            "type": [
              "integer",
              "null"
            ]
          },
          "ties": {
            "type": [
              "integer",
              "null"
            ]
          },
          "points": {
            "$ref": "#/components/schemas/AmericanFootballPointsBlock"
          },
          "records": {
            "$ref": "#/components/schemas/AmericanFootballRecords"
          },
          "streak": {
            "type": [
              "string",
              "null"
            ],
            "example": "L1"
          },
          "ncaa_conference": {
            "$ref": "#/components/schemas/AmericanFootballNcaaConference"
          }
        }
      },
      "AmericanFootballStandingCreateBody": {
        "type": "object",
        "required": [
          "league",
          "team"
        ],
        "description": "POST/PATCH body — row `id` assigned on create; `league.id` and `team.id` must be existing UUIDs.",
        "additionalProperties": false,
        "properties": {
          "league": {
            "$ref": "#/components/schemas/AmericanFootballStandingLeagueRef"
          },
          "conference": {
            "type": [
              "string",
              "null"
            ],
            "example": "American Football Conference"
          },
          "division": {
            "type": [
              "string",
              "null"
            ],
            "example": "East"
          },
          "position": {
            "type": [
              "integer",
              "null"
            ],
            "example": 1
          },
          "team": {
            "$ref": "#/components/schemas/AmericanFootballTeamRef"
          },
          "won": {
            "type": [
              "integer",
              "null"
            ]
          },
          "lost": {
            "type": [
              "integer",
              "null"
            ]
          },
          "ties": {
            "type": [
              "integer",
              "null"
            ]
          },
          "points": {
            "$ref": "#/components/schemas/AmericanFootballPointsBlock"
          },
          "records": {
            "$ref": "#/components/schemas/AmericanFootballRecords"
          },
          "streak": {
            "type": [
              "string",
              "null"
            ],
            "example": "L1"
          },
          "ncaa_conference": {
            "$ref": "#/components/schemas/AmericanFootballNcaaConference"
          }
        }
      },
      "AmericanFootballTimezoneCreateBody": {
        "type": "object",
        "required": [
          "timezone"
        ],
        "properties": {
          "timezone": {
            "type": "string",
            "example": "America/Chicago"
          }
        }
      },
      "AmericanFootballTimezoneUpdateBody": {
        "type": "object",
        "required": [
          "timezone",
          "newTimezone"
        ],
        "properties": {
          "timezone": {
            "type": "string"
          },
          "newTimezone": {
            "type": "string"
          }
        }
      },
      "AmericanFootballTimezoneDeleteBody": {
        "type": "object",
        "required": [
          "timezone"
        ],
        "properties": {
          "timezone": {
            "type": "string"
          }
        }
      },
      "AmericanFootballSeasonYearBody": {
        "type": "object",
        "required": [
          "year"
        ],
        "properties": {
          "year": {
            "type": "integer",
            "example": 2024
          }
        }
      },
      "AmericanFootballApiSportsTimezoneList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "get": {
                "type": "string",
                "example": "timezone"
              },
              "response": {
                "type": "array",
                "items": {
                  "type": "string",
                  "example": "America/New_York"
                }
              }
            }
          }
        ]
      },
      "AmericanFootballApiSportsIntegerList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "get": {
                "type": "string",
                "example": "seasons"
              },
              "response": {
                "type": "array",
                "items": {
                  "type": "integer",
                  "example": 2022
                }
              }
            }
          }
        ]
      },
      "AmericanFootballApiSportsCountryList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "get": {
                "type": "string",
                "example": "countries"
              },
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/AmericanFootballCountryItem"
                }
              }
            }
          }
        ]
      },
      "AmericanFootballApiSportsLeagueList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "get": {
                "type": "string",
                "example": "leagues"
              },
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/AmericanFootballLeagueItem"
                }
              }
            }
          }
        ]
      },
      "AmericanFootballApiSportsGameList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "get": {
                "type": "string",
                "example": "games"
              },
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/AmericanFootballGameItem"
                }
              }
            }
          }
        ]
      },
      "AmericanFootballApiSportsTeamList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "get": {
                "type": "string",
                "example": "teams"
              },
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/AmericanFootballTeamItem"
                }
              }
            }
          }
        ]
      },
      "AmericanFootballApiSportsStandingList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "get": {
                "type": "string",
                "example": "standings"
              },
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/AmericanFootballStandingItem"
                }
              }
            }
          }
        ]
      },
      "Pagination": {
        "type": "object",
        "required": [
          "page",
          "pageSize",
          "total"
        ],
        "properties": {
          "page": {
            "type": "integer",
            "example": 1
          },
          "pageSize": {
            "type": "integer",
            "example": 20
          },
          "total": {
            "type": "integer",
            "example": 18
          }
        }
      },
      "CollectionMeta": {
        "type": "object",
        "required": [
          "apiVersion",
          "updatedAt",
          "pagination"
        ],
        "properties": {
          "apiVersion": {
            "type": "string",
            "example": "v1"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          },
          "pagination": {
            "$ref": "#/components/schemas/Pagination"
          }
        }
      },
      "ResourceMeta": {
        "type": "object",
        "required": [
          "apiVersion",
          "updatedAt"
        ],
        "properties": {
          "apiVersion": {
            "type": "string",
            "example": "v1"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "ErrorResponse": {
        "type": "object",
        "required": [
          "error"
        ],
        "properties": {
          "error": {
            "type": "object",
            "required": [
              "code",
              "message",
              "requestId"
            ],
            "properties": {
              "code": {
                "type": "string",
                "enum": [
                  "INVALID_QUERY_PARAMETER",
                  "INVALID_PATH_PARAMETER",
                  "RESOURCE_NOT_FOUND",
                  "DATA_NOT_AVAILABLE",
                  "DATA_SOURCE_NOT_CONFIGURED",
                  "INTERNAL_SERVER_ERROR"
                ]
              },
              "message": {
                "type": "string"
              },
              "requestId": {
                "type": "string"
              },
              "details": {}
            }
          }
        }
      },
      "Sport": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "slug": {
            "type": "string",
            "example": "soccer"
          },
          "name": {
            "type": "string",
            "example": "Soccer"
          },
          "logo": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "League": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "externalId": {
            "type": [
              "string",
              "null"
            ]
          },
          "name": {
            "type": "string",
            "example": "Liga MX"
          },
          "type": {
            "type": [
              "string",
              "null"
            ],
            "example": "League"
          },
          "sport": {
            "type": [
              "string",
              "null"
            ],
            "example": "soccer"
          },
          "country": {
            "type": [
              "string",
              "null"
            ],
            "example": "Mexico"
          },
          "logo": {
            "type": [
              "string",
              "null"
            ]
          },
          "altLogo": {
            "type": [
              "string",
              "null"
            ],
            "description": "Alternative logo URL"
          },
          "updatedAt": {
            "type": [
              "string",
              "null"
            ],
            "format": "date-time"
          }
        }
      },
      "Season": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "leagueId": {
            "type": [
              "string",
              "null"
            ]
          },
          "year": {
            "type": [
              "integer",
              "null"
            ],
            "example": 2026
          },
          "startDate": {
            "type": [
              "string",
              "null"
            ],
            "format": "date"
          },
          "endDate": {
            "type": [
              "string",
              "null"
            ],
            "format": "date"
          },
          "current": {
            "type": "boolean"
          },
          "externalId": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "Venue": {
        "type": [
          "object",
          "null"
        ],
        "properties": {
          "id": {
            "type": [
              "integer",
              "null"
            ]
          },
          "name": {
            "type": [
              "string",
              "null"
            ]
          },
          "city": {
            "type": [
              "string",
              "null"
            ]
          },
          "capacity": {
            "type": [
              "integer",
              "null"
            ]
          }
        }
      },
      "Team": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "externalId": {
            "type": [
              "string",
              "null"
            ]
          },
          "sport": {
            "type": [
              "string",
              "null"
            ],
            "example": "soccer"
          },
          "leagueId": {
            "type": [
              "string",
              "null"
            ]
          },
          "name": {
            "type": [
              "string",
              "null"
            ],
            "example": "Club América"
          },
          "code": {
            "type": [
              "string",
              "null"
            ]
          },
          "country": {
            "type": [
              "string",
              "null"
            ]
          },
          "logo": {
            "type": [
              "string",
              "null"
            ]
          },
          "altName": {
            "type": [
              "string",
              "null"
            ],
            "description": "Alternative display name"
          },
          "altLogo": {
            "type": [
              "string",
              "null"
            ],
            "description": "Alternative logo URL"
          },
          "city": {
            "type": [
              "string",
              "null"
            ],
            "description": "NFL teams"
          },
          "conference": {
            "type": [
              "string",
              "null"
            ],
            "description": "NFL teams"
          },
          "division": {
            "type": [
              "string",
              "null"
            ],
            "description": "NFL teams"
          },
          "venue": {
            "$ref": "#/components/schemas/Venue"
          },
          "updatedAt": {
            "type": [
              "string",
              "null"
            ],
            "format": "date-time"
          }
        }
      },
      "MatchSide": {
        "type": "object",
        "properties": {
          "teamId": {
            "type": [
              "string",
              "null"
            ]
          },
          "name": {
            "type": [
              "string",
              "null"
            ]
          },
          "logo": {
            "type": [
              "string",
              "null"
            ]
          },
          "score": {
            "type": [
              "integer",
              "null"
            ]
          }
        }
      },
      "MatchSideUpdate": {
        "type": "object",
        "description": "Partial update for one side of a match. Only include fields to change.",
        "properties": {
          "teamId": {
            "type": [
              "string",
              "null"
            ]
          },
          "name": {
            "type": [
              "string",
              "null"
            ]
          },
          "logo": {
            "type": [
              "string",
              "null"
            ]
          },
          "score": {
            "type": [
              "integer",
              "null"
            ]
          }
        }
      },
      "MatchSideCreate": {
        "type": "object",
        "required": [
          "teamId"
        ],
        "properties": {
          "teamId": {
            "type": "string",
            "description": "Team id or external provider id in this league."
          },
          "name": {
            "type": [
              "string",
              "null"
            ],
            "description": "Override denormalized name (optional)."
          },
          "logo": {
            "type": [
              "string",
              "null"
            ],
            "description": "Override denormalized logo (optional)."
          },
          "score": {
            "type": [
              "integer",
              "null"
            ]
          }
        }
      },
      "MatchCreate": {
        "type": "object",
        "required": [
          "date",
          "home",
          "away"
        ],
        "description": "Payload to create a match. Defaults to the league's current season when neither `?season=`\nnor body `seasonId` is provided. `status` defaults to `NS` when omitted; scores default\nto `null`.\n",
        "properties": {
          "externalId": {
            "type": [
              "string",
              "null"
            ]
          },
          "seasonId": {
            "type": [
              "string",
              "null"
            ],
            "description": "Target season document id or provider `externalId`. Alternative to the `?season=`\nquery parameter (year). When both are sent they must refer to the same season.\n"
          },
          "date": {
            "type": "string",
            "format": "date-time",
            "description": "Kick-off / game date (UTC)."
          },
          "status": {
            "type": [
              "string",
              "null"
            ],
            "example": "NS"
          },
          "round": {
            "type": [
              "string",
              "null"
            ]
          },
          "venue": {
            "type": [
              "string",
              "null"
            ]
          },
          "home": {
            "$ref": "#/components/schemas/MatchSideCreate"
          },
          "away": {
            "$ref": "#/components/schemas/MatchSideCreate"
          }
        }
      },
      "MatchUpdate": {
        "type": "object",
        "description": "Partial match update. All properties are optional, but at least one must be sent.\nField names mirror the public `Match` resource (camelCase).\n",
        "minProperties": 1,
        "properties": {
          "externalId": {
            "type": [
              "string",
              "null"
            ]
          },
          "seasonId": {
            "type": [
              "string",
              "null"
            ]
          },
          "date": {
            "type": [
              "string",
              "null"
            ],
            "format": "date-time",
            "description": "Kick-off / game date (UTC)."
          },
          "status": {
            "type": [
              "string",
              "null"
            ],
            "example": "FT"
          },
          "round": {
            "type": [
              "string",
              "null"
            ]
          },
          "venue": {
            "type": [
              "string",
              "null"
            ]
          },
          "home": {
            "$ref": "#/components/schemas/MatchSideUpdate"
          },
          "away": {
            "$ref": "#/components/schemas/MatchSideUpdate"
          }
        }
      },
      "Match": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "externalId": {
            "type": [
              "string",
              "null"
            ]
          },
          "sport": {
            "type": [
              "string",
              "null"
            ]
          },
          "leagueId": {
            "type": [
              "string",
              "null"
            ]
          },
          "seasonId": {
            "type": [
              "string",
              "null"
            ]
          },
          "date": {
            "type": [
              "string",
              "null"
            ],
            "format": "date-time"
          },
          "status": {
            "type": [
              "string",
              "null"
            ],
            "example": "NS"
          },
          "round": {
            "type": [
              "string",
              "null"
            ]
          },
          "venue": {
            "type": [
              "string",
              "null"
            ]
          },
          "home": {
            "$ref": "#/components/schemas/MatchSide"
          },
          "away": {
            "$ref": "#/components/schemas/MatchSide"
          },
          "updatedAt": {
            "type": [
              "string",
              "null"
            ],
            "format": "date-time"
          }
        }
      },
      "Standing": {
        "type": "object",
        "properties": {
          "teamId": {
            "type": [
              "string",
              "null"
            ]
          },
          "teamName": {
            "type": [
              "string",
              "null"
            ]
          },
          "points": {
            "type": [
              "integer",
              "null"
            ]
          },
          "played": {
            "type": [
              "integer",
              "null"
            ]
          },
          "wins": {
            "type": [
              "integer",
              "null"
            ]
          },
          "draws": {
            "type": [
              "integer",
              "null"
            ]
          },
          "losses": {
            "type": [
              "integer",
              "null"
            ]
          },
          "ties": {
            "type": [
              "integer",
              "null"
            ],
            "description": "NFL"
          }
        }
      },
      "LeagueCoverage": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "externalId": {
            "type": [
              "string",
              "null"
            ]
          },
          "name": {
            "type": [
              "string",
              "null"
            ]
          },
          "sport": {
            "type": [
              "string",
              "null"
            ]
          },
          "availableSeasons": {
            "type": "array",
            "items": {
              "type": "integer"
            }
          },
          "coverage": {
            "type": "object",
            "properties": {
              "teams": {
                "type": "boolean"
              },
              "matches": {
                "type": "boolean"
              },
              "standings": {
                "type": "boolean"
              },
              "statistics": {
                "type": "boolean"
              }
            }
          },
          "updatedAt": {
            "type": [
              "string",
              "null"
            ],
            "format": "date-time"
          }
        }
      },
      "HealthResource": {
        "type": "object",
        "properties": {
          "data": {
            "type": "object",
            "properties": {
              "status": {
                "type": "string",
                "example": "ok"
              },
              "apiVersion": {
                "type": "string",
                "example": "v1"
              },
              "dataSourceConfigured": {
                "type": "boolean"
              },
              "storageConfigured": {
                "type": "boolean",
                "description": "Whether Firebase Storage is configured for image uploads."
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "meta": {
            "$ref": "#/components/schemas/ResourceMeta"
          }
        }
      },
      "UploadResource": {
        "type": "object",
        "properties": {
          "data": {
            "type": "object",
            "required": [
              "url"
            ],
            "properties": {
              "url": {
                "type": "string",
                "format": "uri",
                "description": "Public Firebase Storage URL for the uploaded image."
              }
            }
          },
          "meta": {
            "$ref": "#/components/schemas/ResourceMeta"
          }
        }
      },
      "DataStatusResource": {
        "type": "object",
        "properties": {
          "data": {
            "type": "object",
            "properties": {
              "leagues": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/LeagueCoverage"
                }
              },
              "sports": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "string"
                    },
                    "slug": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "name": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "leagueCount": {
                      "type": "integer"
                    },
                    "coverage": {
                      "type": "object",
                      "properties": {
                        "teams": {
                          "type": "boolean"
                        },
                        "matches": {
                          "type": "boolean"
                        },
                        "standings": {
                          "type": "boolean"
                        },
                        "statistics": {
                          "type": "boolean"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "meta": {
            "$ref": "#/components/schemas/ResourceMeta"
          }
        }
      },
      "SportCollection": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Sport"
            }
          },
          "meta": {
            "$ref": "#/components/schemas/CollectionMeta"
          }
        }
      },
      "CatalogCountry": {
        "type": "object",
        "required": [
          "name"
        ],
        "properties": {
          "name": {
            "type": "string",
            "example": "Mexico"
          },
          "code": {
            "type": "string",
            "nullable": true,
            "example": "MX"
          },
          "flag": {
            "type": "string",
            "nullable": true,
            "format": "uri"
          }
        }
      },
      "CountryCollection": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/CatalogCountry"
            }
          },
          "meta": {
            "$ref": "#/components/schemas/CollectionMeta"
          }
        }
      },
      "CountryResource": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/CatalogCountry"
          },
          "meta": {
            "$ref": "#/components/schemas/ResourceMeta"
          }
        }
      },
      "CatalogLeagueType": {
        "type": "object",
        "required": [
          "code",
          "label"
        ],
        "properties": {
          "code": {
            "type": "string",
            "example": "league",
            "description": "api-sports league.type value"
          },
          "label": {
            "type": "string",
            "example": "Liga"
          }
        }
      },
      "LeagueTypeCollection": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/CatalogLeagueType"
            }
          },
          "meta": {
            "$ref": "#/components/schemas/CollectionMeta"
          }
        }
      },
      "CatalogGameStage": {
        "type": "object",
        "required": [
          "value",
          "label"
        ],
        "properties": {
          "value": {
            "type": "string",
            "example": "Regular Season",
            "description": "api-sports American Football game.stage value"
          },
          "label": {
            "type": "string",
            "example": "Temporada regular"
          }
        }
      },
      "GameStageCollection": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/CatalogGameStage"
            }
          },
          "meta": {
            "$ref": "#/components/schemas/CollectionMeta"
          }
        }
      },
      "LeagueCollection": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/League"
            }
          },
          "meta": {
            "$ref": "#/components/schemas/CollectionMeta"
          }
        }
      },
      "LeagueResource": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/League"
          },
          "meta": {
            "$ref": "#/components/schemas/ResourceMeta"
          }
        }
      },
      "SeasonCollection": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Season"
            }
          },
          "meta": {
            "$ref": "#/components/schemas/CollectionMeta"
          }
        }
      },
      "TeamCollection": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Team"
            }
          },
          "meta": {
            "$ref": "#/components/schemas/CollectionMeta"
          }
        }
      },
      "TeamResource": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/Team"
          },
          "meta": {
            "$ref": "#/components/schemas/ResourceMeta"
          }
        }
      },
      "MatchCollection": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Match"
            }
          },
          "meta": {
            "$ref": "#/components/schemas/CollectionMeta"
          }
        }
      },
      "MatchResource": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/Match"
          },
          "meta": {
            "$ref": "#/components/schemas/ResourceMeta"
          }
        }
      },
      "StandingCollection": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Standing"
            }
          },
          "meta": {
            "$ref": "#/components/schemas/CollectionMeta"
          }
        }
      },
      "Formula1CanonicalId": {
        "type": "string",
        "format": "uuid",
        "description": "Server-assigned Firestore document id."
      },
      "Formula1CompetitionItem": {
        "type": "object",
        "required": [
          "id",
          "name"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/Formula1CanonicalId"
          },
          "name": {
            "type": "string",
            "example": "Monaco Grand Prix"
          }
        }
      },
      "Formula1CompetitionCreateBody": {
        "type": "object",
        "required": [
          "name"
        ],
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string"
          }
        }
      },
      "Formula1CircuitItem": {
        "type": "object",
        "required": [
          "id",
          "name"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/Formula1CanonicalId"
          },
          "name": {
            "type": "string",
            "example": "Circuit de Monaco"
          },
          "image": {
            "type": [
              "string",
              "null"
            ]
          },
          "country": {
            "type": [
              "string",
              "null"
            ],
            "example": "Monaco"
          }
        }
      },
      "Formula1CircuitCreateBody": {
        "type": "object",
        "required": [
          "name"
        ],
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string"
          },
          "image": {
            "type": [
              "string",
              "null"
            ]
          },
          "country": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "Formula1TeamItem": {
        "type": "object",
        "required": [
          "id",
          "name"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/Formula1CanonicalId"
          },
          "name": {
            "type": "string",
            "example": "McLaren"
          },
          "logo": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "Formula1TeamCreateBody": {
        "type": "object",
        "required": [
          "name"
        ],
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string"
          },
          "logo": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "Formula1DriverItem": {
        "type": "object",
        "required": [
          "id",
          "name"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/Formula1CanonicalId"
          },
          "name": {
            "type": "string",
            "example": "Oscar Piastri"
          },
          "number": {
            "type": [
              "integer",
              "null"
            ],
            "example": 81
          },
          "team": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/Formula1TeamItem"
              },
              {
                "type": "null"
              }
            ]
          }
        }
      },
      "Formula1DriverCreateBody": {
        "type": "object",
        "required": [
          "name"
        ],
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string"
          },
          "number": {
            "type": [
              "integer",
              "null"
            ]
          },
          "teamId": {
            "type": [
              "string",
              "null"
            ],
            "format": "uuid"
          }
        }
      },
      "Formula1RaceItem": {
        "type": "object",
        "required": [
          "id",
          "competition",
          "circuit",
          "season",
          "type",
          "date",
          "status"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/Formula1CanonicalId"
          },
          "competition": {
            "$ref": "#/components/schemas/Formula1CompetitionItem"
          },
          "circuit": {
            "$ref": "#/components/schemas/Formula1CircuitItem"
          },
          "season": {
            "type": "integer",
            "example": 2024
          },
          "type": {
            "type": "string",
            "example": "Race"
          },
          "laps": {
            "type": "object",
            "properties": {
              "current": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "total": {
                "type": [
                  "integer",
                  "null"
                ]
              }
            }
          },
          "distance": {
            "type": [
              "string",
              "null"
            ],
            "example": "306.3 Kms"
          },
          "timezone": {
            "type": [
              "string",
              "null"
            ],
            "example": "utc"
          },
          "date": {
            "type": "string",
            "format": "date-time"
          },
          "status": {
            "type": "string",
            "example": "Completed"
          }
        }
      },
      "Formula1RaceCreateBody": {
        "type": "object",
        "required": [
          "competitionId",
          "circuitId",
          "season",
          "type",
          "date",
          "status"
        ],
        "additionalProperties": false,
        "properties": {
          "competitionId": {
            "type": "string",
            "format": "uuid"
          },
          "circuitId": {
            "type": "string",
            "format": "uuid"
          },
          "season": {
            "type": "integer"
          },
          "type": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date-time"
          },
          "status": {
            "type": "string"
          },
          "timezone": {
            "type": [
              "string",
              "null"
            ]
          },
          "distance": {
            "type": [
              "string",
              "null"
            ]
          },
          "laps": {
            "type": "object",
            "properties": {
              "current": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "total": {
                "type": [
                  "integer",
                  "null"
                ]
              }
            }
          }
        }
      },
      "Formula1DriverRankingItem": {
        "type": "object",
        "required": [
          "position",
          "season",
          "driver"
        ],
        "properties": {
          "position": {
            "type": "integer"
          },
          "points": {
            "type": [
              "number",
              "null"
            ]
          },
          "wins": {
            "type": [
              "integer",
              "null"
            ]
          },
          "behind": {
            "type": [
              "number",
              "null"
            ]
          },
          "season": {
            "type": "integer"
          },
          "driver": {
            "type": "object",
            "required": [
              "id",
              "name"
            ],
            "properties": {
              "id": {
                "$ref": "#/components/schemas/Formula1CanonicalId"
              },
              "name": {
                "type": "string"
              },
              "number": {
                "type": [
                  "integer",
                  "null"
                ]
              }
            }
          },
          "team": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/Formula1TeamItem"
              },
              {
                "type": "null"
              }
            ]
          }
        }
      },
      "Formula1DriverRankingCreateBody": {
        "type": "object",
        "required": [
          "driverId",
          "season",
          "position"
        ],
        "additionalProperties": false,
        "properties": {
          "driverId": {
            "type": "string",
            "format": "uuid"
          },
          "season": {
            "type": "integer"
          },
          "position": {
            "type": "integer"
          },
          "points": {
            "type": [
              "number",
              "null"
            ]
          },
          "wins": {
            "type": [
              "integer",
              "null"
            ]
          },
          "behind": {
            "type": [
              "number",
              "null"
            ]
          }
        }
      },
      "Formula1TeamRankingItem": {
        "type": "object",
        "required": [
          "position",
          "season",
          "team"
        ],
        "properties": {
          "position": {
            "type": "integer"
          },
          "points": {
            "type": [
              "number",
              "null"
            ]
          },
          "season": {
            "type": "integer"
          },
          "team": {
            "$ref": "#/components/schemas/Formula1TeamItem"
          }
        }
      },
      "Formula1TeamRankingCreateBody": {
        "type": "object",
        "required": [
          "teamId",
          "season",
          "position"
        ],
        "additionalProperties": false,
        "properties": {
          "teamId": {
            "type": "string",
            "format": "uuid"
          },
          "season": {
            "type": "integer"
          },
          "position": {
            "type": "integer"
          },
          "points": {
            "type": [
              "number",
              "null"
            ]
          }
        }
      },
      "Formula1RaceRankingItem": {
        "type": "object",
        "required": [
          "position",
          "driver"
        ],
        "properties": {
          "position": {
            "type": "integer"
          },
          "time": {
            "type": [
              "string",
              "null"
            ]
          },
          "laps": {
            "type": [
              "integer",
              "null"
            ]
          },
          "grid": {
            "type": [
              "string",
              "null"
            ]
          },
          "pits": {
            "type": [
              "integer",
              "null"
            ]
          },
          "gap": {
            "type": [
              "string",
              "null"
            ]
          },
          "driver": {
            "type": "object",
            "required": [
              "id",
              "name"
            ],
            "properties": {
              "id": {
                "$ref": "#/components/schemas/Formula1CanonicalId"
              },
              "name": {
                "type": "string"
              },
              "number": {
                "type": [
                  "integer",
                  "null"
                ]
              }
            }
          },
          "team": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/Formula1TeamItem"
              },
              {
                "type": "null"
              }
            ]
          }
        }
      },
      "Formula1RaceRankingCreateBody": {
        "type": "object",
        "required": [
          "raceId",
          "driverId",
          "position"
        ],
        "additionalProperties": false,
        "properties": {
          "raceId": {
            "type": "string",
            "format": "uuid"
          },
          "driverId": {
            "type": "string",
            "format": "uuid"
          },
          "position": {
            "type": "integer"
          },
          "time": {
            "type": [
              "string",
              "null"
            ]
          },
          "laps": {
            "type": [
              "integer",
              "null"
            ]
          },
          "grid": {
            "type": [
              "string",
              "null"
            ]
          },
          "pits": {
            "type": [
              "integer",
              "null"
            ]
          },
          "gap": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "Formula1ApiSportsIntegerList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              }
            }
          }
        ]
      },
      "Formula1ApiSportsCompetitionList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Formula1CompetitionItem"
                }
              }
            }
          }
        ]
      },
      "Formula1ApiSportsCircuitList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Formula1CircuitItem"
                }
              }
            }
          }
        ]
      },
      "Formula1ApiSportsTeamList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Formula1TeamItem"
                }
              }
            }
          }
        ]
      },
      "Formula1ApiSportsDriverList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Formula1DriverItem"
                }
              }
            }
          }
        ]
      },
      "Formula1ApiSportsRaceList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Formula1RaceItem"
                }
              }
            }
          }
        ]
      },
      "Formula1ApiSportsDriverRankingList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Formula1DriverRankingItem"
                }
              }
            }
          }
        ]
      },
      "Formula1ApiSportsTeamRankingList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Formula1TeamRankingItem"
                }
              }
            }
          }
        ]
      },
      "Formula1ApiSportsRaceRankingList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Formula1RaceRankingItem"
                }
              }
            }
          }
        ]
      },
      "TennisCanonicalId": {
        "type": "string",
        "format": "uuid",
        "description": "Server-assigned Firestore document id. Permanent for matches across reschedules."
      },
      "TennisCountryRef": {
        "type": "object",
        "required": [
          "code"
        ],
        "properties": {
          "code": {
            "type": "string",
            "example": "US"
          },
          "name": {
            "type": [
              "string",
              "null"
            ]
          },
          "flag": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "TennisPlayerRef": {
        "type": "object",
        "required": [
          "id",
          "fullName",
          "displayName",
          "country"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/TennisCanonicalId"
          },
          "fullName": {
            "type": "string"
          },
          "displayName": {
            "type": "string"
          },
          "photoUrl": {
            "type": [
              "string",
              "null"
            ]
          },
          "country": {
            "$ref": "#/components/schemas/TennisCountryRef"
          }
        }
      },
      "TennisMatchStatus": {
        "type": "string",
        "enum": [
          "pending_competitors",
          "scheduled",
          "live",
          "suspended",
          "postponed",
          "finished",
          "retirement",
          "walkover",
          "disqualification",
          "cancelled"
        ]
      },
      "TennisEntryType": {
        "type": "string",
        "enum": [
          "direct",
          "qualifier",
          "wildcard",
          "lucky_loser",
          "protected_ranking",
          "bye",
          "other"
        ]
      },
      "TennisSetScore": {
        "type": "object",
        "required": [
          "set",
          "competitor1",
          "competitor2"
        ],
        "properties": {
          "set": {
            "type": "integer",
            "minimum": 1
          },
          "competitor1": {
            "type": "integer",
            "minimum": 0
          },
          "competitor2": {
            "type": "integer",
            "minimum": 0
          }
        }
      },
      "TennisPlayerItem": {
        "type": "object",
        "required": [
          "id",
          "fullName",
          "displayName",
          "country",
          "published"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/TennisCanonicalId"
          },
          "fullName": {
            "type": "string",
            "example": "Carlos Alcaraz"
          },
          "displayName": {
            "type": "string",
            "example": "Alcaraz"
          },
          "photoUrl": {
            "type": [
              "string",
              "null"
            ]
          },
          "country": {
            "$ref": "#/components/schemas/TennisCountryRef"
          },
          "published": {
            "type": "boolean"
          },
          "createdAt": {
            "type": [
              "string",
              "null"
            ]
          },
          "updatedAt": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "TennisPlayerCreateBody": {
        "type": "object",
        "required": [
          "fullName",
          "displayName",
          "countryCode"
        ],
        "additionalProperties": false,
        "properties": {
          "fullName": {
            "type": "string"
          },
          "displayName": {
            "type": "string"
          },
          "photoUrl": {
            "type": [
              "string",
              "null"
            ]
          },
          "countryCode": {
            "type": "string",
            "example": "ES"
          },
          "published": {
            "type": "boolean"
          }
        }
      },
      "TennisTournamentItem": {
        "type": "object",
        "required": [
          "id",
          "name",
          "category",
          "gender",
          "eventType",
          "country",
          "startDate",
          "endDate",
          "year",
          "status",
          "published"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/TennisCanonicalId"
          },
          "name": {
            "type": "string",
            "example": "US Open"
          },
          "shortName": {
            "type": [
              "string",
              "null"
            ]
          },
          "category": {
            "type": "string",
            "enum": [
              "grand_slam",
              "atp_1000",
              "wta_1000"
            ]
          },
          "gender": {
            "type": "string",
            "enum": [
              "male",
              "female"
            ]
          },
          "eventType": {
            "type": "string",
            "enum": [
              "singles"
            ]
          },
          "country": {
            "$ref": "#/components/schemas/TennisCountryRef"
          },
          "city": {
            "type": [
              "string",
              "null"
            ]
          },
          "imageUrl": {
            "type": [
              "string",
              "null"
            ]
          },
          "startDate": {
            "type": "string",
            "example": "2026-08-24"
          },
          "endDate": {
            "type": "string",
            "example": "2026-09-13"
          },
          "year": {
            "type": "integer",
            "example": 2026
          },
          "status": {
            "type": "string",
            "enum": [
              "upcoming",
              "active",
              "finished",
              "cancelled"
            ]
          },
          "published": {
            "type": "boolean"
          },
          "publishedAt": {
            "type": [
              "string",
              "null"
            ]
          },
          "createdAt": {
            "type": [
              "string",
              "null"
            ]
          },
          "updatedAt": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "TennisTournamentCreateBody": {
        "type": "object",
        "required": [
          "name",
          "category",
          "gender",
          "countryCode",
          "startDate",
          "endDate",
          "year"
        ],
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string"
          },
          "shortName": {
            "type": [
              "string",
              "null"
            ]
          },
          "category": {
            "type": "string",
            "enum": [
              "grand_slam",
              "atp_1000",
              "wta_1000"
            ]
          },
          "gender": {
            "type": "string",
            "enum": [
              "male",
              "female"
            ]
          },
          "eventType": {
            "type": "string",
            "enum": [
              "singles"
            ]
          },
          "countryCode": {
            "type": "string"
          },
          "city": {
            "type": [
              "string",
              "null"
            ]
          },
          "imageUrl": {
            "type": [
              "string",
              "null"
            ]
          },
          "startDate": {
            "type": "string"
          },
          "endDate": {
            "type": "string"
          },
          "year": {
            "type": "integer"
          },
          "status": {
            "type": "string",
            "enum": [
              "upcoming",
              "active",
              "finished",
              "cancelled"
            ]
          }
        }
      },
      "TennisRoundItem": {
        "type": "object",
        "required": [
          "id",
          "tournamentId",
          "roundNumber",
          "name",
          "status",
          "published"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/TennisCanonicalId"
          },
          "tournamentId": {
            "$ref": "#/components/schemas/TennisCanonicalId"
          },
          "roundNumber": {
            "type": "integer",
            "example": 1
          },
          "name": {
            "type": "string",
            "example": "Round of 64"
          },
          "status": {
            "type": "string",
            "enum": [
              "pending",
              "active",
              "finished"
            ]
          },
          "startDate": {
            "type": [
              "string",
              "null"
            ]
          },
          "endDate": {
            "type": [
              "string",
              "null"
            ]
          },
          "published": {
            "type": "boolean"
          },
          "createdAt": {
            "type": [
              "string",
              "null"
            ]
          },
          "updatedAt": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "TennisRoundCreateBody": {
        "type": "object",
        "required": [
          "tournamentId",
          "roundNumber",
          "name"
        ],
        "additionalProperties": false,
        "properties": {
          "tournamentId": {
            "type": "string",
            "format": "uuid"
          },
          "roundNumber": {
            "type": "integer",
            "minimum": 1
          },
          "name": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": [
              "pending",
              "active",
              "finished"
            ]
          },
          "startDate": {
            "type": [
              "string",
              "null"
            ]
          },
          "endDate": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "TennisRoundNestedCreateBody": {
        "type": "object",
        "required": [
          "roundNumber",
          "name"
        ],
        "additionalProperties": false,
        "properties": {
          "roundNumber": {
            "type": "integer",
            "minimum": 1
          },
          "name": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": [
              "pending",
              "active",
              "finished"
            ]
          },
          "startDate": {
            "type": [
              "string",
              "null"
            ]
          },
          "endDate": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "TennisEntryItem": {
        "type": "object",
        "required": [
          "id",
          "tournamentId",
          "player",
          "published"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/TennisCanonicalId"
          },
          "tournamentId": {
            "$ref": "#/components/schemas/TennisCanonicalId"
          },
          "player": {
            "$ref": "#/components/schemas/TennisPlayerItem"
          },
          "seed": {
            "type": [
              "integer",
              "null"
            ]
          },
          "ranking": {
            "type": [
              "integer",
              "null"
            ]
          },
          "entryType": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/TennisEntryType"
              },
              {
                "type": "null"
              }
            ]
          },
          "published": {
            "type": "boolean"
          },
          "createdAt": {
            "type": [
              "string",
              "null"
            ]
          },
          "updatedAt": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "TennisEntryCreateBody": {
        "type": "object",
        "required": [
          "tournamentId",
          "playerId"
        ],
        "additionalProperties": false,
        "properties": {
          "tournamentId": {
            "type": "string",
            "format": "uuid"
          },
          "playerId": {
            "type": "string",
            "format": "uuid"
          },
          "seed": {
            "type": [
              "integer",
              "null"
            ]
          },
          "ranking": {
            "type": [
              "integer",
              "null"
            ]
          },
          "entryType": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/TennisEntryType"
              },
              {
                "type": "null"
              }
            ]
          }
        }
      },
      "TennisEntryNestedCreateBody": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "playerId": {
            "type": "string",
            "format": "uuid"
          },
          "seed": {
            "type": [
              "integer",
              "null"
            ]
          },
          "ranking": {
            "type": [
              "integer",
              "null"
            ]
          },
          "entryType": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/TennisEntryType"
              },
              {
                "type": "null"
              }
            ]
          }
        }
      },
      "TennisMatchItem": {
        "type": "object",
        "required": [
          "id",
          "tournamentId",
          "roundId",
          "roundNumber",
          "bracketPosition",
          "status",
          "competitorChanged",
          "bracket",
          "published"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/TennisCanonicalId"
          },
          "tournamentId": {
            "$ref": "#/components/schemas/TennisCanonicalId"
          },
          "roundId": {
            "$ref": "#/components/schemas/TennisCanonicalId"
          },
          "roundNumber": {
            "type": "integer"
          },
          "roundName": {
            "type": [
              "string",
              "null"
            ]
          },
          "bracketPosition": {
            "type": "integer"
          },
          "competitor1": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/TennisPlayerRef"
              },
              {
                "type": "null"
              }
            ]
          },
          "competitor2": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/TennisPlayerRef"
              },
              {
                "type": "null"
              }
            ]
          },
          "scheduledAt": {
            "type": [
              "string",
              "null"
            ]
          },
          "timezone": {
            "type": [
              "string",
              "null"
            ]
          },
          "court": {
            "type": [
              "string",
              "null"
            ]
          },
          "status": {
            "$ref": "#/components/schemas/TennisMatchStatus"
          },
          "startedAt": {
            "type": [
              "string",
              "null"
            ]
          },
          "endedAt": {
            "type": [
              "string",
              "null"
            ]
          },
          "competitorChanged": {
            "type": "boolean"
          },
          "bracket": {
            "type": "object",
            "required": [
              "competitor1SourceMatchId",
              "competitor2SourceMatchId",
              "winnerToMatchId",
              "winnerToPosition",
              "competitor1EntryType",
              "competitor2EntryType"
            ],
            "properties": {
              "competitor1SourceMatchId": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "competitor2SourceMatchId": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "winnerToMatchId": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "winnerToPosition": {
                "type": [
                  "string",
                  "null"
                ],
                "enum": [
                  "competitor_1",
                  "competitor_2",
                  null
                ]
              },
              "competitor1EntryType": {
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/TennisEntryType"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "competitor2EntryType": {
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/TennisEntryType"
                  },
                  {
                    "type": "null"
                  }
                ]
              }
            }
          },
          "result": {
            "oneOf": [
              {
                "type": "object",
                "properties": {
                  "winnerId": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "loserId": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "resultType": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "enum": [
                      "normal",
                      "retirement",
                      "walkover",
                      "disqualification",
                      null
                    ]
                  },
                  "setsPlayer1": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "setsPlayer2": {
                    "type": [
                      "integer",
                      "null"
                    ]
                  },
                  "setScores": {
                    "oneOf": [
                      {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/TennisSetScore"
                        }
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "finalScoreDisplay": {
                    "type": [
                      "string",
                      "null"
                    ]
                  }
                }
              },
              {
                "type": "null"
              }
            ]
          },
          "published": {
            "type": "boolean"
          },
          "createdAt": {
            "type": [
              "string",
              "null"
            ]
          },
          "updatedAt": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "TennisMatchCreateBody": {
        "type": "object",
        "required": [
          "tournamentId",
          "roundId",
          "bracketPosition"
        ],
        "additionalProperties": false,
        "properties": {
          "tournamentId": {
            "type": "string",
            "format": "uuid"
          },
          "roundId": {
            "type": "string",
            "format": "uuid"
          },
          "bracketPosition": {
            "type": "integer",
            "minimum": 1
          },
          "competitor1Id": {
            "type": [
              "string",
              "null"
            ],
            "format": "uuid"
          },
          "competitor2Id": {
            "type": [
              "string",
              "null"
            ],
            "format": "uuid"
          },
          "scheduledAt": {
            "type": [
              "string",
              "null"
            ]
          },
          "timezone": {
            "type": [
              "string",
              "null"
            ]
          },
          "court": {
            "type": [
              "string",
              "null"
            ]
          },
          "status": {
            "$ref": "#/components/schemas/TennisMatchStatus"
          },
          "competitor1SourceMatchId": {
            "type": [
              "string",
              "null"
            ],
            "format": "uuid"
          },
          "competitor2SourceMatchId": {
            "type": [
              "string",
              "null"
            ],
            "format": "uuid"
          },
          "winnerToMatchId": {
            "type": [
              "string",
              "null"
            ],
            "format": "uuid"
          },
          "winnerToPosition": {
            "type": [
              "string",
              "null"
            ],
            "enum": [
              "competitor_1",
              "competitor_2",
              null
            ]
          },
          "competitor1EntryType": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/TennisEntryType"
              },
              {
                "type": "null"
              }
            ]
          },
          "competitor2EntryType": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/TennisEntryType"
              },
              {
                "type": "null"
              }
            ]
          }
        }
      },
      "TennisMatchNestedCreateBody": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "roundId": {
            "type": "string",
            "format": "uuid"
          },
          "bracketPosition": {
            "type": "integer",
            "minimum": 1
          },
          "competitor1Id": {
            "type": [
              "string",
              "null"
            ],
            "format": "uuid"
          },
          "competitor2Id": {
            "type": [
              "string",
              "null"
            ],
            "format": "uuid"
          },
          "scheduledAt": {
            "type": [
              "string",
              "null"
            ]
          },
          "timezone": {
            "type": [
              "string",
              "null"
            ]
          },
          "court": {
            "type": [
              "string",
              "null"
            ]
          },
          "status": {
            "$ref": "#/components/schemas/TennisMatchStatus"
          },
          "competitor1SourceMatchId": {
            "type": [
              "string",
              "null"
            ],
            "format": "uuid"
          },
          "competitor2SourceMatchId": {
            "type": [
              "string",
              "null"
            ],
            "format": "uuid"
          },
          "winnerToMatchId": {
            "type": [
              "string",
              "null"
            ],
            "format": "uuid"
          },
          "winnerToPosition": {
            "type": [
              "string",
              "null"
            ],
            "enum": [
              "competitor_1",
              "competitor_2",
              null
            ]
          },
          "competitor1EntryType": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/TennisEntryType"
              },
              {
                "type": "null"
              }
            ]
          },
          "competitor2EntryType": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/TennisEntryType"
              },
              {
                "type": "null"
              }
            ]
          }
        }
      },
      "TennisMatchResultBody": {
        "type": "object",
        "required": [
          "winnerId",
          "resultType"
        ],
        "additionalProperties": false,
        "properties": {
          "winnerId": {
            "type": "string",
            "format": "uuid"
          },
          "loserId": {
            "type": "string",
            "format": "uuid"
          },
          "resultType": {
            "type": "string",
            "enum": [
              "normal",
              "retirement",
              "walkover",
              "disqualification"
            ]
          },
          "setsPlayer1": {
            "type": [
              "integer",
              "null"
            ]
          },
          "setsPlayer2": {
            "type": [
              "integer",
              "null"
            ]
          },
          "setScores": {
            "oneOf": [
              {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/TennisSetScore"
                }
              },
              {
                "type": "null"
              }
            ]
          },
          "finalScoreDisplay": {
            "type": [
              "string",
              "null"
            ]
          },
          "startedAt": {
            "type": [
              "string",
              "null"
            ]
          },
          "endedAt": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "TennisApiSportsPlayerList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/TennisPlayerItem"
                }
              }
            }
          }
        ]
      },
      "TennisApiSportsTournamentList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/TennisTournamentItem"
                }
              }
            }
          }
        ]
      },
      "TennisApiSportsRoundList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/TennisRoundItem"
                }
              }
            }
          }
        ]
      },
      "TennisApiSportsEntryList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/TennisEntryItem"
                }
              }
            }
          }
        ]
      },
      "TennisApiSportsMatchList": {
        "allOf": [
          {
            "$ref": "#/components/schemas/AmericanFootballApiSportsEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "response": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/TennisMatchItem"
                }
              }
            }
          }
        ]
      }
    }
  }
} as const;
