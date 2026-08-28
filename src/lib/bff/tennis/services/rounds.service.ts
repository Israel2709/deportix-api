import { ApiError } from '@/lib/api/errors';
import {
  listTennisRoundsByTournament,
  resolveTennisRound,
} from '@/lib/firebase/repositories/tennis.repository';
import { mapTennisRound } from '../mappers/round.mapper';
import { matchesPublishedFilter, type TennisRoundsQuery } from '../query-params';
import type { TennisRoundItem } from '../schemas/round.schema';

export async function fetchTennisRounds(query: TennisRoundsQuery): Promise<TennisRoundItem[]> {
  if (query.id) {
    const doc = await resolveTennisRound(query.id);
    if (!doc) return [];
    const item = mapTennisRound(doc);
    return matchesPublishedFilter(item.published, query.published) ? [item] : [];
  }

  if (!query.tournamentId) {
    throw new ApiError('INVALID_QUERY_PARAMETER', 'The "tournament" parameter is required.');
  }

  const docs = await listTennisRoundsByTournament(query.tournamentId);
  return docs
    .map(mapTennisRound)
    .filter((item) => matchesPublishedFilter(item.published, query.published))
    .sort((a, b) => a.roundNumber - b.roundNumber);
}
