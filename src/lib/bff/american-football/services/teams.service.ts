import { listRawAmericanFootballTeamsByLeague } from '@/lib/firebase/repositories/american-football-teams.repository';
import { mapAmericanFootballTeamsForLeague } from '../mappers/team.mapper';
import type { AmericanFootballTeamsQuery } from '../query-params';
import { requireAmericanFootballParam, requireAmericanFootballSeason } from '../query-params';
import { resolveAmericanFootballLeague } from './leagues.service';

export async function fetchAmericanFootballTeams(query: AmericanFootballTeamsQuery) {
  const leagueExternalId = requireAmericanFootballParam(query.league, 'league');
  requireAmericanFootballSeason(query.season);

  const league = await resolveAmericanFootballLeague(leagueExternalId);
  if (!league) return [];

  const docs = await listRawAmericanFootballTeamsByLeague(league.id);

  return mapAmericanFootballTeamsForLeague(docs);
}
