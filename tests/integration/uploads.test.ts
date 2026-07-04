import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/firebase/storage', () => ({
  uploadImage: vi.fn(async () => 'https://firebasestorage.googleapis.com/v0/b/test/o/logo.png?alt=media'),
}));

const { POST, OPTIONS } = await import('../../app/v1/uploads/route');

function multipartRequest(fields: Record<string, Blob | string>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }
  return new Request('http://localhost/v1/uploads', { method: 'POST', body: form });
}

describe('POST /v1/uploads', () => {
  it('returns 201 with public URL on success', async () => {
    const png = new Blob([Uint8Array.from([137, 80, 78, 71])], { type: 'image/png' });
    const res = await POST(
      multipartRequest({
        file: new File([png], 'logo.png', { type: 'image/png' }),
        purpose: 'league_logo',
        entityId: '1',
      }) as never,
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.url).toContain('firebasestorage.googleapis.com');
    expect(body.meta.apiVersion).toBe('v1');
  });

  it('returns 400 when file is missing', async () => {
    const res = await POST(multipartRequest({ purpose: 'league_logo' }) as never);
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('INVALID_REQUEST_BODY');
  });

  it('answers OPTIONS with CORS', async () => {
    const res = await OPTIONS(new Request('http://localhost/v1/uploads', { method: 'OPTIONS' }) as never);
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });
});
