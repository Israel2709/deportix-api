import { z } from 'zod';
import { canonicalIdSchema, nullableString } from './primitives';

export const soccerTeamCreateSchema = z
  .object({
    name: z.string(),
    code: nullableString.optional(),
    country: nullableString.optional(),
    logo: nullableString.optional(),
  })
  .strict();

export const soccerTeamUpdateSchema = soccerTeamCreateSchema.partial();

export const soccerTeamItemSchema = z
  .object({
    team: z
      .object({
        id: canonicalIdSchema,
        name: z.string(),
        code: nullableString.optional(),
        country: nullableString.optional(),
        logo: nullableString.optional(),
      })
      .strict(),
    venue: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export type SoccerTeamCreate = z.infer<typeof soccerTeamCreateSchema>;
export type SoccerTeamUpdate = z.infer<typeof soccerTeamUpdateSchema>;
