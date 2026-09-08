import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  formula1BffDeleteRoute,
  formula1BffGetRoute,
  formula1BffPatchRoute,
  formula1BffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseFormula1StartingGridQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormula1StartingGrid } from '@/lib/bff/formula-1/services/session-detail.service';
import {
  createFormula1StartingGrid,
  deleteFormula1StartingGrid,
  updateFormula1StartingGrid,
} from '@/lib/bff/formula-1/writers/session-detail.writer';

export const runtime = 'nodejs';

export const GET = formula1BffGetRoute('rankings/startinggrid')(async ({ searchParams }) => {
  const response = await fetchFormula1StartingGrid(parseFormula1StartingGridQuery(searchParams));
  return { response, cache: CACHE.dynamic };
});

export const POST = formula1BffPostRoute('rankings/startinggrid')(async ({ body }) => {
  const item = await createFormula1StartingGrid(body);
  return { response: [item], status: 201 };
});

export const PATCH = formula1BffPatchRoute('rankings/startinggrid')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateFormula1StartingGrid(id, body);
  return { response: [item] };
});

export const DELETE = formula1BffDeleteRoute('rankings/startinggrid')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteFormula1StartingGrid(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
