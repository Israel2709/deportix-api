import { asNum, asStr } from '@/lib/api/serializers';
import type { TeamMap } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { NflGameItem } from '../schemas/game.schema';
import { enrichTeamSide } from './team.mapper';

type Raw = Record<string, unknown>;

function asObj(value: unknown): Raw | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Raw) : null;
}

function externalNumericId(value: string | null): number | string | null {
  if (!value) return null;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
}

export function mapRawNflGameToApiSports(
  doc: RawDoc,
  teamMap?: TeamMap,
  teamExternalIds?: { home?: string | null; away?: string | null },
  leagueContext?: {
    id: number | string | null;
    name: string | null;
    season: number | string | null;
    logo: string | null;
    country?: { name: string | null; code: string | null; flag: string | null };
  } | null,
): NflGameItem {
  const raw = doc.data;
  const stored = raw.api_sports_payload;
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    return stored as NflGameItem;
  }

  const teamsRaw = asObj(raw.teams) ?? {};
  const homeTeamId = asStr(raw.home_team_id);
  const awayTeamId = asStr(raw.away_team_id);
  const gameDate = asStr(raw.game_date) ?? asStr(raw.date);
  const timestamp = gameDate ? Math.floor(new Date(gameDate).getTime() / 1000) : null;

  const statusRaw = asObj(raw.status) ?? {};
  const venueRaw = asObj(raw.venue) ?? (typeof raw.venue === 'string' ? { name: raw.venue } : {});

  return {
    game: {
      id: externalNumericId(asStr(raw.external_id)) ?? doc.id,
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
      id: leagueContext?.id ?? 0,
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
        teamExternalIds?.home ?? null,
      ) as NflGameItem['teams']['home'],
      away: enrichTeamSide(
        asObj(teamsRaw.away) ?? {},
        awayTeamId,
        teamMap,
        teamExternalIds?.away ?? null,
      ) as NflGameItem['teams']['away'],
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

export function nflGameDate(raw: Raw): string | null {
  return asStr(raw.game_date) ?? asStr(raw.date);
}

export function nflGameExternalId(raw: Raw): string | null {
  const game = asObj(raw.game);
  const fromGame = game ? asStr(game.id) : null;
  return fromGame ?? asStr(raw.external_id);
}
