import { getRoute, optionsRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { ApiError } from '@/lib/api/errors';
import {
  paginateArray,
  parseDateParam,
  parsePagination,
  parseSeasonParam,
  parseSort,
  parseStringParam,
} from '@/lib/api/query-validation';
import { pickLatestUpdatedAt } from '@/lib/api/serializers';
import { emptyCollection, requireGenericSport, requireLeague } from '@/lib/api/route-helpers';
import { findSeasonByYear, getCurrentSeason } from '@/lib/firebase/repositories/seasons.repository';
import {
  listMatchesByLeague,
  listMatchesBySeason,
} from '@/lib/firebase/repositories/matches.repository';
import { buildTeamMapForLeague } from '@/lib/firebase/repositories/teams.repository';

export const runtime = 'nodejs';

export const GET = getRoute(
  withAuth(async ({ params, searchParams }) => {
    const league = await requireLeague(params);
    const sport = requireGenericSport(league, 'Matches');
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
    const teamId = parseStringParam(searchParams.get('teamId'));
    const sort = parseSort(searchParams.get('sort'), ['date'], { field: 'date', direction: 'desc' });
    const sortDesc = sort.direction === 'desc';

    const seasonYear = parseSeasonParam(searchParams.get('season'));
    const filters = { from, to, date, status, teamId, sortDesc };

    // Resolve a season to scope the query. Explicit ?season wins; otherwise — when no other
    // date filter is given — default to the current season so we never pull a league's entire
    // match history (some leagues have thousands of matches).
    let seasonId: string | undefined;
    if (seasonYear != null) {
      const season = await findSeasonByYear(league.id, seasonYear);
      if (!season) return emptyCollection(page, pageSize);
      seasonId = season.id;
    } else if (!date && !from && !to) {
      seasonId = (await getCurrentSeason(league.id))?.id;
    }

    const teamMap = await buildTeamMapForLeague(league.id, sport);
    const matches = seasonId
      ? await listMatchesBySeason(sport, seasonId, filters, teamMap)
      : await listMatchesByLeague(league.id, sport, { ...filters, sortDesc }, teamMap);

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
