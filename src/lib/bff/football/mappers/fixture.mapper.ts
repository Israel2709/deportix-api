import { asStr } from '@/lib/api/serializers';
import type { TeamMap } from '@/lib/api/serializers';
import { preferCanonicalString } from '@/lib/api/canonical-fields';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';

type Raw = Record<string, unknown>;

function asObj(value: unknown): Raw | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Raw) : null;
}

function cloneObj(value: unknown): Raw {
  const obj = asObj(value);
  return obj ? structuredClone(obj) : {};
}

function externalNumericId(value: string | null): number | string | null {
  if (!value) return null;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
}

function normalizeStatus(rawStatus: unknown): Raw {
  const statusObj = asObj(rawStatus);
  if (statusObj) return statusObj;
  if (typeof rawStatus === 'string') {
    return { long: rawStatus, short: rawStatus, elapsed: null };
  }
  return { long: null, short: null, elapsed: null };
}

function enrichTeamSide(
  side: Raw,
  teamId: string | null,
  teamMap: TeamMap | undefined,
  externalId: string | null,
): Raw {
  const enriched = { ...side };
  const fromMap = teamId && teamMap ? teamMap.get(teamId) : undefined;

  enriched.name = preferCanonicalString(fromMap?.name, asStr(enriched.name));
  enriched.logo = preferCanonicalString(fromMap?.logo, asStr(enriched.logo));
  if (enriched.id == null && externalId != null) enriched.id = externalNumericId(externalId);

  return enriched;
}

export interface FixtureLeagueContext {
  name: string | null;
  logo: string | null;
  countryName: string | null;
  countryFlag: string | null;
}

function enrichLeague(league: Raw, context: FixtureLeagueContext | null | undefined): Raw {
  if (!context) return league;

  league.name = preferCanonicalString(context.name, asStr(league.name));
  league.logo = preferCanonicalString(context.logo, asStr(league.logo));
  league.country = preferCanonicalString(context.countryName, asStr(league.country));
  league.flag = preferCanonicalString(context.countryFlag, asStr(league.flag));

  return league;
}

/** Map a raw soccer match document to the API-Sports fixture shape. */
export function mapRawSoccerMatchToApiSports(
  doc: RawDoc,
  teamMap?: TeamMap,
  teamExternalIds?: { home?: string | null; away?: string | null },
  leagueContext?: FixtureLeagueContext | null,
): Raw {
  const raw = doc.data;
  const fixture = cloneObj(raw.fixture);
  const league = enrichLeague(cloneObj(raw.league), leagueContext);
  const goals = cloneObj(raw.goals);
  const teamsRaw = asObj(raw.teams) ?? {};
  const home = enrichTeamSide(
    cloneObj(teamsRaw.home),
    asStr(raw.home_team_id),
    teamMap,
    teamExternalIds?.home ?? null,
  );
  const away = enrichTeamSide(
    cloneObj(teamsRaw.away),
    asStr(raw.away_team_id),
    teamMap,
    teamExternalIds?.away ?? null,
  );

  if (fixture.id == null && raw.external_id) {
    fixture.id = externalNumericId(asStr(raw.external_id));
  }
  if (!fixture.date) fixture.date = asStr(raw.fixture_date);
  if (!fixture.timezone) fixture.timezone = 'UTC';

  fixture.status = normalizeStatus(fixture.status ?? raw.status);

  const score = asObj(raw.score);

  return {
    fixture,
    league,
    teams: { home, away },
    goals,
    ...(score ? { score } : {}),
  };
}

const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT']);

export function isLiveMatch(raw: Raw): boolean {
  const fixture = asObj(raw.fixture);
  const statusShort = asStr(fixture?.status && asObj(fixture.status)?.short) ?? asStr(raw.status);
  return statusShort != null && LIVE_STATUSES.has(statusShort);
}

export function matchRoundName(raw: Raw): string | null {
  const league = asObj(raw.league);
  return asStr(league?.round) ?? asStr(raw.round);
}

export function matchDate(raw: Raw): string | null {
  const fixture = asObj(raw.fixture);
  return asStr(raw.fixture_date) ?? asStr(fixture?.date) ?? asStr(raw.date);
}

export function matchStatusShort(raw: Raw): string | null {
  const fixture = asObj(raw.fixture);
  const status = asObj(fixture?.status);
  return asStr(status?.short) ?? asStr(raw.status);
}

export function matchVenueName(raw: Raw): string | null {
  const fixture = asObj(raw.fixture);
  const venue = asObj(fixture?.venue);
  return asStr(venue?.name) ?? asStr(raw.venue);
}
