import { describe, expect, it } from 'vitest';
import { tennisPlayerCreateSchema } from '@/lib/bff/tennis/schemas/player.schema';
import { tennisTournamentCreateSchema } from '@/lib/bff/tennis/schemas/tournament.schema';
import { tennisMatchCreateSchema, tennisMatchResultSchema } from '@/lib/bff/tennis/schemas/match.schema';

const ID = '11111111-1111-4111-8111-111111111111';
const ID2 = '22222222-2222-4222-8222-222222222222';

describe('Tennis write schemas', () => {
  it('accepts a player create body and rejects client-supplied ids', () => {
    expect(
      tennisPlayerCreateSchema.safeParse({
        fullName: 'Carlos Alcaraz',
        displayName: 'Alcaraz',
        countryCode: 'ES',
      }).success,
    ).toBe(true);
    expect(
      tennisPlayerCreateSchema.safeParse({
        id: ID,
        fullName: 'Carlos Alcaraz',
        displayName: 'Alcaraz',
        countryCode: 'ES',
      }).success,
    ).toBe(false);
  });

  it('restricts tournament category to the v1 scope', () => {
    const ok = tennisTournamentCreateSchema.safeParse({
      name: 'US Open',
      category: 'grand_slam',
      gender: 'male',
      countryCode: 'US',
      startDate: '2026-08-24',
      endDate: '2026-09-13',
      year: 2026,
    });
    expect(ok.success).toBe(true);

    const atp500 = tennisTournamentCreateSchema.safeParse({
      name: 'Barcelona',
      category: 'atp_500',
      gender: 'male',
      countryCode: 'ES',
      startDate: '2026-04-13',
      endDate: '2026-04-20',
      year: 2026,
    });
    expect(atp500.success).toBe(false);
  });

  it('allows TBD competitors on match create', () => {
    const parsed = tennisMatchCreateSchema.safeParse({
      tournamentId: ID,
      roundId: ID2,
      bracketPosition: 1,
      competitor1Id: null,
      competitor2Id: null,
      competitor1SourceMatchId: ID,
      competitor2SourceMatchId: ID2,
      winnerToMatchId: null,
    });
    expect(parsed.success).toBe(true);
  });

  it('requires winnerId and resultType on result capture', () => {
    expect(tennisMatchResultSchema.safeParse({ winnerId: ID, resultType: 'walkover' }).success).toBe(
      true,
    );
    expect(tennisMatchResultSchema.safeParse({ resultType: 'normal' }).success).toBe(false);
  });
});
