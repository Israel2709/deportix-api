import { z } from 'zod';

export const nullableString = z.string().nullable();
export const nullableNumber = z.number().nullable();

/** Server-assigned document id exposed in BFF responses. */
export const canonicalIdSchema = z.string().uuid();

export const teamRefSchema = z
  .object({
    id: canonicalIdSchema,
    name: z.string(),
    logo: nullableString.optional(),
  })
  .strict();

export const driverRefSchema = z
  .object({
    id: canonicalIdSchema,
    name: z.string(),
    number: nullableNumber.optional(),
  })
  .strict();

export const competitionRefSchema = z
  .object({
    id: canonicalIdSchema,
    name: z.string(),
  })
  .strict();

export const circuitRefSchema = z
  .object({
    id: canonicalIdSchema,
    name: z.string(),
    image: nullableString.optional(),
    country: nullableString.optional(),
  })
  .strict();
