import { describe, expect, it } from 'vitest';
import { buildApiSportsBody, buildApiSportsError } from '@/lib/bff/football/responses';

describe('API-Sports response envelope', () => {
  it('builds a success body with results count', () => {
    expect(buildApiSportsBody([{ id: 1 }, { id: 2 }])).toEqual({
      response: [{ id: 1 }, { id: 2 }],
      results: 2,
      errors: {},
    });
  });

  it('builds an error body', () => {
    expect(buildApiSportsError('Missing league', 'league')).toEqual({
      response: [],
      results: 0,
      errors: { league: 'Missing league' },
    });
  });
});
