import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { TENNIS_COLLECTIONS } from '@/lib/firebase/sport-registry';
import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import {
  buildDocMap,
  createTennisDoc,
  deleteTennisDoc,
  getTennisPlayerById,
  getTennisTournamentById,
  listTennisEntriesByTournament,
  listTennisPlayers,
  resolveTennisEntry,
  updateTennisDoc,
} from '@/lib/firebase/repositories/tennis.repository';
import { mapTennisEntry } from '../mappers/entry.mapper';
import { parseBody } from '../parse';
import {
  tennisEntryCreateSchema,
  tennisEntryUpdateSchema,
  type TennisEntryCreate,
  type TennisEntryItem,
  type TennisEntryUpdate,
} from '../schemas/entry.schema';

async function toItem(doc: { id: string; data: Record<string, unknown> }): Promise<TennisEntryItem> {
  const [players, countries] = await Promise.all([listTennisPlayers(), buildCountryMap()]);
  const playerId = String(doc.data.player_id ?? '');
  return mapTennisEntry(doc, buildDocMap(players).get(playerId), countries);
}

export async function createTennisEntry(body: unknown): Promise<TennisEntryItem> {
  const input = parseBody<TennisEntryCreate>(tennisEntryCreateSchema, body, 'entry');
  const [tournament, player] = await Promise.all([
    getTennisTournamentById(input.tournamentId),
    getTennisPlayerById(input.playerId),
  ]);
  if (!tournament) throw invalidRequestBody('tournamentId must reference an existing tournament.');
  if (!player) throw invalidRequestBody('playerId must reference an existing player.');

  const existing = await listTennisEntriesByTournament(input.tournamentId);
  if (existing.some((doc) => doc.data.player_id === input.playerId)) {
    throw invalidRequestBody('That player is already entered in this tournament.');
  }

  const doc = await createTennisDoc(TENNIS_COLLECTIONS.entries, {
    tournament_id: input.tournamentId,
    player_id: input.playerId,
    seed: input.seed ?? null,
    ranking: input.ranking ?? null,
    entry_type: input.entryType ?? null,
    is_published: false,
  });
  return toItem(doc);
}

export async function updateTennisEntry(id: string, body: unknown): Promise<TennisEntryItem> {
  const existing = await resolveTennisEntry(id);
  if (!existing) throw notFound('Entry not found.');
  const patch = parseBody<TennisEntryUpdate>(tennisEntryUpdateSchema, body, 'entry');

  if (patch.playerId) {
    const player = await getTennisPlayerById(patch.playerId);
    if (!player) throw invalidRequestBody('playerId must reference an existing player.');
    const siblings = await listTennisEntriesByTournament(String(existing.data.tournament_id ?? ''));
    if (siblings.some((doc) => doc.id !== existing.id && doc.data.player_id === patch.playerId)) {
      throw invalidRequestBody('That player is already entered in this tournament.');
    }
  }

  const doc = await updateTennisDoc(TENNIS_COLLECTIONS.entries, existing.id, {
    ...(patch.playerId != null ? { player_id: patch.playerId } : {}),
    ...(patch.seed !== undefined ? { seed: patch.seed } : {}),
    ...(patch.ranking !== undefined ? { ranking: patch.ranking } : {}),
    ...(patch.entryType !== undefined ? { entry_type: patch.entryType } : {}),
  });
  return toItem(doc);
}

export async function deleteTennisEntry(id: string): Promise<void> {
  const existing = await resolveTennisEntry(id);
  if (!existing) throw notFound('Entry not found.');
  await deleteTennisDoc(TENNIS_COLLECTIONS.entries, existing.id);
}
