import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  formula1BffDeleteRoute,
  formula1BffGetRoute,
  formula1BffPatchRoute,
  formula1BffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseFormula1FastestLapsQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormula1FastestLaps } from '@/lib/bff/formula-1/services/session-detail.service';
import {
  createFormula1FastestLap,
  deleteFormula1FastestLap,
  updateFormula1FastestLap,
} from '@/lib/bff/formula-1/writers/session-detail.writer';

export const runtime = 'nodejs';

export const GET = formula1BffGetRoute('rankings/fastestlaps')(async ({ searchParams }) => {
  const response = await fetchFormula1FastestLaps(parseFormula1FastestLapsQuery(searchParams));
  return { response, cache: CACHE.dynamic };
});

export const POST = formula1BffPostRoute('rankings/fastestlaps')(async ({ body }) => {
  const item = await createFormula1FastestLap(body);
  return { response: [item], status: 201 };
});

export const PATCH = formula1BffPatchRoute('rankings/fastestlaps')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateFormula1FastestLap(id, body);
  return { response: [item] };
});

export const DELETE = formula1BffDeleteRoute('rankings/fastestlaps')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteFormula1FastestLap(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
