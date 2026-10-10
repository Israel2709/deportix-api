import { asNum, asStr } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { Formula1EntryItem } from '../schemas/entry.schema';

function asRole(value: unknown): Formula1EntryItem['role'] {
  return value === 'reserve-driver' ? 'reserve-driver' : 'race-driver';
}

export function mapF1Entry(
  doc: RawDoc,
  driverDoc?: RawDoc,
  teamDoc?: RawDoc,
): Formula1EntryItem {
  const driverId = asStr(doc.data.driver_id) ?? '';
  const teamId = asStr(doc.data.team_id) ?? '';

  return {
    id: doc.id,
    competitionId: asStr(doc.data.competition_id) ?? '',
    season: asNum(doc.data.season) ?? 0,
    driver: {
      id: driverId,
      name: asStr(driverDoc?.data.name) ?? '',
      abbr: asStr(driverDoc?.data.abbr),
      number: asNum(driverDoc?.data.number),
      image: asStr(driverDoc?.data.image),
    },
    team: {
      id: teamId,
      name: asStr(teamDoc?.data.name) ?? '',
      logo: asStr(teamDoc?.data.logo),
    },
    number: asNum(doc.data.number),
    role: asRole(doc.data.role),
    active: doc.data.active === false ? false : true,
    createdAt: asStr(doc.data.created_at),
    updatedAt: asStr(doc.data.updated_at),
  };
}
