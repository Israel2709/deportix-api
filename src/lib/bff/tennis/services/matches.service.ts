import { ApiError } from '@/lib/api/errors';
import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import {
  buildDocMap,
  listTennisMatchesByRound,
  listTennisMatchesByTournament,
  listTennisPlayers,
  listTennisRoundsByTournament,
  resolveTennisMatch,
} from '@/lib/firebase/repositories/tennis.repository';
import { mapTennisMatch, sortMatches } from '../mappers/match.mapper';
import { matchesPublishedFilter, type TennisMatchesQuery } from '../query-params';
import type { TennisMatchItem } from '../schemas/match.schema';

export async function fetchTennisMatches(query: TennisMatchesQuery): Promise<TennisMatchItem[]> {
  const [players, countries] = await Promise.all([listTennisPlayers(), buildCountryMap()]);
  const playerMap = buildDocMap(players);

  if (query.id) {
    const doc = await resolveTennisMatch(query.id);
    if (!doc) return [];
    const rounds = await listTennisRoundsByTournament(String(doc.data.tournament_id ?? ''));
    const item = mapTennisMatch(doc, playerMap, buildDocMap(rounds), countries);
    return matchesPublishedFilter(item.published, query.published) ? [item] : [];
  }

  if (!query.tournamentId && !query.roundId) {
    throw new ApiError(
      'INVALID_QUERY_PARAMETER',
      'The "tournament" or "round" parameter is required.',
    );
  }

  const docs = query.roundId
    ? await listTennisMatchesByRound(query.roundId)
    : await listTennisMatchesByTournament(query.tournamentId!);

  const tournamentId =
    query.tournamentId ?? (docs[0] ? String(docs[0].data.tournament_id ?? '') : '');
  const rounds = tournamentId ? await listTennisRoundsByTournament(tournamentId) : [];
  const roundMap = buildDocMap(rounds);

  return docs
    .map((doc) => mapTennisMatch(doc, playerMap, roundMap, countries))
    .filter((item) => {
      if (!matchesPublishedFilter(item.published, query.published)) return false;
      if (query.status && item.status !== query.status) return false;
      return true;
    })
    .sort(sortMatches);
}
