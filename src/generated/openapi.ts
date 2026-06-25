/* AUTO-GENERATED from openapi/openapi.yaml by scripts/build-openapi.ts. Do not edit by hand. */
export const openapiDocument = {
  "openapi": "3.1.0",
  "info": {
    "title": "Deportix API",
    "description": "**Deportix API** is a public, read-only sports-data API powered by Cloud Firestore.\n\nIt exposes leagues, seasons, teams, matches and standings for the sports currently\nloaded into the platform. All endpoints are versioned under `/v1` and return data in a\nuniform envelope.\n\n## MVP notes & limitations\n- **Mostly read-only.** All list/get endpoints use `GET`. Match management is available via\n  `POST /v1/leagues/{leagueId}/matches` (create in the current season),\n  `PATCH /v1/leagues/{leagueId}/matches/{matchId}` (partial update) and\n  `DELETE /v1/leagues/{leagueId}/matches/{matchId}` (permanent removal). Authentication\n  and rate limiting are not enforced yet; access is restricted operationally to authorized\n  platform users.\n- **Partial coverage is expected.** The platform is fed manually. Some resources may be\n  empty or incomplete. Use `GET /v1/data-status` to discover exactly what is available.\n- **NFL coverage is partial and evolving** as data is loaded; some NFL sub-resources may\n  return empty collections or be unavailable.\n- **Liga MX — Apertura 2026** starts in July 2026; depending on load progress, matches\n  and standings may not yet exist even when teams do.\n- **CORS is open** (`Access-Control-Allow-Origin: *`) on read endpoints. CORS is not a\n  security mechanism for a public API; it only governs browser reads.\n- **Dates** are ISO-8601 and interpreted in **UTC**.\n\n## Identifiers\nPath identifiers (`leagueId`, `teamId`) are the resource's stable id as returned by the\nAPI. The external provider id is also accepted as a fallback lookup.\n",
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
                        "sport": "nfl",
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
                        "slug": "nfl",
                        "name": "NFL",
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
            "description": "Filter leagues by sport slug (e.g. `soccer`, `nfl`).",
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
        "summary": "Create a match in the current season",
        "description": "Creates a new match for the league's **current season** (the season marked `current`,\nor the most recent one as a fallback). The match is always assigned to that season;\nthere is no way to target a different season via this endpoint.\n\n`home.teamId` and `away.teamId` must refer to teams belonging to the league (API id or\nprovider `externalId`). Team names and logos are denormalized from the league roster when\nomitted in the body.\n\nReturns `201 Created` with the new match in the standard resource envelope.\n",
        "operationId": "createLeagueMatch",
        "parameters": [
          {
            "$ref": "#/components/parameters/leagueId"
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
    "/v1/openapi.json": {
      "get": {
        "tags": [
          "Meta"
        ],
        "summary": "OpenAPI document",
        "description": "This document, served as JSON. Source of truth for the API contract.",
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
      }
    },
    "schemas": {
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
        "description": "Payload to create a match in the league's current season. `status` defaults to `NS`\nwhen omitted; scores default to `null`.\n",
        "properties": {
          "externalId": {
            "type": [
              "string",
              "null"
            ]
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
      }
    }
  }
} as const;
