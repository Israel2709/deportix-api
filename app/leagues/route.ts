import { CACHE } from '@/lib/api/cache';
import { bffGetRoute, bffOptionsRoute } from '@/lib/bff/football/handler';
import { parseLeagueQuery } from '@/lib/bff/football/query-params';
import { fetchFootballLeagues } from '@/lib/bff/football/services/leagues.service';

export const runtime = 'nodejs';

export const GET = bffGetRoute(async ({ searchParams }) => {
  const response = await fetchFootballLeagues(parseLeagueQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const OPTIONS = bffOptionsRoute();
