import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { TENNIS_COLLECTIONS } from '@/lib/firebase/sport-registry';
import {
  createTennisDoc,
  deleteTennisDoc,
  getTennisTournamentById,
  listTennisMatchesByRound,
  listTennisRoundsByTournament,
  resolveTennisRound,
  updateTennisDoc,
} from '@/lib/firebase/repositories/tennis.repository';
import { mapTennisRound } from '../mappers/round.mapper';
import { parseBody } from '../parse';
import { toRoundSnap } from '../snaps';
import { assertRoundNumbersUnique } from '../validation';
import {
  tennisRoundCreateSchema,
  tennisRoundUpdateSchema,
  type TennisRoundCreate,
  type TennisRoundItem,
  type TennisRoundUpdate,
} from '../schemas/round.schema';

export async function createTennisRound(body: unknown): Promise<TennisRoundItem> {
  const input = parseBody<TennisRoundCreate>(tennisRoundCreateSchema, body, 'round');
  const tournament = await getTennisTournamentById(input.tournamentId);
  if (!tournament) throw invalidRequestBody('tournamentId must reference an existing tournament.');

  const existing = await listTennisRoundsByTournament(input.tournamentId);
  assertRoundNumbersUnique(existing.map(toRoundSnap), input.roundNumber);

  const doc = await createTennisDoc(TENNIS_COLLECTIONS.rounds, {
    tournament_id: input.tournamentId,
    round_number: input.roundNumber,
    name: input.name,
    status: input.status ?? 'pending',
    start_date: input.startDate ?? null,
    end_date: input.endDate ?? null,
    is_published: false,
  });
  return mapTennisRound(doc);
}

export async function updateTennisRound(id: string, body: unknown): Promise<TennisRoundItem> {
  const existing = await resolveTennisRound(id);
  if (!existing) throw notFound('Round not found.');
  const patch = parseBody<TennisRoundUpdate>(tennisRoundUpdateSchema, body, 'round');
  const tournamentId = String(existing.data.tournament_id ?? '');

  if (patch.roundNumber != null) {
    const siblings = await listTennisRoundsByTournament(tournamentId);
    assertRoundNumbersUnique(siblings.map(toRoundSnap), patch.roundNumber, existing.id);
  }

  const doc = await updateTennisDoc(TENNIS_COLLECTIONS.rounds, existing.id, {
    ...(patch.roundNumber != null ? { round_number: patch.roundNumber } : {}),
    ...(patch.name != null ? { name: patch.name } : {}),
    ...(patch.status != null ? { status: patch.status } : {}),
    ...(patch.startDate !== undefined ? { start_date: patch.startDate } : {}),
    ...(patch.endDate !== undefined ? { end_date: patch.endDate } : {}),
  });
  return mapTennisRound(doc);
}

export async function deleteTennisRound(id: string): Promise<void> {
  const existing = await resolveTennisRound(id);
  if (!existing) throw notFound('Round not found.');
  const matches = await listTennisMatchesByRound(existing.id);
  if (matches.length > 0) {
    throw invalidRequestBody('Cannot delete a round that still has matches.');
  }
  await deleteTennisDoc(TENNIS_COLLECTIONS.rounds, existing.id);
}
