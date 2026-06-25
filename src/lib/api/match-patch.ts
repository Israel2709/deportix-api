import { z } from 'zod';
import type { SportSlug } from '@/lib/firebase/sport-registry';

const nullableString = z.string().nullable();

const matchSidePatchSchema = z
  .object({
    teamId: nullableString.optional(),
    name: nullableString.optional(),
    logo: nullableString.optional(),
    score: z.number().int().nullable().optional(),
  })
  .optional();

export const matchUpdateSchema = z
  .object({
    externalId: nullableString.optional(),
    seasonId: nullableString.optional(),
    date: nullableString.optional(),
    status: nullableString.optional(),
    round: nullableString.optional(),
    venue: nullableString.optional(),
    home: matchSidePatchSchema,
    away: matchSidePatchSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!hasPatchFields(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one field must be provided.',
      });
    }
  });

export type MatchUpdate = z.infer<typeof matchUpdateSchema>;

function hasPatchFields(patch: MatchUpdate): boolean {
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    if (key === 'home' || key === 'away') {
      if (value && typeof value === 'object' && Object.keys(value).length > 0) return true;
      continue;
    }
    return true;
  }
  return false;
}

/**
 * Maps a public PATCH body (camelCase DTO fields) to Firestore update keys for the given sport.
 * Uses dot notation for nested denormalized soccer fields.
 */
export function buildMatchFirestorePatch(
  sport: SportSlug,
  patch: MatchUpdate,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  if (patch.externalId !== undefined) out.external_id = patch.externalId;
  if (patch.seasonId !== undefined) out.season_id = patch.seasonId;
  if (patch.status !== undefined) out.status = patch.status;

  if (sport === 'soccer') {
    if (patch.date !== undefined) {
      out.fixture_date = patch.date;
      out['fixture.date'] = patch.date;
    }
    if (patch.round !== undefined) out['league.round'] = patch.round;
    if (patch.venue !== undefined) {
      out.venue = patch.venue;
      out['fixture.venue.name'] = patch.venue;
    }
    applySidePatch(out, patch.home, 'home');
    applySidePatch(out, patch.away, 'away');
    return out;
  }

  // NFL and other generic sports.
  if (patch.date !== undefined) {
    out.game_date = patch.date;
    out.fixture_date = patch.date;
    out.date = patch.date;
  }
  if (patch.round !== undefined) out.round = patch.round;
  if (patch.venue !== undefined) out.venue = patch.venue;
  applyGenericSidePatch(out, patch.home, 'home');
  applyGenericSidePatch(out, patch.away, 'away');
  return out;
}

function applySidePatch(
  out: Record<string, unknown>,
  side: MatchUpdate['home'],
  which: 'home' | 'away',
): void {
  if (!side) return;
  if (side.teamId !== undefined) out[`${which}_team_id`] = side.teamId;
  if (side.score !== undefined) {
    out[`goals.${which}`] = side.score;
    out[`score.fulltime.${which}`] = side.score;
  }
  if (side.name !== undefined) out[`teams.${which}.name`] = side.name;
  if (side.logo !== undefined) out[`teams.${which}.logo`] = side.logo;
}

function applyGenericSidePatch(
  out: Record<string, unknown>,
  side: MatchUpdate['home'],
  which: 'home' | 'away',
): void {
  if (!side) return;
  if (side.teamId !== undefined) out[`${which}_team_id`] = side.teamId;
  if (side.score !== undefined) out[`${which}_score`] = side.score;
  if (side.name !== undefined) out[`teams.${which}.name`] = side.name;
  if (side.logo !== undefined) out[`teams.${which}.logo`] = side.logo;
}
