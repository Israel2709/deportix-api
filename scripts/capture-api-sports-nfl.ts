#!/usr/bin/env tsx
/**
 * Optional: capture live api-sports NFL responses into tests/fixtures/api-sports-nfl/.
 * Requires APISPORTS_KEY in the environment.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://v1.american-football.api-sports.io';
const OUT_DIR = join(process.cwd(), 'tests/fixtures/api-sports-nfl');

async function capture(path: string, params: Record<string, string>, outfile: string) {
  const key = process.env.APISPORTS_KEY;
  if (!key) {
    console.error('APISPORTS_KEY is not set.');
    process.exit(1);
  }

  const url = new URL(path, BASE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url, { headers: { 'x-apisports-key': key } });
  const json = await res.json();
  writeFileSync(join(OUT_DIR, outfile), `${JSON.stringify(json, null, 2)}\n`);
  console.log(`Wrote ${outfile}`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  await capture('/timezone', {}, 'timezone.json');
  await capture('/seasons', {}, 'seasons.json');
  await capture('/leagues', {}, 'leagues.json');
  await capture('/games', { league: '1', season: '2022' }, 'games-list.json');
  await capture('/games', { id: '4550' }, 'games-by-id.json');
  await capture('/teams', { league: '1', season: '2022' }, 'teams.json');
  await capture('/standings', { league: '1', season: '2022' }, 'standings.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
