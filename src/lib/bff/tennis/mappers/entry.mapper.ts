import { asBool, asNum, asStr } from '@/lib/api/serializers';
import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { TennisEntryItem } from '../schemas/entry.schema';
import { mapTennisPlayer } from './player.mapper';

function asEntryType(value: unknown): TennisEntryItem['entryType'] {
  const v = asStr(value);
  if (
    v === 'direct' ||
    v === 'qualifier' ||
    v === 'wildcard' ||
    v === 'lucky_loser' ||
    v === 'protected_ranking' ||
    v === 'bye' ||
    v === 'other'
  ) {
    return v;
  }
  return null;
}

export function mapTennisEntry(
  doc: RawDoc,
  playerDoc: RawDoc | undefined,
  countryMap?: Map<string, CountryRecord>,
): TennisEntryItem {
  const playerId = asStr(doc.data.player_id) ?? '';
  const player = playerDoc
    ? mapTennisPlayer(playerDoc, countryMap)
    : {
        id: playerId,
        fullName: '',
        displayName: '',
        photoUrl: null,
        country: { code: '', name: null, flag: null },
        published: false,
        createdAt: null,
        updatedAt: null,
      };

  return {
    id: doc.id,
    tournamentId: asStr(doc.data.tournament_id) ?? '',
    player,
    seed: asNum(doc.data.seed),
    ranking: asNum(doc.data.ranking),
    entryType: asEntryType(doc.data.entry_type),
    published: asBool(doc.data.is_published),
    createdAt: asStr(doc.data.created_at),
    updatedAt: asStr(doc.data.updated_at),
  };
}
