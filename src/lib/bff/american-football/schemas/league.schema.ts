import { z } from 'zod';
import { canonicalIdSchema, countryRefSchema, nullableString } from './primitives';

const americanFootballCoverageSchema = z
  .object({
    games: z
      .object({
        events: z.boolean().optional(),
        statisitcs: z
          .object({
            teams: z.boolean().optional(),
            players: z.boolean().optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
    statistics: z
      .object({
        season: z
          .object({
            players: z.boolean().optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
    players: z.boolean().optional(),
    injuries: z.boolean().optional(),
    standings: z.boolean().optional(),
  })
  .strict();

export const americanFootballSeasonItemSchema = z
  .object({
    year: z.number(),
    start: nullableString.optional(),
    end: nullableString.optional(),
    current: z.boolean(),
    coverage: americanFootballCoverageSchema.optional(),
  })
  .strict();

export const americanFootballLeagueCreateSchema = z
  .object({
    league: z
      .object({
        name: z.string(),
        type: nullableString.optional(),
        logo: nullableString.optional(),
        altLogo: nullableString.optional(),
      })
      .strict(),
    country: countryRefSchema,
    seasons: z.array(americanFootballSeasonItemSchema),
  })
  .strict();

export const americanFootballLeagueItemSchema = z
  .object({
    league: z
      .object({
        id: canonicalIdSchema,
        name: z.string(),
        type: nullableString.optional(),
        logo: nullableString.optional(),
        altLogo: nullableString.optional(),
      })
      .strict(),
    country: countryRefSchema,
    seasons: z.array(americanFootballSeasonItemSchema),
  })
  .strict();

export type AmericanFootballLeagueCreate = z.infer<typeof americanFootballLeagueCreateSchema>;
export type AmericanFootballLeagueItem = z.infer<typeof americanFootballLeagueItemSchema>;
