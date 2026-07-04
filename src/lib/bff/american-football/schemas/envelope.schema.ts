import { z } from 'zod';

export const pagingSchema = z
  .object({
    current: z.number(),
    total: z.number(),
  })
  .strict();

export const americanFootballErrorsSchema = z.union([
  z.array(z.unknown()),
  z.record(z.string(), z.string()),
]);

export function americanFootballEnvelopeSchema<T extends z.ZodType>(itemSchema: T) {
  return z
    .object({
      get: z.string(),
      parameters: z.union([z.record(z.string(), z.unknown()), z.array(z.unknown())]),
      errors: americanFootballErrorsSchema,
      results: z.number(),
      paging: pagingSchema.optional(),
      response: z.array(itemSchema),
    })
    .strict();
}

export type AmericanFootballPaging = z.infer<typeof pagingSchema>;

export interface AmericanFootballApiSportsBody<T = unknown> {
  get: string;
  parameters: Record<string, unknown> | unknown[];
  errors: unknown[] | Record<string, string>;
  results: number;
  paging?: AmericanFootballPaging;
  response: T[];
}
