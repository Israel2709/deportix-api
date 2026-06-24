import { serializeLeague } from '@/lib/api/serializers';
import type { LeagueDTO } from '@/lib/contracts/dto';
import { isSportSlug, type SportSlug } from '../sport-registry';
import { loadCatalogContext, type CatalogContext } from './catalog.repository';
import { fetchAll, fetchWhereEq, resolveDoc, type RawDoc } from './helpers';

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
