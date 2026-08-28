import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  tennisBffDeleteRoute,
  tennisBffGetRoute,
  tennisBffPatchRoute,
} from '@/lib/bff/shared/handler';
import { fetchTennisEntries } from '@/lib/bff/tennis/services/entries.service';
import { deleteTennisEntry, updateTennisEntry } from '@/lib/bff/tennis/writers/entries.writer';

export const runtime = 'nodejs';

function requireEntryId(params: Record<string, string>): string {
  const entryId = params.entryId;
  if (!entryId) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "entryId" path parameter is required.');
  return entryId;
}

export const GET = tennisBffGetRoute('entries')(async ({ params }) => {
  const response = await fetchTennisEntries({ id: requireEntryId(params), published: 'all' });
  return { response, cache: CACHE.none };
});

export const PATCH = tennisBffPatchRoute('entries')(async ({ params, body }) => {
  const item = await updateTennisEntry(requireEntryId(params), body);
  return { response: [item] };
});

export const DELETE = tennisBffDeleteRoute('entries')(async ({ params }) => {
  await deleteTennisEntry(requireEntryId(params));
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
