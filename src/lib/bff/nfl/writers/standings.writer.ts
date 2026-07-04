import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { nflStandingItemSchema, type NflStandingItem } from '../schemas/standing.schema';
import {
  createNflStanding,
  deleteNflStanding,
  updateNflStanding,
} from '@/lib/firebase/repositories/nfl-standings.repository';
import { resolveNflTeamByExternalId } from '@/lib/firebase/repositories/nfl-teams.repository';
import { mapRawNflStandingToApiSports } from '../mappers/standing.mapper';
import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import { buildTeamExternalIdMap, buildTeamMapForLeague } from '@/lib/firebase/repositories/teams.repository';
import { resolveNflLeague, resolveNflSeason } from '../services/leagues.service';

function parseStandingBody(body: unknown): NflStandingItem {
  const parsed = nflStandingItemSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid standing body.');
  }
  return parsed.data;
}

export async function createNflStandingEntry(body: unknown): Promise<NflStandingItem> {
  const item = parseStandingBody(body);
  const league = await resolveNflLeague(String(item.league.id ?? ''));
  if (!league) throw notFound('League not found.');

  const seasonYear =
    typeof item.league.season === 'number'
      ? item.league.season
      : Number(item.league.season ?? NaN);
  const season = await resolveNflSeason(league.id, seasonYear);
  if (!season) throw notFound('Season not found.');

  const teamDoc = await resolveNflTeamByExternalId(league.id, item.team.id);
  if (!teamDoc) throw notFound('Team not found.');

  const doc = await createNflStanding(league.id, season.id, teamDoc.id, item);
  const [countryMap, teamMap, teamExternalIds] = await Promise.all([
    buildCountryMap(),
    buildTeamMapForLeague(league.id, 'nfl'),
    buildTeamExternalIdMap(league.id, 'nfl'),
  ]);
  const country = league.dto.country
    ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
    : null;

  return mapRawNflStandingToApiSports(
    doc,
    league.dto,
    country,
    seasonYear,
    teamMap,
    teamExternalIds,
  );
}

export async function updateNflStandingEntry(
  standingId: string,
  body: unknown,
): Promise<NflStandingItem> {
  const patch = parseStandingBody(body);
  const doc = await updateNflStanding(standingId, patch);

  const leagueId = typeof doc.data.league_id === 'string' ? doc.data.league_id : null;
  if (!leagueId) throw notFound('Standing not found.');

  const league = await resolveNflLeague(leagueId);
  if (!league) throw notFound('League not found.');

  const seasonYear =
    typeof patch.league.season === 'number'
      ? patch.league.season
      : Number(patch.league.season ?? NaN);

  const [countryMap, teamMap, teamExternalIds] = await Promise.all([
    buildCountryMap(),
    buildTeamMapForLeague(league.id, 'nfl'),
    buildTeamExternalIdMap(league.id, 'nfl'),
  ]);
  const country = league.dto.country
    ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
    : null;

  return mapRawNflStandingToApiSports(
    doc,
    league.dto,
    country,
    seasonYear,
    teamMap,
    teamExternalIds,
  );
}

export async function deleteNflStandingEntry(standingId: string): Promise<void> {
  await deleteNflStanding(standingId);
}
