import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { F1_COLLECTIONS } from '@/lib/firebase/sport-registry';
import { createDoc, updateDocFields } from '@/lib/firebase/repositories/helpers';
import {
  createF1Doc,
  deleteF1Doc,
  getF1DriverById,
  getF1TeamById,
  listF1Teams,
  buildTeamMap,
  getF1CompetitionById,
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

function calendarTimestamp(value: string | null | undefined): Timestamp | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value.trim() === '') return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : Timestamp.fromDate(date);
}

function assignDefined(target: Record<string, unknown>, key: string, value: unknown) {
  if (value !== undefined) target[key] = value;
}

const DEFAULT_CLASSIFICATIONS = { drivers: true, constructors: true } as const;
const DEFAULT_SPRINT = { enabled: true } as const;

function slugifyCompetitionName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Name-based slug with a short id suffix so duplicate names never collide. */
function uniqueCompetitionSlug(name: string, id: string): string {
  const base = slugifyCompetitionName(name) || 'competition';
  const suffix = id.replace(/-/g, '').slice(0, 8);
  return `${base}-${suffix}`;
}

/**
 * Writable competition fields. `createdAt` is never included: create sets it
 * with serverTimestamp(), and updates leave the original value in place.
 * Classifications and sprint are always forced to their defaults.
 * Slug is owned by the server (name + stable id suffix) — never taken from the client.
 */
function competitionWriteFields(
  input: Formula1CompetitionCreate | Formula1CompetitionUpdate,
  options: { forceDefaults: boolean },
): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  assignDefined(fields, 'name', input.name);
  assignDefined(fields, 'shortName', input.shortName);
  assignDefined(fields, 'officialName', input.officialName);
  assignDefined(fields, 'championshipType', input.championshipType);
  assignDefined(fields, 'status', input.status);
  assignDefined(fields, 'startDate', calendarTimestamp(input.startDate));
  assignDefined(fields, 'endDate', calendarTimestamp(input.endDate));
  assignDefined(fields, 'pointsSystemId', input.pointsSystemId);
  assignDefined(fields, 'branding', input.branding);
  assignDefined(fields, 'website', input.website);
  assignDefined(fields, 'active', input.active);
  assignDefined(fields, 'location', input.location);
  if ('seasonId' in input) assignDefined(fields, 'seasonId', input.seasonId);
  if (options.forceDefaults) {
    fields.classifications = { ...DEFAULT_CLASSIFICATIONS };
    fields.sprint = { ...DEFAULT_SPRINT };
  }
  return fields;
}

export async function createFormula1Competition(body: unknown): Promise<Formula1CompetitionItem> {
  const input = parse<Formula1CompetitionCreate>(formula1CompetitionCreateSchema, body, 'competition');
  const id = crypto.randomUUID();
  await createDoc(F1_COLLECTIONS.competitions, id, {
    ...competitionWriteFields(input, { forceDefaults: true }),
    id,
    name: input.name,
    slug: uniqueCompetitionSlug(input.name, id),
    location: input.location ?? null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  const doc = await getF1CompetitionById(id);
  if (!doc) throw notFound('Competition not found.');
  return mapF1Competition(doc);
}

export async function updateFormula1Competition(
  id: string,
  body: unknown,
): Promise<Formula1CompetitionItem> {
  const existing = await resolveF1Competition(id);
  if (!existing) throw notFound('Competition not found.');
  const patch = parse<Formula1CompetitionUpdate>(formula1CompetitionUpdateSchema, body, 'competition');
  const fields = competitionWriteFields(patch, { forceDefaults: true });
  delete fields.createdAt;
  delete fields.seasonId;
  // Keep the same id suffix; refresh the name portion when the name changes.
  if (typeof patch.name === 'string' && patch.name.trim()) {
    fields.slug = uniqueCompetitionSlug(patch.name, existing.id);
  }
  await updateDocFields(F1_COLLECTIONS.competitions, existing.id, {
    ...fields,
    updatedAt: FieldValue.serverTimestamp(),
  });
  const doc = await getF1CompetitionById(existing.id);
  if (!doc) throw notFound('Competition not found.');
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
    abbr: input.abbr ?? null,
    number: input.number ?? null,
    image: input.image ?? null,
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
    ...(patch.abbr !== undefined ? { abbr: patch.abbr } : {}),
    ...(patch.number !== undefined ? { number: patch.number } : {}),
    ...(patch.image !== undefined ? { image: patch.image } : {}),
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
