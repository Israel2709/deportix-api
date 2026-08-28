import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFakeDb, type Dataset } from '../helpers/fake-firestore';

const TOURNAMENT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ROUND1_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ROUND2_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const PLAYER1_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const PLAYER2_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const PLAYER3_ID = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const MATCH101_ID = '11111111-1111-4111-8111-111111111111';
const MATCH201_ID = '33333333-3333-4333-8333-333333333333';

const state: { db: ReturnType<typeof makeFakeDb> | null } = { db: null };
vi.mock('@/lib/firebase/admin', () => ({
  getDb: () => state.db,
  isDataSourceConfigured: () => true,
}));

const { fetchTennisTournaments } = await import('@/lib/bff/tennis/services/tournaments.service');
const { fetchTennisMatches } = await import('@/lib/bff/tennis/services/matches.service');
const { createTennisRound } = await import('@/lib/bff/tennis/writers/rounds.writer');
const { publishTennisTournament } = await import('@/lib/bff/tennis/writers/tournaments.writer');
const { recordTennisMatchResult, updateTennisMatch } = await import(
  '@/lib/bff/tennis/writers/matches.writer'
);

function dataset(): Dataset {
  return {
    countries: [{ id: 'c_us', code: 'US', name: 'USA', flag: 'us.svg', external_id: 'US' }],
    tennis_players: [
      {
        id: PLAYER1_ID,
        full_name: 'Player One',
        display_name: 'One',
        country_code: 'US',
        is_published: true,
      },
      {
        id: PLAYER2_ID,
        full_name: 'Player Two',
        display_name: 'Two',
        country_code: 'US',
        is_published: true,
      },
      {
        id: PLAYER3_ID,
        full_name: 'Player Three',
        display_name: 'Three',
        country_code: 'US',
        is_published: true,
      },
    ],
    tennis_tournaments: [
      {
        id: TOURNAMENT_ID,
        name: 'US Open',
        category: 'grand_slam',
        gender: 'male',
        event_type: 'singles',
        country_code: 'US',
        city: 'New York',
        start_date: '2026-08-24',
        end_date: '2026-09-13',
        year: 2026,
        status: 'upcoming',
        is_published: false,
      },
    ],
    tennis_rounds: [
      { id: ROUND1_ID, tournament_id: TOURNAMENT_ID, round_number: 1, name: 'Semifinals', status: 'pending', is_published: false },
      { id: ROUND2_ID, tournament_id: TOURNAMENT_ID, round_number: 2, name: 'Final', status: 'pending', is_published: false },
    ],
    tennis_entries: [
      { id: 'e1', tournament_id: TOURNAMENT_ID, player_id: PLAYER1_ID, seed: 1, entry_type: 'direct', is_published: false },
      { id: 'e2', tournament_id: TOURNAMENT_ID, player_id: PLAYER2_ID, seed: 2, entry_type: 'direct', is_published: false },
      { id: 'e3', tournament_id: TOURNAMENT_ID, player_id: PLAYER3_ID, seed: null, entry_type: 'wildcard', is_published: false },
    ],
    tennis_matches: [
      {
        id: MATCH101_ID,
        tournament_id: TOURNAMENT_ID,
        round_id: ROUND1_ID,
        round_number: 1,
        bracket_position: 1,
        competitor_1_id: PLAYER1_ID,
        competitor_2_id: PLAYER2_ID,
        winner_to_match_id: MATCH201_ID,
        winner_to_position: 'competitor_1',
        status: 'scheduled',
        competitor_changed: false,
        is_published: false,
      },
      {
        id: MATCH201_ID,
        tournament_id: TOURNAMENT_ID,
        round_id: ROUND2_ID,
        round_number: 2,
        bracket_position: 1,
        competitor_1_id: null,
        competitor_2_id: PLAYER3_ID,
        competitor_1_source_match_id: MATCH101_ID,
        competitor_2_entry_type: 'bye',
        winner_to_match_id: null,
        status: 'pending_competitors',
        competitor_changed: false,
        is_published: false,
      },
    ],
  };
}

beforeEach(() => {
  state.db = makeFakeDb(structuredClone(dataset()));
});

describe('BFF Tennis', () => {
  it('hides unpublished tournaments from the default App QD list', async () => {
    const published = await fetchTennisTournaments({ published: 'true' });
    expect(published).toHaveLength(0);
    const drafts = await fetchTennisTournaments({ published: 'all' });
    expect(drafts).toHaveLength(1);
    expect(drafts[0]?.name).toBe('US Open');
  });

  it('rejects a duplicate roundNumber in the same tournament', async () => {
    await expect(
      createTennisRound({
        tournamentId: TOURNAMENT_ID,
        roundNumber: 1,
        name: 'Also round 1',
      }),
    ).rejects.toThrow(/roundNumber must be unique/);
  });

  it('publishes the draw after integrity checks', async () => {
    const published = await publishTennisTournament(TOURNAMENT_ID);
    expect(published.published).toBe(true);

    const visible = await fetchTennisTournaments({ published: 'true' });
    expect(visible).toHaveLength(1);
  });

  it('records a result and advances the winner into the next bracket slot', async () => {
    await publishTennisTournament(TOURNAMENT_ID);
    const result = await recordTennisMatchResult(MATCH101_ID, {
      winnerId: PLAYER1_ID,
      resultType: 'normal',
      setsPlayer1: 2,
      setsPlayer2: 0,
      setScores: [
        { set: 1, competitor1: 6, competitor2: 4 },
        { set: 2, competitor1: 6, competitor2: 2 },
      ],
      finalScoreDisplay: '6-4, 6-2',
    });

    expect(result.result?.winnerId).toBe(PLAYER1_ID);
    expect(result.status).toBe('finished');
    expect(result.published).toBe(true);

    const final = await fetchTennisMatches({ id: MATCH201_ID, published: 'all' });
    expect(final[0]?.competitor1?.id).toBe(PLAYER1_ID);
  });

  it('marks competitorChanged when a published matchup is substituted', async () => {
    await publishTennisTournament(TOURNAMENT_ID);
    const updated = await updateTennisMatch(MATCH101_ID, { competitor2Id: PLAYER3_ID });
    expect(updated.competitorChanged).toBe(true);
    expect(updated.id).toBe(MATCH101_ID);
  });
});
