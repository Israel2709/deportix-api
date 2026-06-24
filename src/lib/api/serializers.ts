import type {
  LeagueDTO,
  MatchDTO,
  MatchSideDTO,
  SeasonDTO,
  SportDTO,
  StandingDTO,
  TeamDTO,
  VenueDTO,
} from '@/lib/contracts/dto';
import type { SportSlug } from '@/lib/firebase/sport-registry';

/**
 * Defensive field accessors. Firestore documents are loosely typed and may be partial, so
 * every read is validated and falls back to null rather than throwing — the API must show
 * whatever exists, even when incomplete.
 */
type Raw = Record<string, unknown>;

export function asStr(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function asNum(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

export function asBool(value: unknown): boolean {
  return value === true;
}

function asObj(value: unknown): Raw | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Raw) : null;
}

/** Best-effort "last updated" timestamp for a document. */
export function updatedAtOf(raw: Raw): string | null {
  return asStr(raw.updated_at) ?? asStr(raw.created_at);
}

/** Latest `updatedAt` across a set of DTOs, for the collection `meta.updatedAt`. */
export function pickLatestUpdatedAt(items: Array<{ updatedAt?: string | null }>): string | null {
  let latest: string | null = null;
  for (const item of items) {
    const value = item.updatedAt ?? null;
    if (value && (latest === null || value > latest)) latest = value;
  }
  return latest;
}

export interface TeamLookup {
  name: string | null;
  logo: string | null;
}

export type TeamMap = Map<string, TeamLookup>;

export function serializeSport(id: string, raw: Raw): SportDTO {
  return {
    id,
    slug: asStr(raw.slug),
    name: asStr(raw.name),
    logo: asStr(raw.logo),
  };
}

export function serializeLeague(
  id: string,
  raw: Raw,
  resolved: { sport: string | null; country: string | null },
): LeagueDTO {
  return {
    id,
    externalId: asStr(raw.external_id),
    name: asStr(raw.name),
    type: asStr(raw.type),
    sport: resolved.sport,
    country: resolved.country,
    logo: asStr(raw.logo),
    updatedAt: updatedAtOf(raw),
  };
}

export function serializeSeason(id: string, raw: Raw): SeasonDTO {
  return {
    id,
    leagueId: asStr(raw.league_id),
    year: asNum(raw.year),
    startDate: asStr(raw.start_date),
    endDate: asStr(raw.end_date),
    current: asBool(raw.current),
    externalId: asStr(raw.external_id),
  };
}

function serializeVenue(value: unknown): VenueDTO | null {
  const venue = asObj(value);
  if (!venue) return null;
  return {
    id: asNum(venue.id),
    name: asStr(venue.name),
    city: asStr(venue.city),
    capacity: asNum(venue.capacity),
  };
}

export function serializeTeam(sport: SportSlug | null, id: string, raw: Raw): TeamDTO {
  const base: TeamDTO = {
    id,
    externalId: asStr(raw.external_id),
    sport,
    leagueId: asStr(raw.league_id),
    name: null,
    code: null,
    country: null,
    logo: null,
    city: null,
    conference: null,
    division: null,
    venue: null,
    updatedAt: updatedAtOf(raw),
  };

  if (sport === 'soccer') {
    const team = asObj(raw.team) ?? {};
    return {
      ...base,
      name: asStr(team.name) ?? asStr(raw.name),
      code: asStr(team.code),
      country: asStr(team.country),
      logo: asStr(team.logo) ?? asStr(raw.logo),
      venue: serializeVenue(raw.venue),
    };
  }

  if (sport === 'nfl') {
    return {
      ...base,
      name: asStr(raw.name),
      code: asStr(raw.code),
      city: asStr(raw.city),
      conference: asStr(raw.conference),
      division: asStr(raw.division),
      logo: asStr(raw.logo),
    };
  }

  // Fallback for any other sport: surface common top-level fields.
  return {
    ...base,
    name: asStr(raw.name),
    logo: asStr(raw.logo),
  };
}

function side(
  teamId: string | null,
  denormName: string | null,
  denormLogo: string | null,
  score: number | null,
  teamMap?: TeamMap,
): MatchSideDTO {
  const fromMap = teamId && teamMap ? teamMap.get(teamId) : undefined;
  return {
    teamId,
    name: denormName ?? fromMap?.name ?? null,
    logo: denormLogo ?? fromMap?.logo ?? null,
    score,
  };
}

export function serializeMatch(
  sport: SportSlug | null,
  id: string,
  raw: Raw,
  teamMap?: TeamMap,
): MatchDTO {
  const base = {
    id,
    externalId: asStr(raw.external_id),
    sport,
    leagueId: asStr(raw.league_id),
    seasonId: asStr(raw.season_id),
    updatedAt: updatedAtOf(raw),
  };

  if (sport === 'soccer') {
    const goals = asObj(raw.goals) ?? {};
    const teams = asObj(raw.teams) ?? {};
    const homeTeam = asObj(teams.home) ?? {};
    const awayTeam = asObj(teams.away) ?? {};
    const league = asObj(raw.league) ?? {};
    const fixture = asObj(raw.fixture) ?? {};
    const fixtureVenue = asObj(fixture.venue) ?? {};
    return {
      ...base,
      date: asStr(raw.fixture_date) ?? asStr(fixture.date),
      status: asStr(raw.status),
      round: asStr(league.round),
      venue: asStr(fixtureVenue.name),
      home: side(
        asStr(raw.home_team_id),
        asStr(homeTeam.name),
        asStr(homeTeam.logo),
        asNum(goals.home),
        teamMap,
      ),
      away: side(
        asStr(raw.away_team_id),
        asStr(awayTeam.name),
        asStr(awayTeam.logo),
        asNum(goals.away),
        teamMap,
      ),
    };
  }

  // NFL (and generic) — leaner, denormalized names usually absent so rely on teamMap.
  return {
    ...base,
    date: asStr(raw.game_date) ?? asStr(raw.fixture_date) ?? asStr(raw.date),
    status: asStr(raw.status),
    round: asStr(raw.round),
    venue: asStr(raw.venue),
    home: side(asStr(raw.home_team_id), null, null, asNum(raw.home_score), teamMap),
    away: side(asStr(raw.away_team_id), null, null, asNum(raw.away_score), teamMap),
  };
}

export function serializeStanding(
  sport: SportSlug | null,
  raw: Raw,
  teamMap?: TeamMap,
): StandingDTO {
  const teamId = asStr(raw.team_id);
  return {
    teamId,
    teamName: (teamId && teamMap?.get(teamId)?.name) ?? null,
    points: asNum(raw.points),
    played: asNum(raw.played),
    wins: asNum(raw.wins),
    draws: sport === 'nfl' ? null : asNum(raw.draws),
    losses: asNum(raw.losses),
    ties: sport === 'nfl' ? asNum(raw.ties) : null,
  };
}
