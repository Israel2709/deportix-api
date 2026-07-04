import { z } from 'zod';

export const pagingSchema = z
  .object({
    current: z.number(),
    total: z.number(),
  })
  .strict();

export const nflErrorsSchema = z.union([
  z.array(z.unknown()),
  z.record(z.string(), z.string()),
]);

export function nflEnvelopeSchema<T extends z.ZodType>(itemSchema: T) {
  return z
    .object({
      get: z.string(),
      parameters: z.union([z.record(z.string(), z.unknown()), z.array(z.unknown())]),
      errors: nflErrorsSchema,
      results: z.number(),
      paging: pagingSchema.optional(),
      response: z.array(itemSchema),
    })
    .strict();
}

export type NflPaging = z.infer<typeof pagingSchema>;

export interface NflApiSportsBody<T = unknown> {
  get: string;
  parameters: Record<string, unknown> | unknown[];
  errors: unknown[] | Record<string, string>;
  results: number;
  paging?: NflPaging;
  response: T[];
}
