import { f1OptionsRoute, f1ResourceRoute } from '@/lib/api/f1-route';
import { getF1DriverById } from '@/lib/firebase/repositories/f1.repository';

export const runtime = 'nodejs';

export const GET = f1ResourceRoute(async (id) => getF1DriverById(id));
export const OPTIONS = f1OptionsRoute();
