import { CACHE } from '@/lib/api/cache';
import { bffOptionsRoute, formula1BffGetRoute } from '@/lib/bff/shared/handler';
import { fetchFormula1Seasons } from '@/lib/bff/formula-1/services/catalog.service';

export const runtime = 'nodejs';

export const GET = formula1BffGetRoute('seasons')(async () => {
  const response = await fetchFormula1Seasons();
  return { response, cache: CACHE.standard };
});

export const OPTIONS = bffOptionsRoute();
