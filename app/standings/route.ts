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
import { parseStandingsQuery } from '@/lib/bff/football/query-params';
import { fetchFootballStandings } from '@/lib/bff/football/services/standings.service';
import {
  createSoccerStandingEntry,
  deleteSoccerStandingEntry,
  updateSoccerStandingEntry,
} from '@/lib/bff/football/writers/standings.writer';

export const runtime = 'nodejs';

export const GET = bffGetRoute(async ({ searchParams }) => {
  const response = await fetchFootballStandings(parseStandingsQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = soccerBffPostRoute('standings')(async ({ body }) => {
  const standing = await createSoccerStandingEntry(body);
  return { response: [standing], status: 201 };
});

const patchStanding: BffWriteHandler = async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const standing = await updateSoccerStandingEntry(id, body);
  return { response: [standing] };
};

export const PATCH = soccerBffPatchRoute('standings')(patchStanding);
export const PUT = soccerBffPutRoute('standings')(patchStanding);

export const DELETE = soccerBffDeleteRoute('standings')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteSoccerStandingEntry(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
