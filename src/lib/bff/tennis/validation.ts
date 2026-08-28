import { invalidRequestBody } from '@/lib/api/errors';

export interface TennisRoundSnap {
  id: string;
  tournamentId: string;
  roundNumber: number;
}

export interface TennisMatchSnap {
  id: string;
  tournamentId: string;
  roundId: string;
  roundNumber: number;
  bracketPosition: number;
  competitor1Id: string | null;
  competitor2Id: string | null;
  competitor1SourceMatchId: string | null;
  competitor2SourceMatchId: string | null;
  winnerToMatchId: string | null;
  winnerToPosition: 'competitor_1' | 'competitor_2' | null;
  competitor1EntryType: string | null;
  competitor2EntryType: string | null;
  winnerId: string | null;
  scheduledAt: string | null;
  timezone: string | null;
}

function fail(message: string): never {
  throw invalidRequestBody(message);
}

export function assertDistinctCompetitors(competitor1Id: string | null, competitor2Id: string | null): void {
  if (competitor1Id && competitor2Id && competitor1Id === competitor2Id) {
    fail('A match cannot have the same player on both sides.');
  }
}

export function assertTimezoneIfScheduled(scheduledAt: string | null, timezone: string | null): void {
  if (scheduledAt && !timezone) {
    fail('timezone is required when scheduledAt is set.');
  }
}

export function assertByeSlot(
  competitorId: string | null,
  sourceMatchId: string | null,
  entryType: string | null,
  slot: 'competitor1' | 'competitor2',
): void {
  if (entryType === 'bye' && sourceMatchId) {
    fail(`${slot} cannot have both a bye and a source match.`);
  }
  if (entryType === 'bye' && !competitorId) {
    fail(`${slot} with entry type bye must identify the player who advances.`);
  }
}

/** Integrity checks that must pass before a tournament (or its bracket) is published. */
export function assertPublishableBracket(rounds: TennisRoundSnap[], matches: TennisMatchSnap[]): void {
  if (rounds.length === 0) fail('A tournament cannot be published without rounds.');
  if (matches.length === 0) fail('A tournament cannot be published without matches.');

  const sortedNumbers = [...new Set(rounds.map((round) => round.roundNumber))].sort((a, b) => a - b);
  if (sortedNumbers.length !== rounds.length) fail('roundNumber must be unique within the tournament.');
  for (let i = 0; i < sortedNumbers.length; i++) {
    if (sortedNumbers[i] !== i + 1) {
      fail('roundNumber values must be sequential starting at 1.');
    }
  }

  const roundsById = new Map(rounds.map((round) => [round.id, round]));
  const matchesById = new Map(matches.map((match) => [match.id, match]));
  const maxRound = sortedNumbers[sortedNumbers.length - 1]!;
  const positionKeys = new Set<string>();

  for (const match of matches) {
    const round = roundsById.get(match.roundId);
    if (!round) fail(`Match ${match.id} references an unknown round.`);
    if (match.roundNumber !== round.roundNumber) {
      fail(`Match ${match.id} roundNumber does not match its round.`);
    }

    const posKey = `${match.roundId}:${match.bracketPosition}`;
    if (positionKeys.has(posKey)) {
      fail('bracketPosition must be unique within a round.');
    }
    positionKeys.add(posKey);

    assertDistinctCompetitors(match.competitor1Id, match.competitor2Id);
    assertTimezoneIfScheduled(match.scheduledAt, match.timezone);
    assertByeSlot(
      match.competitor1Id,
      match.competitor1SourceMatchId,
      match.competitor1EntryType,
      'competitor1',
    );
    assertByeSlot(
      match.competitor2Id,
      match.competitor2SourceMatchId,
      match.competitor2EntryType,
      'competitor2',
    );

    if (!match.competitor1Id && !match.competitor1SourceMatchId) {
      fail(`Match ${match.id} competitor1 is undefined and has no source match.`);
    }
    if (!match.competitor2Id && !match.competitor2SourceMatchId) {
      fail(`Match ${match.id} competitor2 is undefined and has no source match.`);
    }

    if (match.competitor1SourceMatchId && !matchesById.has(match.competitor1SourceMatchId)) {
      fail(`Match ${match.id} competitor1SourceMatchId does not exist in this tournament.`);
    }
    if (match.competitor2SourceMatchId && !matchesById.has(match.competitor2SourceMatchId)) {
      fail(`Match ${match.id} competitor2SourceMatchId does not exist in this tournament.`);
    }

    if (match.roundNumber === maxRound) {
      if (match.winnerToMatchId) fail('The Final cannot have winnerToMatchId.');
    } else if (!match.winnerToMatchId) {
      fail(`Match ${match.id} must point to a later-round match.`);
    }

    if (match.winnerToMatchId) {
      const next = matchesById.get(match.winnerToMatchId);
      if (!next) fail(`Match ${match.id} winnerToMatchId does not exist in this tournament.`);
      if (next.roundNumber <= match.roundNumber) {
        fail('Bracket links cannot point back to an earlier or same round.');
      }
      if (!match.winnerToPosition) {
        fail(`Match ${match.id} must set winnerToPosition when winnerToMatchId is set.`);
      }
    }
  }

  const incoming = new Map<string, { competitor_1?: string; competitor_2?: string }>();
  for (const match of matches) {
    if (!match.winnerToMatchId || !match.winnerToPosition) continue;
    const slot = incoming.get(match.winnerToMatchId) ?? {};
    if (slot[match.winnerToPosition]) {
      fail('Two matches cannot feed the same competitor slot of a later match.');
    }
    slot[match.winnerToPosition] = match.id;
    incoming.set(match.winnerToMatchId, slot);
  }
}

export function assertRoundNumbersUnique(
  existing: TennisRoundSnap[],
  roundNumber: number,
  excludeId?: string,
): void {
  const clash = existing.find((round) => round.roundNumber === roundNumber && round.id !== excludeId);
  if (clash) fail('roundNumber must be unique within the tournament.');
}

export function assertBracketPositionUnique(
  existing: TennisMatchSnap[],
  roundId: string,
  bracketPosition: number,
  excludeId?: string,
): void {
  const clash = existing.find(
    (match) =>
      match.roundId === roundId && match.bracketPosition === bracketPosition && match.id !== excludeId,
  );
  if (clash) fail('bracketPosition must be unique within the round.');
}

export function assertResultConsistency(input: {
  winnerId: string;
  loserId: string | null;
  resultType: 'normal' | 'retirement' | 'walkover' | 'disqualification';
  competitor1Id: string | null;
  competitor2Id: string | null;
  setsPlayer1: number | null;
  setsPlayer2: number | null;
}): void {
  const { winnerId, loserId, resultType, competitor1Id, competitor2Id, setsPlayer1, setsPlayer2 } =
    input;
  if (!competitor1Id || !competitor2Id) {
    fail('Both competitors must be defined before recording a result.');
  }
  if (winnerId !== competitor1Id && winnerId !== competitor2Id) {
    fail('winnerId must be one of the match competitors.');
  }
  const inferredLoser = winnerId === competitor1Id ? competitor2Id : competitor1Id;
  if (loserId && loserId !== inferredLoser) {
    fail('loserId must be the competitor who did not win.');
  }
  if (winnerId === loserId) fail('winnerId and loserId cannot be the same player.');

  if (resultType === 'normal') {
    if (setsPlayer1 == null || setsPlayer2 == null) {
      fail('Normal results require setsPlayer1 and setsPlayer2.');
    }
    if (setsPlayer1 === setsPlayer2) fail('Normal results cannot be a sets tie.');
    const setsWinner = setsPlayer1 > setsPlayer2 ? competitor1Id : competitor2Id;
    if (setsWinner !== winnerId) {
      fail('winnerId is inconsistent with the set tally.');
    }
  }
}
