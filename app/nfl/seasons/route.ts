import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  nflBffDeleteRoute,
  nflBffGetRoute,
  nflBffPostRoute,
} from '@/lib/bff/shared/handler';
import { fetchNflGlobalSeasons } from '@/lib/bff/nfl/services/leagues.service';
import { createNflSeasonYear, deleteNflSeasonYear } from '@/lib/bff/nfl/writers/catalog.writer';

export const runtime = 'nodejs';

export const GET = nflBffGetRoute('seasons')(async () => {
  const response = await fetchNflGlobalSeasons();
  return { response, cache: CACHE.standard };
});

export const POST = nflBffPostRoute('seasons')(async ({ body }) => {
  const year = await createNflSeasonYear(body);
  return { response: [year], status: 201 };
});

export const DELETE = nflBffDeleteRoute('seasons')(async ({ body }) => {
  await deleteNflSeasonYear(body);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
