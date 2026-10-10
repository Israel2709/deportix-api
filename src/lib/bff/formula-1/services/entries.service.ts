import { ApiError } from '@/lib/api/errors';
import {
  buildDriverMap,
  buildTeamMap,
  listF1Drivers,
  listF1EntriesByCompetition,
  listF1Teams,
  resolveF1Entry,
} from '@/lib/firebase/repositories/formula-1.repository';
import { mapF1Entry } from '../mappers/entry.mapper';
import type { Formula1EntriesQuery } from '../query-params';
import type { Formula1EntryItem } from '../schemas/entry.schema';

export async function fetchFormula1Entries(
  query: Formula1EntriesQuery,
): Promise<Formula1EntryItem[]> {
  const [drivers, teams] = await Promise.all([listF1Drivers(), listF1Teams()]);
  const driverMap = buildDriverMap(drivers);
  const teamMap = buildTeamMap(teams);

  if (query.id) {
    const doc = await resolveF1Entry(query.id);
    if (!doc) return [];
    return [
      mapF1Entry(
        doc,
        driverMap.get(String(doc.data.driver_id ?? '')),
        teamMap.get(String(doc.data.team_id ?? '')),
      ),
    ];
  }

  if (!query.competitionId) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "competition" parameter is required.');
  }

  let docs = await listF1EntriesByCompetition(query.competitionId);
  if (query.season != null) {
    docs = docs.filter((doc) => Number(doc.data.season) === query.season);
  }
  if (query.driverId) {
    docs = docs.filter((doc) => doc.data.driver_id === query.driverId);
  }
  if (query.teamId) {
    docs = docs.filter((doc) => doc.data.team_id === query.teamId);
  }

  return docs
    .filter((doc) => doc.data.active !== false)
    .map((doc) =>
      mapF1Entry(
        doc,
        driverMap.get(String(doc.data.driver_id ?? '')),
        teamMap.get(String(doc.data.team_id ?? '')),
      ),
    )
    .sort((a, b) => a.driver.name.localeCompare(b.driver.name, 'es', { sensitivity: 'base' }));
}
