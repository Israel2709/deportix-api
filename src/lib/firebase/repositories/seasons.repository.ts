import { serializeSeason } from '@/lib/api/serializers';
import type { SeasonDTO } from '@/lib/contracts/dto';
import { notFound } from '@/lib/api/errors';
import {
  createDoc,
  deleteDoc,
  fetchAll,
  fetchWhereEq,
  getDocById,
  resolveDoc,
  updateDocFields,
} from './helpers';
import { listLeagues } from './leagues.repository';
import { loadCatalogContext } from './catalog.repository';

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

export async function listDistinctSeasonYearsForSport(sportSlug: string): Promise<number[]> {
  const ctx = await loadCatalogContext();
  const sportId = ctx.sportIdBySlug.get(sportSlug);
  if (!sportId) return [];

  const leagues = await listLeagues({ sportSlug });
  const leagueIds = new Set(leagues.map((league) => league.id));
  const docs = await fetchAll(COLLECTION, 10_000);
  const years = new Set<number>();
  for (const doc of docs) {
    const leagueId = typeof doc.data.league_id === 'string' ? doc.data.league_id : null;
    const year = typeof doc.data.year === 'number' ? doc.data.year : null;
    if (leagueId && leagueIds.has(leagueId) && year != null) years.add(year);
  }
  return [...years].sort((a, b) => b - a);
}

export async function createSeason(input: {
  leagueId: string;
  year: number;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
  externalId?: string | null;
  coverage?: unknown;
}): Promise<SeasonDTO> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const data: Record<string, unknown> = {
    league_id: input.leagueId,
    year: input.year,
    start_date: input.startDate ?? null,
    end_date: input.endDate ?? null,
    current: input.current ?? false,
    external_id: input.externalId ?? String(input.year),
    created_at: now,
    updated_at: now,
  };
  if (input.coverage !== undefined) data.coverage = input.coverage;

  await createDoc(COLLECTION, id, data);
  const created = await getDocById(COLLECTION, id);
  if (!created) throw notFound('Season not found.');
  return serializeSeason(created.id, created.data);
}

export async function updateSeason(
  seasonIdOrExternal: string,
  patch: Record<string, unknown>,
): Promise<SeasonDTO> {
  const existing = await resolveDoc(COLLECTION, seasonIdOrExternal);
  if (!existing) throw notFound('Season not found.');

  await updateDocFields(COLLECTION, existing.id, {
    ...patch,
    updated_at: new Date().toISOString(),
  });

  const updated = await getDocById(COLLECTION, existing.id);
  if (!updated) throw notFound('Season not found.');
  return serializeSeason(updated.id, updated.data);
}

export async function deleteSeason(seasonIdOrExternal: string): Promise<void> {
  const existing = await resolveDoc(COLLECTION, seasonIdOrExternal);
  if (!existing) throw notFound('Season not found.');
  await deleteDoc(COLLECTION, existing.id);
}
