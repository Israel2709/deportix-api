/**
 * Sport registry — the adapter that lets generic public routes
 * (`/v1/leagues/{id}/teams|matches|standings`, `/v1/teams/{id}`) work over the
 * sport-specific, flat Firestore collections (`soccer_*`, `nfl_*`, ...).
 *
 * A league document references a sport; resolving the sport slug picks the right
 * collections and field names from this table. Adding a new sport = one entry here.
 */

export type SportSlug = 'soccer' | 'american-football' | 'f1' | 'tennis';

export interface SportConfig {
  slug: SportSlug;
  collections: {
    teams: string;
    matches: string;
    standings: string;
    rounds?: string;
  };
  /** Field on a match/game document holding its date (denormalized for filtering). */
  matchDateField: string;
  /** Field holding the match status code. */
  statusField: string;
  homeTeamField: string;
  awayTeamField: string;
  /**
   * Whether the generic league/team endpoints can serve this sport. F1 and tennis have
   * fundamentally different models and are excluded from generic team/match/standings
   * endpoints (they still appear in /sports and /data-status).
   */
  genericEndpointsSupported: boolean;
}

export const SPORTS: Record<SportSlug, SportConfig> = {
  soccer: {
    slug: 'soccer',
    collections: {
      teams: 'soccer_teams',
      matches: 'soccer_matches',
      standings: 'soccer_standings',
      rounds: 'soccer_rounds',
    },
    matchDateField: 'fixture_date',
    statusField: 'status',
    homeTeamField: 'home_team_id',
    awayTeamField: 'away_team_id',
    genericEndpointsSupported: true,
  },
  'american-football': {
    slug: 'american-football',
    collections: {
      teams: 'nfl_teams',
      matches: 'nfl_games',
      standings: 'nfl_standings',
    },
    matchDateField: 'game_date',
    statusField: 'status',
    homeTeamField: 'home_team_id',
    awayTeamField: 'away_team_id',
    genericEndpointsSupported: true,
  },
  f1: {
    slug: 'f1',
    collections: {
      teams: 'f1_teams',
      matches: 'f1_races',
      standings: 'f1_rankings',
    },
    matchDateField: 'race_date',
    statusField: 'status',
    homeTeamField: '',
    awayTeamField: '',
    genericEndpointsSupported: false,
  },
  tennis: {
    slug: 'tennis',
    collections: {
      teams: 'tennis_players',
      matches: 'tennis_matches',
      standings: 'tennis_entries',
      rounds: 'tennis_rounds',
    },
    matchDateField: 'scheduled_at',
    statusField: 'status',
    homeTeamField: 'competitor_1_id',
    awayTeamField: 'competitor_2_id',
    genericEndpointsSupported: false,
  },
};

/** Flat F1 Firestore collections (Formula 1 BFF — not served by generic /v1 league routes). */
export const F1_COLLECTIONS = {
  competitions: 'f1_competitions',
  circuits: 'f1_circuits',
  drivers: 'f1_drivers',
  teams: 'f1_teams',
  races: 'f1_races',
  driverRankings: 'f1_rankings',
  teamRankings: 'f1_team_rankings',
  raceRankings: 'f1_race_rankings',
} as const;

/** Flat tennis Firestore collections (Tennis BFF — not served by generic /v1 league routes). */
export const TENNIS_COLLECTIONS = {
  players: 'tennis_players',
  tournaments: 'tennis_tournaments',
  rounds: 'tennis_rounds',
  entries: 'tennis_entries',
  matches: 'tennis_matches',
} as const;

export const SPORT_SLUGS = Object.keys(SPORTS) as SportSlug[];

/** Collections that hold teams across all sports — used to look up a team by id. */
export const TEAM_COLLECTIONS: { sport: SportSlug; collection: string }[] = SPORT_SLUGS.map(
  (slug) => ({ sport: slug, collection: SPORTS[slug].collections.teams }),
);

export function getSportConfig(slug: string | null | undefined): SportConfig | null {
  if (!slug) return null;
  return (SPORTS as Record<string, SportConfig>)[slug] ?? null;
}

export function isSportSlug(slug: string | null | undefined): slug is SportSlug {
  return typeof slug === 'string' && slug in SPORTS;
}
