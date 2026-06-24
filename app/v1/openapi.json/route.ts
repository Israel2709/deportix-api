import { getRoute, optionsRoute } from '@/lib/api/handler';
import { CACHE } from '@/lib/api/cache';
import { openapiDocument } from '@/generated/openapi';

export const runtime = 'nodejs';

/**
 * Serves the OpenAPI 3.1 document (generated from openapi/openapi.yaml). Returned raw —
 * it is a spec document, not a Deportix envelope — so tools like Scalar/Swagger can read it.
 */
export const GET = getRoute(async () => ({
  kind: 'raw',
  body: openapiDocument,
  cache: CACHE.reference,
}));

export const OPTIONS = optionsRoute();
