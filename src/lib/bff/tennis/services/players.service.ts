import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import {
  listTennisPlayers,
  resolveTennisPlayer,
} from '@/lib/firebase/repositories/tennis.repository';
import { mapTennisPlayer, nameMatches } from '../mappers/player.mapper';
import { matchesPublishedFilter, type TennisPlayersQuery } from '../query-params';
import type { TennisPlayerItem } from '../schemas/player.schema';

export async function fetchTennisPlayers(query: TennisPlayersQuery): Promise<TennisPlayerItem[]> {
  const countries = await buildCountryMap();

  if (query.id) {
    const doc = await resolveTennisPlayer(query.id);
    if (!doc) return [];
    const item = mapTennisPlayer(doc, countries);
    return matchesPublishedFilter(item.published, query.published) ? [item] : [];
  }

  let docs = await listTennisPlayers();
  if (query.search) {
    docs = docs.filter((doc) => {
      const haystack = `${doc.data.full_name ?? ''} ${doc.data.display_name ?? ''}`;
      return nameMatches(haystack, query.search!);
    });
  }
  if (query.country) {
    const needle = query.country.toUpperCase();
    docs = docs.filter((doc) => String(doc.data.country_code ?? '').toUpperCase() === needle);
  }

  return docs
    .map((doc) => mapTennisPlayer(doc, countries))
    .filter((item) => matchesPublishedFilter(item.published, query.published))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}
