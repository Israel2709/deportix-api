import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  formula1BffDeleteRoute,
  formula1BffGetRoute,
  formula1BffPatchRoute,
  formula1BffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseFormula1TeamRankingsQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormula1TeamRankings } from '@/lib/bff/formula-1/services/rankings.service';
import {
  createFormula1TeamRanking,
  deleteFormula1TeamRanking,
  updateFormula1TeamRanking,
} from '@/lib/bff/formula-1/writers/rankings.writer';

export const runtime = 'nodejs';

export const GET = formula1BffGetRoute('rankings/teams')(async ({ searchParams }) => {
  const response = await fetchFormula1TeamRankings(parseFormula1TeamRankingsQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = formula1BffPostRoute('rankings/teams')(async ({ body }) => {
  const item = await createFormula1TeamRanking(body);
  return { response: [item], status: 201 };
});

export const PATCH = formula1BffPatchRoute('rankings/teams')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateFormula1TeamRanking(id, body);
  return { response: [item] };
});

export const DELETE = formula1BffDeleteRoute('rankings/teams')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteFormula1TeamRanking(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
