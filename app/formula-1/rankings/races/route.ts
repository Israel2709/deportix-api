import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  formula1BffDeleteRoute,
  formula1BffGetRoute,
  formula1BffPatchRoute,
  formula1BffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseFormula1RaceRankingsQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormula1RaceRankings } from '@/lib/bff/formula-1/services/rankings.service';
import {
  createFormula1RaceRanking,
  deleteFormula1RaceRanking,
  updateFormula1RaceRanking,
} from '@/lib/bff/formula-1/writers/rankings.writer';

export const runtime = 'nodejs';

export const GET = formula1BffGetRoute('rankings/races')(async ({ searchParams }) => {
  const response = await fetchFormula1RaceRankings(parseFormula1RaceRankingsQuery(searchParams));
  return { response, cache: CACHE.dynamic };
});

export const POST = formula1BffPostRoute('rankings/races')(async ({ body }) => {
  const item = await createFormula1RaceRanking(body);
  return { response: [item], status: 201 };
});

export const PATCH = formula1BffPatchRoute('rankings/races')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const item = await updateFormula1RaceRanking(id, body);
  return { response: [item] };
});

export const DELETE = formula1BffDeleteRoute('rankings/races')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteFormula1RaceRanking(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
