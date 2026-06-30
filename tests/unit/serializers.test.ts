import { describe, expect, it } from 'vitest';
import {
  pickLatestUpdatedAt,
  serializeLeague,
  serializeMatch,
  serializeStanding,
  serializeTeam,
} from '@/lib/api/serializers';

describe('serializeTeam', () => {
  it('reads nested soccer team + venue', () => {
    const dto = serializeTeam('soccer', 't1', {
      external_id: '458',
      league_id: 'lg',
      team: { name: 'Argentinos JRS', code: 'ARG', country: 'Argentina', logo: 'x.png' },
      venue: { id: 37, name: 'Estadio', city: 'CABA', capacity: 24380 },
      updated_at: '2026-06-17T00:00:00Z',
    });
    expect(dto).toMatchObject({
      id: 't1',
      sport: 'soccer',
      name: 'Argentinos JRS',
      code: 'ARG',
      logo: 'x.png',
      venue: { id: 37, name: 'Estadio', capacity: 24380 },
      updatedAt: '2026-06-17T00:00:00Z',
    });
  });

  it('reads top-level NFL team fields', () => {
    const dto = serializeTeam('nfl', 'n1', {
      name: 'Dallas Cowboys',
      city: 'Dallas',
      conference: 'NFC',
      division: 'East',
    });
    expect(dto).toMatchObject({ name: 'Dallas Cowboys', conference: 'NFC', division: 'East' });
    expect(dto.venue).toBeNull();
  });

  it('reads top-level alt name and alt logo for any sport', () => {
    const dto = serializeTeam('soccer', 't3', {
      team: { name: 'Club América' },
      alt_name: 'Las Águilas',
      alt_logo: 'https://example.com/alt.png',
    });
    expect(dto).toMatchObject({
      name: 'Club América',
      altName: 'Las Águilas',
      altLogo: 'https://example.com/alt.png',
    });
  });

  it('is resilient to missing fields', () => {
    const dto = serializeTeam('soccer', 't2', {});
    expect(dto.name).toBeNull();
    expect(dto.venue).toBeNull();
  });
});

describe('serializeMatch', () => {
  it('maps denormalized soccer match data', () => {
    const dto = serializeMatch('soccer', 'm1', {
      external_id: '99',
      league_id: 'lg',
      season_id: 's1',
      fixture_date: '2026-11-08T21:00:00.000Z',
      status: 'NS',
      home_team_id: 'h',
      away_team_id: 'a',
      goals: { home: 2, away: 1 },
      teams: { home: { name: 'Tigre', logo: 'h.png' }, away: { name: 'Sarmiento', logo: 'a.png' } },
      league: { round: 'Clausura - 16' },
    });
    expect(dto.date).toBe('2026-11-08T21:00:00.000Z');
    expect(dto.round).toBe('Clausura - 16');
    expect(dto.home).toMatchObject({ teamId: 'h', name: 'Tigre', score: 2 });
    expect(dto.away).toMatchObject({ teamId: 'a', name: 'Sarmiento', score: 1 });
  });

  it('falls back to a team map when names are not denormalized (NFL-style)', () => {
    const teamMap = new Map([['h', { name: 'Home FC', logo: null }]]);
    const dto = serializeMatch('nfl', 'm2', {
      game_date: '2026-09-01T00:00:00Z',
      status: 'NS',
      home_team_id: 'h',
      away_team_id: 'a',
    }, teamMap);
    expect(dto.date).toBe('2026-09-01T00:00:00Z');
    expect(dto.home.name).toBe('Home FC');
    expect(dto.away.name).toBeNull();
  });

  it('prefers canonical team map logos over denormalized soccer match snapshots', () => {
    const teamMap = new Map([
      [
        'h',
        {
          name: 'Tigre',
          logo: 'https://firebasestorage.googleapis.com/v0/b/deportix/tigre.png',
        },
      ],
      [
        'a',
        {
          name: 'Sarmiento',
          logo: 'https://firebasestorage.googleapis.com/v0/b/deportix/sarmiento.png',
        },
      ],
    ]);
    const dto = serializeMatch(
      'soccer',
      'm3',
      {
        home_team_id: 'h',
        away_team_id: 'a',
        goals: { home: 1, away: 0 },
        teams: {
          home: {
            name: 'Tigre',
            logo: 'https://media.api-sports.io/football/teams/1.png',
          },
          away: {
            name: 'Sarmiento',
            logo: 'https://media.api-sports.io/football/teams/2.png',
          },
        },
      },
      teamMap,
    );
    expect(dto.home.logo).toBe('https://firebasestorage.googleapis.com/v0/b/deportix/tigre.png');
    expect(dto.away.logo).toBe('https://firebasestorage.googleapis.com/v0/b/deportix/sarmiento.png');
  });
});

describe('serializeStanding', () => {
  it('keeps draws for soccer, ties for nfl', () => {
    const soccer = serializeStanding('soccer', { team_id: 't', points: 10, played: 4, wins: 3, draws: 1, losses: 0 });
    expect(soccer).toMatchObject({ points: 10, draws: 1, ties: null });
    const nfl = serializeStanding('nfl', { team_id: 't', wins: 2, losses: 1, ties: 1 });
    expect(nfl).toMatchObject({ wins: 2, ties: 1, draws: null });
  });
});

describe('serializeLeague + pickLatestUpdatedAt', () => {
  it('attaches resolved sport/country', () => {
    const dto = serializeLeague('lg', { external_id: '262', name: 'Liga MX', type: 'League' }, {
      sport: 'soccer',
      country: 'Mexico',
    });
    expect(dto).toMatchObject({ name: 'Liga MX', sport: 'soccer', country: 'Mexico' });
  });

  it('picks the latest updatedAt', () => {
    expect(
      pickLatestUpdatedAt([{ updatedAt: '2026-01-01' }, { updatedAt: '2026-05-01' }, { updatedAt: null }]),
    ).toBe('2026-05-01');
    expect(pickLatestUpdatedAt([])).toBeNull();
  });
});
