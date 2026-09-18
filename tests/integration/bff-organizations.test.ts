import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFakeDb, type Dataset } from '../helpers/fake-firestore';

const state: { db: ReturnType<typeof makeFakeDb> | null } = { db: null };
vi.mock('@/lib/firebase/admin', () => ({
  getDb: () => state.db,
  isDataSourceConfigured: () => true,
}));

const { fetchFootballOrganizations } = await import(
  '@/lib/bff/football/services/organizations.service'
);
const { fetchFootballLeagues } = await import('@/lib/bff/football/services/leagues.service');
const {
  createSoccerOrganizationEntry,
  deleteSoccerOrganizationEntry,
  updateSoccerOrganizationEntry,
} = await import('@/lib/bff/football/writers/organizations.writer');
const { createSoccerLeagueEntry } = await import('@/lib/bff/football/writers/catalog.writer');
const { GET, POST, DELETE } = await import('../../app/organizations/route');

const dataset: Dataset = {
  sports: [{ id: 'sp_soccer', slug: 'soccer', name: 'Soccer' }],
  countries: [
    {
      id: 'c_mx',
      external_id: 'MX',
      code: 'MX',
      name: 'Mexico',
      flag: 'https://example.com/mx.svg',
    },
  ],
  sports_organizations: [
    {
      id: 'org_fmf',
      name: 'Federación Mexicana de Fútbol',
      logo: 'https://example.com/fmf.png',
      country_id: 'c_mx',
      sport_id: 'sp_soccer',
    },
  ],
  leagues: [
    {
      id: 'lg_mx',
      external_id: '262',
      name: 'Liga MX',
      type: 'League',
      sport_id: 'sp_soccer',
      country_id: 'c_mx',
      organization_id: 'org_fmf',
      logo: 'https://example.com/liga.png',
    },
    {
      id: 'lg_free',
      external_id: '999',
      name: 'Liga Libre',
      type: 'League',
      sport_id: 'sp_soccer',
      country_id: 'c_mx',
      logo: null,
    },
  ],
  seasons: [],
};

beforeEach(() => {
  state.db = makeFakeDb(structuredClone(dataset));
});

const emptyCtx = { params: Promise.resolve({}) };

describe('football organizations', () => {
  it('lists organizations for a country', async () => {
    const orgs = await fetchFootballOrganizations({ country: 'Mexico' });
    expect(orgs).toEqual([
      {
        id: 'org_fmf',
        name: 'Federación Mexicana de Fútbol',
        logo: 'https://example.com/fmf.png',
        country: { name: 'Mexico', code: 'MX', flag: 'https://example.com/mx.svg' },
      },
    ]);
  });

  it('creates an organization associated with a country', async () => {
    const created = await createSoccerOrganizationEntry({
      name: 'Liga MX Federación',
      logo: null,
      country: { name: 'Mexico' },
    });
    expect(created).toMatchObject({
      name: 'Liga MX Federación',
      country: { name: 'Mexico', code: 'MX' },
    });
    expect(created.id).toEqual(expect.any(String));
    expect(await fetchFootballOrganizations({ country: 'Mexico' })).toHaveLength(2);
  });

  it('rejects a duplicate organization name in the same country', async () => {
    await expect(
      createSoccerOrganizationEntry({
        name: 'Federación Mexicana de Fútbol',
        country: { name: 'Mexico' },
      }),
    ).rejects.toThrow(/already exists/i);
  });

  it('rejects creating an organization for an unknown country', async () => {
    await expect(
      createSoccerOrganizationEntry({
        name: 'CONMEBOL',
        country: { name: 'Atlantis' },
      }),
    ).rejects.toThrow(/Country not found/i);
  });

  it('updates an organization name', async () => {
    const updated = await updateSoccerOrganizationEntry('org_fmf', {
      name: 'FMF',
      logo: 'https://example.com/fmf.png',
    });
    expect(updated.name).toBe('FMF');
  });

  it('blocks deleting an organization that still has leagues', async () => {
    await expect(deleteSoccerOrganizationEntry('org_fmf')).rejects.toThrow(/has leagues/i);
  });

  it('deletes an organization with no leagues', async () => {
    const created = await createSoccerOrganizationEntry({
      name: 'Empty Org',
      country: { name: 'Mexico' },
    });
    await deleteSoccerOrganizationEntry(created.id);
    const remaining = await fetchFootballOrganizations({ country: 'Mexico' });
    expect(remaining.find((row) => (row as { id: string }).id === created.id)).toBeUndefined();
  });

  it('attaches organization on league list and filters by it', async () => {
    const assigned = await fetchFootballLeagues({ organization: 'org_fmf' });
    expect(assigned).toHaveLength(1);
    expect(assigned[0]).toMatchObject({
      league: { name: 'Liga MX' },
      organization: { id: 'org_fmf', name: 'Federación Mexicana de Fútbol' },
    });

    const unassigned = await fetchFootballLeagues({});
    const libre = unassigned.find(
      (row) => (row as { league: { name: string } }).league.name === 'Liga Libre',
    );
    expect(libre).toMatchObject({ organization: null });
  });

  it('creates a league associated with an organization', async () => {
    const created = await createSoccerLeagueEntry({
      league: { name: 'Copa MX', type: 'Cup', logo: null },
      country: { name: 'Mexico' },
      organization: { id: 'org_fmf' },
      seasons: [],
    });
    expect(created).toMatchObject({
      league: { name: 'Copa MX' },
      organization: { id: 'org_fmf', name: 'Federación Mexicana de Fútbol' },
    });
  });

  it('GET /organizations returns the BFF envelope', async () => {
    const res = await GET(new Request('http://localhost/organizations?country=Mexico') as never, emptyCtx);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.response).toHaveLength(1);
    expect(body.results).toBe(1);
  });

  it('POST /organizations creates via the route', async () => {
    const res = await POST(
      new Request('http://localhost/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Liga Premier',
          logo: null,
          country: { name: 'Mexico' },
        }),
      }) as never,
      emptyCtx,
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.response[0].name).toBe('Liga Premier');
  });

  it('DELETE /organizations without id is 400', async () => {
    const res = await DELETE(new Request('http://localhost/organizations', { method: 'DELETE' }) as never, emptyCtx);
    expect(res.status).toBe(400);
  });
});
