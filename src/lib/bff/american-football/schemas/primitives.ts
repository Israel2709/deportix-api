import { z } from 'zod';

export const nullableString = z.string().nullable();
export const nullableNumber = z.number().nullable();
export const idSchema = z.union([z.number(), z.string()]);

export const countryRefSchema = z
  .object({
    name: z.string(),
    code: nullableString.optional(),
    flag: nullableString.optional(),
  })
  .strict();

export const teamRefSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    logo: nullableString.optional(),
  })
  .strict();

export const leagueRefSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    season: z.union([z.number(), z.string()]).optional(),
    logo: nullableString.optional(),
    country: countryRefSchema.optional(),
  })
  .strict();
