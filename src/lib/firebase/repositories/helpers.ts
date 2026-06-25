import type { DocumentData } from 'firebase-admin/firestore';
import { getDb } from '../admin';

/**
 * Low-level Firestore read helpers shared by all repositories.
 *
 * DESIGN: every query is either a document lookup or an EQUALITY filter on a single field.
 * Equality queries only need Firestore's automatic single-field indexes, so the API never
 * depends on composite indexes we cannot create (the platform's Firestore is read-only to
 * us). Filtering, sorting and pagination beyond equality are done in memory on capped
 * result sets. This trades some efficiency for resilience; see docs/caching.md for the
 * planned snapshot/aggregate optimization.
 */

export interface RawDoc {
  id: string;
  data: DocumentData;
}

/** Safety cap so a single request can never pull an unbounded collection into memory. */
export const DEFAULT_FETCH_CAP = 3000;

export async function getDocById(collection: string, id: string): Promise<RawDoc | null> {
  const ref = await getDb().collection(collection).doc(id).get();
  if (!ref.exists) return null;
  return { id: ref.id, data: ref.data() ?? {} };
}

export async function findByExternalId(
  collection: string,
  externalId: string,
): Promise<RawDoc | null> {
  const snap = await getDb()
    .collection(collection)
    .where('external_id', '==', externalId)
    .limit(1)
    .get();
  const doc = snap.docs[0];
  return doc ? { id: doc.id, data: doc.data() } : null;
}

/**
 * Resolve a public identifier to a document: first by document id, then (fallback) by the
 * external provider id. Lets callers use either form in path params.
 */
export async function resolveDoc(collection: string, idOrExternalId: string): Promise<RawDoc | null> {
  return (await getDocById(collection, idOrExternalId)) ?? findByExternalId(collection, idOrExternalId);
}

export async function fetchAll(collection: string, cap = DEFAULT_FETCH_CAP): Promise<RawDoc[]> {
  const snap = await getDb().collection(collection).limit(cap).get();
  return snap.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
}

export async function fetchWhereEq(
  collection: string,
  field: string,
  value: unknown,
  cap = DEFAULT_FETCH_CAP,
): Promise<RawDoc[]> {
  const snap = await getDb().collection(collection).where(field, '==', value).limit(cap).get();
  return snap.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
}

/** Cheap aggregate count for an equality filter (uses Firestore's count() aggregation). */
export async function countWhereEq(
  collection: string,
  field: string,
  value: unknown,
): Promise<number> {
  const snap = await getDb().collection(collection).where(field, '==', value).count().get();
  return snap.data().count;
}

export async function countCollection(collection: string): Promise<number> {
  const snap = await getDb().collection(collection).count().get();
  return snap.data().count;
}

export async function updateDocFields(
  collection: string,
  id: string,
  fields: Record<string, unknown>,
): Promise<void> {
  await getDb().collection(collection).doc(id).update(fields);
}

export async function deleteDoc(collection: string, id: string): Promise<void> {
  await getDb().collection(collection).doc(id).delete();
}
