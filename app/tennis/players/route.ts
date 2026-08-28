import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  tennisBffDeleteRoute,
  tennisBffGetRoute,
  tennisBffPatchRoute,
  tennisBffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseTennisPlayersQuery } from '@/lib/bff/tennis/query-params';
import { fetchTennisPlayers } from '@/lib/bff/tennis/services/players.service';
import {
  createTennisPlayer,
  deleteTennisPlayer,
  updateTennisPlayer,
} from '@/lib/bff/tennis/writers/players.writer';

export const runtime = 'nodejs';

export const GET = tennisBffGetRoute('players')(async ({ searchParams }) => {
  const response = await fetchTennisPlayers(parseTennisPlayersQuery(searchParams));
  return { response, cache: CACHE.none };
});

export const POST = tennisBffPostRoute('players')(async ({ body }) => {
  const item = await createTennisPlayer(body);
  return { response: [item], status: 201 };
});

export const PATCH = tennisBffPatchRoute('players')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateTennisPlayer(id, body);
  return { response: [item] };
});

export const DELETE = tennisBffDeleteRoute('players')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteTennisPlayer(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
