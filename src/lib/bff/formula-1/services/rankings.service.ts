import { asStr } from '@/lib/api/serializers';
import { fetchWhereEq, resolveDoc, type RawDoc } from '@/lib/firebase/repositories/helpers';
import {
  mapFormulaOneDriverRanking,
  mapFormulaOneRaceRanking,
  mapFormulaOneTeamRanking,
} from '../mappers';
import { loadFormulaOneLookupMaps, teamForDriver } from '../lookup-maps';

function filterById(docs: RawDoc[], id: string | undefined): RawDoc[] {
  if (!id) return docs;
  return docs.filter((doc) => doc.id === id || asStr(doc.data.external_id) === id);
}

function sortByPosition(docs: RawDoc[]): RawDoc[] {
  return [...docs].sort((a, b) => {
    const pa = typeof a.data.position === 'number' ? a.data.position : Number.MAX_SAFE_INTEGER;
    const pb = typeof b.data.position === 'number' ? b.data.position : Number.MAX_SAFE_INTEGER;
    return pa - pb;
  });
}

export async function fetchFormulaOneDriverRankings(query: {
  season: number;
  driver?: string;
  team?: string;
  id?: string;
}) {
  const maps = await loadFormulaOneLookupMaps();
  let docs = await fetchWhereEq('f1_rankings', 'season', query.season);

  if (query.driver) {
    const driverDoc =
      maps.drivers.get(query.driver) ?? (await resolveDoc('f1_drivers', query.driver));
    const driverId = driverDoc?.id;
    docs = driverId ? docs.filter((doc) => asStr(doc.data.driver_id) === driverId) : [];
  }

  if (query.team) {
    const teamDoc = maps.teams.get(query.team) ?? (await resolveDoc('f1_teams', query.team));
    const teamId = teamDoc?.id;
    if (!teamId) return [];
    docs = docs.filter((doc) => {
      const driverId = asStr(doc.data.driver_id);
      const driverDoc = driverId ? maps.drivers.get(driverId) : null;
      return driverDoc ? asStr(driverDoc.data.team_id) === teamId : false;
    });
  }

  docs = filterById(docs, query.id);
  docs = sortByPosition(docs);

  return docs.map((doc) => {
    const driverId = asStr(doc.data.driver_id);
    const driverDoc = driverId ? maps.drivers.get(driverId) : null;
    const teamDoc = teamForDriver(driverDoc, maps.teams);
    return mapFormulaOneDriverRanking(doc, driverDoc, teamDoc);
  });
}

export async function fetchFormulaOneTeamRankings(query: {
  season: number;
  team?: string;
  id?: string;
}) {
  const maps = await loadFormulaOneLookupMaps();
  let docs = await fetchWhereEq('f1_team_rankings', 'season', query.season);

  if (query.team) {
    const teamDoc = maps.teams.get(query.team) ?? (await resolveDoc('f1_teams', query.team));
    const teamId = teamDoc?.id;
    docs = teamId ? docs.filter((doc) => asStr(doc.data.team_id) === teamId) : [];
  }

  docs = filterById(docs, query.id);
  docs = sortByPosition(docs);

  return docs.map((doc) => {
    const teamId = asStr(doc.data.team_id);
    const teamDoc = teamId ? maps.teams.get(teamId) : null;
    return mapFormulaOneTeamRanking(doc, teamDoc);
  });
}

export async function fetchFormulaOneRaceRankings(query: {
  race: string;
  driver?: string;
  team?: string;
  id?: string;
}) {
  const maps = await loadFormulaOneLookupMaps();
  const raceDoc = await resolveDoc('f1_races', query.race);
  if (!raceDoc) return [];

  let docs = await fetchWhereEq('f1_race_rankings', 'race_id', raceDoc.id);

  if (query.driver) {
    const driverDoc =
      maps.drivers.get(query.driver) ?? (await resolveDoc('f1_drivers', query.driver));
    const driverId = driverDoc?.id;
    docs = driverId ? docs.filter((doc) => asStr(doc.data.driver_id) === driverId) : [];
  }

  if (query.team) {
    const teamDoc = maps.teams.get(query.team) ?? (await resolveDoc('f1_teams', query.team));
    const teamId = teamDoc?.id;
    if (!teamId) return [];
    docs = docs.filter((doc) => {
      const driverId = asStr(doc.data.driver_id);
      const driverDoc = driverId ? maps.drivers.get(driverId) : null;
      return driverDoc ? asStr(driverDoc.data.team_id) === teamId : false;
    });
  }

  docs = filterById(docs, query.id);
  docs = sortByPosition(docs);

  return docs.map((doc) => {
    const driverId = asStr(doc.data.driver_id);
    const driverDoc = driverId ? maps.drivers.get(driverId) : null;
    const teamDoc = teamForDriver(driverDoc, maps.teams);
    return mapFormulaOneRaceRanking(doc, driverDoc, teamDoc);
  });
}
