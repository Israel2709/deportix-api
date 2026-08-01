import { describe, expect, it } from 'vitest';
import { mapF1Circuit, mapF1Competition, mapF1Driver, mapF1Team } from '@/lib/bff/formula-1/mappers/catalog.mapper';
import { mapF1Race } from '@/lib/bff/formula-1/mappers/race.mapper';
import {
  mapF1DriverRanking,
  mapF1RaceRanking,
  mapF1TeamRanking,
} from '@/lib/bff/formula-1/mappers/ranking.mapper';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';

const competition: RawDoc = {
  id: '11111111-1111-4111-8111-111111111111',
  data: { name: 'Monaco Grand Prix' },
};

const circuit: RawDoc = {
  id: '22222222-2222-4222-8222-222222222222',
  data: { name: 'Circuit de Monaco', country: 'Monaco', image: 'https://example.com/monaco.png' },
};

const team: RawDoc = {
  id: '33333333-3333-4333-8333-333333333333',
  data: { name: 'McLaren', logo: 'https://example.com/mclaren.png' },
};

const driver: RawDoc = {
  id: '44444444-4444-4444-8444-444444444444',
  data: { name: 'Oscar Piastri', number: 81, team_id: team.id },
};

describe('Formula 1 catalog mappers', () => {
  it('maps competition, circuit and team', () => {
    expect(mapF1Competition(competition)).toEqual({
      id: competition.id,
      name: 'Monaco Grand Prix',
    });
    expect(mapF1Circuit(circuit)).toEqual({
      id: circuit.id,
      name: 'Circuit de Monaco',
      image: 'https://example.com/monaco.png',
      country: 'Monaco',
    });
    expect(mapF1Team(team)).toEqual({
      id: team.id,
      name: 'McLaren',
      logo: 'https://example.com/mclaren.png',
    });
  });

  it('maps driver with nested team', () => {
    expect(mapF1Driver(driver, new Map([[team.id, team]]))).toEqual({
      id: driver.id,
      name: 'Oscar Piastri',
      number: 81,
      team: { id: team.id, name: 'McLaren', logo: 'https://example.com/mclaren.png' },
    });
  });
});

describe('Formula 1 race mapper', () => {
  it('maps race session with competition and circuit', () => {
    const race: RawDoc = {
      id: '55555555-5555-4555-8555-555555555555',
      data: {
        competition_id: competition.id,
        circuit_id: circuit.id,
        season: 2024,
        type: 'Race',
        race_date: '2024-05-26T13:00:00.000Z',
        status: 'Completed',
        timezone: 'utc',
        distance: '260.3 Kms',
        laps_current: null,
        laps_total: 78,
      },
    };

    expect(
      mapF1Race(race, new Map([[competition.id, competition]]), new Map([[circuit.id, circuit]])),
    ).toEqual({
      id: race.id,
      competition: { id: competition.id, name: 'Monaco Grand Prix' },
      circuit: {
        id: circuit.id,
        name: 'Circuit de Monaco',
        image: 'https://example.com/monaco.png',
        country: 'Monaco',
      },
      season: 2024,
      type: 'Race',
      laps: { current: null, total: 78 },
      distance: '260.3 Kms',
      timezone: 'utc',
      date: '2024-05-26T13:00:00.000Z',
      status: 'Completed',
    });
  });
});

describe('Formula 1 ranking mappers', () => {
  it('maps championship and race results with positions', () => {
    const driverRanking: RawDoc = {
      id: '66666666-6666-4666-8666-666666666666',
      data: {
        driver_id: driver.id,
        season: 2024,
        position: 2,
        points: 245,
        wins: 2,
        behind: 10,
      },
    };
    const teamRanking: RawDoc = {
      id: '77777777-7777-4777-8777-777777777777',
      data: { team_id: team.id, season: 2024, position: 1, points: 500 },
    };
    const raceRanking: RawDoc = {
      id: '88888888-8888-4888-8888-888888888888',
      data: {
        race_id: '55555555-5555-4555-8555-555555555555',
        driver_id: driver.id,
        position: 1,
        time: '1:30:00.000',
        laps: 78,
        grid: '2',
        pits: 2,
        gap: null,
      },
    };

    const driverMap = new Map([[driver.id, driver]]);
    const teamMap = new Map([[team.id, team]]);

    expect(mapF1DriverRanking(driverRanking, driverMap, teamMap)).toEqual({
      position: 2,
      points: 245,
      wins: 2,
      behind: 10,
      season: 2024,
      driver: { id: driver.id, name: 'Oscar Piastri', number: 81 },
      team: { id: team.id, name: 'McLaren', logo: 'https://example.com/mclaren.png' },
    });

    expect(mapF1TeamRanking(teamRanking, teamMap)).toEqual({
      position: 1,
      points: 500,
      season: 2024,
      team: { id: team.id, name: 'McLaren', logo: 'https://example.com/mclaren.png' },
    });

    expect(mapF1RaceRanking(raceRanking, driverMap, teamMap)).toEqual({
      position: 1,
      time: '1:30:00.000',
      laps: 78,
      grid: '2',
      pits: 2,
      gap: null,
      driver: { id: driver.id, name: 'Oscar Piastri', number: 81 },
      team: { id: team.id, name: 'McLaren', logo: 'https://example.com/mclaren.png' },
    });
  });
});
