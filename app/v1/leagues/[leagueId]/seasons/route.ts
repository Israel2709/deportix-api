import { getRoute, optionsRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { paginateArray, parsePagination } from '@/lib/api/query-validation';
import { requireLeague } from '@/lib/api/route-helpers';
import { listSeasonsByLeague } from '@/lib/firebase/repositories/seasons.repository';

export const runtime = 'nodejs';

export const GET = getRoute(
  withAuth(async ({ params, searchParams }) => {
    const league = await requireLeague(params);
    const { page, pageSize } = parsePagination(searchParams);
    const seasons = await listSeasonsByLeague(league.id);
    return {
      kind: 'collection',
      data: paginateArray(seasons, page, pageSize),
      pagination: { page, pageSize, total: seasons.length },
      cache: CACHE.standard,
    };
  }),
);

export const OPTIONS = optionsRoute();
