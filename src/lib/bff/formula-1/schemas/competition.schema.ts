import { z } from 'zod';
import { canonicalIdSchema, competitionLocationSchema } from './primitives';

const championshipTypeSchema = z.enum([
  'world-championship',
  'national-championship',
  'regional-championship',
  'series',
]);

const competitionStatusSchema = z.enum(['scheduled', 'active', 'completed', 'cancelled']);

const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD.')
  .nullable();

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const competitionFieldsSchema = z
  .object({
    name: z.string().min(1),
    slug: z.string().min(1).optional(),
    shortName: z.string().nullable().optional(),
    officialName: z.string().nullable().optional(),
    seasonId: z.string().min(1).optional(),
    championshipType: championshipTypeSchema.optional(),
    status: competitionStatusSchema.optional(),
    startDate: calendarDateSchema.optional(),
    endDate: calendarDateSchema.optional(),
    /** Accepted but always persisted as both true. */
    classifications: z
      .object({
        drivers: z.boolean(),
        constructors: z.boolean(),
      })
      .strict()
      .optional(),
    /** Accepted but always persisted as `{ enabled: true }`. */
    sprint: z
      .object({
        enabled: z.boolean(),
      })
      .strict()
      .optional(),
    pointsSystemId: z.string().nullable().optional(),
    branding: z
      .object({
        logoUrl: z.string().nullable().optional(),
      })
      .strict()
      .optional(),
    website: z.string().nullable().optional(),
    active: z.boolean().optional(),
    location: competitionLocationSchema.nullable().optional(),
  })
  .strict();

function refineCompetition(
  value: {
    startDate?: string | null;
    endDate?: string | null;
    website?: string | null;
  },
  ctx: z.RefinementCtx,
) {
  if (value.startDate && value.endDate && value.startDate > value.endDate) {
    ctx.addIssue({
      code: 'custom',
      path: ['endDate'],
      message: 'startDate must be on or before endDate.',
    });
  }

  if (value.website) {
    if (!isHttpUrl(value.website)) {
      ctx.addIssue({
        code: 'custom',
        path: ['website'],
        message: 'website must be a valid http(s) URL.',
      });
    }
  }
}

export const formula1CompetitionCreateSchema = competitionFieldsSchema.superRefine(refineCompetition);

export const formula1CompetitionUpdateSchema = competitionFieldsSchema
  .omit({ seasonId: true })
  .partial()
  .superRefine(refineCompetition);

export const formula1CompetitionItemSchema = z
  .object({
    id: canonicalIdSchema,
    name: z.string(),
    location: competitionLocationSchema.nullable().optional(),
    slug: z.string().optional(),
    shortName: z.string().nullable().optional(),
    officialName: z.string().nullable().optional(),
    seasonId: z.string().optional(),
    championshipType: championshipTypeSchema.optional(),
    status: competitionStatusSchema.optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    classifications: z
      .object({
        drivers: z.boolean(),
        constructors: z.boolean(),
      })
      .optional(),
    sprint: z
      .object({
        enabled: z.literal(true),
      })
      .optional(),
    pointsSystemId: z.string().nullable().optional(),
    branding: z
      .object({
        logoUrl: z.string().nullable().optional(),
      })
      .optional(),
    website: z.string().nullable().optional(),
    active: z.boolean().optional(),
    /** Race session ids belonging to this competition (owned by race writers). */
    races: z.array(canonicalIdSchema).optional(),
  })
  .strict();

export type Formula1CompetitionCreate = z.infer<typeof formula1CompetitionCreateSchema>;
export type Formula1CompetitionUpdate = z.infer<typeof formula1CompetitionUpdateSchema>;
export type Formula1CompetitionItem = z.infer<typeof formula1CompetitionItemSchema>;
