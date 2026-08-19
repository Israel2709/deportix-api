import { CACHE } from '@/lib/api/cache';
import { bffOptionsRoute, formulaOneBffGetRoute } from '@/lib/bff/shared/handler';
import { parseFormulaOneDriversQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormulaOneDrivers } from '@/lib/bff/formula-1/services/catalog.service';

export const runtime = 'nodejs';

export const GET = formulaOneBffGetRoute('drivers')(async ({ searchParams }) => {
  const response = await fetchFormulaOneDrivers(parseFormulaOneDriversQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const OPTIONS = bffOptionsRoute();
