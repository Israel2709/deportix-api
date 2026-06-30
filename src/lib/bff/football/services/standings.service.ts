import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import { listRawStandingsByLeague } from '@/lib/firebase/repositories/standings.repository';
import {
  buildTeamExternalIdMap,
  buildTeamMapForLeague,
} from '@/lib/firebase/repositories/teams.repository';
import { mapStandingsToApiSports } from '../mappers/standing.mapper';
import type { StandingsQuery } from '../query-params';
import { requireLeagueExternalId, requireSeasonYear } from '../query-params';
import { resolveSoccerLeague, resolveSoccerSeason } from './leagues.service';

export async function fetchFootballStandings(query: StandingsQuery): Promise<unknown[]> {
  const leagueExternalId = requireLeagueExternalId(query.leagueExternalId);
  const seasonYear = requireSeasonYear(query.seasonYear);

  const league = await resolveSoccerLeague(leagueExternalId);
  if (!league) return [];

  const season = await resolveSoccerSeason(league.id, seasonYear);
  if (!season) return [];

  const [countryMap, teamMap, teamExternalIds, docs] = await Promise.all([
    buildCountryMap(),
    buildTeamMapForLeague(league.id, 'soccer'),
    buildTeamExternalIdMap(league.id, 'soccer'),
    listRawStandingsByLeague(league.id, 'soccer', { seasonId: season.id }),
  ]);

  const country = league.dto.country
    ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
    : null;

  if (docs.length === 0) return [];

  return [
    mapStandingsToApiSports(
      league.dto,
      country,
      seasonYear,
      docs,
      teamMap,
      teamExternalIds,
    ),
  ];
}
