import { mapSoccerTeamToApiSports, listRawSoccerTeamsByLeague } from '@/lib/firebase/repositories/soccer-teams.repository';
import { resolveSoccerLeague } from './leagues.service';

export async function fetchFootballTeams(query: {
  league: string;
  season?: string | number;
}): Promise<Record<string, unknown>[]> {
  const league = await resolveSoccerLeague(query.league);
  if (!league) return [];
  const docs = await listRawSoccerTeamsByLeague(league.id);
  return docs.map((doc) => mapSoccerTeamToApiSports(doc));
}
