import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFakeDb, type Dataset } from '../helpers/fake-firestore';
import { TEST_ID_TOKEN, testAuthHeaders } from '../setup/auth-mock';

const state: { db: ReturnType<typeof makeFakeDb> | null } = { db: null };
vi.mock('@/lib/firebase/admin', () => ({
  getDb: () => state.db,
  isDataSourceConfigured: () => true,
  verifyFirebaseIdToken: async (token: string) => {
    if (token !== TEST_ID_TOKEN) throw new Error('invalid test token');
    return { uid: 'test-user', email: 'test@deportix.local', payload: {} };
  },
}));

const {
  createCatalogLeagueType,
  listCatalogLeagueTypes,
  resolveCatalogLeagueType,
} = await import('@/lib/catalog/league-types.service');
const { GET, POST } = await import('../../app/v1/league-types/route');

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

  it('creates a new league type', async () => {
    await expect(
      createCatalogLeagueType({ code: 'Friendly', label: 'Amistoso' }),
    ).resolves.toEqual({ code: 'friendly', label: 'Amistoso' });
    expect(await listCatalogLeagueTypes()).toEqual(
      expect.arrayContaining([{ code: 'friendly', label: 'Amistoso' }]),
    );
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

describe('POST /v1/league-types', () => {
  it('creates a league type when authenticated', async () => {
    const res = await POST(
      new Request('http://localhost/v1/league-types', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...testAuthHeaders },
        body: JSON.stringify({ code: 'super_cup', label: 'Supercopa' }),
      }) as never,
      { params: Promise.resolve({}) },
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toEqual({ code: 'super_cup', label: 'Supercopa' });
  });
});
