import { ApiError } from '@/lib/api/errors';
import { parseDateParam, parseSeasonParam, parseStringParam } from '@/lib/api/query-validation';

export interface FixtureQuery {
  id?: string;
  ids?: string[];
  live?: boolean;
  date?: string;
  leagueExternalId?: string;
  seasonYear?: number;
  teamExternalId?: string;
  last?: number;
  next?: number;
  from?: string;
  to?: string;
  round?: string;
  status?: string;
  venue?: string;
  timezone?: string;
}

export interface LeagueQuery {
  id?: string;
  country?: string;
  seasonYear?: number;
  current?: boolean;
}

export interface StandingsQuery {
  leagueExternalId?: string;
  seasonYear?: number;
}

export interface RoundsQuery {
  leagueExternalId?: string;
  seasonYear?: number;
  current?: boolean;
}

export interface CountryQuery {
  name?: string;
  code?: string;
}

export interface TeamQuery {
  league: string;
  season?: string | number;
}

function parseBooleanParam(value: string | null): boolean | undefined {
  if (value == null || value === '') return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  throw new ApiError('INVALID_QUERY_PARAMETER', 'Boolean query parameters must be "true" or "false".');
}

function parsePositiveInt(value: string | null, paramName: string): number | undefined {
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ApiError(
      'INVALID_QUERY_PARAMETER',
      `The "${paramName}" parameter must be a positive integer.`,
    );
  }
  return parsed;
}

function parseIdsParam(value: string | null): string[] | undefined {
  const raw = parseStringParam(value);
  if (!raw) return undefined;
  return raw
    .split('-')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseCountryQuery(searchParams: URLSearchParams): CountryQuery {
  return {
    name: parseStringParam(searchParams.get('name')),
    code: parseStringParam(searchParams.get('code')),
  };
}

export function parseLeagueQuery(searchParams: URLSearchParams): LeagueQuery {
  return {
    id: parseStringParam(searchParams.get('id')),
    country: parseStringParam(searchParams.get('country')),
    seasonYear: parseSeasonParam(searchParams.get('season')),
    current: parseBooleanParam(searchParams.get('current')),
  };
}

export function parseFixtureQuery(searchParams: URLSearchParams): FixtureQuery {
  const date = parseDateParam(searchParams.get('date'), 'date');
  const from = parseDateParam(searchParams.get('from'), 'from');
  const to = parseDateParam(searchParams.get('to'), 'to');
  if (date && (from || to)) {
    throw new ApiError(
      'INVALID_QUERY_PARAMETER',
      'The "date" parameter cannot be combined with "from"/"to".',
    );
  }

  return {
    id: parseStringParam(searchParams.get('id')),
    ids: parseIdsParam(searchParams.get('ids')),
    live: parseBooleanParam(searchParams.get('live')),
    date,
    leagueExternalId: parseStringParam(searchParams.get('league')),
    seasonYear: parseSeasonParam(searchParams.get('season')),
    teamExternalId: parseStringParam(searchParams.get('team')),
    last: parsePositiveInt(searchParams.get('last'), 'last'),
    next: parsePositiveInt(searchParams.get('next'), 'next'),
    from,
    to,
    round: parseStringParam(searchParams.get('round')),
    status: parseStringParam(searchParams.get('status')),
    venue: parseStringParam(searchParams.get('venue')),
    timezone: parseStringParam(searchParams.get('timezone')),
  };
}

export function parseStandingsQuery(searchParams: URLSearchParams): StandingsQuery {
  return {
    leagueExternalId: parseStringParam(searchParams.get('league')),
    seasonYear: parseSeasonParam(searchParams.get('season')),
  };
}

export function parseRoundsQuery(searchParams: URLSearchParams): RoundsQuery {
  return {
    leagueExternalId: parseStringParam(searchParams.get('league')),
    seasonYear: parseSeasonParam(searchParams.get('season')),
    current: parseBooleanParam(searchParams.get('current')),
  };
}

export function requireLeagueExternalId(value: string | undefined, paramName = 'league'): string {
  if (!value) {
    throw new ApiError('INVALID_QUERY_PARAMETER', `The "${paramName}" parameter is required.`);
  }
  return value;
}

export function requireSeasonYear(value: number | undefined): number {
  if (value == null) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "season" parameter is required.');
  }
  return value;
}

export function parseTeamQuery(searchParams: URLSearchParams): TeamQuery {
  const league = requireLeagueExternalId(parseStringParam(searchParams.get('league')));
  const season = parseSeasonParam(searchParams.get('season'));
  return { league, season };
}
