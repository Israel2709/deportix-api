import { ApiError } from '@/lib/api/errors';
import { bffOptionsRoute, tennisBffActionPostRoute } from '@/lib/bff/shared/handler';
import { publishTennisRound } from '@/lib/bff/tennis/writers/rounds.writer';

export const runtime = 'nodejs';

export const POST = tennisBffActionPostRoute('rounds/publish')(async ({ params }) => {
  const roundId = params.roundId;
  if (!roundId) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "roundId" path parameter is required.');
  }
  const item = await publishTennisRound(roundId);
  return { response: [item], status: 200 };
});

export const OPTIONS = bffOptionsRoute();
