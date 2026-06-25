/**
 * Minimal in-memory Firestore double for repository tests. Supports the read surface the
 * repositories actually use: collection(), doc().get(), where('==') chaining, limit(),
 * get(), and count().get(). No network, no real Firestore.
 */
type Row = Record<string, unknown> & { id: string };
export type Dataset = Record<string, Row[]>;

function stripId(row: Row): Record<string, unknown> {
  const { id: _omit, ...rest } = row;
  void _omit;
  return rest;
}

function setNested(row: Row, path: string, value: unknown): void {
  const parts = path.split('.');
  let current: Record<string, unknown> = row;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    const next = current[part];
    if (!next || typeof next !== 'object' || Array.isArray(next)) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]!] = value;
}

function applyUpdate(row: Row, fields: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(fields)) {
    if (key.includes('.')) setNested(row, key, value);
    else row[key] = value;
  }
}

function makeQuery(rows: Row[], filters: Array<[string, unknown]>, limitN?: number) {
  const filtered = () => {
    let out = rows.filter((row) => filters.every(([field, value]) => row[field] === value));
    if (limitN != null) out = out.slice(0, limitN);
    return out;
  };
  const query = {
    where: (field: string, _op: string, value: unknown) =>
      makeQuery(rows, [...filters, [field, value]], limitN),
    limit: (n: number) => makeQuery(rows, filters, n),
    count: () => ({
      get: async () => ({
        data: () => ({
          count: rows.filter((row) => filters.every(([field, value]) => row[field] === value)).length,
        }),
      }),
    }),
    get: async () => {
      const docs = filtered().map((row) => ({ id: row.id, data: () => stripId(row) }));
      return {
        docs,
        size: docs.length,
        empty: docs.length === 0,
        forEach: (cb: (d: (typeof docs)[number]) => void) => docs.forEach(cb),
      };
    },
  };
  return query;
}

export function makeFakeDb(data: Dataset) {
  return {
    collection: (name: string) => {
      const rows = data[name] ?? [];
      return {
        ...makeQuery(rows, []),
        doc: (id: string) => ({
          get: async () => {
            const row = rows.find((r) => r.id === id);
            return {
              exists: Boolean(row),
              id,
              data: () => (row ? stripId(row) : undefined),
            };
          },
          update: async (fields: Record<string, unknown>) => {
            const row = rows.find((r) => r.id === id);
            if (!row) throw new Error(`Document ${id} not found in ${name}`);
            applyUpdate(row, fields);
          },
          delete: async () => {
            const idx = rows.findIndex((r) => r.id === id);
            if (idx === -1) throw new Error(`Document ${id} not found in ${name}`);
            rows.splice(idx, 1);
          },
        }),
      };
    },
  };
}
