/**
 * Migrate the sports catalog entry from slug `nfl` to `american-football`.
 *
 * USAGE:
 *   tsx scripts/migrate-american-football-slug.ts           # dry run
 *   tsx scripts/migrate-american-football-slug.ts --confirm
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const ROOT = process.cwd();
const CONFIRM = process.argv.includes('--confirm');
const OLD_SLUG = 'nfl';
const NEW_SLUG = 'american-football';

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

async function main() {
  const db = initDb();

  const oldSnap = await db.collection('sports').where('slug', '==', OLD_SLUG).limit(1).get();
  const newSnap = await db.collection('sports').where('slug', '==', NEW_SLUG).limit(1).get();

  if (newSnap.docs[0]) {
    console.log(`Sport already migrated: ${newSnap.docs[0].id} (slug=${NEW_SLUG})`);
    return;
  }

  const doc = oldSnap.docs[0];
  if (!doc) {
    console.error(`No sports document found with slug "${OLD_SLUG}".`);
    process.exit(1);
  }

  const data = doc.data();
  console.log(`Will update sports/${doc.id}:`);
  console.log(`  slug: ${OLD_SLUG} → ${NEW_SLUG}`);
  console.log(`  name: ${data.name ?? '(unset)'} (unchanged)`);

  if (!CONFIRM) {
    console.log('\nDry run only. Re-run with --confirm to apply.');
    return;
  }

  await doc.ref.update({ slug: NEW_SLUG });
  console.log('\nDone. Sport slug migrated to american-football.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
