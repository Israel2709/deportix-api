import { asStr } from '@/lib/api/serializers';
import { invalidRequestBody, notFound } from '@/lib/api/errors';
import {
  createDoc,
  deleteDoc,
  fetchWhereEq,
  resolveDoc,
  type RawDoc,
} from './helpers';
import { getRawSoccerTeam } from './soccer-teams.repository';

const COLLECTION = 'soccer_season_participants';

export interface SoccerSeasonParticipantRecord {
  id: string;
  seasonId: string;
  leagueId: string;
  teamId: string;
  externalId: string | null;
}

export function buildParticipantExternalId(seasonId: string, teamId: string): string {
  return `${seasonId}-${teamId}`;
}

function mapParticipant(doc: RawDoc): SoccerSeasonParticipantRecord {
  return {
    id: doc.id,
    seasonId: asStr(doc.data.season_id) ?? '',
    leagueId: asStr(doc.data.league_id) ?? '',
    teamId: asStr(doc.data.team_id) ?? '',
    externalId: asStr(doc.data.external_id),
  };
}

export async function listParticipantsBySeason(
  seasonId: string,
): Promise<SoccerSeasonParticipantRecord[]> {
  const docs = await fetchWhereEq(COLLECTION, 'season_id', seasonId);
  return docs
    .map(mapParticipant)
    .filter((row) => row.teamId)
    .sort((a, b) => a.teamId.localeCompare(b.teamId));
}

export async function listParticipantTeamIdsBySeason(seasonId: string): Promise<string[]> {
  const rows = await listParticipantsBySeason(seasonId);
  return [...new Set(rows.map((row) => row.teamId))];
}

export async function replaceSeasonParticipants(input: {
  seasonId: string;
  leagueId: string;
  teamIds: string[];
}): Promise<SoccerSeasonParticipantRecord[]> {
  const unique = [...new Set(input.teamIds.map((id) => id.trim()).filter(Boolean))];

  for (const teamId of unique) {
    const team = await getRawSoccerTeam(teamId);
    if (!team) throw invalidRequestBody(`team_id no existe: ${teamId}`);
  }

  const existing = await fetchWhereEq(COLLECTION, 'season_id', input.seasonId);
  for (const doc of existing) {
    await deleteDoc(COLLECTION, doc.id);
  }

  const now = new Date().toISOString();
  const created: SoccerSeasonParticipantRecord[] = [];

  for (const teamId of unique) {
    const id = crypto.randomUUID();
    const externalId = buildParticipantExternalId(input.seasonId, teamId);
    await createDoc(COLLECTION, id, {
      season_id: input.seasonId,
      league_id: input.leagueId,
      team_id: teamId,
      external_id: externalId,
      created_at: now,
      updated_at: now,
    });
    const doc = await resolveDoc(COLLECTION, id);
    if (!doc) throw notFound('Participant not found.');
    created.push(mapParticipant(doc));
  }

  return created;
}

/** True when the team is listed as a participant of the season (or no roster exists yet). */
export async function isTeamParticipantOfSeason(
  seasonId: string,
  teamId: string,
): Promise<boolean> {
  const ids = await listParticipantTeamIdsBySeason(seasonId);
  if (ids.length === 0) return true;
  return ids.includes(teamId);
}
