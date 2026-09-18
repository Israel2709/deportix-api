import { z } from 'zod';
import { canonicalIdSchema } from './primitives';

export const formula1CompetitionCreateSchema = z
  .object({
    name: z.string().min(1),
  })
  .strict();

export const formula1CompetitionUpdateSchema = formula1CompetitionCreateSchema.partial();

export const formula1CompetitionItemSchema = z
  .object({
    id: canonicalIdSchema,
    name: z.string(),
  })
  .strict();

export type Formula1CompetitionCreate = z.infer<typeof formula1CompetitionCreateSchema>;
export type Formula1CompetitionUpdate = z.infer<typeof formula1CompetitionUpdateSchema>;
export type Formula1CompetitionItem = z.infer<typeof formula1CompetitionItemSchema>;
