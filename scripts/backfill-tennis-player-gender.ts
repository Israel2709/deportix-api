/**
 * Backfill `gender` on tennis_players from a curated first-name dictionary
 * for the current Deportix tennis catalog.
 *
 * USAGE:
 *   pnpm exec tsx scripts/backfill-tennis-player-gender.ts           # dry-run
 *   pnpm exec tsx scripts/backfill-tennis-player-gender.ts --write   # apply
 */
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');

const FEMALE = new Set(
  [
    'ajla', 'akasha', 'alexandra', 'alexis', 'aliaksandra', 'alina', 'alycia', 'amanda',
    'anastasia', 'anastasiia', 'andrea', 'anhelina', 'ann', 'anna', 'antonia', 'aryna',
    'ashlyn', 'ayla', 'barbora', 'beatriz', 'belinda', 'bianca', 'camila', 'carol',
    'carole', 'caty', 'claire', 'clara', 'coco', 'cristina', 'dalma', 'daria', 'darja',
    'dayana', 'despina', 'diana', 'diane', 'dominika', 'donna', 'ekaterina', 'ekaterine',
    'elena', 'elina', 'elisabetta', 'elise', 'elizabeth', 'elizara', 'ella', 'elsa',
    'elvina', 'emiliana', 'emma', 'eva', 'fiona', 'francesca', 'gabriela', 'greet',
    'hailey', 'hanne', 'harriet', 'himeno', 'iga', 'iryna', 'iva', 'janice', 'jaqueline',
    'jasmin', 'jasmine', 'jelena', 'jeline', 'jessica', 'jil', 'julia', 'kaitlin', 'kaja',
    'kamilla', 'karen', 'karolina', 'katarzyna', 'katerina', 'katie', 'kayla', 'kimberly',
    'kristina', 'lanlana', 'laura', 'leolia', 'leylah', 'leyre', 'lilli', 'lin', 'linda',
    'lisa', 'liudmila', 'lola', 'lucia', 'lucrezia', 'luisina', 'lulu', 'mackenzie',
    'maddison', 'madison', 'magda', 'magdalena', 'mai', 'maja', 'mananchaya', 'maria',
    'marie', 'marina', 'marketa', 'marta', 'martyna', 'mary', 'maya', 'mayar', 'mia',
    'mirra', 'moyuka', 'naomi', 'noma', 'nuria', 'oksana', 'oleksandra', 'panna', 'paula',
    'petra', 'peyton', 'polina', 'priscilla', 'qinwen', 'rebecca', 'rebeka', 'renata',
    'sara', 'shuai', 'simona', 'sinja', 'sofia', 'solana', 'sonay', 'sorana', 'storm',
    'susan', 'suzan', 'talia', 'tamara', 'tatiana', 'tatjana', 'taylah', 'taylor',
    'teodora', 'tereza', 'tiantsoa', 'tyra', 'varvara', 'vendula', 'veronika', 'victoria',
    'viktorija', 'xinyu', 'xiyu', 'yeonwoo', 'yexin', 'yibing', 'yue', 'yulia', 'yuliia',
    'zeynep',
  ].map((n) => n.toLowerCase()),
);

const MALE = new Set(
  [
    'adam', 'adolfo', 'adrian', 'alejandro', 'aleksandar', 'alex', 'alexander', 'alexandre',
    'alexei', 'andre', 'andrey', 'arthur', 'ben', 'benjamin', 'bernard', 'billy', 'borna',
    'botic', 'brandon', 'cameron', 'camilo', 'carlos', 'casper', 'chak', 'chris',
    'christopher', 'clement', 'corentin', 'cristian', 'dalibor', 'damir', 'dane', 'daniel',
    'daniil', 'david', 'denis', 'diego', 'dino', 'dusan', 'edas', 'eliot', 'elmer',
    'emerson', 'emilio', 'ethan', 'fabian', 'facundo', 'federico', 'felix', 'flavio',
    'frances', 'francesco', 'francisco', 'gabriel', 'gauthier', 'gianluca', 'giovanni',
    'gonzalo', 'grigor', 'gustavo', 'hamad', 'harry', 'henrique', 'holger', 'hubert',
    'hugo', 'ignacio', 'jack', 'jacob', 'jaime', 'jakub', 'james', 'jan', 'jan-lennard',
    'jannik', 'jaume', 'jenson', 'jerome', 'jesper', 'jiri', 'joao', 'joel', 'juan',
    'jurij', 'kamil', 'keegan', 'kyrian', 'lautaro', 'leandro', 'learner', 'liam', 'lloyd',
    'lorenzo', 'luca', 'luciano', 'luka', 'lukas', 'marco', 'marcos', 'mariano', 'marin',
    'mark', 'martin', 'marton', 'matteo', 'mattia', 'max', 'mccartney', 'michael', 'miomir',
    'moise', 'nicolai', 'nicolas', 'nikola', 'nikoloz', 'nishesh', 'novak', 'nuno', 'otto',
    'pablo', 'patrick', 'pedro', 'quentin', 'rafael', 'raphael', 'rei', 'reilly', 'remy',
    'rinky', 'robin', 'roman', 'sebastian', 'shintaro', 'sho', 'soonwoo', 'stan', 'stefano',
    'stefanos', 'tallon', 'taro', 'terence', 'thiago', 'titouan', 'toby', 'tom', 'tomas',
    'tommy', 'tristan', 'ugo', 'valentin', 'vilius', 'vit', 'vitaliy', 'yannick',
    'yunchaokete', 'zachary', 'zdenek', 'zhizhen', 'zizou', 'zsombor',
  ].map((n) => n.toLowerCase()),
);

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

function normalizeFirstName(fullName: string): string {
  const part = fullName.trim().split(/\s+/)[0] ?? '';
  return part.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function inferGender(fullName: string): 'male' | 'female' | null {
  const first = normalizeFirstName(fullName);
  if (FEMALE.has(first)) return 'female';
  if (MALE.has(first)) return 'male';
  return null;
}

async function main() {
  loadDotEnvLocal();
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !rawKey) {
    throw new Error('Missing Firebase credentials in .env.local');
  }
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: rawKey.replace(/\\n/g, '\n'),
      }),
    });
  }

  const db = getFirestore();
  const snap = await db.collection('tennis_players').get();
  const pending = snap.docs.filter((doc) => {
    const g = doc.data().gender;
    return g !== 'male' && g !== 'female';
  });

  console.log(`[backfill] players=${snap.size} missingGender=${pending.length} write=${WRITE}`);

  let updated = 0;
  let skipped = 0;
  let batch = db.batch();
  let ops = 0;

  for (const doc of pending) {
    const fullName = String(doc.data().full_name ?? '');
    const gender = inferGender(fullName);
    if (!gender) {
      skipped += 1;
      console.log(`[skip] ${doc.id} name=${fullName} first=${normalizeFirstName(fullName)}`);
      continue;
    }
    if (WRITE) {
      batch.update(doc.ref, { gender, updated_at: new Date().toISOString() });
      ops += 1;
      if (ops >= 400) {
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }
    updated += 1;
  }

  if (WRITE && ops > 0) await batch.commit();
  console.log(`[backfill] ${WRITE ? 'updated' : 'wouldUpdate'}=${updated} skipped=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
