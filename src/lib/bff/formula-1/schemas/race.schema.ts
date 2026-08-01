import { z } from 'zod';
import {
  canonicalIdSchema,
  circuitRefSchema,
  competitionRefSchema,
  nullableNumber,
  nullableString,
} from './primitives';

const lapsSchema = z
  .object({
    current: nullableNumber.optional(),
    total: nullableNumber.optional(),
  })
  .strict();

export const formula1RaceCreateSchema = z
  .object({
    competitionId: canonicalIdSchema,
    circuitId: canonicalIdSchema,
    season: z.number().int(),
    type: z.string().min(1),
    date: z.string().min(1),
    status: z.string().min(1),
    timezone: nullableString.optional(),
    distance: nullableString.optional(),
    laps: lapsSchema.optional(),
  })
  .strict();

export const formula1RaceUpdateSchema = formula1RaceCreateSchema.partial();

export const formula1RaceItemSchema = z
  .object({
    id: canonicalIdSchema,
    competition: competitionRefSchema,
    circuit: circuitRefSchema,
    season: z.number(),
    type: z.string(),
    laps: lapsSchema.optional(),
    distance: nullableString.optional(),
    timezone: nullableString.optional(),
    date: z.string(),
    status: z.string(),
  })
  .strict();

export type Formula1RaceCreate = z.infer<typeof formula1RaceCreateSchema>;
export type Formula1RaceUpdate = z.infer<typeof formula1RaceUpdateSchema>;
export type Formula1RaceItem = z.infer<typeof formula1RaceItemSchema>;
