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
import { parseLeagueQuery } from '@/lib/bff/football/query-params';
import { fetchFootballLeagues } from '@/lib/bff/football/services/leagues.service';
import {
  createSoccerLeagueEntry,
  deleteSoccerLeagueEntry,
  updateSoccerLeagueEntry,
} from '@/lib/bff/football/writers/catalog.writer';

export const runtime = 'nodejs';

export const GET = bffGetRoute(async ({ searchParams }) => {
  const response = await fetchFootballLeagues(parseLeagueQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = soccerBffPostRoute('leagues')(async ({ body }) => {
  const league = await createSoccerLeagueEntry(body);
  return { response: [league], status: 201 };
});

const patchLeague: BffWriteHandler = async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const league = await updateSoccerLeagueEntry(id, body);
  return { response: [league] };
};

export const PATCH = soccerBffPatchRoute('leagues')(patchLeague);
export const PUT = soccerBffPutRoute('leagues')(patchLeague);

export const DELETE = soccerBffDeleteRoute('leagues')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteSoccerLeagueEntry(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
