import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  formula1BffDeleteRoute,
  formula1BffGetRoute,
  formula1BffPatchRoute,
  formula1BffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseFormula1EntriesQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormula1Entries } from '@/lib/bff/formula-1/services/entries.service';
import {
  createFormula1Entry,
  deleteFormula1Entry,
  updateFormula1Entry,
} from '@/lib/bff/formula-1/writers/entries.writer';

export const runtime = 'nodejs';

export const GET = formula1BffGetRoute('entries')(async ({ searchParams }) => {
  const response = await fetchFormula1Entries(parseFormula1EntriesQuery(searchParams));
  return { response, cache: CACHE.none };
});

export const POST = formula1BffPostRoute('entries')(async ({ body }) => {
  const item = await createFormula1Entry(body);
  return { response: [item], status: 201 };
});

export const PATCH = formula1BffPatchRoute('entries')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateFormula1Entry(id, body);
  return { response: [item] };
});

export const DELETE = formula1BffDeleteRoute('entries')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteFormula1Entry(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
