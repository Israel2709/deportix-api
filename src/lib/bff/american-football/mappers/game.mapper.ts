import { asNum, asStr } from '@/lib/api/serializers';
import type { TeamMap } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { AmericanFootballGameItem } from '../schemas/game.schema';
import { enrichTeamSide } from './team.mapper';

type Raw = Record<string, unknown>;

function asObj(value: unknown): Raw | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Raw) : null;
}

export function mapRawAmericanFootballGameToApiSports(
  doc: RawDoc,
  teamMap?: TeamMap,
  _teamExternalIds?: { home?: string | null; away?: string | null },
  leagueContext?: {
    id: string;
    name: string | null;
    season: number | string | null;
    logo: string | null;
    country?: { name: string | null; code: string | null; flag: string | null };
  } | null,
): AmericanFootballGameItem {
  const raw = doc.data;
  const teamsRaw = asObj(raw.teams) ?? {};
  const homeTeamId = asStr(raw.home_team_id);
  const awayTeamId = asStr(raw.away_team_id);
  const gameDate = asStr(raw.game_date) ?? asStr(raw.date);
  const timestamp = gameDate ? Math.floor(new Date(gameDate).getTime() / 1000) : null;

  const statusRaw = asObj(raw.status) ?? {};
  const venueRaw = asObj(raw.venue) ?? (typeof raw.venue === 'string' ? { name: raw.venue } : {});

  return {
    game: {
      id: doc.id,
      stage: asStr(raw.stage),
      week: asStr(raw.week) ?? asStr(raw.round),
      date: {
        timezone: 'UTC',
        date: gameDate?.slice(0, 10) ?? null,
        time: gameDate?.slice(11, 16) ?? null,
        timestamp,
      },
      venue: {
        name: asStr(venueRaw.name),
        city: asStr(venueRaw.city),
      },
      status: {
        short: asStr(statusRaw.short) ?? asStr(raw.status),
        long: asStr(statusRaw.long) ?? asStr(raw.status),
        timer: asStr(statusRaw.timer),
      },
    },
    league: {
      id: leagueContext?.id ?? asStr(raw.league_id) ?? '',
      name: leagueContext?.name ?? '',
      season: leagueContext?.season ?? undefined,
      logo: leagueContext?.logo,
      country: leagueContext?.country
        ? {
            name: leagueContext.country.name ?? '',
            code: leagueContext.country.code,
            flag: leagueContext.country.flag,
          }
        : undefined,
    },
    teams: {
      home: enrichTeamSide(
        asObj(teamsRaw.home) ?? {},
        homeTeamId,
        teamMap,
      ) as AmericanFootballGameItem['teams']['home'],
      away: enrichTeamSide(
        asObj(teamsRaw.away) ?? {},
        awayTeamId,
        teamMap,
      ) as AmericanFootballGameItem['teams']['away'],
    },
    scores: {
      home: {
        total: asNum(raw.home_score),
      },
      away: {
        total: asNum(raw.away_score),
      },
    },
  };
}

export function americanFootballGameDate(raw: Raw): string | null {
  return asStr(raw.game_date) ?? asStr(raw.date);
}

export function americanFootballGameExternalId(raw: Raw): string | null {
  return asStr(raw.external_id);
}
