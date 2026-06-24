import { getRoute, optionsRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { paginateArray, parsePagination, parseSort, parseStringParam } from '@/lib/api/query-validation';
import { pickLatestUpdatedAt } from '@/lib/api/serializers';
import { listLeagues } from '@/lib/firebase/repositories/leagues.repository';

export const runtime = 'nodejs';

export const GET = getRoute(
  withAuth(async ({ searchParams }) => {
    const { page, pageSize } = parsePagination(searchParams);
    const sport = parseStringParam(searchParams.get('sport'));
    const sort = parseSort(searchParams.get('sort'), ['name'], { field: 'name', direction: 'asc' });

    const leagues = await listLeagues({ sportSlug: sport });
    leagues.sort((a, b) => {
      const result = (a.name ?? '').localeCompare(b.name ?? '');
      return sort.direction === 'asc' ? result : -result;
    });

    const data = paginateArray(leagues, page, pageSize);
    return {
      kind: 'collection',
      data,
      pagination: { page, pageSize, total: leagues.length },
      updatedAt: pickLatestUpdatedAt(data),
      cache: CACHE.standard,
    };
  }),
);

export const OPTIONS = optionsRoute();
