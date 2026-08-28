import { z } from 'zod';

export const nullableString = z.string().nullable();
export const nullableNumber = z.number().nullable();
export const canonicalIdSchema = z.string().uuid();
export const optionalIdSchema = canonicalIdSchema.nullable().optional();

export const TENNIS_CATEGORIES = ['grand_slam', 'atp_1000', 'wta_1000'] as const;
export const TENNIS_GENDERS = ['male', 'female'] as const;
export const TENNIS_EVENT_TYPES = ['singles'] as const;
export const TOURNAMENT_STATUSES = ['upcoming', 'active', 'finished', 'cancelled'] as const;
export const ROUND_STATUSES = ['pending', 'active', 'finished'] as const;
export const MATCH_STATUSES = [
  'pending_competitors',
  'scheduled',
  'live',
  'suspended',
  'postponed',
  'finished',
  'retirement',
  'walkover',
  'disqualification',
  'cancelled',
] as const;
export const RESULT_TYPES = ['normal', 'retirement', 'walkover', 'disqualification'] as const;
export const ENTRY_TYPES = [
  'direct',
  'qualifier',
  'wildcard',
  'lucky_loser',
  'protected_ranking',
  'bye',
  'other',
] as const;
export const WINNER_POSITIONS = ['competitor_1', 'competitor_2'] as const;

export const tennisCategorySchema = z.enum(TENNIS_CATEGORIES);
export const tennisGenderSchema = z.enum(TENNIS_GENDERS);
export const tennisEventTypeSchema = z.enum(TENNIS_EVENT_TYPES);
export const tournamentStatusSchema = z.enum(TOURNAMENT_STATUSES);
export const roundStatusSchema = z.enum(ROUND_STATUSES);
export const matchStatusSchema = z.enum(MATCH_STATUSES);
export const resultTypeSchema = z.enum(RESULT_TYPES);
export const entryTypeSchema = z.enum(ENTRY_TYPES);
export const winnerPositionSchema = z.enum(WINNER_POSITIONS);

export const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be YYYY-MM-DD.',
});
export const isoDateTimeSchema = z.string().min(1);

export const countryRefSchema = z
  .object({
    code: z.string(),
    name: nullableString,
    flag: nullableString,
  })
  .strict();

export const playerRefSchema = z
  .object({
    id: canonicalIdSchema,
    fullName: z.string(),
    displayName: z.string(),
    photoUrl: nullableString,
    country: countryRefSchema,
  })
  .strict();

export const setScoreSchema = z
  .object({
    set: z.number().int().min(1),
    competitor1: z.number().int().min(0),
    competitor2: z.number().int().min(0),
  })
  .strict();
