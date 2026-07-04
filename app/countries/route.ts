import { CACHE } from '@/lib/api/cache';
import { bffGetRoute, bffOptionsRoute } from '@/lib/bff/football/handler';
import { parseCountryQuery } from '@/lib/bff/football/query-params';
import { fetchFootballCountries } from '@/lib/bff/football/services/countries.service';

export const runtime = 'nodejs';

export const GET = bffGetRoute(async ({ searchParams }) => {
  const response = await fetchFootballCountries(parseCountryQuery(searchParams));
  return { response, cache: CACHE.none };
});

export const OPTIONS = bffOptionsRoute();
