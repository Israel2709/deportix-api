import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  americanFootballBffDeleteRoute,
  americanFootballBffGetRoute,
  americanFootballBffPatchRoute,
} from '@/lib/bff/shared/handler';
import { fetchAmericanFootballGames } from '@/lib/bff/american-football/services/games.service';
import { deleteAmericanFootballGame, patchAmericanFootballGame, updateAmericanFootballGame } from '@/lib/bff/american-football/writers/games.writer';

export const runtime = 'nodejs';

export const GET = americanFootballBffGetRoute('games')(async ({ params }) => {
  const response = await fetchAmericanFootballGames({ id: params.gameId });
  return { response, cache: CACHE.dynamic };
});

export const PATCH = americanFootballBffPatchRoute('games')(async ({ params, body, searchParams }) => {
  const gameId = params.gameId ?? searchParams.get('id') ?? '';
  const game = searchParams.get('replace') === 'true'
    ? await updateAmericanFootballGame(gameId, body)
    : await patchAmericanFootballGame(gameId, body);
  return { response: [game] };
});

export const DELETE = americanFootballBffDeleteRoute('games')(async ({ params }) => {
  await deleteAmericanFootballGame(params.gameId ?? '');
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
