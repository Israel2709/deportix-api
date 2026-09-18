import { asNum, asStr } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { Formula1CircuitItem } from '../schemas/circuit.schema';
import type { Formula1CompetitionItem } from '../schemas/competition.schema';
import type { Formula1DriverItem } from '../schemas/driver.schema';
import type { Formula1TeamItem } from '../schemas/team.schema';

export function mapF1Competition(doc: RawDoc): Formula1CompetitionItem {
  return {
    id: doc.id,
    name: asStr(doc.data.name) ?? '',
  };
}

export function mapF1Circuit(doc: RawDoc): Formula1CircuitItem {
  return {
    id: doc.id,
    name: asStr(doc.data.name) ?? '',
    image: asStr(doc.data.image),
    country: asStr(doc.data.country),
  };
}

export function mapF1Team(doc: RawDoc): Formula1TeamItem {
  return {
    id: doc.id,
    name: asStr(doc.data.name) ?? '',
    logo: asStr(doc.data.logo),
  };
}

export function mapF1Driver(doc: RawDoc, teamMap?: Map<string, RawDoc>): Formula1DriverItem {
  const teamId = asStr(doc.data.team_id);
  const teamDoc = teamId && teamMap ? teamMap.get(teamId) : undefined;
  return {
    id: doc.id,
    name: asStr(doc.data.name) ?? '',
    number: asNum(doc.data.number),
    team: teamDoc
      ? {
          id: teamDoc.id,
          name: asStr(teamDoc.data.name) ?? '',
          logo: asStr(teamDoc.data.logo),
        }
      : teamId
        ? { id: teamId, name: '', logo: null }
        : null,
  };
}

export function nameMatches(value: string | null | undefined, filter: string): boolean {
  if (!value) return false;
  return value.toLowerCase().includes(filter.toLowerCase());
}
