import { describe, expect, it } from 'vitest';
import { mapRawAmericanFootballGameToApiSports } from '@/lib/bff/american-football/mappers/game.mapper';
import { mapRawAmericanFootballStandingToApiSports } from '@/lib/bff/american-football/mappers/standing.mapper';
import { americanFootballGameItemSchema, americanFootballStandingItemSchema } from '@/lib/bff/american-football/schemas';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FIXTURES_DIR = join(process.cwd(), 'tests/fixtures/api-sports-nfl');

describe('NFL mappers round-trip', () => {
  it('returns stored api_sports_payload for games', () => {
    const fixture = JSON.parse(readFileSync(join(FIXTURES_DIR, 'games-list.json'), 'utf8'));
    const item = fixture.response[0];
    const mapped = mapRawAmericanFootballGameToApiSports({
      id: 'g1',
      data: { api_sports_payload: item },
    });
    expect(americanFootballGameItemSchema.parse(mapped)).toEqual(item);
  });

  it('returns stored api_sports_payload for standings', () => {
    const fixture = JSON.parse(readFileSync(join(FIXTURES_DIR, 'standings.json'), 'utf8'));
    const item = fixture.response[0];
    const mapped = mapRawAmericanFootballStandingToApiSports(
      { id: 's1', data: { api_sports_payload: item } },
      { id: 'lg1', externalId: '1', name: 'NFL', type: 'league', sport: 'american-football', country: 'USA', logo: null, altLogo: null, updatedAt: null },
      null,
      2022,
      new Map(),
      new Map(),
    );
    expect(americanFootballStandingItemSchema.parse(mapped)).toEqual(item);
  });
});
