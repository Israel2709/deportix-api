import { dataNotAvailable, invalidPathParameter, notFound } from './errors';
import type { RouteOutput } from './handler';
import { getLeague, type LeagueRecord } from '@/lib/firebase/repositories/leagues.repository';
import { getSportConfig, type SportSlug } from '@/lib/firebase/sport-registry';

/** Resolve `:leagueId` to a league or throw the appropriate API error. */
export async function requireLeague(params: Record<string, string>): Promise<LeagueRecord> {
  const leagueId = params.leagueId;
  if (!leagueId) throw invalidPathParameter('Missing "leagueId" path parameter.');
  const league = await getLeague(leagueId);
  if (!league) throw notFound('League not found.');
  return league;
}

/**
 * Ensure a league's sport supports the generic team/match/standings endpoints (excludes F1)
 * and return its slug. Throws DATA_NOT_AVAILABLE otherwise.
 */
export function requireGenericSport(league: LeagueRecord, resource: string): SportSlug {
  const config = league.sportSlug ? getSportConfig(league.sportSlug) : null;
  if (!config || !config.genericEndpointsSupported || !league.sportSlug) {
    throw dataNotAvailable(`${resource} are not available for this league's sport.`);
  }
  return league.sportSlug;
}

/** A valid, empty collection response (used when a filter matches nothing). */
export function emptyCollection(page: number, pageSize: number): RouteOutput {
  return { kind: 'collection', data: [], pagination: { page, pageSize, total: 0 } };
}
