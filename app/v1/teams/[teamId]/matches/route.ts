import { getRoute, optionsRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { ApiError, invalidPathParameter, notFound } from '@/lib/api/errors';
import {
  paginateArray,
  parseDateParam,
  parsePagination,
  parseSeasonParam,
  parseSort,
  parseStringParam,
} from '@/lib/api/query-validation';
import { pickLatestUpdatedAt } from '@/lib/api/serializers';
import { emptyCollection } from '@/lib/api/route-helpers';
import { findSeasonByYear } from '@/lib/firebase/repositories/seasons.repository';
import { listMatchesByTeam } from '@/lib/firebase/repositories/matches.repository';
import { buildTeamMapForLeague, getTeamById } from '@/lib/firebase/repositories/teams.repository';

export const runtime = 'nodejs';

export const GET = getRoute(
  withAuth(async ({ params, searchParams }) => {
    const teamId = params.teamId;
    if (!teamId) throw invalidPathParameter('Missing "teamId" path parameter.');
    const record = await getTeamById(teamId);
    if (!record) throw notFound('Team not found.');

    const { page, pageSize } = parsePagination(searchParams);
    const date = parseDateParam(searchParams.get('date'), 'date');
    const from = parseDateParam(searchParams.get('from'), 'from');
    const to = parseDateParam(searchParams.get('to'), 'to');
    if (date && (from || to)) {
      throw new ApiError(
        'INVALID_QUERY_PARAMETER',
        'The "date" parameter cannot be combined with "from"/"to".',
      );
    }
    const status = parseStringParam(searchParams.get('status'));
    const sort = parseSort(searchParams.get('sort'), ['date'], { field: 'date', direction: 'desc' });

    const leagueId = record.team.leagueId;
    const seasonYear = parseSeasonParam(searchParams.get('season'));
    let seasonId: string | undefined;
    if (seasonYear != null && leagueId) {
      const season = await findSeasonByYear(leagueId, seasonYear);
      if (!season) return emptyCollection(page, pageSize);
      seasonId = season.id;
    }

    const teamMap = leagueId
      ? await buildTeamMapForLeague(leagueId, record.sport)
      : undefined;

    const matches = await listMatchesByTeam(
      record.team.id,
      record.sport,
      { seasonId, from, to, date, status, sortDesc: sort.direction === 'desc' },
      teamMap,
    );

    const data = paginateArray(matches, page, pageSize);
    return {
      kind: 'collection',
      data,
      pagination: { page, pageSize, total: matches.length },
      updatedAt: pickLatestUpdatedAt(data),
      cache: CACHE.dynamic,
    };
  }),
);

export const OPTIONS = optionsRoute();
