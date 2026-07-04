import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { americanFootballStandingItemSchema, type AmericanFootballStandingItem } from '../schemas/standing.schema';
import {
  createAmericanFootballStanding,
  deleteAmericanFootballStanding,
  updateAmericanFootballStanding,
} from '@/lib/firebase/repositories/american-football-standings.repository';
import { resolveAmericanFootballTeamByExternalId } from '@/lib/firebase/repositories/american-football-teams.repository';
import { mapRawAmericanFootballStandingToApiSports } from '../mappers/standing.mapper';
import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import { buildTeamExternalIdMap, buildTeamMapForLeague } from '@/lib/firebase/repositories/teams.repository';
import { resolveAmericanFootballLeague, resolveAmericanFootballSeason } from '../services/leagues.service';

function parseStandingBody(body: unknown): AmericanFootballStandingItem {
  const parsed = americanFootballStandingItemSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid standing body.');
  }
  return parsed.data;
}

export async function createAmericanFootballStandingEntry(body: unknown): Promise<AmericanFootballStandingItem> {
  const item = parseStandingBody(body);
  const league = await resolveAmericanFootballLeague(String(item.league.id ?? ''));
  if (!league) throw notFound('League not found.');

  const seasonYear =
    typeof item.league.season === 'number'
      ? item.league.season
      : Number(item.league.season ?? NaN);
  const season = await resolveAmericanFootballSeason(league.id, seasonYear);
  if (!season) throw notFound('Season not found.');

  const teamDoc = await resolveAmericanFootballTeamByExternalId(league.id, item.team.id);
  if (!teamDoc) throw notFound('Team not found.');

  const doc = await createAmericanFootballStanding(league.id, season.id, teamDoc.id, item);
  const [countryMap, teamMap, teamExternalIds] = await Promise.all([
    buildCountryMap(),
    buildTeamMapForLeague(league.id, 'american-football'),
    buildTeamExternalIdMap(league.id, 'american-football'),
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
    teamExternalIds,
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

  const league = await resolveAmericanFootballLeague(leagueId);
  if (!league) throw notFound('League not found.');

  const seasonYear =
    typeof patch.league.season === 'number'
      ? patch.league.season
      : Number(patch.league.season ?? NaN);

  const [countryMap, teamMap, teamExternalIds] = await Promise.all([
    buildCountryMap(),
    buildTeamMapForLeague(league.id, 'american-football'),
    buildTeamExternalIdMap(league.id, 'american-football'),
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
    teamExternalIds,
  );
}

export async function deleteAmericanFootballStandingEntry(standingId: string): Promise<void> {
  await deleteAmericanFootballStanding(standingId);
}
