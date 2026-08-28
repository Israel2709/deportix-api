import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import {
  listTennisTournaments,
  listTennisTournamentsByYear,
  resolveTennisTournament,
} from '@/lib/firebase/repositories/tennis.repository';
import { mapTennisTournament } from '../mappers/tournament.mapper';
import { nameMatches } from '../mappers/player.mapper';
import { matchesPublishedFilter, type TennisTournamentsQuery } from '../query-params';
import type { TennisTournamentItem } from '../schemas/tournament.schema';

export async function fetchTennisTournaments(
  query: TennisTournamentsQuery,
): Promise<TennisTournamentItem[]> {
  const countries = await buildCountryMap();

  if (query.id) {
    const doc = await resolveTennisTournament(query.id);
    if (!doc) return [];
    const item = mapTennisTournament(doc, countries);
    return matchesPublishedFilter(item.published, query.published) ? [item] : [];
  }

  let docs = query.year
    ? await listTennisTournamentsByYear(query.year)
    : await listTennisTournaments();

  if (query.category) docs = docs.filter((doc) => doc.data.category === query.category);
  if (query.gender) docs = docs.filter((doc) => doc.data.gender === query.gender);
  if (query.status) docs = docs.filter((doc) => doc.data.status === query.status);
  if (query.search) {
    docs = docs.filter((doc) => {
      const haystack = `${doc.data.name ?? ''} ${doc.data.short_name ?? ''}`;
      return nameMatches(haystack, query.search!);
    });
  }

  return docs
    .map((doc) => mapTennisTournament(doc, countries))
    .filter((item) => matchesPublishedFilter(item.published, query.published))
    .sort((a, b) => {
      if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
      return a.name.localeCompare(b.name);
    });
}
