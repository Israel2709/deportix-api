import {
  deleteRoute,
  getRoute,
  optionsRoute,
  patchRoute,
  postRoute,
} from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { ApiError } from '@/lib/api/errors';
import { paginateArray, parseStringParam } from '@/lib/api/query-validation';
import {
  createCatalogLeagueType,
  deleteCatalogLeagueType,
  listCatalogLeagueTypes,
  updateCatalogLeagueType,
} from '@/lib/catalog/league-types.service';

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
      // BO edits this catalog; avoid CDN serving stale League/Cup options.
      cache: CACHE.none,
    };
  }),
);

export const POST = postRoute(
  withAuth(async ({ body }) => {
    const item = await createCatalogLeagueType(body);
    return { kind: 'resource', data: item, cache: CACHE.none };
  }),
);

export const PATCH = patchRoute(
  withAuth(async ({ searchParams, body }) => {
    const code = parseStringParam(searchParams.get('code'));
    if (!code) {
      throw new ApiError('INVALID_QUERY_PARAMETER', 'The "code" query parameter is required.');
    }
    const item = await updateCatalogLeagueType(code, body);
    return { kind: 'resource', data: item, cache: CACHE.none };
  }),
);

export const DELETE = deleteRoute(
  withAuth(async ({ searchParams }) => {
    const code = parseStringParam(searchParams.get('code'));
    if (!code) {
      throw new ApiError('INVALID_QUERY_PARAMETER', 'The "code" query parameter is required.');
    }
    await deleteCatalogLeagueType(code);
  }),
);

export const OPTIONS = optionsRoute();
