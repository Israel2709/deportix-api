import { z } from 'zod';
import { countryRefSchema, idSchema, nullableNumber, nullableString, teamRefSchema } from './primitives';

const gameDateSchema = z
  .object({
    timezone: nullableString.optional(),
    date: nullableString.optional(),
    time: nullableString.optional(),
    timestamp: nullableNumber.optional(),
  })
  .strict();

const gameVenueSchema = z
  .object({
    name: nullableString.optional(),
    city: nullableString.optional(),
  })
  .strict();

const gameStatusSchema = z
  .object({
    short: nullableString.optional(),
    long: nullableString.optional(),
    timer: nullableString.optional(),
  })
  .strict();

const quarterScoresSchema = z
  .object({
    quarter_1: nullableNumber.optional(),
    quarter_2: nullableNumber.optional(),
    quarter_3: nullableNumber.optional(),
    quarter_4: nullableNumber.optional(),
    overtime: nullableNumber.optional(),
    total: nullableNumber.optional(),
  })
  .strict();

export const nflGameItemSchema = z
  .object({
    game: z
      .object({
        id: idSchema,
        stage: nullableString.optional(),
        week: nullableString.optional(),
        date: gameDateSchema.optional(),
        venue: gameVenueSchema.optional(),
        status: gameStatusSchema.optional(),
      })
      .strict(),
    league: z
      .object({
        id: idSchema,
        name: z.string(),
        season: z.union([z.number(), z.string()]).optional(),
        logo: nullableString.optional(),
        country: countryRefSchema.optional(),
      })
      .strict(),
    teams: z
      .object({
        home: teamRefSchema,
        away: teamRefSchema,
      })
      .strict(),
    scores: z
      .object({
        home: quarterScoresSchema.optional(),
        away: quarterScoresSchema.optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type NflGameItem = z.infer<typeof nflGameItemSchema>;
