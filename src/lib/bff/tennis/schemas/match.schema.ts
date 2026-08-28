import { z } from 'zod';
import {
  canonicalIdSchema,
  entryTypeSchema,
  isoDateTimeSchema,
  matchStatusSchema,
  nullableNumber,
  nullableString,
  optionalIdSchema,
  resultTypeSchema,
  setScoreSchema,
  winnerPositionSchema,
} from './primitives';
import { playerRefSchema } from './primitives';

export const tennisMatchCreateSchema = z
  .object({
    tournamentId: canonicalIdSchema,
    roundId: canonicalIdSchema,
    bracketPosition: z.number().int().min(1),
    competitor1Id: optionalIdSchema,
    competitor2Id: optionalIdSchema,
    scheduledAt: isoDateTimeSchema.nullable().optional(),
    timezone: nullableString.optional(),
    court: nullableString.optional(),
    status: matchStatusSchema.optional(),
    competitor1SourceMatchId: optionalIdSchema,
    competitor2SourceMatchId: optionalIdSchema,
    winnerToMatchId: optionalIdSchema,
    winnerToPosition: winnerPositionSchema.nullable().optional(),
    competitor1EntryType: entryTypeSchema.nullable().optional(),
    competitor2EntryType: entryTypeSchema.nullable().optional(),
  })
  .strict();

export const tennisMatchUpdateSchema = tennisMatchCreateSchema
  .omit({ tournamentId: true })
  .partial();

export const tennisMatchResultSchema = z
  .object({
    winnerId: canonicalIdSchema,
    loserId: canonicalIdSchema.optional(),
    resultType: resultTypeSchema,
    setsPlayer1: nullableNumber.optional(),
    setsPlayer2: nullableNumber.optional(),
    setScores: z.array(setScoreSchema).nullable().optional(),
    finalScoreDisplay: nullableString.optional(),
    startedAt: isoDateTimeSchema.nullable().optional(),
    endedAt: isoDateTimeSchema.nullable().optional(),
  })
  .strict();

export const tennisMatchItemSchema = z
  .object({
    id: canonicalIdSchema,
    tournamentId: canonicalIdSchema,
    roundId: canonicalIdSchema,
    roundNumber: z.number(),
    roundName: nullableString,
    bracketPosition: z.number(),
    competitor1: playerRefSchema.nullable(),
    competitor2: playerRefSchema.nullable(),
    scheduledAt: nullableString,
    timezone: nullableString,
    court: nullableString,
    status: matchStatusSchema,
    startedAt: nullableString,
    endedAt: nullableString,
    competitorChanged: z.boolean(),
    bracket: z
      .object({
        competitor1SourceMatchId: nullableString,
        competitor2SourceMatchId: nullableString,
        winnerToMatchId: nullableString,
        winnerToPosition: winnerPositionSchema.nullable(),
        competitor1EntryType: entryTypeSchema.nullable(),
        competitor2EntryType: entryTypeSchema.nullable(),
      })
      .strict(),
    result: z
      .object({
        winnerId: nullableString,
        loserId: nullableString,
        resultType: resultTypeSchema.nullable(),
        setsPlayer1: nullableNumber,
        setsPlayer2: nullableNumber,
        setScores: z.array(setScoreSchema).nullable(),
        finalScoreDisplay: nullableString,
      })
      .strict()
      .nullable(),
    published: z.boolean(),
    createdAt: nullableString,
    updatedAt: nullableString,
  })
  .strict();

export type TennisMatchCreate = z.infer<typeof tennisMatchCreateSchema>;
export type TennisMatchUpdate = z.infer<typeof tennisMatchUpdateSchema>;
export type TennisMatchResult = z.infer<typeof tennisMatchResultSchema>;
export type TennisMatchItem = z.infer<typeof tennisMatchItemSchema>;
