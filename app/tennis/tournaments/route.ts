import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  tennisBffDeleteRoute,
  tennisBffGetRoute,
  tennisBffPatchRoute,
  tennisBffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseTennisTournamentsQuery } from '@/lib/bff/tennis/query-params';
import { fetchTennisTournaments } from '@/lib/bff/tennis/services/tournaments.service';
import {
  createTennisTournament,
  deleteTennisTournament,
  updateTennisTournament,
} from '@/lib/bff/tennis/writers/tournaments.writer';

export const runtime = 'nodejs';

export const GET = tennisBffGetRoute('tournaments')(async ({ searchParams }) => {
  const response = await fetchTennisTournaments(parseTennisTournamentsQuery(searchParams));
  return { response, cache: CACHE.none };
});

export const POST = tennisBffPostRoute('tournaments')(async ({ body }) => {
  const item = await createTennisTournament(body);
  return { response: [item], status: 201 };
});

export const PATCH = tennisBffPatchRoute('tournaments')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateTennisTournament(id, body);
  return { response: [item] };
});

export const DELETE = tennisBffDeleteRoute('tournaments')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteTennisTournament(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
