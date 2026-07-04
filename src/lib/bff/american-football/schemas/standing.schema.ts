import { z } from 'zod';
import { leagueRefSchema, nullableNumber, nullableString, teamRefSchema } from './primitives';

const pointsBlockSchema = z
  .object({
    for: nullableNumber.optional(),
    against: nullableNumber.optional(),
    difference: nullableNumber.optional(),
  })
  .strict();

const recordsSchema = z
  .object({
    home: nullableString.optional(),
    road: nullableString.optional(),
    conference: nullableString.optional(),
    division: nullableString.optional(),
  })
  .strict();

const ncaaConferenceSchema = z
  .object({
    won: nullableNumber.optional(),
    lost: nullableNumber.optional(),
    points: z
      .object({
        for: nullableNumber.optional(),
        against: nullableNumber.optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const americanFootballStandingItemSchema = z
  .object({
    league: leagueRefSchema,
    conference: nullableString.optional(),
    division: nullableString.optional(),
    position: nullableNumber.optional(),
    team: teamRefSchema,
    won: nullableNumber.optional(),
    lost: nullableNumber.optional(),
    ties: nullableNumber.optional(),
    points: pointsBlockSchema.optional(),
    records: recordsSchema.optional(),
    streak: nullableString.optional(),
    ncaa_conference: ncaaConferenceSchema.optional(),
  })
  .strict();

export type AmericanFootballStandingItem = z.infer<typeof americanFootballStandingItemSchema>;
