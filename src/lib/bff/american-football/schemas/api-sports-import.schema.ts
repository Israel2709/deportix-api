/**
 * Zod schemas for captured api-sports American Football JSON fixtures.
 * Uses legacy numeric/string ids — not the Deportix canonical UUID contract.
 */
import { z } from 'zod';
import { americanFootballEnvelopeSchema } from './envelope.schema';
import { legacyIdSchema, nullableString } from './primitives';

const importCountryRefSchema = z
  .object({
    name: z.string(),
    code: nullableString.optional(),
    flag: nullableString.optional(),
  })
  .strict();

const importTeamRefSchema = z
  .object({
    id: legacyIdSchema,
    name: z.string(),
    logo: nullableString.optional(),
  })
  .strict();

const importLeagueRefSchema = z
  .object({
    id: legacyIdSchema,
    name: z.string(),
    season: z.union([z.number(), z.string()]).optional(),
    logo: nullableString.optional(),
    country: importCountryRefSchema.optional(),
  })
  .strict();

export const americanFootballTeamApiSportsImportSchema = z
  .object({
    id: legacyIdSchema,
    name: z.string(),
    logo: nullableString.optional(),
    altLogo: nullableString.optional(),
  })
  .strict();

export const americanFootballLeagueApiSportsImportSchema = z
  .object({
    league: z
      .object({
        id: legacyIdSchema,
        name: z.string(),
        type: nullableString.optional(),
        logo: nullableString.optional(),
        altLogo: nullableString.optional(),
      })
      .strict(),
    country: importCountryRefSchema,
    seasons: z.array(
      z
        .object({
          year: z.number(),
          start: nullableString.optional(),
          end: nullableString.optional(),
          current: z.boolean(),
          coverage: z.record(z.string(), z.unknown()).optional(),
        })
        .strict(),
    ),
  })
  .strict();

export const americanFootballGameApiSportsImportSchema = z
  .object({
    game: z
      .object({
        id: legacyIdSchema,
        stage: nullableString.optional(),
        week: nullableString.optional(),
        date: z.record(z.string(), z.unknown()).optional(),
        venue: z.record(z.string(), z.unknown()).optional(),
        status: z.record(z.string(), z.unknown()).optional(),
      })
      .strict(),
    league: importLeagueRefSchema,
    teams: z
      .object({
        home: importTeamRefSchema,
        away: importTeamRefSchema,
      })
      .strict(),
    scores: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const americanFootballStandingApiSportsImportSchema = z
  .object({
    league: importLeagueRefSchema,
    conference: nullableString.optional(),
    division: nullableString.optional(),
    position: z.number().nullable().optional(),
    team: importTeamRefSchema,
    won: z.number().nullable().optional(),
    lost: z.number().nullable().optional(),
    ties: z.number().nullable().optional(),
    points: z.record(z.string(), z.unknown()).optional(),
    records: z.record(z.string(), z.unknown()).optional(),
    streak: nullableString.optional(),
    ncaa_conference: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const americanFootballLeaguesApiSportsImportEnvelopeSchema = americanFootballEnvelopeSchema(
  americanFootballLeagueApiSportsImportSchema,
);
export const americanFootballGamesApiSportsImportEnvelopeSchema = americanFootballEnvelopeSchema(
  americanFootballGameApiSportsImportSchema,
);
export const americanFootballTeamsApiSportsImportEnvelopeSchema = americanFootballEnvelopeSchema(
  americanFootballTeamApiSportsImportSchema,
);
export const americanFootballStandingsApiSportsImportEnvelopeSchema = americanFootballEnvelopeSchema(
  americanFootballStandingApiSportsImportSchema,
);
