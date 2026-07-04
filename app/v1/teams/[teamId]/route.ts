import { getRoute, optionsRoute, patchRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { invalidPathParameter, invalidRequestBody, notFound } from '@/lib/api/errors';
import { teamUpdateSchema } from '@/lib/api/team-patch';
import { getTeamById, updateTeam } from '@/lib/firebase/repositories/teams.repository';

export const runtime = 'nodejs';

export const GET = getRoute(
  withAuth(async ({ params }) => {
    const teamId = params.teamId;
    if (!teamId) throw invalidPathParameter('Missing "teamId" path parameter.');
    const record = await getTeamById(teamId);
    if (!record) throw notFound('Team not found.');
    return {
      kind: 'resource',
      data: record.team,
      updatedAt: record.team.updatedAt,
      cache: CACHE.standard,
    };
  }),
);

export const PATCH = patchRoute(
  withAuth(async ({ params, body }) => {
    const teamId = params.teamId;
    if (!teamId) throw invalidPathParameter('Missing "teamId" path parameter.');

    const parsed = teamUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw invalidRequestBody(
        parsed.error.issues[0]?.message ?? 'Request body is invalid.',
        parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      );
    }

    const record = await updateTeam(teamId, parsed.data);
    return {
      kind: 'resource',
      data: record.team,
      updatedAt: record.team.updatedAt,
      cache: CACHE.none,
    };
  }),
);

export const OPTIONS = optionsRoute();
