import { ApiError } from '@/lib/api/errors';
import { bffOptionsRoute, tennisBffPostRoute } from '@/lib/bff/shared/handler';
import { publishTennisMatch } from '@/lib/bff/tennis/writers/matches.writer';

export const runtime = 'nodejs';

export const POST = tennisBffPostRoute('matches/publish')(async ({ params }) => {
  const matchId = params.matchId;
  if (!matchId) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "matchId" path parameter is required.');
  }
  const item = await publishTennisMatch(matchId);
  return { response: [item], status: 200 };
});

export const OPTIONS = bffOptionsRoute();
