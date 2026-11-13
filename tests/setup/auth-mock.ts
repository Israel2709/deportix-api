import { beforeEach, vi } from 'vitest';

/** Accepted by the mocked Admin Auth verifier in unit/integration tests. */
export const TEST_ID_TOKEN = 'test-id-token';

export const testAuthHeaders = {
  Authorization: `Bearer ${TEST_ID_TOKEN}`,
} as const;

const verifyIdToken = vi.fn(async (token: string) => {
  if (token !== TEST_ID_TOKEN) {
    throw new Error('invalid test token');
  }
  return { uid: 'test-user', email: 'test@deportix.local' };
});

const getAdminAuth = vi.fn(() => ({ verifyIdToken }));

vi.mock('@/lib/firebase/admin', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/firebase/admin')>();
  return {
    ...actual,
    getAdminAuth: () => getAdminAuth(),
  };
});

beforeEach(() => {
  verifyIdToken.mockImplementation(async (token: string) => {
    if (token !== TEST_ID_TOKEN) {
      throw new Error('invalid test token');
    }
    return { uid: 'test-user', email: 'test@deportix.local' };
  });
  getAdminAuth.mockImplementation(() => ({ verifyIdToken }));
});

export { getAdminAuth, verifyIdToken };
