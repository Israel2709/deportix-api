import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';

export interface ApiSportsCountry {
  name: string;
  code: string | null;
  flag: string | null;
}

export function mapCountryToApiSports(country: CountryRecord): ApiSportsCountry {
  return {
    name: country.name,
    code: country.code,
    flag: country.flag,
  };
}
