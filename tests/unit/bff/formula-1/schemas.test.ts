import { describe, expect, it } from 'vitest';
import { formula1CompetitionCreateSchema } from '@/lib/bff/formula-1/schemas/competition.schema';
import { formula1RaceCreateSchema } from '@/lib/bff/formula-1/schemas/race.schema';
import { formula1DriverRankingCreateSchema } from '@/lib/bff/formula-1/schemas/ranking.schema';

describe('Formula 1 write schemas', () => {
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
        driverId: '44444444-4444-4444-8444-444444444444',
        season: 2024,
        position: 1,
        points: 100,
      }).success,
    ).toBe(true);
  });
});
