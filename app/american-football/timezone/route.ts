import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  americanFootballBffDeleteRoute,
  americanFootballBffGetRoute,
  americanFootballBffPatchRoute,
  americanFootballBffPostRoute,
} from '@/lib/bff/shared/handler';
import { fetchAmericanFootballTimezones } from '@/lib/bff/american-football/services/timezone.service';
import {
  createAmericanFootballTimezoneEntry,
  deleteAmericanFootballTimezoneEntry,
  updateAmericanFootballTimezoneEntry,
} from '@/lib/bff/american-football/writers/catalog.writer';

export const runtime = 'nodejs';

export const GET = americanFootballBffGetRoute('timezone')(async () => {
  const response = await fetchAmericanFootballTimezones();
  return { response, cache: CACHE.standard };
});

export const POST = americanFootballBffPostRoute('timezone')(async ({ body }) => {
  const timezone = await createAmericanFootballTimezoneEntry(body);
  return { response: [timezone], status: 201 };
});

export const PATCH = americanFootballBffPatchRoute('timezone')(async ({ body }) => {
  const timezone = await updateAmericanFootballTimezoneEntry(body);
  return { response: [timezone] };
});

export const DELETE = americanFootballBffDeleteRoute('timezone')(async ({ body }) => {
  await deleteAmericanFootballTimezoneEntry(body);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
