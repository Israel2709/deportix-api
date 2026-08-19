import { asStr } from '@/lib/api/serializers';
import { fetchAll, fetchWhereEq, resolveDoc, type RawDoc } from '@/lib/firebase/repositories/helpers';
import { listTimezones } from '@/lib/firebase/repositories/timezones.repository';
import {
  mapFormulaOneCircuit,
  mapFormulaOneCompetition,
  mapFormulaOneDriver,
  mapFormulaOneTeam,
} from '../mappers';
import { loadFormulaOneLookupMaps, teamForDriver } from '../lookup-maps';

function matchesSearch(name: string | null | undefined, search: string): boolean {
  if (!name) return false;
  return name.toLowerCase().includes(search.toLowerCase());
}

function filterById(docs: RawDoc[], id: string | undefined): RawDoc[] {
  if (!id) return docs;
  return docs.filter((doc) => doc.id === id || asStr(doc.data.external_id) === id);
}

function filterBySearch(docs: RawDoc[], search: string | undefined): RawDoc[] {
  if (!search) return docs;
  return docs.filter((doc) => matchesSearch(asStr(doc.data.name), search));
}

export async function fetchFormulaOneTimezones(): Promise<string[]> {
  return listTimezones();
}

export async function fetchFormulaOneSeasons(): Promise<number[]> {
  const races = await fetchAll('f1_races');
  const seasons = new Set<number>();
  for (const race of races) {
    if (typeof race.data.season === 'number') seasons.add(race.data.season);
  }
  return [...seasons].sort((a, b) => b - a);
}

export async function fetchFormulaOneTeams(query: { id?: string; search?: string }) {
  let docs = await fetchAll('f1_teams');
  docs = filterById(docs, query.id);
  docs = filterBySearch(docs, query.search);
  return docs.map(mapFormulaOneTeam);
}

export async function fetchFormulaOneCircuits(query: { id?: string; search?: string }) {
  let docs = await fetchAll('f1_circuits');
  docs = filterById(docs, query.id);
  docs = filterBySearch(docs, query.search);
  return docs.map(mapFormulaOneCircuit);
}

export async function fetchFormulaOneCompetitions(query: { id?: string; search?: string }) {
  let docs = await fetchAll('f1_competitions');
  docs = filterById(docs, query.id);
  docs = filterBySearch(docs, query.search);
  return docs.map(mapFormulaOneCompetition);
}

export async function fetchFormulaOneDrivers(query: {
  id?: string;
  team?: string;
  search?: string;
}) {
  const maps = await loadFormulaOneLookupMaps();
  let docs = [...maps.drivers.values()];
  docs = [...new Map(docs.map((doc) => [doc.id, doc])).values()];

  if (query.team) {
    const teamDoc = maps.teams.get(query.team) ?? (await resolveDoc('f1_teams', query.team));
    const teamId = teamDoc?.id;
    docs = teamId ? docs.filter((doc) => asStr(doc.data.team_id) === teamId) : [];
  }

  docs = filterById(docs, query.id);
  docs = filterBySearch(docs, query.search);

  return docs.map((doc) => mapFormulaOneDriver(doc, teamForDriver(doc, maps.teams)));
}
