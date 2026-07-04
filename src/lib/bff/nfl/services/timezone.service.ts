import { listTimezones, seedDefaultTimezonesIfEmpty } from '@/lib/firebase/repositories/timezones.repository';

export async function fetchNflTimezones(): Promise<string[]> {
  await seedDefaultTimezonesIfEmpty();
  return listTimezones();
}
