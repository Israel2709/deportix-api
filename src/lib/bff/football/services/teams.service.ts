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
import { resolveSoccerLeague, resolveSoccerSeason } from './leagues.service';

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

function sortTeamEntries(docs: RawDoc[]): Record<string, unknown>[] {
  return docs
    .map((doc) => mapSoccerTeamToApiSports(doc))
    .sort((a, b) => {
      const left = String((a.team as { name?: string } | undefined)?.name ?? '');
      const right = String((b.team as { name?: string } | undefined)?.name ?? '');
      return left.localeCompare(right, 'es');
    });
}

export async function fetchFootballTeams(query: {
  league: string;
  season?: string | number;
}): Promise<Record<string, unknown>[]> {
  const league = await resolveSoccerLeague(query.league);
  if (!league) return [];

  // Preferred path: season participants (many-to-many competition ↔ teams).
  if (query.season != null && String(query.season).trim() !== '') {
    const year = Number(query.season);
    if (Number.isFinite(year)) {
      const season = await resolveSoccerSeason(league.id, year);
      if (season) {
        const participantIds = await listParticipantTeamIdsBySeason(season.id);
        if (participantIds.length > 0) {
          return sortTeamEntries(await loadTeamsByIds(participantIds));
        }
        // Fallback while migrating: teams referenced by fixtures for that season.
        const fromFixtures = await teamsReferencedByFixtures(league.id, year);
        if (fromFixtures.length > 0) return sortTeamEntries(fromFixtures);
      }
    }
  }

  // No season (or empty participants): legacy league_id + fixture union.
  const [byLeague, byFixtures] = await Promise.all([
    listRawSoccerTeamsByLeague(league.id),
    teamsReferencedByFixtures(league.id, query.season),
  ]);

  const byId = new Map<string, RawDoc>();
  for (const doc of byLeague) byId.set(doc.id, doc);
  for (const doc of byFixtures) {
    if (!byId.has(doc.id)) byId.set(doc.id, doc);
  }

  return sortTeamEntries([...byId.values()]);
}
