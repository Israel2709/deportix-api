import { buildCountryMap, getCountryByKey } from '@/lib/firebase/repositories/countries.repository';
import {
  getOrganization,
  listOrganizations,
} from '@/lib/firebase/repositories/organizations.repository';
import { mapOrganizationToApiSports } from '../mappers/organization.mapper';
import type { OrganizationQuery } from '../query-params';

function nameMatches(value: string | null, filter: string): boolean {
  if (!value) return false;
  return value.toLowerCase().includes(filter.toLowerCase());
}

export async function fetchFootballOrganizations(query: OrganizationQuery): Promise<unknown[]> {
  const countryMap = await buildCountryMap();

  if (query.id) {
    const org = await getOrganization(query.id);
    if (!org || org.sportSlug !== 'soccer') return [];
    const country = org.countryId ? (countryMap.get(org.countryId) ?? null) : null;
    return [mapOrganizationToApiSports(org, country)];
  }

  let countryId: string | undefined;
  if (query.country) {
    const country = await getCountryByKey(query.country);
    countryId = country?.id;
    if (!countryId) return [];
  }

  const orgs = await listOrganizations({
    sportSlug: 'soccer',
    countryId,
  });

  return orgs
    .filter((org) => (query.name ? nameMatches(org.name, query.name) : true))
    .map((org) => {
      const country = org.countryId ? (countryMap.get(org.countryId) ?? null) : null;
      return mapOrganizationToApiSports(org, country);
    });
}
