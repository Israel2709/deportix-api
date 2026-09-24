import { asStr } from '@/lib/api/serializers';
import { notFound } from '@/lib/api/errors';
import { isSportSlug, type SportSlug } from '../sport-registry';
import { loadCatalogContext } from './catalog.repository';
import {
  countWhereEq,
  createDoc,
  deleteDoc,
  fetchAll,
  fetchWhereEq,
  getDocById,
  updateDocFields,
  type RawDoc,
} from './helpers';

const COLLECTION = 'sports_organizations';
const LEAGUES_COLLECTION = 'leagues';

export interface OrganizationRecord {
  id: string;
  name: string;
  logo: string | null;
  countryId: string | null;
  sportSlug: SportSlug | null;
}

function toRecord(doc: RawDoc, sportSlug: SportSlug | null): OrganizationRecord {
  return {
    id: doc.id,
    name: asStr(doc.data.name) ?? '',
    logo: asStr(doc.data.logo),
    countryId: asStr(doc.data.country_id),
    sportSlug,
  };
}

async function withSportSlug(docs: RawDoc[]): Promise<OrganizationRecord[]> {
  const ctx = await loadCatalogContext();
  return docs
    .map((doc) => {
      const sportId = asStr(doc.data.sport_id);
      const slug = sportId ? (ctx.sportSlugById.get(sportId) ?? null) : null;
      return toRecord(doc, isSportSlug(slug) ? slug : null);
    })
    .filter((org) => org.name.length > 0);
}

export async function listOrganizations(opts: {
  sportSlug?: SportSlug;
  countryId?: string;
} = {}): Promise<OrganizationRecord[]> {
  const ctx = await loadCatalogContext();
  let docs: RawDoc[];

  if (opts.countryId) {
    docs = await fetchWhereEq(COLLECTION, 'country_id', opts.countryId);
  } else if (opts.sportSlug) {
    const sportId = ctx.sportIdBySlug.get(opts.sportSlug);
    if (!sportId) return [];
    docs = await fetchWhereEq(COLLECTION, 'sport_id', sportId);
  } else {
    docs = await fetchAll(COLLECTION);
  }

  let orgs = await withSportSlug(docs);
  if (opts.sportSlug) {
    orgs = orgs.filter((org) => org.sportSlug === opts.sportSlug);
  }
  if (opts.countryId) {
    orgs = orgs.filter((org) => org.countryId === opts.countryId);
  }

  return orgs.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getOrganization(id: string): Promise<OrganizationRecord | null> {
  const doc = await getDocById(COLLECTION, id);
  if (!doc) return null;
  const [record] = await withSportSlug([doc]);
  return record ?? null;
}

export async function findOrganizationByName(
  countryId: string,
  name: string,
  sportSlug: SportSlug = 'soccer',
): Promise<OrganizationRecord | null> {
  const orgs = await listOrganizations({ countryId, sportSlug });
  const needle = name.trim().toLowerCase();
  return orgs.find((org) => org.name.toLowerCase() === needle) ?? null;
}

export async function createOrganization(input: {
  name: string;
  sportSlug: SportSlug;
  countryId: string;
  logo?: string | null;
}): Promise<OrganizationRecord> {
  const ctx = await loadCatalogContext();
  const sportId = ctx.sportIdBySlug.get(input.sportSlug);
  if (!sportId) throw notFound('Sport not found.');

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const data = {
    name: input.name,
    logo: input.logo ?? null,
    country_id: input.countryId,
    sport_id: sportId,
    created_at: now,
    updated_at: now,
  };
  await createDoc(COLLECTION, id, data);
  const created = await getOrganization(id);
  if (!created) throw notFound('Organization not found.');
  return created;
}

export async function updateOrganization(
  id: string,
  patch: { name?: string; logo?: string | null },
): Promise<OrganizationRecord> {
  const existing = await getDocById(COLLECTION, id);
  if (!existing) throw notFound('Organization not found.');

  const fields: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) fields.name = patch.name;
  if (patch.logo !== undefined) fields.logo = patch.logo;

  await updateDocFields(COLLECTION, existing.id, fields);
  const updated = await getOrganization(existing.id);
  if (!updated) throw notFound('Organization not found.');
  return updated;
}

export async function deleteOrganization(id: string): Promise<void> {
  const existing = await getDocById(COLLECTION, id);
  if (!existing) throw notFound('Organization not found.');
  await deleteDoc(COLLECTION, existing.id);
}

export async function countLeaguesByOrganization(organizationId: string): Promise<number> {
  return countWhereEq(LEAGUES_COLLECTION, 'organization_id', organizationId);
}
