import { z } from 'zod';
import { ApiError, invalidRequestBody } from '@/lib/api/errors';
import {
  createLeagueType,
  deleteLeagueType,
  isKnownLeagueType,
  listLeagueTypes,
  seedDefaultLeagueTypesIfEmpty,
  updateLeagueType,
  type LeagueTypeRecord,
} from '@/lib/firebase/repositories/league-types.repository';

export interface CatalogLeagueTypeDto {
  code: string;
  label: string;
}

const createSchema = z
  .object({
    code: z.string().min(1),
    label: z.string().min(1),
    sortOrder: z.number().int().optional(),
  })
  .strict();

const updateSchema = z
  .object({
    label: z.string().min(1).optional(),
    sortOrder: z.number().int().optional(),
  })
  .strict()
  .refine((value) => value.label !== undefined || value.sortOrder !== undefined, {
    message: 'At least one of label or sortOrder is required.',
  });

function toDto(record: LeagueTypeRecord): CatalogLeagueTypeDto {
  return { code: record.code, label: record.label };
}

function normalizeCode(code: string): string {
  return code
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '');
}

/** List league types from the global Firestore `league_types` catalog. */
export async function listCatalogLeagueTypes(): Promise<CatalogLeagueTypeDto[]> {
  await seedDefaultLeagueTypesIfEmpty();
  const types = await listLeagueTypes();
  return types.map(toDto);
}

export async function createCatalogLeagueType(body: unknown): Promise<CatalogLeagueTypeDto> {
  const parsed = createSchema.parse(body);
  const code = normalizeCode(parsed.code);
  if (!code) throw invalidRequestBody('League type code is required.');

  try {
    const created = await createLeagueType({
      code,
      label: parsed.label.trim(),
      sortOrder: parsed.sortOrder,
    });
    return toDto(created);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('LEAGUE_TYPE_EXISTS:')) {
      throw new ApiError('INVALID_REQUEST_BODY', `League type "${code}" already exists.`);
    }
    throw err;
  }
}

export async function updateCatalogLeagueType(
  code: string,
  body: unknown,
): Promise<CatalogLeagueTypeDto> {
  const parsed = updateSchema.parse(body);
  const updated = await updateLeagueType(code, {
    label: parsed.label,
    sortOrder: parsed.sortOrder,
  });
  return toDto(updated);
}

export async function deleteCatalogLeagueType(code: string): Promise<void> {
  await deleteLeagueType(code);
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
