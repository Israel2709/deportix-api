import { CACHE } from '@/lib/api/cache';
import { ApiError } from '@/lib/api/errors';
import {
  bffOptionsRoute,
  tennisBffGetRoute,
  tennisBffPostRoute,
} from '@/lib/bff/shared/handler';
import { fetchTennisMatches } from '@/lib/bff/tennis/services/matches.service';
import { createTennisMatch } from '@/lib/bff/tennis/writers/matches.writer';
import type { PublishedFilter } from '@/lib/bff/tennis/query-params';

export const runtime = 'nodejs';

function requireTournamentId(params: Record<string, string>): string {
  const tournamentId = params.tournamentId;
  if (!tournamentId) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "tournamentId" path parameter is required.');
  }
  return tournamentId;
}

function publishedFilter(raw: string | null): PublishedFilter {
  if (raw === 'all' || raw === 'false') return raw;
  return 'true';
}

export const GET = tennisBffGetRoute('matches')(async ({ params, searchParams }) => {
  const response = await fetchTennisMatches({
    tournamentId: requireTournamentId(params),
    roundId: searchParams.get('round')?.trim() || undefined,
    status: searchParams.get('status')?.trim() || undefined,
    published: publishedFilter(searchParams.get('published')),
  });
  return { response, cache: CACHE.none };
});

export const POST = tennisBffPostRoute('matches')(async ({ params, body }) => {
  const tournamentId = requireTournamentId(params);
  const payload =
    body && typeof body === 'object' ? { ...(body as Record<string, unknown>), tournamentId } : body;
  const item = await createTennisMatch(payload);
  return { response: [item], status: 201 };
});

export const OPTIONS = bffOptionsRoute();
