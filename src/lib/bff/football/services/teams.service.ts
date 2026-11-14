import { asStr } from '@/lib/api/serializers';
import {
  getRawSoccerTeam,
  listRawSoccerTeamsByLeague,
  mapSoccerTeamToApiSports,
} from '@/lib/firebase/repositories/soccer-teams.repository';
import { listParticipantTeamIdsBySeason } from '@/lib/firebase/repositories/soccer-season-participants.repository';
import {
  listRawMatchesByLeague,
  listRawMatchesBySeason,
} from '@/lib/firebase/repositories/matches.repository';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { TeamQuery } from '../query-params';
import { fetchFootballLeagues, resolveSoccerLeague, resolveSoccerSeason } from './leagues.service';

async function loadTeamsByIds(teamIds: string[]): Promise<RawDoc[]> {
  const docs: RawDoc[] = [];
  for (const teamId of teamIds) {
    const doc = await getRawSoccerTeam(teamId);
    if (doc) docs.push(doc);
  }
  return docs;
}

/** Migration fallback when participants have not been backfilled yet. */
async function teamsReferencedByFixtures(
  leagueId: string,
  seasonYear?: string | number,
): Promise<RawDoc[]> {
  let matches: RawDoc[];
  if (seasonYear != null && String(seasonYear).trim() !== '') {
    const year = Number(seasonYear);
    if (!Number.isFinite(year)) return [];
    const season = await resolveSoccerSeason(leagueId, year);
    if (!season) return [];
    matches = await listRawMatchesBySeason('soccer', season.id);
  } else {
    matches = await listRawMatchesByLeague('soccer', leagueId);
  }

  const teamIds = new Set<string>();
  for (const match of matches) {
    const home = asStr(match.data.home_team_id);
    const away = asStr(match.data.away_team_id);
    if (home) teamIds.add(home);
    if (away) teamIds.add(away);
  }

  return loadTeamsByIds([...teamIds]);
}

function sortTeamEntries(docs: Record<string, unknown>[]): Record<string, unknown>[] {
  return [...docs].sort((a, b) => {
    const left = String((a.team as { name?: string } | undefined)?.name ?? '');
    const right = String((b.team as { name?: string } | undefined)?.name ?? '');
    return left.localeCompare(right, 'es');
  });
}

type LeagueScope = {
  id: string;
  publicId: string | number | null;
  name: string | null;
  organization: {
    id: string;
    name: string;
    abbreviation: string | null;
    logo: string | null;
    logo_alt: string | null;
  } | null;
};

function enrichTeamEntry(
  doc: RawDoc,
  league: LeagueScope,
): Record<string, unknown> {
  const mapped = mapSoccerTeamToApiSports(doc);
  return {
    ...mapped,
    league: {
      id: league.publicId ?? league.id,
      name: league.name,
    },
    organization: league.organization,
  };
}

async function teamsForLeagueScope(
  league: LeagueScope,
  season?: string | number,
): Promise<Record<string, unknown>[]> {
  // Preferred path: season participants (many-to-many competition ↔ teams).
  if (season != null && String(season).trim() !== '') {
    const year = Number(season);
    if (Number.isFinite(year)) {
      const seasonRow = await resolveSoccerSeason(league.id, year);
      if (seasonRow) {
        const participantIds = await listParticipantTeamIdsBySeason(seasonRow.id);
        if (participantIds.length > 0) {
          const docs = await loadTeamsByIds(participantIds);
          return docs.map((doc) => enrichTeamEntry(doc, league));
        }
        // Fallback while migrating: teams referenced by fixtures for that season.
        const fromFixtures = await teamsReferencedByFixtures(league.id, year);
        if (fromFixtures.length > 0) {
          return fromFixtures.map((doc) => enrichTeamEntry(doc, league));
        }
      }
    }
  }

  // No season (or empty participants): legacy league_id + fixture union.
  const [byLeague, byFixtures] = await Promise.all([
    listRawSoccerTeamsByLeague(league.id),
    teamsReferencedByFixtures(league.id, season),
  ]);

  const byId = new Map<string, RawDoc>();
  for (const doc of byLeague) byId.set(doc.id, doc);
  for (const doc of byFixtures) {
    if (!byId.has(doc.id)) byId.set(doc.id, doc);
  }

  return [...byId.values()].map((doc) => enrichTeamEntry(doc, league));
}

function leagueScopeFromEntry(entry: Record<string, unknown>): LeagueScope | null {
  const league = entry.league as { id?: string | number | null; name?: string | null } | undefined;
  if (league?.id == null || String(league.id).trim() === '') return null;
  const organization =
    (entry.organization as LeagueScope['organization'] | null | undefined) ?? null;
  return {
    id: String(league.id),
    publicId: league.id,
    name: league.name ?? null,
    organization,
  };
}

async function resolveLeagueScopes(query: TeamQuery): Promise<LeagueScope[]> {
  if (query.league) {
    // Resolve via leagues service so country/organization filters can narrow, and
    // organization metadata is hydrated for the BO.
    const scoped = await fetchFootballLeagues({
      id: query.league,
      country: query.country,
      organization: query.organization,
    });
    if (scoped.length === 0) return [];
    const fromList = leagueScopeFromEntry(scoped[0] as Record<string, unknown>);
    if (fromList) {
      // Prefer Firestore internal id for participant / league_id lookups.
      const resolved = await resolveSoccerLeague(query.league);
      if (resolved) return [{ ...fromList, id: resolved.id }];
      return [fromList];
    }
    return [];
  }

  const entries = await fetchFootballLeagues({
    country: query.country,
    organization: query.organization,
  });

  const scopes: LeagueScope[] = [];
  for (const entry of entries) {
    const scope = leagueScopeFromEntry(entry as Record<string, unknown>);
    if (!scope) continue;
    const resolved = await resolveSoccerLeague(String(scope.publicId ?? scope.id));
    scopes.push(resolved ? { ...scope, id: resolved.id } : scope);
  }
  return scopes;
}

/**
 * List soccer teams by league (optional season), or by country / organization
 * (aggregates across matching leagues). `season` requires `league`.
 */
export async function fetchFootballTeams(query: TeamQuery): Promise<Record<string, unknown>[]> {
  const scopes = await resolveLeagueScopes(query);
  const first = scopes[0];
  if (!first) return [];

  if (scopes.length === 1) {
    return sortTeamEntries(await teamsForLeagueScope(first, query.season));
  }

  const batches = await Promise.all(
    scopes.map((scope) => teamsForLeagueScope(scope, query.season)),
  );

  const byId = new Map<string, Record<string, unknown>>();
  for (const batch of batches) {
    for (const entry of batch) {
      const team = entry.team as { id?: string | number } | undefined;
      const id = team?.id != null ? String(team.id) : '';
      if (!id || byId.has(id)) continue;
      byId.set(id, entry);
    }
  }

  return sortTeamEntries([...byId.values()]);
}
