import { describe, expect, it } from 'vitest';
import { mapRawAmericanFootballGameToApiSports } from '@/lib/bff/american-football/mappers/game.mapper';
import { mapRawAmericanFootballStandingToApiSports } from '@/lib/bff/american-football/mappers/standing.mapper';
import { americanFootballGameItemSchema, americanFootballStandingItemSchema } from '@/lib/bff/american-football/schemas';

const LEAGUE_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TEAM_HOME_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const TEAM_AWAY_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const GAME_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const STANDING_ID = 'ffffffff-ffff-4fff-8fff-ffffffffffff';

describe('NFL mappers canonical ids', () => {
  it('maps games from Firestore fields with document id', () => {
    const mapped = mapRawAmericanFootballGameToApiSports(
      {
        id: GAME_ID,
        data: {
          league_id: LEAGUE_ID,
          home_team_id: TEAM_HOME_ID,
          away_team_id: TEAM_AWAY_ID,
          game_date: '2022-09-30T00:00:00.000Z',
          status: 'FT',
          home_score: 38,
          away_score: 26,
          teams: {
            home: { name: 'Miami Dolphins' },
            away: { name: 'Detroit Lions' },
          },
        },
      },
      new Map([
        [TEAM_HOME_ID, { name: 'Miami Dolphins', logo: 'https://example.com/mia.png' }],
        [TEAM_AWAY_ID, { name: 'Detroit Lions', logo: 'https://example.com/det.png' }],
      ]),
      undefined,
      {
        id: LEAGUE_ID,
        name: 'NFL',
        season: 2022,
        logo: null,
        country: { name: 'USA', code: 'US', flag: null },
      },
    );

    expect(americanFootballGameItemSchema.parse(mapped)).toMatchObject({
      game: { id: GAME_ID },
      league: { id: LEAGUE_ID, name: 'NFL', season: 2022 },
      teams: {
        home: { id: TEAM_HOME_ID, name: 'Miami Dolphins' },
        away: { id: TEAM_AWAY_ID, name: 'Detroit Lions' },
      },
    });
  });

  it('maps standings from Firestore fields with canonical ids', () => {
    const mapped = mapRawAmericanFootballStandingToApiSports(
      {
        id: STANDING_ID,
        data: {
          league_id: LEAGUE_ID,
          team_id: TEAM_HOME_ID,
          conference: 'American Football Conference',
          wins: 3,
          losses: 1,
        },
      },
      {
        id: LEAGUE_ID,
        externalId: '1',
        name: 'NFL',
        type: 'league',
        sport: 'american-football',
        country: 'USA',
        logo: null,
        altLogo: null,
        updatedAt: null,
      },
      null,
      2022,
      new Map([[TEAM_HOME_ID, { name: 'Miami Dolphins', logo: 'https://example.com/mia.png' }]]),
    );

    expect(americanFootballStandingItemSchema.parse(mapped)).toMatchObject({
      id: STANDING_ID,
      league: { id: LEAGUE_ID, name: 'NFL', season: 2022 },
      team: { id: TEAM_HOME_ID, name: 'Miami Dolphins' },
    });
  });
});
