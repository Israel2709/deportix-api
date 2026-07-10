import { invalidRequestBody } from '@/lib/api/errors';
import {
  soccerTeamCreateSchema,
  soccerTeamUpdateSchema,
  type SoccerTeamCreate,
  type SoccerTeamUpdate,
} from '../schemas/team.schema';
import {
  createSoccerTeam,
  deleteSoccerTeam,
  mapSoccerTeamToApiSports,
  requireSoccerTeamInLeague,
  updateSoccerTeam,
} from '@/lib/firebase/repositories/soccer-teams.repository';
import { resolveSoccerLeague } from '../services/leagues.service';

function parseTeamCreateBody(body: unknown): SoccerTeamCreate {
  const parsed = soccerTeamCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid team body.');
  }
  return parsed.data;
}

function parseTeamUpdateBody(body: unknown): SoccerTeamUpdate {
  const parsed = soccerTeamUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid team body.');
  }
  return parsed.data;
}

export async function createSoccerTeamEntry(leagueExternalId: string, body: unknown) {
  const league = await resolveSoccerLeague(leagueExternalId);
  if (!league) throw invalidRequestBody('League not found.');
  const input = parseTeamCreateBody(body);
  const doc = await createSoccerTeam(league.id, input);
  return mapSoccerTeamToApiSports(doc);
}

export async function updateSoccerTeamEntry(teamId: string, body: unknown) {
  const patch = parseTeamUpdateBody(body);
  const doc = await updateSoccerTeam(teamId, patch);
  return mapSoccerTeamToApiSports(doc);
}

export async function deleteSoccerTeamEntry(teamId: string) {
  await deleteSoccerTeam(teamId);
}

export async function requireSoccerTeamEntry(leagueExternalId: string, teamId: string) {
  const league = await resolveSoccerLeague(leagueExternalId);
  if (!league) throw invalidRequestBody('League not found.');
  const doc = await requireSoccerTeamInLeague(league.id, teamId);
  return mapSoccerTeamToApiSports(doc);
}
