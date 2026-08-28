import { describe, expect, it } from 'vitest';
import { mapTennisPlayer } from '@/lib/bff/tennis/mappers/player.mapper';
import { mapTennisTournament } from '@/lib/bff/tennis/mappers/tournament.mapper';
import { mapTennisMatch } from '@/lib/bff/tennis/mappers/match.mapper';
import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';

const PLAYER_ID = '11111111-1111-4111-8111-111111111111';
const TOURNAMENT_ID = '22222222-2222-4222-8222-222222222222';
const ROUND_ID = '33333333-3333-4333-8333-333333333333';
const MATCH_ID = '44444444-4444-4444-8444-444444444444';

const countries = new Map<string, CountryRecord>([
  ['ES', { id: 'c_es', name: 'Spain', code: 'ES', flag: 'https://example.com/es.svg', externalId: 'ES' }],
]);

describe('Tennis mappers', () => {
  it('maps a player with hydrated country', () => {
    const doc: RawDoc = {
      id: PLAYER_ID,
      data: {
        full_name: 'Carlos Alcaraz',
        display_name: 'Alcaraz',
        photo_url: null,
        country_code: 'ES',
        is_published: true,
      },
    };
    expect(mapTennisPlayer(doc, countries)).toMatchObject({
      id: PLAYER_ID,
      fullName: 'Carlos Alcaraz',
      displayName: 'Alcaraz',
      country: { code: 'ES', name: 'Spain', flag: 'https://example.com/es.svg' },
      published: true,
    });
  });

  it('maps a tournament edition', () => {
    const doc: RawDoc = {
      id: TOURNAMENT_ID,
      data: {
        name: 'US Open',
        short_name: 'USO',
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
    };
    expect(mapTennisTournament(doc)).toMatchObject({
      id: TOURNAMENT_ID,
      name: 'US Open',
      category: 'grand_slam',
      eventType: 'singles',
      published: false,
    });
  });

  it('maps a TBD match with explicit bracket links and set scores', () => {
    const player: RawDoc = {
      id: PLAYER_ID,
      data: { full_name: 'Carlos Alcaraz', display_name: 'Alcaraz', country_code: 'ES', is_published: true },
    };
    const round: RawDoc = { id: ROUND_ID, data: { name: 'Final', round_number: 2 } };
    const match: RawDoc = {
      id: MATCH_ID,
      data: {
        tournament_id: TOURNAMENT_ID,
        round_id: ROUND_ID,
        round_number: 2,
        bracket_position: 1,
        competitor_1_id: PLAYER_ID,
        competitor_2_id: null,
        competitor_1_source_match_id: null,
        competitor_2_source_match_id: '55555555-5555-4555-8555-555555555555',
        winner_to_match_id: null,
        status: 'pending_competitors',
        competitor_changed: false,
        winner_id: PLAYER_ID,
        loser_id: null,
        result_type: 'normal',
        sets_player_1: 2,
        sets_player_2: 0,
        set_scores: [
          { set: 1, competitor_1: 6, competitor_2: 4 },
          { set: 2, competitor_1: 6, competitor_2: 3 },
        ],
        final_score_display: '6-4, 6-3',
        is_published: true,
      },
    };

    const mapped = mapTennisMatch(
      match,
      new Map([[PLAYER_ID, player]]),
      new Map([[ROUND_ID, round]]),
      countries,
    );
    expect(mapped.competitor1?.displayName).toBe('Alcaraz');
    expect(mapped.competitor2).toBeNull();
    expect(mapped.bracket.competitor2SourceMatchId).toBe('55555555-5555-4555-8555-555555555555');
    expect(mapped.roundName).toBe('Final');
    expect(mapped.result).toMatchObject({
      winnerId: PLAYER_ID,
      resultType: 'normal',
      setScores: [
        { set: 1, competitor1: 6, competitor2: 4 },
        { set: 2, competitor1: 6, competitor2: 3 },
      ],
    });
  });
});
