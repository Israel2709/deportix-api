import { CACHE } from '@/lib/api/cache';
import { bffGetRoute, bffOptionsRoute } from '@/lib/bff/football/handler';
import { parseRoundsQuery } from '@/lib/bff/football/query-params';
import { fetchFootballRounds } from '@/lib/bff/football/services/rounds.service';

export const runtime = 'nodejs';

export const GET = bffGetRoute(async ({ searchParams }) => {
  const rounds = await fetchFootballRounds(parseRoundsQuery(searchParams));
  return { response: rounds, cache: CACHE.standard };
});

export const OPTIONS = bffOptionsRoute();
