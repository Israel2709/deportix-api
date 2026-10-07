import { z } from 'zod';
import { canonicalIdSchema, competitionLocationSchema } from './primitives';

const championshipTypeSchema = z.enum([
  'world-championship',
  'national-championship',
  'regional-championship',
  'series',
]);

const competitionStatusSchema = z.enum(['scheduled', 'active', 'completed', 'cancelled']);

const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be #RRGGBB.')
  .nullable();

const optionalPositiveInt = z.number().int().min(1).nullable();

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
    rounds: z.number().int().min(1).optional(),
    classifications: z
      .object({
        drivers: z.boolean(),
        constructors: z.boolean(),
      })
      .strict()
      .optional(),
    sprint: z
      .object({
        enabled: z.boolean(),
        rounds: z.number().int().min(1).nullable().optional(),
      })
      .strict()
      .optional(),
    grid: z
      .object({
        maxTeams: optionalPositiveInt.optional(),
        driversPerTeam: optionalPositiveInt.optional(),
      })
      .strict()
      .optional(),
    pointsSystemId: z.string().nullable().optional(),
    branding: z
      .object({
        logoUrl: z.string().nullable().optional(),
        primaryColor: hexColorSchema.optional(),
        secondaryColor: hexColorSchema.optional(),
      })
      .strict()
      .optional(),
    website: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    active: z.boolean().optional(),
    location: competitionLocationSchema.nullable().optional(),
  })
  .strict();

function refineCompetition(
  value: {
    startDate?: string | null;
    endDate?: string | null;
    website?: string | null;
    rounds?: number;
    sprint?: { enabled: boolean; rounds?: number | null };
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

  if (!value.sprint?.enabled) return;

  if (value.sprint.rounds == null) {
    ctx.addIssue({
      code: 'custom',
      path: ['sprint', 'rounds'],
      message: 'sprint.rounds is required when sprint is enabled.',
    });
    return;
  }

  if (value.rounds != null && value.sprint.rounds > value.rounds) {
    ctx.addIssue({
      code: 'custom',
      path: ['sprint', 'rounds'],
      message: 'sprint.rounds cannot be greater than rounds.',
    });
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
    rounds: z.number().int().optional(),
    classifications: z
      .object({
        drivers: z.boolean(),
        constructors: z.boolean(),
      })
      .optional(),
    sprint: z
      .object({
        enabled: z.boolean(),
        rounds: z.number().int().optional(),
      })
      .optional(),
    grid: z
      .object({
        maxTeams: z.number().int().optional(),
        driversPerTeam: z.number().int().optional(),
      })
      .optional(),
    pointsSystemId: z.string().nullable().optional(),
    branding: z
      .object({
        logoUrl: z.string().nullable().optional(),
        primaryColor: z.string().nullable().optional(),
        secondaryColor: z.string().nullable().optional(),
      })
      .optional(),
    website: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    active: z.boolean().optional(),
  })
  .strict();

export type Formula1CompetitionCreate = z.infer<typeof formula1CompetitionCreateSchema>;
export type Formula1CompetitionUpdate = z.infer<typeof formula1CompetitionUpdateSchema>;
export type Formula1CompetitionItem = z.infer<typeof formula1CompetitionItemSchema>;
