import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFakeDb, type Dataset } from '../helpers/fake-firestore';

const state: { db: ReturnType<typeof makeFakeDb> | null } = { db: null };
vi.mock('@/lib/firebase/admin', () => ({
  getDb: () => state.db,
  isDataSourceConfigured: () => true,
}));

const { fetchNflCountries } = await import('@/lib/bff/nfl/services/countries.service');
const { fetchNflLeagues, fetchNflGlobalSeasons } = await import(
  '@/lib/bff/nfl/services/leagues.service'
);
const { fetchNflGames } = await import('@/lib/bff/nfl/services/games.service');
const { fetchNflTeams } = await import('@/lib/bff/nfl/services/teams.service');
const { fetchNflStandings } = await import('@/lib/bff/nfl/services/standings.service');
const { fetchNflTimezones } = await import('@/lib/bff/nfl/services/timezone.service');

const gamePayload = {
  game: {
    id: 4550,
    stage: 'Regular Season',
    week: '5',
    date: { timezone: 'UTC', date: '2022-09-30', time: '00:00', timestamp: 1664496000 },
    venue: { name: 'Hard Rock Stadium', city: 'Miami Gardens' },
    status: { short: 'FT', long: 'Finished', timer: null },
  },
  league: {
    id: 1,
    name: 'NFL',
    season: '2022',
    logo: 'https://media.api-sports.io/american-football/leagues/1.png',
    country: { name: 'USA', code: 'US', flag: 'https://media.api-sports.io/flags/us.svg' },
  },
  teams: {
    home: { id: 25, name: 'Miami Dolphins', logo: 'https://example.com/mia.png' },
    away: { id: 7, name: 'Detroit Lions', logo: 'https://example.com/det.png' },
  },
  scores: {
    home: { total: 38 },
    away: { total: 26 },
  },
};

const standingPayload = {
  league: {
    id: 1,
    name: 'NFL',
    season: 2022,
    logo: 'https://media.api-sports.io/american-football/leagues/1.png',
    country: { name: 'USA', code: 'US', flag: 'https://media.api-sports.io/flags/us.svg' },
  },
  conference: 'American Football Conference',
  division: 'East',
  position: 1,
  team: { id: 25, name: 'Miami Dolphins', logo: 'https://example.com/mia.png' },
  won: 3,
  lost: 1,
  ties: 0,
  points: { for: 98, against: 91, difference: 7 },
  records: { home: '2-0', road: '1-1', conference: '3-1', division: '2-0' },
  streak: 'L1',
  ncaa_conference: { won: null, lost: null, points: { for: null, against: null } },
};

const dataset: Dataset = {
  sports: [{ id: 'sp_nfl', slug: 'nfl', name: 'NFL' }],
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
      id: 'lg_nfl',
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
      id: 'se_nfl22',
      league_id: 'lg_nfl',
      year: 2022,
      current: true,
      start_date: '2022-08-05',
      end_date: '2023-02-12',
    },
  ],
  nfl_teams: [
    {
      id: 'tm_mia',
      league_id: 'lg_nfl',
      external_id: '25',
      name: 'Miami Dolphins',
      logo: 'https://example.com/mia.png',
      api_sports_payload: { id: 25, name: 'Miami Dolphins', logo: 'https://example.com/mia.png' },
    },
    {
      id: 'tm_det',
      league_id: 'lg_nfl',
      external_id: '7',
      name: 'Detroit Lions',
      logo: 'https://example.com/det.png',
      api_sports_payload: { id: 7, name: 'Detroit Lions', logo: 'https://example.com/det.png' },
    },
  ],
  nfl_games: [
    {
      id: 'g1',
      external_id: '4550',
      league_id: 'lg_nfl',
      season_id: 'se_nfl22',
      home_team_id: 'tm_mia',
      away_team_id: 'tm_det',
      game_date: '2022-09-30T00:00:00.000Z',
      status: 'FT',
      home_score: 38,
      away_score: 26,
      api_sports_payload: gamePayload,
    },
  ],
  nfl_standings: [
    {
      id: 'st1',
      league_id: 'lg_nfl',
      season_id: 'se_nfl22',
      team_id: 'tm_mia',
      conference: 'American Football Conference',
      api_sports_payload: standingPayload,
    },
  ],
  reference_timezones: [{ id: 'UTC', name: 'UTC' }],
};

beforeEach(() => {
  state.db = makeFakeDb(structuredClone(dataset));
});

describe('BFF NFL services', () => {
  it('lists countries in Football v3 shape', async () => {
    const countries = await fetchNflCountries({});
    expect(countries).toEqual([
      { name: 'USA', code: 'US', flag: 'https://media.api-sports.io/flags/us.svg' },
    ]);
  });

  it('returns NFL league with nested seasons', async () => {
    const leagues = await fetchNflLeagues({ id: '1' });
    expect(leagues).toHaveLength(1);
    expect(leagues[0]).toMatchObject({
      league: { id: 1, name: 'NFL' },
      country: { name: 'USA', code: 'US' },
      seasons: [{ year: 2022, current: true }],
    });
  });

  it('returns NFL season years', async () => {
    expect(await fetchNflGlobalSeasons()).toEqual([2022]);
  });

  it('returns games by league and season', async () => {
    const games = await fetchNflGames({ league: '1', season: 2022 });
    expect(games).toHaveLength(1);
    expect(games[0]).toMatchObject({ game: { id: 4550 } });
  });

  it('returns game by id from stored payload', async () => {
    const games = await fetchNflGames({ id: '4550' });
    expect(games[0]).toEqual(gamePayload);
  });

  it('returns teams by league and season', async () => {
    const teams = await fetchNflTeams({ league: '1', season: 2022 });
    expect(teams).toHaveLength(2);
    expect(teams[0]).toMatchObject({ id: 25, name: 'Miami Dolphins' });
  });

  it('returns standings by league and season', async () => {
    const standings = await fetchNflStandings({
      league: '1',
      season: 2022,
      conference: 'American Football Conference',
    });
    expect(standings).toHaveLength(1);
    expect(standings[0]).toEqual(standingPayload);
  });

  it('lists timezones', async () => {
    expect(await fetchNflTimezones()).toEqual(['UTC']);
  });
});
