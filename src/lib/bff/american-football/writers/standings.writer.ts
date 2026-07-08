import { invalidRequestBody, notFound } from '@/lib/api/errors';
import {
  americanFootballStandingCreateSchema,
  type AmericanFootballStandingCreate,
  type AmericanFootballStandingItem,
} from '../schemas/standing.schema';
import {
  createAmericanFootballStanding,
  deleteAmericanFootballStanding,
  updateAmericanFootballStanding,
} from '@/lib/firebase/repositories/american-football-standings.repository';
import { requireAmericanFootballTeamInLeague } from '@/lib/firebase/repositories/american-football-teams.repository';
import { mapRawAmericanFootballStandingToApiSports } from '../mappers/standing.mapper';
import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import { buildTeamMapForLeague } from '@/lib/firebase/repositories/teams.repository';
import { getLeague } from '@/lib/firebase/repositories/leagues.repository';
import { findSeasonByYear } from '@/lib/firebase/repositories/seasons.repository';

function parseStandingBody(body: unknown): AmericanFootballStandingCreate {
  const parsed = americanFootballStandingCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid standing body.');
  }
  return parsed.data;
}

async function resolveStandingContext(item: AmericanFootballStandingCreate) {
  const league = await getLeague(String(item.league.id));
  if (!league || league.sportSlug !== 'american-football') {
    throw notFound('League not found.');
  }

  const seasonYear =
    typeof item.league.season === 'number'
      ? item.league.season
      : Number(item.league.season ?? NaN);
  if (Number.isNaN(seasonYear)) throw notFound('Season not found.');

  const season = await findSeasonByYear(league.id, seasonYear);
  if (!season?.id) throw notFound('Season not found.');

  const teamDoc = await requireAmericanFootballTeamInLeague(league.id, String(item.team.id));

  return { league, season, seasonYear, teamDoc };
}

export async function createAmericanFootballStandingEntry(body: unknown): Promise<AmericanFootballStandingItem> {
  const item = parseStandingBody(body);
  const { league, season, seasonYear, teamDoc } = await resolveStandingContext(item);

  const doc = await createAmericanFootballStanding(league.id, season.id, teamDoc.id, item);
  const [countryMap, teamMap] = await Promise.all([
    buildCountryMap(),
    buildTeamMapForLeague(league.id, 'american-football'),
  ]);
  const country = league.dto.country
    ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
    : null;

  return mapRawAmericanFootballStandingToApiSports(
    doc,
    league.dto,
    country,
    seasonYear,
    teamMap,
  );
}

export async function updateAmericanFootballStandingEntry(
  standingId: string,
  body: unknown,
): Promise<AmericanFootballStandingItem> {
  const patch = parseStandingBody(body);
  const doc = await updateAmericanFootballStanding(standingId, patch);

  const leagueId = typeof doc.data.league_id === 'string' ? doc.data.league_id : null;
  if (!leagueId) throw notFound('Standing not found.');

  const league = await getLeague(leagueId);
  if (!league || league.sportSlug !== 'american-football') {
    throw notFound('League not found.');
  }

  const seasonYear =
    typeof patch.league.season === 'number'
      ? patch.league.season
      : Number(patch.league.season ?? NaN);

  const [countryMap, teamMap] = await Promise.all([
    buildCountryMap(),
    buildTeamMapForLeague(league.id, 'american-football'),
  ]);
  const country = league.dto.country
    ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
    : null;

  return mapRawAmericanFootballStandingToApiSports(
    doc,
    league.dto,
    country,
    seasonYear,
    teamMap,
  );
}

export async function deleteAmericanFootballStandingEntry(standingId: string): Promise<void> {
  await deleteAmericanFootballStanding(standingId);
}
