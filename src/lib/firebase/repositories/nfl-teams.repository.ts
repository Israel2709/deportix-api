import { asStr } from '@/lib/api/serializers';
import { notFound } from '@/lib/api/errors';
import type { NflTeamItem } from '@/lib/bff/nfl/schemas/team.schema';
import {
  createDoc,
  deleteDoc,
  fetchWhereEq,
  resolveDoc,
  updateDocFields,
  type RawDoc,
} from './helpers';

const COLLECTION = 'nfl_teams';

export async function listRawNflTeamsByLeague(leagueId: string): Promise<RawDoc[]> {
  return fetchWhereEq(COLLECTION, 'league_id', leagueId);
}

export async function getRawNflTeam(idOrExternalId: string): Promise<RawDoc | null> {
  return resolveDoc(COLLECTION, idOrExternalId);
}

export async function createNflTeam(
  leagueId: string,
  item: NflTeamItem,
  seasonId?: string | null,
): Promise<RawDoc> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const data: Record<string, unknown> = {
    league_id: leagueId,
    season_id: seasonId ?? null,
    external_id: String(item.id),
    name: item.name,
    logo: item.logo ?? null,
    alt_logo: item.altLogo ?? null,
    api_sports_payload: item,
    created_at: now,
    updated_at: now,
  };
  await createDoc(COLLECTION, id, data);
  const created = await resolveDoc(COLLECTION, id);
  if (!created) throw notFound('Team not found.');
  return created;
}

export async function updateNflTeam(
  idOrExternalId: string,
  patch: Partial<NflTeamItem>,
): Promise<RawDoc> {
  const existing = await resolveDoc(COLLECTION, idOrExternalId);
  if (!existing) throw notFound('Team not found.');

  const payload = {
    ...(existing.data.api_sports_payload as NflTeamItem | undefined),
    ...patch,
    id: patch.id ?? (existing.data.api_sports_payload as NflTeamItem | undefined)?.id ?? existing.data.external_id,
  };

  const fields: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    api_sports_payload: payload,
  };
  if (patch.name !== undefined) fields.name = patch.name;
  if (patch.logo !== undefined) fields.logo = patch.logo;
  if (patch.altLogo !== undefined) fields.alt_logo = patch.altLogo;
  if (patch.id !== undefined) fields.external_id = String(patch.id);

  await updateDocFields(COLLECTION, existing.id, fields);
  const updated = await resolveDoc(COLLECTION, existing.id);
  if (!updated) throw notFound('Team not found.');
  return updated;
}

export async function deleteNflTeam(idOrExternalId: string): Promise<void> {
  const existing = await resolveDoc(COLLECTION, idOrExternalId);
  if (!existing) throw notFound('Team not found.');
  await deleteDoc(COLLECTION, existing.id);
}

export async function resolveNflTeamByExternalId(
  leagueId: string,
  externalId: string | number,
): Promise<RawDoc | null> {
  const docs = await fetchWhereEq(COLLECTION, 'league_id', leagueId);
  const needle = String(externalId);
  return (
    docs.find((doc) => asStr(doc.data.external_id) === needle || doc.id === needle) ?? null
  );
}
