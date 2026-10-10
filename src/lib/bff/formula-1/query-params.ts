import { ApiError } from '@/lib/api/errors';
import { parseSeasonParam, parseStringParam } from '@/lib/api/query-validation';

export interface Formula1IdNameQuery {
  id?: string;
  name?: string;
  search?: string;
}

export interface Formula1CompetitionQuery extends Formula1IdNameQuery {
  /** Year matching competition `seasonId` (string year, e.g. `2026`). */
  season?: number;
  /** Match against `location.country`. */
  country?: string;
}

export interface Formula1CircuitQuery extends Formula1IdNameQuery {
  country?: string;
}

export interface Formula1DriverQuery extends Formula1IdNameQuery {
  team?: string;
}

export interface Formula1RacesQuery {
  id?: string;
  season?: number;
  competition?: string;
  type?: string;
  date?: string;
}

export interface Formula1DriverRankingsQuery {
  season?: number;
  driver?: string;
  team?: string;
}

export interface Formula1TeamRankingsQuery {
  season?: number;
  team?: string;
}

export interface Formula1RaceRankingsQuery {
  race?: string;
}

export type Formula1StartingGridQuery = Formula1RaceRankingsQuery;
export type Formula1FastestLapsQuery = Formula1RaceRankingsQuery;
export type Formula1PitstopsQuery = Formula1RaceRankingsQuery;

export interface Formula1EntriesQuery {
  id?: string;
  competitionId?: string;
  season?: number;
  driverId?: string;
  teamId?: string;
}

export function parseFormula1IdNameQuery(searchParams: URLSearchParams): Formula1IdNameQuery {
  return {
    id: parseStringParam(searchParams.get('id')),
    name: parseStringParam(searchParams.get('name')),
    search: parseStringParam(searchParams.get('search')),
  };
}

export function parseFormula1CompetitionQuery(
  searchParams: URLSearchParams,
): Formula1CompetitionQuery {
  return {
    ...parseFormula1IdNameQuery(searchParams),
    season: parseSeasonParam(searchParams.get('season')),
    country: parseStringParam(searchParams.get('country')),
  };
}

export function parseFormula1CircuitQuery(searchParams: URLSearchParams): Formula1CircuitQuery {
  return {
    ...parseFormula1IdNameQuery(searchParams),
    country: parseStringParam(searchParams.get('country')),
  };
}

export function parseFormula1DriverQuery(searchParams: URLSearchParams): Formula1DriverQuery {
  return {
    ...parseFormula1IdNameQuery(searchParams),
    team: parseStringParam(searchParams.get('team')),
  };
}

export function parseFormula1RacesQuery(searchParams: URLSearchParams): Formula1RacesQuery {
  return {
    id: parseStringParam(searchParams.get('id')),
    season: parseSeasonParam(searchParams.get('season')),
    competition: parseStringParam(searchParams.get('competition')),
    type: parseStringParam(searchParams.get('type')),
    date: parseStringParam(searchParams.get('date')),
  };
}

export function parseFormula1DriverRankingsQuery(
  searchParams: URLSearchParams,
): Formula1DriverRankingsQuery {
  return {
    season: parseSeasonParam(searchParams.get('season')),
    driver: parseStringParam(searchParams.get('driver')),
    team: parseStringParam(searchParams.get('team')),
  };
}

export function parseFormula1TeamRankingsQuery(
  searchParams: URLSearchParams,
): Formula1TeamRankingsQuery {
  return {
    season: parseSeasonParam(searchParams.get('season')),
    team: parseStringParam(searchParams.get('team')),
  };
}

export function parseFormula1RaceRankingsQuery(
  searchParams: URLSearchParams,
): Formula1RaceRankingsQuery {
  return {
    race: parseStringParam(searchParams.get('race')),
  };
}

export const parseFormula1StartingGridQuery = parseFormula1RaceRankingsQuery;
export const parseFormula1FastestLapsQuery = parseFormula1RaceRankingsQuery;
export const parseFormula1PitstopsQuery = parseFormula1RaceRankingsQuery;

export function parseFormula1EntriesQuery(
  searchParams: URLSearchParams,
): Formula1EntriesQuery {
  return {
    id: parseStringParam(searchParams.get('id')),
    competitionId: parseStringParam(searchParams.get('competition')),
    season: parseSeasonParam(searchParams.get('season')),
    driverId: parseStringParam(searchParams.get('driver')),
    teamId: parseStringParam(searchParams.get('team')),
  };
}

export function requireFormula1Param(value: string | undefined, paramName: string): string {
  if (!value) {
    throw new ApiError('INVALID_QUERY_PARAMETER', `The "${paramName}" parameter is required.`);
  }
  return value;
}

export function requireFormula1Season(value: number | undefined): number {
  if (value == null) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "season" parameter is required.');
  }
  return value;
}
