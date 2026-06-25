import { describe, expect, it } from 'vitest';
import { buildMatchFirestorePatch } from '@/lib/api/match-patch';

describe('buildMatchFirestorePatch', () => {
  it('maps soccer denormalized fields with dot notation', () => {
    expect(
      buildMatchFirestorePatch('soccer', {
        date: '2026-11-08T22:00:00.000Z',
        status: 'FT',
        round: 'Clausura - 16',
        venue: 'Monumental',
        home: { score: 2, name: 'Boca' },
        away: { score: 1, teamId: 'tm_away' },
      }),
    ).toMatchObject({
      fixture_date: '2026-11-08T22:00:00.000Z',
      'fixture.date': '2026-11-08T22:00:00.000Z',
      status: 'FT',
      'league.round': 'Clausura - 16',
      venue: 'Monumental',
      'fixture.venue.name': 'Monumental',
      'goals.home': 2,
      'score.fulltime.home': 2,
      'teams.home.name': 'Boca',
      'goals.away': 1,
      'score.fulltime.away': 1,
      away_team_id: 'tm_away',
    });
  });

  it('maps nfl flat score and date fields', () => {
    expect(
      buildMatchFirestorePatch('nfl', {
        date: '2026-09-01T00:00:00Z',
        status: 'FT',
        home: { score: 24 },
        away: { score: 17 },
      }),
    ).toMatchObject({
      game_date: '2026-09-01T00:00:00Z',
      fixture_date: '2026-09-01T00:00:00Z',
      date: '2026-09-01T00:00:00Z',
      status: 'FT',
      home_score: 24,
      away_score: 17,
    });
  });
});
