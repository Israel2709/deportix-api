import { z } from 'zod';
import { canonicalIdSchema, countryRefSchema, nullableString } from './primitives';

const soccerCoverageSchema = z
  .object({
    fixtures: z.boolean().optional(),
    standings: z.boolean().optional(),
    players: z.boolean().optional(),
    top_scorers: z.boolean().optional(),
    top_assists: z.boolean().optional(),
    top_cards: z.boolean().optional(),
    injuries: z.boolean().optional(),
    predictions: z.boolean().optional(),
    odds: z.boolean().optional(),
  })
  .strict();

export const soccerSeasonItemSchema = z
  .object({
    year: z.number().int(),
    start: nullableString.optional(),
    end: nullableString.optional(),
    current: z.boolean(),
    coverage: soccerCoverageSchema.optional(),
  })
  .strict();

export const soccerLeagueCreateSchema = z
  .object({
    league: z
      .object({
        name: z.string(),
        type: nullableString.optional(),
        logo: nullableString.optional(),
      })
      .strict(),
    country: countryRefSchema,
    seasons: z.array(soccerSeasonItemSchema),
  })
  .strict();

export const soccerLeagueItemSchema = z
  .object({
    league: z
      .object({
        id: canonicalIdSchema,
        name: z.string(),
        type: nullableString.optional(),
        logo: nullableString.optional(),
      })
      .strict(),
    country: countryRefSchema,
    seasons: z.array(soccerSeasonItemSchema),
  })
  .strict();

export type SoccerSeasonItem = z.infer<typeof soccerSeasonItemSchema>;
export type SoccerLeagueCreate = z.infer<typeof soccerLeagueCreateSchema>;
export type SoccerLeagueItem = z.infer<typeof soccerLeagueItemSchema>;
