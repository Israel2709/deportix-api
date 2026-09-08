import { z } from 'zod';
import { invalidRequestBody } from '@/lib/api/errors';
import {
  createTimezone,
  deleteTimezone,
  updateTimezone,
} from '@/lib/firebase/repositories/timezones.repository';

const timezoneSchema = z.object({ timezone: z.string().min(1) }).strict();

export async function createFormula1TimezoneEntry(body: unknown) {
  const parsed = timezoneSchema.safeParse(body);
  if (!parsed.success) throw invalidRequestBody('Body must include { timezone: string }.');
  return createTimezone(parsed.data.timezone);
}

export async function updateFormula1TimezoneEntry(body: unknown) {
  const schema = z
    .object({ timezone: z.string().min(1), newTimezone: z.string().min(1) })
    .strict();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody('Body must include { timezone, newTimezone }.');
  }
  return updateTimezone(parsed.data.timezone, parsed.data.newTimezone);
}

export async function deleteFormula1TimezoneEntry(body: unknown) {
  const parsed = timezoneSchema.safeParse(body);
  if (!parsed.success) throw invalidRequestBody('Body must include { timezone: string }.');
  await deleteTimezone(parsed.data.timezone);
}
