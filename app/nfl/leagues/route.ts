import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  nflBffDeleteRoute,
  nflBffGetRoute,
  nflBffPatchRoute,
  nflBffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseNflLeagueQuery } from '@/lib/bff/nfl/query-params';
import { fetchNflLeagues } from '@/lib/bff/nfl/services/leagues.service';
import {
  createNflLeagueEntry,
  deleteNflLeagueEntry,
  updateNflLeagueEntry,
} from '@/lib/bff/nfl/writers/catalog.writer';
import { ApiError } from '@/lib/api/errors';

export const runtime = 'nodejs';

export const GET = nflBffGetRoute('leagues')(async ({ searchParams }) => {
  const response = await fetchNflLeagues(parseNflLeagueQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = nflBffPostRoute('leagues')(async ({ body }) => {
  const league = await createNflLeagueEntry(body);
  return { response: [league], status: 201 };
});

export const PATCH = nflBffPatchRoute('leagues')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const league = await updateNflLeagueEntry(id, body);
  return { response: [league] };
});

export const DELETE = nflBffDeleteRoute('leagues')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteNflLeagueEntry(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
