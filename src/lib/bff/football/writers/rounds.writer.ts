import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { createRound, deleteRound, updateRound } from '@/lib/firebase/repositories/rounds.repository';
import { findSeasonByYear } from '@/lib/firebase/repositories/seasons.repository';
import { soccerRoundCreateSchema } from '../schemas/round.schema';
import { resolveSoccerLeague } from '../services/leagues.service';
import { resolveDoc } from '@/lib/firebase/repositories/helpers';

const COLLECTION = 'soccer_rounds';

function parseRoundBody(body: unknown) {
  const parsed = soccerRoundCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid round body.');
  }
  return parsed.data;
}

async function resolveRoundLeagueSeason(leagueExternalId: string, seasonYear: number) {
  const league = await resolveSoccerLeague(leagueExternalId);
  if (!league) throw invalidRequestBody('League not found.');
  const season = await findSeasonByYear(league.id, seasonYear);
  if (!season?.id) throw notFound('Season not found.');
  return { league, season };
}

export async function createSoccerRoundEntry(
  leagueExternalId: string,
  seasonYear: number,
  body: unknown,
) {
  const input = parseRoundBody(body);
  const { league, season } = await resolveRoundLeagueSeason(leagueExternalId, seasonYear);
  const round = await createRound(league.id, season.id, input);
  return round.name;
}

export async function updateSoccerRoundEntry(roundId: string, body: unknown) {
  const input = parseRoundBody(body);
  const round = await updateRound(roundId, input);
  return round.name;
}

export async function deleteSoccerRoundEntry(roundId: string) {
  await deleteRound(roundId);
}

export async function getSoccerRoundEntry(roundId: string) {
  const doc = await resolveDoc(COLLECTION, roundId);
  if (!doc) throw notFound('Round not found.');
  return String(doc.data.name ?? '');
}
