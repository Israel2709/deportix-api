import { getRoute, optionsRoute } from '@/lib/api/handler';
import { CACHE } from '@/lib/api/cache';
import { API_VERSION } from '@/lib/api/responses';
import { isDataSourceConfigured } from '@/lib/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Liveness + configuration check. Intentionally does NOT touch Firestore, so it works even
 * with no credentials — `dataSourceConfigured` tells operators whether data endpoints can
 * return data yet.
 */
export const GET = getRoute(async () => ({
  kind: 'resource',
  data: {
    status: 'ok',
    apiVersion: API_VERSION,
    dataSourceConfigured: isDataSourceConfigured(),
    timestamp: new Date().toISOString(),
  },
  cache: CACHE.none,
}));

export const OPTIONS = optionsRoute();
