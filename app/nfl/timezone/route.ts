import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  nflBffDeleteRoute,
  nflBffGetRoute,
  nflBffPatchRoute,
  nflBffPostRoute,
} from '@/lib/bff/shared/handler';
import { fetchNflTimezones } from '@/lib/bff/nfl/services/timezone.service';
import {
  createNflTimezoneEntry,
  deleteNflTimezoneEntry,
  updateNflTimezoneEntry,
} from '@/lib/bff/nfl/writers/catalog.writer';

export const runtime = 'nodejs';

export const GET = nflBffGetRoute('timezone')(async () => {
  const response = await fetchNflTimezones();
  return { response, cache: CACHE.standard };
});

export const POST = nflBffPostRoute('timezone')(async ({ body }) => {
  const timezone = await createNflTimezoneEntry(body);
  return { response: [timezone], status: 201 };
});

export const PATCH = nflBffPatchRoute('timezone')(async ({ body }) => {
  const timezone = await updateNflTimezoneEntry(body);
  return { response: [timezone] };
});

export const DELETE = nflBffDeleteRoute('timezone')(async ({ body }) => {
  await deleteNflTimezoneEntry(body);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
