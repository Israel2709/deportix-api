import { z } from 'zod';
import { invalidRequestBody, notFound } from '@/lib/api/errors';
import {
  createCatalogCountry,
  deleteCatalogCountry,
  updateCatalogCountry,
} from '@/lib/catalog/countries.service';
import { buildCountryMap, getCountryByKey } from '@/lib/firebase/repositories/countries.repository';
import {
  soccerLeagueCreateSchema,
  soccerSeasonItemSchema,
  type SoccerSeasonItem,
} from '../schemas/league.schema';
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
  updateSeason,
} from '@/lib/firebase/repositories/seasons.repository';
import { mapLeagueToApiSports } from '../mappers/league.mapper';
import { resolveSoccerLeague } from '../services/leagues.service';
import { resolveCatalogLeagueType } from '@/lib/catalog/league-types.service';

const seasonYearSchema = z.object({ year: z.number().int() }).strict();

async function syncSoccerLeagueSeasons(
  leagueId: string,
  seasons: SoccerSeasonItem[],
): Promise<void> {
  const currentYear = seasons.find((season) => season.current)?.year ?? null;

  for (const season of seasons) {
    const existing = await findSeasonByYear(leagueId, season.year);
    const shouldBeCurrent = currentYear != null && season.year === currentYear;
    const patch = {
      start_date: season.start ?? null,
      end_date: season.end ?? null,
      current: shouldBeCurrent,
      ...(season.coverage !== undefined ? { coverage: season.coverage } : {}),
    };

    if (existing) {
      await updateSeason(existing.id, patch);
    } else {
      await createSeason({
        leagueId,
        year: season.year,
        startDate: season.start ?? null,
        endDate: season.end ?? null,
        current: shouldBeCurrent,
        coverage: season.coverage,
      });
    }
  }

  if (currentYear != null) {
    const allSeasons = await listSeasonsByLeague(leagueId);
    for (const season of allSeasons) {
      if (season.year !== currentYear && season.current) {
        await updateSeason(season.id, { current: false });
      }
    }
  }
}

async function applySoccerSeasonPatch(leagueId: string, season: SoccerSeasonItem): Promise<number> {
  const existing = await findSeasonByYear(leagueId, season.year);
  if (!existing) throw notFound('Season not found.');

  await updateSeason(existing.id, {
    start_date: season.start ?? null,
    end_date: season.end ?? null,
    current: season.current,
    ...(season.coverage !== undefined ? { coverage: season.coverage } : {}),
  });

  if (season.current) {
    const allSeasons = await listSeasonsByLeague(leagueId);
    for (const item of allSeasons) {
      if (item.year !== season.year && item.current) {
        await updateSeason(item.id, { current: false });
      }
    }
  }

  return season.year;
}

export async function createSoccerCountryEntry(body: unknown) {
  return createCatalogCountry(body);
}

export async function updateSoccerCountryEntry(key: string, body: unknown) {
  return updateCatalogCountry(key, body);
}

export async function deleteSoccerCountryEntry(key: string) {
  await deleteCatalogCountry(key);
}

export async function createSoccerLeagueEntry(body: unknown) {
  const item = soccerLeagueCreateSchema.parse(body);
  let countryId: string | null = null;
  if (item.country.name) {
    const country = await getCountryByKey(item.country.name);
    countryId = country?.id ?? null;
  }

  const leagueType = await resolveCatalogLeagueType(item.league.type);

  const league = await createLeague({
    name: item.league.name,
    sportSlug: 'soccer',
    externalId: null,
    type: leagueType,
    logo: item.league.logo ?? null,
    altLogo: null,
    countryId,
    apiSportsPayload: null,
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
  return mapLeagueToApiSports(league.dto, country, seasons);
}

export async function updateSoccerLeagueEntry(id: string, body: unknown) {
  const item = soccerLeagueCreateSchema.parse(body);
  const leagueType = await resolveCatalogLeagueType(item.league.type);

  await updateLeague(id, {
    name: item.league.name,
    type: leagueType,
    logo: item.league.logo ?? null,
    alt_logo: null,
  });

  await syncSoccerLeagueSeasons(id, item.seasons);

  const league = await getLeague(id);
  if (!league || league.sportSlug !== 'soccer') throw notFound('League not found.');

  const countryMap = await buildCountryMap();
  const country = league.dto.country
    ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
    : null;
  const seasons = await listSeasonsByLeague(league.id);
  return mapLeagueToApiSports(league.dto, country, seasons);
}

export async function deleteSoccerLeagueEntry(id: string) {
  await deleteLeague(id);
}

export async function createSoccerSeasonYear(body: unknown, leagueExternalId: string) {
  const parsed = seasonYearSchema.safeParse(body);
  if (!parsed.success) throw invalidRequestBody('Body must include { year: number }.');
  const league = await resolveSoccerLeague(leagueExternalId);
  if (!league) throw invalidRequestBody('League not found.');

  await createSeason({ leagueId: league.id, year: parsed.data.year, current: false });
  return parsed.data.year;
}

export async function updateSoccerSeasonYear(body: unknown, leagueExternalId: string) {
  const parsed = soccerSeasonItemSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(
      'Body must include { year, current } and optional start, end, coverage.',
    );
  }
  const league = await resolveSoccerLeague(leagueExternalId);
  if (!league) throw invalidRequestBody('League not found.');

  return applySoccerSeasonPatch(league.id, parsed.data);
}

export async function deleteSoccerSeasonYear(body: unknown, leagueExternalId: string) {
  const parsed = seasonYearSchema.safeParse(body);
  if (!parsed.success) throw invalidRequestBody('Body must include { year: number }.');
  const league = await resolveSoccerLeague(leagueExternalId);
  if (!league) throw invalidRequestBody('League not found.');

  const season = await findSeasonByYear(league.id, parsed.data.year);
  if (season) await deleteSeason(season.id);
}
