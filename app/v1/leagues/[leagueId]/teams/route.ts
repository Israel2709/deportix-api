import { getRoute, optionsRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { paginateArray, parsePagination, parseStringParam } from '@/lib/api/query-validation';
import { pickLatestUpdatedAt } from '@/lib/api/serializers';
import { requireGenericSport, requireLeague } from '@/lib/api/route-helpers';
import { listTeamsByLeague } from '@/lib/firebase/repositories/teams.repository';

export const runtime = 'nodejs';

export const GET = getRoute(
  withAuth(async ({ params, searchParams }) => {
    const league = await requireLeague(params);
    const sport = requireGenericSport(league, 'Teams');
    const { page, pageSize } = parsePagination(searchParams);
    const conference = parseStringParam(searchParams.get('conference'));
    const division = parseStringParam(searchParams.get('division'));

    let teams = await listTeamsByLeague(league.id, sport);
    if (conference) {
      teams = teams.filter((t) => (t.conference ?? '').toLowerCase() === conference.toLowerCase());
    }
    if (division) {
      teams = teams.filter((t) => (t.division ?? '').toLowerCase() === division.toLowerCase());
    }

    const data = paginateArray(teams, page, pageSize);
    return {
      kind: 'collection',
      data,
      pagination: { page, pageSize, total: teams.length },
      updatedAt: pickLatestUpdatedAt(data),
      cache: CACHE.standard,
    };
  }),
);

export const OPTIONS = optionsRoute();
