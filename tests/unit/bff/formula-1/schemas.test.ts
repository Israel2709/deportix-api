import { describe, expect, it } from 'vitest';
import { formula1CompetitionCreateSchema, formula1CompetitionUpdateSchema } from '@/lib/bff/formula-1/schemas/competition.schema';
import { formula1DriverCreateSchema } from '@/lib/bff/formula-1/schemas/driver.schema';
import { formula1RaceCreateSchema } from '@/lib/bff/formula-1/schemas/race.schema';
import { formula1DriverRankingCreateSchema } from '@/lib/bff/formula-1/schemas/ranking.schema';
import {
  formula1FastestLapCreateSchema,
  formula1PitstopCreateSchema,
  formula1StartingGridCreateSchema,
} from '@/lib/bff/formula-1/schemas/session-detail.schema';

describe('Formula 1 write schemas', () => {
  it('rejects server-managed and removed competition fields', () => {
    expect(
      formula1CompetitionCreateSchema.safeParse({ name: 'Monaco', createdAt: 'now' }).success,
    ).toBe(false);
    expect(
      formula1CompetitionCreateSchema.safeParse({
        name: 'Monaco Grand Prix',
        slug: 'monaco-grand-prix',
        seasonId: '2026',
        sprint: { enabled: true },
        classifications: { drivers: true, constructors: true },
        website: 'https://www.formula1.com',
        branding: { logoUrl: 'https://example.com/logo.png' },
      }).success,
    ).toBe(true);
    expect(
      formula1CompetitionCreateSchema.safeParse({
        name: 'Monaco Grand Prix',
        rounds: 24,
      }).success,
    ).toBe(false);
    expect(
      formula1CompetitionCreateSchema.safeParse({
        name: 'Monaco Grand Prix',
        grid: { maxTeams: 10 },
      }).success,
    ).toBe(false);
    expect(
      formula1CompetitionCreateSchema.safeParse({
        name: 'Monaco Grand Prix',
        description: 'nope',
      }).success,
    ).toBe(false);
    expect(
      formula1CompetitionCreateSchema.safeParse({
        name: 'Monaco Grand Prix',
        branding: { primaryColor: '#E10600' },
      }).success,
    ).toBe(false);
    expect(
      formula1CompetitionCreateSchema.safeParse({
        name: 'Monaco Grand Prix',
        sprint: { enabled: true, rounds: 6 },
      }).success,
    ).toBe(false);
    expect(
      formula1CompetitionUpdateSchema.safeParse({
        name: 'Monaco Grand Prix',
        seasonId: '2026',
      }).success,
    ).toBe(false);
  });

  it('accepts a competition create body', () => {
    expect(formula1CompetitionCreateSchema.safeParse({ name: 'Monaco Grand Prix' }).success).toBe(
      true,
    );
  });

  it('rejects extra fields on competition create', () => {
    expect(
      formula1CompetitionCreateSchema.safeParse({ name: 'Monaco', id: 'x' }).success,
    ).toBe(false);
  });

  it('requires race foreign keys and season', () => {
    const ok = formula1RaceCreateSchema.safeParse({
      competitionId: '11111111-1111-4111-8111-111111111111',
      circuitId: '22222222-2222-4222-8222-222222222222',
      season: 2024,
      type: 'Race',
      date: '2024-05-26T13:00:00.000Z',
      status: 'Completed',
    });
    expect(ok.success).toBe(true);

    const missing = formula1RaceCreateSchema.safeParse({
      season: 2024,
      type: 'Race',
      date: '2024-05-26T13:00:00.000Z',
      status: 'Completed',
    });
    expect(missing.success).toBe(false);
  });

  it('accepts driver ranking create body', () => {
    expect(
      formula1DriverRankingCreateSchema.safeParse({
        competitionId: '11111111-1111-4111-8111-111111111111',
        driverId: '44444444-4444-4444-8444-444444444444',
        season: 2024,
        position: 1,
        points: 100,
        wins: 2,
        podiums: 5,
      }).success,
    ).toBe(true);
  });

  it('accepts starting grid, fastest lap and pit stop create bodies', () => {
    const raceId = '55555555-5555-4555-8555-555555555555';
    const driverId = '44444444-4444-4444-8444-444444444444';
    expect(
      formula1StartingGridCreateSchema.safeParse({
        raceId,
        driverId,
        position: 1,
        time: '1:20.486',
      }).success,
    ).toBe(true);
    expect(
      formula1FastestLapCreateSchema.safeParse({
        raceId,
        driverId,
        position: 1,
        lap: 57,
        time: '1:25.580',
        avg_speed: '223.075',
      }).success,
    ).toBe(true);
    expect(
      formula1PitstopCreateSchema.safeParse({
        raceId,
        driverId,
        stops: 1,
        lap: 12,
        time: '2.401',
        total_time: '2.401',
      }).success,
    ).toBe(true);
  });

  it('accepts competition create with location', () => {
    expect(
      formula1CompetitionCreateSchema.safeParse({
        name: 'Monaco Grand Prix',
        location: { country: 'Monaco', city: 'Monte Carlo' },
      }).success,
    ).toBe(true);
  });

  it('accepts driver create with abbr and image', () => {
    expect(
      formula1DriverCreateSchema.safeParse({
        name: 'Oscar Piastri',
        abbr: 'PIA',
        number: 81,
        image: 'https://example.com/piastri.png',
      }).success,
    ).toBe(true);
  });
});
