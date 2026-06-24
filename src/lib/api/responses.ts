import type { ErrorCode } from './errors';

export const API_VERSION = 'v1';

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface CollectionMeta {
  apiVersion: string;
  updatedAt: string;
  pagination: Pagination;
}

export interface ResourceMeta {
  apiVersion: string;
  updatedAt: string;
}

export interface CollectionBody<T> {
  data: T[];
  meta: CollectionMeta;
}

export interface ResourceBody<T> {
  data: T;
  meta: ResourceMeta;
}

export interface ErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    requestId: string;
    details?: unknown;
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

export function buildCollectionBody<T>(
  data: T[],
  pagination: Pagination,
  updatedAt: string | null,
): CollectionBody<T> {
  return {
    data,
    meta: { apiVersion: API_VERSION, updatedAt: updatedAt ?? nowIso(), pagination },
  };
}

export function buildResourceBody<T>(data: T, updatedAt: string | null): ResourceBody<T> {
  return {
    data,
    meta: { apiVersion: API_VERSION, updatedAt: updatedAt ?? nowIso() },
  };
}

export function buildErrorBody(
  code: ErrorCode,
  message: string,
  requestId: string,
  details?: unknown,
): ErrorBody {
  return {
    error: {
      code,
      message,
      requestId,
      ...(details !== undefined ? { details } : {}),
    },
  };
}
