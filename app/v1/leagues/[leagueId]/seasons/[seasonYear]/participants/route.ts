import { z } from 'zod';
import { getRoute, optionsRoute, patchRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { dataNotAvailable, invalidPathParameter, invalidRequestBody } from '@/lib/api/errors';
import { requireLeague } from '@/lib/api/route-helpers';
import { findSeasonByYear } from '@/lib/firebase/repositories/seasons.repository';
import {
  listParticipantsBySeason,
  replaceSeasonParticipants,
} from '@/lib/firebase/repositories/soccer-season-participants.repository';

export const runtime = 'nodejs';

const replaceBodySchema = z
  .object({
    team_ids: z.array(z.string().min(1)),
  })
  .strict();

function parseSeasonYear(params: Record<string, string>): number {
  const raw = params.seasonYear;
  if (!raw) throw invalidPathParameter('Missing "seasonYear" path parameter.');
  const year = Number(raw);
  if (!Number.isInteger(year) || year < 1800 || year > 3000) {
    throw invalidPathParameter(`Invalid seasonYear: ${raw}`);
  }
  return year;
}

export const GET = getRoute(
  withAuth(async ({ params }) => {
    const league = await requireLeague(params);
    if (league.sportSlug !== 'soccer') {
      throw dataNotAvailable('Season participants are only available for soccer.');
    }
    const year = parseSeasonYear(params);
    const season = await findSeasonByYear(league.id, year);
    if (!season) throw dataNotAvailable(`Season ${year} was not found for this league.`);

    const participants = await listParticipantsBySeason(season.id);
    return {
      kind: 'collection',
      data: participants.map((row) => ({
        id: row.id,
        season_id: row.seasonId,
        league_id: row.leagueId,
        team_id: row.teamId,
        external_id: row.externalId,
      })),
      pagination: { page: 1, pageSize: participants.length, total: participants.length },
      cache: CACHE.none,
    };
  }),
);

/** Replace the full participant set for a competition season. */
export const PUT = patchRoute(
  withAuth(async ({ params, body }) => {
    const league = await requireLeague(params);
    if (league.sportSlug !== 'soccer') {
      throw dataNotAvailable('Season participants are only available for soccer.');
    }
    const year = parseSeasonYear(params);
    const season = await findSeasonByYear(league.id, year);
    if (!season) throw dataNotAvailable(`Season ${year} was not found for this league.`);

    const parsed = replaceBodySchema.safeParse(body);
    if (!parsed.success) {
      throw invalidRequestBody(
        parsed.error.issues[0]?.message ?? 'Body must include { team_ids: string[] }.',
      );
    }

    const participants = await replaceSeasonParticipants({
      seasonId: season.id,
      leagueId: league.id,
      teamIds: parsed.data.team_ids,
    });

    return {
      kind: 'collection',
      data: participants.map((row) => ({
        id: row.id,
        season_id: row.seasonId,
        league_id: row.leagueId,
        team_id: row.teamId,
        external_id: row.externalId,
      })),
      pagination: { page: 1, pageSize: participants.length, total: participants.length },
      cache: CACHE.none,
    };
  }),
);

export const OPTIONS = optionsRoute();
