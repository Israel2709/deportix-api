import { describe, expect, it } from 'vitest';
import { preferCanonicalString } from '@/lib/api/canonical-fields';
import { mapRawSoccerMatchToApiSports } from '@/lib/bff/football/mappers/fixture.mapper';

describe('preferCanonicalString', () => {
  it('prefers canonical Firestore values over denormalized snapshots', () => {
    expect(
      preferCanonicalString(
        'https://firebasestorage.googleapis.com/team.png',
        'https://media.api-sports.io/football/teams/1.png',
      ),
    ).toBe('https://firebasestorage.googleapis.com/team.png');
  });

  it('falls back when canonical is missing', () => {
    expect(preferCanonicalString(null, 'https://media.api-sports.io/football/teams/1.png')).toBe(
      'https://media.api-sports.io/football/teams/1.png',
    );
  });
});

describe('fixture mapper', () => {
  it('maps nested raw soccer documents to API-Sports shape', () => {
    const mapped = mapRawSoccerMatchToApiSports(
      {
        id: 'm1',
        data: {
          external_id: '1044888',
          fixture_date: '2026-08-01T00:00:00Z',
          status: 'NS',
          home_team_id: 'tm_home',
          away_team_id: 'tm_away',
          fixture: { id: 1044888, date: '2026-08-01T00:00:00Z', venue: { name: 'Monumental' } },
          league: { id: 128, name: 'Liga Profesional', season: 2026, round: 'Regular Season - 1' },
          goals: { home: null, away: null },
          teams: {
            home: { id: 1, name: 'Boca', logo: 'b.png', winner: null },
            away: { id: 2, name: 'River', logo: 'r.png', winner: null },
          },
        },
      },
      new Map([
        ['tm_home', { name: 'Boca Juniors', logo: 'b.png' }],
        ['tm_away', { name: 'River Plate', logo: 'r.png' }],
      ]),
      { home: '1', away: '2' },
    );

    expect(mapped.fixture).toMatchObject({
      id: 1044888,
      date: '2026-08-01T00:00:00Z',
      status: { short: 'NS', long: 'NS', elapsed: null },
    });
    expect(mapped.teams).toMatchObject({
      home: { id: 1, name: 'Boca Juniors', logo: 'b.png' },
      away: { id: 2, name: 'River Plate', logo: 'r.png' },
    });
    expect(mapped.league).toMatchObject({ id: 128, season: 2026, round: 'Regular Season - 1' });
    expect(mapped.goals).toEqual({ home: null, away: null });
  });

  it('prefers Firebase team and league assets over API-Sports snapshots in the match blob', () => {
    const mapped = mapRawSoccerMatchToApiSports(
      {
        id: 'm2',
        data: {
          home_team_id: 'tm_home',
          away_team_id: 'tm_away',
          teams: {
            home: {
              name: 'Old Name',
              logo: 'https://media.api-sports.io/football/teams/1.png',
            },
            away: {
              name: 'Away Old',
              logo: 'https://media.api-sports.io/football/teams/2.png',
            },
          },
          league: {
            name: 'Old League',
            logo: 'https://media.api-sports.io/football/leagues/128.png',
            flag: 'https://media.api-sports.io/flags/ar.svg',
          },
        },
      },
      new Map([
        [
          'tm_home',
          {
            name: 'Boca Juniors',
            logo: 'https://firebasestorage.googleapis.com/v0/b/deportix/team-home.png',
          },
        ],
        [
          'tm_away',
          {
            name: 'River Plate',
            logo: 'https://firebasestorage.googleapis.com/v0/b/deportix/team-away.png',
          },
        ],
      ]),
      { home: '1', away: '2' },
      {
        name: 'Liga Profesional',
        logo: 'https://firebasestorage.googleapis.com/v0/b/deportix/league.png',
        countryName: 'Argentina',
        countryFlag: 'https://firebasestorage.googleapis.com/v0/b/deportix/ar.svg',
      },
    );

    expect(mapped.teams).toMatchObject({
      home: { name: 'Boca Juniors', logo: 'https://firebasestorage.googleapis.com/v0/b/deportix/team-home.png' },
      away: { name: 'River Plate', logo: 'https://firebasestorage.googleapis.com/v0/b/deportix/team-away.png' },
    });
    expect(mapped.league).toMatchObject({
      name: 'Liga Profesional',
      logo: 'https://firebasestorage.googleapis.com/v0/b/deportix/league.png',
      country: 'Argentina',
      flag: 'https://firebasestorage.googleapis.com/v0/b/deportix/ar.svg',
    });
  });
});
