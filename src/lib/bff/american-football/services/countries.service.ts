import { listCountries } from '@/lib/firebase/repositories/countries.repository';
import { mapAmericanFootballCountryToApiSports } from '../mappers/country.mapper';
import type { AmericanFootballCountryQuery } from '../query-params';

export async function fetchAmericanFootballCountries(query: AmericanFootballCountryQuery) {
  const countries = await listCountries({ name: query.name });
  return countries.map(mapAmericanFootballCountryToApiSports);
}
