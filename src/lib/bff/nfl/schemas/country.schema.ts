import { z } from 'zod';
import { nullableString } from './primitives';

export const nflCountryItemSchema = z
  .object({
    name: z.string(),
    code: nullableString.optional(),
    flag: nullableString.optional(),
  })
  .strict();

export type NflCountryItem = z.infer<typeof nflCountryItemSchema>;
