import { f1ListRoute, f1OptionsRoute } from '@/lib/api/f1-route';
import { listF1RaceRankings } from '@/lib/firebase/repositories/f1.repository';

export const runtime = 'nodejs';

export const GET = f1ListRoute(async (searchParams) => {
  const raceId = searchParams.get('race_id') ?? searchParams.get('race') ?? undefined;
  return listF1RaceRankings(raceId || undefined);
});
export const OPTIONS = f1OptionsRoute();
