import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { getRoute, optionsRoute, type RouteHandler } from '@/lib/api/handler';
import { ApiError } from '@/lib/api/errors';

function req(url = 'http://localhost/v1/x', headers?: Record<string, string>) {
  return new Request(url, { headers }) as never;
}
const noParams = { params: Promise.resolve({}) } as never;

const run = (handler: RouteHandler, r = req()) => getRoute(handler)(r, noParams);

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
    const second = await run(handler, req('http://localhost/v1/x', { 'if-none-match': etag }));
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

describe('optionsRoute', () => {
  it('answers preflight with 204 + CORS', async () => {
    const res = await optionsRoute()(req() as never);
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-methods')).toContain('GET');
  });
});
