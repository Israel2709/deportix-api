import { z } from 'zod';
import type { SportSlug } from '@/lib/firebase/sport-registry';

const nullableString = z.string().nullable();

const venuePatchSchema = z
  .object({
    name: nullableString.optional(),
    city: nullableString.optional(),
    capacity: z.number().int().nullable().optional(),
  })
  .optional();

export const teamUpdateSchema = z
  .object({
    name: nullableString.optional(),
    code: nullableString.optional(),
    country: nullableString.optional(),
    logo: nullableString.optional(),
    altName: nullableString.optional(),
    altLogo: nullableString.optional(),
    city: nullableString.optional(),
    conference: nullableString.optional(),
    division: nullableString.optional(),
    venue: venuePatchSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!hasPatchFields(value)) {
      ctx.addIssue({ code: 'custom', message: 'At least one field must be provided.' });
    }
  });

export type TeamUpdate = z.infer<typeof teamUpdateSchema>;

function hasPatchFields(patch: TeamUpdate): boolean {
  return Object.entries(patch).some(([key, value]) => {
    if (value === undefined) return false;
    if (key === 'venue') return value && typeof value === 'object' && Object.keys(value).length > 0;
    return true;
  });
}

/** Maps a public PATCH body to Firestore field updates for the team's sport collection. */
export function buildTeamFirestorePatch(
  sport: SportSlug,
  patch: TeamUpdate,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  if (patch.altName !== undefined) out.alt_name = patch.altName;
  if (patch.altLogo !== undefined) out.alt_logo = patch.altLogo;

  if (sport === 'soccer') {
    if (patch.name !== undefined) {
      out.name = patch.name;
      out['team.name'] = patch.name;
    }
    if (patch.code !== undefined) {
      out.code = patch.code;
      out['team.code'] = patch.code;
    }
    if (patch.country !== undefined) {
      out.country = patch.country;
      out['team.country'] = patch.country;
    }
    if (patch.logo !== undefined) {
      out.logo = patch.logo;
      out['team.logo'] = patch.logo;
    }
    if (patch.venue !== undefined) {
      if (patch.venue === null) {
        out.venue = null;
      } else {
        if (patch.venue.name !== undefined) out['venue.name'] = patch.venue.name;
        if (patch.venue.city !== undefined) out['venue.city'] = patch.venue.city;
        if (patch.venue.capacity !== undefined) out['venue.capacity'] = patch.venue.capacity;
      }
    }
    return out;
  }

  if (sport === 'american-football') {
    if (patch.name !== undefined) out.name = patch.name;
    if (patch.code !== undefined) out.code = patch.code;
    if (patch.city !== undefined) out.city = patch.city;
    if (patch.conference !== undefined) out.conference = patch.conference;
    if (patch.division !== undefined) out.division = patch.division;
    if (patch.logo !== undefined) out.logo = patch.logo;
    return out;
  }

  if (patch.name !== undefined) out.name = patch.name;
  if (patch.code !== undefined) out.code = patch.code;
  if (patch.logo !== undefined) out.logo = patch.logo;
  return out;
}
