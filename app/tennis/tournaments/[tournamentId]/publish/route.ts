import { ApiError } from '@/lib/api/errors';
import {
  bffOptionsRoute,
  tennisBffActionPostRoute,
} from '@/lib/bff/shared/handler';
import { publishTennisTournament } from '@/lib/bff/tennis/writers/tournaments.writer';

export const runtime = 'nodejs';

export const POST = tennisBffActionPostRoute('tournaments/publish')(async ({ params }) => {
  const tournamentId = params.tournamentId;
  if (!tournamentId) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "tournamentId" path parameter is required.');
  }
  const item = await publishTennisTournament(tournamentId);
  return { response: [item], status: 200 };
});

export const OPTIONS = bffOptionsRoute();
