import { f1ListRoute, f1OptionsRoute } from '@/lib/api/f1-route';
import { listF1Teams } from '@/lib/firebase/repositories/f1.repository';

export const runtime = 'nodejs';

export const GET = f1ListRoute(async () => listF1Teams());
export const OPTIONS = f1OptionsRoute();
