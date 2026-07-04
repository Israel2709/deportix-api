import { z } from 'zod';
import { invalidRequestBody, notFound } from '@/lib/api/errors';
import {
  createCatalogCountry,
  deleteCatalogCountry,
  updateCatalogCountry,
} from '@/lib/catalog/countries.service';
import { buildCountryMap, getCountryByKey } from '@/lib/firebase/repositories/countries.repository';
import { americanFootballLeagueItemSchema } from '../schemas/league.schema';
import {
  createLeague,
  deleteLeague,
  getLeague,
  updateLeague,
} from '@/lib/firebase/repositories/leagues.repository';
import {
  createSeason,
  deleteSeason,
  findSeasonByYear,
  listSeasonsByLeague,
} from '@/lib/firebase/repositories/seasons.repository';
import {
  createTimezone,
  deleteTimezone,
  updateTimezone,
} from '@/lib/firebase/repositories/timezones.repository';
import { mapAmericanFootballCountryToApiSports } from '../mappers/country.mapper';
import { mapAmericanFootballLeagueToApiSports } from '../mappers/league.mapper';
import { resolveAmericanFootballLeague } from '../services/leagues.service';

const seasonYearSchema = z.object({ year: z.number().int() }).strict();
const timezoneSchema = z.object({ timezone: z.string().min(1) }).strict();

export async function createAmericanFootballCountryEntry(body: unknown) {
  return createCatalogCountry(body);
}

export async function updateAmericanFootballCountryEntry(key: string, body: unknown) {
  return updateCatalogCountry(key, body);
}

export async function deleteAmericanFootballCountryEntry(key: string) {
  await deleteCatalogCountry(key);
}

export async function createAmericanFootballLeagueEntry(body: unknown) {
  const item = americanFootballLeagueItemSchema.parse(body);
  let countryId: string | null = null;
  if (item.country.name) {
    const country = await getCountryByKey(item.country.name);
    countryId = country?.id ?? null;
  }

  const league = await createLeague({
    name: item.league.name,
    sportSlug: 'american-football',
    externalId: item.league.id != null ? String(item.league.id) : null,
    type: item.league.type ?? 'league',
    logo: item.league.logo ?? null,
    altLogo: item.league.altLogo ?? null,
    countryId,
    apiSportsPayload: item,
  });

  for (const season of item.seasons) {
    await createSeason({
      leagueId: league.id,
      year: season.year,
      startDate: season.start ?? null,
      endDate: season.end ?? null,
      current: season.current,
      coverage: season.coverage,
    });
  }

  const countryMap = await buildCountryMap();
  const country = league.dto.country
    ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
    : null;
  const seasons = await listSeasonsByLeague(league.id);
  return mapAmericanFootballLeagueToApiSports(league.dto, country, seasons);
}

export async function updateAmericanFootballLeagueEntry(id: string, body: unknown) {
  const item = americanFootballLeagueItemSchema.parse(body);
  await updateLeague(id, {
    name: item.league.name,
    external_id: item.league.id != null ? String(item.league.id) : null,
    type: item.league.type ?? 'league',
    logo: item.league.logo ?? null,
    alt_logo: item.league.altLogo ?? null,
    api_sports_payload: item,
  });

  const league = await getLeague(id);
  if (!league) throw notFound('League not found.');

  const countryMap = await buildCountryMap();
  const country = league.dto.country
    ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
    : null;
  const seasons = await listSeasonsByLeague(league.id);
  return mapAmericanFootballLeagueToApiSports(league.dto, country, seasons);
}

export async function deleteAmericanFootballLeagueEntry(id: string) {
  await deleteLeague(id);
}

export async function createAmericanFootballSeasonYear(body: unknown, leagueExternalId: string) {
  const parsed = seasonYearSchema.safeParse(body);
  if (!parsed.success) throw invalidRequestBody('Body must include { year: number }.');
  const league = await resolveAmericanFootballLeague(leagueExternalId);
  if (!league) throw invalidRequestBody('League not found.');

  await createSeason({ leagueId: league.id, year: parsed.data.year, current: false });
  return parsed.data.year;
}

export async function deleteAmericanFootballSeasonYear(body: unknown, leagueExternalId: string) {
  const parsed = seasonYearSchema.safeParse(body);
  if (!parsed.success) throw invalidRequestBody('Body must include { year: number }.');
  const league = await resolveAmericanFootballLeague(leagueExternalId);
  if (!league) throw invalidRequestBody('League not found.');

  const season = await findSeasonByYear(league.id, parsed.data.year);
  if (season) await deleteSeason(season.id);
}

export async function createAmericanFootballTimezoneEntry(body: unknown) {
  const parsed = timezoneSchema.safeParse(body);
  if (!parsed.success) throw invalidRequestBody('Body must include { timezone: string }.');
  return createTimezone(parsed.data.timezone);
}

export async function updateAmericanFootballTimezoneEntry(body: unknown) {
  const schema = z
    .object({ timezone: z.string().min(1), newTimezone: z.string().min(1) })
    .strict();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody('Body must include { timezone, newTimezone }.');
  }
  return updateTimezone(parsed.data.timezone, parsed.data.newTimezone);
}

export async function deleteAmericanFootballTimezoneEntry(body: unknown) {
  const parsed = timezoneSchema.safeParse(body);
  if (!parsed.success) throw invalidRequestBody('Body must include { timezone: string }.');
  await deleteTimezone(parsed.data.timezone);
}
