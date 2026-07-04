import { ApiError } from '@/lib/api/errors';
import { parseSeasonParam, parseStringParam } from '@/lib/api/query-validation';

export interface NflCountryQuery {
  name?: string;
}

export interface NflLeagueQuery {
  id?: string;
  name?: string;
  countryId?: string;
  country?: string;
  type?: string;
  seasonYear?: number;
  search?: string;
}

export interface NflGamesQuery {
  id?: string;
  league?: string;
  season?: number;
  team?: string;
  timezone?: string;
}

export interface NflTeamsQuery {
  league?: string;
  season?: number;
}

export interface NflStandingsQuery {
  league?: string;
  season?: number;
  conference?: string;
}

export function parseNflCountryQuery(searchParams: URLSearchParams): NflCountryQuery {
  return { name: parseStringParam(searchParams.get('name')) };
}

export function parseNflLeagueQuery(searchParams: URLSearchParams): NflLeagueQuery {
  return {
    id: parseStringParam(searchParams.get('id')),
    name: parseStringParam(searchParams.get('name')),
    countryId: parseStringParam(searchParams.get('country_id')),
    country: parseStringParam(searchParams.get('country')),
    type: parseStringParam(searchParams.get('type')),
    seasonYear: parseSeasonParam(searchParams.get('season')),
    search: parseStringParam(searchParams.get('search')),
  };
}

export function parseNflGamesQuery(searchParams: URLSearchParams): NflGamesQuery {
  return {
    id: parseStringParam(searchParams.get('id')),
    league: parseStringParam(searchParams.get('league')),
    season: parseSeasonParam(searchParams.get('season')),
    team: parseStringParam(searchParams.get('team')),
    timezone: parseStringParam(searchParams.get('timezone')),
  };
}

export function parseNflTeamsQuery(searchParams: URLSearchParams): NflTeamsQuery {
  return {
    league: parseStringParam(searchParams.get('league')),
    season: parseSeasonParam(searchParams.get('season')),
  };
}

export function parseNflStandingsQuery(searchParams: URLSearchParams): NflStandingsQuery {
  return {
    league: parseStringParam(searchParams.get('league')),
    season: parseSeasonParam(searchParams.get('season')),
    conference: parseStringParam(searchParams.get('conference')),
  };
}

export function requireNflParam(value: string | undefined, paramName: string): string {
  if (!value) {
    throw new ApiError('INVALID_QUERY_PARAMETER', `The "${paramName}" parameter is required.`);
  }
  return value;
}

export function requireNflSeason(value: number | undefined): number {
  if (value == null) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "season" parameter is required.');
  }
  return value;
}
