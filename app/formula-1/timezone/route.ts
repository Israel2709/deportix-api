import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  formula1BffDeleteRoute,
  formula1BffGetRoute,
  formula1BffPatchRoute,
  formula1BffPostRoute,
} from '@/lib/bff/shared/handler';
import { fetchFormula1Timezones } from '@/lib/bff/formula-1/services/timezone.service';
import {
  createFormula1TimezoneEntry,
  deleteFormula1TimezoneEntry,
  updateFormula1TimezoneEntry,
} from '@/lib/bff/formula-1/writers/timezone.writer';

export const runtime = 'nodejs';

export const GET = formula1BffGetRoute('timezone')(async () => {
  const response = await fetchFormula1Timezones();
  return { response, cache: CACHE.standard };
});

export const POST = formula1BffPostRoute('timezone')(async ({ body }) => {
  const timezone = await createFormula1TimezoneEntry(body);
  return { response: [timezone], status: 201 };
});

export const PATCH = formula1BffPatchRoute('timezone')(async ({ body }) => {
  const timezone = await updateFormula1TimezoneEntry(body);
  return { response: [timezone] };
});

export const DELETE = formula1BffDeleteRoute('timezone')(async ({ body }) => {
  await deleteFormula1TimezoneEntry(body);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
