import { asStr, serializeTeam, type TeamMap } from '@/lib/api/serializers';
import type { TeamDTO } from '@/lib/contracts/dto';
import { getSportConfig, TEAM_COLLECTIONS, type SportSlug } from '../sport-registry';
import { fetchWhereEq, resolveDoc } from './helpers';

export async function listTeamsByLeague(leagueId: string, sport: SportSlug): Promise<TeamDTO[]> {
  const config = getSportConfig(sport);
  if (!config) return [];
  const docs = await fetchWhereEq(config.collections.teams, 'league_id', leagueId);
  return docs
    .map((doc) => serializeTeam(sport, doc.id, doc.data))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}

export interface TeamRecord {
  team: TeamDTO;
  sport: SportSlug;
}

/** Find a team by id (or external id) across every sport's team collection. */
export async function getTeamById(idOrExternalId: string): Promise<TeamRecord | null> {
  for (const { sport, collection } of TEAM_COLLECTIONS) {
    const doc = await resolveDoc(collection, idOrExternalId);
    if (doc) return { team: serializeTeam(sport, doc.id, doc.data), sport };
  }
  return null;
}

/** Build an id -> {name, logo} map for resolving denormalized match/standing sides. */
export async function buildTeamMapForLeague(
  leagueId: string,
  sport: SportSlug,
): Promise<TeamMap> {
  const teams = await listTeamsByLeague(leagueId, sport);
  const map: TeamMap = new Map();
  for (const team of teams) {
    map.set(team.id, { name: team.name, logo: team.logo });
  }
  return map;
}

/** Build an internal team id -> provider external id map for BFF serializers. */
export async function buildTeamExternalIdMap(
  leagueId: string,
  sport: SportSlug,
): Promise<Map<string, string | null>> {
  const config = getSportConfig(sport);
  if (!config) return new Map();
  const docs = await fetchWhereEq(config.collections.teams, 'league_id', leagueId);
  const map = new Map<string, string | null>();
  for (const doc of docs) {
    map.set(doc.id, asStr(doc.data.external_id));
  }
  return map;
}
