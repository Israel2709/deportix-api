import { ApiError } from '@/lib/api/errors';

function optionalString(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key)?.trim();
  return value ? value : undefined;
}

function optionalInt(params: URLSearchParams, key: string): number | undefined {
  const raw = params.get(key)?.trim();
  if (!raw) return undefined;
  const value = Number(raw);
  if (!Number.isInteger(value)) {
    throw new ApiError('INVALID_QUERY_PARAMETER', `The "${key}" parameter must be an integer.`);
  }
  return value;
}

export function parseFormulaOneIdFilter(params: URLSearchParams) {
  return {
    id: optionalString(params, 'id'),
    search: optionalString(params, 'search'),
  };
}

export function parseFormulaOneDriversQuery(params: URLSearchParams) {
  return {
    ...parseFormulaOneIdFilter(params),
    team: optionalString(params, 'team'),
  };
}

export function parseFormulaOneRacesQuery(params: URLSearchParams) {
  return {
    id: optionalString(params, 'id'),
    season: optionalInt(params, 'season'),
    type: optionalString(params, 'type'),
    circuit: optionalString(params, 'circuit'),
    competition: optionalString(params, 'competition'),
  };
}

export function parseFormulaOneSeasonRankingsQuery(params: URLSearchParams) {
  const season = optionalInt(params, 'season');
  if (season == null) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "season" parameter is required.');
  }
  return {
    season,
    driver: optionalString(params, 'driver'),
    team: optionalString(params, 'team'),
    id: optionalString(params, 'id'),
  };
}

export function parseFormulaOneTeamRankingsQuery(params: URLSearchParams) {
  const season = optionalInt(params, 'season');
  if (season == null) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "season" parameter is required.');
  }
  return {
    season,
    team: optionalString(params, 'team'),
    id: optionalString(params, 'id'),
  };
}

export function parseFormulaOneRaceRankingsQuery(params: URLSearchParams) {
  const race = optionalString(params, 'race');
  if (!race) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "race" parameter is required.');
  }
  return {
    race,
    driver: optionalString(params, 'driver'),
    team: optionalString(params, 'team'),
    id: optionalString(params, 'id'),
  };
}
