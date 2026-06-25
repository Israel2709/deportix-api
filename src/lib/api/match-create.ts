import { z } from 'zod';
import type { TeamLookup } from '@/lib/api/serializers';
import type { SportSlug } from '@/lib/firebase/sport-registry';

const nullableString = z.string().nullable();

const matchSideCreateSchema = z.object({
  teamId: z.string().min(1),
  name: nullableString.optional(),
  logo: nullableString.optional(),
  score: z.number().int().nullable().optional(),
});

export const matchCreateSchema = z
  .object({
    externalId: nullableString.optional(),
    seasonId: nullableString.optional(),
    date: z.string().min(1),
    status: nullableString.optional(),
    round: nullableString.optional(),
    venue: nullableString.optional(),
    home: matchSideCreateSchema,
    away: matchSideCreateSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.home.teamId === value.away.teamId) {
      ctx.addIssue({
        code: 'custom',
        message: 'home.teamId and away.teamId must be different.',
        path: ['away', 'teamId'],
      });
    }
  });

export type MatchCreate = z.infer<typeof matchCreateSchema>;

export interface ResolvedMatchSide {
  teamId: string;
  name: string | null;
  logo: string | null;
  score: number | null;
}

/**
 * Builds a full Firestore match document for the given sport. Denormalizes team names/logos
 * from the league team map when not supplied in the request body.
 */
export function buildMatchFirestoreDocument(
  sport: SportSlug,
  docId: string,
  leagueId: string,
  seasonId: string,
  input: MatchCreate,
  home: ResolvedMatchSide,
  away: ResolvedMatchSide,
  now: string,
): Record<string, unknown> {
  const status = input.status ?? 'NS';
  const base = {
    id: docId,
    league_id: leagueId,
    season_id: seasonId,
    home_team_id: home.teamId,
    away_team_id: away.teamId,
    status,
    external_id: input.externalId ?? null,
    created_at: now,
    updated_at: now,
  };

  if (sport === 'soccer') {
    return {
      ...base,
      fixture_date: input.date,
      venue: input.venue ?? null,
      fixture: {
        date: input.date,
        venue: input.venue ? { name: input.venue } : {},
      },
      league: { round: input.round ?? null },
      goals: { home: home.score, away: away.score },
      score: { fulltime: { home: home.score, away: away.score } },
      teams: {
        home: { name: home.name, logo: home.logo },
        away: { name: away.name, logo: away.logo },
      },
    };
  }

  return {
    ...base,
    game_date: input.date,
    fixture_date: input.date,
    date: input.date,
    round: input.round ?? null,
    venue: input.venue ?? null,
    home_score: home.score,
    away_score: away.score,
    teams: {
      home: { name: home.name, logo: home.logo },
      away: { name: away.name, logo: away.logo },
    },
  };
}

export function resolveSide(
  side: MatchCreate['home'],
  teamMap: Map<string, TeamLookup>,
): ResolvedMatchSide {
  const fromMap = teamMap.get(side.teamId);
  return {
    teamId: side.teamId,
    name: side.name !== undefined ? side.name : (fromMap?.name ?? null),
    logo: side.logo !== undefined ? side.logo : (fromMap?.logo ?? null),
    score: side.score !== undefined ? side.score : null,
  };
}
