import { listTimezones, seedDefaultTimezonesIfEmpty } from '@/lib/firebase/repositories/timezones.repository';

export async function fetchAmericanFootballTimezones(): Promise<string[]> {
  await seedDefaultTimezonesIfEmpty();
  return listTimezones();
}
