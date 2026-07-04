import { z } from 'zod';
import {
  createCountry,
  deleteCountry,
  listCountries,
  updateCountry,
  type CountryRecord,
} from '@/lib/firebase/repositories/countries.repository';

/** Shared country catalog shape (API-Sports Football v3). Used by all sports. */
export const catalogCountrySchema = z
  .object({
    name: z.string().min(1),
    code: z.string().nullable().optional(),
    flag: z.string().nullable().optional(),
  })
  .strict();

export type CatalogCountryInput = z.infer<typeof catalogCountrySchema>;

export interface CatalogCountryDto {
  name: string;
  code: string | null;
  flag: string | null;
}

export interface CatalogCountryQuery {
  name?: string;
  code?: string;
}

export function toCatalogCountryDto(country: CountryRecord): CatalogCountryDto {
  return {
    name: country.name,
    code: country.code,
    flag: country.flag,
  };
}

/** List countries from the global Firestore `countries` catalog. */
export async function listCatalogCountries(
  query: CatalogCountryQuery = {},
): Promise<CatalogCountryDto[]> {
  const countries = await listCountries({ name: query.name, code: query.code });
  return countries.map(toCatalogCountryDto);
}

export async function createCatalogCountry(body: unknown): Promise<CatalogCountryDto> {
  const item = catalogCountrySchema.parse(body);
  const country = await createCountry(item);
  return toCatalogCountryDto(country);
}

export async function updateCatalogCountry(key: string, body: unknown): Promise<CatalogCountryDto> {
  const item = catalogCountrySchema.parse(body);
  const country = await updateCountry(key, item);
  return toCatalogCountryDto(country);
}

export async function deleteCatalogCountry(key: string): Promise<void> {
  await deleteCountry(key);
}
