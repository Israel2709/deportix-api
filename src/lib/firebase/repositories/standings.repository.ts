import { serializeStanding } from '@/lib/api/serializers';
import type { StandingDTO } from '@/lib/contracts/dto';
import { getSportConfig, type SportSlug } from '../sport-registry';
import { fetchWhereEq } from './helpers';
import { buildTeamMapForLeague } from './teams.repository';

export async function listStandingsByLeague(
  leagueId: string,
  sport: SportSlug,
  opts: { seasonId?: string },
): Promise<StandingDTO[]> {
  const config = getSportConfig(sport);
  if (!config) return [];

  const [docs, teamMap] = await Promise.all([
    fetchWhereEq(config.collections.standings, 'league_id', leagueId),
    buildTeamMapForLeague(leagueId, sport),
  ]);

  const standings = docs
    .filter((doc) => !opts.seasonId || doc.data.season_id === opts.seasonId)
    .map((doc) => serializeStanding(sport, doc.data, teamMap));

  // Rank by points (soccer) or wins (NFL) descending.
  return standings.sort((a, b) => {
    const scoreA = a.points ?? a.wins ?? 0;
    const scoreB = b.points ?? b.wins ?? 0;
    return scoreB - scoreA;
  });
}
