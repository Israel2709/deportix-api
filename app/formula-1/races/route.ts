import { CACHE } from '@/lib/api/cache';
import { bffOptionsRoute, formulaOneBffGetRoute } from '@/lib/bff/shared/handler';
import { parseFormulaOneRacesQuery } from '@/lib/bff/formula-1/query-params';
import { fetchFormulaOneRaces } from '@/lib/bff/formula-1/services/races.service';

export const runtime = 'nodejs';

export const GET = formulaOneBffGetRoute('races')(async ({ searchParams }) => {
  const response = await fetchFormulaOneRaces(parseFormulaOneRacesQuery(searchParams));
  return { response, cache: CACHE.dynamic };
});

export const OPTIONS = bffOptionsRoute();
