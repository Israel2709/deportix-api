import { serializeMatch, type TeamMap } from '@/lib/api/serializers';
import { buildMatchFirestorePatch, type MatchUpdate } from '@/lib/api/match-patch';
import { notFound } from '@/lib/api/errors';
import type { MatchDTO } from '@/lib/contracts/dto';
import { getSportConfig, type SportConfig, type SportSlug } from '../sport-registry';
import {
  deleteDoc,
  fetchWhereEq,
  getDocById,
  resolveDoc,
  updateDocFields,
  type RawDoc,
} from './helpers';
import { buildTeamMapForLeague } from './teams.repository';

export interface MatchFilters {
  seasonId?: string;
  from?: string;
  to?: string;
  date?: string;
  status?: string;
  teamId?: string;
  /** Sort by date descending (true) or ascending (false). */
  sortDesc: boolean;
}

function upperBound(to: string): string {
  // Date-only bound -> include the whole day. ISO strings compare lexicographically.
  return to.length <= 10 ? `${to}T23:59:59.999Z` : to;
}

function applyFilters(matches: MatchDTO[], filters: MatchFilters): MatchDTO[] {
  let out = matches;
  if (filters.seasonId) out = out.filter((m) => m.seasonId === filters.seasonId);
  if (filters.status) out = out.filter((m) => m.status === filters.status);
  if (filters.teamId) {
    out = out.filter((m) => m.home.teamId === filters.teamId || m.away.teamId === filters.teamId);
  }
  if (filters.date) {
    const day = filters.date.slice(0, 10);
    out = out.filter((m) => (m.date ?? '').slice(0, 10) === day);
  }
  if (filters.from) {
    const from = filters.from;
    out = out.filter((m) => m.date != null && m.date >= from);
  }
  if (filters.to) {
    const to = upperBound(filters.to);
    out = out.filter((m) => m.date != null && m.date <= to);
  }
  return [...out].sort((a, b) => {
    const da = a.date ?? '';
    const db = b.date ?? '';
    return filters.sortDesc ? db.localeCompare(da) : da.localeCompare(db);
  });
}

export async function listMatchesByLeague(
  leagueId: string,
  sport: SportSlug,
  filters: MatchFilters,
  teamMap?: TeamMap,
): Promise<MatchDTO[]> {
  const config = getSportConfig(sport);
  if (!config) return [];
  const map = teamMap ?? (await buildTeamMapForLeague(leagueId, sport));
  const docs = await fetchWhereEq(config.collections.matches, 'league_id', leagueId);
  const matches = docs.map((doc) => serializeMatch(sport, doc.id, doc.data, map));
  return applyFilters(matches, filters);
}

/**
 * Matches for a specific season (queried by `season_id`). Preferred over
 * `listMatchesByLeague` for data-rich leagues, since it bounds the read to one season
 * instead of pulling every match the league ever played.
 */
export async function listMatchesBySeason(
  sport: SportSlug,
  seasonId: string,
  filters: MatchFilters,
  teamMap?: TeamMap,
): Promise<MatchDTO[]> {
  const config = getSportConfig(sport);
  if (!config) return [];
  const docs = await fetchWhereEq(config.collections.matches, 'season_id', seasonId);
  const matches = docs.map((doc) => serializeMatch(sport, doc.id, doc.data, teamMap));
  return applyFilters(matches, { ...filters, seasonId: undefined });
}

export async function listMatchesByTeam(
  teamId: string,
  sport: SportSlug,
  filters: MatchFilters,
  teamMap?: TeamMap,
): Promise<MatchDTO[]> {
  const config = getSportConfig(sport);
  if (!config) return [];
  const [homeDocs, awayDocs] = await Promise.all([
    fetchWhereEq(config.collections.matches, config.homeTeamField, teamId),
    fetchWhereEq(config.collections.matches, config.awayTeamField, teamId),
  ]);
  const byId = new Map<string, RawDoc>();
  for (const doc of [...homeDocs, ...awayDocs]) byId.set(doc.id, doc);
  const matches = [...byId.values()].map((doc) => serializeMatch(sport, doc.id, doc.data, teamMap));
  // teamId filter is already enforced by the queries; ignore it here.
  return applyFilters(matches, { ...filters, teamId: undefined });
}

export async function getMatchById(sport: SportSlug, matchId: string): Promise<RawDoc | null> {
  const config = getSportConfig(sport);
  if (!config) return null;
  return resolveDoc(config.collections.matches, matchId);
}

async function requireLeagueMatch(
  leagueId: string,
  sport: SportSlug,
  matchId: string,
): Promise<{ config: SportConfig; doc: RawDoc }> {
  const config = getSportConfig(sport);
  if (!config) throw notFound('Match not found.');

  const existing = await resolveDoc(config.collections.matches, matchId);
  if (!existing) throw notFound('Match not found.');

  const storedLeagueId = existing.data.league_id;
  if (typeof storedLeagueId !== 'string' || storedLeagueId !== leagueId) {
    throw notFound('Match not found.');
  }

  return { config, doc: existing };
}

export async function updateMatch(
  leagueId: string,
  sport: SportSlug,
  matchId: string,
  patch: MatchUpdate,
  teamMap?: TeamMap,
): Promise<MatchDTO> {
  const { config, doc: existing } = await requireLeagueMatch(leagueId, sport, matchId);

  const firestorePatch = buildMatchFirestorePatch(sport, patch);
  firestorePatch.updated_at = new Date().toISOString();

  await updateDocFields(config.collections.matches, existing.id, firestorePatch);

  const updated = await getDocById(config.collections.matches, existing.id);
  if (!updated) throw notFound('Match not found.');

  const map = teamMap ?? (await buildTeamMapForLeague(leagueId, sport));
  return serializeMatch(sport, updated.id, updated.data, map);
}

export async function deleteMatch(
  leagueId: string,
  sport: SportSlug,
  matchId: string,
): Promise<void> {
  const { config, doc: existing } = await requireLeagueMatch(leagueId, sport, matchId);
  await deleteDoc(config.collections.matches, existing.id);
}
