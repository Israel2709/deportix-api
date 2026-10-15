import { asStr } from '@/lib/api/serializers';
import type { TeamMap } from '@/lib/api/serializers';
import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import { getRawSoccerTeam } from '@/lib/firebase/repositories/soccer-teams.repository';
import { listRawStandingsByLeague } from '@/lib/firebase/repositories/standings.repository';
import {
  buildTeamExternalIdMap,
  buildTeamMapForLeague,
} from '@/lib/firebase/repositories/teams.repository';
import { mapStandingsToApiSports } from '../mappers/standing.mapper';
import type { StandingsQuery } from '../query-params';
import { requireLeagueExternalId, requireSeasonYear } from '../query-params';
import { resolveSoccerLeague, resolveSoccerSeason } from './leagues.service';

/** Fill gaps when a standing row points at a team whose `league_id` is another competition. */
async function enrichTeamMapsFromStandingDocs(
  docs: Awaited<ReturnType<typeof listRawStandingsByLeague>>,
  teamMap: TeamMap,
  teamExternalIds: Map<string, string | null>,
): Promise<void> {
  const missing = new Set<string>();
  for (const doc of docs) {
    const teamId = asStr(doc.data.team_id);
    if (teamId && !teamMap.has(teamId)) missing.add(teamId);
  }
  for (const teamId of missing) {
    const team = await getRawSoccerTeam(teamId);
    if (!team) continue;
    const rawTeam =
      team.data.team && typeof team.data.team === 'object'
        ? (team.data.team as { name?: unknown; logo?: unknown })
        : null;
    teamMap.set(teamId, {
      name: asStr(rawTeam?.name) ?? asStr(team.data.name),
      logo: asStr(rawTeam?.logo) ?? asStr(team.data.logo),
    });
    if (!teamExternalIds.has(teamId)) {
      teamExternalIds.set(teamId, asStr(team.data.external_id));
    }
  }
}

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

  await enrichTeamMapsFromStandingDocs(docs, teamMap, teamExternalIds);

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
