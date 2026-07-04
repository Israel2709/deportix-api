import { asStr } from '@/lib/api/serializers';
import { notFound } from '@/lib/api/errors';
import { createDoc, deleteDoc, fetchAll, resolveDoc, updateDocFields, type RawDoc } from './helpers';

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

export async function createCountry(input: {
  name: string;
  code?: string | null;
  flag?: string | null;
  externalId?: string | null;
}): Promise<CountryRecord> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const data = {
    name: input.name,
    code: input.code ?? null,
    flag: input.flag ?? null,
    external_id: input.externalId ?? input.code ?? null,
    created_at: now,
    updated_at: now,
  };
  await createDoc(COLLECTION, id, data);
  return toRecord({ id, data });
}

export async function updateCountry(
  key: string,
  patch: { name?: string; code?: string | null; flag?: string | null },
): Promise<CountryRecord> {
  const existing = await resolveDoc(COLLECTION, key);
  if (!existing) throw notFound('Country not found.');

  const fields: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) fields.name = patch.name;
  if (patch.code !== undefined) fields.code = patch.code;
  if (patch.flag !== undefined) fields.flag = patch.flag;

  await updateDocFields(COLLECTION, existing.id, fields);
  const updated = await resolveDoc(COLLECTION, existing.id);
  if (!updated) throw notFound('Country not found.');
  return toRecord(updated);
}

export async function deleteCountry(key: string): Promise<void> {
  const existing = await resolveDoc(COLLECTION, key);
  if (!existing) throw notFound('Country not found.');
  await deleteDoc(COLLECTION, existing.id);
}
