import { describe, expect, it } from 'vitest';
import { matchUpdateSchema } from '@/lib/api/match-patch';

describe('matchUpdateSchema', () => {
  it('accepts a partial patch with nested sides', () => {
    const parsed = matchUpdateSchema.parse({
      status: 'FT',
      home: { score: 1 },
    });
    expect(parsed).toEqual({ status: 'FT', home: { score: 1 } });
  });

  it('rejects an empty object', () => {
    expect(() => matchUpdateSchema.parse({})).toThrow(/At least one field/);
  });

  it('rejects unknown top-level keys', () => {
    expect(() => matchUpdateSchema.parse({ leagueId: 'x' })).toThrow();
  });
});
