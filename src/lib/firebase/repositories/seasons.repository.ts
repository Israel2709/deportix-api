import { serializeSeason } from '@/lib/api/serializers';
import type { SeasonDTO } from '@/lib/contracts/dto';
import { fetchWhereEq } from './helpers';

const COLLECTION = 'seasons';

export async function listSeasonsByLeague(leagueId: string): Promise<SeasonDTO[]> {
  const docs = await fetchWhereEq(COLLECTION, 'league_id', leagueId);
  return docs
    .map((doc) => serializeSeason(doc.id, doc.data))
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

/** The league's `current` season, or the most recent one as a fallback. */
export async function getCurrentSeason(leagueId: string): Promise<SeasonDTO | null> {
  const seasons = await listSeasonsByLeague(leagueId);
  return seasons.find((season) => season.current) ?? seasons[0] ?? null;
}

export async function findSeasonByYear(leagueId: string, year: number): Promise<SeasonDTO | null> {
  const seasons = await listSeasonsByLeague(leagueId);
  return seasons.find((season) => season.year === year) ?? null;
}
