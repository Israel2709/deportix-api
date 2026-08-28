import { asBool, asStr } from '@/lib/api/serializers';
import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { TennisPlayerItem } from '../schemas/player.schema';
import type { countryRefSchema } from '../schemas/primitives';
import type { z } from 'zod';

export type CountryRef = z.infer<typeof countryRefSchema>;

export function mapCountryRef(
  countryCode: string | null,
  countryMap?: Map<string, CountryRecord>,
): CountryRef {
  const code = countryCode ?? '';
  const country =
    (countryCode && countryMap
      ? (countryMap.get(countryCode) ?? countryMap.get(countryCode.toUpperCase()))
      : undefined) ?? null;
  return {
    code,
    name: country?.name ?? null,
    flag: country?.flag ?? null,
  };
}

export function mapTennisPlayer(
  doc: RawDoc,
  countryMap?: Map<string, CountryRecord>,
): TennisPlayerItem {
  const countryCode = asStr(doc.data.country_code);
  return {
    id: doc.id,
    fullName: asStr(doc.data.full_name) ?? '',
    displayName: asStr(doc.data.display_name) ?? '',
    photoUrl: asStr(doc.data.photo_url),
    country: mapCountryRef(countryCode, countryMap),
    published: asBool(doc.data.is_published),
    createdAt: asStr(doc.data.created_at),
    updatedAt: asStr(doc.data.updated_at),
  };
}

export function mapTennisPlayerRef(
  doc: RawDoc | undefined,
  playerId: string | null,
  countryMap?: Map<string, CountryRecord>,
) {
  if (!playerId) return null;
  if (!doc) {
    return {
      id: playerId,
      fullName: '',
      displayName: '',
      photoUrl: null,
      country: mapCountryRef(null, countryMap),
    };
  }
  const player = mapTennisPlayer(doc, countryMap);
  return {
    id: player.id,
    fullName: player.fullName,
    displayName: player.displayName,
    photoUrl: player.photoUrl,
    country: player.country,
  };
}

export function nameMatches(value: string | null | undefined, filter: string): boolean {
  if (!value) return false;
  return value.toLowerCase().includes(filter.toLowerCase());
}
