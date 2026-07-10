import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffGetRoute,
  bffOptionsRoute,
  soccerBffDeleteRoute,
  soccerBffPatchRoute,
  soccerBffPostRoute,
  soccerBffPutRoute,
  type BffWriteHandler,
} from '@/lib/bff/football/handler';
import { parseCountryQuery } from '@/lib/bff/football/query-params';
import { fetchFootballCountries } from '@/lib/bff/football/services/countries.service';
import {
  createSoccerCountryEntry,
  deleteSoccerCountryEntry,
  updateSoccerCountryEntry,
} from '@/lib/bff/football/writers/catalog.writer';

export const runtime = 'nodejs';

export const GET = bffGetRoute(async ({ searchParams }) => {
  const response = await fetchFootballCountries(parseCountryQuery(searchParams));
  return { response, cache: CACHE.none };
});

export const POST = soccerBffPostRoute('countries')(async ({ body }) => {
  const country = await createSoccerCountryEntry(body);
  return { response: [country], status: 201 };
});

const patchCountry: BffWriteHandler = async ({ searchParams, body }) => {
  const name = searchParams.get('name');
  if (!name) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "name" parameter is required.');
  const country = await updateSoccerCountryEntry(name, body);
  return { response: [country] };
};

export const PATCH = soccerBffPatchRoute('countries')(patchCountry);
export const PUT = soccerBffPutRoute('countries')(patchCountry);

export const DELETE = soccerBffDeleteRoute('countries')(async ({ searchParams }) => {
  const name = searchParams.get('name');
  if (!name) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "name" parameter is required.');
  await deleteSoccerCountryEntry(name);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
