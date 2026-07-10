import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffGetRoute,
  bffOptionsRoute,
  soccerBffDeleteRoute,
  soccerBffPatchRoute,
  soccerBffPostRoute,
  soccerBffPutRoute,
  type BffWriteHandler,
} from '@/lib/bff/football/handler';
import { parseTeamQuery } from '@/lib/bff/football/query-params';
import { fetchFootballTeams } from '@/lib/bff/football/services/teams.service';
import {
  createSoccerTeamEntry,
  deleteSoccerTeamEntry,
  updateSoccerTeamEntry,
} from '@/lib/bff/football/writers/teams.writer';

export const runtime = 'nodejs';

export const GET = bffGetRoute(async ({ searchParams }) => {
  const response = await fetchFootballTeams(parseTeamQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = soccerBffPostRoute('teams')(async ({ searchParams, body }) => {
  const league = searchParams.get('league');
  if (!league) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "league" parameter is required.');
  const team = await createSoccerTeamEntry(league, body);
  return { response: [team], status: 201 };
});

const patchTeam: BffWriteHandler = async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const team = await updateSoccerTeamEntry(id, body);
  return { response: [team] };
};

export const PATCH = soccerBffPatchRoute('teams')(patchTeam);
export const PUT = soccerBffPutRoute('teams')(patchTeam);

export const DELETE = soccerBffDeleteRoute('teams')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteSoccerTeamEntry(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
