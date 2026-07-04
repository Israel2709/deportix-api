import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import { listRawAmericanFootballStandingsByLeague } from '@/lib/firebase/repositories/american-football-standings.repository';
import {
  buildTeamExternalIdMap,
  buildTeamMapForLeague,
} from '@/lib/firebase/repositories/teams.repository';
import { mapRawAmericanFootballStandingToApiSports } from '../mappers/standing.mapper';
import type { AmericanFootballStandingsQuery } from '../query-params';
import { requireAmericanFootballParam, requireAmericanFootballSeason } from '../query-params';
import { resolveAmericanFootballLeague, resolveAmericanFootballSeason } from './leagues.service';

export async function fetchAmericanFootballStandings(query: AmericanFootballStandingsQuery) {
  const leagueExternalId = requireAmericanFootballParam(query.league, 'league');
  const seasonYear = requireAmericanFootballSeason(query.season);

  const league = await resolveAmericanFootballLeague(leagueExternalId);
  if (!league) return [];

  const season = await resolveAmericanFootballSeason(league.id, seasonYear);
  if (!season) return [];

  const [countryMap, teamMap, teamExternalIds, docs] = await Promise.all([
    buildCountryMap(),
    buildTeamMapForLeague(league.id, 'american-football'),
    buildTeamExternalIdMap(league.id, 'american-football'),
    listRawAmericanFootballStandingsByLeague(league.id, {
      seasonId: season.id,
      conference: query.conference,
    }),
  ]);

  const country = league.dto.country
    ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
    : null;

  return docs.map((doc) =>
    mapRawAmericanFootballStandingToApiSports(
      doc,
      league.dto,
      country,
      seasonYear,
      teamMap,
      teamExternalIds,
    ),
  );
}
