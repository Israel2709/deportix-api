import { asStr } from '@/lib/api/serializers';
import {
  getMatchById,
  listRawMatchesByLeague,
  listRawMatchesBySeason,
} from '@/lib/firebase/repositories/matches.repository';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import {
  buildTeamMapForLeague,
  getTeamById,
} from '@/lib/firebase/repositories/teams.repository';
import { mapRawAmericanFootballGameToApiSports, americanFootballGameDate } from '../mappers/game.mapper';
import type { AmericanFootballGamesQuery } from '../query-params';
import { buildAmericanFootballLeagueContext, resolveAmericanFootballLeague, resolveAmericanFootballSeason } from './leagues.service';

async function mapDocsForLeague(
  leagueId: string,
  seasonYear: number | string | null | undefined,
  docs: RawDoc[],
) {
  const [teamMap, leagueContext] = await Promise.all([
    buildTeamMapForLeague(leagueId, 'american-football'),
    buildAmericanFootballLeagueContext(leagueId, seasonYear),
  ]);

  return docs.map((doc) =>
    mapRawAmericanFootballGameToApiSports(doc, teamMap, undefined, leagueContext),
  );
}

async function fetchById(id: string) {
  const doc = await getMatchById('american-football', id);
  if (!doc) return [];
  const leagueId = asStr(doc.data.league_id);
  if (!leagueId) return [];
  const seasonYear = doc.data.season_year ?? doc.data.season ?? null;
  return mapDocsForLeague(leagueId, seasonYear as number | string | null, [doc]);
}

export async function fetchAmericanFootballGames(query: AmericanFootballGamesQuery) {
  if (query.id) return fetchById(query.id);

  if (!query.league) return [];

  const league = await resolveAmericanFootballLeague(query.league);
  if (!league) return [];

  const season = query.season != null ? await resolveAmericanFootballSeason(league.id, query.season) : null;
  const docs = season
    ? await listRawMatchesBySeason('american-football', season.id)
    : await listRawMatchesByLeague('american-football', league.id);

  let filtered = [...docs].sort((a, b) =>
    (americanFootballGameDate(b.data) ?? '').localeCompare(americanFootballGameDate(a.data) ?? ''),
  );

  if (query.team) {
    const team = await getTeamById(query.team);
    if (!team || team.sport !== 'american-football' || !team.team.id) return [];
    filtered = filtered.filter(
      (doc) =>
        doc.data.home_team_id === team.team.id || doc.data.away_team_id === team.team.id,
    );
  }

  if (query.timezone) {
    // Accepted for api-sports compatibility; dates remain UTC in storage.
  }

  return mapDocsForLeague(league.id, query.season ?? season?.year ?? null, filtered);
}
