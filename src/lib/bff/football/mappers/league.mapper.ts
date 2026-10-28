import type { LeagueDTO, SeasonDTO } from '@/lib/contracts/dto';
import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';
import type { OrganizationRecord } from '@/lib/firebase/repositories/organizations.repository';
import { mapOrganizationRef } from './organization.mapper';

export interface ApiSportsLeagueEntry {
  league: {
    id: number | string | null;
    name: string | null;
    type: string | null;
    logo: string | null;
  };
  country: {
    name: string | null;
    code: string | null;
    flag: string | null;
  };
  organization: {
    id: string;
    name: string;
    abbreviation: string | null;
    logo: string | null;
    logo_alt: string | null;
  } | null;
  seasons: Array<{
    year: number | null;
    start: string | null;
    end: string | null;
    current: boolean;
    coverage: {
      fixtures: boolean;
      standings: boolean;
      players: boolean;
      top_scorers: boolean;
      top_assists: boolean;
      top_cards: boolean;
      injuries: boolean;
      predictions: boolean;
      odds: boolean;
    };
  }>;
}

function leaguePublicId(league: LeagueDTO): number | string | null {
  const raw = league.externalId?.trim() || league.id?.trim() || null;
  if (!raw) return null;
  const numeric = Number(raw);
  return Number.isNaN(numeric) ? raw : numeric;
}

export function mapLeagueToApiSports(
  league: LeagueDTO,
  country: CountryRecord | null,
  seasons: SeasonDTO[],
  organization: OrganizationRecord | null = null,
): ApiSportsLeagueEntry {
  return {
    league: {
      id: leaguePublicId(league),
      name: league.name,
      type: league.type,
      logo: league.logo,
    },
    country: {
      name: country?.name ?? league.country,
      code: country?.code ?? null,
      flag: country?.flag ?? null,
    },
    organization: mapOrganizationRef(organization),
    seasons: seasons.map((season) => ({
      year: season.year,
      start: season.startDate,
      end: season.endDate,
      current: season.current,
      coverage: {
        fixtures: true,
        standings: true,
        players: false,
        top_scorers: false,
        top_assists: false,
        top_cards: false,
        injuries: false,
        predictions: false,
        odds: false,
      },
    })),
  };
}

export function mapGlobalSeasonYears(years: number[]): number[] {
  return [...years].sort((a, b) => b - a);
}
