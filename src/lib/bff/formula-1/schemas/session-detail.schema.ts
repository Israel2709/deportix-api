import { z } from 'zod';
import {
  canonicalIdSchema,
  driverRefSchema,
  nullableString,
  teamRefSchema,
} from './primitives';

const raceRefSchema = z
  .object({
    id: canonicalIdSchema,
  })
  .strict();

export const formula1StartingGridCreateSchema = z
  .object({
    raceId: canonicalIdSchema,
    driverId: canonicalIdSchema,
    position: z.number().int(),
    time: nullableString.optional(),
  })
  .strict();

export const formula1StartingGridUpdateSchema = formula1StartingGridCreateSchema.partial();

export const formula1StartingGridItemSchema = z
  .object({
    race: raceRefSchema,
    driver: driverRefSchema,
    team: teamRefSchema.nullable().optional(),
    position: z.number(),
    time: nullableString.optional(),
  })
  .strict();

export const formula1FastestLapCreateSchema = z
  .object({
    raceId: canonicalIdSchema,
    driverId: canonicalIdSchema,
    position: z.number().int(),
    lap: z.number().int(),
    time: nullableString.optional(),
    avg_speed: nullableString.optional(),
  })
  .strict();

export const formula1FastestLapUpdateSchema = formula1FastestLapCreateSchema.partial();

export const formula1FastestLapItemSchema = z
  .object({
    race: raceRefSchema,
    driver: driverRefSchema,
    team: teamRefSchema.nullable().optional(),
    position: z.number(),
    lap: z.number(),
    time: nullableString.optional(),
    avg_speed: nullableString.optional(),
  })
  .strict();

export const formula1PitstopCreateSchema = z
  .object({
    raceId: canonicalIdSchema,
    driverId: canonicalIdSchema,
    stops: z.number().int(),
    lap: z.number().int(),
    time: nullableString.optional(),
    total_time: nullableString.optional(),
  })
  .strict();

export const formula1PitstopUpdateSchema = formula1PitstopCreateSchema.partial();

export const formula1PitstopItemSchema = z
  .object({
    race: raceRefSchema,
    driver: driverRefSchema,
    team: teamRefSchema.nullable().optional(),
    stops: z.number(),
    lap: z.number(),
    time: nullableString.optional(),
    total_time: nullableString.optional(),
  })
  .strict();

export type Formula1StartingGridCreate = z.infer<typeof formula1StartingGridCreateSchema>;
export type Formula1StartingGridUpdate = z.infer<typeof formula1StartingGridUpdateSchema>;
export type Formula1StartingGridItem = z.infer<typeof formula1StartingGridItemSchema>;
export type Formula1FastestLapCreate = z.infer<typeof formula1FastestLapCreateSchema>;
export type Formula1FastestLapUpdate = z.infer<typeof formula1FastestLapUpdateSchema>;
export type Formula1FastestLapItem = z.infer<typeof formula1FastestLapItemSchema>;
export type Formula1PitstopCreate = z.infer<typeof formula1PitstopCreateSchema>;
export type Formula1PitstopUpdate = z.infer<typeof formula1PitstopUpdateSchema>;
export type Formula1PitstopItem = z.infer<typeof formula1PitstopItemSchema>;
