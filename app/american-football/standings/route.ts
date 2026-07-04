import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  americanFootballBffDeleteRoute,
  americanFootballBffGetRoute,
  americanFootballBffPatchRoute,
  americanFootballBffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseAmericanFootballStandingsQuery } from '@/lib/bff/american-football/query-params';
import { fetchAmericanFootballStandings } from '@/lib/bff/american-football/services/standings.service';
import {
  createAmericanFootballStandingEntry,
  deleteAmericanFootballStandingEntry,
  updateAmericanFootballStandingEntry,
} from '@/lib/bff/american-football/writers/standings.writer';
import { ApiError } from '@/lib/api/errors';

export const runtime = 'nodejs';

export const GET = americanFootballBffGetRoute('standings')(async ({ searchParams }) => {
  const response = await fetchAmericanFootballStandings(parseAmericanFootballStandingsQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = americanFootballBffPostRoute('standings')(async ({ body }) => {
  const standing = await createAmericanFootballStandingEntry(body);
  return { response: [standing], status: 201 };
});

export const PATCH = americanFootballBffPatchRoute('standings')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const standing = await updateAmericanFootballStandingEntry(id, body);
  return { response: [standing] };
});

export const DELETE = americanFootballBffDeleteRoute('standings')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteAmericanFootballStandingEntry(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
