import { describe, expect, it } from 'vitest';
import {
  buildNflApiSportsBody,
  buildNflApiSportsError,
} from '@/lib/bff/shared/responses';

describe('NFL API-Sports response envelope', () => {
  it('builds a full success body', () => {
    expect(
      buildNflApiSportsBody('games', { league: '1', season: '2022' }, [{ id: 1 }]),
    ).toEqual({
      get: 'games',
      parameters: { league: '1', season: '2022' },
      errors: [],
      results: 1,
      paging: { current: 1, total: 1 },
      response: [{ id: 1 }],
    });
  });

  it('builds an error body', () => {
    expect(buildNflApiSportsError('timezone', {}, 'Missing league', 'league')).toEqual({
      get: 'timezone',
      parameters: {},
      errors: { league: 'Missing league' },
      results: 0,
      paging: { current: 1, total: 1 },
      response: [],
    });
  });
});
