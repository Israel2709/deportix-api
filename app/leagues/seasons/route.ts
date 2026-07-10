import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffGetRoute,
  bffOptionsRoute,
  soccerBffDeleteRoute,
  soccerBffPatchRoute,
  soccerBffPostRoute,
  soccerBffPutRoute,
  type BffWriteHandler,
} from '@/lib/bff/football/handler';
import {
  fetchFootballGlobalSeasons,
  fetchFootballSeasonYearsForLeague,
} from '@/lib/bff/football/services/leagues.service';
import {
  createSoccerSeasonYear,
  deleteSoccerSeasonYear,
  updateSoccerSeasonYear,
} from '@/lib/bff/football/writers/catalog.writer';

export const runtime = 'nodejs';

function requireLeagueParam(searchParams: URLSearchParams): string {
  const league = searchParams.get('league')?.trim();
  if (!league) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "league" parameter is required.');
  }
  return league;
}

export const GET = bffGetRoute(async ({ searchParams }) => {
  const league = searchParams.get('league')?.trim();
  const response = league
    ? await fetchFootballSeasonYearsForLeague(league)
    : await fetchFootballGlobalSeasons();
  return { response, cache: CACHE.standard };
});

export const POST = soccerBffPostRoute('seasons')(async ({ searchParams, body }) => {
  const league = requireLeagueParam(searchParams);
  const year = await createSoccerSeasonYear(body, league);
  return { response: [year], status: 201 };
});

const patchSeason: BffWriteHandler = async ({ searchParams, body }) => {
  const league = requireLeagueParam(searchParams);
  const year = await updateSoccerSeasonYear(body, league);
  return { response: [year] };
};

export const PATCH = soccerBffPatchRoute('seasons')(patchSeason);
export const PUT = soccerBffPutRoute('seasons')(patchSeason);

export const DELETE = soccerBffDeleteRoute('seasons')(async ({ searchParams, body }) => {
  const league = requireLeagueParam(searchParams);
  await deleteSoccerSeasonYear(body, league);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
