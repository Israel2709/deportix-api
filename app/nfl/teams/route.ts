import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  nflBffDeleteRoute,
  nflBffGetRoute,
  nflBffPatchRoute,
  nflBffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseNflTeamsQuery } from '@/lib/bff/nfl/query-params';
import { fetchNflTeams } from '@/lib/bff/nfl/services/teams.service';
import {
  createNflTeamEntry,
  deleteNflTeamEntry,
  updateNflTeamEntry,
} from '@/lib/bff/nfl/writers/teams.writer';
import { ApiError } from '@/lib/api/errors';

export const runtime = 'nodejs';

export const GET = nflBffGetRoute('teams')(async ({ searchParams }) => {
  const response = await fetchNflTeams(parseNflTeamsQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = nflBffPostRoute('teams')(async ({ searchParams, body }) => {
  const league = searchParams.get('league');
  if (!league) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "league" parameter is required.');
  const team = await createNflTeamEntry(league, body);
  return { response: [team], status: 201 };
});

export const PATCH = nflBffPatchRoute('teams')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const team = await updateNflTeamEntry(id, body);
  return { response: [team] };
});

export const DELETE = nflBffDeleteRoute('teams')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteNflTeamEntry(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
