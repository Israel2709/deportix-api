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
import { parseOrganizationQuery } from '@/lib/bff/football/query-params';
import { fetchFootballOrganizations } from '@/lib/bff/football/services/organizations.service';
import {
  createSoccerOrganizationEntry,
  deleteSoccerOrganizationEntry,
  updateSoccerOrganizationEntry,
} from '@/lib/bff/football/writers/organizations.writer';

export const runtime = 'nodejs';

export const GET = bffGetRoute(async ({ searchParams }) => {
  const response = await fetchFootballOrganizations(parseOrganizationQuery(searchParams));
  return { response, cache: CACHE.none };
});

export const POST = soccerBffPostRoute('organizations')(async ({ body }) => {
  const organization = await createSoccerOrganizationEntry(body);
  return { response: [organization], status: 201 };
});

const patchOrganization: BffWriteHandler = async ({ searchParams, body }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  const organization = await updateSoccerOrganizationEntry(id, body);
  return { response: [organization] };
};

export const PATCH = soccerBffPatchRoute('organizations')(patchOrganization);
export const PUT = soccerBffPutRoute('organizations')(patchOrganization);

export const DELETE = soccerBffDeleteRoute('organizations')(async ({ searchParams }) => {
  const id = searchParams.get('id');
  if (!id) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "id" parameter is required.');
  await deleteSoccerOrganizationEntry(id);
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
