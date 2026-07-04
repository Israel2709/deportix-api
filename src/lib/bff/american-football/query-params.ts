import { ApiError } from '@/lib/api/errors';
import { parseSeasonParam, parseStringParam } from '@/lib/api/query-validation';

export interface AmericanFootballCountryQuery {
  name?: string;
}

export interface AmericanFootballLeagueQuery {
  id?: string;
  name?: string;
  countryId?: string;
  country?: string;
  type?: string;
  seasonYear?: number;
  search?: string;
}

export interface AmericanFootballGamesQuery {
  id?: string;
  league?: string;
  season?: number;
  team?: string;
  timezone?: string;
}

export interface AmericanFootballTeamsQuery {
  league?: string;
  season?: number;
}

export interface AmericanFootballStandingsQuery {
  league?: string;
  season?: number;
  conference?: string;
}

export function parseAmericanFootballCountryQuery(searchParams: URLSearchParams): AmericanFootballCountryQuery {
  return { name: parseStringParam(searchParams.get('name')) };
}

export function parseAmericanFootballLeagueQuery(searchParams: URLSearchParams): AmericanFootballLeagueQuery {
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

export function parseAmericanFootballGamesQuery(searchParams: URLSearchParams): AmericanFootballGamesQuery {
  return {
    id: parseStringParam(searchParams.get('id')),
    league: parseStringParam(searchParams.get('league')),
    season: parseSeasonParam(searchParams.get('season')),
    team: parseStringParam(searchParams.get('team')),
    timezone: parseStringParam(searchParams.get('timezone')),
  };
}

export function parseAmericanFootballTeamsQuery(searchParams: URLSearchParams): AmericanFootballTeamsQuery {
  return {
    league: parseStringParam(searchParams.get('league')),
    season: parseSeasonParam(searchParams.get('season')),
  };
}

export function parseAmericanFootballStandingsQuery(searchParams: URLSearchParams): AmericanFootballStandingsQuery {
  return {
    league: parseStringParam(searchParams.get('league')),
    season: parseSeasonParam(searchParams.get('season')),
    conference: parseStringParam(searchParams.get('conference')),
  };
}

export function requireAmericanFootballParam(value: string | undefined, paramName: string): string {
  if (!value) {
    throw new ApiError('INVALID_QUERY_PARAMETER', `The "${paramName}" parameter is required.`);
  }
  return value;
}

export function requireAmericanFootballSeason(value: number | undefined): number {
  if (value == null) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "season" parameter is required.');
  }
  return value;
}
