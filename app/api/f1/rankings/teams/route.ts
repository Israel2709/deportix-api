import { parseSeasonParam } from '@/lib/api/query-validation';
import { f1ListRoute, f1OptionsRoute } from '@/lib/api/f1-route';
import { listF1TeamRankings } from '@/lib/firebase/repositories/f1.repository';

export const runtime = 'nodejs';

export const GET = f1ListRoute(async (searchParams) =>
  listF1TeamRankings(parseSeasonParam(searchParams.get('season'))),
);
export const OPTIONS = f1OptionsRoute();
