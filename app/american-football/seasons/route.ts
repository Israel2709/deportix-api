import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  americanFootballBffDeleteRoute,
  americanFootballBffGetRoute,
  americanFootballBffPostRoute,
} from '@/lib/bff/shared/handler';
import {
  fetchAmericanFootballGlobalSeasons,
  fetchAmericanFootballSeasonYearsForLeague,
} from '@/lib/bff/american-football/services/leagues.service';
import { createAmericanFootballSeasonYear, deleteAmericanFootballSeasonYear } from '@/lib/bff/american-football/writers/catalog.writer';

export const runtime = 'nodejs';

function requireLeagueParam(searchParams: URLSearchParams): string {
  const league = searchParams.get('league')?.trim();
  if (!league) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "league" parameter is required.');
  }
  return league;
}

export const GET = americanFootballBffGetRoute('seasons')(async ({ searchParams }) => {
  const league = searchParams.get('league')?.trim();
  const response = league
    ? await fetchAmericanFootballSeasonYearsForLeague(league)
    : await fetchAmericanFootballGlobalSeasons();
  return { response, cache: CACHE.standard };
});

export const POST = americanFootballBffPostRoute('seasons')(async ({ searchParams, body }) => {
  const league = requireLeagueParam(searchParams);
  const year = await createAmericanFootballSeasonYear(body, league);
  return { response: [year], status: 201 };
});

export const DELETE = americanFootballBffDeleteRoute('seasons')(async ({ searchParams, body }) => {
  const league = requireLeagueParam(searchParams);
  await deleteAmericanFootballSeasonYear(body, league);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
