import { z } from 'zod';
import { canonicalIdSchema, nullableString } from './primitives';

export const formula1TeamCreateSchema = z
  .object({
    name: z.string().min(1),
    logo: nullableString.optional(),
  })
  .strict();

export const formula1TeamUpdateSchema = formula1TeamCreateSchema.partial();

export const formula1TeamItemSchema = z
  .object({
    id: canonicalIdSchema,
    name: z.string(),
    logo: nullableString.optional(),
  })
  .strict();

export type Formula1TeamCreate = z.infer<typeof formula1TeamCreateSchema>;
export type Formula1TeamUpdate = z.infer<typeof formula1TeamUpdateSchema>;
export type Formula1TeamItem = z.infer<typeof formula1TeamItemSchema>;
