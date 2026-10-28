import { CACHE } from '@/lib/api/cache';
import { bffGetRoute, bffOptionsRoute } from '@/lib/bff/football/handler';
import { countUnassignedSoccerLeagues } from '@/lib/bff/football/services/leagues.service';

export const runtime = 'nodejs';

/**
 * Lightweight count of soccer leagues without a sports organization.
 * Response shape mirrors `/leagues/seasons`: `{ response: [count] }`.
 */
export const GET = bffGetRoute(async () => {
  const count = await countUnassignedSoccerLeagues();
  return { response: [count], cache: CACHE.none };
});

export const OPTIONS = bffOptionsRoute();
