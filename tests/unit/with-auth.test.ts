import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import { assertAuthenticated } from '@/lib/api/assert-authenticated';
import { withAuth } from '@/lib/api/with-auth';
import { getAdminAuth, verifyIdToken } from '../setup/auth-mock';

function mockRequest(method: string, authorization?: string): Request {
  const headers = new Headers();
  if (authorization) headers.set('authorization', authorization);
  return new Request('https://api.example.com/v1/countries', {
    method,
    headers,
  });
}

describe('assertAuthenticated', () => {
  it('rejects missing bearer token', async () => {
    await expect(
      assertAuthenticated(mockRequest('POST') as never),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('rejects invalid bearer token', async () => {
    await expect(
      assertAuthenticated(mockRequest('POST', 'Bearer bad') as never),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('returns uid/email for a valid token', async () => {
    await expect(
      assertAuthenticated(mockRequest('POST', 'Bearer test-id-token') as never),
    ).resolves.toEqual({ uid: 'test-user', email: 'test@deportix.local' });
  });

  it('rethrows DATA_SOURCE_NOT_CONFIGURED', async () => {
    getAdminAuth.mockImplementationOnce(() => {
      throw new ApiError('DATA_SOURCE_NOT_CONFIGURED', 'missing creds');
    });

    await expect(
      assertAuthenticated(mockRequest('POST', 'Bearer test-id-token') as never),
    ).rejects.toMatchObject({ code: 'DATA_SOURCE_NOT_CONFIGURED' });
  });
});

describe('withAuth', () => {
  it('allows GET without a token', async () => {
    verifyIdToken.mockClear();
    const handler = vi.fn(async () => 'ok');
    const wrapped = withAuth(handler);
    const ctx = {
      request: mockRequest('GET') as never,
    };

    await expect(wrapped(ctx)).resolves.toBe('ok');
    expect(handler).toHaveBeenCalledOnce();
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('requires a token for POST', async () => {
    const handler = vi.fn(async () => 'ok');
    const wrapped = withAuth(handler);
    const ctx = {
      request: mockRequest('POST') as never,
    };

    await expect(wrapped(ctx)).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(handler).not.toHaveBeenCalled();
  });
});
