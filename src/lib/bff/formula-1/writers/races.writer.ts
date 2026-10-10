import { FieldValue } from 'firebase-admin/firestore';
import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { F1_COLLECTIONS } from '@/lib/firebase/sport-registry';
import { updateDocFields } from '@/lib/firebase/repositories/helpers';
import {
  buildCircuitMap,
  buildCompetitionMap,
  createF1Doc,
  deleteF1Doc,
  getF1CircuitById,
  getF1CompetitionById,
  listF1Circuits,
  listF1Competitions,
  resolveF1Race,
  updateF1Doc,
} from '@/lib/firebase/repositories/formula-1.repository';
import { mapF1Race } from '../mappers/race.mapper';
import {
  formula1RaceCreateSchema,
  formula1RaceUpdateSchema,
  type Formula1RaceCreate,
  type Formula1RaceItem,
  type Formula1RaceUpdate,
} from '../schemas/race.schema';

async function linkRaceToCompetition(competitionId: string, raceId: string): Promise<void> {
  await updateDocFields(F1_COLLECTIONS.competitions, competitionId, {
    races: FieldValue.arrayUnion(raceId),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function unlinkRaceFromCompetition(competitionId: string, raceId: string): Promise<void> {
  await updateDocFields(F1_COLLECTIONS.competitions, competitionId, {
    races: FieldValue.arrayRemove(raceId),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

function parseCreate(body: unknown): Formula1RaceCreate {
  const parsed = formula1RaceCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid race body.');
  }
  return parsed.data;
}

function parseUpdate(body: unknown): Formula1RaceUpdate {
  const parsed = formula1RaceUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? 'Invalid race body.');
  }
  return parsed.data;
}

async function assertRefs(competitionId?: string, circuitId?: string): Promise<void> {
  if (competitionId) {
    const competition = await getF1CompetitionById(competitionId);
    if (!competition) throw invalidRequestBody('competitionId must reference an existing competition.');
  }
  if (circuitId) {
    const circuit = await getF1CircuitById(circuitId);
    if (!circuit) throw invalidRequestBody('circuitId must reference an existing circuit.');
  }
}

async function toRaceItem(doc: { id: string; data: Record<string, unknown> }): Promise<Formula1RaceItem> {
  const [competitions, circuits] = await Promise.all([listF1Competitions(), listF1Circuits()]);
  return mapF1Race(doc, buildCompetitionMap(competitions), buildCircuitMap(circuits));
}

export async function createFormula1Race(body: unknown): Promise<Formula1RaceItem> {
  const input = parseCreate(body);
  await assertRefs(input.competitionId, input.circuitId);
  const doc = await createF1Doc(F1_COLLECTIONS.races, {
    competition_id: input.competitionId,
    circuit_id: input.circuitId,
    season: input.season,
    type: input.type,
    race_date: input.date,
    status: input.status,
    timezone: input.timezone ?? 'utc',
    distance: input.distance ?? null,
    laps_current: input.laps?.current ?? null,
    laps_total: input.laps?.total ?? null,
  });
  await linkRaceToCompetition(input.competitionId, doc.id);
  return toRaceItem(doc);
}

export async function updateFormula1Race(id: string, body: unknown): Promise<Formula1RaceItem> {
  const existing = await resolveF1Race(id);
  if (!existing) throw notFound('Race not found.');
  const patch = parseUpdate(body);
  await assertRefs(patch.competitionId, patch.circuitId);

  const previousCompetitionId =
    typeof existing.data.competition_id === 'string' ? existing.data.competition_id : null;
  const nextCompetitionId = patch.competitionId ?? previousCompetitionId;

  const doc = await updateF1Doc(F1_COLLECTIONS.races, existing.id, {
    ...(patch.competitionId != null ? { competition_id: patch.competitionId } : {}),
    ...(patch.circuitId != null ? { circuit_id: patch.circuitId } : {}),
    ...(patch.season != null ? { season: patch.season } : {}),
    ...(patch.type != null ? { type: patch.type } : {}),
    ...(patch.date != null ? { race_date: patch.date } : {}),
    ...(patch.status != null ? { status: patch.status } : {}),
    ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
    ...(patch.distance !== undefined ? { distance: patch.distance } : {}),
    ...(patch.laps?.current !== undefined ? { laps_current: patch.laps.current } : {}),
    ...(patch.laps?.total !== undefined ? { laps_total: patch.laps.total } : {}),
  });

  if (
    previousCompetitionId &&
    nextCompetitionId &&
    previousCompetitionId !== nextCompetitionId
  ) {
    await unlinkRaceFromCompetition(previousCompetitionId, existing.id);
    await linkRaceToCompetition(nextCompetitionId, existing.id);
  }

  return toRaceItem(doc);
}

export async function deleteFormula1Race(id: string): Promise<void> {
  const existing = await resolveF1Race(id);
  if (!existing) throw notFound('Race not found.');
  const competitionId =
    typeof existing.data.competition_id === 'string' ? existing.data.competition_id : null;
  await deleteF1Doc(F1_COLLECTIONS.races, existing.id);
  if (competitionId) {
    await unlinkRaceFromCompetition(competitionId, existing.id);
  }
}
