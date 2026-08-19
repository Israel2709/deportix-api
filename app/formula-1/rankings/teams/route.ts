import { CACHE } from '@/lib/api/cache';
import { bffOptionsRoute, formulaOneBffGetRoute } from '@/lib/bff/shared/handler';
import { parseFormulaOneTeamRankingsQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormulaOneTeamRankings } from '@/lib/bff/formula-1/services/rankings.service';

export const runtime = 'nodejs';

export const GET = formulaOneBffGetRoute('rankings/teams')(async ({ searchParams }) => {
  const response = await fetchFormulaOneTeamRankings(parseFormulaOneTeamRankingsQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const OPTIONS = bffOptionsRoute();
