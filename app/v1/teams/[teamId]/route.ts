import { getRoute, optionsRoute } from '@/lib/api/handler';
import { withAuth } from '@/lib/api/with-auth';
import { CACHE } from '@/lib/api/cache';
import { invalidPathParameter, notFound } from '@/lib/api/errors';
import { getTeamById } from '@/lib/firebase/repositories/teams.repository';

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

export const OPTIONS = optionsRoute();
