import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import { getLeague, listLeagues } from '@/lib/firebase/repositories/leagues.repository';
import { listOrganizations } from '@/lib/firebase/repositories/organizations.repository';
import {
  findSeasonByYear,
  listDistinctSeasonYears,
  listSeasonsByLeague,
} from '@/lib/firebase/repositories/seasons.repository';
import { mapGlobalSeasonYears, mapLeagueToApiSports } from '../mappers/league.mapper';
import type { LeagueQuery } from '../query-params';

function countryMatchesFilter(countryName: string | null, filter: string): boolean {
  if (!countryName) return false;
  return countryName.toLowerCase().includes(filter.toLowerCase());
}

function seasonsMatchFilter(
  seasons: Awaited<ReturnType<typeof listSeasonsByLeague>>,
  query: LeagueQuery,
): boolean {
  if (query.seasonYear != null && !seasons.some((season) => season.year === query.seasonYear)) {
    return false;
  }
  if (query.current === true && !seasons.some((season) => season.current)) {
    return false;
  }
  return true;
}

export async function fetchFootballLeagues(query: LeagueQuery): Promise<unknown[]> {
  const organizations = await listOrganizations({ sportSlug: 'soccer' });
  const orgById = new Map(organizations.map((org) => [org.id, org]));

  const matchingOrgIds = query.organization
    ? new Set(
        organizations
          .filter(
            (org) =>
              org.id === query.organization ||
              org.name.toLowerCase() === query.organization!.toLowerCase(),
          )
          .map((org) => org.id),
      )
    : null;

  if (query.organization && matchingOrgIds && matchingOrgIds.size === 0) return [];

  if (query.id) {
    const league = await getLeague(query.id);
    if (!league || league.dto.sport !== 'soccer') return [];
    if (matchingOrgIds && (!league.dto.organizationId || !matchingOrgIds.has(league.dto.organizationId))) {
      return [];
    }
    const [countryMap, seasons] = await Promise.all([
      buildCountryMap(),
      listSeasonsByLeague(league.id),
    ]);
    const country = league.dto.country
      ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
      : null;
    const organization = league.dto.organizationId
      ? (orgById.get(league.dto.organizationId) ?? null)
      : null;
    return [mapLeagueToApiSports(league.dto, country, seasons, organization)];
  }

  const [countryMap, leagues] = await Promise.all([
    buildCountryMap(),
    listLeagues({ sportSlug: 'soccer' }),
  ]);

  const entries: unknown[] = [];
  for (const league of leagues) {
    if (query.country && !countryMatchesFilter(league.country, query.country)) continue;
    if (matchingOrgIds && (!league.organizationId || !matchingOrgIds.has(league.organizationId))) {
      continue;
    }

    const seasons = await listSeasonsByLeague(league.id);
    if (!seasonsMatchFilter(seasons, query)) continue;

    const country = league.country ? (countryMap.get(league.country.toLowerCase()) ?? null) : null;
    const organization = league.organizationId ? (orgById.get(league.organizationId) ?? null) : null;
    entries.push(mapLeagueToApiSports(league, country, seasons, organization));
  }

  return entries;
}

export async function fetchFootballGlobalSeasons(): Promise<number[]> {
  const years = await listDistinctSeasonYears();
  return mapGlobalSeasonYears(years);
}

export async function fetchFootballSeasonYearsForLeague(leagueExternalId: string): Promise<number[]> {
  const league = await resolveSoccerLeague(leagueExternalId);
  if (!league) return [];
  const seasons = await listSeasonsByLeague(league.id);
  return mapGlobalSeasonYears(seasons.map((season) => season.year).filter((year): year is number => year != null));
}

export async function resolveSoccerLeague(externalOrInternalId: string) {
  const league = await getLeague(externalOrInternalId);
  if (!league || league.sportSlug !== 'soccer') return null;
  return league;
}

export async function resolveSoccerSeason(leagueId: string, seasonYear?: number) {
  if (seasonYear != null) return findSeasonByYear(leagueId, seasonYear);
  const seasons = await listSeasonsByLeague(leagueId);
  return seasons.find((season) => season.current) ?? seasons[0] ?? null;
}
