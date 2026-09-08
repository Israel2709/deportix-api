import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { F1_COLLECTIONS } from '@/lib/firebase/sport-registry';
import {
  buildDriverMap,
  buildTeamMap,
  createF1Doc,
  deleteF1Doc,
  getF1DriverById,
  getF1RaceById,
  listF1Drivers,
  listF1Teams,
  resolveF1FastestLap,
  resolveF1Pitstop,
  resolveF1StartingGrid,
  updateF1Doc,
} from '@/lib/firebase/repositories/formula-1.repository';
import {
  mapF1FastestLap,
  mapF1Pitstop,
  mapF1StartingGrid,
} from '../mappers/session-detail.mapper';
import {
  formula1FastestLapCreateSchema,
  formula1FastestLapUpdateSchema,
  formula1PitstopCreateSchema,
  formula1PitstopUpdateSchema,
  formula1StartingGridCreateSchema,
  formula1StartingGridUpdateSchema,
  type Formula1FastestLapCreate,
  type Formula1FastestLapItem,
  type Formula1FastestLapUpdate,
  type Formula1PitstopCreate,
  type Formula1PitstopItem,
  type Formula1PitstopUpdate,
  type Formula1StartingGridCreate,
  type Formula1StartingGridItem,
  type Formula1StartingGridUpdate,
} from '../schemas/session-detail.schema';

function parseCreateStartingGrid(body: unknown): Formula1StartingGridCreate {
  const parsed = formula1StartingGridCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid starting grid body.');
  }
  return parsed.data;
}

function parseUpdateStartingGrid(body: unknown): Formula1StartingGridUpdate {
  const parsed = formula1StartingGridUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid starting grid body.');
  }
  return parsed.data;
}

function parseCreateFastestLap(body: unknown): Formula1FastestLapCreate {
  const parsed = formula1FastestLapCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid fastest lap body.');
  }
  return parsed.data;
}

function parseUpdateFastestLap(body: unknown): Formula1FastestLapUpdate {
  const parsed = formula1FastestLapUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid fastest lap body.');
  }
  return parsed.data;
}

function parseCreatePitstop(body: unknown): Formula1PitstopCreate {
  const parsed = formula1PitstopCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid pit stop body.');
  }
  return parsed.data;
}

function parseUpdatePitstop(body: unknown): Formula1PitstopUpdate {
  const parsed = formula1PitstopUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid pit stop body.');
  }
  return parsed.data;
}

async function participantMaps() {
  const [drivers, teams] = await Promise.all([listF1Drivers(), listF1Teams()]);
  return { driverMap: buildDriverMap(drivers), teamMap: buildTeamMap(teams) };
}

async function assertRaceAndDriver(raceId: string, driverId: string) {
  if (!(await getF1RaceById(raceId))) {
    throw invalidRequestBody('raceId must reference an existing race.');
  }
  if (!(await getF1DriverById(driverId))) {
    throw invalidRequestBody('driverId must reference an existing driver.');
  }
}

export async function createFormula1StartingGrid(body: unknown): Promise<Formula1StartingGridItem> {
  const input = parseCreateStartingGrid(body);
  await assertRaceAndDriver(input.raceId, input.driverId);
  const doc = await createF1Doc(F1_COLLECTIONS.startingGrids, {
    race_id: input.raceId,
    driver_id: input.driverId,
    position: input.position,
    time: input.time ?? null,
  });
  const maps = await participantMaps();
  return mapF1StartingGrid(doc, maps.driverMap, maps.teamMap);
}

export async function updateFormula1StartingGrid(
  id: string,
  body: unknown,
): Promise<Formula1StartingGridItem> {
  const existing = await resolveF1StartingGrid(id);
  if (!existing) throw notFound('Starting grid entry not found.');
  const patch = parseUpdateStartingGrid(body);
  if (patch.raceId && !(await getF1RaceById(patch.raceId))) {
    throw invalidRequestBody('raceId must reference an existing race.');
  }
  if (patch.driverId && !(await getF1DriverById(patch.driverId))) {
    throw invalidRequestBody('driverId must reference an existing driver.');
  }
  const doc = await updateF1Doc(F1_COLLECTIONS.startingGrids, existing.id, {
    ...(patch.raceId != null ? { race_id: patch.raceId } : {}),
    ...(patch.driverId != null ? { driver_id: patch.driverId } : {}),
    ...(patch.position != null ? { position: patch.position } : {}),
    ...(patch.time !== undefined ? { time: patch.time } : {}),
  });
  const maps = await participantMaps();
  return mapF1StartingGrid(doc, maps.driverMap, maps.teamMap);
}

export async function deleteFormula1StartingGrid(id: string): Promise<void> {
  const existing = await resolveF1StartingGrid(id);
  if (!existing) throw notFound('Starting grid entry not found.');
  await deleteF1Doc(F1_COLLECTIONS.startingGrids, existing.id);
}

export async function createFormula1FastestLap(body: unknown): Promise<Formula1FastestLapItem> {
  const input = parseCreateFastestLap(body);
  await assertRaceAndDriver(input.raceId, input.driverId);
  const doc = await createF1Doc(F1_COLLECTIONS.fastestLaps, {
    race_id: input.raceId,
    driver_id: input.driverId,
    position: input.position,
    lap: input.lap,
    time: input.time ?? null,
    avg_speed: input.avg_speed ?? null,
  });
  const maps = await participantMaps();
  return mapF1FastestLap(doc, maps.driverMap, maps.teamMap);
}

export async function updateFormula1FastestLap(
  id: string,
  body: unknown,
): Promise<Formula1FastestLapItem> {
  const existing = await resolveF1FastestLap(id);
  if (!existing) throw notFound('Fastest lap entry not found.');
  const patch = parseUpdateFastestLap(body);
  if (patch.raceId && !(await getF1RaceById(patch.raceId))) {
    throw invalidRequestBody('raceId must reference an existing race.');
  }
  if (patch.driverId && !(await getF1DriverById(patch.driverId))) {
    throw invalidRequestBody('driverId must reference an existing driver.');
  }
  const doc = await updateF1Doc(F1_COLLECTIONS.fastestLaps, existing.id, {
    ...(patch.raceId != null ? { race_id: patch.raceId } : {}),
    ...(patch.driverId != null ? { driver_id: patch.driverId } : {}),
    ...(patch.position != null ? { position: patch.position } : {}),
    ...(patch.lap != null ? { lap: patch.lap } : {}),
    ...(patch.time !== undefined ? { time: patch.time } : {}),
    ...(patch.avg_speed !== undefined ? { avg_speed: patch.avg_speed } : {}),
  });
  const maps = await participantMaps();
  return mapF1FastestLap(doc, maps.driverMap, maps.teamMap);
}

export async function deleteFormula1FastestLap(id: string): Promise<void> {
  const existing = await resolveF1FastestLap(id);
  if (!existing) throw notFound('Fastest lap entry not found.');
  await deleteF1Doc(F1_COLLECTIONS.fastestLaps, existing.id);
}

export async function createFormula1Pitstop(body: unknown): Promise<Formula1PitstopItem> {
  const input = parseCreatePitstop(body);
  await assertRaceAndDriver(input.raceId, input.driverId);
  const doc = await createF1Doc(F1_COLLECTIONS.pitstops, {
    race_id: input.raceId,
    driver_id: input.driverId,
    stops: input.stops,
    lap: input.lap,
    time: input.time ?? null,
    total_time: input.total_time ?? null,
  });
  const maps = await participantMaps();
  return mapF1Pitstop(doc, maps.driverMap, maps.teamMap);
}

export async function updateFormula1Pitstop(
  id: string,
  body: unknown,
): Promise<Formula1PitstopItem> {
  const existing = await resolveF1Pitstop(id);
  if (!existing) throw notFound('Pit stop entry not found.');
  const patch = parseUpdatePitstop(body);
  if (patch.raceId && !(await getF1RaceById(patch.raceId))) {
    throw invalidRequestBody('raceId must reference an existing race.');
  }
  if (patch.driverId && !(await getF1DriverById(patch.driverId))) {
    throw invalidRequestBody('driverId must reference an existing driver.');
  }
  const doc = await updateF1Doc(F1_COLLECTIONS.pitstops, existing.id, {
    ...(patch.raceId != null ? { race_id: patch.raceId } : {}),
    ...(patch.driverId != null ? { driver_id: patch.driverId } : {}),
    ...(patch.stops != null ? { stops: patch.stops } : {}),
    ...(patch.lap != null ? { lap: patch.lap } : {}),
    ...(patch.time !== undefined ? { time: patch.time } : {}),
    ...(patch.total_time !== undefined ? { total_time: patch.total_time } : {}),
  });
  const maps = await participantMaps();
  return mapF1Pitstop(doc, maps.driverMap, maps.teamMap);
}

export async function deleteFormula1Pitstop(id: string): Promise<void> {
  const existing = await resolveF1Pitstop(id);
  if (!existing) throw notFound('Pit stop entry not found.');
  await deleteF1Doc(F1_COLLECTIONS.pitstops, existing.id);
}
