import { asNum, asStr } from '@/lib/api/serializers';
import type { LeagueDTO } from '@/lib/contracts/dto';
import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';
import type { TeamMap } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { NflStandingItem } from '../schemas/standing.schema';

function leagueExternalId(externalId: string | null): number | string | null {
  if (!externalId) return null;
  const numeric = Number(externalId);
  return Number.isNaN(numeric) ? externalId : numeric;
}

function teamExternalNumeric(externalId: string | null): number | string | null {
  if (!externalId) return null;
  const numeric = Number(externalId);
  return Number.isNaN(numeric) ? externalId : numeric;
}

export function mapRawNflStandingToApiSports(
  doc: RawDoc,
  league: LeagueDTO,
  country: CountryRecord | null,
  seasonYear: number,
  teamMap: TeamMap,
  teamExternalIds: Map<string, string | null>,
): NflStandingItem {
  const raw = doc.data;
  const stored = raw.api_sports_payload;
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    return stored as NflStandingItem;
  }

  const teamId = asStr(raw.team_id);
  const teamInfo = teamId ? teamMap.get(teamId) : undefined;
  const teamExternalId = teamId ? teamExternalIds.get(teamId) : null;

  return {
    league: {
      id: leagueExternalId(league.externalId) ?? 0,
      name: league.name ?? '',
      season: seasonYear,
      logo: league.logo,
      country: {
        name: country?.name ?? league.country ?? '',
        code: country?.code ?? null,
        flag: country?.flag ?? null,
      },
    },
    conference: asStr(raw.conference),
    division: asStr(raw.division),
    position: asNum(raw.position),
    team: {
      id: teamExternalNumeric(teamExternalId ?? null) ?? teamId ?? 0,
      name: teamInfo?.name ?? asStr(raw.team_name) ?? '',
      logo: teamInfo?.logo ?? asStr(raw.team_logo),
    },
    won: asNum(raw.wins),
    lost: asNum(raw.losses),
    ties: asNum(raw.ties),
    points: {
      for: asNum(raw.points_for),
      against: asNum(raw.points_against),
      difference:
        asNum(raw.points_difference) ??
        (asNum(raw.points_for) != null && asNum(raw.points_against) != null
          ? (asNum(raw.points_for) as number) - (asNum(raw.points_against) as number)
          : null),
    },
    records: (raw.records as NflStandingItem['records']) ?? {
      home: asStr(raw.record_home),
      road: asStr(raw.record_road),
      conference: asStr(raw.record_conference),
      division: asStr(raw.record_division),
    },
    streak: asStr(raw.streak),
    ncaa_conference: (raw.ncaa_conference as NflStandingItem['ncaa_conference']) ?? {
      won: null,
      lost: null,
      points: { for: null, against: null },
    },
  };
}
