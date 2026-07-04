import { listCountries } from '@/lib/firebase/repositories/countries.repository';
import { mapNflCountryToApiSports } from '../mappers/country.mapper';
import type { NflCountryQuery } from '../query-params';

export async function fetchNflCountries(query: NflCountryQuery) {
  const countries = await listCountries({ name: query.name });
  return countries.map(mapNflCountryToApiSports);
}
