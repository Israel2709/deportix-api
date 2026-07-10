import { asStr } from '@/lib/api/serializers';
import { notFound } from '@/lib/api/errors';
import {
  createDoc,
  deleteDoc,
  fetchWhereEq,
  getDocById,
  resolveDoc,
  updateDocFields,
  type RawDoc,
} from './helpers';

const COLLECTION = 'soccer_rounds';

export interface RoundRecord {
  id: string;
  name: string;
  position: number | null;
  leagueId: string;
  seasonId: string;
}

function toRecord(doc: RawDoc): RoundRecord {
  const data = doc.data;
  const position = typeof data.position === 'number' ? data.position : null;
  return {
    id: doc.id,
    name: asStr(data.name) ?? '',
    position,
    leagueId: asStr(data.league_id) ?? '',
    seasonId: asStr(data.season_id) ?? '',
  };
}

export async function listRoundsBySeason(leagueId: string, seasonId: string): Promise<RoundRecord[]> {
  const docs = await fetchWhereEq(COLLECTION, 'league_id', leagueId);
  return docs
    .map(toRecord)
    .filter((round) => round.seasonId === seasonId && round.name.length > 0)
    .sort((a, b) => {
      if (a.position != null && b.position != null) return a.position - b.position;
      return a.name.localeCompare(b.name);
    });
}

export async function createRound(
  leagueId: string,
  seasonId: string,
  input: { name: string; position?: number | null },
): Promise<RoundRecord> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await createDoc(COLLECTION, id, {
    league_id: leagueId,
    season_id: seasonId,
    name: input.name,
    position: input.position ?? null,
    created_at: now,
    updated_at: now,
  });
  const created = await getDocById(COLLECTION, id);
  if (!created) throw notFound('Round not found.');
  return toRecord(created);
}

export async function updateRound(
  roundId: string,
  patch: { name?: string; position?: number | null },
): Promise<RoundRecord> {
  const existing = await resolveDoc(COLLECTION, roundId);
  if (!existing) throw notFound('Round not found.');

  const fields: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.name !== undefined) fields.name = patch.name;
  if (patch.position !== undefined) fields.position = patch.position;
  await updateDocFields(COLLECTION, existing.id, fields);

  const updated = await getDocById(COLLECTION, existing.id);
  if (!updated) throw notFound('Round not found.');
  return toRecord(updated);
}

export async function deleteRound(roundId: string): Promise<void> {
  const existing = await resolveDoc(COLLECTION, roundId);
  if (!existing) throw notFound('Round not found.');
  await deleteDoc(COLLECTION, existing.id);
}
