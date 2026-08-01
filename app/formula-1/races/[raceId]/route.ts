import { ApiError } from '@/lib/api/errors';
import { CACHE } from '@/lib/api/cache';
import {
  bffOptionsRoute,
  formula1BffDeleteRoute,
  formula1BffGetRoute,
  formula1BffPatchRoute,
} from '@/lib/bff/shared/handler';
import { fetchFormula1Races } from '@/lib/bff/formula-1/services/races.service';
import { deleteFormula1Race, updateFormula1Race } from '@/lib/bff/formula-1/writers/races.writer';

export const runtime = 'nodejs';

function requireRaceId(params: Record<string, string>): string {
  const raceId = params.raceId;
  if (!raceId) throw new ApiError('INVALID_QUERY_PARAMETER', 'The "raceId" path parameter is required.');
  return raceId;
}

export const GET = formula1BffGetRoute('races')(async ({ params }) => {
  const response = await fetchFormula1Races({ id: requireRaceId(params) });
  return { response, cache: CACHE.dynamic };
});

export const PATCH = formula1BffPatchRoute('races')(async ({ params, body }) => {
  const item = await updateFormula1Race(requireRaceId(params), body);
  return { response: [item] };
});

export const DELETE = formula1BffDeleteRoute('races')(async ({ params }) => {
  await deleteFormula1Race(requireRaceId(params));
  return { response: [], status: 204 };
});

export const OPTIONS = bffOptionsRoute();
