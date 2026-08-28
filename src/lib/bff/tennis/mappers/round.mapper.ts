import { asBool, asNum, asStr } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { TennisRoundItem } from '../schemas/round.schema';

function asRoundStatus(value: unknown): TennisRoundItem['status'] {
  const v = asStr(value);
  if (v === 'active' || v === 'finished' || v === 'pending') return v;
  return 'pending';
}

export function mapTennisRound(doc: RawDoc): TennisRoundItem {
  return {
    id: doc.id,
    tournamentId: asStr(doc.data.tournament_id) ?? '',
    roundNumber: asNum(doc.data.round_number) ?? 0,
    name: asStr(doc.data.name) ?? '',
    status: asRoundStatus(doc.data.status),
    startDate: asStr(doc.data.start_date),
    endDate: asStr(doc.data.end_date),
    published: asBool(doc.data.is_published),
    createdAt: asStr(doc.data.created_at),
    updatedAt: asStr(doc.data.updated_at),
  };
}
