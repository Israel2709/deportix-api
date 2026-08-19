import { CACHE } from '@/lib/api/cache';
import { bffOptionsRoute, formulaOneBffGetRoute } from '@/lib/bff/shared/handler';
import { parseFormulaOneIdFilter } from '@/lib/bff/formula-1/query-params';
import { fetchFormulaOneCompetitions } from '@/lib/bff/formula-1/services/catalog.service';

export const runtime = 'nodejs';

export const GET = formulaOneBffGetRoute('competitions')(async ({ searchParams }) => {
  const response = await fetchFormulaOneCompetitions(parseFormulaOneIdFilter(searchParams));
  return { response, cache: CACHE.standard };
});

export const OPTIONS = bffOptionsRoute();
