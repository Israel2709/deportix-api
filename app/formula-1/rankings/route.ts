import { CACHE } from '@/lib/api/cache';
import { bffOptionsRoute, formulaOneBffGetRoute } from '@/lib/bff/shared/handler';
import { parseFormulaOneRaceRankingsQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormulaOneRaceRankings } from '@/lib/bff/formula-1/services/rankings.service';

export const runtime = 'nodejs';

export const GET = formulaOneBffGetRoute('rankings')(async ({ searchParams }) => {
  const response = await fetchFormulaOneRaceRankings(parseFormulaOneRaceRankingsQuery(searchParams));
  return { response, cache: CACHE.dynamic };
});

export const OPTIONS = bffOptionsRoute();
