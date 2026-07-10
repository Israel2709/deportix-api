import { invalidRequestBody } from '@/lib/api/errors';
import { matchCreateSchema } from '@/lib/api/match-create';
import { matchUpdateSchema } from '@/lib/api/match-patch';
import {
  createMatch,
  deleteMatch,
  getMatchById,
  updateMatch,
} from '@/lib/firebase/repositories/matches.repository';
import { buildTeamExternalIdMap, buildTeamMapForLeague } from '@/lib/firebase/repositories/teams.repository';
import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import { getLeague } from '@/lib/firebase/repositories/leagues.repository';
import { findSeasonByYear } from '@/lib/firebase/repositories/seasons.repository';
import { soccerFixtureCreateSchema } from '../schemas/fixture.schema';
import { mapRawSoccerMatchToApiSports } from '../mappers/fixture.mapper';
import { buildFixtureLeagueContext } from '../services/fixture-league-context';
import { asStr } from '@/lib/api/serializers';
import { notFound } from '@/lib/api/errors';

function parseFixtureBody(body: unknown) {
  const parsed = soccerFixtureCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid fixture body.');
  }
  return parsed.data;
}

async function mapFixtureResponse(leagueId: string, matchId: string) {
  const doc = await getMatchById('soccer', matchId);
  if (!doc || asStr(doc.data.league_id) !== leagueId) throw notFound('Fixture not found.');

  const [teamMap, externalIds, league] = await Promise.all([
    buildTeamMapForLeague(leagueId, 'soccer'),
    buildTeamExternalIdMap(leagueId, 'soccer'),
    getLeague(leagueId),
  ]);
  if (!league || league.sportSlug !== 'soccer') throw notFound('Fixture not found.');

  const countryMap = await buildCountryMap();
  const country = league.dto.country
    ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
    : null;
  const leagueContext = buildFixtureLeagueContext(league.dto, country);

  return mapRawSoccerMatchToApiSports(
    doc,
    teamMap,
    {
      home: externalIds.get(asStr(doc.data.home_team_id) ?? '') ?? null,
      away: externalIds.get(asStr(doc.data.away_team_id) ?? '') ?? null,
    },
    leagueContext,
  );
}

export async function createSoccerFixture(body: unknown) {
  const item = parseFixtureBody(body);
  const league = await getLeague(item.league.id);
  if (!league || league.sportSlug !== 'soccer') throw notFound('League not found.');

  const seasonYear =
    typeof item.league.season === 'number'
      ? item.league.season
      : Number(item.league.season ?? NaN);
  if (Number.isNaN(seasonYear)) throw notFound('Season not found.');

  const season = await findSeasonByYear(league.id, seasonYear);
  if (!season?.id) throw notFound('Season not found.');

  const matchInput = matchCreateSchema.parse({
    date: item.fixture.date,
    status: item.fixture.status?.short ?? item.fixture.status?.long ?? 'NS',
    round: item.league.round ?? null,
    venue: item.fixture.venue?.name ?? null,
    home: {
      teamId: item.teams.home.id,
      name: item.teams.home.name ?? null,
      logo: item.teams.home.logo ?? null,
      score: item.goals?.home ?? null,
    },
    away: {
      teamId: item.teams.away.id,
      name: item.teams.away.name ?? null,
      logo: item.teams.away.logo ?? null,
      score: item.goals?.away ?? null,
    },
  });

  const created = await createMatch(league.id, 'soccer', season.id, matchInput);
  return mapFixtureResponse(league.id, created.id);
}

export async function updateSoccerFixture(fixtureId: string, body: unknown) {
  const item = parseFixtureBody(body);
  const league = await getLeague(item.league.id);
  if (!league || league.sportSlug !== 'soccer') throw notFound('League not found.');

  const patch = matchUpdateSchema.parse({
    date: item.fixture.date,
    status: item.fixture.status?.short ?? item.fixture.status?.long ?? undefined,
    round: item.league.round ?? undefined,
    venue: item.fixture.venue?.name ?? undefined,
    home: {
      teamId: item.teams.home.id,
      score: item.goals?.home ?? undefined,
    },
    away: {
      teamId: item.teams.away.id,
      score: item.goals?.away ?? undefined,
    },
  });

  await updateMatch(league.id, 'soccer', fixtureId, patch);
  return mapFixtureResponse(league.id, fixtureId);
}

export async function deleteSoccerFixture(fixtureId: string, leagueId: string) {
  await deleteMatch(leagueId, 'soccer', fixtureId);
}

export async function getSoccerFixtureById(fixtureId: string) {
  const doc = await getMatchById('soccer', fixtureId);
  if (!doc) throw notFound('Fixture not found.');
  const leagueId = asStr(doc.data.league_id);
  if (!leagueId) throw notFound('Fixture not found.');
  return mapFixtureResponse(leagueId, fixtureId);
}
