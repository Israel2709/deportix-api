/**
 * Reset Serie A (league external_id 135) season 2026 operational data to virgin.
 *
 * Removes for that season only:
 *  - soccer_matches
 *  - soccer_rounds
 *  - soccer_standings
 *  - soccer_season_participants
 *
 * Keeps league, season, teams, and org catalog.
 *
 * USAGE:
 *   pnpm exec tsx scripts/reset-serie-a-2026.ts           # dry run
 *   pnpm exec tsx scripts/reset-serie-a-2026.ts --confirm
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import {
  getFirestore,
  type DocumentReference,
  type Firestore,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';

const ROOT = process.cwd();
const CONFIRM = process.argv.includes('--confirm');
const LEAGUE_EXTERNAL_ID = '135';
const SEASON_YEAR = 2026;

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
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function initDb(): Firestore {
  loadDotEnvLocal();
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !rawPrivateKey) {
    console.error('Missing Firebase credentials in .env.local');
    process.exit(1);
  }

  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: rawPrivateKey.replace(/\\n/g, '\n'),
      }),
      projectId,
    });

  return getFirestore(app);
}

async function deleteRefs(db: Firestore, refs: DocumentReference[]): Promise<number> {
  if (refs.length === 0) return 0;
  const batchSize = 500;
  let deleted = 0;
  for (let i = 0; i < refs.length; i += batchSize) {
    const batch = db.batch();
    for (const ref of refs.slice(i, i + batchSize)) {
      batch.delete(ref);
    }
    await batch.commit();
    deleted += Math.min(batchSize, refs.length - i);
  }
  return deleted;
}

function seasonMatches(doc: QueryDocumentSnapshot, seasonId: string, seasonYear: number): boolean {
  const data = doc.data();
  const sid = String(data.season_id ?? '');
  const year = data.season_year ?? data.year ?? data.season;
  return sid === seasonId || year === seasonYear || year === String(seasonYear);
}

async function main() {
  const db = initDb();

  const leagueSnap = await db
    .collection('leagues')
    .where('external_id', '==', LEAGUE_EXTERNAL_ID)
    .limit(5)
    .get();

  if (leagueSnap.empty) {
    // Fallback: doc id or external_id stored as number/string id field
    const byId = await db.collection('leagues').doc(LEAGUE_EXTERNAL_ID).get();
    if (!byId.exists) {
      console.error(`League external_id=${LEAGUE_EXTERNAL_ID} not found`);
      process.exit(1);
    }
    leagueSnap.docs.push(byId as QueryDocumentSnapshot);
  }

  const leagueDoc = leagueSnap.docs[0];
  const leagueId = leagueDoc.id;
  const leagueName = String(leagueDoc.data()?.name ?? leagueId);
  console.log(`League: ${leagueName} (${leagueId}, external=${LEAGUE_EXTERNAL_ID})`);

  const seasonsSnap = await db.collection('seasons').where('league_id', '==', leagueId).get();
  const seasonDoc =
    seasonsSnap.docs.find((d) => Number(d.data().year) === SEASON_YEAR) ??
    (
      await db.collection('seasons').where('league_id', '==', LEAGUE_EXTERNAL_ID).get()
    ).docs.find((d) => Number(d.data().year) === SEASON_YEAR);

  if (!seasonDoc) {
    console.error(`Season ${SEASON_YEAR} not found for league ${leagueId}`);
    process.exit(1);
  }

  const seasonId = seasonDoc.id;
  console.log(`Season: ${SEASON_YEAR} (${seasonId})`);
  console.log(CONFIRM ? 'MODE: CONFIRM — deleting' : 'MODE: dry-run — no deletes');

  const collections = [
    'soccer_matches',
    'soccer_rounds',
    'soccer_standings',
    'soccer_season_participants',
  ] as const;

  const toDelete: Record<string, QueryDocumentSnapshot[]> = {};

  for (const name of collections) {
    const bySeason = await db.collection(name).where('season_id', '==', seasonId).get();
    let docs = bySeason.docs;

    // Matches/rounds/standings may also be keyed by league + year without season_id match
    if (name !== 'soccer_season_participants') {
      const byLeagueUuid = await db.collection(name).where('league_id', '==', leagueId).get();
      const byLeagueExt = await db
        .collection(name)
        .where('league_id', '==', LEAGUE_EXTERNAL_ID)
        .get();
      const extra = [...byLeagueUuid.docs, ...byLeagueExt.docs].filter((d) =>
        seasonMatches(d, seasonId, SEASON_YEAR),
      );
      const seen = new Set(docs.map((d) => d.id));
      for (const d of extra) {
        if (!seen.has(d.id)) {
          docs.push(d);
          seen.add(d.id);
        }
      }
    }

    toDelete[name] = docs;
    console.log(`\n${name}: ${docs.length}`);
    for (const d of docs.slice(0, 12)) {
      const data = d.data();
      const hint =
        data.name ??
        data.round ??
        data.team_id ??
        `${data.home_team_id ?? data.home?.team_id ?? '?'} vs ${data.away_team_id ?? data.away?.team_id ?? '?'}`;
      console.log(`  - ${d.id} (${hint})`);
    }
    if (docs.length > 12) console.log(`  … +${docs.length - 12} more`);
  }

  const total = Object.values(toDelete).reduce((n, docs) => n + docs.length, 0);
  console.log(`\nTotal docs: ${total}`);

  if (!CONFIRM) {
    console.log('\nRe-run with --confirm to delete.');
    return;
  }

  for (const [name, docs] of Object.entries(toDelete)) {
    const n = await deleteRefs(
      db,
      docs.map((d) => d.ref),
    );
    console.log(`Deleted ${n} from ${name}`);
  }

  console.log('\nDone. Serie A 2026 is virgin (season shell kept).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
