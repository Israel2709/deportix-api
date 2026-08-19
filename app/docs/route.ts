export const runtime = 'nodejs';

const SWAGGER_UI_VERSION = '5.32.8';

/** Slug/query values for `/docs?tag=` — must match OpenAPI `tags[].name`. */
const DOC_TAG_SLUGS = [
  'Meta',
  'Catalog',
  'Leagues',
  'Teams',
  'BFF',
  'bff-american-football',
  'bff-formula-1',
] as const;

/** Legacy Swagger deep links before tag slugs (spaces → %20). */
const LEGACY_TAG_SLUGS: Record<string, (typeof DOC_TAG_SLUGS)[number]> = {
  'BFF American Football': 'bff-american-football',
  'BFF Formula 1': 'bff-formula-1',
};

/**
 * Swagger UI loaded from CDN — avoids Turbopack bundling bugs with swagger-ui-react
 * (`OpenApi3_1Element.refract is not a function` when apidom is bundled).
 */
export function GET() {
  const tagSlugsJson = JSON.stringify(DOC_TAG_SLUGS);
  const legacyTagSlugsJson = JSON.stringify(LEGACY_TAG_SLUGS);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Deportix API — Swagger</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; }
    *, *::before, *::after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    (function () {
      var DOC_TAG_SLUGS = ${tagSlugsJson};
      var LEGACY_TAG_SLUGS = ${legacyTagSlugsJson};

      function normalizeSlug(value) {
        if (!value) return null;
        var decoded = decodeURIComponent(String(value).trim());
        if (LEGACY_TAG_SLUGS[decoded]) return LEGACY_TAG_SLUGS[decoded];
        if (DOC_TAG_SLUGS.indexOf(decoded) !== -1) return decoded;
        return null;
      }

      function slugFromLocation() {
        var params = new URLSearchParams(window.location.search);
        var fromQuery = params.get('tag');
        if (fromQuery) return normalizeSlug(fromQuery);
        var hash = window.location.hash.replace(/^#\\/?/, '');
        if (!hash) return null;
        return normalizeSlug(hash);
      }

      function setShareableTag(slug) {
        if (!slug || DOC_TAG_SLUGS.indexOf(slug) === -1) return;
        var url = new URL(window.location.href);
        url.searchParams.set('tag', slug);
        url.hash = '';
        history.replaceState(null, '', url.pathname + '?' + url.searchParams.toString());
      }

      function syncHashToQueryParam() {
        var hash = window.location.hash.replace(/^#\\/?/, '');
        if (!hash) return;
        var slug = normalizeSlug(hash);
        if (slug && DOC_TAG_SLUGS.indexOf(slug) !== -1) setShareableTag(slug);
      }

      var initialTag = slugFromLocation();
      if (initialTag) {
        window.location.hash = '/' + initialTag;
      }

      window.addEventListener('hashchange', syncHashToQueryParam);

      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: '/v1/openapi.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          docExpansion: 'list',
          defaultModelsExpandDepth: 1,
          displayRequestDuration: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout',
          onComplete: function () {
            syncHashToQueryParam();
          },
        });
      };
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
