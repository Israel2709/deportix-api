import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  formula1BffDeleteRoute,
  formula1BffGetRoute,
  formula1BffPatchRoute,
  formula1BffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseFormula1PitstopsQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormula1Pitstops } from '@/lib/bff/formula-1/services/session-detail.service';
import {
  createFormula1Pitstop,
  deleteFormula1Pitstop,
  updateFormula1Pitstop,
} from '@/lib/bff/formula-1/writers/session-detail.writer';

export const runtime = 'nodejs';

export const GET = formula1BffGetRoute('pitstops')(async ({ searchParams }) => {
  const response = await fetchFormula1Pitstops(parseFormula1PitstopsQuery(searchParams));
  return { response, cache: CACHE.dynamic };
});

export const POST = formula1BffPostRoute('pitstops')(async ({ body }) => {
  const item = await createFormula1Pitstop(body);
  return { response: [item], status: 201 };
});

export const PATCH = formula1BffPatchRoute('pitstops')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateFormula1Pitstop(id, body);
  return { response: [item] };
});

export const DELETE = formula1BffDeleteRoute('pitstops')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteFormula1Pitstop(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
