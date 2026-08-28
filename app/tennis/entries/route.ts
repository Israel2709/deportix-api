import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  tennisBffDeleteRoute,
  tennisBffGetRoute,
  tennisBffPatchRoute,
  tennisBffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseTennisEntriesQuery } from '@/lib/bff/tennis/query-params';
import { fetchTennisEntries } from '@/lib/bff/tennis/services/entries.service';
import {
  createTennisEntry,
  deleteTennisEntry,
  updateTennisEntry,
} from '@/lib/bff/tennis/writers/entries.writer';

export const runtime = 'nodejs';

export const GET = tennisBffGetRoute('entries')(async ({ searchParams }) => {
  const response = await fetchTennisEntries(parseTennisEntriesQuery(searchParams));
  return { response, cache: CACHE.none };
});

export const POST = tennisBffPostRoute('entries')(async ({ body }) => {
  const item = await createTennisEntry(body);
  return { response: [item], status: 201 };
});

export const PATCH = tennisBffPatchRoute('entries')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateTennisEntry(id, body);
  return { response: [item] };
});

export const DELETE = tennisBffDeleteRoute('entries')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteTennisEntry(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
