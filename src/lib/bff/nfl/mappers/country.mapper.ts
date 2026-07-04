import { mapCountryToApiSports } from '@/lib/bff/football/mappers/country.mapper';
import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';

export function mapNflCountryToApiSports(country: CountryRecord) {
  return mapCountryToApiSports(country);
}
