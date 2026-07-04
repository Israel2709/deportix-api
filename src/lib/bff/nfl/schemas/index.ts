export * from './envelope.schema';
export * from './country.schema';
export * from './team.schema';
export * from './league.schema';
export * from './game.schema';
export * from './standing.schema';

import { nflEnvelopeSchema } from './envelope.schema';
import { nflCountryItemSchema } from './country.schema';
import { nflTeamItemSchema } from './team.schema';
import { nflLeagueItemSchema } from './league.schema';
import { nflGameItemSchema } from './game.schema';
import { nflStandingItemSchema } from './standing.schema';
import { z } from 'zod';

export const nflTimezoneEnvelopeSchema = nflEnvelopeSchema(z.string());
export const nflSeasonsEnvelopeSchema = nflEnvelopeSchema(z.number());
export const nflCountriesEnvelopeSchema = nflEnvelopeSchema(nflCountryItemSchema);
export const nflLeaguesEnvelopeSchema = nflEnvelopeSchema(nflLeagueItemSchema);
export const nflGamesEnvelopeSchema = nflEnvelopeSchema(nflGameItemSchema);
export const nflTeamsEnvelopeSchema = nflEnvelopeSchema(nflTeamItemSchema);
export const nflStandingsEnvelopeSchema = nflEnvelopeSchema(nflStandingItemSchema);
