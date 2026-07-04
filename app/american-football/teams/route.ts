import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  americanFootballBffDeleteRoute,
  americanFootballBffGetRoute,
  americanFootballBffPatchRoute,
  americanFootballBffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseAmericanFootballTeamsQuery } from '@/lib/bff/american-football/query-params';
import { fetchAmericanFootballTeams } from '@/lib/bff/american-football/services/teams.service';
import {
  createAmericanFootballTeamEntry,
  deleteAmericanFootballTeamEntry,
  updateAmericanFootballTeamEntry,
} from '@/lib/bff/american-football/writers/teams.writer';
import { ApiError } from '@/lib/api/errors';

export const runtime = 'nodejs';

export const GET = americanFootballBffGetRoute('teams')(async ({ searchParams }) => {
  const response = await fetchAmericanFootballTeams(parseAmericanFootballTeamsQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = americanFootballBffPostRoute('teams')(async ({ searchParams, body }) => {
  const league = searchParams.get('league');
  if (!league) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "league" parameter is required.');
  const team = await createAmericanFootballTeamEntry(league, body);
  return { response: [team], status: 201 };
});

export const PATCH = americanFootballBffPatchRoute('teams')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const team = await updateAmericanFootballTeamEntry(id, body);
  return { response: [team] };
});

export const DELETE = americanFootballBffDeleteRoute('teams')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteAmericanFootballTeamEntry(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
