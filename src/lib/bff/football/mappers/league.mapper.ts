import type { LeagueDTO, SeasonDTO } from '@/lib/contracts/dto';
import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';

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

function leagueExternalId(externalId: string | null): number | string | null {
  if (!externalId) return null;
  const numeric = Number(externalId);
  return Number.isNaN(numeric) ? externalId : numeric;
}

export function mapLeagueToApiSports(
  league: LeagueDTO,
  country: CountryRecord | null,
  seasons: SeasonDTO[],
): ApiSportsLeagueEntry {
  return {
    league: {
      id: leagueExternalId(league.externalId),
      name: league.name,
      type: league.type,
      logo: league.logo,
    },
    country: {
      name: country?.name ?? league.country,
      code: country?.code ?? null,
      flag: country?.flag ?? null,
    },
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
