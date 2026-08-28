import { ApiError } from '@/lib/api/errors';
import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import {
  buildDocMap,
  listTennisEntriesByTournament,
  listTennisPlayers,
  resolveTennisEntry,
} from '@/lib/firebase/repositories/tennis.repository';
import { mapTennisEntry } from '../mappers/entry.mapper';
import { nameMatches } from '../mappers/player.mapper';
import { matchesPublishedFilter, type TennisEntriesQuery } from '../query-params';
import type { TennisEntryItem } from '../schemas/entry.schema';

export async function fetchTennisEntries(query: TennisEntriesQuery): Promise<TennisEntryItem[]> {
  const [players, countries] = await Promise.all([listTennisPlayers(), buildCountryMap()]);
  const playerMap = buildDocMap(players);

  if (query.id) {
    const doc = await resolveTennisEntry(query.id);
    if (!doc) return [];
    const item = mapTennisEntry(doc, playerMap.get(String(doc.data.player_id ?? '')), countries);
    return matchesPublishedFilter(item.published, query.published) ? [item] : [];
  }

  if (!query.tournamentId) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "tournament" parameter is required.');
  }

  let docs = await listTennisEntriesByTournament(query.tournamentId);
  if (query.playerId) {
    docs = docs.filter((doc) => doc.data.player_id === query.playerId);
  }

  return docs
    .map((doc) => mapTennisEntry(doc, playerMap.get(String(doc.data.player_id ?? '')), countries))
    .filter((item) => {
      if (!matchesPublishedFilter(item.published, query.published)) return false;
      if (!query.search) return true;
      const haystack = `${item.player.fullName} ${item.player.displayName}`;
      return nameMatches(haystack, query.search);
    })
    .sort((a, b) => {
      if (a.seed != null && b.seed != null) return a.seed - b.seed;
      if (a.seed != null) return -1;
      if (b.seed != null) return 1;
      return a.player.displayName.localeCompare(b.player.displayName);
    });
}
