import { z } from 'zod';
import { tennisPlayerItemSchema } from './player.schema';
import { canonicalIdSchema, entryTypeSchema, nullableNumber, nullableString } from './primitives';

export const tennisEntryCreateSchema = z
  .object({
    tournamentId: canonicalIdSchema,
    playerId: canonicalIdSchema,
    seed: nullableNumber.optional(),
    ranking: nullableNumber.optional(),
    entryType: entryTypeSchema.optional().nullable(),
  })
  .strict();

export const tennisEntryUpdateSchema = tennisEntryCreateSchema
  .omit({ tournamentId: true, playerId: true })
  .partial()
  .extend({
    playerId: canonicalIdSchema.optional(),
  });

export const tennisEntryItemSchema = z
  .object({
    id: canonicalIdSchema,
    tournamentId: canonicalIdSchema,
    player: tennisPlayerItemSchema,
    seed: nullableNumber,
    ranking: nullableNumber,
    entryType: entryTypeSchema.nullable(),
    published: z.boolean(),
    createdAt: nullableString,
    updatedAt: nullableString,
  })
  .strict();

export type TennisEntryCreate = z.infer<typeof tennisEntryCreateSchema>;
export type TennisEntryUpdate = z.infer<typeof tennisEntryUpdateSchema>;
export type TennisEntryItem = z.infer<typeof tennisEntryItemSchema>;
