import { listCountries } from '@/lib/firebase/repositories/countries.repository';
import { mapCountryToApiSports } from '../mappers/country.mapper';
import type { CountryQuery } from '../query-params';

export async function fetchFootballCountries(query: CountryQuery): Promise<unknown[]> {
  const countries = await listCountries({
    name: query.name,
    code: query.code,
  });
  return countries.map(mapCountryToApiSports);
}
