import { getRoute, optionsRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { requireLeague } from '@/lib/api/route-helpers';

export const runtime = 'nodejs';

export const GET = getRoute(
  withAuth(async ({ params }) => {
    const league = await requireLeague(params);
    return {
      kind: 'resource',
      data: league.dto,
      updatedAt: league.dto.updatedAt,
      cache: CACHE.standard,
    };
  }),
);

export const OPTIONS = optionsRoute();
