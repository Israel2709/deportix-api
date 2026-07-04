import { fetchAll, createDoc, deleteDoc, updateDocFields, type RawDoc } from './helpers';

const COLLECTION = 'reference_timezones';

const DEFAULT_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Mexico_City',
  'Europe/London',
];

function toTimezoneName(doc: RawDoc): string | null {
  const name = doc.data.name;
  return typeof name === 'string' && name.length > 0 ? name : doc.id;
}

export async function listTimezones(): Promise<string[]> {
  const docs = await fetchAll(COLLECTION);
  if (docs.length === 0) return [...DEFAULT_TIMEZONES].sort();
  return docs
    .map(toTimezoneName)
    .filter((name): name is string => name != null)
    .sort();
}

export async function createTimezone(name: string): Promise<string> {
  const id = name.replace(/\//g, '_');
  await createDoc(COLLECTION, id, { name, created_at: new Date().toISOString() });
  return name;
}

export async function updateTimezone(oldName: string, newName: string): Promise<string> {
  const docs = await fetchAll(COLLECTION);
  const doc = docs.find((entry) => toTimezoneName(entry) === oldName);
  if (!doc) {
    await createTimezone(newName);
    return newName;
  }
  const newId = newName.replace(/\//g, '_');
  await createDoc(COLLECTION, newId, { name: newName, updated_at: new Date().toISOString() });
  if (doc.id !== newId) await deleteDoc(COLLECTION, doc.id);
  return newName;
}

export async function deleteTimezone(name: string): Promise<void> {
  const docs = await fetchAll(COLLECTION);
  const doc = docs.find((entry) => toTimezoneName(entry) === name);
  if (doc) await deleteDoc(COLLECTION, doc.id);
}

export async function seedDefaultTimezonesIfEmpty(): Promise<void> {
  const docs = await fetchAll(COLLECTION);
  if (docs.length > 0) return;
  for (const name of DEFAULT_TIMEZONES) {
    await createTimezone(name);
  }
}
