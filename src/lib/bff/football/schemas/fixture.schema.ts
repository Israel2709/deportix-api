import { z } from 'zod';
import { nullableString, resourceIdSchema } from './primitives';

const fixtureSideSchema = z
  .object({
    id: resourceIdSchema,
    name: nullableString.optional(),
    logo: nullableString.optional(),
  })
  .strict();

export const soccerFixtureCreateSchema = z
  .object({
    fixture: z
      .object({
        date: z.string().min(1),
        venue: z.object({ name: nullableString.optional() }).strict().optional(),
        status: z
          .object({
            short: nullableString.optional(),
            long: nullableString.optional(),
          })
          .strict()
          .optional(),
      })
      .strict(),
    league: z
      .object({
        id: resourceIdSchema,
        season: z.union([z.number().int(), z.string().min(1)]),
        round: nullableString.optional(),
      })
      .strict(),
    teams: z
      .object({
        home: fixtureSideSchema,
        away: fixtureSideSchema,
      })
      .strict(),
    goals: z
      .object({
        home: z.number().int().nullable().optional(),
        away: z.number().int().nullable().optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.teams.home.id === value.teams.away.id) {
      ctx.addIssue({
        code: 'custom',
        message: 'home and away teams must be different.',
        path: ['teams', 'away', 'id'],
      });
    }
  });

export type SoccerFixtureCreate = z.infer<typeof soccerFixtureCreateSchema>;
