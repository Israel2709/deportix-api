import { z } from 'zod';
import { idSchema, nullableString } from './primitives';

export const nflTeamItemSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    logo: nullableString.optional(),
  })
  .strict();

export type NflTeamItem = z.infer<typeof nflTeamItemSchema>;
