import { getRoute, optionsRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { paginateArray } from '@/lib/api/query-validation';
import { listCatalogGameStages } from '@/lib/catalog/game-stages.service';

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
    const all = await listCatalogGameStages();
    const data = paginateArray(all, page, pageSize);

    return {
      kind: 'collection',
      data,
      pagination: { page, pageSize, total: all.length },
      cache: CACHE.reference,
    };
  }),
);

export const OPTIONS = optionsRoute();
