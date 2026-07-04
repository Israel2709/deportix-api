import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  nflBffGetRoute,
  nflBffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseNflGamesQuery } from '@/lib/bff/nfl/query-params';
import { fetchNflGames } from '@/lib/bff/nfl/services/games.service';
import { createNflGame } from '@/lib/bff/nfl/writers/games.writer';

export const runtime = 'nodejs';

export const GET = nflBffGetRoute('games')(async ({ searchParams }) => {
  const response = await fetchNflGames(parseNflGamesQuery(searchParams));
  return { response, cache: CACHE.dynamic };
});

export const POST = nflBffPostRoute('games')(async ({ body }) => {
  const game = await createNflGame(body);
  return { response: [game], status: 201 };
});

export const OPTIONS = bffOptionsRoute();
