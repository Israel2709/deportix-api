import { invalidRequestBody } from '@/lib/api/errors';
import {
  isKnownLeagueType,
  listLeagueTypes,
  seedDefaultLeagueTypesIfEmpty,
  type LeagueTypeRecord,
} from '@/lib/firebase/repositories/league-types.repository';

export interface CatalogLeagueTypeDto {
  code: string;
  label: string;
}

function toDto(record: LeagueTypeRecord): CatalogLeagueTypeDto {
  return { code: record.code, label: record.label };
}

/** List league types from the global Firestore `league_types` catalog. */
export async function listCatalogLeagueTypes(): Promise<CatalogLeagueTypeDto[]> {
  await seedDefaultLeagueTypesIfEmpty();
  const types = await listLeagueTypes();
  return types.map(toDto);
}

export async function resolveCatalogLeagueType(code: string | null | undefined): Promise<string> {
  const normalized = (code ?? 'league').trim().toLowerCase();
  if (!normalized) throw invalidRequestBody('League type is required.');

  await seedDefaultLeagueTypesIfEmpty();
  const types = await listLeagueTypes();
  const match = types.find((item) => item.code.toLowerCase() === normalized);
  if (!match) {
    throw invalidRequestBody(
      `Invalid league type "${code}". Allowed values: ${types.map((item) => item.code).join(', ')}.`,
    );
  }
  return match.code;
}

export async function assertCatalogLeagueType(code: string | null | undefined): Promise<string> {
  return resolveCatalogLeagueType(code);
}

export { isKnownLeagueType };
