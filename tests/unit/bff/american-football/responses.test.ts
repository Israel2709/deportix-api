import { describe, expect, it } from 'vitest';
import {
  buildAmericanFootballApiSportsBody,
  buildAmericanFootballApiSportsError,
} from '@/lib/bff/shared/responses';

describe('American Football API-Sports response envelope', () => {
  it('builds a full success body', () => {
    expect(
      buildAmericanFootballApiSportsBody('games', { league: '1', season: '2022' }, [{ id: 1 }]),
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
    expect(buildAmericanFootballApiSportsError('timezone', {}, 'Missing league', 'league')).toEqual({
      get: 'timezone',
      parameters: {},
      errors: { league: 'Missing league' },
      results: 0,
      paging: { current: 1, total: 1 },
      response: [],
    });
  });
});
