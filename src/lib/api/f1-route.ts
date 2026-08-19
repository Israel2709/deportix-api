import { CACHE } from '@/lib/api/cache';
import { invalidPathParameter } from '@/lib/api/errors';
import { getRoute, optionsRoute } from '@/lib/api/handler';
import { paginateArray, parsePagination } from '@/lib/api/query-validation';
import { withAuth } from '@/lib/api/with-auth';

interface F1ListResult {
  data: unknown[];
  updatedAt: string | null;
}

type F1ListLoader = (searchParams: URLSearchParams) => Promise<F1ListResult>;

export function f1ListRoute(load: F1ListLoader) {
  return getRoute(
    withAuth(async ({ searchParams }) => {
      const { page, pageSize } = parsePagination(searchParams);
      const result = await load(searchParams);
      return {
        kind: 'collection',
        data: paginateArray(result.data, page, pageSize),
        pagination: { page, pageSize, total: result.data.length },
        updatedAt: result.updatedAt,
        cache: CACHE.standard,
      };
    }),
  );
}

export function f1ResourceRoute(
  load: (id: string) => Promise<{ data: unknown; updatedAt: string | null }>,
) {
  return getRoute(
    withAuth(async ({ params }) => {
      const id = params.id;
      if (!id) throw invalidPathParameter('Missing "id" path parameter.');
      const result = await load(id);
      return {
        kind: 'resource',
        data: result.data,
        updatedAt: result.updatedAt,
        cache: CACHE.standard,
      };
    }),
  );
}

export const f1OptionsRoute = optionsRoute;
