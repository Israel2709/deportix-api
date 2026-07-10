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
import { parseRoundsQuery, requireLeagueExternalId, requireSeasonYear } from '@/lib/bff/football/query-params';
import { fetchFootballRounds } from '@/lib/bff/football/services/rounds.service';
import {
  createSoccerRoundEntry,
  deleteSoccerRoundEntry,
  updateSoccerRoundEntry,
} from '@/lib/bff/football/writers/rounds.writer';

export const runtime = 'nodejs';

export const GET = bffGetRoute(async ({ searchParams }) => {
  const rounds = await fetchFootballRounds(parseRoundsQuery(searchParams));
  return { response: rounds, cache: CACHE.standard };
});

export const POST = soccerBffPostRoute('rounds')(async ({ searchParams, body }) => {
  const query = parseRoundsQuery(searchParams);
  const league = requireLeagueExternalId(query.leagueExternalId);
  const season = requireSeasonYear(query.seasonYear);
  const round = await createSoccerRoundEntry(league, season, body);
  return { response: [round], status: 201 };
});

const patchRound: BffWriteHandler = async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const round = await updateSoccerRoundEntry(id, body);
  return { response: [round] };
};

export const PATCH = soccerBffPatchRoute('rounds')(patchRound);
export const PUT = soccerBffPutRoute('rounds')(patchRound);

export const DELETE = soccerBffDeleteRoute('rounds')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteSoccerRoundEntry(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
