import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import {
  MAX_PAGE_SIZE,
  parseDateParam,
  parseEnumParam,
  parsePagination,
  parseSeasonParam,
  parseSort,
} from '@/lib/api/query-validation';
import { ApiError } from '@/lib/api/errors';

const sp = (q: string) => new URLSearchParams(q);

describe('parsePagination', () => {
  it('applies defaults', () => {
    expect(parsePagination(sp(''))).toEqual({ page: 1, pageSize: 20 });
  });
  it('coerces and clamps within bounds', () => {
    expect(parsePagination(sp('page=3&pageSize=50'))).toEqual({ page: 3, pageSize: 50 });
  });
  it('rejects pageSize over the max', () => {
    expect(() => parsePagination(sp(`pageSize=${MAX_PAGE_SIZE + 1}`))).toThrow(ZodError);
  });
  it('rejects non-numeric / zero page', () => {
    expect(() => parsePagination(sp('page=abc'))).toThrow(ZodError);
    expect(() => parsePagination(sp('page=0'))).toThrow(ZodError);
  });
});

describe('parseSeasonParam', () => {
  it('parses a 4-digit year', () => {
    expect(parseSeasonParam('2026')).toBe(2026);
  });
  it('returns undefined when absent', () => {
    expect(parseSeasonParam(null)).toBeUndefined();
    expect(parseSeasonParam('')).toBeUndefined();
  });
  it('rejects invalid years', () => {
    expect(() => parseSeasonParam('abc')).toThrow(ApiError);
    expect(() => parseSeasonParam('99')).toThrow(ApiError);
  });
});

describe('parseDateParam', () => {
  it('accepts YYYY-MM-DD and ISO datetime', () => {
    expect(parseDateParam('2026-07-01', 'from')).toBe('2026-07-01');
    expect(parseDateParam('2026-07-01T20:00:00Z', 'from')).toBe('2026-07-01T20:00:00Z');
  });
  it('rejects garbage', () => {
    expect(() => parseDateParam('not-a-date', 'date')).toThrow(ApiError);
  });
});

describe('parseSort', () => {
  it('defaults when absent', () => {
    expect(parseSort(null, ['date'], { field: 'date', direction: 'desc' })).toEqual({
      field: 'date',
      direction: 'desc',
    });
  });
  it('parses descending prefix', () => {
    expect(parseSort('-date', ['date'], { field: 'date', direction: 'asc' })).toEqual({
      field: 'date',
      direction: 'desc',
    });
  });
  it('rejects fields outside the whitelist', () => {
    expect(() => parseSort('hax', ['date'], { field: 'date', direction: 'asc' })).toThrow(ApiError);
  });
});

describe('parseEnumParam', () => {
  it('accepts allowed values and rejects others', () => {
    expect(parseEnumParam('NS', ['NS', 'FT'], 'status')).toBe('NS');
    expect(() => parseEnumParam('ZZ', ['NS', 'FT'], 'status')).toThrow(ApiError);
  });
});
