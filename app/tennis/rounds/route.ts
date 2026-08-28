import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  tennisBffDeleteRoute,
  tennisBffGetRoute,
  tennisBffPatchRoute,
  tennisBffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseTennisRoundsQuery } from '@/lib/bff/tennis/query-params';
import { fetchTennisRounds } from '@/lib/bff/tennis/services/rounds.service';
import {
  createTennisRound,
  deleteTennisRound,
  updateTennisRound,
} from '@/lib/bff/tennis/writers/rounds.writer';

export const runtime = 'nodejs';

export const GET = tennisBffGetRoute('rounds')(async ({ searchParams }) => {
  const response = await fetchTennisRounds(parseTennisRoundsQuery(searchParams));
  return { response, cache: CACHE.none };
});

export const POST = tennisBffPostRoute('rounds')(async ({ body }) => {
  const item = await createTennisRound(body);
  return { response: [item], status: 201 };
});

export const PATCH = tennisBffPatchRoute('rounds')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateTennisRound(id, body);
  return { response: [item] };
});

export const DELETE = tennisBffDeleteRoute('rounds')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteTennisRound(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
