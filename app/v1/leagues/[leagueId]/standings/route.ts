import { getRoute, optionsRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { parseSeasonParam } from '@/lib/api/query-validation';
import { emptyCollection, requireGenericSport, requireLeague } from '@/lib/api/route-helpers';
import { findSeasonByYear, getCurrentSeason } from '@/lib/firebase/repositories/seasons.repository';
import { listStandingsByLeague } from '@/lib/firebase/repositories/standings.repository';

export const runtime = 'nodejs';

export const GET = getRoute(
  withAuth(async ({ params, searchParams }) => {
    const league = await requireLeague(params);
    const sport = requireGenericSport(league, 'Standings');
    const seasonYear = parseSeasonParam(searchParams.get('season'));

    let seasonId: string | undefined;
    if (seasonYear != null) {
      const season = await findSeasonByYear(league.id, seasonYear);
      if (!season) return emptyCollection(1, 0);
      seasonId = season.id;
    } else {
      seasonId = (await getCurrentSeason(league.id))?.id;
    }

    const standings = await listStandingsByLeague(league.id, sport, { seasonId });
    // Standings are a single table, returned in full (not paginated).
    return {
      kind: 'collection',
      data: standings,
      pagination: { page: 1, pageSize: standings.length, total: standings.length },
      cache: CACHE.standard,
    };
  }),
);

export const OPTIONS = optionsRoute();
