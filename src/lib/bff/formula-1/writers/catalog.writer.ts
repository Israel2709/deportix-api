import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { F1_COLLECTIONS } from '@/lib/firebase/sport-registry';
import {
  createF1Doc,
  deleteF1Doc,
  getF1DriverById,
  getF1TeamById,
  listF1Teams,
  buildTeamMap,
  resolveF1Circuit,
  resolveF1Competition,
  resolveF1Driver,
  resolveF1Team,
  updateF1Doc,
} from '@/lib/firebase/repositories/formula-1.repository';
import {
  mapF1Circuit,
  mapF1Competition,
  mapF1Driver,
  mapF1Team,
} from '../mappers/catalog.mapper';
import {
  formula1CircuitCreateSchema,
  formula1CircuitUpdateSchema,
  type Formula1CircuitCreate,
  type Formula1CircuitItem,
  type Formula1CircuitUpdate,
} from '../schemas/circuit.schema';
import {
  formula1CompetitionCreateSchema,
  formula1CompetitionUpdateSchema,
  type Formula1CompetitionCreate,
  type Formula1CompetitionItem,
  type Formula1CompetitionUpdate,
} from '../schemas/competition.schema';
import {
  formula1DriverCreateSchema,
  formula1DriverUpdateSchema,
  type Formula1DriverCreate,
  type Formula1DriverItem,
  type Formula1DriverUpdate,
} from '../schemas/driver.schema';
import {
  formula1TeamCreateSchema,
  formula1TeamUpdateSchema,
  type Formula1TeamCreate,
  type Formula1TeamItem,
  type Formula1TeamUpdate,
} from '../schemas/team.schema';

function parse<T>(schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false; error: { issues: { message?: string }[] } } }, body: unknown, label: string): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? `Invalid ${label} body.`);
  }
  return parsed.data;
}

export async function createFormula1Competition(body: unknown): Promise<Formula1CompetitionItem> {
  const input = parse<Formula1CompetitionCreate>(formula1CompetitionCreateSchema, body, 'competition');
  const doc = await createF1Doc(F1_COLLECTIONS.competitions, { name: input.name });
  return mapF1Competition(doc);
}

export async function updateFormula1Competition(
  id: string,
  body: unknown,
): Promise<Formula1CompetitionItem> {
  const existing = await resolveF1Competition(id);
  if (!existing) throw notFound('Competition not found.');
  const patch = parse<Formula1CompetitionUpdate>(formula1CompetitionUpdateSchema, body, 'competition');
  const doc = await updateF1Doc(F1_COLLECTIONS.competitions, existing.id, {
    ...(patch.name != null ? { name: patch.name } : {}),
  });
  return mapF1Competition(doc);
}

export async function deleteFormula1Competition(id: string): Promise<void> {
  const existing = await resolveF1Competition(id);
  if (!existing) throw notFound('Competition not found.');
  await deleteF1Doc(F1_COLLECTIONS.competitions, existing.id);
}

export async function createFormula1Circuit(body: unknown): Promise<Formula1CircuitItem> {
  const input = parse<Formula1CircuitCreate>(formula1CircuitCreateSchema, body, 'circuit');
  const doc = await createF1Doc(F1_COLLECTIONS.circuits, {
    name: input.name,
    image: input.image ?? null,
    country: input.country ?? null,
  });
  return mapF1Circuit(doc);
}

export async function updateFormula1Circuit(id: string, body: unknown): Promise<Formula1CircuitItem> {
  const existing = await resolveF1Circuit(id);
  if (!existing) throw notFound('Circuit not found.');
  const patch = parse<Formula1CircuitUpdate>(formula1CircuitUpdateSchema, body, 'circuit');
  const doc = await updateF1Doc(F1_COLLECTIONS.circuits, existing.id, {
    ...(patch.name != null ? { name: patch.name } : {}),
    ...(patch.image !== undefined ? { image: patch.image } : {}),
    ...(patch.country !== undefined ? { country: patch.country } : {}),
  });
  return mapF1Circuit(doc);
}

export async function deleteFormula1Circuit(id: string): Promise<void> {
  const existing = await resolveF1Circuit(id);
  if (!existing) throw notFound('Circuit not found.');
  await deleteF1Doc(F1_COLLECTIONS.circuits, existing.id);
}

export async function createFormula1Team(body: unknown): Promise<Formula1TeamItem> {
  const input = parse<Formula1TeamCreate>(formula1TeamCreateSchema, body, 'team');
  const doc = await createF1Doc(F1_COLLECTIONS.teams, {
    name: input.name,
    logo: input.logo ?? null,
  });
  return mapF1Team(doc);
}

export async function updateFormula1Team(id: string, body: unknown): Promise<Formula1TeamItem> {
  const existing = await resolveF1Team(id);
  if (!existing) throw notFound('Team not found.');
  const patch = parse<Formula1TeamUpdate>(formula1TeamUpdateSchema, body, 'team');
  const doc = await updateF1Doc(F1_COLLECTIONS.teams, existing.id, {
    ...(patch.name != null ? { name: patch.name } : {}),
    ...(patch.logo !== undefined ? { logo: patch.logo } : {}),
  });
  return mapF1Team(doc);
}

export async function deleteFormula1Team(id: string): Promise<void> {
  const existing = await resolveF1Team(id);
  if (!existing) throw notFound('Team not found.');
  await deleteF1Doc(F1_COLLECTIONS.teams, existing.id);
}

async function assertTeamExists(teamId: string | null | undefined): Promise<void> {
  if (teamId == null) return;
  const team = await getF1TeamById(teamId);
  if (!team) throw invalidRequestBody('teamId must reference an existing F1 team.');
}

export async function createFormula1Driver(body: unknown): Promise<Formula1DriverItem> {
  const input = parse<Formula1DriverCreate>(formula1DriverCreateSchema, body, 'driver');
  await assertTeamExists(input.teamId);
  const doc = await createF1Doc(F1_COLLECTIONS.drivers, {
    name: input.name,
    number: input.number ?? null,
    team_id: input.teamId ?? null,
  });
  const teams = await listF1Teams();
  return mapF1Driver(doc, buildTeamMap(teams));
}

export async function updateFormula1Driver(id: string, body: unknown): Promise<Formula1DriverItem> {
  const existing = await resolveF1Driver(id);
  if (!existing) throw notFound('Driver not found.');
  const patch = parse<Formula1DriverUpdate>(formula1DriverUpdateSchema, body, 'driver');
  if (patch.teamId !== undefined) await assertTeamExists(patch.teamId);
  const doc = await updateF1Doc(F1_COLLECTIONS.drivers, existing.id, {
    ...(patch.name != null ? { name: patch.name } : {}),
    ...(patch.number !== undefined ? { number: patch.number } : {}),
    ...(patch.teamId !== undefined ? { team_id: patch.teamId } : {}),
  });
  const teams = await listF1Teams();
  return mapF1Driver(doc, buildTeamMap(teams));
}

export async function deleteFormula1Driver(id: string): Promise<void> {
  const existing = await resolveF1Driver(id);
  if (!existing) throw notFound('Driver not found.');
  await deleteF1Doc(F1_COLLECTIONS.drivers, existing.id);
}

export async function getFormula1DriverAfterWrite(id: string): Promise<Formula1DriverItem | null> {
  const [doc, teams] = await Promise.all([getF1DriverById(id), listF1Teams()]);
  if (!doc) return null;
  return mapF1Driver(doc, buildTeamMap(teams));
}
