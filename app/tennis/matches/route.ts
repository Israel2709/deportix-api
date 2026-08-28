import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  tennisBffDeleteRoute,
  tennisBffGetRoute,
  tennisBffPatchRoute,
  tennisBffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseTennisMatchesQuery } from '@/lib/bff/tennis/query-params';
import { fetchTennisMatches } from '@/lib/bff/tennis/services/matches.service';
import {
  createTennisMatch,
  deleteTennisMatch,
  updateTennisMatch,
} from '@/lib/bff/tennis/writers/matches.writer';

export const runtime = 'nodejs';

export const GET = tennisBffGetRoute('matches')(async ({ searchParams }) => {
  const response = await fetchTennisMatches(parseTennisMatchesQuery(searchParams));
  return { response, cache: CACHE.none };
});

export const POST = tennisBffPostRoute('matches')(async ({ body }) => {
  const item = await createTennisMatch(body);
  return { response: [item], status: 201 };
});

export const PATCH = tennisBffPatchRoute('matches')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateTennisMatch(id, body);
  return { response: [item] };
});

export const DELETE = tennisBffDeleteRoute('matches')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteTennisMatch(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
