import { asNum, asStr } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type {
  Formula1FastestLapItem,
  Formula1PitstopItem,
  Formula1StartingGridItem,
} from '../schemas/session-detail.schema';

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

function sessionDriverRef(driverMap: Map<string, RawDoc> | undefined, driverId: string) {
  const driver = driverMap?.get(driverId);
  return {
    id: driverId,
    name: asStr(driver?.data.name) ?? '',
    abbr: asStr(driver?.data.abbr),
    number: asNum(driver?.data.number),
    image: asStr(driver?.data.image),
  };
}

function raceIdFromDoc(doc: RawDoc): string {
  return asStr(doc.data.race_id) ?? '';
}

function driverIdFromDoc(doc: RawDoc): string {
  return asStr(doc.data.driver_id) ?? '';
}

function teamIdForDriver(driverMap: Map<string, RawDoc> | undefined, driverId: string) {
  return asStr(driverMap?.get(driverId)?.data.team_id);
}

export function mapF1StartingGrid(
  doc: RawDoc,
  driverMap?: Map<string, RawDoc>,
  teamMap?: Map<string, RawDoc>,
): Formula1StartingGridItem {
  const driverId = driverIdFromDoc(doc);
  return {
    race: { id: raceIdFromDoc(doc) },
    driver: sessionDriverRef(driverMap, driverId),
    team: teamRef(teamMap, teamIdForDriver(driverMap, driverId)),
    position: asNum(doc.data.position) ?? 0,
    time: asStr(doc.data.time),
  };
}

export function mapF1FastestLap(
  doc: RawDoc,
  driverMap?: Map<string, RawDoc>,
  teamMap?: Map<string, RawDoc>,
): Formula1FastestLapItem {
  const driverId = driverIdFromDoc(doc);
  return {
    race: { id: raceIdFromDoc(doc) },
    driver: sessionDriverRef(driverMap, driverId),
    team: teamRef(teamMap, teamIdForDriver(driverMap, driverId)),
    position: asNum(doc.data.position) ?? 0,
    lap: asNum(doc.data.lap) ?? 0,
    time: asStr(doc.data.time),
    avg_speed: asStr(doc.data.avg_speed),
  };
}

export function mapF1Pitstop(
  doc: RawDoc,
  driverMap?: Map<string, RawDoc>,
  teamMap?: Map<string, RawDoc>,
): Formula1PitstopItem {
  const driverId = driverIdFromDoc(doc);
  return {
    race: { id: raceIdFromDoc(doc) },
    driver: sessionDriverRef(driverMap, driverId),
    team: teamRef(teamMap, teamIdForDriver(driverMap, driverId)),
    stops: asNum(doc.data.stops) ?? 0,
    lap: asNum(doc.data.lap) ?? 0,
    time: asStr(doc.data.time),
    total_time: asStr(doc.data.total_time),
  };
}
