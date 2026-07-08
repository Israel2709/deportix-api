import { asStr } from '@/lib/api/serializers';
import { notFound } from '@/lib/api/errors';
import type {
  AmericanFootballTeamCreate,
  AmericanFootballTeamItem,
  AmericanFootballTeamUpdate,
} from '@/lib/bff/american-football/schemas/team.schema';
import {
  createDoc,
  deleteDoc,
  fetchWhereEq,
  resolveDoc,
  updateDocFields,
  type RawDoc,
} from './helpers';

const COLLECTION = 'nfl_teams';

export function buildAmericanFootballTeamItem(doc: RawDoc): AmericanFootballTeamItem {
  return {
    id: doc.id,
    name: asStr(doc.data.name) ?? '',
    logo: asStr(doc.data.logo),
    altLogo: asStr(doc.data.alt_logo),
  };
}

export async function listRawAmericanFootballTeamsByLeague(leagueId: string): Promise<RawDoc[]> {
  return fetchWhereEq(COLLECTION, 'league_id', leagueId);
}

export async function getRawAmericanFootballTeam(idOrExternalId: string): Promise<RawDoc | null> {
  return resolveDoc(COLLECTION, idOrExternalId);
}

export async function requireAmericanFootballTeamInLeague(
  leagueId: string,
  teamId: string,
): Promise<RawDoc> {
  const team = await getRawAmericanFootballTeam(teamId);
  if (!team || asStr(team.data.league_id) !== leagueId) {
    throw notFound('Team not found.');
  }
  return team;
}

export async function createAmericanFootballTeam(
  leagueId: string,
  input: AmericanFootballTeamCreate,
  seasonId?: string | null,
): Promise<RawDoc> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const item = buildAmericanFootballTeamItem({
    id,
    data: {
      name: input.name,
      logo: input.logo ?? null,
      alt_logo: input.altLogo ?? null,
    },
  });
  const data: Record<string, unknown> = {
    league_id: leagueId,
    season_id: seasonId ?? null,
    name: input.name,
    logo: input.logo ?? null,
    alt_logo: input.altLogo ?? null,
    api_sports_payload: item,
    created_at: now,
    updated_at: now,
  };
  await createDoc(COLLECTION, id, data);
  const created = await resolveDoc(COLLECTION, id);
  if (!created) throw notFound('Team not found.');
  return created;
}

export async function updateAmericanFootballTeam(
  idOrExternalId: string,
  patch: AmericanFootballTeamUpdate,
): Promise<RawDoc> {
  const existing = await resolveDoc(COLLECTION, idOrExternalId);
  if (!existing) throw notFound('Team not found.');

  const current = buildAmericanFootballTeamItem(existing);
  const item: AmericanFootballTeamItem = {
    id: existing.id,
    name: patch.name ?? current.name,
    logo: patch.logo !== undefined ? patch.logo : current.logo,
    altLogo: patch.altLogo !== undefined ? patch.altLogo : current.altLogo,
  };

  const fields: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    api_sports_payload: item,
  };
  if (patch.name !== undefined) fields.name = patch.name;
  if (patch.logo !== undefined) fields.logo = patch.logo;
  if (patch.altLogo !== undefined) fields.alt_logo = patch.altLogo;

  await updateDocFields(COLLECTION, existing.id, fields);
  const updated = await resolveDoc(COLLECTION, existing.id);
  if (!updated) throw notFound('Team not found.');
  return updated;
}

export async function deleteAmericanFootballTeam(idOrExternalId: string): Promise<void> {
  const existing = await resolveDoc(COLLECTION, idOrExternalId);
  if (!existing) throw notFound('Team not found.');
  await deleteDoc(COLLECTION, existing.id);
}

/** @deprecated Legacy lookup by provider id — prefer canonical UUID. */
export async function resolveAmericanFootballTeamByExternalId(
  leagueId: string,
  externalId: string | number,
): Promise<RawDoc | null> {
  const docs = await fetchWhereEq(COLLECTION, 'league_id', leagueId);
  const needle = String(externalId);
  return (
    docs.find((doc) => asStr(doc.data.external_id) === needle || doc.id === needle) ?? null
  );
}
