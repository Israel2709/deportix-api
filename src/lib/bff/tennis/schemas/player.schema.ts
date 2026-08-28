import { z } from 'zod';
import { canonicalIdSchema, countryRefSchema, nullableString } from './primitives';

export const tennisPlayerCreateSchema = z
  .object({
    fullName: z.string().min(1),
    displayName: z.string().min(1),
    photoUrl: nullableString.optional(),
    countryCode: z.string().min(2).max(3),
    published: z.boolean().optional(),
  })
  .strict();

export const tennisPlayerUpdateSchema = tennisPlayerCreateSchema.partial();

export const tennisPlayerItemSchema = z
  .object({
    id: canonicalIdSchema,
    fullName: z.string(),
    displayName: z.string(),
    photoUrl: nullableString,
    country: countryRefSchema,
    published: z.boolean(),
    createdAt: nullableString,
    updatedAt: nullableString,
  })
  .strict();

export type TennisPlayerCreate = z.infer<typeof tennisPlayerCreateSchema>;
export type TennisPlayerUpdate = z.infer<typeof tennisPlayerUpdateSchema>;
export type TennisPlayerItem = z.infer<typeof tennisPlayerItemSchema>;
