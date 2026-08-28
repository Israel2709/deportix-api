import { asNum, asStr } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { TennisMatchSnap, TennisRoundSnap } from './validation';

export function toRoundSnap(doc: RawDoc): TennisRoundSnap {
  return {
    id: doc.id,
    tournamentId: asStr(doc.data.tournament_id) ?? '',
    roundNumber: asNum(doc.data.round_number) ?? 0,
  };
}

export function toMatchSnap(doc: RawDoc): TennisMatchSnap {
  const winnerToPosition = asStr(doc.data.winner_to_position);
  return {
    id: doc.id,
    tournamentId: asStr(doc.data.tournament_id) ?? '',
    roundId: asStr(doc.data.round_id) ?? '',
    roundNumber: asNum(doc.data.round_number) ?? 0,
    bracketPosition: asNum(doc.data.bracket_position) ?? 0,
    competitor1Id: asStr(doc.data.competitor_1_id),
    competitor2Id: asStr(doc.data.competitor_2_id),
    competitor1SourceMatchId: asStr(doc.data.competitor_1_source_match_id),
    competitor2SourceMatchId: asStr(doc.data.competitor_2_source_match_id),
    winnerToMatchId: asStr(doc.data.winner_to_match_id),
    winnerToPosition:
      winnerToPosition === 'competitor_1' || winnerToPosition === 'competitor_2'
        ? winnerToPosition
        : null,
    competitor1EntryType: asStr(doc.data.competitor_1_entry_type),
    competitor2EntryType: asStr(doc.data.competitor_2_entry_type),
    winnerId: asStr(doc.data.winner_id),
    scheduledAt: asStr(doc.data.scheduled_at),
    timezone: asStr(doc.data.timezone),
  };
}
