import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  nflBffDeleteRoute,
  nflBffGetRoute,
  nflBffPatchRoute,
  nflBffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseNflCountryQuery } from '@/lib/bff/nfl/query-params';
import { fetchNflCountries } from '@/lib/bff/nfl/services/countries.service';
import {
  createNflCountryEntry,
  deleteNflCountryEntry,
  updateNflCountryEntry,
} from '@/lib/bff/nfl/writers/catalog.writer';

export const runtime = 'nodejs';

export const GET = nflBffGetRoute('countries')(async ({ searchParams }) => {
  const response = await fetchNflCountries(parseNflCountryQuery(searchParams));
  return { response, cache: CACHE.standard };
});

export const POST = nflBffPostRoute('countries')(async ({ body }) => {
  const country = await createNflCountryEntry(body);
  return { response: [country], status: 201 };
});

export const PATCH = nflBffPatchRoute('countries')(async ({ searchParams, body }) => {
  const name = searchParams.get('name');
  if (!name) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "name" parameter is required.');
  const country = await updateNflCountryEntry(name, body);
  return { response: [country] };
});

export const DELETE = nflBffDeleteRoute('countries')(async ({ searchParams }) => {
  const name = searchParams.get('name');
  if (!name) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "name" parameter is required.');
  await deleteNflCountryEntry(name);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
