import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffGetRoute,
  bffOptionsRoute,
  soccerBffDeleteRoute,
  soccerBffPatchRoute,
  soccerBffPutRoute,
  type BffWriteHandler,
} from '@/lib/bff/football/handler';
import {
  deleteSoccerFixture,
  getSoccerFixtureById,
  updateSoccerFixture,
} from '@/lib/bff/football/writers/fixtures.writer';

export const runtime = 'nodejs';

export const GET = bffGetRoute(async ({ params }) => {
  const fixtureId = decodeURIComponent(params.fixtureId ?? '');
  const response = [await getSoccerFixtureById(fixtureId)];
  return { response, cache: CACHE.dynamic };
});

const patchFixture: BffWriteHandler = async ({ params, body }) => {
  const fixtureId = decodeURIComponent(params.fixtureId ?? '');
  const fixture = await updateSoccerFixture(fixtureId, body);
  return { response: [fixture] };
};

export const PATCH = soccerBffPatchRoute('fixtures')(patchFixture);
export const PUT = soccerBffPutRoute('fixtures')(patchFixture);

export const DELETE = soccerBffDeleteRoute('fixtures')(async ({ params, searchParams }) => {
  const fixtureId = decodeURIComponent(params.fixtureId ?? '');
  const leagueId = searchParams.get('league');
  if (!leagueId) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "league" parameter is required.');
  }
  await deleteSoccerFixture(fixtureId, leagueId);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
