import { z } from 'zod';

export const nullableString = z.string().nullable();
export const canonicalIdSchema = z.string().uuid();
export const resourceIdSchema = z.string().min(1);

export const countryRefSchema = z
  .object({
    name: z.string(),
    code: nullableString.optional(),
    flag: nullableString.optional(),
  })
  .strict();
