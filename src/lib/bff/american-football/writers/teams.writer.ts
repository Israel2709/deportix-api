import { invalidRequestBody } from '@/lib/api/errors';
import { americanFootballTeamItemSchema, type AmericanFootballTeamItem } from '../schemas/team.schema';
import {
  createAmericanFootballTeam,
  deleteAmericanFootballTeam,
  updateAmericanFootballTeam,
} from '@/lib/firebase/repositories/american-football-teams.repository';
import { mapAmericanFootballTeamDocToApiSports } from '../mappers/team.mapper';
import { resolveAmericanFootballLeague } from '../services/leagues.service';
import { requireAmericanFootballParam } from '../query-params';

function parseTeamBody(body: unknown): AmericanFootballTeamItem {
  const parsed = americanFootballTeamItemSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid team body.');
  }
  return parsed.data;
}

export async function createAmericanFootballTeamEntry(
  leagueExternalId: string,
  body: unknown,
): Promise<AmericanFootballTeamItem> {
  requireAmericanFootballParam(leagueExternalId, 'league');
  const league = await resolveAmericanFootballLeague(leagueExternalId);
  if (!league) throw invalidRequestBody('League not found.');

  const item = parseTeamBody(body);
  const doc = await createAmericanFootballTeam(league.id, item);
  return mapAmericanFootballTeamDocToApiSports(doc);
}

export async function updateAmericanFootballTeamEntry(teamId: string, body: unknown): Promise<AmericanFootballTeamItem> {
  const patch = parseTeamBody(body);
  const doc = await updateAmericanFootballTeam(teamId, patch);
  return mapAmericanFootballTeamDocToApiSports(doc);
}

export async function deleteAmericanFootballTeamEntry(teamId: string): Promise<void> {
  await deleteAmericanFootballTeam(teamId);
}
