import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { F1_COLLECTIONS } from '@/lib/firebase/sport-registry';
import {
  buildDriverMap,
  buildTeamMap,
  createF1Doc,
  deleteF1Doc,
  getF1DriverById,
  getF1RaceById,
  getF1TeamById,
  listF1Drivers,
  listF1Teams,
  resolveF1DriverRanking,
  resolveF1RaceRanking,
  resolveF1TeamRanking,
  updateF1Doc,
} from '@/lib/firebase/repositories/formula-1.repository';
import {
  mapF1DriverRanking,
  mapF1RaceRanking,
  mapF1TeamRanking,
} from '../mappers/ranking.mapper';
import {
  formula1DriverRankingCreateSchema,
  formula1DriverRankingUpdateSchema,
  formula1RaceRankingCreateSchema,
  formula1RaceRankingUpdateSchema,
  formula1TeamRankingCreateSchema,
  formula1TeamRankingUpdateSchema,
  type Formula1DriverRankingCreate,
  type Formula1DriverRankingItem,
  type Formula1DriverRankingUpdate,
  type Formula1RaceRankingCreate,
  type Formula1RaceRankingItem,
  type Formula1RaceRankingUpdate,
  type Formula1TeamRankingCreate,
  type Formula1TeamRankingItem,
  type Formula1TeamRankingUpdate,
} from '../schemas/ranking.schema';

function parseCreateDriver(body: unknown): Formula1DriverRankingCreate {
  const parsed = formula1DriverRankingCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid driver ranking body.');
  }
  return parsed.data;
}

function parseUpdateDriver(body: unknown): Formula1DriverRankingUpdate {
  const parsed = formula1DriverRankingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid driver ranking body.');
  }
  return parsed.data;
}

function parseCreateTeam(body: unknown): Formula1TeamRankingCreate {
  const parsed = formula1TeamRankingCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid team ranking body.');
  }
  return parsed.data;
}

function parseUpdateTeam(body: unknown): Formula1TeamRankingUpdate {
  const parsed = formula1TeamRankingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid team ranking body.');
  }
  return parsed.data;
}

function parseCreateRace(body: unknown): Formula1RaceRankingCreate {
  const parsed = formula1RaceRankingCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid race ranking body.');
  }
  return parsed.data;
}

function parseUpdateRace(body: unknown): Formula1RaceRankingUpdate {
  const parsed = formula1RaceRankingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid race ranking body.');
  }
  return parsed.data;
}

async function participantMaps() {
  const [drivers, teams] = await Promise.all([listF1Drivers(), listF1Teams()]);
  return { driverMap: buildDriverMap(drivers), teamMap: buildTeamMap(teams) };
}

export async function createFormula1DriverRanking(body: unknown): Promise<Formula1DriverRankingItem> {
  const input = parseCreateDriver(body);
  if (!(await getF1DriverById(input.driverId))) {
    throw invalidRequestBody('driverId must reference an existing driver.');
  }
  const doc = await createF1Doc(F1_COLLECTIONS.driverRankings, {
    driver_id: input.driverId,
    season: input.season,
    position: input.position,
    points: input.points ?? null,
    wins: input.wins ?? null,
    behind: input.behind ?? null,
  });
  const maps = await participantMaps();
  return mapF1DriverRanking(doc, maps.driverMap, maps.teamMap);
}

export async function updateFormula1DriverRanking(
  id: string,
  body: unknown,
): Promise<Formula1DriverRankingItem> {
  const existing = await resolveF1DriverRanking(id);
  if (!existing) throw notFound('Driver ranking not found.');
  const patch = parseUpdateDriver(body);
  if (patch.driverId && !(await getF1DriverById(patch.driverId))) {
    throw invalidRequestBody('driverId must reference an existing driver.');
  }
  const doc = await updateF1Doc(F1_COLLECTIONS.driverRankings, existing.id, {
    ...(patch.driverId != null ? { driver_id: patch.driverId } : {}),
    ...(patch.season != null ? { season: patch.season } : {}),
    ...(patch.position != null ? { position: patch.position } : {}),
    ...(patch.points !== undefined ? { points: patch.points } : {}),
    ...(patch.wins !== undefined ? { wins: patch.wins } : {}),
    ...(patch.behind !== undefined ? { behind: patch.behind } : {}),
  });
  const maps = await participantMaps();
  return mapF1DriverRanking(doc, maps.driverMap, maps.teamMap);
}

export async function deleteFormula1DriverRanking(id: string): Promise<void> {
  const existing = await resolveF1DriverRanking(id);
  if (!existing) throw notFound('Driver ranking not found.');
  await deleteF1Doc(F1_COLLECTIONS.driverRankings, existing.id);
}

export async function createFormula1TeamRanking(body: unknown): Promise<Formula1TeamRankingItem> {
  const input = parseCreateTeam(body);
  if (!(await getF1TeamById(input.teamId))) {
    throw invalidRequestBody('teamId must reference an existing team.');
  }
  const doc = await createF1Doc(F1_COLLECTIONS.teamRankings, {
    team_id: input.teamId,
    season: input.season,
    position: input.position,
    points: input.points ?? null,
  });
  const teams = await listF1Teams();
  return mapF1TeamRanking(doc, buildTeamMap(teams));
}

export async function updateFormula1TeamRanking(
  id: string,
  body: unknown,
): Promise<Formula1TeamRankingItem> {
  const existing = await resolveF1TeamRanking(id);
  if (!existing) throw notFound('Team ranking not found.');
  const patch = parseUpdateTeam(body);
  if (patch.teamId && !(await getF1TeamById(patch.teamId))) {
    throw invalidRequestBody('teamId must reference an existing team.');
  }
  const doc = await updateF1Doc(F1_COLLECTIONS.teamRankings, existing.id, {
    ...(patch.teamId != null ? { team_id: patch.teamId } : {}),
    ...(patch.season != null ? { season: patch.season } : {}),
    ...(patch.position != null ? { position: patch.position } : {}),
    ...(patch.points !== undefined ? { points: patch.points } : {}),
  });
  const teams = await listF1Teams();
  return mapF1TeamRanking(doc, buildTeamMap(teams));
}

export async function deleteFormula1TeamRanking(id: string): Promise<void> {
  const existing = await resolveF1TeamRanking(id);
  if (!existing) throw notFound('Team ranking not found.');
  await deleteF1Doc(F1_COLLECTIONS.teamRankings, existing.id);
}

export async function createFormula1RaceRanking(body: unknown): Promise<Formula1RaceRankingItem> {
  const input = parseCreateRace(body);
  if (!(await getF1RaceById(input.raceId))) {
    throw invalidRequestBody('raceId must reference an existing race.');
  }
  if (!(await getF1DriverById(input.driverId))) {
    throw invalidRequestBody('driverId must reference an existing driver.');
  }
  const doc = await createF1Doc(F1_COLLECTIONS.raceRankings, {
    race_id: input.raceId,
    driver_id: input.driverId,
    position: input.position,
    time: input.time ?? null,
    laps: input.laps ?? null,
    grid: input.grid ?? null,
    pits: input.pits ?? null,
    gap: input.gap ?? null,
  });
  const maps = await participantMaps();
  return mapF1RaceRanking(doc, maps.driverMap, maps.teamMap);
}

export async function updateFormula1RaceRanking(
  id: string,
  body: unknown,
): Promise<Formula1RaceRankingItem> {
  const existing = await resolveF1RaceRanking(id);
  if (!existing) throw notFound('Race ranking not found.');
  const patch = parseUpdateRace(body);
  if (patch.raceId && !(await getF1RaceById(patch.raceId))) {
    throw invalidRequestBody('raceId must reference an existing race.');
  }
  if (patch.driverId && !(await getF1DriverById(patch.driverId))) {
    throw invalidRequestBody('driverId must reference an existing driver.');
  }
  const doc = await updateF1Doc(F1_COLLECTIONS.raceRankings, existing.id, {
    ...(patch.raceId != null ? { race_id: patch.raceId } : {}),
    ...(patch.driverId != null ? { driver_id: patch.driverId } : {}),
    ...(patch.position != null ? { position: patch.position } : {}),
    ...(patch.time !== undefined ? { time: patch.time } : {}),
    ...(patch.laps !== undefined ? { laps: patch.laps } : {}),
    ...(patch.grid !== undefined ? { grid: patch.grid } : {}),
    ...(patch.pits !== undefined ? { pits: patch.pits } : {}),
    ...(patch.gap !== undefined ? { gap: patch.gap } : {}),
  });
  const maps = await participantMaps();
  return mapF1RaceRanking(doc, maps.driverMap, maps.teamMap);
}

export async function deleteFormula1RaceRanking(id: string): Promise<void> {
  const existing = await resolveF1RaceRanking(id);
  if (!existing) throw notFound('Race ranking not found.');
  await deleteF1Doc(F1_COLLECTIONS.raceRankings, existing.id);
}
