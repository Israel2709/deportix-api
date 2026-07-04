import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  americanFootballBffGetRoute,
  americanFootballBffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseAmericanFootballGamesQuery } from '@/lib/bff/american-football/query-params';
import { fetchAmericanFootballGames } from '@/lib/bff/american-football/services/games.service';
import { createAmericanFootballGame } from '@/lib/bff/american-football/writers/games.writer';

export const runtime = 'nodejs';

export const GET = americanFootballBffGetRoute('games')(async ({ searchParams }) => {
  const response = await fetchAmericanFootballGames(parseAmericanFootballGamesQuery(searchParams));
  return { response, cache: CACHE.dynamic };
});

export const POST = americanFootballBffPostRoute('games')(async ({ body }) => {
  const game = await createAmericanFootballGame(body);
  return { response: [game], status: 201 };
});

export const OPTIONS = bffOptionsRoute();
