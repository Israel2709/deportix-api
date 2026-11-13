import { asStr } from '@/lib/api/serializers';
import { notFound } from '@/lib/api/errors';
import { createDoc, deleteDoc, fetchAll, updateDocFields, type RawDoc } from './helpers';

const COLLECTION = 'league_types';

/** api-sports league.type values (Football v3 uses lowercase). */
export const DEFAULT_LEAGUE_TYPES = [
  { code: 'league', label: 'Liga' },
  { code: 'cup', label: 'Copa' },
] as const;

export interface LeagueTypeRecord {
  id: string;
  code: string;
  label: string;
  sortOrder: number;
}

function toRecord(doc: RawDoc): LeagueTypeRecord | null {
  const code = asStr(doc.data.code) ?? doc.id;
  const label = asStr(doc.data.label);
  if (!code || !label) return null;
  const sortOrder = typeof doc.data.sort_order === 'number' ? doc.data.sort_order : 0;
  return { id: doc.id, code, label, sortOrder };
}

export async function listLeagueTypes(): Promise<LeagueTypeRecord[]> {
  const docs = await fetchAll(COLLECTION);
  if (docs.length === 0) {
    return DEFAULT_LEAGUE_TYPES.map((item, index) => ({
      id: item.code,
      code: item.code,
      label: item.label,
      sortOrder: index,
    }));
  }

  return docs
    .map(toRecord)
    .filter((item): item is LeagueTypeRecord => item != null)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

export async function getLeagueTypeByCode(code: string): Promise<LeagueTypeRecord | null> {
  const normalized = code.trim().toLowerCase();
  if (!normalized) return null;
  const types = await listLeagueTypes();
  return types.find((item) => item.code.toLowerCase() === normalized) ?? null;
}

export async function seedDefaultLeagueTypesIfEmpty(): Promise<void> {
  const docs = await fetchAll(COLLECTION);
  if (docs.length > 0) return;

  const now = new Date().toISOString();
  for (const [index, item] of DEFAULT_LEAGUE_TYPES.entries()) {
    await createDoc(COLLECTION, item.code, {
      code: item.code,
      label: item.label,
      sort_order: index,
      created_at: now,
    });
  }
}

export async function createLeagueType(input: {
  code: string;
  label: string;
  sortOrder?: number;
}): Promise<LeagueTypeRecord> {
  await seedDefaultLeagueTypesIfEmpty();
  const code = input.code.trim().toLowerCase();
  const label = input.label.trim();
  const existing = await getLeagueTypeByCode(code);
  if (existing) {
    throw new Error(`LEAGUE_TYPE_EXISTS:${code}`);
  }

  const types = await listLeagueTypes();
  const sortOrder =
    input.sortOrder ?? (types.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1);
  const now = new Date().toISOString();
  await createDoc(COLLECTION, code, {
    code,
    label,
    sort_order: sortOrder,
    created_at: now,
    updated_at: now,
  });

  return { id: code, code, label, sortOrder };
}

export async function updateLeagueType(
  code: string,
  patch: { label?: string; sortOrder?: number },
): Promise<LeagueTypeRecord> {
  await seedDefaultLeagueTypesIfEmpty();
  const existing = await getLeagueTypeByCode(code);
  if (!existing) throw notFound('League type not found.');

  const label = patch.label?.trim() || existing.label;
  const sortOrder = patch.sortOrder ?? existing.sortOrder;
  await updateDocFields(COLLECTION, existing.id, {
    label,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  });

  return { id: existing.id, code: existing.code, label, sortOrder };
}

export async function deleteLeagueType(code: string): Promise<void> {
  await seedDefaultLeagueTypesIfEmpty();
  const existing = await getLeagueTypeByCode(code);
  if (!existing) throw notFound('League type not found.');
  await deleteDoc(COLLECTION, existing.id);
}

export async function isKnownLeagueType(code: string): Promise<boolean> {
  const normalized = code.trim().toLowerCase();
  const types = await listLeagueTypes();
  return types.some((item) => item.code.toLowerCase() === normalized);
}
