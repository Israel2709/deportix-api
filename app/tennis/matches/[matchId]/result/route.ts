import { ApiError } from '@/lib/api/errors';
import { bffOptionsRoute, tennisBffPostRoute } from '@/lib/bff/shared/handler';
import { recordTennisMatchResult } from '@/lib/bff/tennis/writers/matches.writer';

export const runtime = 'nodejs';

export const POST = tennisBffPostRoute('matches/result')(async ({ params, body }) => {
  const matchId = params.matchId;
  if (!matchId) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "matchId" path parameter is required.');
  }
  const item = await recordTennisMatchResult(matchId, body);
  return { response: [item], status: 200 };
});

export const OPTIONS = bffOptionsRoute();
