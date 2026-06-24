/**
 * Converts the OpenAPI source of truth (openapi/openapi.yaml) into a typed TS module
 * (src/generated/openapi.ts) that route handlers import. Generating a bundled module —
 * rather than reading the YAML at runtime — keeps the spec reliably available on Vercel
 * without filesystem access at request time.
 *
 * Run via: pnpm openapi:build  (also runs automatically before `pnpm build`).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parse } from 'yaml';

const root = process.cwd();
const yamlPath = join(root, 'openapi', 'openapi.yaml');
const outPath = join(root, 'src', 'generated', 'openapi.ts');

const source = readFileSync(yamlPath, 'utf8');
const document = parse(source) as Record<string, unknown>;

if (!document || typeof document !== 'object' || !('openapi' in document)) {
  throw new Error('openapi/openapi.yaml did not parse into a valid OpenAPI document.');
}

mkdirSync(dirname(outPath), { recursive: true });

const banner =
  '/* AUTO-GENERATED from openapi/openapi.yaml by scripts/build-openapi.ts. Do not edit by hand. */';
const body = `export const openapiDocument = ${JSON.stringify(document, null, 2)} as const;\n`;

writeFileSync(outPath, `${banner}\n${body}`, 'utf8');
console.log(`[openapi] wrote ${outPath}`);
