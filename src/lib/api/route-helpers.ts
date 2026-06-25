import { dataNotAvailable, invalidPathParameter, invalidRequestBody, notFound } from './errors';
import type { RouteOutput } from './handler';
import type { SeasonDTO } from '@/lib/contracts/dto';
import { getLeague, type LeagueRecord } from '@/lib/firebase/repositories/leagues.repository';
import {
  findSeasonByYear,
  findSeasonInLeague,
  getCurrentSeason,
} from '@/lib/firebase/repositories/seasons.repository';
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

/**
 * Resolve which season a new match should belong to.
 * Priority: `?season=` (year) and/or body `seasonId` (must agree when both are sent) → current season.
 */
export async function resolveCreateSeason(
  leagueId: string,
  seasonYear: number | undefined,
  seasonId: string | null | undefined,
): Promise<SeasonDTO> {
  if (seasonYear != null && seasonId) {
    const byYear = await findSeasonByYear(leagueId, seasonYear);
    const byId = await findSeasonInLeague(leagueId, seasonId);
    if (!byYear || !byId || byYear.id !== byId.id) {
      throw invalidRequestBody(
        'The "season" query parameter and body "seasonId" must refer to the same season.',
      );
    }
    return byYear;
  }

  if (seasonYear != null) {
    const season = await findSeasonByYear(leagueId, seasonYear);
    if (!season) {
      throw dataNotAvailable(`Season ${seasonYear} was not found for this league.`);
    }
    return season;
  }

  if (seasonId) {
    const season = await findSeasonInLeague(leagueId, seasonId);
    if (!season) {
      throw invalidRequestBody('seasonId is not valid for this league.');
    }
    return season;
  }

  const season = await getCurrentSeason(leagueId);
  if (!season) {
    throw dataNotAvailable('No current season configured for this league.');
  }
  return season;
}
