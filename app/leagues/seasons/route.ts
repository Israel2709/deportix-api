import { CACHE } from '@/lib/api/cache';
import { bffGetRoute, bffOptionsRoute } from '@/lib/bff/football/handler';
import { fetchFootballGlobalSeasons } from '@/lib/bff/football/services/leagues.service';

export const runtime = 'nodejs';

export const GET = bffGetRoute(async () => {
  const years = await fetchFootballGlobalSeasons();
  return { response: years, cache: CACHE.standard };
});

export const OPTIONS = bffOptionsRoute();
