import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';
import type { OrganizationRecord } from '@/lib/firebase/repositories/organizations.repository';

export interface ApiSportsOrganizationEntry {
  id: string;
  name: string;
  logo: string | null;
  country: {
    name: string | null;
    code: string | null;
    flag: string | null;
  };
}

export function mapOrganizationToApiSports(
  org: OrganizationRecord,
  country: CountryRecord | null,
): ApiSportsOrganizationEntry {
  return {
    id: org.id,
    name: org.name,
    logo: org.logo,
    country: {
      name: country?.name ?? null,
      code: country?.code ?? null,
      flag: country?.flag ?? null,
    },
  };
}

export function mapOrganizationRef(org: OrganizationRecord | null): {
  id: string;
  name: string;
  logo: string | null;
} | null {
  if (!org) return null;
  return { id: org.id, name: org.name, logo: org.logo };
}
