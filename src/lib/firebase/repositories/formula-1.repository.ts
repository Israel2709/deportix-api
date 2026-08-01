import { F1_COLLECTIONS } from '@/lib/firebase/sport-registry';
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

export async function listF1Competitions(): Promise<RawDoc[]> {
  return fetchAll(F1_COLLECTIONS.competitions);
}

export async function listF1Circuits(): Promise<RawDoc[]> {
  return fetchAll(F1_COLLECTIONS.circuits);
}

export async function listF1Drivers(): Promise<RawDoc[]> {
  return fetchAll(F1_COLLECTIONS.drivers);
}

export async function listF1Teams(): Promise<RawDoc[]> {
  return fetchAll(F1_COLLECTIONS.teams);
}

export async function listF1RacesBySeason(season: number): Promise<RawDoc[]> {
  return fetchWhereEq(F1_COLLECTIONS.races, 'season', season);
}

export async function listF1DriverRankingsBySeason(season: number): Promise<RawDoc[]> {
  return fetchWhereEq(F1_COLLECTIONS.driverRankings, 'season', season);
}

export async function listF1TeamRankingsBySeason(season: number): Promise<RawDoc[]> {
  return fetchWhereEq(F1_COLLECTIONS.teamRankings, 'season', season);
}

export async function listF1RaceRankingsByRace(raceId: string): Promise<RawDoc[]> {
  return fetchWhereEq(F1_COLLECTIONS.raceRankings, 'race_id', raceId);
}

export async function resolveF1Competition(id: string): Promise<RawDoc | null> {
  return resolveDoc(F1_COLLECTIONS.competitions, id);
}

export async function resolveF1Circuit(id: string): Promise<RawDoc | null> {
  return resolveDoc(F1_COLLECTIONS.circuits, id);
}

export async function resolveF1Driver(id: string): Promise<RawDoc | null> {
  return resolveDoc(F1_COLLECTIONS.drivers, id);
}

export async function resolveF1Team(id: string): Promise<RawDoc | null> {
  return resolveDoc(F1_COLLECTIONS.teams, id);
}

export async function resolveF1Race(id: string): Promise<RawDoc | null> {
  return resolveDoc(F1_COLLECTIONS.races, id);
}

export async function resolveF1DriverRanking(id: string): Promise<RawDoc | null> {
  return resolveDoc(F1_COLLECTIONS.driverRankings, id);
}

export async function resolveF1TeamRanking(id: string): Promise<RawDoc | null> {
  return resolveDoc(F1_COLLECTIONS.teamRankings, id);
}

export async function resolveF1RaceRanking(id: string): Promise<RawDoc | null> {
  return resolveDoc(F1_COLLECTIONS.raceRankings, id);
}

export async function getF1TeamById(id: string): Promise<RawDoc | null> {
  return getDocById(F1_COLLECTIONS.teams, id);
}

export async function getF1DriverById(id: string): Promise<RawDoc | null> {
  return getDocById(F1_COLLECTIONS.drivers, id);
}

export async function getF1CompetitionById(id: string): Promise<RawDoc | null> {
  return getDocById(F1_COLLECTIONS.competitions, id);
}

export async function getF1CircuitById(id: string): Promise<RawDoc | null> {
  return getDocById(F1_COLLECTIONS.circuits, id);
}

export async function getF1RaceById(id: string): Promise<RawDoc | null> {
  return getDocById(F1_COLLECTIONS.races, id);
}

/** Distinct season years present on races (calendar source of truth). */
export async function listF1SeasonYears(): Promise<number[]> {
  const races = await fetchAll(F1_COLLECTIONS.races);
  const years = new Set<number>();
  for (const doc of races) {
    const year = doc.data.season;
    if (typeof year === 'number' && Number.isFinite(year)) years.add(year);
  }
  return [...years].sort((a, b) => b - a);
}

export async function createF1Doc(
  collection: string,
  data: Record<string, unknown>,
): Promise<RawDoc> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const payload = { ...data, id, created_at: now, updated_at: now };
  await createDoc(collection, id, payload);
  return { id, data: payload };
}

export async function updateF1Doc(
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

export async function deleteF1Doc(collection: string, id: string): Promise<void> {
  await deleteDoc(collection, id);
}

export function buildTeamMap(docs: RawDoc[]): Map<string, RawDoc> {
  return new Map(docs.map((doc) => [doc.id, doc]));
}

export function buildDriverMap(docs: RawDoc[]): Map<string, RawDoc> {
  return new Map(docs.map((doc) => [doc.id, doc]));
}

export function buildCompetitionMap(docs: RawDoc[]): Map<string, RawDoc> {
  return new Map(docs.map((doc) => [doc.id, doc]));
}

export function buildCircuitMap(docs: RawDoc[]): Map<string, RawDoc> {
  return new Map(docs.map((doc) => [doc.id, doc]));
}
