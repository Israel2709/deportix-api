import {
  buildCircuitMap,
  buildCompetitionMap,
  listF1Circuits,
  listF1Competitions,
  listF1RacesBySeason,
  resolveF1Competition,
  resolveF1Race,
} from '@/lib/firebase/repositories/formula-1.repository';
import { f1RaceDate, mapF1Race } from '../mappers/race.mapper';
import type { Formula1RacesQuery } from '../query-params';
import { requireFormula1Season } from '../query-params';

async function loadRaceContextMaps() {
  const [competitions, circuits] = await Promise.all([listF1Competitions(), listF1Circuits()]);
  return {
    competitionMap: buildCompetitionMap(competitions),
    circuitMap: buildCircuitMap(circuits),
  };
}

export async function fetchFormula1Races(query: Formula1RacesQuery) {
  if (query.id) {
    const [doc, maps] = await Promise.all([resolveF1Race(query.id), loadRaceContextMaps()]);
    if (!doc) return [];
    return [mapF1Race(doc, maps.competitionMap, maps.circuitMap)];
  }

  const season = requireFormula1Season(query.season);
  const [docs, maps] = await Promise.all([listF1RacesBySeason(season), loadRaceContextMaps()]);

  let filtered = docs;

  if (query.competition) {
    const competition = await resolveF1Competition(query.competition);
    if (!competition) return [];
    filtered = filtered.filter((doc) => doc.data.competition_id === competition.id);
  }

  if (query.type) {
    filtered = filtered.filter(
      (doc) => String(doc.data.type ?? '').toLowerCase() === query.type!.toLowerCase(),
    );
  }

  if (query.date) {
    filtered = filtered.filter((doc) => (f1RaceDate(doc.data) ?? '').startsWith(query.date!));
  }

  return filtered
    .sort((a, b) => (f1RaceDate(a.data) ?? '').localeCompare(f1RaceDate(b.data) ?? ''))
    .map((doc) => mapF1Race(doc, maps.competitionMap, maps.circuitMap));
}
