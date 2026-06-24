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
        }),
      };
    },
  };
}
