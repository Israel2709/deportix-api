export * from './envelope.schema';
export * from './country.schema';
export * from './team.schema';
export * from './league.schema';
export * from './game.schema';
export * from './standing.schema';

import { americanFootballEnvelopeSchema } from './envelope.schema';
import { americanFootballCountryItemSchema } from './country.schema';
import { americanFootballTeamItemSchema } from './team.schema';
import { americanFootballLeagueItemSchema } from './league.schema';
import { americanFootballGameItemSchema } from './game.schema';
import { americanFootballStandingItemSchema } from './standing.schema';
import { z } from 'zod';

export const americanFootballTimezoneEnvelopeSchema = americanFootballEnvelopeSchema(z.string());
export const americanFootballSeasonsEnvelopeSchema = americanFootballEnvelopeSchema(z.number());
export const americanFootballCountriesEnvelopeSchema = americanFootballEnvelopeSchema(americanFootballCountryItemSchema);
export const americanFootballLeaguesEnvelopeSchema = americanFootballEnvelopeSchema(americanFootballLeagueItemSchema);
export const americanFootballGamesEnvelopeSchema = americanFootballEnvelopeSchema(americanFootballGameItemSchema);
export const americanFootballTeamsEnvelopeSchema = americanFootballEnvelopeSchema(americanFootballTeamItemSchema);
export const americanFootballStandingsEnvelopeSchema = americanFootballEnvelopeSchema(americanFootballStandingItemSchema);
