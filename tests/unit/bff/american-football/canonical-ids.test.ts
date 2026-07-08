import { describe, expect, it } from 'vitest';
import {
  americanFootballGameCreateSchema,
  americanFootballLeagueCreateSchema,
  americanFootballTeamCreateSchema,
} from '@/lib/bff/american-football/schemas';

const LEAGUE_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TEAM_HOME_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const TEAM_AWAY_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

describe('American Football create schemas reject client-assigned ids', () => {
  it('rejects team create body with id', () => {
    const result = americanFootballTeamCreateSchema.safeParse({
      id: 25,
      name: 'Miami Dolphins',
    });
    expect(result.success).toBe(false);
  });

  it('accepts team create body without id', () => {
    expect(
      americanFootballTeamCreateSchema.parse({
        name: 'Miami Dolphins',
        logo: null,
      }),
    ).toEqual({ name: 'Miami Dolphins', logo: null });
  });

  it('rejects league create body with league.id', () => {
    const result = americanFootballLeagueCreateSchema.safeParse({
      league: { id: 1, name: 'NFL', type: 'league' },
      country: { name: 'USA', code: 'US' },
      seasons: [{ year: 2022, current: true }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects game create body with game.id', () => {
    const result = americanFootballGameCreateSchema.safeParse({
      game: { id: 4550, stage: 'Regular Season' },
      league: { id: LEAGUE_ID, name: 'NFL', season: 2022 },
      teams: {
        home: { id: TEAM_HOME_ID, name: 'Miami Dolphins' },
        away: { id: TEAM_AWAY_ID, name: 'Detroit Lions' },
      },
    });
    expect(result.success).toBe(false);
  });

  it('accepts game create body with canonical team and league refs', () => {
    expect(
      americanFootballGameCreateSchema.parse({
        game: { stage: 'Regular Season', week: '5' },
        league: { id: LEAGUE_ID, name: 'NFL', season: 2022 },
        teams: {
          home: { id: TEAM_HOME_ID, name: 'Miami Dolphins' },
          away: { id: TEAM_AWAY_ID, name: 'Detroit Lions' },
        },
      }),
    ).toMatchObject({
      league: { id: LEAGUE_ID },
      teams: { home: { id: TEAM_HOME_ID }, away: { id: TEAM_AWAY_ID } },
    });
  });
});
