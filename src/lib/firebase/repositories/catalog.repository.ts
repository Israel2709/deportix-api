import { serializeSport } from '@/lib/api/serializers';
import type { SportDTO } from '@/lib/contracts/dto';
import { fetchAll } from './helpers';

/**
 * Catalog repository: sports + countries reference data shared by all sports.
 * `countries` is the global country catalog (API-Sports Football v3 shape).
 */

const SPORTS_COLLECTION = 'sports';
const COUNTRIES_COLLECTION = 'countries';

export async function listSports(): Promise<SportDTO[]> {
  const docs = await fetchAll(SPORTS_COLLECTION);
  return docs
    .map((doc) => serializeSport(doc.id, doc.data))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}

export interface CatalogContext {
  /** sports doc id -> sport slug */
  sportSlugById: Map<string, string>;
  /** sports slug -> sports doc id */
  sportIdBySlug: Map<string, string>;
  /** any country key (doc id / id / external_id) -> country name */
  countryNameByKey: Map<string, string>;
}

export async function loadCatalogContext(): Promise<CatalogContext> {
  const [sportDocs, countryDocs] = await Promise.all([
    fetchAll(SPORTS_COLLECTION),
    fetchAll(COUNTRIES_COLLECTION),
  ]);

  const sportSlugById = new Map<string, string>();
  const sportIdBySlug = new Map<string, string>();
  for (const doc of sportDocs) {
    const slug = typeof doc.data.slug === 'string' ? doc.data.slug : null;
    if (slug) {
      sportSlugById.set(doc.id, slug);
      sportIdBySlug.set(slug, doc.id);
    }
  }

  const countryNameByKey = new Map<string, string>();
  for (const doc of countryDocs) {
    const name = typeof doc.data.name === 'string' ? doc.data.name : null;
    if (!name) continue;
    countryNameByKey.set(doc.id, name);
    if (typeof doc.data.id === 'string') countryNameByKey.set(doc.data.id, name);
    if (typeof doc.data.external_id === 'string') countryNameByKey.set(doc.data.external_id, name);
  }

  return { sportSlugById, sportIdBySlug, countryNameByKey };
}
