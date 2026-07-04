import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import { getLeague, listLeagues } from '@/lib/firebase/repositories/leagues.repository';
import {
  findSeasonByYear,
  listDistinctSeasonYearsForSport,
  listSeasonsByLeague,
} from '@/lib/firebase/repositories/seasons.repository';
import { mapAmericanFootballGlobalSeasonYears, mapAmericanFootballLeagueToApiSports } from '../mappers/league.mapper';
import type { AmericanFootballLeagueQuery } from '../query-params';

function countryMatchesFilter(countryName: string | null, filter: string): boolean {
  if (!countryName) return false;
  return countryName.toLowerCase().includes(filter.toLowerCase());
}

function seasonsMatchFilter(
  seasons: Awaited<ReturnType<typeof listSeasonsByLeague>>,
  seasonYear?: number,
): boolean {
  if (seasonYear != null && !seasons.some((season) => season.year === seasonYear)) {
    return false;
  }
  return true;
}

export async function resolveAmericanFootballLeague(externalOrInternalId: string) {
  const league = await getLeague(externalOrInternalId);
  if (!league || league.sportSlug !== 'american-football') return null;
  return league;
}

export async function resolveAmericanFootballSeason(leagueId: string, seasonYear?: number) {
  if (seasonYear != null) return findSeasonByYear(leagueId, seasonYear);
  const seasons = await listSeasonsByLeague(leagueId);
  return seasons.find((season) => season.current) ?? seasons[0] ?? null;
}

export async function fetchAmericanFootballLeagues(query: AmericanFootballLeagueQuery) {
  if (query.id) {
    const league = await getLeague(query.id);
    if (!league || league.dto.sport !== 'american-football') return [];
    const [countryMap, seasons] = await Promise.all([
      buildCountryMap(),
      listSeasonsByLeague(league.id),
    ]);
    const country = league.dto.country
      ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
      : null;
    return [mapAmericanFootballLeagueToApiSports(league.dto, country, seasons)];
  }

  const [countryMap, leagues] = await Promise.all([
    buildCountryMap(),
    listLeagues({ sportSlug: 'american-football' }),
  ]);

  const entries = [];
  for (const league of leagues) {
    if (query.name && !(league.name ?? '').toLowerCase().includes(query.name.toLowerCase())) {
      continue;
    }
    if (query.type && league.type !== query.type) continue;
    if (query.country && !countryMatchesFilter(league.country, query.country)) continue;
    if (query.search) {
      const haystack = `${league.name ?? ''} ${league.country ?? ''}`.toLowerCase();
      if (!haystack.includes(query.search.toLowerCase())) continue;
    }

    const seasons = await listSeasonsByLeague(league.id);
    if (!seasonsMatchFilter(seasons, query.seasonYear)) continue;

    const country = league.country ? (countryMap.get(league.country.toLowerCase()) ?? null) : null;
    if (query.countryId && country?.id !== query.countryId && country?.externalId !== query.countryId) {
      continue;
    }

    entries.push(mapAmericanFootballLeagueToApiSports(league, country, seasons));
  }

  return entries;
}

export async function fetchAmericanFootballGlobalSeasons(): Promise<number[]> {
  const years = await listDistinctSeasonYearsForSport('american-football');
  return mapAmericanFootballGlobalSeasonYears(years);
}

export async function fetchAmericanFootballSeasonYearsForLeague(leagueExternalId: string): Promise<number[]> {
  const league = await resolveAmericanFootballLeague(leagueExternalId);
  if (!league) return [];
  const seasons = await listSeasonsByLeague(league.id);
  return seasons
    .map((season) => season.year)
    .filter((year): year is number => year != null)
    .sort((a, b) => b - a);
}

export async function buildAmericanFootballLeagueContext(
  leagueId: string,
  seasonYear?: number | string | null,
) {
  const league = await getLeague(leagueId);
  if (!league || league.sportSlug !== 'american-football') return null;

  const countryMap = await buildCountryMap();
  const country = league.dto.country
    ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
    : null;

  return {
    id: league.dto.externalId ? Number(league.dto.externalId) || league.dto.externalId : null,
    name: league.dto.name,
    season: seasonYear ?? null,
    logo: league.dto.logo,
    altLogo: league.dto.altLogo,
    country: {
      name: country?.name ?? league.dto.country,
      code: country?.code ?? null,
      flag: country?.flag ?? null,
    },
  };
}
