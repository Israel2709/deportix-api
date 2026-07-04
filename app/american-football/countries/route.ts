import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  americanFootballBffDeleteRoute,
  americanFootballBffGetRoute,
  americanFootballBffPatchRoute,
  americanFootballBffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseAmericanFootballCountryQuery } from '@/lib/bff/american-football/query-params';
import { fetchAmericanFootballCountries } from '@/lib/bff/american-football/services/countries.service';
import {
  createAmericanFootballCountryEntry,
  deleteAmericanFootballCountryEntry,
  updateAmericanFootballCountryEntry,
} from '@/lib/bff/american-football/writers/catalog.writer';

export const runtime = 'nodejs';

export const GET = americanFootballBffGetRoute('countries')(async ({ searchParams }) => {
  const response = await fetchAmericanFootballCountries(parseAmericanFootballCountryQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = americanFootballBffPostRoute('countries')(async ({ body }) => {
  const country = await createAmericanFootballCountryEntry(body);
  return { response: [country], status: 201 };
});

export const PATCH = americanFootballBffPatchRoute('countries')(async ({ searchParams, body }) => {
  const name = searchParams.get('name');
  if (!name) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "name" parameter is required.');
  const country = await updateAmericanFootballCountryEntry(name, body);
  return { response: [country] };
});

export const DELETE = americanFootballBffDeleteRoute('countries')(async ({ searchParams }) => {
  const name = searchParams.get('name');
  if (!name) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "name" parameter is required.');
  await deleteAmericanFootballCountryEntry(name);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
