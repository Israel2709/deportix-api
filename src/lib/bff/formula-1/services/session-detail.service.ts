import {
  buildDriverMap,
  buildTeamMap,
  listF1Drivers,
  listF1FastestLapsByRace,
  listF1PitstopsByRace,
  listF1StartingGridsByRace,
  listF1Teams,
  resolveF1Race,
} from '@/lib/firebase/repositories/formula-1.repository';
import {
  mapF1FastestLap,
  mapF1Pitstop,
  mapF1StartingGrid,
} from '../mappers/session-detail.mapper';
import type {
  Formula1FastestLapsQuery,
  Formula1PitstopsQuery,
  Formula1StartingGridQuery,
} from '../query-params';
import { requireFormula1Param } from '../query-params';

async function loadParticipantMaps() {
  const [drivers, teams] = await Promise.all([listF1Drivers(), listF1Teams()]);
  return {
    driverMap: buildDriverMap(drivers),
    teamMap: buildTeamMap(teams),
  };
}

export async function fetchFormula1StartingGrid(query: Formula1StartingGridQuery) {
  const raceIdOrExternal = requireFormula1Param(query.race, 'race');
  const race = await resolveF1Race(raceIdOrExternal);
  if (!race) return [];

  const [docs, maps] = await Promise.all([
    listF1StartingGridsByRace(race.id),
    loadParticipantMaps(),
  ]);

  return docs
    .map((doc) => mapF1StartingGrid(doc, maps.driverMap, maps.teamMap))
    .sort((a, b) => a.position - b.position);
}

export async function fetchFormula1FastestLaps(query: Formula1FastestLapsQuery) {
  const raceIdOrExternal = requireFormula1Param(query.race, 'race');
  const race = await resolveF1Race(raceIdOrExternal);
  if (!race) return [];

  const [docs, maps] = await Promise.all([
    listF1FastestLapsByRace(race.id),
    loadParticipantMaps(),
  ]);

  return docs
    .map((doc) => mapF1FastestLap(doc, maps.driverMap, maps.teamMap))
    .sort((a, b) => a.position - b.position);
}

export async function fetchFormula1Pitstops(query: Formula1PitstopsQuery) {
  const raceIdOrExternal = requireFormula1Param(query.race, 'race');
  const race = await resolveF1Race(raceIdOrExternal);
  if (!race) return [];

  const [docs, maps] = await Promise.all([
    listF1PitstopsByRace(race.id),
    loadParticipantMaps(),
  ]);

  return docs
    .map((doc) => mapF1Pitstop(doc, maps.driverMap, maps.teamMap))
    .sort((a, b) => a.lap - b.lap || a.stops - b.stops);
}
