import { getRoute, optionsRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { paginateArray } from '@/lib/api/query-validation';
import { listCatalogLeagueTypes } from '@/lib/catalog/league-types.service';

export const runtime = 'nodejs';

const MAX_CATALOG_PAGE_SIZE = 100;

function parseCatalogPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const rawSize = Number(searchParams.get('pageSize') ?? '50') || 50;
  const pageSize = Math.min(Math.max(1, rawSize), MAX_CATALOG_PAGE_SIZE);
  return { page, pageSize };
}

export const GET = getRoute(
  withAuth(async ({ searchParams }) => {
    const { page, pageSize } = parseCatalogPagination(searchParams);
    const all = await listCatalogLeagueTypes();
    const data = paginateArray(all, page, pageSize);

    return {
      kind: 'collection',
      data,
      pagination: { page, pageSize, total: all.length },
      cache: CACHE.long,
    };
  }),
);

export const OPTIONS = optionsRoute();
