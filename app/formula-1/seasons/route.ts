import { CACHE } from '@/lib/api/cache';
import { bffOptionsRoute, formulaOneBffGetRoute } from '@/lib/bff/shared/handler';
import { fetchFormulaOneSeasons } from '@/lib/bff/formula-1/services/catalog.service';

export const runtime = 'nodejs';

export const GET = formulaOneBffGetRoute('seasons')(async () => {
  const response = await fetchFormulaOneSeasons();
  return { response, cache: CACHE.standard };
});

export const OPTIONS = bffOptionsRoute();
