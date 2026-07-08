import { asNum, asStr } from '@/lib/api/serializers';
import type { LeagueDTO } from '@/lib/contracts/dto';
import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';
import type { TeamMap } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { AmericanFootballStandingItem } from '../schemas/standing.schema';

export function mapRawAmericanFootballStandingToApiSports(
  doc: RawDoc,
  league: LeagueDTO,
  country: CountryRecord | null,
  seasonYear: number,
  teamMap: TeamMap,
): AmericanFootballStandingItem {
  const raw = doc.data;
  const teamId = asStr(raw.team_id);
  const teamInfo = teamId ? teamMap.get(teamId) : undefined;

  return {
    id: doc.id,
    league: {
      id: league.id,
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
      id: teamId ?? '',
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
    records: (raw.records as AmericanFootballStandingItem['records']) ?? {
      home: asStr(raw.record_home),
      road: asStr(raw.record_road),
      conference: asStr(raw.record_conference),
      division: asStr(raw.record_division),
    },
    streak: asStr(raw.streak),
    ncaa_conference: (raw.ncaa_conference as AmericanFootballStandingItem['ncaa_conference']) ?? {
      won: null,
      lost: null,
      points: { for: null, against: null },
    },
  };
}
