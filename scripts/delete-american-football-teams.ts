/**
 * Delete all documents in the `nfl_teams` collection.
 *
 * USAGE:
 *   pnpm data:delete-american-football-teams              # dry run (list only)
 *   pnpm data:delete-american-football-teams -- --confirm # delete for real
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const ROOT = process.cwd();
const COLLECTION = 'nfl_teams';
const CONFIRM = process.argv.includes('--confirm');

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

async function main() {
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

  const db = getFirestore(app);
  const snap = await db.collection(COLLECTION).get();
  const docs = snap.docs;

  console.log(`Found ${docs.length} document(s) in ${COLLECTION}.`);

  if (docs.length === 0) {
    return;
  }

  for (const doc of docs) {
    const name = doc.data().name ?? doc.data().external_id ?? '—';
    console.log(`  - ${doc.id} (${name})`);
  }

  if (!CONFIRM) {
    console.log('\nDry run only. Re-run with --confirm to delete.');
    return;
  }

  const batchSize = 500;
  let deleted = 0;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = db.batch();
    for (const doc of docs.slice(i, i + batchSize)) {
      batch.delete(doc.ref);
    }
    await batch.commit();
    deleted += Math.min(batchSize, docs.length - i);
    console.log(`Deleted ${deleted}/${docs.length}…`);
  }

  console.log(`Done. Removed ${deleted} NFL team document(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
