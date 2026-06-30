import { serializeSeason } from '@/lib/api/serializers';
import type { SeasonDTO } from '@/lib/contracts/dto';
import { fetchAll, fetchWhereEq } from './helpers';

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

/** Resolve a season by document id or external provider id within a league. */
export async function findSeasonInLeague(
  leagueId: string,
  seasonIdOrExternal: string,
): Promise<SeasonDTO | null> {
  const seasons = await listSeasonsByLeague(leagueId);
  return (
    seasons.find(
      (season) =>
        season.id === seasonIdOrExternal || season.externalId === seasonIdOrExternal,
    ) ?? null
  );
}

/** Distinct season years across the platform (API-Sports `/leagues/seasons`). */
export async function listDistinctSeasonYears(): Promise<number[]> {
  const docs = await fetchAll(COLLECTION, 10_000);
  const years = new Set<number>();
  for (const doc of docs) {
    const year = typeof doc.data.year === 'number' ? doc.data.year : null;
    if (year != null) years.add(year);
  }
  return [...years].sort((a, b) => b - a);
}
