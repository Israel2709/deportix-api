import { z } from 'zod';
import { canonicalIdSchema, resourceIdSchema } from './primitives';

const standingStatsSchema = z
  .object({
    played: z.number().int().nullable().optional(),
    win: z.number().int().nullable().optional(),
    draw: z.number().int().nullable().optional(),
    lose: z.number().int().nullable().optional(),
    goals: z
      .object({
        for: z.number().int().nullable().optional(),
        against: z.number().int().nullable().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const soccerStandingCreateSchema = z
  .object({
    league: z
      .object({
        id: resourceIdSchema,
        season: z.union([z.number().int(), z.string().min(1)]),
      })
      .strict(),
    team: z.object({ id: resourceIdSchema }).strict(),
    rank: z.number().int().nullable().optional(),
    points: z.number().int().nullable().optional(),
    goalsDiff: z.number().int().nullable().optional(),
    form: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    all: standingStatsSchema.optional(),
    home: standingStatsSchema.optional(),
    away: standingStatsSchema.optional(),
  })
  .strict();

export type SoccerStandingCreate = z.infer<typeof soccerStandingCreateSchema>;
