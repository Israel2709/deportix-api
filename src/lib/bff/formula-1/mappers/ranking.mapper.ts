import { asNum, asStr } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type {
  Formula1DriverRankingItem,
  Formula1RaceRankingItem,
  Formula1TeamRankingItem,
} from '../schemas/ranking.schema';

function teamRef(teamMap: Map<string, RawDoc> | undefined, teamId: string | null) {
  if (!teamId) return null;
  const team = teamMap?.get(teamId);
  if (!team) return { id: teamId, name: '', logo: null };
  return {
    id: team.id,
    name: asStr(team.data.name) ?? '',
    logo: asStr(team.data.logo),
  };
}

function driverRef(driverMap: Map<string, RawDoc> | undefined, driverId: string) {
  const driver = driverMap?.get(driverId);
  return {
    id: driverId,
    name: asStr(driver?.data.name) ?? '',
    number: asNum(driver?.data.number),
  };
}

export function mapF1DriverRanking(
  doc: RawDoc,
  driverMap?: Map<string, RawDoc>,
  teamMap?: Map<string, RawDoc>,
): Formula1DriverRankingItem {
  const driverId = asStr(doc.data.driver_id) ?? '';
  const driver = driverMap?.get(driverId);
  const teamId = asStr(driver?.data.team_id);
  return {
    position: asNum(doc.data.position) ?? 0,
    points: asNum(doc.data.points),
    wins: asNum(doc.data.wins),
    behind: asNum(doc.data.behind),
    season: asNum(doc.data.season) ?? 0,
    driver: driverRef(driverMap, driverId),
    team: teamRef(teamMap, teamId),
  };
}

export function mapF1TeamRanking(
  doc: RawDoc,
  teamMap?: Map<string, RawDoc>,
): Formula1TeamRankingItem {
  const teamId = asStr(doc.data.team_id) ?? '';
  return {
    position: asNum(doc.data.position) ?? 0,
    points: asNum(doc.data.points),
    season: asNum(doc.data.season) ?? 0,
    team: teamRef(teamMap, teamId) ?? { id: teamId, name: '', logo: null },
  };
}

export function mapF1RaceRanking(
  doc: RawDoc,
  driverMap?: Map<string, RawDoc>,
  teamMap?: Map<string, RawDoc>,
): Formula1RaceRankingItem {
  const driverId = asStr(doc.data.driver_id) ?? '';
  const driver = driverMap?.get(driverId);
  const teamId = asStr(driver?.data.team_id);
  return {
    position: asNum(doc.data.position) ?? 0,
    time: asStr(doc.data.time),
    laps: asNum(doc.data.laps),
    grid: asStr(doc.data.grid),
    pits: asNum(doc.data.pits),
    gap: asStr(doc.data.gap),
    driver: driverRef(driverMap, driverId),
    team: teamRef(teamMap, teamId),
  };
}
