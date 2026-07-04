import { asStr } from '@/lib/api/serializers';
import {
  getMatchById,
  listRawMatchesByLeague,
  listRawMatchesBySeason,
} from '@/lib/firebase/repositories/matches.repository';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import {
  buildTeamExternalIdMap,
  buildTeamMapForLeague,
  getTeamById,
} from '@/lib/firebase/repositories/teams.repository';
import { mapRawNflGameToApiSports, nflGameDate } from '../mappers/game.mapper';
import type { NflGamesQuery } from '../query-params';
import { buildNflLeagueContext, resolveNflLeague, resolveNflSeason } from './leagues.service';

async function mapDocsForLeague(
  leagueId: string,
  seasonYear: number | string | null | undefined,
  docs: RawDoc[],
) {
  const [teamMap, externalIds, leagueContext] = await Promise.all([
    buildTeamMapForLeague(leagueId, 'nfl'),
    buildTeamExternalIdMap(leagueId, 'nfl'),
    buildNflLeagueContext(leagueId, seasonYear),
  ]);

  return docs.map((doc) =>
    mapRawNflGameToApiSports(
      doc,
      teamMap,
      {
        home: externalIds.get(asStr(doc.data.home_team_id) ?? '') ?? null,
        away: externalIds.get(asStr(doc.data.away_team_id) ?? '') ?? null,
      },
      leagueContext,
    ),
  );
}

async function fetchById(id: string) {
  const doc = await getMatchById('nfl', id);
  if (!doc) return [];
  const leagueId = asStr(doc.data.league_id);
  if (!leagueId) return [];
  const seasonYear = doc.data.season_year ?? doc.data.season ?? null;
  return mapDocsForLeague(leagueId, seasonYear as number | string | null, [doc]);
}

export async function fetchNflGames(query: NflGamesQuery) {
  if (query.id) return fetchById(query.id);

  if (!query.league) return [];

  const league = await resolveNflLeague(query.league);
  if (!league) return [];

  const season = query.season != null ? await resolveNflSeason(league.id, query.season) : null;
  const docs = season
    ? await listRawMatchesBySeason('nfl', season.id)
    : await listRawMatchesByLeague('nfl', league.id);

  let filtered = [...docs].sort((a, b) =>
    (nflGameDate(b.data) ?? '').localeCompare(nflGameDate(a.data) ?? ''),
  );

  if (query.team) {
    const team = await getTeamById(query.team);
    if (!team || team.sport !== 'nfl' || !team.team.id) return [];
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
