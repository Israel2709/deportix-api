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

  return {
    rank,
    team: {
      id: numericTeamId != null && !Number.isNaN(numericTeamId) ? numericTeamId : teamExternalId,
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

export function mapStandingsToApiSports(
  league: LeagueDTO,
  country: CountryRecord | null,
  seasonYear: number,
  docs: RawDoc[],
  teamMap: TeamMap,
  teamExternalIds: Map<string, string | null>,
): Record<string, unknown> {
  const rows = docs.map((doc, index) => standingRow(index + 1, doc, teamMap, teamExternalIds));

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
