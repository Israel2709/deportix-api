import { asStr } from '@/lib/api/serializers';
import { createDoc, fetchAll, type RawDoc } from './helpers';

const COLLECTION = 'league_types';

/** api-sports league.type values (American Football v1 uses lowercase). */
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
  if (docs.length === 0) return DEFAULT_LEAGUE_TYPES.map((item, index) => ({
    id: item.code,
    code: item.code,
    label: item.label,
    sortOrder: index,
  }));

  return docs
    .map(toRecord)
    .filter((item): item is LeagueTypeRecord => item != null)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
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

export async function isKnownLeagueType(code: string): Promise<boolean> {
  const normalized = code.trim().toLowerCase();
  const types = await listLeagueTypes();
  return types.some((item) => item.code.toLowerCase() === normalized);
}
