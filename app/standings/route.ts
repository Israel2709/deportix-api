import { CACHE } from '@/lib/api/cache';
import { bffGetRoute, bffOptionsRoute } from '@/lib/bff/football/handler';
import { parseStandingsQuery } from '@/lib/bff/football/query-params';
import { fetchFootballStandings } from '@/lib/bff/football/services/standings.service';

export const runtime = 'nodejs';

export const GET = bffGetRoute(async ({ searchParams }) => {
  const response = await fetchFootballStandings(parseStandingsQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const OPTIONS = bffOptionsRoute();
