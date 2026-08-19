import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import { makeFakeDb, type Dataset } from '../helpers/fake-firestore';

const DRIVER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TEAM_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const RACE_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const RANKING_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

const state: { db: ReturnType<typeof makeFakeDb> | null } = { db: null };
vi.mock('@/lib/firebase/admin', () => ({
  getDb: () => state.db,
  isDataSourceConfigured: () => true,
}));

const {
  listF1Drivers,
  getF1DriverById,
  listF1Teams,
  listF1Races,
  listF1LiveRaces,
  listF1DriverRankings,
  listF1TeamRankings,
  listF1RaceRankings,
} = await import('@/lib/firebase/repositories/f1.repository');

const dataset: Dataset = {
  f1_teams: [
    { id: TEAM_ID, external_id: '1', name: 'Red Bull', logo: 'rb.png' },
    { id: 'team2', external_id: '2', name: 'Ferrari', logo: 'fe.png' },
  ],
  f1_drivers: [
    {
      id: DRIVER_ID,
      external_id: '44',
      name: 'Max Verstappen',
      nationality: 'NL',
      number: 1,
      team_id: TEAM_ID,
    },
    {
      id: 'drv2',
      external_id: '16',
      name: 'Charles Leclerc',
      nationality: 'MC',
      number: 16,
      team_id: 'team2',
    },
  ],
  f1_races: [
    {
      id: RACE_ID,
      external_id: '785',
      competition_id: 'comp1',
      circuit_id: 'circ1',
      season: 2024,
      race_date: '2024-03-02T15:00:00.000Z',
      status: 'FT',
    },
    {
      id: 'race_live',
      external_id: '900',
      competition_id: 'comp2',
      circuit_id: 'circ2',
      season: 2024,
      race_date: '2024-03-09T15:00:00.000Z',
      status: 'LIVE',
    },
  ],
  f1_rankings: [
    {
      id: 'rk1',
      external_id: 'rk1-ext',
      driver_id: DRIVER_ID,
      season: 2024,
      points: 100,
      position: 1,
    },
  ],
  f1_team_rankings: [
    {
      id: 'trk1',
      external_id: 'trk1-ext',
      team_id: TEAM_ID,
      season: 2024,
      points: 200,
      position: 1,
    },
  ],
  f1_race_rankings: [
    {
      id: RANKING_ID,
      external_id: '785-44',
      race_id: RACE_ID,
      driver_id: DRIVER_ID,
      position: 1,
      time: '1:32:00',
      laps: 57,
      grid: '1',
      pits: 2,
      gap: 'Leader',
    },
  ],
};

beforeEach(() => {
  state.db = makeFakeDb(structuredClone(dataset));
});

describe('F1 repository (AppQD /api/f1)', () => {
  it('lists drivers sorted by name', async () => {
    const { data } = await listF1Drivers();
    expect(data.map((d) => d.name)).toEqual(['Charles Leclerc', 'Max Verstappen']);
    expect(data[1]).toMatchObject({ nationality: 'NL', team_id: TEAM_ID });
  });

  it('gets a driver by UUID and by external id', async () => {
    expect((await getF1DriverById(DRIVER_ID)).data.name).toBe('Max Verstappen');
    expect((await getF1DriverById('44')).data.id).toBe(DRIVER_ID);
  });

  it('throws when a driver is missing', async () => {
    await expect(getF1DriverById('missing')).rejects.toBeInstanceOf(ApiError);
  });

  it('lists teams sorted by name', async () => {
    const { data } = await listF1Teams();
    expect(data.map((t) => t.name)).toEqual(['Ferrari', 'Red Bull']);
  });

  it('filters races by season and orders by race_date desc', async () => {
    const { data } = await listF1Races(2024);
    expect(data).toHaveLength(2);
    expect(data[0]?.external_id).toBe('900');
  });

  it('lists only live races', async () => {
    const { data } = await listF1LiveRaces();
    expect(data).toHaveLength(1);
    expect(data[0]?.status).toBe('LIVE');
  });

  it('lists driver rankings for a season', async () => {
    const { data } = await listF1DriverRankings(2024);
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({ driver_id: DRIVER_ID, position: 1, points: 100 });
  });

  it('lists team rankings for a season', async () => {
    const { data } = await listF1TeamRankings(2024);
    expect(data[0]).toMatchObject({ team_id: TEAM_ID, position: 1 });
  });

  it('lists race rankings filtered by race id or external id', async () => {
    const byUuid = await listF1RaceRankings(RACE_ID);
    expect(byUuid.data).toHaveLength(1);
    expect(byUuid.data[0]?.driver_id).toBe(DRIVER_ID);

    const byExternal = await listF1RaceRankings('785');
    expect(byExternal.data).toHaveLength(1);
    expect(byExternal.data[0]?.position).toBe(1);
  });

  it('returns empty race rankings when race is unknown', async () => {
    const { data } = await listF1RaceRankings('missing-race');
    expect(data).toEqual([]);
  });
});
