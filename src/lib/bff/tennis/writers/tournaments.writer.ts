import { notFound } from '@/lib/api/errors';
import { TENNIS_COLLECTIONS } from '@/lib/firebase/sport-registry';
import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import {
  createTennisDoc,
  deleteTennisDoc,
  listTennisEntriesByTournament,
  listTennisMatchesByTournament,
  listTennisRoundsByTournament,
  resolveTennisTournament,
  updateTennisDoc,
} from '@/lib/firebase/repositories/tennis.repository';
import { mapTennisTournament } from '../mappers/tournament.mapper';
import { parseBody } from '../parse';
import { toMatchSnap, toRoundSnap } from '../snaps';
import { assertPublishableBracket } from '../validation';
import {
  tennisTournamentCreateSchema,
  tennisTournamentUpdateSchema,
  type TennisTournamentCreate,
  type TennisTournamentItem,
  type TennisTournamentUpdate,
} from '../schemas/tournament.schema';

async function toItem(doc: { id: string; data: Record<string, unknown> }): Promise<TennisTournamentItem> {
  return mapTennisTournament(doc, await buildCountryMap());
}

export async function createTennisTournament(body: unknown): Promise<TennisTournamentItem> {
  const input = parseBody<TennisTournamentCreate>(tennisTournamentCreateSchema, body, 'tournament');
  const doc = await createTennisDoc(TENNIS_COLLECTIONS.tournaments, {
    name: input.name,
    short_name: input.shortName ?? null,
    category: input.category,
    gender: input.gender,
    event_type: input.eventType ?? 'singles',
    country_code: input.countryCode.toUpperCase(),
    city: input.city ?? null,
    image_url: input.imageUrl ?? null,
    start_date: input.startDate,
    end_date: input.endDate,
    year: input.year,
    status: input.status ?? 'upcoming',
    is_published: false,
    published_at: null,
  });
  return toItem(doc);
}

export async function updateTennisTournament(id: string, body: unknown): Promise<TennisTournamentItem> {
  const existing = await resolveTennisTournament(id);
  if (!existing) throw notFound('Tournament not found.');
  const patch = parseBody<TennisTournamentUpdate>(tennisTournamentUpdateSchema, body, 'tournament');
  const doc = await updateTennisDoc(TENNIS_COLLECTIONS.tournaments, existing.id, {
    ...(patch.name != null ? { name: patch.name } : {}),
    ...(patch.shortName !== undefined ? { short_name: patch.shortName } : {}),
    ...(patch.category != null ? { category: patch.category } : {}),
    ...(patch.gender != null ? { gender: patch.gender } : {}),
    ...(patch.eventType != null ? { event_type: patch.eventType } : {}),
    ...(patch.countryCode != null ? { country_code: patch.countryCode.toUpperCase() } : {}),
    ...(patch.city !== undefined ? { city: patch.city } : {}),
    ...(patch.imageUrl !== undefined ? { image_url: patch.imageUrl } : {}),
    ...(patch.startDate != null ? { start_date: patch.startDate } : {}),
    ...(patch.endDate != null ? { end_date: patch.endDate } : {}),
    ...(patch.year != null ? { year: patch.year } : {}),
    ...(patch.status != null ? { status: patch.status } : {}),
  });
  return toItem(doc);
}

export async function deleteTennisTournament(id: string): Promise<void> {
  const existing = await resolveTennisTournament(id);
  if (!existing) throw notFound('Tournament not found.');
  await deleteTennisDoc(TENNIS_COLLECTIONS.tournaments, existing.id);
}

export async function publishTennisTournament(id: string): Promise<TennisTournamentItem> {
  const existing = await resolveTennisTournament(id);
  if (!existing) throw notFound('Tournament not found.');

  const [rounds, matches] = await Promise.all([
    listTennisRoundsByTournament(existing.id),
    listTennisMatchesByTournament(existing.id),
  ]);
  // Tournaments can go live before the draw exists. If rounds/matches are already
  // loaded they are published too; TBD competitors are allowed.
  if (rounds.length > 0 || matches.length > 0) {
    assertPublishableBracket(rounds.map(toRoundSnap), matches.map(toMatchSnap));
  }

  const now = new Date().toISOString();
  const entries = await listTennisEntriesByTournament(existing.id);

  await Promise.all([
    ...rounds.map((round) =>
      updateTennisDoc(TENNIS_COLLECTIONS.rounds, round.id, { is_published: true }),
    ),
    ...entries.map((entry) =>
      updateTennisDoc(TENNIS_COLLECTIONS.entries, entry.id, { is_published: true }),
    ),
    ...matches.map((match) =>
      updateTennisDoc(TENNIS_COLLECTIONS.matches, match.id, {
        is_published: true,
        published_competitor_1_id: match.data.competitor_1_id ?? null,
        published_competitor_2_id: match.data.competitor_2_id ?? null,
      }),
    ),
  ]);

  const doc = await updateTennisDoc(TENNIS_COLLECTIONS.tournaments, existing.id, {
    is_published: true,
    published_at: now,
  });
  return toItem(doc);
}
