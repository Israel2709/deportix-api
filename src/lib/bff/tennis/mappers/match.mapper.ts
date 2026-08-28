import { asBool, asNum, asStr } from '@/lib/api/serializers';
import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { TennisMatchItem } from '../schemas/match.schema';
import { mapTennisPlayerRef } from './player.mapper';

const MATCH_STATUSES: TennisMatchItem['status'][] = [
  'pending_competitors',
  'scheduled',
  'live',
  'suspended',
  'postponed',
  'finished',
  'retirement',
  'walkover',
  'disqualification',
  'cancelled',
];

const RESULT_TYPES = ['normal', 'retirement', 'walkover', 'disqualification'] as const;
const ENTRY_TYPES = [
  'direct',
  'qualifier',
  'wildcard',
  'lucky_loser',
  'protected_ranking',
  'bye',
  'other',
] as const;

function asMatchStatus(value: unknown): TennisMatchItem['status'] {
  const v = asStr(value);
  return MATCH_STATUSES.includes(v as TennisMatchItem['status'])
    ? (v as TennisMatchItem['status'])
    : 'pending_competitors';
}

function asResultType(value: unknown): NonNullable<TennisMatchItem['result']>['resultType'] {
  const v = asStr(value);
  return (RESULT_TYPES as readonly string[]).includes(v ?? '')
    ? (v as NonNullable<TennisMatchItem['result']>['resultType'])
    : null;
}

function asEntryType(value: unknown): TennisMatchItem['bracket']['competitor1EntryType'] {
  const v = asStr(value);
  return (ENTRY_TYPES as readonly string[]).includes(v ?? '')
    ? (v as NonNullable<TennisMatchItem['bracket']['competitor1EntryType']>)
    : null;
}

function asWinnerPosition(value: unknown): TennisMatchItem['bracket']['winnerToPosition'] {
  const v = asStr(value);
  if (v === 'competitor_1' || v === 'competitor_2') return v;
  return null;
}

function mapSetScores(
  raw: unknown,
): NonNullable<TennisMatchItem['result']>['setScores'] {
  if (!Array.isArray(raw)) return null;
  const scores = raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const set = asNum(row.set);
      const competitor1 = asNum(row.competitor_1) ?? asNum(row.competitor1);
      const competitor2 = asNum(row.competitor_2) ?? asNum(row.competitor2);
      if (set == null || competitor1 == null || competitor2 == null) return null;
      return { set, competitor1, competitor2 };
    })
    .filter((row): row is { set: number; competitor1: number; competitor2: number } => row != null);
  return scores.length > 0 ? scores : null;
}

export function mapTennisMatch(
  doc: RawDoc,
  playerMap: Map<string, RawDoc>,
  roundMap?: Map<string, RawDoc>,
  countryMap?: Map<string, CountryRecord>,
): TennisMatchItem {
  const competitor1Id = asStr(doc.data.competitor_1_id);
  const competitor2Id = asStr(doc.data.competitor_2_id);
  const roundId = asStr(doc.data.round_id) ?? '';
  const roundDoc = roundMap?.get(roundId);
  const winnerId = asStr(doc.data.winner_id);
  const loserId = asStr(doc.data.loser_id);
  const resultType = asResultType(doc.data.result_type);
  const hasResult = Boolean(winnerId || resultType);

  return {
    id: doc.id,
    tournamentId: asStr(doc.data.tournament_id) ?? '',
    roundId,
    roundNumber: asNum(doc.data.round_number) ?? asNum(roundDoc?.data.round_number) ?? 0,
    roundName: asStr(roundDoc?.data.name) ?? asStr(doc.data.round_name),
    bracketPosition: asNum(doc.data.bracket_position) ?? 0,
    competitor1: mapTennisPlayerRef(
      competitor1Id ? playerMap.get(competitor1Id) : undefined,
      competitor1Id,
      countryMap,
    ),
    competitor2: mapTennisPlayerRef(
      competitor2Id ? playerMap.get(competitor2Id) : undefined,
      competitor2Id,
      countryMap,
    ),
    scheduledAt: asStr(doc.data.scheduled_at),
    timezone: asStr(doc.data.timezone),
    court: asStr(doc.data.court),
    status: asMatchStatus(doc.data.status),
    startedAt: asStr(doc.data.started_at),
    endedAt: asStr(doc.data.ended_at),
    competitorChanged: asBool(doc.data.competitor_changed),
    bracket: {
      competitor1SourceMatchId: asStr(doc.data.competitor_1_source_match_id),
      competitor2SourceMatchId: asStr(doc.data.competitor_2_source_match_id),
      winnerToMatchId: asStr(doc.data.winner_to_match_id),
      winnerToPosition: asWinnerPosition(doc.data.winner_to_position),
      competitor1EntryType: asEntryType(doc.data.competitor_1_entry_type),
      competitor2EntryType: asEntryType(doc.data.competitor_2_entry_type),
    },
    result: hasResult
      ? {
          winnerId,
          loserId,
          resultType,
          setsPlayer1: asNum(doc.data.sets_player_1),
          setsPlayer2: asNum(doc.data.sets_player_2),
          setScores: mapSetScores(doc.data.set_scores),
          finalScoreDisplay: asStr(doc.data.final_score_display),
        }
      : null,
    published: asBool(doc.data.is_published),
    createdAt: asStr(doc.data.created_at),
    updatedAt: asStr(doc.data.updated_at),
  };
}

export function sortMatches(a: TennisMatchItem, b: TennisMatchItem): number {
  if (a.roundNumber !== b.roundNumber) return a.roundNumber - b.roundNumber;
  return a.bracketPosition - b.bracketPosition;
}
