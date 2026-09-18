import { z } from 'zod';
import { canonicalIdSchema, nullableNumber, nullableString, teamRefSchema } from './primitives';

export const formula1DriverCreateSchema = z
  .object({
    name: z.string().min(1),
    abbr: nullableString.optional(),
    number: nullableNumber.optional(),
    image: nullableString.optional(),
    teamId: canonicalIdSchema.optional().nullable(),
  })
  .strict();

export const formula1DriverUpdateSchema = formula1DriverCreateSchema.partial();

export const formula1DriverItemSchema = z
  .object({
    id: canonicalIdSchema,
    name: z.string(),
    abbr: nullableString.optional(),
    number: nullableNumber.optional(),
    image: nullableString.optional(),
    team: teamRefSchema.nullable().optional(),
  })
  .strict();

export type Formula1DriverCreate = z.infer<typeof formula1DriverCreateSchema>;
export type Formula1DriverUpdate = z.infer<typeof formula1DriverUpdateSchema>;
export type Formula1DriverItem = z.infer<typeof formula1DriverItemSchema>;
