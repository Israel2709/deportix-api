import { asStr } from '@/lib/api/serializers';
import { fetchAll, type RawDoc } from '@/lib/firebase/repositories/helpers';

export interface FormulaOneLookupMaps {
  teams: Map<string, RawDoc>;
  drivers: Map<string, RawDoc>;
  circuits: Map<string, RawDoc>;
  competitions: Map<string, RawDoc>;
}

export async function loadFormulaOneLookupMaps(): Promise<FormulaOneLookupMaps> {
  const [teams, drivers, circuits, competitions] = await Promise.all([
    fetchAll('f1_teams'),
    fetchAll('f1_drivers'),
    fetchAll('f1_circuits'),
    fetchAll('f1_competitions'),
  ]);
  return {
    teams: indexById(teams),
    drivers: indexById(drivers),
    circuits: indexById(circuits),
    competitions: indexById(competitions),
  };
}

function indexById(docs: RawDoc[]): Map<string, RawDoc> {
  const map = new Map<string, RawDoc>();
  for (const doc of docs) {
    map.set(doc.id, doc);
    const externalId = asStr(doc.data.external_id);
    if (externalId) map.set(externalId, doc);
  }
  return map;
}

export function teamForDriver(
  driverDoc: RawDoc | null | undefined,
  teams: Map<string, RawDoc>,
): RawDoc | null {
  if (!driverDoc) return null;
  const teamId = asStr(driverDoc.data.team_id);
  if (!teamId) return null;
  return teams.get(teamId) ?? null;
}
