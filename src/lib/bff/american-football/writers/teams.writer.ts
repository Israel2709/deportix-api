import { invalidRequestBody } from '@/lib/api/errors';
import {
  americanFootballTeamCreateSchema,
  americanFootballTeamUpdateSchema,
  type AmericanFootballTeamCreate,
  type AmericanFootballTeamItem,
  type AmericanFootballTeamUpdate,
} from '../schemas/team.schema';
import {
  createAmericanFootballTeam,
  deleteAmericanFootballTeam,
  updateAmericanFootballTeam,
  buildAmericanFootballTeamItem,
} from '@/lib/firebase/repositories/american-football-teams.repository';
import { resolveAmericanFootballLeague } from '../services/leagues.service';
import { requireAmericanFootballParam } from '../query-params';

function parseTeamCreateBody(body: unknown): AmericanFootballTeamCreate {
  const parsed = americanFootballTeamCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid team body.');
  }
  return parsed.data;
}

function parseTeamUpdateBody(body: unknown): AmericanFootballTeamUpdate {
  const parsed = americanFootballTeamUpdateSchema.safeParse(body);
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

  const input = parseTeamCreateBody(body);
  const doc = await createAmericanFootballTeam(league.id, input);
  return buildAmericanFootballTeamItem(doc);
}

export async function updateAmericanFootballTeamEntry(
  teamId: string,
  body: unknown,
): Promise<AmericanFootballTeamItem> {
  const patch = parseTeamUpdateBody(body);
  const doc = await updateAmericanFootballTeam(teamId, patch);
  return buildAmericanFootballTeamItem(doc);
}

export async function deleteAmericanFootballTeamEntry(teamId: string): Promise<void> {
  await deleteAmericanFootballTeam(teamId);
}
