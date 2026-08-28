import { CACHE } from '@/lib/api/cache';
import { ApiError } from '@/lib/api/errors';
import {
  bffOptionsRoute,
  tennisBffGetRoute,
  tennisBffPostRoute,
} from '@/lib/bff/shared/handler';
import { fetchTennisRounds } from '@/lib/bff/tennis/services/rounds.service';
import { createTennisRound } from '@/lib/bff/tennis/writers/rounds.writer';

export const runtime = 'nodejs';

function requireTournamentId(params: Record<string, string>): string {
  const tournamentId = params.tournamentId;
  if (!tournamentId) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "tournamentId" path parameter is required.');
  }
  return tournamentId;
}

export const GET = tennisBffGetRoute('rounds')(async ({ params, searchParams }) => {
  const published = searchParams.get('published') === 'all' ? 'all' : searchParams.get('published') === 'false' ? 'false' : 'true';
  const response = await fetchTennisRounds({
    tournamentId: requireTournamentId(params),
    published,
  });
  return { response, cache: CACHE.none };
});

export const POST = tennisBffPostRoute('rounds')(async ({ params, body }) => {
  const tournamentId = requireTournamentId(params);
  const payload =
    body && typeof body === 'object' ? { ...(body as Record<string, unknown>), tournamentId } : body;
  const item = await createTennisRound(payload);
  return { response: [item], status: 201 };
});

export const OPTIONS = bffOptionsRoute();
