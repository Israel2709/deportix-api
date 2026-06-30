import { listRoundsBySeason } from '@/lib/firebase/repositories/rounds.repository';
import type { RoundsQuery } from '../query-params';
import { requireLeagueExternalId, requireSeasonYear } from '../query-params';
import { resolveSoccerLeague, resolveSoccerSeason } from './leagues.service';

export async function fetchFootballRounds(query: RoundsQuery): Promise<string[]> {
  const leagueExternalId = requireLeagueExternalId(query.leagueExternalId);
  const league = await resolveSoccerLeague(leagueExternalId);
  if (!league) return [];

  let seasonYear = query.seasonYear;
  if (seasonYear == null && query.current) {
    const current = await resolveSoccerSeason(league.id);
    seasonYear = current?.year ?? undefined;
  }
  const resolvedSeasonYear = requireSeasonYear(seasonYear);

  const season = await resolveSoccerSeason(league.id, resolvedSeasonYear);
  if (!season) return [];

  const rounds = await listRoundsBySeason(league.id, season.id);
  return rounds.map((round) => round.name);
}
