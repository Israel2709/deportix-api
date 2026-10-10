import { z } from 'zod';
import {
  canonicalIdSchema,
  driverRefSchema,
  nullableNumber,
  nullableString,
  teamRefSchema,
} from './primitives';

const entryRoleSchema = z.enum(['race-driver', 'reserve-driver']);

export const formula1EntryCreateSchema = z
  .object({
    competitionId: canonicalIdSchema,
    season: z.number().int(),
    driverId: canonicalIdSchema,
    teamId: canonicalIdSchema,
    number: nullableNumber.optional(),
    role: entryRoleSchema.optional(),
    active: z.boolean().optional(),
  })
  .strict();

export const formula1EntryUpdateSchema = z
  .object({
    teamId: canonicalIdSchema.optional(),
    number: nullableNumber.optional(),
    role: entryRoleSchema.optional(),
    active: z.boolean().optional(),
  })
  .strict();

export const formula1EntryItemSchema = z
  .object({
    id: canonicalIdSchema,
    competitionId: canonicalIdSchema,
    season: z.number(),
    driver: driverRefSchema,
    team: teamRefSchema,
    number: nullableNumber.optional(),
    role: entryRoleSchema,
    active: z.boolean(),
    createdAt: nullableString.optional(),
    updatedAt: nullableString.optional(),
  })
  .strict();

export type Formula1EntryCreate = z.infer<typeof formula1EntryCreateSchema>;
export type Formula1EntryUpdate = z.infer<typeof formula1EntryUpdateSchema>;
export type Formula1EntryItem = z.infer<typeof formula1EntryItemSchema>;
