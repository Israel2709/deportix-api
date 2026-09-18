import {
  buildTeamMap,
  listF1Circuits,
  listF1Competitions,
  listF1Drivers,
  listF1SeasonYears,
  listF1Teams,
  resolveF1Circuit,
  resolveF1Competition,
  resolveF1Driver,
  resolveF1Team,
} from '@/lib/firebase/repositories/formula-1.repository';
import {
  mapF1Circuit,
  mapF1Competition,
  mapF1Driver,
  mapF1Team,
  nameMatches,
} from '../mappers/catalog.mapper';
import type {
  Formula1CircuitQuery,
  Formula1DriverQuery,
  Formula1IdNameQuery,
} from '../query-params';

export async function fetchFormula1Seasons(): Promise<number[]> {
  return listF1SeasonYears();
}

export async function fetchFormula1Competitions(query: Formula1IdNameQuery) {
  if (query.id) {
    const doc = await resolveF1Competition(query.id);
    return doc ? [mapF1Competition(doc)] : [];
  }

  let docs = await listF1Competitions();
  if (query.name) docs = docs.filter((doc) => nameMatches(String(doc.data.name ?? ''), query.name!));
  if (query.search) {
    docs = docs.filter((doc) => nameMatches(String(doc.data.name ?? ''), query.search!));
  }
  return docs
    .map(mapF1Competition)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchFormula1Circuits(query: Formula1CircuitQuery) {
  if (query.id) {
    const doc = await resolveF1Circuit(query.id);
    return doc ? [mapF1Circuit(doc)] : [];
  }

  let docs = await listF1Circuits();
  if (query.name) docs = docs.filter((doc) => nameMatches(String(doc.data.name ?? ''), query.name!));
  if (query.country) {
    docs = docs.filter((doc) => nameMatches(String(doc.data.country ?? ''), query.country!));
  }
  if (query.search) {
    docs = docs.filter((doc) => {
      const haystack = `${doc.data.name ?? ''} ${doc.data.country ?? ''}`;
      return nameMatches(haystack, query.search!);
    });
  }
  return docs.map(mapF1Circuit).sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchFormula1Teams(query: Formula1IdNameQuery) {
  if (query.id) {
    const doc = await resolveF1Team(query.id);
    return doc ? [mapF1Team(doc)] : [];
  }

  let docs = await listF1Teams();
  if (query.name) docs = docs.filter((doc) => nameMatches(String(doc.data.name ?? ''), query.name!));
  if (query.search) {
    docs = docs.filter((doc) => nameMatches(String(doc.data.name ?? ''), query.search!));
  }
  return docs.map(mapF1Team).sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchFormula1Drivers(query: Formula1DriverQuery) {
  if (query.id) {
    const [doc, teams] = await Promise.all([resolveF1Driver(query.id), listF1Teams()]);
    if (!doc) return [];
    return [mapF1Driver(doc, buildTeamMap(teams))];
  }

  const [docs, teams] = await Promise.all([listF1Drivers(), listF1Teams()]);
  const teamMap = buildTeamMap(teams);
  let filtered = docs;

  if (query.name) {
    filtered = filtered.filter((doc) => nameMatches(String(doc.data.name ?? ''), query.name!));
  }
  if (query.search) {
    filtered = filtered.filter((doc) => nameMatches(String(doc.data.name ?? ''), query.search!));
  }
  if (query.team) {
    const team = await resolveF1Team(query.team);
    if (!team) return [];
    filtered = filtered.filter((doc) => doc.data.team_id === team.id);
  }

  return filtered
    .map((doc) => mapF1Driver(doc, teamMap))
    .sort((a, b) => a.name.localeCompare(b.name));
}
