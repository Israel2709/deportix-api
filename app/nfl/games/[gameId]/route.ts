import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  nflBffDeleteRoute,
  nflBffGetRoute,
  nflBffPatchRoute,
} from '@/lib/bff/shared/handler';
import { fetchNflGames } from '@/lib/bff/nfl/services/games.service';
import { deleteNflGame, patchNflGame, updateNflGame } from '@/lib/bff/nfl/writers/games.writer';

export const runtime = 'nodejs';

export const GET = nflBffGetRoute('games')(async ({ params }) => {
  const response = await fetchNflGames({ id: params.gameId });
  return { response, cache: CACHE.dynamic };
});

export const PATCH = nflBffPatchRoute('games')(async ({ params, body, searchParams }) => {
  const gameId = params.gameId ?? searchParams.get('id') ?? '';
  const game = searchParams.get('replace') === 'true'
    ? await updateNflGame(gameId, body)
    : await patchNflGame(gameId, body);
  return { response: [game] };
});

export const DELETE = nflBffDeleteRoute('games')(async ({ params }) => {
  await deleteNflGame(params.gameId ?? '');
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
