import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFakeDb, type Dataset } from '../helpers/fake-firestore';

const state: { db: ReturnType<typeof makeFakeDb> | null } = { db: null };
vi.mock('@/lib/firebase/admin', () => ({
  getDb: () => state.db,
  isDataSourceConfigured: () => true,
}));

const { fetchFootballCountries } = await import('@/lib/bff/football/services/countries.service');
const { fetchFootballLeagues, fetchFootballGlobalSeasons } = await import(
  '@/lib/bff/football/services/leagues.service'
);
const { fetchFootballFixtures } = await import('@/lib/bff/football/services/fixtures.service');
const { fetchFootballRounds } = await import('@/lib/bff/football/services/rounds.service');
const { fetchFootballStandings } = await import('@/lib/bff/football/services/standings.service');
const {
  updateSoccerLeagueEntry,
  updateSoccerSeasonYear,
} = await import('@/lib/bff/football/writers/catalog.writer');
const { createSoccerTeamEntry } = await import('@/lib/bff/football/writers/teams.writer');
const { createSoccerStandingEntry } = await import('@/lib/bff/football/writers/standings.writer');

const dataset: Dataset = {
  sports: [{ id: 'sp_soccer', slug: 'soccer', name: 'Soccer' }],
  countries: [
    {
      id: 'c_mx',
      external_id: 'MX',
      code: 'MX',
      name: 'Mexico',
      flag: 'https://example.com/mx.svg',
    },
  ],
  leagues: [
    {
      id: 'lg_mx',
      external_id: '262',
      name: 'Liga MX',
      type: 'League',
      sport_id: 'sp_soccer',
      country_id: 'c_mx',
      logo: 'https://example.com/liga.png',
    },
  ],
  seasons: [
    { id: 'se_mx26', league_id: 'lg_mx', year: 2026, current: true, start_date: '2026-07-01', end_date: '2026-12-01' },
    { id: 'se_mx25', league_id: 'lg_mx', year: 2025, current: false },
  ],
  soccer_teams: [
    { id: 'tm_1', league_id: 'lg_mx', external_id: '1', team: { name: 'Club A', logo: 'a.png' } },
    { id: 'tm_2', league_id: 'lg_mx', external_id: '2', team: { name: 'Club B', logo: 'b.png' } },
  ],
  soccer_matches: [
    {
      id: 'm1',
      external_id: '9001',
      league_id: 'lg_mx',
      season_id: 'se_mx26',
      home_team_id: 'tm_1',
      away_team_id: 'tm_2',
      fixture_date: '2026-08-01T00:00:00Z',
      status: 'NS',
      fixture: { id: 9001, date: '2026-08-01T00:00:00Z', status: { short: 'NS', long: 'Not Started' } },
      league: { id: 262, name: 'Liga MX', season: 2026, round: 'Apertura - 1' },
      goals: { home: null, away: null },
      teams: {
        home: { id: 1, name: 'Club A', logo: 'a.png', winner: null },
        away: { id: 2, name: 'Club B', logo: 'b.png', winner: null },
      },
    },
  ],
  soccer_rounds: [
    { id: 'r1', league_id: 'lg_mx', season_id: 'se_mx26', name: 'Apertura - 1', position: 1 },
    { id: 'r2', league_id: 'lg_mx', season_id: 'se_mx26', name: 'Apertura - 2', position: 2 },
  ],
  soccer_standings: [
    {
      id: 'st1',
      league_id: 'lg_mx',
      season_id: 'se_mx26',
      team_id: 'tm_1',
      points: 10,
      played: 4,
      wins: 3,
      draws: 1,
      losses: 0,
    },
  ],
};

beforeEach(() => {
  state.db = makeFakeDb(structuredClone(dataset));
});

describe('BFF football services', () => {
  it('lists countries in API-Sports shape', async () => {
    const countries = await fetchFootballCountries({ code: 'MX' });
    expect(countries).toEqual([
      { name: 'Mexico', code: 'MX', flag: 'https://example.com/mx.svg' },
    ]);
  });

  it('returns a league entry with nested seasons', async () => {
    const leagues = await fetchFootballLeagues({ id: '262' });
    expect(leagues).toHaveLength(1);
    expect(leagues[0]).toMatchObject({
      league: { id: 262, name: 'Liga MX', type: 'League' },
      country: { name: 'Mexico', code: 'MX' },
      seasons: [{ year: 2026, current: true }, { year: 2025, current: false }],
    });
  });

  it('returns global season years', async () => {
    expect(await fetchFootballGlobalSeasons()).toEqual([2026, 2025]);
  });

  it('returns fixtures by league and season', async () => {
    const fixtures = await fetchFootballFixtures({
      leagueExternalId: '262',
      seasonYear: 2026,
    });
    expect(fixtures).toHaveLength(1);
    expect(fixtures[0]).toMatchObject({
      fixture: { id: 9001 },
      teams: { home: { name: 'Club A' }, away: { name: 'Club B' } },
    });
  });

  it('returns fixture rounds for a league season', async () => {
    expect(await fetchFootballRounds({ leagueExternalId: '262', seasonYear: 2026 })).toEqual([
      'Apertura - 1',
      'Apertura - 2',
    ]);
  });

  it('returns standings grouped under league', async () => {
    const standings = await fetchFootballStandings({
      leagueExternalId: '262',
      seasonYear: 2026,
    });
    expect(standings).toHaveLength(1);
    expect(standings[0]).toMatchObject({
      league: {
        id: 262,
        name: 'Liga MX',
        season: 2026,
        standings: [[{ rank: 1, team: { id: 1, name: 'Club A' }, points: 10 }]],
      },
    });
  });

  it('updates league seasons when patching a league', async () => {
    const updated = await updateSoccerLeagueEntry('lg_mx', {
      league: { name: 'Liga MX', type: 'League', logo: 'https://example.com/liga.png' },
      country: { name: 'Mexico', code: 'MX', flag: 'https://example.com/mx.svg' },
      seasons: [
        { year: 2026, start: '2026-07-15', end: '2026-12-15', current: true },
        { year: 2025, current: false },
      ],
    });

    expect(updated.seasons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          year: 2026,
          start: '2026-07-15',
          end: '2026-12-15',
          current: true,
        }),
      ]),
    );
  });

  it('patches a season year directly', async () => {
    const year = await updateSoccerSeasonYear(
      { year: 2026, start: '2026-08-01', end: '2026-12-31', current: true },
      'lg_mx',
    );
    expect(year).toBe(2026);
  });

  it('creates a soccer team and standing', async () => {
    const team = await createSoccerTeamEntry('lg_mx', {
      name: 'Club C',
      logo: 'https://example.com/c.png',
    });
    expect(team).toMatchObject({
      team: { name: 'Club C', logo: 'https://example.com/c.png' },
    });

    const standing = await createSoccerStandingEntry({
      league: { id: 'lg_mx', season: 2026 },
      team: { id: (team.team as { id: string }).id },
      points: 12,
      all: { played: 5, win: 4, draw: 0, lose: 1 },
    });
    expect(standing).toMatchObject({
      league: { name: 'Liga MX', season: 2026 },
    });
  });
});
