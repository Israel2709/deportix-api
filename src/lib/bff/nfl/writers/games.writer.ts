import { ZodError } from 'zod';
import { ApiError, invalidRequestBody, notFound } from '@/lib/api/errors';
import { nflGameItemSchema, type NflGameItem } from '../schemas/game.schema';
import { createDoc, deleteDoc, resolveDoc, updateDocFields } from '@/lib/firebase/repositories/helpers';
import { getSportConfig } from '@/lib/firebase/sport-registry';
import {
  createNflTeam,
  resolveNflTeamByExternalId,
} from '@/lib/firebase/repositories/nfl-teams.repository';
import { resolveNflLeague, resolveNflSeason } from '../services/leagues.service';
import { mapRawNflGameToApiSports } from '../mappers/game.mapper';

function parseGameBody(body: unknown): NflGameItem {
  const parsed = nflGameItemSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid game body.');
  }
  return parsed.data;
}

function gameDateIso(item: NflGameItem): string {
  const date = item.game.date?.date ?? '1970-01-01';
  const time = item.game.date?.time ?? '00:00';
  return `${date}T${time}:00.000Z`;
}

async function resolveTeamId(leagueId: string, externalId: number | string): Promise<string> {
  let team = await resolveNflTeamByExternalId(leagueId, externalId);
  if (!team) {
    team = await createNflTeam(leagueId, {
      id: externalId,
      name: String(externalId),
      logo: null,
    });
  }
  return team.id;
}

function gameToFirestore(
  leagueId: string,
  seasonId: string,
  homeTeamId: string,
  awayTeamId: string,
  item: NflGameItem,
): Record<string, unknown> {
  const now = new Date().toISOString();
  const isoDate = gameDateIso(item);
  return {
    league_id: leagueId,
    season_id: seasonId,
    external_id: String(item.game.id),
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
    api_sports_payload: item,
    created_at: now,
    updated_at: now,
  };
}

export async function createNflGame(body: unknown): Promise<NflGameItem> {
  const item = parseGameBody(body);
  const leagueExternalId = String(item.league.id ?? '');
  const league = await resolveNflLeague(leagueExternalId);
  if (!league) throw notFound('League not found.');

  const seasonYear =
    typeof item.league.season === 'number'
      ? item.league.season
      : Number(item.league.season ?? NaN);
  const season = await resolveNflSeason(league.id, seasonYear);
  if (!season) throw notFound('Season not found.');

  const [homeTeamId, awayTeamId] = await Promise.all([
    resolveTeamId(league.id, item.teams.home.id),
    resolveTeamId(league.id, item.teams.away.id),
  ]);

  const config = getSportConfig('nfl');
  if (!config) throw new ApiError('DATA_SOURCE_NOT_CONFIGURED', 'NFL is not configured.');

  const docId = crypto.randomUUID();
  const document = gameToFirestore(league.id, season.id, homeTeamId, awayTeamId, item);
  document.id = docId;
  await createDoc(config.collections.matches, docId, document);

  return mapRawNflGameToApiSports({ id: docId, data: document });
}

export async function updateNflGame(gameId: string, body: unknown): Promise<NflGameItem> {
  const item = parseGameBody(body);
  const config = getSportConfig('nfl');
  if (!config) throw new ApiError('DATA_SOURCE_NOT_CONFIGURED', 'NFL is not configured.');

  const existing = await resolveDoc(config.collections.matches, gameId);
  if (!existing) throw notFound('Game not found.');

  const leagueId = typeof existing.data.league_id === 'string' ? existing.data.league_id : null;
  if (!leagueId) throw notFound('Game not found.');

  const [homeTeamId, awayTeamId] = await Promise.all([
    resolveTeamId(leagueId, item.teams.home.id),
    resolveTeamId(leagueId, item.teams.away.id),
  ]);

  const seasonId =
    typeof existing.data.season_id === 'string'
      ? existing.data.season_id
      : (await resolveNflSeason(leagueId, Number(item.league.season)))?.id;
  if (!seasonId) throw notFound('Season not found.');

  const document = gameToFirestore(leagueId, seasonId, homeTeamId, awayTeamId, item);
  document.updated_at = new Date().toISOString();
  delete document.created_at;

  await updateDocFields(config.collections.matches, existing.id, document);
  const updated = await resolveDoc(config.collections.matches, existing.id);
  if (!updated) throw notFound('Game not found.');
  return mapRawNflGameToApiSports(updated);
}

export async function patchNflGame(gameId: string, body: unknown): Promise<NflGameItem> {
  const config = getSportConfig('nfl');
  if (!config) throw new ApiError('DATA_SOURCE_NOT_CONFIGURED', 'NFL is not configured.');

  const existing = await resolveDoc(config.collections.matches, gameId);
  if (!existing) throw notFound('Game not found.');

  const current = existing.data.api_sports_payload ?? mapRawNflGameToApiSports(existing);
  const merged = { ...current, ...(body as Record<string, unknown>) };
  return updateNflGame(gameId, merged);
}

export async function deleteNflGame(gameId: string): Promise<void> {
  const config = getSportConfig('nfl');
  if (!config) throw new ApiError('DATA_SOURCE_NOT_CONFIGURED', 'NFL is not configured.');

  const existing = await resolveDoc(config.collections.matches, gameId);
  if (!existing) throw notFound('Game not found.');
  await deleteDoc(config.collections.matches, existing.id);
}

export function parseGameBodySafe(body: unknown): NflGameItem {
  try {
    return parseGameBody(body);
  } catch (err) {
    if (err instanceof ZodError) {
      throw invalidRequestBody(err.issues[0]?.message ?? 'Invalid game body.');
    }
    throw err;
  }
}
