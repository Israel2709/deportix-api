import { CACHE } from '@/lib/api/cache';
import { ApiError } from '@/lib/api/errors';
import {
  bffOptionsRoute,
  tennisBffGetRoute,
  tennisBffPostRoute,
} from '@/lib/bff/shared/handler';
import { fetchTennisEntries } from '@/lib/bff/tennis/services/entries.service';
import { createTennisEntry } from '@/lib/bff/tennis/writers/entries.writer';

export const runtime = 'nodejs';

function requireTournamentId(params: Record<string, string>): string {
  const tournamentId = params.tournamentId;
  if (!tournamentId) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "tournamentId" path parameter is required.');
  }
  return tournamentId;
}

export const GET = tennisBffGetRoute('entries')(async ({ params, searchParams }) => {
  const published =
    searchParams.get('published') === 'all'
      ? 'all'
      : searchParams.get('published') === 'false'
        ? 'false'
        : 'true';
  const response = await fetchTennisEntries({
    tournamentId: requireTournamentId(params),
    search: searchParams.get('search')?.trim() || undefined,
    published,
  });
  return { response, cache: CACHE.none };
});

export const POST = tennisBffPostRoute('entries')(async ({ params, body }) => {
  const tournamentId = requireTournamentId(params);
  const payload =
    body && typeof body === 'object' ? { ...(body as Record<string, unknown>), tournamentId } : body;
  const item = await createTennisEntry(payload);
  return { response: [item], status: 201 };
});

export const OPTIONS = bffOptionsRoute();
