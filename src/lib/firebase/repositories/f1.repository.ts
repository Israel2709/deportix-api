import { ApiError } from '@/lib/api/errors';
import { asStr, updatedAtOf } from '@/lib/api/serializers';
import {
  fetchAll,
  fetchWhereEq,
  resolveDoc,
  type RawDoc,
} from './helpers';

const LIVE_STATUSES = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE', 'INT', 'Q1', 'Q2', 'Q3', 'Q4', 'OT'];

export interface F1DriverRecord {
  id: string;
  external_id: string | null;
  name: string | null;
  nationality: string | null;
  number: number | null;
  team_id: string | null;
}

export interface F1TeamRecord {
  id: string;
  external_id: string | null;
  name: string | null;
  logo: string | null;
}

export interface F1RaceRecord {
  id: string;
  external_id: string | null;
  competition_id: string | null;
  circuit_id: string | null;
  season: number | null;
  race_date: string | null;
  status: string | null;
}

export interface F1DriverRankingRecord {
  id: string;
  external_id: string | null;
  driver_id: string | null;
  season: number | null;
  points: number | null;
  position: number | null;
}

export interface F1TeamRankingRecord {
  id: string;
  external_id: string | null;
  team_id: string | null;
  season: number | null;
  points: number | null;
  position: number | null;
}

export interface F1RaceRankingRecord {
  id: string;
  external_id: string | null;
  race_id: string | null;
  driver_id: string | null;
  position: number | null;
  time: string | null;
  laps: number | null;
  grid: string | null;
  pits: number | null;
  gap: string | null;
}

export interface F1CompetitionRecord {
  id: string;
  external_id: string | null;
  name: string | null;
}

export interface F1CircuitRecord {
  id: string;
  external_id: string | null;
  name: string | null;
  country: string | null;
}

function serializeDriver(doc: RawDoc): F1DriverRecord {
  return {
    id: doc.id,
    external_id: asStr(doc.data.external_id),
    name: asStr(doc.data.name),
    nationality: asStr(doc.data.nationality),
    number: typeof doc.data.number === 'number' ? doc.data.number : null,
    team_id: asStr(doc.data.team_id),
  };
}

function serializeTeam(doc: RawDoc): F1TeamRecord {
  return {
    id: doc.id,
    external_id: asStr(doc.data.external_id),
    name: asStr(doc.data.name),
    logo: asStr(doc.data.logo),
  };
}

function serializeRace(doc: RawDoc): F1RaceRecord {
  return {
    id: doc.id,
    external_id: asStr(doc.data.external_id),
    competition_id: asStr(doc.data.competition_id),
    circuit_id: asStr(doc.data.circuit_id),
    season: typeof doc.data.season === 'number' ? doc.data.season : null,
    race_date: asStr(doc.data.race_date),
    status: asStr(doc.data.status),
  };
}

function serializeDriverRanking(doc: RawDoc): F1DriverRankingRecord {
  return {
    id: doc.id,
    external_id: asStr(doc.data.external_id),
    driver_id: asStr(doc.data.driver_id),
    season: typeof doc.data.season === 'number' ? doc.data.season : null,
    points: typeof doc.data.points === 'number' ? doc.data.points : null,
    position: typeof doc.data.position === 'number' ? doc.data.position : null,
  };
}

function serializeTeamRanking(doc: RawDoc): F1TeamRankingRecord {
  return {
    id: doc.id,
    external_id: asStr(doc.data.external_id),
    team_id: asStr(doc.data.team_id),
    season: typeof doc.data.season === 'number' ? doc.data.season : null,
    points: typeof doc.data.points === 'number' ? doc.data.points : null,
    position: typeof doc.data.position === 'number' ? doc.data.position : null,
  };
}

function serializeRaceRanking(doc: RawDoc): F1RaceRankingRecord {
  return {
    id: doc.id,
    external_id: asStr(doc.data.external_id),
    race_id: asStr(doc.data.race_id),
    driver_id: asStr(doc.data.driver_id),
    position: typeof doc.data.position === 'number' ? doc.data.position : null,
    time: asStr(doc.data.time),
    laps: typeof doc.data.laps === 'number' ? doc.data.laps : null,
    grid: asStr(doc.data.grid),
    pits: typeof doc.data.pits === 'number' ? doc.data.pits : null,
    gap: doc.data.gap == null ? null : String(doc.data.gap),
  };
}

function serializeCompetition(doc: RawDoc): F1CompetitionRecord {
  return {
    id: doc.id,
    external_id: asStr(doc.data.external_id),
    name: asStr(doc.data.name),
  };
}

function serializeCircuit(doc: RawDoc): F1CircuitRecord {
  return {
    id: doc.id,
    external_id: asStr(doc.data.external_id),
    name: asStr(doc.data.name),
    country: asStr(doc.data.country),
  };
}

function sortByName<T extends { name: string | null }>(rows: T[]): T[] {
  return [...rows].sort((left, right) => (left.name ?? '').localeCompare(right.name ?? ''));
}

function sortByPosition<T extends { position: number | null }>(rows: T[]): T[] {
  return [...rows].sort((left, right) => {
    const lp = left.position ?? Number.MAX_SAFE_INTEGER;
    const rp = right.position ?? Number.MAX_SAFE_INTEGER;
    return lp - rp;
  });
}

function sortByRaceDateDesc(rows: F1RaceRecord[]): F1RaceRecord[] {
  return [...rows].sort((left, right) => (right.race_date ?? '').localeCompare(left.race_date ?? ''));
}

function latestUpdatedAt(docs: RawDoc[]): string | null {
  let latest: string | null = null;
  for (const doc of docs) {
    const value = updatedAtOf(doc.data);
    if (value && (!latest || value > latest)) latest = value;
  }
  return latest;
}

export async function listF1Drivers(): Promise<{ data: F1DriverRecord[]; updatedAt: string | null }> {
  const docs = await fetchAll('f1_drivers');
  return { data: sortByName(docs.map(serializeDriver)), updatedAt: latestUpdatedAt(docs) };
}

export async function getF1DriverById(id: string): Promise<{ data: F1DriverRecord; updatedAt: string | null }> {
  const doc = await resolveDoc('f1_drivers', id);
  if (!doc) {
    throw new ApiError('RESOURCE_NOT_FOUND', `Driver "${id}" was not found.`);
  }
  return { data: serializeDriver(doc), updatedAt: updatedAtOf(doc.data) };
}

export async function listF1Teams(): Promise<{ data: F1TeamRecord[]; updatedAt: string | null }> {
  const docs = await fetchAll('f1_teams');
  return { data: sortByName(docs.map(serializeTeam)), updatedAt: latestUpdatedAt(docs) };
}

export async function listF1Races(season?: number): Promise<{ data: F1RaceRecord[]; updatedAt: string | null }> {
  const docs =
    season != null ? await fetchWhereEq('f1_races', 'season', season) : await fetchAll('f1_races');
  return { data: sortByRaceDateDesc(docs.map(serializeRace)), updatedAt: latestUpdatedAt(docs) };
}

export async function listF1LiveRaces(): Promise<{ data: F1RaceRecord[]; updatedAt: string | null }> {
  const docs = await fetchAll('f1_races');
  const live = docs.filter((doc) => LIVE_STATUSES.includes(String(doc.data.status ?? '')));
  return { data: sortByRaceDateDesc(live.map(serializeRace)), updatedAt: latestUpdatedAt(live) };
}

export async function listF1DriverRankings(
  season?: number,
): Promise<{ data: F1DriverRankingRecord[]; updatedAt: string | null }> {
  const docs =
    season != null ? await fetchWhereEq('f1_rankings', 'season', season) : await fetchAll('f1_rankings');
  return {
    data: sortByPosition(docs.map(serializeDriverRanking)),
    updatedAt: latestUpdatedAt(docs),
  };
}

export async function listF1TeamRankings(
  season?: number,
): Promise<{ data: F1TeamRankingRecord[]; updatedAt: string | null }> {
  const docs =
    season != null
      ? await fetchWhereEq('f1_team_rankings', 'season', season)
      : await fetchAll('f1_team_rankings');
  return {
    data: sortByPosition(docs.map(serializeTeamRanking)),
    updatedAt: latestUpdatedAt(docs),
  };
}

export async function listF1RaceRankings(
  raceId?: string,
): Promise<{ data: F1RaceRankingRecord[]; updatedAt: string | null }> {
  if (!raceId) {
    const docs = await fetchAll('f1_race_rankings');
    return {
      data: sortByPosition(docs.map(serializeRaceRanking)),
      updatedAt: latestUpdatedAt(docs),
    };
  }

  const race = await resolveDoc('f1_races', raceId);
  if (!race) {
    return { data: [], updatedAt: null };
  }

  const docs = await fetchWhereEq('f1_race_rankings', 'race_id', race.id);
  return {
    data: sortByPosition(docs.map(serializeRaceRanking)),
    updatedAt: latestUpdatedAt(docs),
  };
}

export async function listF1Competitions(): Promise<{
  data: F1CompetitionRecord[];
  updatedAt: string | null;
}> {
  const docs = await fetchAll('f1_competitions');
  return { data: sortByName(docs.map(serializeCompetition)), updatedAt: latestUpdatedAt(docs) };
}

export async function listF1Circuits(): Promise<{ data: F1CircuitRecord[]; updatedAt: string | null }> {
  const docs = await fetchAll('f1_circuits');
  return { data: sortByName(docs.map(serializeCircuit)), updatedAt: latestUpdatedAt(docs) };
}
