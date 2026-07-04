import { describe, expect, it } from 'vitest';
import { mapRawNflGameToApiSports } from '@/lib/bff/nfl/mappers/game.mapper';
import { mapRawNflStandingToApiSports } from '@/lib/bff/nfl/mappers/standing.mapper';
import { nflGameItemSchema, nflStandingItemSchema } from '@/lib/bff/nfl/schemas';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FIXTURES_DIR = join(process.cwd(), 'tests/fixtures/api-sports-nfl');

describe('NFL mappers round-trip', () => {
  it('returns stored api_sports_payload for games', () => {
    const fixture = JSON.parse(readFileSync(join(FIXTURES_DIR, 'games-list.json'), 'utf8'));
    const item = fixture.response[0];
    const mapped = mapRawNflGameToApiSports({
      id: 'g1',
      data: { api_sports_payload: item },
    });
    expect(nflGameItemSchema.parse(mapped)).toEqual(item);
  });

  it('returns stored api_sports_payload for standings', () => {
    const fixture = JSON.parse(readFileSync(join(FIXTURES_DIR, 'standings.json'), 'utf8'));
    const item = fixture.response[0];
    const mapped = mapRawNflStandingToApiSports(
      { id: 's1', data: { api_sports_payload: item } },
      { id: 'lg1', externalId: '1', name: 'NFL', type: 'league', sport: 'nfl', country: 'USA', logo: null, updatedAt: null },
      null,
      2022,
      new Map(),
      new Map(),
    );
    expect(nflStandingItemSchema.parse(mapped)).toEqual(item);
  });
});
