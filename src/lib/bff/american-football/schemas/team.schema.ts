import { z } from 'zod';
import { idSchema, nullableString } from './primitives';

export const americanFootballTeamItemSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    logo: nullableString.optional(),
    altLogo: nullableString.optional(),
  })
  .strict();

export type AmericanFootballTeamItem = z.infer<typeof americanFootballTeamItemSchema>;
