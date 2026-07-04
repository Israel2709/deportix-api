import { getRoute, optionsRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { buildDataStatus } from '@/lib/firebase/repositories/data-status.repository';

export const runtime = 'nodejs';

/**
 * Data coverage per league + sport, derived from real Firestore counts. The headline
 * endpoint for discovering what data exists before building against it.
 */
export const GET = getRoute(
  withAuth(async () => {
    const status = await buildDataStatus();
    return {
      kind: 'resource',
      data: { leagues: status.leagues, sports: status.sports },
      cache: CACHE.none,
    };
  }),
);

export const OPTIONS = optionsRoute();
