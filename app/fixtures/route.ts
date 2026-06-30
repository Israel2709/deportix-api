import { CACHE } from '@/lib/api/cache';
import { bffGetRoute, bffOptionsRoute } from '@/lib/bff/football/handler';
import { parseFixtureQuery } from '@/lib/bff/football/query-params';
import { fetchFootballFixtures } from '@/lib/bff/football/services/fixtures.service';

export const runtime = 'nodejs';

export const GET = bffGetRoute(async ({ searchParams }) => {
  const response = await fetchFootballFixtures(parseFixtureQuery(searchParams));
  return { response, cache: CACHE.dynamic };
});

export const OPTIONS = bffOptionsRoute();
