import { Timestamp } from 'firebase-admin/firestore';
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

function asCalendarDate(value: unknown): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString().slice(0, 10);
  if (typeof value === 'string' && value.length > 0) return value.slice(0, 10);
  if (value && typeof value === 'object' && 'toDate' in value) {
    const toDate = (value as { toDate?: unknown }).toDate;
    if (typeof toDate === 'function') {
      const date = toDate.call(value) as Date;
      if (date instanceof Date && !Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
      }
    }
  }
  return null;
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function mapF1Competition(doc: RawDoc): Formula1CompetitionItem {
  const item: Formula1CompetitionItem = {
    id: doc.id,
    name: asStr(doc.data.name) ?? '',
    location: mapF1CompetitionLocation(doc.data.location),
  };

  const slug = asStr(doc.data.slug);
  if (slug) item.slug = slug;
  const shortName = asStr(doc.data.shortName);
  if (shortName) item.shortName = shortName;
  const officialName = asStr(doc.data.officialName);
  if (officialName) item.officialName = officialName;
  const seasonId = asStr(doc.data.seasonId);
  if (seasonId) item.seasonId = seasonId;
  const championshipType = asStr(doc.data.championshipType);
  if (
    championshipType === 'world-championship' ||
    championshipType === 'national-championship' ||
    championshipType === 'regional-championship' ||
    championshipType === 'series'
  ) {
    item.championshipType = championshipType;
  }
  const status = asStr(doc.data.status);
  if (
    status === 'scheduled' ||
    status === 'active' ||
    status === 'completed' ||
    status === 'cancelled'
  ) {
    item.status = status;
  }
  const startDate = asCalendarDate(doc.data.startDate);
  if (startDate) item.startDate = startDate;
  const endDate = asCalendarDate(doc.data.endDate);
  if (endDate) item.endDate = endDate;
  const rounds = asNum(doc.data.rounds);
  if (rounds != null) item.rounds = rounds;

  const classifications = asObject(doc.data.classifications);
  if (classifications) {
    item.classifications = {
      drivers: classifications.drivers !== false,
      constructors: classifications.constructors !== false,
    };
  }

  const sprint = asObject(doc.data.sprint);
  if (sprint) {
    const sprintRounds = asNum(sprint.rounds);
    item.sprint = {
      enabled: sprint.enabled === true,
      ...(sprintRounds != null ? { rounds: sprintRounds } : {}),
    };
  }

  const grid = asObject(doc.data.grid);
  if (grid) {
    const maxTeams = asNum(grid.maxTeams);
    const driversPerTeam = asNum(grid.driversPerTeam);
    item.grid = {
      ...(maxTeams != null ? { maxTeams } : {}),
      ...(driversPerTeam != null ? { driversPerTeam } : {}),
    };
  }

  const pointsSystemId = asStr(doc.data.pointsSystemId);
  if (pointsSystemId) item.pointsSystemId = pointsSystemId;

  const branding = asObject(doc.data.branding);
  if (branding) {
    item.branding = {
      logoUrl: asStr(branding.logoUrl),
      primaryColor: asStr(branding.primaryColor),
      secondaryColor: asStr(branding.secondaryColor),
    };
  }

  const website = asStr(doc.data.website);
  if (website) item.website = website;
  const description = asStr(doc.data.description);
  if (description) item.description = description;
  if (typeof doc.data.active === 'boolean') item.active = doc.data.active;

  return item;
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
