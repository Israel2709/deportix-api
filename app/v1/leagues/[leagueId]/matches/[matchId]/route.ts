import { patchRoute, optionsRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { invalidPathParameter, invalidRequestBody } from '@/lib/api/errors';
import { matchUpdateSchema } from '@/lib/api/match-patch';
import { requireGenericSport, requireLeague } from '@/lib/api/route-helpers';
import { updateMatch } from '@/lib/firebase/repositories/matches.repository';
import { buildTeamMapForLeague } from '@/lib/firebase/repositories/teams.repository';

export const runtime = 'nodejs';

export const PATCH = patchRoute(
  withAuth(async ({ params, body }) => {
    const league = await requireLeague(params);
    const sport = requireGenericSport(league, 'Matches');

    const matchId = params.matchId;
    if (!matchId) throw invalidPathParameter('Missing "matchId" path parameter.');

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

export const OPTIONS = optionsRoute();
