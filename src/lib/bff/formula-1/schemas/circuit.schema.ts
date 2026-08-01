import { z } from 'zod';
import { canonicalIdSchema, nullableString } from './primitives';

export const formula1CircuitCreateSchema = z
  .object({
    name: z.string().min(1),
    image: nullableString.optional(),
    country: nullableString.optional(),
  })
  .strict();

export const formula1CircuitUpdateSchema = formula1CircuitCreateSchema.partial();

export const formula1CircuitItemSchema = z
  .object({
    id: canonicalIdSchema,
    name: z.string(),
    image: nullableString.optional(),
    country: nullableString.optional(),
  })
  .strict();

export type Formula1CircuitCreate = z.infer<typeof formula1CircuitCreateSchema>;
export type Formula1CircuitUpdate = z.infer<typeof formula1CircuitUpdateSchema>;
export type Formula1CircuitItem = z.infer<typeof formula1CircuitItemSchema>;
