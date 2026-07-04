import { z } from 'zod';
import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { nflCountryItemSchema } from '../schemas/country.schema';
import { nflLeagueItemSchema } from '../schemas/league.schema';
import {
  buildCountryMap,
  createCountry,
  deleteCountry,
  getCountryByKey,
  updateCountry,
} from '@/lib/firebase/repositories/countries.repository';
import {
  createLeague,
  deleteLeague,
  getLeague,
  listLeagues,
  updateLeague,
} from '@/lib/firebase/repositories/leagues.repository';
import {
  createSeason,
  deleteSeason,
  findSeasonByYear,
} from '@/lib/firebase/repositories/seasons.repository';
import {
  createTimezone,
  deleteTimezone,
  updateTimezone,
} from '@/lib/firebase/repositories/timezones.repository';
import { mapNflCountryToApiSports } from '../mappers/country.mapper';
import { mapNflLeagueToApiSports } from '../mappers/league.mapper';
import { listSeasonsByLeague } from '@/lib/firebase/repositories/seasons.repository';

const seasonYearSchema = z.object({ year: z.number().int() }).strict();
const timezoneSchema = z.object({ timezone: z.string().min(1) }).strict();

export async function createNflCountryEntry(body: unknown) {
  const item = nflCountryItemSchema.parse(body);
  const country = await createCountry(item);
  return mapNflCountryToApiSports(country);
}

export async function updateNflCountryEntry(key: string, body: unknown) {
  const item = nflCountryItemSchema.parse(body);
  const country = await updateCountry(key, item);
  return mapNflCountryToApiSports(country);
}

export async function deleteNflCountryEntry(key: string) {
  await deleteCountry(key);
}

export async function createNflLeagueEntry(body: unknown) {
  const item = nflLeagueItemSchema.parse(body);
  let countryId: string | null = null;
  if (item.country.name) {
    const country = await getCountryByKey(item.country.name);
    countryId = country?.id ?? null;
  }

  const league = await createLeague({
    name: item.league.name,
    sportSlug: 'nfl',
    externalId: item.league.id != null ? String(item.league.id) : null,
    type: item.league.type ?? 'league',
    logo: item.league.logo ?? null,
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
  return mapNflLeagueToApiSports(league.dto, country, seasons);
}

export async function updateNflLeagueEntry(id: string, body: unknown) {
  const item = nflLeagueItemSchema.parse(body);
  await updateLeague(id, {
    name: item.league.name,
    external_id: item.league.id != null ? String(item.league.id) : null,
    type: item.league.type ?? 'league',
    logo: item.league.logo ?? null,
    api_sports_payload: item,
  });

  const league = await getLeague(id);
  if (!league) throw notFound('League not found.');

  const countryMap = await buildCountryMap();
  const country = league.dto.country
    ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
    : null;
  const seasons = await listSeasonsByLeague(league.id);
  return mapNflLeagueToApiSports(league.dto, country, seasons);
}

export async function deleteNflLeagueEntry(id: string) {
  await deleteLeague(id);
}

export async function createNflSeasonYear(body: unknown) {
  const parsed = seasonYearSchema.safeParse(body);
  if (!parsed.success) throw invalidRequestBody('Body must include { year: number }.');
  const leagues = await listLeagues({ sportSlug: 'nfl' });
  if (leagues.length === 0) {
    throw invalidRequestBody('Create an NFL league before adding seasons.');
  }
  await createSeason({ leagueId: leagues[0]!.id, year: parsed.data.year, current: false });
  return parsed.data.year;
}

export async function deleteNflSeasonYear(body: unknown) {
  const parsed = seasonYearSchema.safeParse(body);
  if (!parsed.success) throw invalidRequestBody('Body must include { year: number }.');
  const leagues = await listLeagues({ sportSlug: 'nfl' });
  for (const league of leagues) {
    const season = await findSeasonByYear(league.id, parsed.data.year);
    if (season) await deleteSeason(season.id);
  }
}

export async function createNflTimezoneEntry(body: unknown) {
  const parsed = timezoneSchema.safeParse(body);
  if (!parsed.success) throw invalidRequestBody('Body must include { timezone: string }.');
  return createTimezone(parsed.data.timezone);
}

export async function updateNflTimezoneEntry(body: unknown) {
  const schema = z
    .object({ timezone: z.string().min(1), newTimezone: z.string().min(1) })
    .strict();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody('Body must include { timezone, newTimezone }.');
  }
  return updateTimezone(parsed.data.timezone, parsed.data.newTimezone);
}

export async function deleteNflTimezoneEntry(body: unknown) {
  const parsed = timezoneSchema.safeParse(body);
  if (!parsed.success) throw invalidRequestBody('Body must include { timezone: string }.');
  await deleteTimezone(parsed.data.timezone);
}
