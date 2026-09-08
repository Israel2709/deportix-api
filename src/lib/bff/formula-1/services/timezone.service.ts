import {
  listTimezones,
  seedDefaultTimezonesIfEmpty,
} from '@/lib/firebase/repositories/timezones.repository';

export async function fetchFormula1Timezones(): Promise<string[]> {
  await seedDefaultTimezonesIfEmpty();
  return listTimezones();
}
