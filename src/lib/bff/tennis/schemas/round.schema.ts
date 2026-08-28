import { z } from 'zod';
import {
  canonicalIdSchema,
  dateOnlySchema,
  nullableString,
  roundStatusSchema,
} from './primitives';

export const tennisRoundCreateSchema = z
  .object({
    tournamentId: canonicalIdSchema,
    roundNumber: z.number().int().min(1),
    name: z.string().min(1),
    status: roundStatusSchema.optional(),
    startDate: dateOnlySchema.nullable().optional(),
    endDate: dateOnlySchema.nullable().optional(),
  })
  .strict();

export const tennisRoundUpdateSchema = tennisRoundCreateSchema
  .omit({ tournamentId: true })
  .partial();

export const tennisRoundItemSchema = z
  .object({
    id: canonicalIdSchema,
    tournamentId: canonicalIdSchema,
    roundNumber: z.number(),
    name: z.string(),
    status: roundStatusSchema,
    startDate: nullableString,
    endDate: nullableString,
    published: z.boolean(),
    createdAt: nullableString,
    updatedAt: nullableString,
  })
  .strict();

export type TennisRoundCreate = z.infer<typeof tennisRoundCreateSchema>;
export type TennisRoundUpdate = z.infer<typeof tennisRoundUpdateSchema>;
export type TennisRoundItem = z.infer<typeof tennisRoundItemSchema>;
