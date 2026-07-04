import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  americanFootballCountriesEnvelopeSchema,
  americanFootballGamesEnvelopeSchema,
  americanFootballLeaguesEnvelopeSchema,
  americanFootballSeasonsEnvelopeSchema,
  americanFootballStandingsEnvelopeSchema,
  americanFootballTeamsEnvelopeSchema,
  americanFootballTimezoneEnvelopeSchema,
} from '@/lib/bff/american-football/schemas';

const FIXTURES_DIR = join(process.cwd(), 'tests/fixtures/api-sports-nfl');

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(FIXTURES_DIR, name), 'utf8'));
}

describe('NFL api-sports contract fixtures', () => {
  it('parses timezone envelope', () => {
    expect(americanFootballTimezoneEnvelopeSchema.parse(loadFixture('timezone.json'))).toMatchObject({
      get: 'timezone',
      results: 3,
    });
  });

  it('parses seasons envelope', () => {
    expect(americanFootballSeasonsEnvelopeSchema.parse(loadFixture('seasons.json'))).toMatchObject({
      get: 'seasons',
    });
  });

  it('parses countries envelope', () => {
    expect(americanFootballCountriesEnvelopeSchema.parse(loadFixture('countries.json'))).toMatchObject({
      get: 'countries',
    });
  });

  it('parses leagues envelope', () => {
    expect(americanFootballLeaguesEnvelopeSchema.parse(loadFixture('leagues.json'))).toMatchObject({
      get: 'leagues',
    });
  });

  it('parses games list envelope', () => {
    expect(americanFootballGamesEnvelopeSchema.parse(loadFixture('games-list.json'))).toMatchObject({
      get: 'games',
    });
  });

  it('parses games by id envelope', () => {
    expect(americanFootballGamesEnvelopeSchema.parse(loadFixture('games-by-id.json'))).toMatchObject({
      get: 'games',
      results: 1,
    });
  });

  it('parses teams envelope', () => {
    expect(americanFootballTeamsEnvelopeSchema.parse(loadFixture('teams.json'))).toMatchObject({
      get: 'teams',
    });
  });

  it('parses standings envelope', () => {
    expect(americanFootballStandingsEnvelopeSchema.parse(loadFixture('standings.json'))).toMatchObject({
      get: 'standings',
    });
  });
});
