import { beforeEach, vi } from 'vitest';

/** Accepted by the mocked Admin Auth verifier in unit/integration tests. */
export const TEST_ID_TOKEN = 'test-id-token';

export const testAuthHeaders = {
  Authorization: `Bearer ${TEST_ID_TOKEN}`,
} as const;

const verifyFirebaseIdToken = vi.fn(async (token: string) => {
  if (token !== TEST_ID_TOKEN) {
    throw new Error('invalid test token');
  }
  return { uid: 'test-user', email: 'test@deportix.local', payload: {} };
});

vi.mock('@/lib/firebase/admin', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/firebase/admin')>();
  return {
    ...actual,
    verifyFirebaseIdToken: (...args: Parameters<typeof verifyFirebaseIdToken>) =>
      verifyFirebaseIdToken(...args),
  };
});

beforeEach(() => {
  verifyFirebaseIdToken.mockImplementation(async (token: string) => {
    if (token !== TEST_ID_TOKEN) {
      throw new Error('invalid test token');
    }
    return { uid: 'test-user', email: 'test@deportix.local', payload: {} };
  });
});

/** @deprecated alias kept for existing test imports */
const verifyIdToken = verifyFirebaseIdToken;
/** @deprecated alias kept for existing test imports */
const getAdminAuth = vi.fn(() => ({ verifyIdToken: verifyFirebaseIdToken }));

export { getAdminAuth, verifyIdToken, verifyFirebaseIdToken };
