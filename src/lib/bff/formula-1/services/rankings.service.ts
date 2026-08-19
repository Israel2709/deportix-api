import {
  buildDriverMap,
  buildTeamMap,
  listF1DriverRankingsBySeason,
  listF1Drivers,
  listF1RaceRankingsByRace,
  listF1TeamRankingsBySeason,
  listF1Teams,
  resolveF1Driver,
  resolveF1Race,
  resolveF1Team,
} from '@/lib/firebase/repositories/formula-1.repository';
import {
  mapF1DriverRanking,
  mapF1RaceRanking,
  mapF1TeamRanking,
} from '../mappers/ranking.mapper';
import type {
  Formula1DriverRankingsQuery,
  Formula1RaceRankingsQuery,
  Formula1TeamRankingsQuery,
} from '../query-params';
import { requireFormula1Param, requireFormula1Season } from '../query-params';

async function loadParticipantMaps() {
  const [drivers, teams] = await Promise.all([listF1Drivers(), listF1Teams()]);
  return {
    driverMap: buildDriverMap(drivers),
    teamMap: buildTeamMap(teams),
  };
}

export async function fetchFormula1DriverRankings(query: Formula1DriverRankingsQuery) {
  const season = requireFormula1Season(query.season);
  const [docs, maps] = await Promise.all([
    listF1DriverRankingsBySeason(season),
    loadParticipantMaps(),
  ]);

  let filtered = docs;

  if (query.driver) {
    const driver = await resolveF1Driver(query.driver);
    if (!driver) return [];
    filtered = filtered.filter((doc) => doc.data.driver_id === driver.id);
  }

  if (query.team) {
    const team = await resolveF1Team(query.team);
    if (!team) return [];
    filtered = filtered.filter((doc) => {
      const driver = maps.driverMap.get(String(doc.data.driver_id ?? ''));
      return driver?.data.team_id === team.id;
    });
  }

  return filtered
    .map((doc) => mapF1DriverRanking(doc, maps.driverMap, maps.teamMap))
    .sort((a, b) => a.position - b.position);
}

export async function fetchFormula1TeamRankings(query: Formula1TeamRankingsQuery) {
  const season = requireFormula1Season(query.season);
  const [docs, teams] = await Promise.all([
    listF1TeamRankingsBySeason(season),
    listF1Teams(),
  ]);
  const teamMap = buildTeamMap(teams);

  let filtered = docs;
  if (query.team) {
    const team = await resolveF1Team(query.team);
    if (!team) return [];
    filtered = filtered.filter((doc) => doc.data.team_id === team.id);
  }

  return filtered
    .map((doc) => mapF1TeamRanking(doc, teamMap))
    .sort((a, b) => a.position - b.position);
}

export async function fetchFormula1RaceRankings(query: Formula1RaceRankingsQuery) {
  const raceIdOrExternal = requireFormula1Param(query.race, 'race');
  const race = await resolveF1Race(raceIdOrExternal);
  if (!race) return [];

  const [docs, maps] = await Promise.all([
    listF1RaceRankingsByRace(race.id),
    loadParticipantMaps(),
  ]);

  return docs
    .map((doc) => mapF1RaceRanking(doc, maps.driverMap, maps.teamMap))
    .sort((a, b) => a.position - b.position);
}
