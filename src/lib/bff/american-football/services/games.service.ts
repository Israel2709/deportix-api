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
  let docs = season
    ? await listRawMatchesBySeason('american-football', season.id)
    : await listRawMatchesByLeague('american-football', league.id);

  // Ingested or legacy games may store season year without a matching season_id.
  // If the season doc exists but the season_id query is empty, fall back to league
  // games filtered by season year / embedded league.season.
  if (season && docs.length === 0 && query.season != null) {
    const year = Number(query.season);
    const leagueDocs = await listRawMatchesByLeague('american-football', league.id);
    docs = leagueDocs.filter((doc) => {
      const seasonYear = Number(
        doc.data.season_year ?? doc.data.season ?? (doc.data.league as { season?: unknown } | undefined)?.season ?? NaN,
      );
      if (Number.isFinite(seasonYear) && seasonYear === year) return true;
      const date = americanFootballGameDate(doc.data);
      if (!date) return false;
      return new Date(date).getUTCFullYear() === year;
    });
  }

  // Nearest kickoff first (ascending date).
  let filtered = [...docs].sort((a, b) =>
    (americanFootballGameDate(a.data) ?? '').localeCompare(americanFootballGameDate(b.data) ?? ''),
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
