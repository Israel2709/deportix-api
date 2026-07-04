import { listCatalogCountries } from '@/lib/catalog/countries.service';
import type { CountryQuery } from '../query-params';

/** Soccer BFF — reads the global country catalog. */
export async function fetchFootballCountries(query: CountryQuery): Promise<unknown[]> {
  return listCatalogCountries({ name: query.name, code: query.code });
}
