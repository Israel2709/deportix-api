import type { LeagueDTO } from '@/lib/contracts/dto';
import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';
import type { TeamMap } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import { asStr } from '@/lib/api/serializers';

function leagueExternalId(externalId: string | null): number | string | null {
  if (!externalId) return null;
  const numeric = Number(externalId);
  return Number.isNaN(numeric) ? externalId : numeric;
}

function standingRow(
  rank: number,
  doc: RawDoc,
  teamMap: TeamMap,
  teamExternalIds: Map<string, string | null>,
): Record<string, unknown> {
  const raw = doc.data;
  const teamId = asStr(raw.team_id);
  const teamInfo = teamId ? teamMap.get(teamId) : undefined;
  const teamExternalId = teamId ? teamExternalIds.get(teamId) : null;
  const numericTeamId = teamExternalId ? Number(teamExternalId) : null;

  // Prefer API-Sports external id when present; otherwise keep Firestore team id
  // so BO re-saves never send an empty `team.id` (Zod min(1)).
  const resolvedTeamId =
    numericTeamId != null && !Number.isNaN(numericTeamId)
      ? numericTeamId
      : teamExternalId || teamId || null;

  const storedRank =
    typeof raw.rank === 'number' && Number.isFinite(raw.rank) ? raw.rank : null;

  return {
    rank: storedRank ?? rank,
    team: {
      id: resolvedTeamId,
      name: teamInfo?.name ?? null,
      logo: teamInfo?.logo ?? null,
    },
    points: raw.points ?? null,
    goalsDiff: raw.goals_diff ?? raw.goalsDiff ?? null,
    group: 'Overall',
    form: raw.form ?? null,
    status: raw.status ?? null,
    description: raw.description ?? null,
    all: {
      played: raw.played ?? null,
      win: raw.wins ?? null,
      draw: raw.draws ?? null,
      lose: raw.losses ?? null,
      goals: {
        for: raw.goals_for ?? null,
        against: raw.goals_against ?? null,
      },
    },
    home: raw.home ?? null,
    away: raw.away ?? null,
  };
}

/** One row per team (keep newest updated_at); sort by stored rank then points. */
function dedupeStandingDocs(docs: RawDoc[]): RawDoc[] {
  const byTeam = new Map<string, RawDoc>();
  for (const doc of docs) {
    const teamId = asStr(doc.data.team_id);
    if (!teamId) continue;
    const prev = byTeam.get(teamId);
    if (!prev) {
      byTeam.set(teamId, doc);
      continue;
    }
    const prevUpdated = asStr(prev.data.updated_at) ?? '';
    const nextUpdated = asStr(doc.data.updated_at) ?? '';
    if (nextUpdated >= prevUpdated) byTeam.set(teamId, doc);
  }

  return [...byTeam.values()].sort((a, b) => {
    const rankA = typeof a.data.rank === 'number' ? a.data.rank : Number.MAX_SAFE_INTEGER;
    const rankB = typeof b.data.rank === 'number' ? b.data.rank : Number.MAX_SAFE_INTEGER;
    if (rankA !== rankB) return rankA - rankB;
    const ptsA = typeof a.data.points === 'number' ? a.data.points : 0;
    const ptsB = typeof b.data.points === 'number' ? b.data.points : 0;
    return ptsB - ptsA;
  });
}

export function mapStandingsToApiSports(
  league: LeagueDTO,
  country: CountryRecord | null,
  seasonYear: number,
  docs: RawDoc[],
  teamMap: TeamMap,
  teamExternalIds: Map<string, string | null>,
): Record<string, unknown> {
  const unique = dedupeStandingDocs(docs);
  const rows = unique.map((doc, index) =>
    standingRow(index + 1, doc, teamMap, teamExternalIds),
  );

  return {
    league: {
      id: leagueExternalId(league.externalId),
      name: league.name,
      country: country?.name ?? league.country,
      logo: league.logo,
      flag: country?.flag ?? null,
      season: seasonYear,
      standings: [rows],
    },
  };
}
