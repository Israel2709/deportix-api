import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  formula1BffDeleteRoute,
  formula1BffGetRoute,
  formula1BffPatchRoute,
  formula1BffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseFormula1DriverQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormula1Drivers } from '@/lib/bff/formula-1/services/catalog.service';
import {
  createFormula1Driver,
  deleteFormula1Driver,
  updateFormula1Driver,
} from '@/lib/bff/formula-1/writers/catalog.writer';

export const runtime = 'nodejs';

export const GET = formula1BffGetRoute('drivers')(async ({ searchParams }) => {
  const response = await fetchFormula1Drivers(parseFormula1DriverQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = formula1BffPostRoute('drivers')(async ({ body }) => {
  const item = await createFormula1Driver(body);
  return { response: [item], status: 201 };
});

export const PATCH = formula1BffPatchRoute('drivers')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateFormula1Driver(id, body);
  return { response: [item] };
});

export const DELETE = formula1BffDeleteRoute('drivers')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteFormula1Driver(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
