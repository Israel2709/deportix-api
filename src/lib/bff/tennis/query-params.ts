import { ApiError } from '@/lib/api/errors';
import { parseEnumParam, parseSeasonParam, parseStringParam } from '@/lib/api/query-validation';
import {
  MATCH_STATUSES,
  TENNIS_CATEGORIES,
  TENNIS_GENDERS,
  TOURNAMENT_STATUSES,
} from './schemas/primitives';

export type PublishedFilter = 'true' | 'false' | 'all';

export interface TennisPlayersQuery {
  id?: string;
  search?: string;
  country?: string;
  published: PublishedFilter;
}

export interface TennisTournamentsQuery {
  id?: string;
  year?: number;
  category?: string;
  gender?: string;
  status?: string;
  search?: string;
  published: PublishedFilter;
}

export interface TennisRoundsQuery {
  id?: string;
  tournamentId?: string;
  published: PublishedFilter;
}

export interface TennisEntriesQuery {
  id?: string;
  tournamentId?: string;
  playerId?: string;
  search?: string;
  published: PublishedFilter;
}

export interface TennisMatchesQuery {
  id?: string;
  tournamentId?: string;
  roundId?: string;
  status?: string;
  published: PublishedFilter;
}

function parsePublished(searchParams: URLSearchParams): PublishedFilter {
  const value = parseEnumParam(searchParams.get('published'), ['true', 'false', 'all'], 'published');
  return (value as PublishedFilter | undefined) ?? 'true';
}

export function parseTennisPlayersQuery(searchParams: URLSearchParams): TennisPlayersQuery {
  return {
    id: parseStringParam(searchParams.get('id')),
    search: parseStringParam(searchParams.get('search')),
    country: parseStringParam(searchParams.get('country')),
    published: parsePublished(searchParams),
  };
}

export function parseTennisTournamentsQuery(searchParams: URLSearchParams): TennisTournamentsQuery {
  return {
    id: parseStringParam(searchParams.get('id')),
    year: parseSeasonParam(searchParams.get('year')) ?? parseSeasonParam(searchParams.get('season')),
    category: parseEnumParam(searchParams.get('category'), [...TENNIS_CATEGORIES], 'category'),
    gender: parseEnumParam(searchParams.get('gender'), [...TENNIS_GENDERS], 'gender'),
    status: parseEnumParam(searchParams.get('status'), [...TOURNAMENT_STATUSES], 'status'),
    search: parseStringParam(searchParams.get('search')),
    published: parsePublished(searchParams),
  };
}

export function parseTennisRoundsQuery(searchParams: URLSearchParams): TennisRoundsQuery {
  return {
    id: parseStringParam(searchParams.get('id')),
    tournamentId: parseStringParam(searchParams.get('tournament')),
    published: parsePublished(searchParams),
  };
}

export function parseTennisEntriesQuery(searchParams: URLSearchParams): TennisEntriesQuery {
  return {
    id: parseStringParam(searchParams.get('id')),
    tournamentId: parseStringParam(searchParams.get('tournament')),
    playerId: parseStringParam(searchParams.get('player')),
    search: parseStringParam(searchParams.get('search')),
    published: parsePublished(searchParams),
  };
}

export function parseTennisMatchesQuery(searchParams: URLSearchParams): TennisMatchesQuery {
  return {
    id: parseStringParam(searchParams.get('id')),
    tournamentId: parseStringParam(searchParams.get('tournament')),
    roundId: parseStringParam(searchParams.get('round')),
    status: parseEnumParam(searchParams.get('status'), [...MATCH_STATUSES], 'status'),
    published: parsePublished(searchParams),
  };
}

export function requireTennisParam(value: string | undefined, paramName: string): string {
  if (!value) {
    throw new ApiError('INVALID_QUERY_PARAMETER', `The "${paramName}" parameter is required.`);
  }
  return value;
}

export function matchesPublishedFilter(isPublished: boolean, filter: PublishedFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'false') return !isPublished;
  return isPublished;
}
