import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  formula1BffDeleteRoute,
  formula1BffGetRoute,
  formula1BffPatchRoute,
  formula1BffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseFormula1IdNameQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormula1Teams } from '@/lib/bff/formula-1/services/catalog.service';
import {
  createFormula1Team,
  deleteFormula1Team,
  updateFormula1Team,
} from '@/lib/bff/formula-1/writers/catalog.writer';

export const runtime = 'nodejs';

export const GET = formula1BffGetRoute('teams')(async ({ searchParams }) => {
  const response = await fetchFormula1Teams(parseFormula1IdNameQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = formula1BffPostRoute('teams')(async ({ body }) => {
  const item = await createFormula1Team(body);
  return { response: [item], status: 201 };
});

export const PATCH = formula1BffPatchRoute('teams')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateFormula1Team(id, body);
  return { response: [item] };
});

export const DELETE = formula1BffDeleteRoute('teams')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteFormula1Team(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
