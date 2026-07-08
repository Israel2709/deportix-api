import { z } from 'zod';
import {
  canonicalIdSchema,
  countryRefSchema,
  leagueRefSchema,
  nullableNumber,
  nullableString,
  teamRefSchema,
} from './primitives';

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

const gameFieldsSchema = z
  .object({
    stage: nullableString.optional(),
    week: nullableString.optional(),
    date: gameDateSchema.optional(),
    venue: gameVenueSchema.optional(),
    status: gameStatusSchema.optional(),
  })
  .strict();

export const americanFootballGameCreateSchema = z
  .object({
    game: gameFieldsSchema,
    league: leagueRefSchema,
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

export const americanFootballGameItemSchema = z
  .object({
    game: z
      .object({
        id: canonicalIdSchema,
        stage: nullableString.optional(),
        week: nullableString.optional(),
        date: gameDateSchema.optional(),
        venue: gameVenueSchema.optional(),
        status: gameStatusSchema.optional(),
      })
      .strict(),
    league: leagueRefSchema,
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

export type AmericanFootballGameCreate = z.infer<typeof americanFootballGameCreateSchema>;
export type AmericanFootballGameItem = z.infer<typeof americanFootballGameItemSchema>;
