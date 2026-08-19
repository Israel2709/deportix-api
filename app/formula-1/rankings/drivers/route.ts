import { CACHE } from '@/lib/api/cache';
import { bffOptionsRoute, formulaOneBffGetRoute } from '@/lib/bff/shared/handler';
import { parseFormulaOneSeasonRankingsQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormulaOneDriverRankings } from '@/lib/bff/formula-1/services/rankings.service';

export const runtime = 'nodejs';

export const GET = formulaOneBffGetRoute('rankings/drivers')(async ({ searchParams }) => {
  const response = await fetchFormulaOneDriverRankings(parseFormulaOneSeasonRankingsQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const OPTIONS = bffOptionsRoute();
