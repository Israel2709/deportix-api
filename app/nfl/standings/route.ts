import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  nflBffDeleteRoute,
  nflBffGetRoute,
  nflBffPatchRoute,
  nflBffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseNflStandingsQuery } from '@/lib/bff/nfl/query-params';
import { fetchNflStandings } from '@/lib/bff/nfl/services/standings.service';
import {
  createNflStandingEntry,
  deleteNflStandingEntry,
  updateNflStandingEntry,
} from '@/lib/bff/nfl/writers/standings.writer';
import { ApiError } from '@/lib/api/errors';

export const runtime = 'nodejs';

export const GET = nflBffGetRoute('standings')(async ({ searchParams }) => {
  const response = await fetchNflStandings(parseNflStandingsQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = nflBffPostRoute('standings')(async ({ body }) => {
  const standing = await createNflStandingEntry(body);
  return { response: [standing], status: 201 };
});

export const PATCH = nflBffPatchRoute('standings')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const standing = await updateNflStandingEntry(id, body);
  return { response: [standing] };
});

export const DELETE = nflBffDeleteRoute('standings')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteNflStandingEntry(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
