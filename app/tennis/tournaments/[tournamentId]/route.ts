import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  tennisBffDeleteRoute,
  tennisBffGetRoute,
  tennisBffPatchRoute,
} from '@/lib/bff/shared/handler';
import { fetchTennisTournaments } from '@/lib/bff/tennis/services/tournaments.service';
import {
  deleteTennisTournament,
  updateTennisTournament,
} from '@/lib/bff/tennis/writers/tournaments.writer';

export const runtime = 'nodejs';

function requireTournamentId(params: Record<string, string>): string {
  const tournamentId = params.tournamentId;
  if (!tournamentId) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "tournamentId" path parameter is required.');
  }
  return tournamentId;
}

export const GET = tennisBffGetRoute('tournaments')(async ({ params }) => {
  const response = await fetchTennisTournaments({
    id: requireTournamentId(params),
    published: 'all',
  });
  return { response, cache: CACHE.none };
});

export const PATCH = tennisBffPatchRoute('tournaments')(async ({ params, body }) => {
  const item = await updateTennisTournament(requireTournamentId(params), body);
  return { response: [item] };
});

export const DELETE = tennisBffDeleteRoute('tournaments')(async ({ params }) => {
  await deleteTennisTournament(requireTournamentId(params));
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
