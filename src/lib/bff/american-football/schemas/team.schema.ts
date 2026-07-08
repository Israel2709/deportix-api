import { z } from 'zod';
import { canonicalIdSchema, nullableString } from './primitives';

export const americanFootballTeamCreateSchema = z
  .object({
    name: z.string(),
    logo: nullableString.optional(),
    altLogo: nullableString.optional(),
  })
  .strict();

export const americanFootballTeamUpdateSchema = americanFootballTeamCreateSchema.partial();

export const americanFootballTeamItemSchema = z
  .object({
    id: canonicalIdSchema,
    name: z.string(),
    logo: nullableString.optional(),
    altLogo: nullableString.optional(),
  })
  .strict();

export type AmericanFootballTeamCreate = z.infer<typeof americanFootballTeamCreateSchema>;
export type AmericanFootballTeamUpdate = z.infer<typeof americanFootballTeamUpdateSchema>;
export type AmericanFootballTeamItem = z.infer<typeof americanFootballTeamItemSchema>;
