import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  formula1BffDeleteRoute,
  formula1BffGetRoute,
  formula1BffPatchRoute,
  formula1BffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseFormula1RacesQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormula1Races } from '@/lib/bff/formula-1/services/races.service';
import {
  createFormula1Race,
  deleteFormula1Race,
  updateFormula1Race,
} from '@/lib/bff/formula-1/writers/races.writer';

export const runtime = 'nodejs';

export const GET = formula1BffGetRoute('races')(async ({ searchParams }) => {
  const response = await fetchFormula1Races(parseFormula1RacesQuery(searchParams));
  return { response, cache: CACHE.dynamic };
});

export const POST = formula1BffPostRoute('races')(async ({ body }) => {
  const item = await createFormula1Race(body);
  return { response: [item], status: 201 };
});

export const PATCH = formula1BffPatchRoute('races')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateFormula1Race(id, body);
  return { response: [item] };
});

export const DELETE = formula1BffDeleteRoute('races')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteFormula1Race(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
