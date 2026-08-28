import { invalidRequestBody, notFound } from '@/lib/api/errors';
import { TENNIS_COLLECTIONS } from '@/lib/firebase/sport-registry';
import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import {
  createTennisDoc,
  deleteTennisDoc,
  listTennisPlayers,
  resolveTennisPlayer,
  updateTennisDoc,
} from '@/lib/firebase/repositories/tennis.repository';
import { mapTennisPlayer, nameMatches } from '../mappers/player.mapper';
import { parseBody } from '../parse';
import {
  tennisPlayerCreateSchema,
  tennisPlayerUpdateSchema,
  type TennisPlayerCreate,
  type TennisPlayerItem,
  type TennisPlayerUpdate,
} from '../schemas/player.schema';

async function toItem(doc: { id: string; data: Record<string, unknown> }): Promise<TennisPlayerItem> {
  return mapTennisPlayer(doc, await buildCountryMap());
}

export async function createTennisPlayer(body: unknown): Promise<TennisPlayerItem> {
  const input = parseBody<TennisPlayerCreate>(tennisPlayerCreateSchema, body, 'player');
  const existing = await listTennisPlayers();
  const duplicate = existing.find((doc) =>
    nameMatches(String(doc.data.full_name ?? ''), input.fullName),
  );
  if (duplicate && (String(duplicate.data.full_name ?? '').toLowerCase() === input.fullName.toLowerCase())) {
    throw invalidRequestBody('A player with that fullName already exists. Reuse the existing playerId.');
  }
  const doc = await createTennisDoc(TENNIS_COLLECTIONS.players, {
    full_name: input.fullName,
    display_name: input.displayName,
    photo_url: input.photoUrl ?? null,
    country_code: input.countryCode.toUpperCase(),
    is_published: input.published ?? true,
  });
  return toItem(doc);
}

export async function updateTennisPlayer(id: string, body: unknown): Promise<TennisPlayerItem> {
  const existing = await resolveTennisPlayer(id);
  if (!existing) throw notFound('Player not found.');
  const patch = parseBody<TennisPlayerUpdate>(tennisPlayerUpdateSchema, body, 'player');
  const doc = await updateTennisDoc(TENNIS_COLLECTIONS.players, existing.id, {
    ...(patch.fullName != null ? { full_name: patch.fullName } : {}),
    ...(patch.displayName != null ? { display_name: patch.displayName } : {}),
    ...(patch.photoUrl !== undefined ? { photo_url: patch.photoUrl } : {}),
    ...(patch.countryCode != null ? { country_code: patch.countryCode.toUpperCase() } : {}),
    ...(patch.published !== undefined ? { is_published: patch.published } : {}),
  });
  return toItem(doc);
}

export async function deleteTennisPlayer(id: string): Promise<void> {
  const existing = await resolveTennisPlayer(id);
  if (!existing) throw notFound('Player not found.');
  await deleteTennisDoc(TENNIS_COLLECTIONS.players, existing.id);
}
