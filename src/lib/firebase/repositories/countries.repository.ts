import { asStr } from '@/lib/api/serializers';
import { fetchAll, type RawDoc } from './helpers';

const COLLECTION = 'countries';

export interface CountryRecord {
  id: string;
  name: string;
  code: string | null;
  flag: string | null;
  externalId: string | null;
}

function toRecord(doc: RawDoc): CountryRecord {
  const data = doc.data;
  return {
    id: doc.id,
    name: asStr(data.name) ?? '',
    code: asStr(data.code) ?? asStr(data.external_id),
    flag: asStr(data.flag),
    externalId: asStr(data.external_id),
  };
}

export async function listCountries(filters?: {
  name?: string;
  code?: string;
}): Promise<CountryRecord[]> {
  const docs = await fetchAll(COLLECTION);
  let countries = docs.map(toRecord).filter((country) => country.name.length > 0);

  if (filters?.name) {
    const needle = filters.name.toLowerCase();
    countries = countries.filter((country) => country.name.toLowerCase().includes(needle));
  }

  if (filters?.code) {
    const needle = filters.code.toUpperCase();
    countries = countries.filter(
      (country) =>
        (country.code ?? '').toUpperCase() === needle ||
        (country.externalId ?? '').toUpperCase() === needle,
    );
  }

  return countries.sort((a, b) => a.name.localeCompare(b.name));
}

/** Resolve a country by document id, external id, or ISO code. */
export async function getCountryByKey(key: string): Promise<CountryRecord | null> {
  const countries = await listCountries({});
  const normalized = key.toLowerCase();
  return (
    countries.find(
      (country) =>
        country.id === key ||
        country.externalId === key ||
        (country.code ?? '').toLowerCase() === normalized ||
        country.name.toLowerCase() === normalized,
    ) ?? null
  );
}

export async function buildCountryMap(): Promise<Map<string, CountryRecord>> {
  const countries = await listCountries({});
  const map = new Map<string, CountryRecord>();
  for (const country of countries) {
    map.set(country.id, country);
    if (country.externalId) map.set(country.externalId, country);
    if (country.code) map.set(country.code, country);
    map.set(country.name.toLowerCase(), country);
  }
  return map;
}
