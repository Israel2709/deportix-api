import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFakeDb, type Dataset } from '../helpers/fake-firestore';

const state: { db: ReturnType<typeof makeFakeDb> | null } = { db: null };
vi.mock('@/lib/firebase/admin', () => ({
  getDb: () => state.db,
  isDataSourceConfigured: () => true,
}));

const { resolveCreateSeason } = await import('@/lib/api/route-helpers');

const dataset: Dataset = {
  seasons: [
    { id: 'se_ar26', league_id: 'lg_ar', year: 2026, current: true },
    { id: 'se_ar25', league_id: 'lg_ar', year: 2025, current: false, external_id: '128-2025' },
  ],
};

beforeEach(() => {
  state.db = makeFakeDb(structuredClone(dataset));
});

describe('resolveCreateSeason', () => {
  it('defaults to the current season', async () => {
    const season = await resolveCreateSeason('lg_ar', undefined, undefined);
    expect(season).toMatchObject({ id: 'se_ar26', year: 2026, current: true });
  });

  it('resolves a season by year', async () => {
    const season = await resolveCreateSeason('lg_ar', 2025, undefined);
    expect(season).toMatchObject({ id: 'se_ar25', year: 2025 });
  });

  it('resolves a season by document id or external id', async () => {
    expect(await resolveCreateSeason('lg_ar', undefined, 'se_ar25')).toMatchObject({ year: 2025 });
    expect(await resolveCreateSeason('lg_ar', undefined, '128-2025')).toMatchObject({ year: 2025 });
  });

  it('rejects mismatched season year and seasonId', async () => {
    await expect(resolveCreateSeason('lg_ar', 2026, 'se_ar25')).rejects.toMatchObject({
      code: 'INVALID_REQUEST_BODY',
    });
  });

  it('rejects unknown season year', async () => {
    await expect(resolveCreateSeason('lg_ar', 2010, undefined)).rejects.toMatchObject({
      code: 'DATA_NOT_AVAILABLE',
    });
  });
});
