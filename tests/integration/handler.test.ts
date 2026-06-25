import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { getRoute, optionsRoute, patchRoute, deleteRoute, type PatchRouteHandler, type RouteHandler } from '@/lib/api/handler';
import { ApiError } from '@/lib/api/errors';

function req(url = 'http://localhost/v1/x', init?: RequestInit) {
  return new Request(url, init) as never;
}
const noParams = { params: Promise.resolve({}) } as never;

const run = (handler: RouteHandler, r = req()) => getRoute(handler)(r, noParams);
const runPatch = (handler: PatchRouteHandler, r = req('http://localhost/v1/x', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'FT' }),
})) => patchRoute(handler)(r, noParams);

describe('getRoute', () => {
  it('wraps collection output in the uniform envelope + headers', async () => {
    const res = await run(async () => ({
      kind: 'collection',
      data: [{ a: 1 }],
      pagination: { page: 1, pageSize: 20, total: 1 },
    }));
    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toMatch(/^req_/);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('etag')).toBeTruthy();
    const body = await res.json();
    expect(body).toMatchObject({ data: [{ a: 1 }], meta: { apiVersion: 'v1' } });
    expect(body.meta.pagination.total).toBe(1);
  });

  it('returns 304 when If-None-Match matches', async () => {
    // Stable updatedAt -> stable body -> stable ETag (a `now` default would never 304).
    const handler: RouteHandler = async () => ({
      kind: 'resource',
      data: { x: 1 },
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    const first = await run(handler);
    const etag = first.headers.get('etag') as string;
    const second = await run(handler, req('http://localhost/v1/x', { headers: { 'if-none-match': etag } }));
    expect(second.status).toBe(304);
  });

  it('maps ApiError to its code/status with a requestId', async () => {
    const res = await run(async () => {
      throw new ApiError('RESOURCE_NOT_FOUND', 'nope');
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('RESOURCE_NOT_FOUND');
    expect(body.error.requestId).toMatch(/^req_/);
  });

  it('maps ZodError to 400 INVALID_QUERY_PARAMETER', async () => {
    const res = await run(async () => {
      z.object({ n: z.coerce.number() }).parse({ n: 'abc' });
      return { kind: 'resource', data: {} };
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('INVALID_QUERY_PARAMETER');
  });

  it('hides unknown errors behind a generic 500', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await run(async () => {
      throw new Error('secret stack detail');
    });
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(body.error.message).not.toContain('secret');
    spy.mockRestore();
  });
});

describe('patchRoute', () => {
  it('wraps resource output without an etag', async () => {
    const res = await runPatch(async () => ({
      kind: 'resource',
      data: { id: 'm1', status: 'FT' },
      updatedAt: '2026-06-24T00:00:00.000Z',
    }));
    expect(res.status).toBe(200);
    expect(res.headers.get('etag')).toBeNull();
    expect(res.headers.get('cache-control')).toContain('no-store');
    const body = await res.json();
    expect(body).toMatchObject({ data: { id: 'm1', status: 'FT' }, meta: { apiVersion: 'v1' } });
  });

  it('maps invalid json to INVALID_REQUEST_BODY', async () => {
    const res = await patchRoute(async () => ({ kind: 'resource', data: {} }))(
      req('http://localhost/v1/x', { method: 'PATCH', body: 'not-json' }),
      noParams,
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('INVALID_REQUEST_BODY');
  });
});

describe('deleteRoute', () => {
  it('returns 204 with no body on success', async () => {
    const res = await deleteRoute(async () => {})(req('http://localhost/v1/x', { method: 'DELETE' }), noParams);
    expect(res.status).toBe(204);
    expect(res.headers.get('x-request-id')).toMatch(/^req_/);
    expect(await res.text()).toBe('');
  });

  it('maps ApiError to the uniform error envelope', async () => {
    const res = await deleteRoute(async () => {
      throw new ApiError('RESOURCE_NOT_FOUND', 'Match not found.');
    })(req('http://localhost/v1/x', { method: 'DELETE' }), noParams);
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('RESOURCE_NOT_FOUND');
  });
});

describe('optionsRoute', () => {
  it('answers preflight with 204 + CORS', async () => {
    const res = await optionsRoute()(req() as never);
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-methods')).toContain('GET');
    expect(res.headers.get('access-control-allow-methods')).toContain('PATCH');
    expect(res.headers.get('access-control-allow-methods')).toContain('DELETE');
  });
});
