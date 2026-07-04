import { z } from 'zod';
import { nullableString } from './primitives';

export const americanFootballCountryItemSchema = z
  .object({
    name: z.string(),
    code: nullableString.optional(),
    flag: nullableString.optional(),
  })
  .strict();

export type AmericanFootballCountryItem = z.infer<typeof americanFootballCountryItemSchema>;
