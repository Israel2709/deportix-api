/**
 * Reset all NFL-loaded data in Firestore to an empty state.
 *
 * Removes:
 *  - nfl_teams, nfl_games, nfl_standings
 *  - leagues with sport = american-football
 *  - seasons belonging to those leagues
 *  - countries referenced only by deleted NFL leagues
 *
 * Keeps the `sports` catalog entry for NFL (and all soccer / other sport data).
 *
 * USAGE:
 *   pnpm data:reset-american-football           # dry run
 *   pnpm data:reset-american-football -- --confirm
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
const AMERICAN_FOOTBALL_COLLECTIONS = ['nfl_teams', 'nfl_games', 'nfl_standings'] as const;

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

async function listCollection(db: Firestore, name: string): Promise<QueryDocumentSnapshot[]> {
  const snap = await db.collection(name).get();
  return snap.docs;
}

function describeRef(doc: QueryDocumentSnapshot | DocumentReference, label: string) {
  const id = doc.id;
  const data = 'data' in doc ? doc.data() : undefined;
  const hint = data?.name ?? data?.external_id ?? data?.year ?? id;
  console.log(`  - ${label}: ${id} (${hint})`);
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

async function main() {
  const db = initDb();

  const sportSnap = await db.collection('sports').where('slug', '==', 'american-football').limit(1).get();
  const americanFootballSportId = sportSnap.docs[0]?.id ?? null;

  const leagueDocs = americanFootballSportId
    ? (await db.collection('leagues').where('sport_id', '==', americanFootballSportId).get()).docs
    : [];

  const leagueIds = leagueDocs.map((doc) => doc.id);
  const countryIds = new Set<string>();
  for (const doc of leagueDocs) {
    const countryId = doc.data().country_id;
    if (typeof countryId === 'string' && countryId.trim()) countryIds.add(countryId);
  }

  const seasonDocs: QueryDocumentSnapshot[] = [];
  for (const leagueId of leagueIds) {
    const snap = await db.collection('seasons').where('league_id', '==', leagueId).get();
    seasonDocs.push(...snap.docs);
  }

  const americanFootballResourceDocs = (
    await Promise.all(AMERICAN_FOOTBALL_COLLECTIONS.map((name) => listCollection(db, name)))
  ).flat();

  const orphanCountryRefs: DocumentReference[] = [];
  if (countryIds.size > 0) {
    const remainingLeagues = await db.collection('leagues').get();
    const countriesStillUsed = new Set<string>();
    for (const doc of remainingLeagues.docs) {
      if (leagueIds.includes(doc.id)) continue;
      const countryId = doc.data().country_id;
      if (typeof countryId === 'string') countriesStillUsed.add(countryId);
    }
    for (const countryId of countryIds) {
      if (!countriesStillUsed.has(countryId)) {
        orphanCountryRefs.push(db.collection('countries').doc(countryId));
      }
    }
  }

  console.log('NFL reset plan:');
  console.log(`  Sport catalog entry: kept (${americanFootballSportId ?? 'nfl slug not found'})`);
  console.log(`  Leagues: ${leagueDocs.length}`);
  console.log(`  Seasons: ${seasonDocs.length}`);
  console.log(`  nfl_teams + nfl_games + nfl_standings: ${americanFootballResourceDocs.length}`);
  console.log(`  Countries (NFL-only): ${orphanCountryRefs.length}`);

  if (
    leagueDocs.length === 0 &&
    seasonDocs.length === 0 &&
    americanFootballResourceDocs.length === 0 &&
    orphanCountryRefs.length === 0
  ) {
    console.log('\nNothing to delete — NFL layer is already empty.');
    return;
  }

  console.log('\nDetails:');
  for (const doc of americanFootballResourceDocs) describeRef(doc, 'nfl resource');
  for (const doc of seasonDocs) describeRef(doc, 'season');
  for (const doc of leagueDocs) describeRef(doc, 'league');
  for (const ref of orphanCountryRefs) describeRef(ref, 'country');

  if (!CONFIRM) {
    console.log('\nDry run only. Re-run with --confirm to delete.');
    return;
  }

  console.log('\nDeleting…');
  const n1 = await deleteRefs(
    db,
    americanFootballResourceDocs.map((doc) => doc.ref),
  );
  const n2 = await deleteRefs(
    db,
    seasonDocs.map((doc) => doc.ref),
  );
  const n3 = await deleteRefs(
    db,
    leagueDocs.map((doc) => doc.ref),
  );
  const n4 = await deleteRefs(db, orphanCountryRefs);

  console.log(
    `\nDone. Removed ${n1} nfl resource(s), ${n2} season(s), ${n3} league(s), ${n4} country(ies).`,
  );
  console.log('NFL data layer reset to empty state.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
