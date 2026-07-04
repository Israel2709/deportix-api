import type { LeagueDTO, SeasonDTO } from '@/lib/contracts/dto';
import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';
import type { NflLeagueItem } from '../schemas/league.schema';

function leagueExternalId(externalId: string | null): number | string | null {
  if (!externalId) return null;
  const numeric = Number(externalId);
  return Number.isNaN(numeric) ? externalId : numeric;
}

function coverageFromRaw(raw: unknown): NflLeagueItem['seasons'][number]['coverage'] {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as NflLeagueItem['seasons'][number]['coverage'];
  }
  return {
    games: { events: true, statisitcs: { teams: true, players: true } },
    statistics: { season: { players: true } },
    players: true,
    injuries: true,
    standings: true,
  };
}

export function mapNflLeagueToApiSports(
  league: LeagueDTO,
  country: CountryRecord | null,
  seasons: SeasonDTO[],
): NflLeagueItem {
  return {
    league: {
      id: leagueExternalId(league.externalId) ?? 0,
      name: league.name ?? '',
      type: league.type,
      logo: league.logo,
      altLogo: league.altLogo,
    },
    country: {
      name: country?.name ?? league.country ?? '',
      code: country?.code ?? null,
      flag: country?.flag ?? null,
    },
    seasons: seasons.map((season) => ({
      year: season.year ?? 0,
      start: season.startDate,
      end: season.endDate,
      current: season.current,
      coverage: coverageFromRaw(
        (season as SeasonDTO & { coverage?: unknown }).coverage,
      ),
    })),
  };
}

export function mapNflGlobalSeasonYears(years: number[]): number[] {
  return [...years].sort((a, b) => b - a);
}
