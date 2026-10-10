import { CACHE } from '@/lib/api/cache';
import { ApiError } from '@/lib/api/errors';
import {
  bffOptionsRoute,
  formula1BffGetRoute,
  formula1BffPostRoute,
} from '@/lib/bff/shared/handler';
import { parseSeasonParam, parseStringParam } from '@/lib/api/query-validation';
import { fetchFormula1Entries } from '@/lib/bff/formula-1/services/entries.service';
import { createFormula1Entry } from '@/lib/bff/formula-1/writers/entries.writer';

export const runtime = 'nodejs';

function requireCompetitionId(params: Record<string, string>): string {
  const competitionId = params.competitionId;
  if (!competitionId) {
    throw new ApiError(
      'INVALID_QUERY_PARAMETER',
      'The "competitionId" path parameter is required.',
    );
  }
  return competitionId;
}

export const GET = formula1BffGetRoute('entries')(async ({ params, searchParams }) => {
  const response = await fetchFormula1Entries({
    competitionId: requireCompetitionId(params),
    season: parseSeasonParam(searchParams.get('season')),
    driverId: parseStringParam(searchParams.get('driver')),
    teamId: parseStringParam(searchParams.get('team')),
  });
  return { response, cache: CACHE.none };
});

export const POST = formula1BffPostRoute('entries')(async ({ params, body }) => {
  const competitionId = requireCompetitionId(params);
  const payload =
    body && typeof body === 'object'
      ? { ...(body as Record<string, unknown>), competitionId }
      : body;
  const item = await createFormula1Entry(payload);
  return { response: [item], status: 201 };
});

export const OPTIONS = bffOptionsRoute();
