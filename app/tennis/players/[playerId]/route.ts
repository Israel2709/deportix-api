import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  tennisBffDeleteRoute,
  tennisBffGetRoute,
  tennisBffPatchRoute,
} from '@/lib/bff/shared/handler';
import { fetchTennisPlayers } from '@/lib/bff/tennis/services/players.service';
import { deleteTennisPlayer, updateTennisPlayer } from '@/lib/bff/tennis/writers/players.writer';

export const runtime = 'nodejs';

function requirePlayerId(params: Record<string, string>): string {
  const playerId = params.playerId;
  if (!playerId) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "playerId" path parameter is required.');
  return playerId;
}

export const GET = tennisBffGetRoute('players')(async ({ params }) => {
  const response = await fetchTennisPlayers({ id: requirePlayerId(params), published: 'all' });
  return { response, cache: CACHE.none };
});

export const PATCH = tennisBffPatchRoute('players')(async ({ params, body }) => {
  const item = await updateTennisPlayer(requirePlayerId(params), body);
  return { response: [item] };
});

export const DELETE = tennisBffDeleteRoute('players')(async ({ params }) => {
  await deleteTennisPlayer(requirePlayerId(params));
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
