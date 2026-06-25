import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFakeDb, type Dataset } from '../helpers/fake-firestore';

const state: { db: ReturnType<typeof makeFakeDb> | null } = { db: null };
vi.mock('@/lib/firebase/admin', () => ({
  getDb: () => state.db,
  isDataSourceConfigured: () => true,
}));

const { listLeagues, getLeague } = await import('@/lib/firebase/repositories/leagues.repository');
const { listTeamsByLeague, getTeamById } = await import('@/lib/firebase/repositories/teams.repository');
const { listStandingsByLeague } = await import('@/lib/firebase/repositories/standings.repository');
const { listMatchesBySeason, updateMatch, deleteMatch, createMatch } = await import('@/lib/firebase/repositories/matches.repository');
const { buildDataStatus } = await import('@/lib/firebase/repositories/data-status.repository');

const dataset: Dataset = {
  sports: [
    { id: 'sp_soccer', slug: 'soccer', name: 'Soccer' },
    { id: 'sp_nfl', slug: 'nfl', name: 'NFL' },
  ],
  countries: [{ id: 'c_mx', external_id: 'MX', name: 'Mexico' }],
  leagues: [
    { id: 'lg_mx', external_id: '262', name: 'Liga MX', type: 'League', sport_id: 'sp_soccer', country_id: 'c_mx' },
    { id: 'lg_ar', external_id: '128', name: 'Liga Argentina', type: 'League', sport_id: 'sp_soccer', country_id: null },
  ],
  seasons: [
    { id: 'se_ar26', league_id: 'lg_ar', year: 2026, current: true },
    { id: 'se_ar25', league_id: 'lg_ar', year: 2025, current: false },
  ],
  soccer_teams: [
    { id: 'tm_boca', league_id: 'lg_ar', external_id: '1', team: { name: 'Boca', logo: 'b.png' } },
    { id: 'tm_river', league_id: 'lg_ar', external_id: '2', team: { name: 'River', logo: 'r.png' } },
  ],
  soccer_matches: [
    {
      id: 'm1',
      league_id: 'lg_ar',
      season_id: 'se_ar26',
      home_team_id: 'tm_boca',
      away_team_id: 'tm_river',
      fixture_date: '2026-08-01T00:00:00Z',
      status: 'NS',
      goals: { home: null, away: null },
      teams: { home: { name: 'Boca' }, away: { name: 'River' } },
    },
  ],
  soccer_standings: [
    { id: 'st1', league_id: 'lg_ar', season_id: 'se_ar26', team_id: 'tm_boca', points: 10, played: 4, wins: 3, draws: 1, losses: 0 },
  ],
  // No nfl_* collections -> NFL coverage is empty.
};

beforeEach(() => {
  state.db = makeFakeDb(structuredClone(dataset));
});

describe('leagues repository', () => {
  it('lists leagues with resolved country + sport', async () => {
    const all = await listLeagues({});
    expect(all).toHaveLength(2);
    expect(all.find((l) => l.externalId === '262')).toMatchObject({ country: 'Mexico', sport: 'soccer' });
  });

  it('filters by sport slug', async () => {
    expect(await listLeagues({ sportSlug: 'soccer' })).toHaveLength(2);
    expect(await listLeagues({ sportSlug: 'nfl' })).toHaveLength(0);
  });

  it('resolves a league by id and by external id', async () => {
    expect((await getLeague('lg_mx'))?.dto.name).toBe('Liga MX');
    expect((await getLeague('128'))?.dto.name).toBe('Liga Argentina');
    expect(await getLeague('missing')).toBeNull();
  });
});

describe('teams, standings, matches', () => {
  it('lists league teams sorted by name', async () => {
    const teams = await listTeamsByLeague('lg_ar', 'soccer');
    expect(teams.map((t) => t.name)).toEqual(['Boca', 'River']);
  });

  it('resolves a team by id', async () => {
    expect((await getTeamById('tm_boca'))?.team.name).toBe('Boca');
    expect(await getTeamById('ghost')).toBeNull();
  });

  it('standings resolve team names from the team map', async () => {
    const standings = await listStandingsByLeague('lg_ar', 'soccer', { seasonId: 'se_ar26' });
    expect(standings[0]).toMatchObject({ teamName: 'Boca', points: 10 });
  });

  it('lists matches for a season with denormalized team names', async () => {
    const matches = await listMatchesBySeason('soccer', 'se_ar26', { sortDesc: true });
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({ status: 'NS', home: { name: 'Boca' }, away: { name: 'River' } });
  });

  it('creates a match in the current season', async () => {
    const created = await createMatch('lg_ar', 'soccer', 'se_ar26', {
      date: '2026-09-15T00:00:00Z',
      home: { teamId: 'tm_boca' },
      away: { teamId: 'tm_river' },
    });
    expect(created).toMatchObject({
      leagueId: 'lg_ar',
      seasonId: 'se_ar26',
      status: 'NS',
      date: '2026-09-15T00:00:00Z',
      home: { teamId: 'tm_boca', name: 'Boca' },
      away: { teamId: 'tm_river', name: 'River' },
    });

    const matches = await listMatchesBySeason('soccer', 'se_ar26', { sortDesc: true });
    expect(matches).toHaveLength(2);
  });

  it('rejects teams that do not belong to the league', async () => {
    await expect(
      createMatch('lg_ar', 'soccer', 'se_ar26', {
        date: '2026-09-15T00:00:00Z',
        home: { teamId: 'ghost' },
        away: { teamId: 'tm_river' },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_REQUEST_BODY' });
  });

  it('returns empty for an unknown season (no error)', async () => {
    expect(await listMatchesBySeason('soccer', 'nope', { sortDesc: true })).toEqual([]);
  });

  it('updates a match and returns the serialized dto', async () => {
    const updated = await updateMatch('lg_ar', 'soccer', 'm1', {
      status: 'FT',
      home: { score: 2 },
      away: { score: 0 },
    });
    expect(updated).toMatchObject({
      id: 'm1',
      status: 'FT',
      home: { score: 2 },
      away: { score: 0 },
    });
    expect(updated.updatedAt).toBeTruthy();

    const matches = await listMatchesBySeason('soccer', 'se_ar26', { sortDesc: true });
    expect(matches[0]).toMatchObject({ status: 'FT', home: { score: 2 }, away: { score: 0 } });
  });

  it('returns not found when the match belongs to another league', async () => {
    await expect(
      updateMatch('lg_mx', 'soccer', 'm1', { status: 'FT' }),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
  });

  it('deletes a match from firestore', async () => {
    await deleteMatch('lg_ar', 'soccer', 'm1');
    expect(await listMatchesBySeason('soccer', 'se_ar26', { sortDesc: true })).toEqual([]);
  });

  it('returns not found when deleting a match from another league', async () => {
    await expect(deleteMatch('lg_mx', 'soccer', 'm1')).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
    });
  });
});

describe('data-status', () => {
  it('derives sport coverage (soccer populated, NFL empty) and featured leagues', async () => {
    const status = await buildDataStatus();
    expect(status.sports.find((s) => s.slug === 'soccer')?.coverage.teams).toBe(true);
    expect(status.sports.find((s) => s.slug === 'nfl')?.coverage.teams).toBe(false);

    const mx = status.leagues.find((l) => l.externalId === '262');
    const ar = status.leagues.find((l) => l.externalId === '128');
    expect(mx?.coverage.teams).toBe(false); // Liga MX: only metadata
    expect(ar?.coverage).toMatchObject({ teams: true, matches: true, standings: true });
    expect(ar?.availableSeasons).toContain(2026);
  });
});
