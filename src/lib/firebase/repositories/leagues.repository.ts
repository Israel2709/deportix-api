import { serializeLeague } from '@/lib/api/serializers';
import type { LeagueDTO } from '@/lib/contracts/dto';
import { isSportSlug, type SportSlug } from '../sport-registry';
import { loadCatalogContext, type CatalogContext } from './catalog.repository';
import { notFound } from '@/lib/api/errors';
import {
  createDoc,
  deleteDoc,
  fetchAll,
  fetchWhereEq,
  resolveDoc,
  updateDocFields,
  type RawDoc,
} from './helpers';

const COLLECTION = 'leagues';

function toDTO(doc: RawDoc, ctx: CatalogContext): LeagueDTO {
  const sportId = typeof doc.data.sport_id === 'string' ? doc.data.sport_id : null;
  const countryId = typeof doc.data.country_id === 'string' ? doc.data.country_id : null;
  const sport = sportId ? (ctx.sportSlugById.get(sportId) ?? null) : null;
  const country = countryId ? (ctx.countryNameByKey.get(countryId) ?? null) : null;
  return serializeLeague(doc.id, doc.data, { sport, country });
}

export interface LeagueRecord {
  id: string;
  dto: LeagueDTO;
  sportSlug: SportSlug | null;
}

export async function listLeagues(opts: { sportSlug?: string }): Promise<LeagueDTO[]> {
  const ctx = await loadCatalogContext();

  let docs: RawDoc[];
  if (opts.sportSlug) {
    const sportId = ctx.sportIdBySlug.get(opts.sportSlug);
    if (!sportId) return []; // unknown sport -> empty page, not an error
    docs = await fetchWhereEq(COLLECTION, 'sport_id', sportId);
  } else {
    docs = await fetchAll(COLLECTION);
  }

  return docs.map((doc) => toDTO(doc, ctx));
}

export async function getLeague(idOrExternalId: string): Promise<LeagueRecord | null> {
  const doc = await resolveDoc(COLLECTION, idOrExternalId);
  if (!doc) return null;
  const ctx = await loadCatalogContext();
  const dto = toDTO(doc, ctx);
  return { id: doc.id, dto, sportSlug: isSportSlug(dto.sport) ? dto.sport : null };
}

export async function createLeague(input: {
  name: string;
  sportSlug: SportSlug;
  externalId?: string | null;
  type?: string | null;
  logo?: string | null;
  altLogo?: string | null;
  countryId?: string | null;
  apiSportsPayload?: unknown;
}): Promise<LeagueRecord> {
  const ctx = await loadCatalogContext();
  const sportId = ctx.sportIdBySlug.get(input.sportSlug);
  if (!sportId) throw notFound('Sport not found.');

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const data: Record<string, unknown> = {
    name: input.name,
    sport_id: sportId,
    external_id: input.externalId ?? null,
    type: input.type ?? 'league',
    logo: input.logo ?? null,
    alt_logo: input.altLogo ?? null,
    country_id: input.countryId ?? null,
    created_at: now,
    updated_at: now,
  };
  if (input.apiSportsPayload !== undefined) data.api_sports_payload = input.apiSportsPayload;

  await createDoc(COLLECTION, id, data);
  const created = await getLeague(id);
  if (!created) throw notFound('League not found.');
  return created;
}

export async function updateLeague(
  idOrExternalId: string,
  patch: Record<string, unknown>,
): Promise<LeagueRecord> {
  const existing = await resolveDoc(COLLECTION, idOrExternalId);
  if (!existing) throw notFound('League not found.');

  const fields = { ...patch, updated_at: new Date().toISOString() };
  await updateDocFields(COLLECTION, existing.id, fields);

  const updated = await getLeague(existing.id);
  if (!updated) throw notFound('League not found.');
  return updated;
}

export async function deleteLeague(idOrExternalId: string): Promise<void> {
  const existing = await resolveDoc(COLLECTION, idOrExternalId);
  if (!existing) throw notFound('League not found.');
  await deleteDoc(COLLECTION, existing.id);
}
