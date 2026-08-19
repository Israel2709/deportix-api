import { asNum, asStr } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { Formula1RaceItem } from '../schemas/race.schema';

/** Placeholder when a race references a missing competition/circuit document. */
const MISSING_REF_ID = '00000000-0000-4000-8000-000000000000';

export function mapF1Race(
  doc: RawDoc,
  competitionMap?: Map<string, RawDoc>,
  circuitMap?: Map<string, RawDoc>,
): Formula1RaceItem {
  const competitionId = asStr(doc.data.competition_id) ?? MISSING_REF_ID;
  const circuitId = asStr(doc.data.circuit_id) ?? MISSING_REF_ID;
  const competition = competitionMap?.get(competitionId);
  const circuit = circuitMap?.get(circuitId);

  return {
    id: doc.id,
    competition: {
      id: competitionId,
      name: asStr(competition?.data.name) ?? '',
    },
    circuit: {
      id: circuitId,
      name: asStr(circuit?.data.name) ?? '',
      image: asStr(circuit?.data.image),
      country: asStr(circuit?.data.country),
    },
    season: asNum(doc.data.season) ?? 0,
    type: asStr(doc.data.type) ?? '',
    laps: {
      current: asNum(doc.data.laps_current),
      total: asNum(doc.data.laps_total),
    },
    distance: asStr(doc.data.distance),
    timezone: asStr(doc.data.timezone) ?? 'utc',
    date: asStr(doc.data.race_date) ?? asStr(doc.data.date) ?? '',
    status: asStr(doc.data.status) ?? '',
  };
}

export function f1RaceDate(raw: Record<string, unknown>): string | null {
  return asStr(raw.race_date) ?? asStr(raw.date);
}
