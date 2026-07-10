import { asNum, asStr } from '@/lib/api/serializers';
import { notFound } from '@/lib/api/errors';
import type { SoccerStandingCreate } from '@/lib/bff/football/schemas/standing.schema';
import {
  createDoc,
  deleteDoc,
  fetchWhereEq,
  resolveDoc,
  updateDocFields,
  type RawDoc,
} from './helpers';

const COLLECTION = 'soccer_standings';

function standingToFirestore(
  leagueId: string,
  seasonId: string,
  teamId: string,
  item: SoccerStandingCreate,
): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    league_id: leagueId,
    season_id: seasonId,
    team_id: teamId,
    rank: item.rank ?? null,
    points: item.points ?? null,
    goals_diff: item.goalsDiff ?? null,
    form: item.form ?? null,
    status: item.status ?? null,
    description: item.description ?? null,
    played: item.all?.played ?? null,
    wins: item.all?.win ?? null,
    draws: item.all?.draw ?? null,
    losses: item.all?.lose ?? null,
    goals_for: item.all?.goals?.for ?? null,
    goals_against: item.all?.goals?.against ?? null,
    home: item.home ?? null,
    away: item.away ?? null,
    created_at: now,
    updated_at: now,
  };
}

function applyStandingPatch(fields: Record<string, unknown>, patch: SoccerStandingCreate): void {
  if (patch.rank !== undefined) fields.rank = patch.rank;
  if (patch.points !== undefined) fields.points = patch.points;
  if (patch.goalsDiff !== undefined) fields.goals_diff = patch.goalsDiff;
  if (patch.form !== undefined) fields.form = patch.form;
  if (patch.status !== undefined) fields.status = patch.status;
  if (patch.description !== undefined) fields.description = patch.description;
  if (patch.all !== undefined) {
    if (patch.all.played !== undefined) fields.played = patch.all.played;
    if (patch.all.win !== undefined) fields.wins = patch.all.win;
    if (patch.all.draw !== undefined) fields.draws = patch.all.draw;
    if (patch.all.lose !== undefined) fields.losses = patch.all.lose;
    if (patch.all.goals !== undefined) {
      if (patch.all.goals.for !== undefined) fields.goals_for = patch.all.goals.for;
      if (patch.all.goals.against !== undefined) fields.goals_against = patch.all.goals.against;
    }
  }
  if (patch.home !== undefined) fields.home = patch.home;
  if (patch.away !== undefined) fields.away = patch.away;
}

export async function listRawSoccerStandingsByLeague(
  leagueId: string,
  opts: { seasonId?: string },
): Promise<RawDoc[]> {
  const docs = await fetchWhereEq(COLLECTION, 'league_id', leagueId);
  return docs.filter((doc) => !opts.seasonId || doc.data.season_id === opts.seasonId);
}

export async function createSoccerStanding(
  leagueId: string,
  seasonId: string,
  teamId: string,
  item: SoccerStandingCreate,
): Promise<RawDoc> {
  const id = crypto.randomUUID();
  await createDoc(COLLECTION, id, standingToFirestore(leagueId, seasonId, teamId, item));
  const created = await resolveDoc(COLLECTION, id);
  if (!created) throw notFound('Standing not found.');
  return created;
}

export async function updateSoccerStanding(
  idOrExternalId: string,
  patch: SoccerStandingCreate,
): Promise<RawDoc> {
  const existing = await resolveDoc(COLLECTION, idOrExternalId);
  if (!existing) throw notFound('Standing not found.');

  const fields: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  applyStandingPatch(fields, patch);
  await updateDocFields(COLLECTION, existing.id, fields);
  const updated = await resolveDoc(COLLECTION, existing.id);
  if (!updated) throw notFound('Standing not found.');
  return updated;
}

export async function deleteSoccerStanding(idOrExternalId: string): Promise<void> {
  const existing = await resolveDoc(COLLECTION, idOrExternalId);
  if (!existing) throw notFound('Standing not found.');
  await deleteDoc(COLLECTION, existing.id);
}

export function standingDocTeamId(doc: RawDoc): string | null {
  return asStr(doc.data.team_id);
}

export function standingDocSeasonId(doc: RawDoc): string | null {
  return asStr(doc.data.season_id);
}

export function standingDocPoints(doc: RawDoc): number | null {
  return asNum(doc.data.points);
}
