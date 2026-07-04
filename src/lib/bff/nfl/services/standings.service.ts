import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import { listRawNflStandingsByLeague } from '@/lib/firebase/repositories/nfl-standings.repository';
import {
  buildTeamExternalIdMap,
  buildTeamMapForLeague,
} from '@/lib/firebase/repositories/teams.repository';
import { mapRawNflStandingToApiSports } from '../mappers/standing.mapper';
import type { NflStandingsQuery } from '../query-params';
import { requireNflParam, requireNflSeason } from '../query-params';
import { resolveNflLeague, resolveNflSeason } from './leagues.service';

export async function fetchNflStandings(query: NflStandingsQuery) {
  const leagueExternalId = requireNflParam(query.league, 'league');
  const seasonYear = requireNflSeason(query.season);

  const league = await resolveNflLeague(leagueExternalId);
  if (!league) return [];

  const season = await resolveNflSeason(league.id, seasonYear);
  if (!season) return [];

  const [countryMap, teamMap, teamExternalIds, docs] = await Promise.all([
    buildCountryMap(),
    buildTeamMapForLeague(league.id, 'nfl'),
    buildTeamExternalIdMap(league.id, 'nfl'),
    listRawNflStandingsByLeague(league.id, {
      seasonId: season.id,
      conference: query.conference,
    }),
  ]);

  const country = league.dto.country
    ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
    : null;

  return docs.map((doc) =>
    mapRawNflStandingToApiSports(
      doc,
      league.dto,
      country,
      seasonYear,
      teamMap,
      teamExternalIds,
    ),
  );
}
