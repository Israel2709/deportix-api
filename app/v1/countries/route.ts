import { getRoute, optionsRoute, patchRoute, postRoute, deleteRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { ApiError } from '@/lib/api/errors';
import { paginateArray, parseStringParam } from '@/lib/api/query-validation';
import {
  createCatalogCountry,
  deleteCatalogCountry,
  listCatalogCountries,
  updateCatalogCountry,
} from '@/lib/catalog/countries.service';

export const runtime = 'nodejs';

const MAX_CATALOG_PAGE_SIZE = 500;

function parseCatalogPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const rawSize = Number(searchParams.get('pageSize') ?? '250') || 250;
  const pageSize = Math.min(Math.max(1, rawSize), MAX_CATALOG_PAGE_SIZE);
  return { page, pageSize };
}

export const GET = getRoute(
  withAuth(async ({ searchParams }) => {
    const { page, pageSize } = parseCatalogPagination(searchParams);
    const name = parseStringParam(searchParams.get('name'));
    const code = parseStringParam(searchParams.get('code'));

    const all = await listCatalogCountries({ name, code });
    const data = paginateArray(all, page, pageSize);

    return {
      kind: 'collection',
      data,
      pagination: { page, pageSize, total: all.length },
      cache: CACHE.none,
    };
  }),
);

export const POST = postRoute(
  withAuth(async ({ body }) => {
    const country = await createCatalogCountry(body);
    return { kind: 'resource', data: country, cache: CACHE.none };
  }),
);

export const PATCH = patchRoute(
  withAuth(async ({ searchParams, body }) => {
    const key = parseStringParam(searchParams.get('name')) ?? parseStringParam(searchParams.get('code'));
    if (!key) {
      throw new ApiError(
        'INVALID_QUERY_PARAMETER',
        'The "name" or "code" query parameter is required.',
      );
    }
    const country = await updateCatalogCountry(key, body);
    return { kind: 'resource', data: country, cache: CACHE.none };
  }),
);

export const DELETE = deleteRoute(
  withAuth(async ({ searchParams }) => {
    const key = parseStringParam(searchParams.get('name')) ?? parseStringParam(searchParams.get('code'));
    if (!key) {
      throw new ApiError(
        'INVALID_QUERY_PARAMETER',
        'The "name" or "code" query parameter is required.',
      );
    }
    await deleteCatalogCountry(key);
  }),
);

export const OPTIONS = optionsRoute();
