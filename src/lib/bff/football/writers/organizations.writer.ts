import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { buildCountryMap, getCountryByKey } from '@/lib/firebase/repositories/countries.repository';
import {
  countLeaguesByOrganization,
  createOrganization,
  deleteOrganization,
  findOrganizationByName,
  getOrganization,
  updateOrganization,
} from '@/lib/firebase/repositories/organizations.repository';
import { mapOrganizationToApiSports } from '../mappers/organization.mapper';
import {
  soccerOrganizationCreateSchema,
  soccerOrganizationUpdateSchema,
} from '../schemas/organization.schema';

async function toApiSports(id: string) {
  const org = await getOrganization(id);
  if (!org || org.sportSlug !== 'soccer') throw notFound('Organization not found.');
  const countryMap = await buildCountryMap();
  const country = org.countryId ? (countryMap.get(org.countryId) ?? null) : null;
  return mapOrganizationToApiSports(org, country);
}

export async function createSoccerOrganizationEntry(body: unknown) {
  const item = soccerOrganizationCreateSchema.parse(body);
  const country = await getCountryByKey(item.country.name);
  if (!country) throw invalidRequestBody('Country not found.');

  const duplicate = await findOrganizationByName(country.id, item.name, 'soccer');
  if (duplicate) {
    throw invalidRequestBody('An organization with that name already exists in this country.');
  }

  const org = await createOrganization({
    name: item.name,
    sportSlug: 'soccer',
    countryId: country.id,
    logo: item.logo ?? null,
  });
  return toApiSports(org.id);
}

export async function updateSoccerOrganizationEntry(id: string, body: unknown) {
  const item = soccerOrganizationUpdateSchema.parse(body);
  const existing = await getOrganization(id);
  if (!existing || existing.sportSlug !== 'soccer') throw notFound('Organization not found.');

  if (item.name.trim().toLowerCase() !== existing.name.toLowerCase() && existing.countryId) {
    const duplicate = await findOrganizationByName(existing.countryId, item.name, 'soccer');
    if (duplicate && duplicate.id !== existing.id) {
      throw invalidRequestBody('An organization with that name already exists in this country.');
    }
  }

  const updated = await updateOrganization(id, {
    name: item.name,
    logo: item.logo ?? null,
  });
  return toApiSports(updated.id);
}

export async function deleteSoccerOrganizationEntry(id: string) {
  const existing = await getOrganization(id);
  if (!existing || existing.sportSlug !== 'soccer') throw notFound('Organization not found.');

  const leagueCount = await countLeaguesByOrganization(id);
  if (leagueCount > 0) {
    throw invalidRequestBody('Cannot delete an organization that has leagues.');
  }

  await deleteOrganization(id);
}
