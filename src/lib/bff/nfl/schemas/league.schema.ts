import { z } from 'zod';
import { countryRefSchema, idSchema, nullableString } from './primitives';

const nflCoverageSchema = z
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

export const nflSeasonItemSchema = z
  .object({
    year: z.number(),
    start: nullableString.optional(),
    end: nullableString.optional(),
    current: z.boolean(),
    coverage: nflCoverageSchema.optional(),
  })
  .strict();

export const nflLeagueItemSchema = z
  .object({
    league: z
      .object({
        id: idSchema,
        name: z.string(),
        type: nullableString.optional(),
        logo: nullableString.optional(),
        altLogo: nullableString.optional(),
      })
      .strict(),
    country: countryRefSchema,
    seasons: z.array(nflSeasonItemSchema),
  })
  .strict();

export type NflLeagueItem = z.infer<typeof nflLeagueItemSchema>;
