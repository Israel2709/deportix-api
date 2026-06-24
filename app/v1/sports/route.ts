import { getRoute, optionsRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { paginateArray, parsePagination } from '@/lib/api/query-validation';
import { listSports } from '@/lib/firebase/repositories/catalog.repository';

export const runtime = 'nodejs';

export const GET = getRoute(
  withAuth(async ({ searchParams }) => {
    const { page, pageSize } = parsePagination(searchParams);
    const all = await listSports();
    return {
      kind: 'collection',
      data: paginateArray(all, page, pageSize),
      pagination: { page, pageSize, total: all.length },
      cache: CACHE.reference,
    };
  }),
);

export const OPTIONS = optionsRoute();
