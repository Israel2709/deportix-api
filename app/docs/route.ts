import { ApiReference } from '@scalar/nextjs-api-reference';

export const runtime = 'nodejs';

/**
 * Interactive API reference (Scalar), rendered from the live OpenAPI document at
 * `/v1/openapi.json`. The Scalar UI bundle is loaded from its CDN at view time, so this
 * page requires network access in the browser; the API itself has no such dependency.
 */
export const GET = ApiReference({
  url: '/v1/openapi.json',
  pageTitle: 'Deportix API — Reference',
});
