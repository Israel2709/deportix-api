import { listCatalogCountries } from '@/lib/catalog/countries.service';
import type { AmericanFootballCountryQuery } from '../query-params';

/** American Football BFF — reads the global country catalog. */
export async function fetchAmericanFootballCountries(query: AmericanFootballCountryQuery) {
  return listCatalogCountries({ name: query.name, code: query.code });
}
