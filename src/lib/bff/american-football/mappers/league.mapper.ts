import type { LeagueDTO, SeasonDTO } from '@/lib/contracts/dto';
import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';
import type { AmericanFootballLeagueItem } from '../schemas/league.schema';

function coverageFromRaw(raw: unknown): AmericanFootballLeagueItem['seasons'][number]['coverage'] {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as AmericanFootballLeagueItem['seasons'][number]['coverage'];
  }
  return {
    games: { events: true, statisitcs: { teams: true, players: true } },
    statistics: { season: { players: true } },
    players: true,
    injuries: true,
    standings: true,
  };
}

export function mapAmericanFootballLeagueToApiSports(
  league: LeagueDTO,
  country: CountryRecord | null,
  seasons: SeasonDTO[],
): AmericanFootballLeagueItem {
  return {
    league: {
      id: league.id,
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

export function mapAmericanFootballGlobalSeasonYears(years: number[]): number[] {
  return [...years].sort((a, b) => b - a);
}
