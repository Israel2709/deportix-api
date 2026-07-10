import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import { getLeague } from '@/lib/firebase/repositories/leagues.repository';
import { findSeasonByYear, listSeasonsByLeague } from '@/lib/firebase/repositories/seasons.repository';
import {
  createSoccerStanding,
  deleteSoccerStanding,
  updateSoccerStanding,
} from '@/lib/firebase/repositories/soccer-standings.repository';
import { requireSoccerTeamInLeague } from '@/lib/firebase/repositories/soccer-teams.repository';
import { buildTeamExternalIdMap, buildTeamMapForLeague } from '@/lib/firebase/repositories/teams.repository';
import { soccerStandingCreateSchema } from '../schemas/standing.schema';
import { mapStandingsToApiSports } from '../mappers/standing.mapper';
import { resolveSoccerLeague } from '../services/leagues.service';
import { resolveDoc, type RawDoc } from '@/lib/firebase/repositories/helpers';
import { asStr } from '@/lib/api/serializers';

const COLLECTION = 'soccer_standings';

function parseStandingBody(body: unknown) {
  const parsed = soccerStandingCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid standing body.');
  }
  return parsed.data;
}

async function resolveStandingContext(item: ReturnType<typeof parseStandingBody>) {
  const league = await resolveSoccerLeague(item.league.id);
  if (!league) throw notFound('League not found.');

  const seasonYear =
    typeof item.league.season === 'number'
      ? item.league.season
      : Number(item.league.season ?? NaN);
  if (Number.isNaN(seasonYear)) throw notFound('Season not found.');

  const season = await findSeasonByYear(league.id, seasonYear);
  if (!season?.id) throw notFound('Season not found.');

  const teamDoc = await requireSoccerTeamInLeague(league.id, item.team.id);
  return { league, season, seasonYear, teamDoc };
}

async function mapStandingResponse(doc: RawDoc) {
  const leagueId = asStr(doc.data.league_id);
  const seasonId = asStr(doc.data.season_id);
  if (!leagueId || !seasonId) throw notFound('Standing not found.');

  const league = await getLeague(leagueId);
  if (!league || league.sportSlug !== 'soccer') throw notFound('Standing not found.');

  const seasons = await listSeasonsByLeague(league.id);
  const resolvedSeasonYear = seasons.find((item) => item.id === seasonId)?.year ?? null;
  if (resolvedSeasonYear == null) throw notFound('Standing not found.');

  const [countryMap, teamMap, externalIds] = await Promise.all([
    buildCountryMap(),
    buildTeamMapForLeague(league.id, 'soccer'),
    buildTeamExternalIdMap(league.id, 'soccer'),
  ]);
  const country = league.dto.country
    ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
    : null;

  return mapStandingsToApiSports(
    league.dto,
    country,
    resolvedSeasonYear,
    [doc],
    teamMap,
    externalIds,
  );
}

export async function createSoccerStandingEntry(body: unknown) {
  const item = parseStandingBody(body);
  const { league, season, teamDoc } = await resolveStandingContext(item);
  const doc = await createSoccerStanding(league.id, season.id, teamDoc.id, item);
  return mapStandingResponse(doc);
}

export async function updateSoccerStandingEntry(standingId: string, body: unknown) {
  const item = parseStandingBody(body);
  const doc = await updateSoccerStanding(standingId, item);
  return mapStandingResponse(doc);
}

export async function deleteSoccerStandingEntry(standingId: string) {
  await deleteSoccerStanding(standingId);
}

export async function getSoccerStandingEntry(standingId: string) {
  const doc = await resolveDoc(COLLECTION, standingId);
  if (!doc) throw notFound('Standing not found.');
  return mapStandingResponse(doc);
}
