import { buildTeamExternalIdMap } from '@/lib/firebase/repositories/teams.repository';
import { listRawNflTeamsByLeague } from '@/lib/firebase/repositories/nfl-teams.repository';
import { mapNflTeamsForLeague } from '../mappers/team.mapper';
import type { NflTeamsQuery } from '../query-params';
import { requireNflParam, requireNflSeason } from '../query-params';
import { resolveNflLeague } from './leagues.service';

export async function fetchNflTeams(query: NflTeamsQuery) {
  const leagueExternalId = requireNflParam(query.league, 'league');
  requireNflSeason(query.season);

  const league = await resolveNflLeague(leagueExternalId);
  if (!league) return [];

  const [docs, externalIds] = await Promise.all([
    listRawNflTeamsByLeague(league.id),
    buildTeamExternalIdMap(league.id, 'nfl'),
  ]);

  return mapNflTeamsForLeague(docs, externalIds);
}
