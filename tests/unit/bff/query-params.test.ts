import { describe, expect, it } from 'vitest';
import {
  parseCountryQuery,
  parseFixtureQuery,
  parseLeagueQuery,
  parseRoundsQuery,
  parseStandingsQuery,
  requireLeagueExternalId,
} from '@/lib/bff/football/query-params';

describe('BFF query params', () => {
  it('parses country filters', () => {
    expect(parseCountryQuery(new URLSearchParams('name=Mex&code=MX'))).toEqual({
      name: 'Mex',
      code: 'MX',
    });
  });

  it('parses league filters', () => {
    expect(parseLeagueQuery(new URLSearchParams('id=262&country=Mexico&season=2026&current=true'))).toEqual({
      id: '262',
      country: 'Mexico',
      seasonYear: 2026,
      current: true,
    });
  });

  it('parses fixture filters including ids and last/next', () => {
    expect(
      parseFixtureQuery(new URLSearchParams('league=262&season=2026&team=1&last=5&round=Final')),
    ).toEqual({
      id: undefined,
      ids: undefined,
      live: undefined,
      date: undefined,
      leagueExternalId: '262',
      seasonYear: 2026,
      teamExternalId: '1',
      last: 5,
      next: undefined,
      from: undefined,
      to: undefined,
      round: 'Final',
      status: undefined,
      venue: undefined,
      timezone: undefined,
    });
  });

  it('parses hyphen-separated fixture ids', () => {
    expect(parseFixtureQuery(new URLSearchParams('ids=1-2-3')).ids).toEqual(['1', '2', '3']);
  });

  it('parses standings and rounds required params', () => {
    expect(parseStandingsQuery(new URLSearchParams('league=262&season=2026'))).toEqual({
      leagueExternalId: '262',
      seasonYear: 2026,
    });
    expect(parseRoundsQuery(new URLSearchParams('league=262&season=2026&current=true'))).toEqual({
      leagueExternalId: '262',
      seasonYear: 2026,
      current: true,
    });
  });

  it('requires league external id when missing', () => {
    expect(() => requireLeagueExternalId(undefined)).toThrow(/league/i);
  });
});
