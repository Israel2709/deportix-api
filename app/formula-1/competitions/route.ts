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
import { fetchFormula1Competitions } from '@/lib/bff/formula-1/services/catalog.service';
import {
  createFormula1Competition,
  deleteFormula1Competition,
  updateFormula1Competition,
} from '@/lib/bff/formula-1/writers/catalog.writer';

export const runtime = 'nodejs';

export const GET = formula1BffGetRoute('competitions')(async ({ searchParams }) => {
  const response = await fetchFormula1Competitions(parseFormula1IdNameQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = formula1BffPostRoute('competitions')(async ({ body }) => {
  const item = await createFormula1Competition(body);
  return { response: [item], status: 201 };
});

export const PATCH = formula1BffPatchRoute('competitions')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateFormula1Competition(id, body);
  return { response: [item] };
});

export const DELETE = formula1BffDeleteRoute('competitions')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteFormula1Competition(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
