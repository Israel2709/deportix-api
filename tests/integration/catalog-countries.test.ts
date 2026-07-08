import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFakeDb, type Dataset } from '../helpers/fake-firestore';

const state: { db: ReturnType<typeof makeFakeDb> | null } = { db: null };
vi.mock('@/lib/firebase/admin', () => ({
  getDb: () => state.db,
  isDataSourceConfigured: () => true,
}));

const { listCatalogCountries, createCatalogCountry } = await import('@/lib/catalog/countries.service');
const { GET, POST } = await import('../../app/v1/countries/route');

const dataset: Dataset = {
  countries: [
    { id: 'c_mx', external_id: 'MX', code: 'MX', name: 'Mexico', flag: 'https://example.com/mx.svg' },
    { id: 'c_us', external_id: 'US', code: 'US', name: 'USA', flag: 'https://example.com/us.svg' },
  ],
};

beforeEach(() => {
  state.db = makeFakeDb(structuredClone(dataset));
});

describe('catalog countries service', () => {
  it('lists all countries sorted by name', async () => {
    const countries = await listCatalogCountries();
    expect(countries).toEqual([
      { name: 'Mexico', code: 'MX', flag: 'https://example.com/mx.svg' },
      { name: 'USA', code: 'US', flag: 'https://example.com/us.svg' },
    ]);
  });

  it('filters by code', async () => {
    expect(await listCatalogCountries({ code: 'US' })).toEqual([
      { name: 'USA', code: 'US', flag: 'https://example.com/us.svg' },
    ]);
  });

  it('creates a country in the shared catalog', async () => {
    const created = await createCatalogCountry({ name: 'Canada', code: 'CA', flag: null });
    expect(created.name).toBe('Canada');
    expect(await listCatalogCountries({ code: 'CA' })).toHaveLength(1);
  });
});

describe('GET /v1/countries', () => {
  it('returns paginated catalog envelope', async () => {
    const res = await GET(new Request('http://localhost/v1/countries?pageSize=250') as never, {
      params: Promise.resolve({}),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.meta.pagination.total).toBe(2);
  });
});

describe('POST /v1/countries', () => {
  it('creates a country', async () => {
    const res = await POST(
      new Request('http://localhost/v1/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Argentina', code: 'AR', flag: null }),
      }) as never,
      { params: Promise.resolve({}) },
    );
    expect(res.status).toBe(201);
    expect((await res.json()).data.name).toBe('Argentina');
  });
});
