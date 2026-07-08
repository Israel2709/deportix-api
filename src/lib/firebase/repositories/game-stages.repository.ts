import { asStr } from '@/lib/api/serializers';
import { createDoc, fetchAll, type RawDoc } from './helpers';

const COLLECTION = 'game_stages';

/** api-sports American Football v1 `game.stage` values. */
export const DEFAULT_AMERICAN_FOOTBALL_GAME_STAGES = [
  { value: 'Pre Season', label: 'Pretemporada' },
  { value: 'Regular Season', label: 'Temporada regular' },
  { value: 'Post Season', label: 'Postemporada' },
  { value: 'Wild Card', label: 'Wild Card' },
  { value: 'Divisional Round', label: 'Divisional' },
  { value: 'Conference Championships', label: 'Finales de conferencia' },
  { value: 'Super Bowl', label: 'Super Bowl' },
] as const;

export interface GameStageRecord {
  id: string;
  value: string;
  label: string;
  sortOrder: number;
}

function stageDocId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toRecord(doc: RawDoc): GameStageRecord | null {
  const value = asStr(doc.data.value) ?? doc.id;
  const label = asStr(doc.data.label);
  if (!value || !label) return null;
  const sortOrder = typeof doc.data.sort_order === 'number' ? doc.data.sort_order : 0;
  return { id: doc.id, value, label, sortOrder };
}

export async function listGameStages(): Promise<GameStageRecord[]> {
  const docs = await fetchAll(COLLECTION);
  if (docs.length === 0) {
    return DEFAULT_AMERICAN_FOOTBALL_GAME_STAGES.map((item, index) => ({
      id: stageDocId(item.value),
      value: item.value,
      label: item.label,
      sortOrder: index,
    }));
  }

  return docs
    .map(toRecord)
    .filter((item): item is GameStageRecord => item != null)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

export async function seedDefaultGameStagesIfEmpty(): Promise<void> {
  const docs = await fetchAll(COLLECTION);
  if (docs.length > 0) return;

  const now = new Date().toISOString();
  for (const [index, item] of DEFAULT_AMERICAN_FOOTBALL_GAME_STAGES.entries()) {
    await createDoc(COLLECTION, stageDocId(item.value), {
      value: item.value,
      label: item.label,
      sort_order: index,
      created_at: now,
    });
  }
}
