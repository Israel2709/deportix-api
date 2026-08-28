import { z } from 'zod';
import {
  canonicalIdSchema,
  countryRefSchema,
  dateOnlySchema,
  nullableString,
  tennisCategorySchema,
  tennisEventTypeSchema,
  tennisGenderSchema,
  tournamentStatusSchema,
} from './primitives';

export const tennisTournamentCreateSchema = z
  .object({
    name: z.string().min(1),
    shortName: nullableString.optional(),
    category: tennisCategorySchema,
    gender: tennisGenderSchema,
    eventType: tennisEventTypeSchema.optional(),
    countryCode: z.string().min(2).max(3),
    city: nullableString.optional(),
    imageUrl: nullableString.optional(),
    startDate: dateOnlySchema,
    endDate: dateOnlySchema,
    year: z.number().int().min(1900).max(2100),
    status: tournamentStatusSchema.optional(),
  })
  .strict();

export const tennisTournamentUpdateSchema = tennisTournamentCreateSchema.partial();

export const tennisTournamentItemSchema = z
  .object({
    id: canonicalIdSchema,
    name: z.string(),
    shortName: nullableString,
    category: tennisCategorySchema,
    gender: tennisGenderSchema,
    eventType: z.literal('singles'),
    country: countryRefSchema,
    city: nullableString,
    imageUrl: nullableString,
    startDate: z.string(),
    endDate: z.string(),
    year: z.number(),
    status: tournamentStatusSchema,
    published: z.boolean(),
    publishedAt: nullableString,
    createdAt: nullableString,
    updatedAt: nullableString,
  })
  .strict();

export type TennisTournamentCreate = z.infer<typeof tennisTournamentCreateSchema>;
export type TennisTournamentUpdate = z.infer<typeof tennisTournamentUpdateSchema>;
export type TennisTournamentItem = z.infer<typeof tennisTournamentItemSchema>;
