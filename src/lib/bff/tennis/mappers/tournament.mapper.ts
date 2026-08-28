import { asBool, asNum, asStr } from '@/lib/api/serializers';
import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { TennisTournamentItem } from '../schemas/tournament.schema';
import { mapCountryRef } from './player.mapper';

function asCategory(value: unknown): TennisTournamentItem['category'] {
  const v = asStr(value);
  if (v === 'grand_slam' || v === 'atp_1000' || v === 'wta_1000') return v;
  return 'grand_slam';
}

function asGender(value: unknown): TennisTournamentItem['gender'] {
  return asStr(value) === 'female' ? 'female' : 'male';
}

function asStatus(value: unknown): TennisTournamentItem['status'] {
  const v = asStr(value);
  if (v === 'active' || v === 'finished' || v === 'cancelled' || v === 'upcoming') return v;
  return 'upcoming';
}

export function mapTennisTournament(
  doc: RawDoc,
  countryMap?: Map<string, CountryRecord>,
): TennisTournamentItem {
  return {
    id: doc.id,
    name: asStr(doc.data.name) ?? '',
    shortName: asStr(doc.data.short_name),
    category: asCategory(doc.data.category),
    gender: asGender(doc.data.gender),
    eventType: 'singles',
    country: mapCountryRef(asStr(doc.data.country_code), countryMap),
    city: asStr(doc.data.city),
    imageUrl: asStr(doc.data.image_url),
    startDate: asStr(doc.data.start_date) ?? '',
    endDate: asStr(doc.data.end_date) ?? '',
    year: asNum(doc.data.year) ?? 0,
    status: asStatus(doc.data.status),
    published: asBool(doc.data.is_published),
    publishedAt: asStr(doc.data.published_at),
    createdAt: asStr(doc.data.created_at),
    updatedAt: asStr(doc.data.updated_at),
  };
}
