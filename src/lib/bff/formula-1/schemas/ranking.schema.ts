import { z } from 'zod';
import {
  canonicalIdSchema,
  driverRefSchema,
  nullableNumber,
  nullableString,
  teamRefSchema,
} from './primitives';

export const formula1DriverRankingCreateSchema = z
  .object({
    driverId: canonicalIdSchema,
    season: z.number().int(),
    position: z.number().int(),
    points: nullableNumber.optional(),
    wins: nullableNumber.optional(),
    behind: nullableNumber.optional(),
  })
  .strict();

export const formula1DriverRankingUpdateSchema = formula1DriverRankingCreateSchema.partial();

export const formula1DriverRankingItemSchema = z
  .object({
    position: z.number(),
    points: nullableNumber.optional(),
    wins: nullableNumber.optional(),
    behind: nullableNumber.optional(),
    season: z.number(),
    driver: driverRefSchema,
    team: teamRefSchema.nullable().optional(),
  })
  .strict();

export const formula1TeamRankingCreateSchema = z
  .object({
    teamId: canonicalIdSchema,
    season: z.number().int(),
    position: z.number().int(),
    points: nullableNumber.optional(),
  })
  .strict();

export const formula1TeamRankingUpdateSchema = formula1TeamRankingCreateSchema.partial();

export const formula1TeamRankingItemSchema = z
  .object({
    position: z.number(),
    points: nullableNumber.optional(),
    season: z.number(),
    team: teamRefSchema,
  })
  .strict();

export const formula1RaceRankingCreateSchema = z
  .object({
    raceId: canonicalIdSchema,
    driverId: canonicalIdSchema,
    position: z.number().int(),
    time: nullableString.optional(),
    laps: nullableNumber.optional(),
    grid: nullableString.optional(),
    pits: nullableNumber.optional(),
    gap: nullableString.optional(),
  })
  .strict();

export const formula1RaceRankingUpdateSchema = formula1RaceRankingCreateSchema.partial();

export const formula1RaceRankingItemSchema = z
  .object({
    position: z.number(),
    time: nullableString.optional(),
    laps: nullableNumber.optional(),
    grid: nullableString.optional(),
    pits: nullableNumber.optional(),
    gap: nullableString.optional(),
    driver: driverRefSchema,
    team: teamRefSchema.nullable().optional(),
  })
  .strict();

export type Formula1DriverRankingCreate = z.infer<typeof formula1DriverRankingCreateSchema>;
export type Formula1DriverRankingUpdate = z.infer<typeof formula1DriverRankingUpdateSchema>;
export type Formula1DriverRankingItem = z.infer<typeof formula1DriverRankingItemSchema>;
export type Formula1TeamRankingCreate = z.infer<typeof formula1TeamRankingCreateSchema>;
export type Formula1TeamRankingUpdate = z.infer<typeof formula1TeamRankingUpdateSchema>;
export type Formula1TeamRankingItem = z.infer<typeof formula1TeamRankingItemSchema>;
export type Formula1RaceRankingCreate = z.infer<typeof formula1RaceRankingCreateSchema>;
export type Formula1RaceRankingUpdate = z.infer<typeof formula1RaceRankingUpdateSchema>;
export type Formula1RaceRankingItem = z.infer<typeof formula1RaceRankingItemSchema>;
