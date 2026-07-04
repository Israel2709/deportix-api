import { describe, expect, it, vi } from 'vitest';

const save = vi.fn().mockResolvedValue(undefined);
const makePublic = vi.fn().mockResolvedValue(undefined);

vi.mock('firebase-admin/storage', () => ({
  getStorage: () => ({
    bucket: () => ({
      file: () => ({ save, makePublic }),
    }),
  }),
}));

vi.mock('firebase-admin/app', () => ({
  getApps: () => [{ name: 'test' }],
}));

vi.mock('@/lib/firebase/admin', () => ({
  getDb: vi.fn(),
  isDataSourceConfigured: () => true,
  readCredentialsForStorage: () => ({
    projectId: 'deportix',
    clientEmail: 'test@deportix.iam.gserviceaccount.com',
    privateKey: 'key',
  }),
}));

const { uploadImage } = await import('@/lib/firebase/storage');

describe('uploadImage', () => {
  it('uploads to Firebase Storage and returns public URL', async () => {
    const url = await uploadImage({
      buffer: Buffer.from([137, 80, 78, 71]),
      contentType: 'image/png',
      purpose: 'league_logo',
      entityId: '1',
    });
    expect(save).toHaveBeenCalledOnce();
    expect(makePublic).toHaveBeenCalledOnce();
    expect(url).toMatch(/^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/deportix\.appspot\.com\/o\/uploads%2Fleague_logo%2F1%2F/);
  });
});
