import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  formula1BffDeleteRoute,
  formula1BffGetRoute,
  formula1BffPatchRoute,
  formula1BffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseFormula1CircuitQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormula1Circuits } from '@/lib/bff/formula-1/services/catalog.service';
import {
  createFormula1Circuit,
  deleteFormula1Circuit,
  updateFormula1Circuit,
} from '@/lib/bff/formula-1/writers/catalog.writer';

export const runtime = 'nodejs';

export const GET = formula1BffGetRoute('circuits')(async ({ searchParams }) => {
  const response = await fetchFormula1Circuits(parseFormula1CircuitQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = formula1BffPostRoute('circuits')(async ({ body }) => {
  const item = await createFormula1Circuit(body);
  return { response: [item], status: 201 };
});

export const PATCH = formula1BffPatchRoute('circuits')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateFormula1Circuit(id, body);
  return { response: [item] };
});

export const DELETE = formula1BffDeleteRoute('circuits')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteFormula1Circuit(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
