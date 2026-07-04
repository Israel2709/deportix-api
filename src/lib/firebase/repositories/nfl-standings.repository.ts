import { asStr } from '@/lib/api/serializers';
import { notFound } from '@/lib/api/errors';
import type { NflStandingItem } from '@/lib/bff/nfl/schemas/standing.schema';
import {
  createDoc,
  deleteDoc,
  fetchWhereEq,
  resolveDoc,
  updateDocFields,
  type RawDoc,
} from './helpers';

const COLLECTION = 'nfl_standings';

export async function listRawNflStandingsByLeague(
  leagueId: string,
  opts: { seasonId?: string; conference?: string },
): Promise<RawDoc[]> {
  const docs = await fetchWhereEq(COLLECTION, 'league_id', leagueId);
  return docs.filter((doc) => {
    if (opts.seasonId && doc.data.season_id !== opts.seasonId) return false;
    if (opts.conference) {
      const conf = asStr(doc.data.conference);
      if (!conf || conf.toLowerCase() !== opts.conference.toLowerCase()) return false;
    }
    return true;
  });
}

function standingToFirestore(
  leagueId: string,
  seasonId: string,
  teamId: string,
  item: NflStandingItem,
): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    league_id: leagueId,
    season_id: seasonId,
    team_id: teamId,
    conference: item.conference ?? null,
    division: item.division ?? null,
    position: item.position ?? null,
    wins: item.won ?? null,
    losses: item.lost ?? null,
    ties: item.ties ?? null,
    points_for: item.points?.for ?? null,
    points_against: item.points?.against ?? null,
    points_difference: item.points?.difference ?? null,
    records: item.records ?? null,
    record_home: item.records?.home ?? null,
    record_road: item.records?.road ?? null,
    record_conference: item.records?.conference ?? null,
    record_division: item.records?.division ?? null,
    streak: item.streak ?? null,
    ncaa_conference: item.ncaa_conference ?? null,
    api_sports_payload: item,
    created_at: now,
    updated_at: now,
  };
}

export async function createNflStanding(
  leagueId: string,
  seasonId: string,
  teamId: string,
  item: NflStandingItem,
): Promise<RawDoc> {
  const id = crypto.randomUUID();
  await createDoc(COLLECTION, id, standingToFirestore(leagueId, seasonId, teamId, item));
  const created = await resolveDoc(COLLECTION, id);
  if (!created) throw notFound('Standing not found.');
  return created;
}

export async function updateNflStanding(
  idOrExternalId: string,
  patch: Partial<NflStandingItem>,
): Promise<RawDoc> {
  const existing = await resolveDoc(COLLECTION, idOrExternalId);
  if (!existing) throw notFound('Standing not found.');

  const payload = {
    ...(existing.data.api_sports_payload as NflStandingItem | undefined),
    ...patch,
  };

  const fields: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    api_sports_payload: payload,
  };
  if (patch.conference !== undefined) fields.conference = patch.conference;
  if (patch.division !== undefined) fields.division = patch.division;
  if (patch.position !== undefined) fields.position = patch.position;
  if (patch.won !== undefined) fields.wins = patch.won;
  if (patch.lost !== undefined) fields.losses = patch.lost;
  if (patch.ties !== undefined) fields.ties = patch.ties;
  if (patch.points !== undefined) {
    fields.points_for = patch.points.for ?? null;
    fields.points_against = patch.points.against ?? null;
    fields.points_difference = patch.points.difference ?? null;
  }
  if (patch.records !== undefined) fields.records = patch.records;
  if (patch.streak !== undefined) fields.streak = patch.streak;
  if (patch.ncaa_conference !== undefined) fields.ncaa_conference = patch.ncaa_conference;

  await updateDocFields(COLLECTION, existing.id, fields);
  const updated = await resolveDoc(COLLECTION, existing.id);
  if (!updated) throw notFound('Standing not found.');
  return updated;
}

export async function deleteNflStanding(idOrExternalId: string): Promise<void> {
  const existing = await resolveDoc(COLLECTION, idOrExternalId);
  if (!existing) throw notFound('Standing not found.');
  await deleteDoc(COLLECTION, existing.id);
}
