import { ZodError } from 'zod';
import { ApiError, invalidRequestBody, notFound } from '@/lib/api/errors';
import {
  americanFootballGameCreateSchema,
  type AmericanFootballGameCreate,
  type AmericanFootballGameItem,
} from '../schemas/game.schema';
import { createDoc, deleteDoc, resolveDoc, updateDocFields } from '@/lib/firebase/repositories/helpers';
import { getSportConfig } from '@/lib/firebase/sport-registry';
import { requireAmericanFootballTeamInLeague } from '@/lib/firebase/repositories/american-football-teams.repository';
import { getLeague } from '@/lib/firebase/repositories/leagues.repository';
import { findSeasonByYear } from '@/lib/firebase/repositories/seasons.repository';
import { mapRawAmericanFootballGameToApiSports } from '../mappers/game.mapper';
import { buildAmericanFootballLeagueContext } from '../services/leagues.service';

function parseGameBody(body: unknown): AmericanFootballGameCreate {
  const parsed = americanFootballGameCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid game body.');
  }
  return parsed.data;
}

/** Strip server-assigned ids before validating a PATCH/PUT body. */
function parseGameMutationBody(body: unknown): AmericanFootballGameCreate {
  if (body && typeof body === 'object' && 'game' in body) {
    const raw = body as { game?: Record<string, unknown> };
    if (raw.game && typeof raw.game === 'object') {
      const { id: _ignored, ...gameWithoutId } = raw.game;
      return parseGameBody({ ...body, game: gameWithoutId });
    }
  }
  return parseGameBody(body);
}

function gameDateIso(item: AmericanFootballGameCreate): string {
  const date = item.game.date?.date ?? '1970-01-01';
  const time = item.game.date?.time ?? '00:00';
  return `${date}T${time}:00.000Z`;
}

function gameToFirestore(
  docId: string,
  leagueId: string,
  seasonId: string,
  homeTeamId: string,
  awayTeamId: string,
  item: AmericanFootballGameCreate,
): Record<string, unknown> {
  const now = new Date().toISOString();
  const isoDate = gameDateIso(item);
  return {
    league_id: leagueId,
    season_id: seasonId,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    game_date: isoDate,
    date: isoDate,
    status: item.game.status?.short ?? item.game.status?.long ?? 'NS',
    stage: item.game.stage ?? null,
    week: item.game.week ?? null,
    round: item.game.week ?? null,
    venue: item.game.venue ?? null,
    home_score: item.scores?.home?.total ?? null,
    away_score: item.scores?.away?.total ?? null,
    teams: item.teams,
    created_at: now,
    updated_at: now,
  };
}

async function resolveLeagueAndSeason(item: AmericanFootballGameCreate) {
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

  return { league, season };
}

export async function createAmericanFootballGame(body: unknown): Promise<AmericanFootballGameItem> {
  const item = parseGameBody(body);
  const { league, season } = await resolveLeagueAndSeason(item);

  const [homeTeam, awayTeam] = await Promise.all([
    requireAmericanFootballTeamInLeague(league.id, String(item.teams.home.id)),
    requireAmericanFootballTeamInLeague(league.id, String(item.teams.away.id)),
  ]);

  const config = getSportConfig('american-football');
  if (!config) throw new ApiError('DATA_SOURCE_NOT_CONFIGURED', 'NFL is not configured.');

  const docId = crypto.randomUUID();
  const document = gameToFirestore(
    docId,
    league.id,
    season.id,
    homeTeam.id,
    awayTeam.id,
    item,
  );
  await createDoc(config.collections.matches, docId, document);

  const leagueContext = await buildAmericanFootballLeagueContext(league.id, season.year);
  return mapRawAmericanFootballGameToApiSports({ id: docId, data: document }, undefined, undefined, leagueContext);
}

export async function updateAmericanFootballGame(
  gameId: string,
  body: unknown,
): Promise<AmericanFootballGameItem> {
  const item = parseGameMutationBody(body);
  const config = getSportConfig('american-football');
  if (!config) throw new ApiError('DATA_SOURCE_NOT_CONFIGURED', 'NFL is not configured.');

  const existing = await resolveDoc(config.collections.matches, gameId);
  if (!existing) throw notFound('Game not found.');

  const leagueId = typeof existing.data.league_id === 'string' ? existing.data.league_id : null;
  if (!leagueId) throw notFound('Game not found.');

  const [homeTeam, awayTeam] = await Promise.all([
    requireAmericanFootballTeamInLeague(leagueId, String(item.teams.home.id)),
    requireAmericanFootballTeamInLeague(leagueId, String(item.teams.away.id)),
  ]);

  const seasonId =
    typeof existing.data.season_id === 'string'
      ? existing.data.season_id
      : (await resolveLeagueAndSeason(item)).season.id;
  if (!seasonId) throw notFound('Season not found.');

  const document = gameToFirestore(
    existing.id,
    leagueId,
    seasonId,
    homeTeam.id,
    awayTeam.id,
    item,
  );
  document.updated_at = new Date().toISOString();
  delete document.created_at;

  await updateDocFields(config.collections.matches, existing.id, document);
  const updated = await resolveDoc(config.collections.matches, existing.id);
  if (!updated) throw notFound('Game not found.');

  const seasonYear =
    typeof item.league.season === 'number'
      ? item.league.season
      : Number(item.league.season ?? NaN);
  const leagueContext = await buildAmericanFootballLeagueContext(leagueId, seasonYear);
  return mapRawAmericanFootballGameToApiSports(updated, undefined, undefined, leagueContext);
}

export async function patchAmericanFootballGame(
  gameId: string,
  body: unknown,
): Promise<AmericanFootballGameItem> {
  const config = getSportConfig('american-football');
  if (!config) throw new ApiError('DATA_SOURCE_NOT_CONFIGURED', 'NFL is not configured.');

  const existing = await resolveDoc(config.collections.matches, gameId);
  if (!existing) throw notFound('Game not found.');

  const current = mapRawAmericanFootballGameToApiSports(existing);
  const merged = { ...current, ...(body as Record<string, unknown>) };
  return updateAmericanFootballGame(gameId, merged);
}

export async function deleteAmericanFootballGame(gameId: string): Promise<void> {
  const config = getSportConfig('american-football');
  if (!config) throw new ApiError('DATA_SOURCE_NOT_CONFIGURED', 'NFL is not configured.');

  const existing = await resolveDoc(config.collections.matches, gameId);
  if (!existing) throw notFound('Game not found.');
  await deleteDoc(config.collections.matches, existing.id);
}

export function parseGameBodySafe(body: unknown): AmericanFootballGameCreate {
  try {
    return parseGameBody(body);
  } catch (err) {
    if (err instanceof ZodError) {
      throw invalidRequestBody(err.issues[0]?.message ?? 'Invalid game body.');
    }
    throw err;
  }
}
