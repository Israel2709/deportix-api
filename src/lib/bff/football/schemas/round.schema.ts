import { z } from 'zod';

export const soccerRoundCreateSchema = z
  .object({
    name: z.string().min(1),
    position: z.number().int().nullable().optional(),
  })
  .strict();

export type SoccerRoundCreate = z.infer<typeof soccerRoundCreateSchema>;
