import { describe, expect, it } from 'vitest';
import {
  buildMatchFirestoreDocument,
  matchCreateSchema,
  resolveSide,
} from '@/lib/api/match-create';

describe('matchCreateSchema', () => {
  it('requires date, home and away', () => {
    expect(() => matchCreateSchema.parse({ date: '2026-01-01', home: { teamId: 'a' } })).toThrow();
  });

  it('rejects identical home and away team ids', () => {
    expect(() =>
      matchCreateSchema.parse({
        date: '2026-01-01',
        home: { teamId: 'same' },
        away: { teamId: 'same' },
      }),
    ).toThrow(/different/);
  });
});

describe('buildMatchFirestoreDocument', () => {
  it('builds a soccer document with denormalized fields', () => {
    const doc = buildMatchFirestoreDocument(
      'soccer',
      'm-new',
      'lg_ar',
      'se_ar26',
      {
        date: '2026-11-08T21:00:00.000Z',
        round: 'Clausura - 16',
        venue: 'Monumental',
        home: { teamId: 'tm_boca' },
        away: { teamId: 'tm_river' },
      },
      { teamId: 'tm_boca', name: 'Boca', logo: 'b.png', score: null },
      { teamId: 'tm_river', name: 'River', logo: 'r.png', score: null },
      '2026-06-24T00:00:00.000Z',
    );

    expect(doc).toMatchObject({
      id: 'm-new',
      league_id: 'lg_ar',
      season_id: 'se_ar26',
      status: 'NS',
      fixture_date: '2026-11-08T21:00:00.000Z',
      venue: 'Monumental',
      goals: { home: null, away: null },
      teams: { home: { name: 'Boca' }, away: { name: 'River' } },
    });
  });
});

describe('resolveSide', () => {
  it('falls back to the team map when name/logo are omitted', () => {
    const map = new Map([['tm_boca', { name: 'Boca', logo: 'b.png' }]]);
    expect(resolveSide({ teamId: 'tm_boca' }, map)).toMatchObject({
      teamId: 'tm_boca',
      name: 'Boca',
      logo: 'b.png',
      score: null,
    });
  });
});
