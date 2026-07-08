import { z } from 'zod';

export const nullableString = z.string().nullable();
export const nullableNumber = z.number().nullable();

/** Server-assigned document id exposed in BFF responses. */
export const canonicalIdSchema = z.string().uuid();

/** Legacy api-sports id shape (numeric or string) — import/fixture validation only. */
export const legacyIdSchema = z.union([z.number(), z.string()]);

export const countryRefSchema = z
  .object({
    name: z.string(),
    code: nullableString.optional(),
    flag: nullableString.optional(),
  })
  .strict();

export const teamRefSchema = z
  .object({
    id: canonicalIdSchema,
    name: z.string(),
    logo: nullableString.optional(),
  })
  .strict();

export const leagueRefSchema = z
  .object({
    id: canonicalIdSchema,
    name: z.string(),
    season: z.union([z.number(), z.string()]).optional(),
    logo: nullableString.optional(),
    country: countryRefSchema.optional(),
  })
  .strict();
