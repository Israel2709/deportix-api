import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  tennisBffDeleteRoute,
  tennisBffGetRoute,
  tennisBffPatchRoute,
} from '@/lib/bff/shared/handler';
import { fetchTennisMatches } from '@/lib/bff/tennis/services/matches.service';
import { deleteTennisMatch, updateTennisMatch } from '@/lib/bff/tennis/writers/matches.writer';

export const runtime = 'nodejs';

function requireMatchId(params: Record<string, string>): string {
  const matchId = params.matchId;
  if (!matchId) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "matchId" path parameter is required.');
  return matchId;
}

export const GET = tennisBffGetRoute('matches')(async ({ params }) => {
  const response = await fetchTennisMatches({ id: requireMatchId(params), published: 'all' });
  return { response, cache: CACHE.none };
});

export const PATCH = tennisBffPatchRoute('matches')(async ({ params, body }) => {
  const item = await updateTennisMatch(requireMatchId(params), body);
  return { response: [item] };
});

export const DELETE = tennisBffDeleteRoute('matches')(async ({ params }) => {
  await deleteTennisMatch(requireMatchId(params));
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
