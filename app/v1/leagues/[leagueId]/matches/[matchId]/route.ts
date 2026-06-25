import { deleteRoute, patchRoute, optionsRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { invalidPathParameter, invalidRequestBody } from '@/lib/api/errors';
import { matchUpdateSchema } from '@/lib/api/match-patch';
import { requireGenericSport, requireLeague } from '@/lib/api/route-helpers';
import { deleteMatch, updateMatch } from '@/lib/firebase/repositories/matches.repository';
import { buildTeamMapForLeague } from '@/lib/firebase/repositories/teams.repository';

export const runtime = 'nodejs';

function requireMatchId(params: Record<string, string>): string {
  const matchId = params.matchId;
  if (!matchId) throw invalidPathParameter('Missing "matchId" path parameter.');
  return matchId;
}

export const PATCH = patchRoute(
  withAuth(async ({ params, body }) => {
    const league = await requireLeague(params);
    const sport = requireGenericSport(league, 'Matches');
    const matchId = requireMatchId(params);

    const parsed = matchUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw invalidRequestBody(
        parsed.error.issues[0]?.message ?? 'Request body is invalid.',
        parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      );
    }

    const teamMap = await buildTeamMapForLeague(league.id, sport);
    const match = await updateMatch(league.id, sport, matchId, parsed.data, teamMap);

    return {
      kind: 'resource',
      data: match,
      updatedAt: match.updatedAt,
      cache: CACHE.none,
    };
  }),
);

export const DELETE = deleteRoute(
  withAuth(async ({ params }) => {
    const league = await requireLeague(params);
    const sport = requireGenericSport(league, 'Matches');
    const matchId = requireMatchId(params);
    await deleteMatch(league.id, sport, matchId);
  }),
);

export const OPTIONS = optionsRoute();
