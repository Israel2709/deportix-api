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

/**
 * Prefer top-level `status` when it disagrees with nested `fixture.status`.
 * BO PATCHes historically wrote only the top-level field; imported blobs keep a
 * stale nested short (e.g. NS) that would otherwise win on read.
 */
function resolveFixtureStatus(raw: Raw, fixture: Raw): Raw {
  const nested = asObj(fixture.status);
  const top = raw.status;
  if (typeof top === 'string' && top.trim()) {
    const topShort = top.trim().toUpperCase();
    const nestedShort = asStr(nested?.short)?.toUpperCase() ?? null;
    if (!nestedShort || nestedShort !== topShort) {
      return normalizeStatus(top);
    }
  }
  return normalizeStatus(nested ?? top);
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

  // Preserve provider id for App QD, but always expose Firestore id as `id` when we
  // have it. Imported Liga MX fixtures keep stale numeric ids on teams.*; leaving
  // those as `id` broke BO standings (EQ 2295 instead of names, duplicated rows).
  const providerId =
    (externalId != null && String(externalId).trim() !== ''
      ? externalNumericId(externalId)
      : null) ??
    (enriched.id != null && String(enriched.id).trim() !== '' && teamId && String(enriched.id) !== teamId
      ? externalNumericId(String(enriched.id))
      : null);
  if (providerId != null) enriched.external_id = providerId;

  if (teamId) {
    enriched.id = teamId;
  } else if (enriched.id == null || String(enriched.id).trim() === '') {
    if (providerId != null) enriched.id = providerId;
  }

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

  if (fixture.id == null || String(fixture.id).trim() === '') {
    if (raw.external_id) {
      fixture.id = externalNumericId(asStr(raw.external_id));
    }
    // BO-created matches often have no provider external_id; use the Firestore doc id
    // so list → edit → PATCH updates the same fixture instead of POSTing a duplicate.
    if (fixture.id == null || String(fixture.id).trim() === '') {
      fixture.id = doc.id;
    }
  }
  if (!fixture.date) fixture.date = asStr(raw.fixture_date);
  if (!fixture.timezone) fixture.timezone = 'UTC';

  fixture.status = resolveFixtureStatus(raw, fixture);

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
