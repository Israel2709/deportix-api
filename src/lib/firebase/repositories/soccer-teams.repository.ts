import { asStr } from '@/lib/api/serializers';
import { notFound } from '@/lib/api/errors';
import type { SoccerTeamCreate, SoccerTeamUpdate } from '@/lib/bff/football/schemas/team.schema';
import {
  createDoc,
  deleteDoc,
  fetchWhereEq,
  resolveDoc,
  updateDocFields,
  type RawDoc,
} from './helpers';

const COLLECTION = 'soccer_teams';

function externalNumericId(value: string | null): number | string | null {
  if (!value) return null;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
}

export function mapSoccerTeamToApiSports(doc: RawDoc): Record<string, unknown> {
  const raw = doc.data;
  const team = (raw.team && typeof raw.team === 'object' ? raw.team : {}) as Record<string, unknown>;
  return {
    team: {
      id: doc.id,
      name: asStr(team.name) ?? asStr(raw.name) ?? '',
      code: asStr(team.code),
      country: asStr(team.country),
      logo: asStr(team.logo) ?? asStr(raw.logo),
    },
    venue: raw.venue && typeof raw.venue === 'object' ? raw.venue : {},
  };
}

export async function listRawSoccerTeamsByLeague(leagueId: string): Promise<RawDoc[]> {
  return fetchWhereEq(COLLECTION, 'league_id', leagueId);
}

export async function getRawSoccerTeam(idOrExternalId: string): Promise<RawDoc | null> {
  return resolveDoc(COLLECTION, idOrExternalId);
}

export async function requireSoccerTeamInLeague(leagueId: string, teamId: string): Promise<RawDoc> {
  const team = await getRawSoccerTeam(teamId);
  if (!team || asStr(team.data.league_id) !== leagueId) {
    throw notFound('Team not found.');
  }
  return team;
}

export async function createSoccerTeam(leagueId: string, input: SoccerTeamCreate): Promise<RawDoc> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const data: Record<string, unknown> = {
    league_id: leagueId,
    external_id: null,
    name: input.name,
    logo: input.logo ?? null,
    team: {
      name: input.name,
      code: input.code ?? null,
      country: input.country ?? null,
      logo: input.logo ?? null,
    },
    created_at: now,
    updated_at: now,
  };
  await createDoc(COLLECTION, id, data);
  const created = await resolveDoc(COLLECTION, id);
  if (!created) throw notFound('Team not found.');
  return created;
}

export async function updateSoccerTeam(
  idOrExternalId: string,
  patch: SoccerTeamUpdate,
): Promise<RawDoc> {
  const existing = await resolveDoc(COLLECTION, idOrExternalId);
  if (!existing) throw notFound('Team not found.');

  const currentTeam =
    existing.data.team && typeof existing.data.team === 'object'
      ? (existing.data.team as Record<string, unknown>)
      : {};

  const nextTeam = {
    ...currentTeam,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.code !== undefined ? { code: patch.code } : {}),
    ...(patch.country !== undefined ? { country: patch.country } : {}),
    ...(patch.logo !== undefined ? { logo: patch.logo } : {}),
  };

  const fields: Record<string, unknown> = {
    team: nextTeam,
    updated_at: new Date().toISOString(),
  };
  if (patch.name !== undefined) fields.name = patch.name;
  if (patch.logo !== undefined) fields.logo = patch.logo;

  await updateDocFields(COLLECTION, existing.id, fields);
  const updated = await resolveDoc(COLLECTION, existing.id);
  if (!updated) throw notFound('Team not found.');
  return updated;
}

export async function deleteSoccerTeam(idOrExternalId: string): Promise<void> {
  const existing = await resolveDoc(COLLECTION, idOrExternalId);
  if (!existing) throw notFound('Team not found.');
  await deleteDoc(COLLECTION, existing.id);
}

export function soccerTeamExternalId(doc: RawDoc): number | string | null {
  return externalNumericId(asStr(doc.data.external_id));
}
