import { invalidRequestBody } from '@/lib/api/errors';
import { nflTeamItemSchema, type NflTeamItem } from '../schemas/team.schema';
import {
  createNflTeam,
  deleteNflTeam,
  updateNflTeam,
} from '@/lib/firebase/repositories/nfl-teams.repository';
import { mapNflTeamDocToApiSports } from '../mappers/team.mapper';
import { resolveNflLeague } from '../services/leagues.service';
import { requireNflParam } from '../query-params';

function parseTeamBody(body: unknown): NflTeamItem {
  const parsed = nflTeamItemSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid team body.');
  }
  return parsed.data;
}

export async function createNflTeamEntry(
  leagueExternalId: string,
  body: unknown,
): Promise<NflTeamItem> {
  requireNflParam(leagueExternalId, 'league');
  const league = await resolveNflLeague(leagueExternalId);
  if (!league) throw invalidRequestBody('League not found.');

  const item = parseTeamBody(body);
  const doc = await createNflTeam(league.id, item);
  return mapNflTeamDocToApiSports(doc);
}

export async function updateNflTeamEntry(teamId: string, body: unknown): Promise<NflTeamItem> {
  const patch = parseTeamBody(body);
  const doc = await updateNflTeam(teamId, patch);
  return mapNflTeamDocToApiSports(doc);
}

export async function deleteNflTeamEntry(teamId: string): Promise<void> {
  await deleteNflTeam(teamId);
}
