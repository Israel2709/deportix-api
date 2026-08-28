import { asBool, asStr } from '@/lib/api/serializers';
import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { TENNIS_COLLECTIONS } from '@/lib/firebase/sport-registry';
import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import {
  buildDocMap,
  createTennisDoc,
  deleteTennisDoc,
  getTennisMatchById,
  getTennisPlayerById,
  getTennisRoundById,
  getTennisTournamentById,
  listTennisMatchesByTournament,
  listTennisPlayers,
  listTennisRoundsByTournament,
  resolveTennisMatch,
  updateTennisDoc,
} from '@/lib/firebase/repositories/tennis.repository';
import { mapTennisMatch } from '../mappers/match.mapper';
import { parseBody } from '../parse';
import { toMatchSnap } from '../snaps';
import {
  assertBracketPositionUnique,
  assertByeSlot,
  assertDistinctCompetitors,
  assertResultConsistency,
  assertTimezoneIfScheduled,
} from '../validation';
import {
  tennisMatchCreateSchema,
  tennisMatchResultSchema,
  tennisMatchUpdateSchema,
  type TennisMatchCreate,
  type TennisMatchItem,
  type TennisMatchResult,
  type TennisMatchUpdate,
} from '../schemas/match.schema';

async function toItem(doc: RawDoc): Promise<TennisMatchItem> {
  const tournamentId = asStr(doc.data.tournament_id) ?? '';
  const [players, rounds, countries] = await Promise.all([
    listTennisPlayers(),
    listTennisRoundsByTournament(tournamentId),
    buildCountryMap(),
  ]);
  return mapTennisMatch(doc, buildDocMap(players), buildDocMap(rounds), countries);
}

async function assertPlayer(id: string | null | undefined): Promise<void> {
  if (!id) return;
  const player = await getTennisPlayerById(id);
  if (!player) throw invalidRequestBody('competitor ids must reference existing players.');
}

async function assertMatchRef(id: string | null | undefined, tournamentId: string): Promise<void> {
  if (!id) return;
  const match = await getTennisMatchById(id);
  if (!match) throw invalidRequestBody('Bracket match references must exist.');
  if (asStr(match.data.tournament_id) !== tournamentId) {
    throw invalidRequestBody('Bracket match references must belong to the same tournament.');
  }
}

function defaultStatus(competitor1Id: string | null, competitor2Id: string | null): 'pending_competitors' | 'scheduled' {
  return competitor1Id && competitor2Id ? 'scheduled' : 'pending_competitors';
}

function toFirestoreSetScores(
  scores: TennisMatchResult['setScores'] | undefined,
): Array<{ set: number; competitor_1: number; competitor_2: number }> | null {
  if (!scores) return null;
  return scores.map((row) => ({
    set: row.set,
    competitor_1: row.competitor1,
    competitor_2: row.competitor2,
  }));
}

export async function createTennisMatch(body: unknown): Promise<TennisMatchItem> {
  const input = parseBody<TennisMatchCreate>(tennisMatchCreateSchema, body, 'match');
  const [tournament, round] = await Promise.all([
    getTennisTournamentById(input.tournamentId),
    getTennisRoundById(input.roundId),
  ]);
  if (!tournament) throw invalidRequestBody('tournamentId must reference an existing tournament.');
  if (!round) throw invalidRequestBody('roundId must reference an existing round.');
  if (asStr(round.data.tournament_id) !== input.tournamentId) {
    throw invalidRequestBody('roundId must belong to the given tournament.');
  }

  const competitor1Id = input.competitor1Id ?? null;
  const competitor2Id = input.competitor2Id ?? null;
  assertDistinctCompetitors(competitor1Id, competitor2Id);
  assertTimezoneIfScheduled(input.scheduledAt ?? null, input.timezone ?? null);
  assertByeSlot(
    competitor1Id,
    input.competitor1SourceMatchId ?? null,
    input.competitor1EntryType ?? null,
    'competitor1',
  );
  assertByeSlot(
    competitor2Id,
    input.competitor2SourceMatchId ?? null,
    input.competitor2EntryType ?? null,
    'competitor2',
  );

  await Promise.all([
    assertPlayer(competitor1Id),
    assertPlayer(competitor2Id),
    assertMatchRef(input.competitor1SourceMatchId ?? null, input.tournamentId),
    assertMatchRef(input.competitor2SourceMatchId ?? null, input.tournamentId),
    assertMatchRef(input.winnerToMatchId ?? null, input.tournamentId),
  ]);

  const siblings = await listTennisMatchesByTournament(input.tournamentId);
  assertBracketPositionUnique(siblings.map(toMatchSnap), input.roundId, input.bracketPosition);

  const scheduledAt = input.scheduledAt ?? null;
  const doc = await createTennisDoc(TENNIS_COLLECTIONS.matches, {
    tournament_id: input.tournamentId,
    round_id: input.roundId,
    round_number: round.data.round_number,
    bracket_position: input.bracketPosition,
    competitor_1_id: competitor1Id,
    competitor_2_id: competitor2Id,
    scheduled_at: scheduledAt,
    timezone: input.timezone ?? null,
    court: input.court ?? null,
    status: input.status ?? defaultStatus(competitor1Id, competitor2Id),
    started_at: null,
    ended_at: null,
    competitor_changed: false,
    published_competitor_1_id: null,
    published_competitor_2_id: null,
    competitor_1_source_match_id: input.competitor1SourceMatchId ?? null,
    competitor_2_source_match_id: input.competitor2SourceMatchId ?? null,
    winner_to_match_id: input.winnerToMatchId ?? null,
    winner_to_position: input.winnerToPosition ?? null,
    competitor_1_entry_type: input.competitor1EntryType ?? null,
    competitor_2_entry_type: input.competitor2EntryType ?? null,
    winner_id: null,
    loser_id: null,
    result_type: null,
    sets_player_1: null,
    sets_player_2: null,
    set_scores: null,
    final_score_display: null,
    is_published: false,
  });
  return toItem(doc);
}

export async function updateTennisMatch(id: string, body: unknown): Promise<TennisMatchItem> {
  const existing = await resolveTennisMatch(id);
  if (!existing) throw notFound('Match not found.');
  const patch = parseBody<TennisMatchUpdate>(tennisMatchUpdateSchema, body, 'match');
  const tournamentId = asStr(existing.data.tournament_id) ?? '';

  if (patch.roundId) {
    const round = await getTennisRoundById(patch.roundId);
    if (!round) throw invalidRequestBody('roundId must reference an existing round.');
    if (asStr(round.data.tournament_id) !== tournamentId) {
      throw invalidRequestBody('roundId must belong to the same tournament.');
    }
  }

  const nextCompetitor1 =
    patch.competitor1Id !== undefined ? patch.competitor1Id : asStr(existing.data.competitor_1_id);
  const nextCompetitor2 =
    patch.competitor2Id !== undefined ? patch.competitor2Id : asStr(existing.data.competitor_2_id);
  const nextScheduled =
    patch.scheduledAt !== undefined ? patch.scheduledAt : asStr(existing.data.scheduled_at);
  const nextTimezone = patch.timezone !== undefined ? patch.timezone : asStr(existing.data.timezone);

  assertDistinctCompetitors(nextCompetitor1, nextCompetitor2);
  assertTimezoneIfScheduled(nextScheduled, nextTimezone);
  assertByeSlot(
    nextCompetitor1,
    patch.competitor1SourceMatchId !== undefined
      ? patch.competitor1SourceMatchId
      : asStr(existing.data.competitor_1_source_match_id),
    patch.competitor1EntryType !== undefined
      ? patch.competitor1EntryType
      : asStr(existing.data.competitor_1_entry_type),
    'competitor1',
  );
  assertByeSlot(
    nextCompetitor2,
    patch.competitor2SourceMatchId !== undefined
      ? patch.competitor2SourceMatchId
      : asStr(existing.data.competitor_2_source_match_id),
    patch.competitor2EntryType !== undefined
      ? patch.competitor2EntryType
      : asStr(existing.data.competitor_2_entry_type),
    'competitor2',
  );

  await Promise.all([
    assertPlayer(patch.competitor1Id ?? null),
    assertPlayer(patch.competitor2Id ?? null),
    assertMatchRef(patch.competitor1SourceMatchId ?? null, tournamentId),
    assertMatchRef(patch.competitor2SourceMatchId ?? null, tournamentId),
    assertMatchRef(patch.winnerToMatchId ?? null, tournamentId),
  ]);

  if (patch.bracketPosition != null || patch.roundId) {
    const siblings = await listTennisMatchesByTournament(tournamentId);
    assertBracketPositionUnique(
      siblings.map(toMatchSnap),
      patch.roundId ?? asStr(existing.data.round_id) ?? '',
      patch.bracketPosition ?? Number(existing.data.bracket_position),
      existing.id,
    );
  }

  const wasPublished = asBool(existing.data.is_published);
  const published1 = asStr(existing.data.published_competitor_1_id);
  const published2 = asStr(existing.data.published_competitor_2_id);
  const competitorChanged =
    wasPublished &&
    ((patch.competitor1Id !== undefined && patch.competitor1Id !== published1) ||
      (patch.competitor2Id !== undefined && patch.competitor2Id !== published2));

  let roundNumber: number | undefined;
  if (patch.roundId) {
    const round = await getTennisRoundById(patch.roundId);
    roundNumber = Number(round?.data.round_number);
  }

  const doc = await updateTennisDoc(TENNIS_COLLECTIONS.matches, existing.id, {
    ...(patch.roundId != null ? { round_id: patch.roundId } : {}),
    ...(roundNumber != null ? { round_number: roundNumber } : {}),
    ...(patch.bracketPosition != null ? { bracket_position: patch.bracketPosition } : {}),
    ...(patch.competitor1Id !== undefined ? { competitor_1_id: patch.competitor1Id } : {}),
    ...(patch.competitor2Id !== undefined ? { competitor_2_id: patch.competitor2Id } : {}),
    ...(patch.scheduledAt !== undefined ? { scheduled_at: patch.scheduledAt } : {}),
    ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
    ...(patch.court !== undefined ? { court: patch.court } : {}),
    ...(patch.status != null ? { status: patch.status } : {}),
    ...(patch.competitor1SourceMatchId !== undefined
      ? { competitor_1_source_match_id: patch.competitor1SourceMatchId }
      : {}),
    ...(patch.competitor2SourceMatchId !== undefined
      ? { competitor_2_source_match_id: patch.competitor2SourceMatchId }
      : {}),
    ...(patch.winnerToMatchId !== undefined ? { winner_to_match_id: patch.winnerToMatchId } : {}),
    ...(patch.winnerToPosition !== undefined ? { winner_to_position: patch.winnerToPosition } : {}),
    ...(patch.competitor1EntryType !== undefined
      ? { competitor_1_entry_type: patch.competitor1EntryType }
      : {}),
    ...(patch.competitor2EntryType !== undefined
      ? { competitor_2_entry_type: patch.competitor2EntryType }
      : {}),
    ...(competitorChanged ? { competitor_changed: true } : {}),
  });
  return toItem(doc);
}

export async function deleteTennisMatch(id: string): Promise<void> {
  const existing = await resolveTennisMatch(id);
  if (!existing) throw notFound('Match not found.');
  const tournamentId = asStr(existing.data.tournament_id) ?? '';
  const siblings = await listTennisMatchesByTournament(tournamentId);
  const referenced = siblings.some(
    (match) =>
      match.id !== existing.id &&
      (match.data.competitor_1_source_match_id === existing.id ||
        match.data.competitor_2_source_match_id === existing.id ||
        match.data.winner_to_match_id === existing.id),
  );
  if (referenced) {
    throw invalidRequestBody('Cannot delete a match that is still referenced by the bracket.');
  }
  await deleteTennisDoc(TENNIS_COLLECTIONS.matches, existing.id);
}

async function advanceWinner(source: RawDoc, winnerId: string): Promise<void> {
  const nextId = asStr(source.data.winner_to_match_id);
  const position = asStr(source.data.winner_to_position);
  if (!nextId || (position !== 'competitor_1' && position !== 'competitor_2')) return;

  const next = await getTennisMatchById(nextId);
  if (!next) return;

  const field = position === 'competitor_1' ? 'competitor_1_id' : 'competitor_2_id';
  const otherField = position === 'competitor_1' ? 'competitor_2_id' : 'competitor_1_id';
  const nextCompetitor = winnerId;
  const otherCompetitor = asStr(next.data[otherField]);
  const bothDefined = Boolean(nextCompetitor && otherCompetitor);
  const currentStatus = asStr(next.data.status);

  await updateTennisDoc(TENNIS_COLLECTIONS.matches, next.id, {
    [field]: winnerId,
    ...(currentStatus === 'pending_competitors' && bothDefined ? { status: 'scheduled' } : {}),
  });
}

export async function recordTennisMatchResult(id: string, body: unknown): Promise<TennisMatchItem> {
  const existing = await resolveTennisMatch(id);
  if (!existing) throw notFound('Match not found.');
  const input = parseBody<TennisMatchResult>(tennisMatchResultSchema, body, 'result');

  const competitor1Id = asStr(existing.data.competitor_1_id);
  const competitor2Id = asStr(existing.data.competitor_2_id);
  const loserId =
    input.loserId ??
    (input.winnerId === competitor1Id ? competitor2Id : competitor1Id);

  assertResultConsistency({
    winnerId: input.winnerId,
    loserId,
    resultType: input.resultType,
    competitor1Id,
    competitor2Id,
    setsPlayer1: input.setsPlayer1 ?? null,
    setsPlayer2: input.setsPlayer2 ?? null,
  });

  const status =
    input.resultType === 'normal'
      ? 'finished'
      : input.resultType;

  const updated = await updateTennisDoc(TENNIS_COLLECTIONS.matches, existing.id, {
    winner_id: input.winnerId,
    loser_id: loserId,
    result_type: input.resultType,
    sets_player_1: input.resultType === 'walkover' ? null : (input.setsPlayer1 ?? null),
    sets_player_2: input.resultType === 'walkover' ? null : (input.setsPlayer2 ?? null),
    set_scores: input.resultType === 'walkover' ? null : toFirestoreSetScores(input.setScores),
    final_score_display: input.finalScoreDisplay ?? null,
    status,
    started_at: input.startedAt !== undefined ? input.startedAt : existing.data.started_at ?? null,
    ended_at: input.endedAt ?? new Date().toISOString(),
    is_published: true,
  });

  await advanceWinner({ ...existing, data: { ...existing.data, ...updated.data } }, input.winnerId);
  const fresh = await getTennisMatchById(existing.id);
  if (!fresh) throw notFound('Match not found.');
  return toItem(fresh);
}

export async function publishTennisMatch(id: string): Promise<TennisMatchItem> {
  const existing = await resolveTennisMatch(id);
  if (!existing) throw notFound('Match not found.');
  const snap = toMatchSnap(existing);
  assertDistinctCompetitors(snap.competitor1Id, snap.competitor2Id);
  assertTimezoneIfScheduled(snap.scheduledAt, snap.timezone);
  const doc = await updateTennisDoc(TENNIS_COLLECTIONS.matches, existing.id, {
    is_published: true,
    published_competitor_1_id: existing.data.competitor_1_id ?? null,
    published_competitor_2_id: existing.data.competitor_2_id ?? null,
  });
  return toItem(doc);
}
