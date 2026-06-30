import { asStr } from '@/lib/api/serializers';
import { fetchWhereEq, type RawDoc } from './helpers';

const COLLECTION = 'soccer_rounds';

export interface RoundRecord {
  id: string;
  name: string;
  position: number | null;
  leagueId: string;
  seasonId: string;
}

function toRecord(doc: RawDoc): RoundRecord {
  const data = doc.data;
  const position = typeof data.position === 'number' ? data.position : null;
  return {
    id: doc.id,
    name: asStr(data.name) ?? '',
    position,
    leagueId: asStr(data.league_id) ?? '',
    seasonId: asStr(data.season_id) ?? '',
  };
}

export async function listRoundsBySeason(leagueId: string, seasonId: string): Promise<RoundRecord[]> {
  const docs = await fetchWhereEq(COLLECTION, 'league_id', leagueId);
  return docs
    .map(toRecord)
    .filter((round) => round.seasonId === seasonId && round.name.length > 0)
    .sort((a, b) => {
      if (a.position != null && b.position != null) return a.position - b.position;
      return a.name.localeCompare(b.name);
    });
}
