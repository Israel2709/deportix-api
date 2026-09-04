import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import {
  assertPublishableBracket,
  assertResultConsistency,
  type TennisMatchSnap,
  type TennisRoundSnap,
} from '@/lib/bff/tennis/validation';

const R1 = 'r1';
const R2 = 'r2';
const M101 = 'm101';
const M201 = 'm201';

function rounds(): TennisRoundSnap[] {
  return [
    { id: R1, tournamentId: 't1', roundNumber: 1 },
    { id: R2, tournamentId: 't1', roundNumber: 2 },
  ];
}

function bracket(): TennisMatchSnap[] {
  return [
    {
      id: M101,
      tournamentId: 't1',
      roundId: R1,
      roundNumber: 1,
      bracketPosition: 1,
      competitor1Id: 'p1',
      competitor2Id: 'p2',
      competitor1SourceMatchId: null,
      competitor2SourceMatchId: null,
      winnerToMatchId: M201,
      winnerToPosition: 'competitor_1',
      competitor1EntryType: 'direct',
      competitor2EntryType: 'direct',
      winnerId: null,
      scheduledAt: '2026-08-24T15:00:00.000Z',
      timezone: 'America/New_York',
    },
    {
      id: M201,
      tournamentId: 't1',
      roundId: R2,
      roundNumber: 2,
      bracketPosition: 1,
      competitor1Id: null,
      competitor2Id: 'p3',
      competitor1SourceMatchId: M101,
      competitor2SourceMatchId: null,
      winnerToMatchId: null,
      winnerToPosition: null,
      competitor1EntryType: null,
      competitor2EntryType: 'bye',
      winnerId: null,
      scheduledAt: null,
      timezone: null,
    },
  ];
}

describe('Tennis bracket validation', () => {
  it('accepts a two-round draw with a bye into the final', () => {
    expect(() => assertPublishableBracket(rounds(), bracket())).not.toThrow();
  });

  it('allows a tournament with no rounds or matches', () => {
    expect(() => assertPublishableBracket([], [])).not.toThrow();
  });

  it('allows rounds with no matches yet', () => {
    expect(() => assertPublishableBracket(rounds(), [])).not.toThrow();
  });

  it('rejects a Final that points to another match', () => {
    const matches = bracket();
    matches[1]!.winnerToMatchId = M101;
    matches[1]!.winnerToPosition = 'competitor_1';
    expect(() => assertPublishableBracket(rounds(), matches)).toThrow(ApiError);
  });

  it('allows TBD competitors without a source match', () => {
    const matches = bracket();
    matches[0]!.competitor1Id = null;
    matches[0]!.competitor2Id = null;
    matches[1]!.competitor1SourceMatchId = null;
    matches[1]!.competitor1Id = null;
    expect(() => assertPublishableBracket(rounds(), matches)).not.toThrow();
  });

  it('rejects non-sequential round numbers', () => {
    expect(() =>
      assertPublishableBracket(
        [
          { id: R1, tournamentId: 't1', roundNumber: 1 },
          { id: R2, tournamentId: 't1', roundNumber: 3 },
        ],
        bracket(),
      ),
    ).toThrow(ApiError);
  });
});

describe('Tennis result validation', () => {
  it('requires the set tally to match the winner on a normal result', () => {
    expect(() =>
      assertResultConsistency({
        winnerId: 'p1',
        loserId: 'p2',
        resultType: 'normal',
        competitor1Id: 'p1',
        competitor2Id: 'p2',
        setsPlayer1: 1,
        setsPlayer2: 2,
      }),
    ).toThrow(ApiError);

    expect(() =>
      assertResultConsistency({
        winnerId: 'p1',
        loserId: 'p2',
        resultType: 'normal',
        competitor1Id: 'p1',
        competitor2Id: 'p2',
        setsPlayer1: 2,
        setsPlayer2: 0,
      }),
    ).not.toThrow();
  });

  it('allows walkover with an explicit advancing player', () => {
    expect(() =>
      assertResultConsistency({
        winnerId: 'p2',
        loserId: 'p1',
        resultType: 'walkover',
        competitor1Id: 'p1',
        competitor2Id: 'p2',
        setsPlayer1: null,
        setsPlayer2: null,
      }),
    ).not.toThrow();
  });
});
