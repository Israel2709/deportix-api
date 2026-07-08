import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFakeDb, type Dataset } from '../helpers/fake-firestore';

const state: { db: ReturnType<typeof makeFakeDb> | null } = { db: null };
vi.mock('@/lib/firebase/admin', () => ({
  getDb: () => state.db,
  isDataSourceConfigured: () => true,
}));

const { listCatalogGameStages } = await import('@/lib/catalog/game-stages.service');
const { GET } = await import('../../app/v1/game-stages/route');

const dataset: Dataset = {
  game_stages: [
    { id: 'regular-season', value: 'Regular Season', label: 'Temporada regular', sort_order: 1 },
    { id: 'pre-season', value: 'Pre Season', label: 'Pretemporada', sort_order: 0 },
  ],
};

beforeEach(() => {
  state.db = makeFakeDb(structuredClone(dataset));
});

describe('catalog game stages service', () => {
  it('lists game stages sorted by sort_order', async () => {
    expect(await listCatalogGameStages()).toEqual([
      { value: 'Pre Season', label: 'Pretemporada' },
      { value: 'Regular Season', label: 'Temporada regular' },
    ]);
  });

  it('seeds defaults when collection is empty', async () => {
    state.db = makeFakeDb({});
    const stages = await listCatalogGameStages();
    expect(stages.some((item) => item.value === 'Regular Season')).toBe(true);
    expect(stages.some((item) => item.value === 'Super Bowl')).toBe(true);
  });
});

describe('GET /v1/game-stages', () => {
  it('returns paginated catalog envelope', async () => {
    const res = await GET(new Request('http://localhost/v1/game-stages?pageSize=50') as never, {
      params: Promise.resolve({}),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([
      { value: 'Pre Season', label: 'Pretemporada' },
      { value: 'Regular Season', label: 'Temporada regular' },
    ]);
    expect(body.meta.pagination.total).toBe(2);
  });
});
