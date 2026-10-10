import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { F1_COLLECTIONS } from '@/lib/firebase/sport-registry';
import {
  buildDriverMap,
  buildTeamMap,
  createF1Doc,
  deleteF1Doc,
  getF1CompetitionById,
  getF1DriverById,
  getF1TeamById,
  listF1Drivers,
  listF1EntriesByCompetition,
  listF1Teams,
  resolveF1Entry,
  updateF1Doc,
} from '@/lib/firebase/repositories/formula-1.repository';
import { mapF1Entry } from '../mappers/entry.mapper';
import {
  formula1EntryCreateSchema,
  formula1EntryUpdateSchema,
  type Formula1EntryCreate,
  type Formula1EntryItem,
  type Formula1EntryUpdate,
} from '../schemas/entry.schema';

function parse<T>(
  schema: {
    safeParse: (
      v: unknown,
    ) => { success: true; data: T } | { success: false; error: { issues: { message?: string }[] } };
  },
  body: unknown,
  label: string,
): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? `Invalid ${label} body.`);
  }
  return parsed.data;
}

async function toItem(doc: {
  id: string;
  data: Record<string, unknown>;
}): Promise<Formula1EntryItem> {
  const [drivers, teams] = await Promise.all([listF1Drivers(), listF1Teams()]);
  const driverMap = buildDriverMap(drivers);
  const teamMap = buildTeamMap(teams);
  return mapF1Entry(
    doc,
    driverMap.get(String(doc.data.driver_id ?? '')),
    teamMap.get(String(doc.data.team_id ?? '')),
  );
}

export async function createFormula1Entry(body: unknown): Promise<Formula1EntryItem> {
  const input = parse<Formula1EntryCreate>(formula1EntryCreateSchema, body, 'entry');

  const [competition, driver, team] = await Promise.all([
    getF1CompetitionById(input.competitionId),
    getF1DriverById(input.driverId),
    getF1TeamById(input.teamId),
  ]);
  if (!competition) {
    throw invalidRequestBody('competitionId must reference an existing competition.');
  }
  if (!driver) throw invalidRequestBody('driverId must reference an existing driver.');
  if (!team) throw invalidRequestBody('teamId must reference an existing constructor.');

  const existing = await listF1EntriesByCompetition(input.competitionId);
  const duplicate = existing.some(
    (doc) =>
      doc.data.driver_id === input.driverId &&
      Number(doc.data.season) === input.season &&
      doc.data.active !== false,
  );
  if (duplicate) {
    throw invalidRequestBody('That driver is already entered in this competition season.');
  }

  const doc = await createF1Doc(F1_COLLECTIONS.entries, {
    competition_id: input.competitionId,
    season: input.season,
    driver_id: input.driverId,
    team_id: input.teamId,
    number: input.number ?? null,
    role: input.role ?? 'race-driver',
    active: input.active ?? true,
  });
  return toItem(doc);
}

export async function updateFormula1Entry(
  id: string,
  body: unknown,
): Promise<Formula1EntryItem> {
  const existing = await resolveF1Entry(id);
  if (!existing) throw notFound('Entry not found.');
  const patch = parse<Formula1EntryUpdate>(formula1EntryUpdateSchema, body, 'entry');

  if (patch.driverId) {
    const driver = await getF1DriverById(patch.driverId);
    if (!driver) throw invalidRequestBody('driverId must reference an existing driver.');
    const siblings = await listF1EntriesByCompetition(String(existing.data.competition_id ?? ''));
    const season = Number(existing.data.season);
    const duplicate = siblings.some(
      (doc) =>
        doc.id !== existing.id &&
        doc.data.driver_id === patch.driverId &&
        Number(doc.data.season) === season &&
        doc.data.active !== false,
    );
    if (duplicate) {
      throw invalidRequestBody('That driver is already entered in this competition season.');
    }
  }

  if (patch.teamId) {
    const team = await getF1TeamById(patch.teamId);
    if (!team) throw invalidRequestBody('teamId must reference an existing constructor.');
  }

  const doc = await updateF1Doc(F1_COLLECTIONS.entries, existing.id, {
    ...(patch.driverId != null ? { driver_id: patch.driverId } : {}),
    ...(patch.teamId != null ? { team_id: patch.teamId } : {}),
    ...(patch.number !== undefined ? { number: patch.number } : {}),
    ...(patch.role !== undefined ? { role: patch.role } : {}),
    ...(patch.active !== undefined ? { active: patch.active } : {}),
  });
  return toItem(doc);
}

export async function deleteFormula1Entry(id: string): Promise<void> {
  const existing = await resolveF1Entry(id);
  if (!existing) throw notFound('Entry not found.');
  await deleteF1Doc(F1_COLLECTIONS.entries, existing.id);
}
