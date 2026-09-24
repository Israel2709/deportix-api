import { asNum, asStr } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { Formula1CircuitItem } from '../schemas/circuit.schema';
import type { Formula1CompetitionItem } from '../schemas/competition.schema';
import type { Formula1DriverItem } from '../schemas/driver.schema';
import type { Formula1TeamItem } from '../schemas/team.schema';

/** Country may be a string or a nested `{ name }` object from older/provider-shaped docs. */
export function mapF1CountryField(value: unknown): string | null {
  const direct = asStr(value);
  if (direct) return direct;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return asStr((value as Record<string, unknown>).name);
  }
  return null;
}

export function mapF1CompetitionLocation(
  value: unknown,
): { country?: string | null; city?: string | null } | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    const country = asStr(value);
    return country ? { country, city: null } : null;
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    const raw = value as Record<string, unknown>;
    const country = mapF1CountryField(raw.country) ?? asStr(raw.country);
    const city = asStr(raw.city);
    if (country == null && city == null) return null;
    return { country, city };
  }
  return null;
}

export function mapF1Competition(doc: RawDoc): Formula1CompetitionItem {
  return {
    id: doc.id,
    name: asStr(doc.data.name) ?? '',
    location: mapF1CompetitionLocation(doc.data.location),
  };
}

export function mapF1Circuit(doc: RawDoc): Formula1CircuitItem {
  return {
    id: doc.id,
    name: asStr(doc.data.name) ?? '',
    image: asStr(doc.data.image),
    country: mapF1CountryField(doc.data.country),
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
    abbr: asStr(doc.data.abbr),
    number: asNum(doc.data.number),
    image: asStr(doc.data.image),
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
