import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFakeDb, type Dataset } from '../helpers/fake-firestore';

const LEAGUE_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const SEASON_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const TEAM_MIA_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const TEAM_DET_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const GAME_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const STANDING_ID = 'ffffffff-ffff-4fff-8fff-ffffffffffff';

const state: { db: ReturnType<typeof makeFakeDb> | null } = { db: null };
vi.mock('@/lib/firebase/admin', () => ({
  getDb: () => state.db,
  isDataSourceConfigured: () => true,
}));

const { fetchAmericanFootballCountries } = await import('@/lib/bff/american-football/services/countries.service');
const { fetchAmericanFootballLeagues, fetchAmericanFootballGlobalSeasons } = await import(
  '@/lib/bff/american-football/services/leagues.service'
);
const { fetchAmericanFootballGames } = await import('@/lib/bff/american-football/services/games.service');
const { fetchAmericanFootballTeams } = await import('@/lib/bff/american-football/services/teams.service');
const { fetchAmericanFootballStandings } = await import('@/lib/bff/american-football/services/standings.service');
const { fetchAmericanFootballTimezones } = await import('@/lib/bff/american-football/services/timezone.service');
const { createAmericanFootballTeamEntry } = await import('@/lib/bff/american-football/writers/teams.writer');

const dataset: Dataset = {
  sports: [{ id: 'sp_nfl', slug: 'american-football', name: 'NFL' }],
  countries: [
    {
      id: 'c_us',
      external_id: 'US',
      code: 'US',
      name: 'USA',
      flag: 'https://media.api-sports.io/flags/us.svg',
    },
  ],
  leagues: [
    {
      id: LEAGUE_ID,
      external_id: '1',
      name: 'NFL',
      type: 'league',
      sport_id: 'sp_nfl',
      country_id: 'c_us',
      logo: 'https://media.api-sports.io/american-football/leagues/1.png',
    },
  ],
  seasons: [
    {
      id: SEASON_ID,
      league_id: LEAGUE_ID,
      year: 2022,
      current: true,
      start_date: '2022-08-05',
      end_date: '2023-02-12',
    },
  ],
  nfl_teams: [
    {
      id: TEAM_MIA_ID,
      league_id: LEAGUE_ID,
      external_id: '25',
      name: 'Miami Dolphins',
      logo: 'https://example.com/mia.png',
      api_sports_payload: { id: 25, name: 'Miami Dolphins', logo: 'https://example.com/mia.png' },
    },
    {
      id: TEAM_DET_ID,
      league_id: LEAGUE_ID,
      external_id: '7',
      name: 'Detroit Lions',
      logo: 'https://example.com/det.png',
      api_sports_payload: { id: 7, name: 'Detroit Lions', logo: 'https://example.com/det.png' },
    },
  ],
  nfl_games: [
    {
      id: GAME_ID,
      external_id: '4550',
      league_id: LEAGUE_ID,
      season_id: SEASON_ID,
      home_team_id: TEAM_MIA_ID,
      away_team_id: TEAM_DET_ID,
      game_date: '2022-09-30T00:00:00.000Z',
      status: 'FT',
      home_score: 38,
      away_score: 26,
      teams: {
        home: { name: 'Miami Dolphins' },
        away: { name: 'Detroit Lions' },
      },
    },
  ],
  nfl_standings: [
    {
      id: STANDING_ID,
      league_id: LEAGUE_ID,
      season_id: SEASON_ID,
      team_id: TEAM_MIA_ID,
      conference: 'American Football Conference',
      wins: 3,
      losses: 1,
    },
  ],
  reference_timezones: [{ id: 'UTC', name: 'UTC' }],
};

beforeEach(() => {
  state.db = makeFakeDb(structuredClone(dataset));
});

describe('BFF NFL services', () => {
  it('lists countries in Football v3 shape', async () => {
    const countries = await fetchAmericanFootballCountries({});
    expect(countries).toEqual([
      { name: 'USA', code: 'US', flag: 'https://media.api-sports.io/flags/us.svg' },
    ]);
  });

  it('returns NFL league with canonical id and nested seasons', async () => {
    const leagues = await fetchAmericanFootballLeagues({ id: LEAGUE_ID });
    expect(leagues).toHaveLength(1);
    expect(leagues[0]).toMatchObject({
      league: { id: LEAGUE_ID, name: 'NFL' },
      country: { name: 'USA', code: 'US' },
      seasons: [{ year: 2022, current: true }],
    });
  });

  it('resolves league by legacy external id but returns canonical id', async () => {
    const leagues = await fetchAmericanFootballLeagues({ id: '1' });
    expect(leagues[0]?.league.id).toBe(LEAGUE_ID);
  });

  it('returns NFL season years', async () => {
    expect(await fetchAmericanFootballGlobalSeasons()).toEqual([2022]);
  });

  it('returns games by league and season with canonical ids', async () => {
    const games = await fetchAmericanFootballGames({ league: LEAGUE_ID, season: 2022 });
    expect(games).toHaveLength(1);
    expect(games[0]).toMatchObject({
      game: { id: GAME_ID },
      league: { id: LEAGUE_ID, name: 'NFL', season: 2022 },
      teams: {
        home: { id: TEAM_MIA_ID, name: 'Miami Dolphins' },
        away: { id: TEAM_DET_ID, name: 'Detroit Lions' },
      },
    });
  });

  it('returns game by canonical id', async () => {
    const games = await fetchAmericanFootballGames({ id: GAME_ID });
    expect(games[0]?.game.id).toBe(GAME_ID);
  });

  it('returns teams by league and season with canonical ids', async () => {
    const teams = await fetchAmericanFootballTeams({ league: LEAGUE_ID, season: 2022 });
    expect(teams).toHaveLength(2);
    expect(teams).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: TEAM_MIA_ID, name: 'Miami Dolphins' }),
        expect.objectContaining({ id: TEAM_DET_ID, name: 'Detroit Lions' }),
      ]),
    );
  });

  it('returns standings by league and season with canonical ids', async () => {
    const standings = await fetchAmericanFootballStandings({
      league: LEAGUE_ID,
      season: 2022,
      conference: 'American Football Conference',
    });
    expect(standings).toHaveLength(1);
    expect(standings[0]).toMatchObject({
      id: STANDING_ID,
      league: { id: LEAGUE_ID, name: 'NFL', season: 2022 },
      team: { id: TEAM_MIA_ID, name: 'Miami Dolphins' },
    });
  });

  it('lists timezones', async () => {
    expect(await fetchAmericanFootballTimezones()).toEqual(['UTC']);
  });

  it('creates a team without client-assigned id and returns canonical id', async () => {
    const created = await createAmericanFootballTeamEntry(LEAGUE_ID, {
      name: 'Buffalo Bills',
      logo: null,
    });
    expect(created.name).toBe('Buffalo Bills');
    expect(created.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
