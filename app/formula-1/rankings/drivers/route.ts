import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  formula1BffDeleteRoute,
  formula1BffGetRoute,
  formula1BffPatchRoute,
  formula1BffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseFormula1DriverRankingsQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormula1DriverRankings } from '@/lib/bff/formula-1/services/rankings.service';
import {
  createFormula1DriverRanking,
  deleteFormula1DriverRanking,
  updateFormula1DriverRanking,
} from '@/lib/bff/formula-1/writers/rankings.writer';

export const runtime = 'nodejs';

export const GET = formula1BffGetRoute('rankings/drivers')(async ({ searchParams }) => {
  const response = await fetchFormula1DriverRankings(parseFormula1DriverRankingsQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = formula1BffPostRoute('rankings/drivers')(async ({ body }) => {
  const item = await createFormula1DriverRanking(body);
  return { response: [item], status: 201 };
});

export const PATCH = formula1BffPatchRoute('rankings/drivers')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateFormula1DriverRanking(id, body);
  return { response: [item] };
});

export const DELETE = formula1BffDeleteRoute('rankings/drivers')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteFormula1DriverRanking(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
