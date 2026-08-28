import { TENNIS_COLLECTIONS } from '@/lib/firebase/sport-registry';
import {
  createDoc,
  deleteDoc,
  fetchAll,
  fetchWhereEq,
  getDocById,
  resolveDoc,
  updateDocFields,
  type RawDoc,
} from './helpers';

export async function listTennisPlayers(): Promise<RawDoc[]> {
  return fetchAll(TENNIS_COLLECTIONS.players);
}

export async function listTennisTournaments(): Promise<RawDoc[]> {
  return fetchAll(TENNIS_COLLECTIONS.tournaments);
}

export async function listTennisTournamentsByYear(year: number): Promise<RawDoc[]> {
  return fetchWhereEq(TENNIS_COLLECTIONS.tournaments, 'year', year);
}

export async function listTennisRoundsByTournament(tournamentId: string): Promise<RawDoc[]> {
  return fetchWhereEq(TENNIS_COLLECTIONS.rounds, 'tournament_id', tournamentId);
}

export async function listTennisEntriesByTournament(tournamentId: string): Promise<RawDoc[]> {
  return fetchWhereEq(TENNIS_COLLECTIONS.entries, 'tournament_id', tournamentId);
}

export async function listTennisMatchesByTournament(tournamentId: string): Promise<RawDoc[]> {
  return fetchWhereEq(TENNIS_COLLECTIONS.matches, 'tournament_id', tournamentId);
}

export async function listTennisMatchesByRound(roundId: string): Promise<RawDoc[]> {
  return fetchWhereEq(TENNIS_COLLECTIONS.matches, 'round_id', roundId);
}

export async function resolveTennisPlayer(id: string): Promise<RawDoc | null> {
  return resolveDoc(TENNIS_COLLECTIONS.players, id);
}

export async function resolveTennisTournament(id: string): Promise<RawDoc | null> {
  return resolveDoc(TENNIS_COLLECTIONS.tournaments, id);
}

export async function resolveTennisRound(id: string): Promise<RawDoc | null> {
  return resolveDoc(TENNIS_COLLECTIONS.rounds, id);
}

export async function resolveTennisEntry(id: string): Promise<RawDoc | null> {
  return resolveDoc(TENNIS_COLLECTIONS.entries, id);
}

export async function resolveTennisMatch(id: string): Promise<RawDoc | null> {
  return resolveDoc(TENNIS_COLLECTIONS.matches, id);
}

export async function getTennisPlayerById(id: string): Promise<RawDoc | null> {
  return getDocById(TENNIS_COLLECTIONS.players, id);
}

export async function getTennisTournamentById(id: string): Promise<RawDoc | null> {
  return getDocById(TENNIS_COLLECTIONS.tournaments, id);
}

export async function getTennisRoundById(id: string): Promise<RawDoc | null> {
  return getDocById(TENNIS_COLLECTIONS.rounds, id);
}

export async function getTennisEntryById(id: string): Promise<RawDoc | null> {
  return getDocById(TENNIS_COLLECTIONS.entries, id);
}

export async function getTennisMatchById(id: string): Promise<RawDoc | null> {
  return getDocById(TENNIS_COLLECTIONS.matches, id);
}

export async function createTennisDoc(
  collection: string,
  data: Record<string, unknown>,
): Promise<RawDoc> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const payload = { ...data, id, created_at: now, updated_at: now };
  await createDoc(collection, id, payload);
  return { id, data: payload };
}

export async function updateTennisDoc(
  collection: string,
  id: string,
  fields: Record<string, unknown>,
): Promise<RawDoc> {
  const patch = { ...fields, updated_at: new Date().toISOString() };
  await updateDocFields(collection, id, patch);
  const doc = await getDocById(collection, id);
  if (!doc) throw new Error(`Document ${id} missing after update`);
  return doc;
}

export async function deleteTennisDoc(collection: string, id: string): Promise<void> {
  await deleteDoc(collection, id);
}

export function buildDocMap(docs: RawDoc[]): Map<string, RawDoc> {
  return new Map(docs.map((doc) => [doc.id, doc]));
}
