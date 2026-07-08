import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFakeDb, type Dataset } from '../helpers/fake-firestore';

const state: { db: ReturnType<typeof makeFakeDb> | null } = { db: null };
vi.mock('@/lib/firebase/admin', () => ({
  getDb: () => state.db,
  isDataSourceConfigured: () => true,
}));

const { listCatalogLeagueTypes, resolveCatalogLeagueType } = await import('@/lib/catalog/league-types.service');
const { GET } = await import('../../app/v1/league-types/route');

const dataset: Dataset = {
  league_types: [
    { id: 'league', code: 'league', label: 'Liga', sort_order: 0 },
    { id: 'cup', code: 'cup', label: 'Copa', sort_order: 1 },
  ],
};

beforeEach(() => {
  state.db = makeFakeDb(structuredClone(dataset));
});

describe('catalog league types service', () => {
  it('lists league types sorted by sort_order', async () => {
    expect(await listCatalogLeagueTypes()).toEqual([
      { code: 'league', label: 'Liga' },
      { code: 'cup', label: 'Copa' },
    ]);
  });

  it('seeds defaults when collection is empty', async () => {
    state.db = makeFakeDb({});
    expect(await listCatalogLeagueTypes()).toEqual([
      { code: 'league', label: 'Liga' },
      { code: 'cup', label: 'Copa' },
    ]);
  });

  it('resolves known league types case-insensitively', async () => {
    await expect(resolveCatalogLeagueType('League')).resolves.toBe('league');
    await expect(resolveCatalogLeagueType('cup')).resolves.toBe('cup');
  });

  it('rejects unknown league types', async () => {
    await expect(resolveCatalogLeagueType('playoff')).rejects.toMatchObject({
      code: 'INVALID_REQUEST_BODY',
    });
  });
});

describe('GET /v1/league-types', () => {
  it('returns paginated catalog envelope', async () => {
    const res = await GET(new Request('http://localhost/v1/league-types?pageSize=50') as never, {
      params: Promise.resolve({}),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([
      { code: 'league', label: 'Liga' },
      { code: 'cup', label: 'Copa' },
    ]);
    expect(body.meta.pagination.total).toBe(2);
  });
});
