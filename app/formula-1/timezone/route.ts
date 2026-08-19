import { CACHE } from '@/lib/api/cache';
import { bffOptionsRoute, formulaOneBffGetRoute } from '@/lib/bff/shared/handler';
import { fetchFormulaOneTimezones } from '@/lib/bff/formula-1/services/catalog.service';

export const runtime = 'nodejs';

export const GET = formulaOneBffGetRoute('timezone')(async () => {
  const response = await fetchFormulaOneTimezones();
  return { response, cache: CACHE.standard };
});

export const OPTIONS = bffOptionsRoute();
