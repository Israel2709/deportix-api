import { CACHE } from '@/lib/api/cache';
import { bffOptionsRoute, formulaOneBffGetRoute } from '@/lib/bff/shared/handler';
import { parseFormulaOneIdFilter } from '@/lib/bff/formula-1/query-params';
import { fetchFormulaOneCircuits } from '@/lib/bff/formula-1/services/catalog.service';

export const runtime = 'nodejs';

export const GET = formulaOneBffGetRoute('circuits')(async ({ searchParams }) => {
  const response = await fetchFormulaOneCircuits(parseFormulaOneIdFilter(searchParams));
  return { response, cache: CACHE.standard };
});

export const OPTIONS = bffOptionsRoute();
