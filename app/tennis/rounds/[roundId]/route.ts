import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  tennisBffDeleteRoute,
  tennisBffGetRoute,
  tennisBffPatchRoute,
} from '@/lib/bff/shared/handler';
import { fetchTennisRounds } from '@/lib/bff/tennis/services/rounds.service';
import { deleteTennisRound, updateTennisRound } from '@/lib/bff/tennis/writers/rounds.writer';

export const runtime = 'nodejs';

function requireRoundId(params: Record<string, string>): string {
  const roundId = params.roundId;
  if (!roundId) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "roundId" path parameter is required.');
  return roundId;
}

export const GET = tennisBffGetRoute('rounds')(async ({ params }) => {
  const response = await fetchTennisRounds({ id: requireRoundId(params), published: 'all' });
  return { response, cache: CACHE.none };
});

export const PATCH = tennisBffPatchRoute('rounds')(async ({ params, body }) => {
  const item = await updateTennisRound(requireRoundId(params), body);
  return { response: [item] };
});

export const DELETE = tennisBffDeleteRoute('rounds')(async ({ params }) => {
  await deleteTennisRound(requireRoundId(params));
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
