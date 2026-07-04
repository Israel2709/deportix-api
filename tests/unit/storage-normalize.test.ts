import { describe, expect, it } from 'vitest';
import { normalizeImageContentType } from '@/lib/firebase/storage';

describe('normalizeImageContentType', () => {
  it('maps image/jpg to image/jpeg', () => {
    expect(normalizeImageContentType('image/jpg', Buffer.from([]))).toBe('image/jpeg');
  });

  it('sniffs JPEG from magic bytes when type is empty', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(normalizeImageContentType('', jpeg)).toBe('image/jpeg');
    expect(normalizeImageContentType('application/octet-stream', jpeg)).toBe('image/jpeg');
  });

  it('sniffs PNG from magic bytes', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(normalizeImageContentType('', png)).toBe('image/png');
  });
});
