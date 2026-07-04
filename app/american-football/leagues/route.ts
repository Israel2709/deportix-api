import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  americanFootballBffDeleteRoute,
  americanFootballBffGetRoute,
  americanFootballBffPatchRoute,
  americanFootballBffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseAmericanFootballLeagueQuery } from '@/lib/bff/american-football/query-params';
import { fetchAmericanFootballLeagues } from '@/lib/bff/american-football/services/leagues.service';
import {
  createAmericanFootballLeagueEntry,
  deleteAmericanFootballLeagueEntry,
  updateAmericanFootballLeagueEntry,
} from '@/lib/bff/american-football/writers/catalog.writer';
import { ApiError } from '@/lib/api/errors';

export const runtime = 'nodejs';

export const GET = americanFootballBffGetRoute('leagues')(async ({ searchParams }) => {
  const response = await fetchAmericanFootballLeagues(parseAmericanFootballLeagueQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = americanFootballBffPostRoute('leagues')(async ({ body }) => {
  const league = await createAmericanFootballLeagueEntry(body);
  return { response: [league], status: 201 };
});

export const PATCH = americanFootballBffPatchRoute('leagues')(async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const league = await updateAmericanFootballLeagueEntry(id, body);
  return { response: [league] };
});

export const DELETE = americanFootballBffDeleteRoute('leagues')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteAmericanFootballLeagueEntry(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
