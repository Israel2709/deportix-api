import { z } from 'zod';
import { ApiError } from './errors';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export interface PaginationInput {
  page: number;
  pageSize: number;
}

/** Parse and clamp `?page` / `?pageSize` (Zod throws -> 400 INVALID_QUERY_PARAMETER). */
export function parsePagination(searchParams: URLSearchParams): PaginationInput {
  return paginationSchema.parse({
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
  });
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate a date query param. Accepts `YYYY-MM-DD` or a full ISO-8601 timestamp.
 * Dates are interpreted in UTC throughout the API.
 */
export function parseDateParam(value: string | null, paramName: string): string | undefined {
  if (value == null || value === '') return undefined;
  const isValid = DATE_ONLY.test(value) || !Number.isNaN(Date.parse(value));
  if (!isValid) {
    throw new ApiError(
      'INVALID_QUERY_PARAMETER',
      `The "${paramName}" parameter must be a valid date (YYYY-MM-DD or ISO-8601, UTC).`,
    );
  }
  return value;
}

/** Validate `?season=` as a 4-digit year. */
export function parseSeasonParam(value: string | null): number | undefined {
  if (value == null || value === '') return undefined;
  const year = Number(value);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new ApiError(
      'INVALID_QUERY_PARAMETER',
      'The "season" parameter must be a 4-digit year (e.g. 2026).',
    );
  }
  return year;
}

export interface SortSpec {
  field: string;
  direction: 'asc' | 'desc';
}

/** Parse `?sort=field` / `?sort=-field` against a whitelist of sortable fields. */
export function parseSort(
  value: string | null,
  allowed: readonly string[],
  fallback: SortSpec,
): SortSpec {
  if (!value) return fallback;
  const direction = value.startsWith('-') ? 'desc' : 'asc';
  const field = value.startsWith('-') ? value.slice(1) : value;
  if (!allowed.includes(field)) {
    throw new ApiError(
      'INVALID_QUERY_PARAMETER',
      `The "sort" parameter must be one of: ${allowed.join(', ')} (prefix with "-" for descending order).`,
    );
  }
  return { field, direction };
}

/** Validate a query param against an allowed set of string values. */
export function parseEnumParam(
  value: string | null,
  allowed: readonly string[],
  paramName: string,
): string | undefined {
  if (value == null || value === '') return undefined;
  if (!allowed.includes(value)) {
    throw new ApiError(
      'INVALID_QUERY_PARAMETER',
      `The "${paramName}" parameter must be one of: ${allowed.join(', ')}.`,
    );
  }
  return value;
}

/** Read an opaque string param (e.g. an id filter) or `undefined` when absent. */
export function parseStringParam(value: string | null): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/** Slice a fully-fetched array for in-memory pagination fallbacks. */
export function paginateArray<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
