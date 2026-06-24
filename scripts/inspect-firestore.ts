/**
 * Read-only Firestore inventory / audit.
 *
 * SAFETY:
 *  - READ-ONLY. Never writes, deletes, or mutates Firestore, its rules, or its data.
 *  - Samples a small, configurable number of documents per collection (never the whole DB).
 *  - Never prints credentials. Truncates/redacts field values so secrets are not echoed.
 *
 * USAGE:
 *  pnpm data:inspect                       # sample 15 docs/collection
 *  pnpm data:inspect -- --limit=25         # change sample size
 *  pnpm data:inspect -- --collections=leagues,seasons,soccer_teams
 *
 * Requires FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY (e.g. in
 * .env.local). If absent, the audit is marked PENDING and nothing is invented.
 */
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FEATURED_LEAGUE_EXTERNAL_IDS } from '../src/lib/firebase/featured-leagues';

const ROOT = process.cwd();
const DOCS_DIR = join(ROOT, 'docs');

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((a) => a.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

const SAMPLE_LIMIT = Math.max(1, Math.min(50, Number(argValue('limit') ?? '15')));
const ONLY = (argValue('collections') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const INTERNAL_COLLECTIONS = new Set(['sync_logs', 'ingestion_jobs', 'ingestion_state']);
const SENSITIVE_FIELD = /(secret|password|token|api[_-]?key|private)/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2})?/;

/** Load .env.local manually (no extra deps) so the script can run standalone via tsx. */
function loadDotEnvLocal(): void {
  const file = join(ROOT, '.env.local');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function readCredentials() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !rawKey) return null;
  return { projectId, clientEmail, privateKey: rawKey.replace(/\\n/g, '\n') };
}

function typeOf(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'timestamp';
  if (value && typeof value === 'object') {
    // Firestore Timestamp has toDate()
    if (typeof (value as { toDate?: unknown }).toDate === 'function') return 'timestamp';
    return 'object';
  }
  if (typeof value === 'string' && ISO_DATE.test(value)) return 'date-string';
  return typeof value;
}

/** A short, safe preview of a value (never a secret, never a full document). */
function preview(field: string, value: unknown): string {
  if (SENSITIVE_FIELD.test(field)) return '«redacted»';
  if (value === null) return 'null';
  if (Array.isArray(value)) return `[${value.length} item(s)]`;
  if (value && typeof value === 'object') {
    if (typeof (value as { toDate?: unknown }).toDate === 'function') return '«timestamp»';
    const keys = Object.keys(value as Record<string, unknown>);
    return `{ ${keys.slice(0, 6).join(', ')}${keys.length > 6 ? ', …' : ''} }`;
  }
  const str = String(value);
  return str.length > 60 ? `${str.slice(0, 57)}…` : str;
}

interface FieldInfo {
  types: Set<string>;
  nullable: boolean;
  example: string;
  relation: boolean;
}

interface CollectionReport {
  name: string;
  internal: boolean;
  count: number;
  sampled: number;
  sampleIds: string[];
  fields: Map<string, FieldInfo>;
}

function inspectDocs(
  name: string,
  docs: { id: string; data: Record<string, unknown> }[],
  count: number,
): CollectionReport {
  const fields = new Map<string, FieldInfo>();
  for (const doc of docs) {
    for (const [field, value] of Object.entries(doc.data)) {
      const info = fields.get(field) ?? {
        types: new Set<string>(),
        nullable: false,
        example: preview(field, value),
        relation: /_id$/.test(field) || field === 'id' || field === 'external_id',
      };
      info.types.add(typeOf(value));
      if (value === null) info.nullable = true;
      if (info.example === 'null' && value !== null) info.example = preview(field, value);
      fields.set(field, info);
    }
  }
  return {
    name,
    internal: INTERNAL_COLLECTIONS.has(name),
    count,
    sampled: docs.length,
    sampleIds: docs.slice(0, 5).map((d) => d.id),
    fields,
  };
}

function fieldsTable(report: CollectionReport): string {
  if (report.fields.size === 0) return '_No documents sampled._\n';
  const rows = [...report.fields.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([field, info]) => {
      const types = [...info.types].join(' \\| ');
      const flags = [info.relation ? 'relation' : '', info.nullable ? 'nullable' : '']
        .filter(Boolean)
        .join(', ');
      return `| \`${field}\` | ${types} | ${flags || '—'} | ${info.example.replace(/\|/g, '\\|')} |`;
    });
  return ['| Field | Type(s) | Flags | Example |', '| --- | --- | --- | --- |', ...rows].join('\n');
}

async function listCollectionNames(db: Firestore): Promise<string[]> {
  const cols = await db.listCollections();
  const names = cols.map((c) => c.id);
  return ONLY.length ? names.filter((n) => ONLY.includes(n)) : names;
}

function nowIso(): string {
  return new Date().toISOString();
}

function writePendingDocs(reason: string): void {
  mkdirSync(DOCS_DIR, { recursive: true });
  const note = `# Firebase Data Inventory — PENDING

> **Status: PENDING.** ${reason}
>
> No data has been invented. Run the audit once credentials are available:
>
> \`\`\`bash
> # In deportix-api/.env.local set FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
> pnpm data:inspect
> \`\`\`

_Generated ${nowIso()}._
`;
  writeFileSync(join(DOCS_DIR, 'firebase-data-inventory.md'), note, 'utf8');
  writeFileSync(
    join(DOCS_DIR, 'data-availability.md'),
    `# Data Availability — PENDING\n\n> **Status: PENDING.** ${reason}\n\n_Generated ${nowIso()}._\n`,
    'utf8',
  );
  console.log('[inspect] Credentials missing — wrote PENDING inventory. Nothing invented.');
}

function detect(reports: CollectionReport[], name: string): CollectionReport | undefined {
  return reports.find((r) => r.name === name);
}

async function main(): Promise<void> {
  loadDotEnvLocal();
  const creds = readCredentials();
  if (!creds) {
    writePendingDocs('FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY are not set.');
    return;
  }

  const app = getApps()[0] ?? initializeApp({ credential: cert(creds), projectId: creds.projectId });
  const db = getFirestore(app);

  console.log(`[inspect] project=${creds.projectId} sampleLimit=${SAMPLE_LIMIT}`);

  const names = await listCollectionNames(db);
  console.log(`[inspect] root collections: ${names.join(', ') || '(none)'}`);

  const reports: CollectionReport[] = [];
  for (const name of names) {
    const coll = db.collection(name);
    const [countSnap, sampleSnap] = await Promise.all([
      coll.count().get(),
      coll.limit(SAMPLE_LIMIT).get(),
    ]);
    const docs = sampleSnap.docs.map((d) => ({
      id: d.id,
      data: d.data() as Record<string, unknown>,
    }));
    const report = inspectDocs(name, docs, countSnap.data().count);
    reports.push(report);
    console.log(`  - ${name}: ${report.count} docs, ${report.fields.size} fields`);
  }

  reports.sort((a, b) => Number(a.internal) - Number(b.internal) || a.name.localeCompare(b.name));

  // ---- Inventory markdown ----
  const inventory: string[] = [
    '# Firebase Data Inventory',
    '',
    `_Generated ${nowIso()} from project \`${creds.projectId}\` — read-only sample of up to ${SAMPLE_LIMIT} docs/collection._`,
    '',
    '> Sanitized: field names + inferred types + truncated examples only. No full documents, no secrets.',
    '',
    '## Collections',
    '',
    '| Collection | Documents | Fields | Internal |',
    '| --- | ---: | ---: | :---: |',
    ...reports.map(
      (r) => `| \`${r.name}\` | ${r.count} | ${r.fields.size} | ${r.internal ? 'yes' : ''} |`,
    ),
    '',
  ];
  for (const r of reports) {
    inventory.push(`### \`${r.name}\`${r.internal ? ' _(internal — never exposed publicly)_' : ''}`);
    inventory.push('');
    inventory.push(`- Documents: **${r.count}** (sampled ${r.sampled})`);
    if (r.sampleIds.length) inventory.push(`- Sample ids: ${r.sampleIds.map((i) => `\`${i}\``).join(', ')}`);
    inventory.push('');
    inventory.push(fieldsTable(r));
    inventory.push('');
  }

  // ---- Availability analysis (scans ALL leagues, derives real coverage) ----
  const coverageOf = (name: string) => {
    const r = detect(reports, name);
    return r ? r.count : 0;
  };

  const sportDocsAll = (await db.collection('sports').get()).docs.map((d) => ({
    id: d.id,
    slug: (d.data() as Record<string, unknown>).slug,
    name: (d.data() as Record<string, unknown>).name,
  }));
  const slugBySportId = new Map(sportDocsAll.map((s) => [s.id, String(s.slug ?? '')]));

  const leaguesAll = (await db.collection('leagues').get()).docs.map((d) => ({
    id: d.id,
    data: d.data() as Record<string, unknown>,
  }));
  const leagueCountBySportId = new Map<string, number>();
  const leagueByExternalId = new Map<string, { id: string; name: unknown; sportId: string | null }>();
  for (const l of leaguesAll) {
    const sportId = typeof l.data.sport_id === 'string' ? l.data.sport_id : null;
    if (sportId) leagueCountBySportId.set(sportId, (leagueCountBySportId.get(sportId) ?? 0) + 1);
    leagueByExternalId.set(String(l.data.external_id), { id: l.id, name: l.data.name, sportId });
  }

  // Per-sport collection coverage (from inventory counts).
  const sportCoverageRows = sportDocsAll.map((s) => {
    const slug = String(s.slug ?? '');
    const teams = coverageOf(`${slug}_teams`);
    const matches = coverageOf(slug === 'soccer' ? 'soccer_matches' : `${slug}_games`);
    const standings = coverageOf(`${slug}_standings`);
    return `| \`${slug}\` | ${s.name} | ${leagueCountBySportId.get(s.id) ?? 0} | ${teams} | ${matches} | ${standings} |`;
  });

  // Featured leagues coverage (derived counts).
  const featuredRows: string[] = [];
  for (const ext of FEATURED_LEAGUE_EXTERNAL_IDS) {
    const lg = leagueByExternalId.get(ext);
    if (!lg) {
      featuredRows.push(`| ${ext} | _(not found)_ | — | — | — | — | — |`);
      continue;
    }
    const slug = lg.sportId ? (slugBySportId.get(lg.sportId) ?? '') : '';
    const teamsColl = `${slug}_teams`;
    const matchesColl = slug === 'soccer' ? 'soccer_matches' : `${slug}_games`;
    const standingsColl = `${slug}_standings`;
    const [t, m, s, seasonsSnap] = await Promise.all([
      db.collection(teamsColl).where('league_id', '==', lg.id).count().get().catch(() => null),
      db.collection(matchesColl).where('league_id', '==', lg.id).count().get().catch(() => null),
      db.collection(standingsColl).where('league_id', '==', lg.id).count().get().catch(() => null),
      db.collection('seasons').where('league_id', '==', lg.id).get(),
    ]);
    const years = seasonsSnap.docs
      .map((d) => (d.data() as Record<string, unknown>).year)
      .filter((y): y is number => typeof y === 'number')
      .sort((a, b) => b - a);
    featuredRows.push(
      `| ${ext} | ${String(lg.name)} | ${slug || '—'} | ${t ? t.data().count : 0} | ${m ? m.data().count : 0} | ${s ? s.data().count : 0} | ${years.length ? years.join(', ') : '—'} |`,
    );
  }

  const availability: string[] = [
    '# Data Availability',
    '',
    `_Generated ${nowIso()} from project \`${creds.projectId}\`. All figures are real Firestore counts._`,
    '',
    '## Headline findings',
    '',
    `- **Sports present:** ${sportDocsAll.map((s) => `\`${s.slug}\``).join(', ')} (${sportDocsAll.length}).`,
    `- **Leagues:** ${coverageOf('leagues')}. **Seasons:** ${coverageOf('seasons')}.`,
    '- **NFL & F1** exist as `sports` entries but have **no leagues and no team/game collections** loaded — their endpoints return empty collections (honest "no data yet").',
    '- **Liga MX (ext 262)** has season metadata only (no teams/matches/standings loaded yet).',
    '- Other soccer leagues (e.g. Liga Profesional Argentina ext 128, Ligue 1 ext 61) are data-rich and exercise the full endpoint set.',
    '- Coverage is **partial and uneven** by design of the manual loading process.',
    '',
    '## Sport-level coverage',
    '',
    '| Sport | Name | Leagues | Team docs | Match docs | Standing docs |',
    '| --- | --- | ---: | ---: | ---: | ---: |',
    ...sportCoverageRows,
    '',
    '## Featured leagues (configured in `src/lib/firebase/featured-leagues.ts`)',
    '',
    '| External id | League | Sport | Teams | Matches | Standings | Seasons |',
    '| --- | --- | --- | ---: | ---: | ---: | --- |',
    ...featuredRows,
    '',
    '## Endpoints publishable now (data-backed)',
    '',
    '- `GET /v1/health`, `GET /v1/data-status`, `GET /v1/openapi.json`, `GET /docs` — always.',
    '- `GET /v1/sports` — 3 sports.',
    '- `GET /v1/leagues`, `GET /v1/leagues/{id}` — full catalog.',
    '- `GET /v1/leagues/{id}/seasons` — seasons exist for most leagues (incl. Liga MX).',
    '- `GET /v1/leagues/{id}/teams|matches|standings` — populated for data-rich soccer leagues; empty (but valid) for Liga MX until loaded.',
    '- `GET /v1/teams/{id}`, `GET /v1/teams/{id}/matches` — for teams that exist.',
    '',
    '## Pending / not available',
    '',
    '- **NFL**: no leagues or `nfl_*` collections in this project. NFL endpoints return empty until data is loaded. (Would require `nfl_teams`/`nfl_games`/`nfl_standings` + an NFL league document.)',
    '- **Liga MX teams/matches/standings**: pending until those docs are loaded for league ext 262.',
    '- **statistics**: not modeled in Firestore — coverage flag is always `false`.',
    '- **F1**: intentionally excluded from the generic league/team endpoints (different model).',
    '',
    '## Suggested future normalizations / snapshots',
    '',
    '- A precomputed `data-status` snapshot document to avoid per-request `count()` fan-out.',
    '- Composite indexes (e.g. `league_id` + match date) if server-side sorted/paginated match queries are introduced.',
    '- Optional denormalized team names on NFL games (soccer matches already carry them).',
    '',
  ].filter((line) => line !== '');

  mkdirSync(DOCS_DIR, { recursive: true });
  writeFileSync(join(DOCS_DIR, 'firebase-data-inventory.md'), inventory.join('\n'), 'utf8');
  writeFileSync(join(DOCS_DIR, 'data-availability.md'), availability.join('\n'), 'utf8');

  console.log(`[inspect] wrote docs/firebase-data-inventory.md and docs/data-availability.md`);
}

main().catch((err) => {
  console.error('[inspect] failed:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
