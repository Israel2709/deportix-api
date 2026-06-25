/**
 * Canonical error codes for the public API. Every error response uses one of these
 * stable codes so consumers can branch on `error.code` rather than HTTP status alone.
 */
export const ERROR_CODES = {
  INVALID_QUERY_PARAMETER: 'INVALID_QUERY_PARAMETER',
  INVALID_REQUEST_BODY: 'INVALID_REQUEST_BODY',
  INVALID_PATH_PARAMETER: 'INVALID_PATH_PARAMETER',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DATA_NOT_AVAILABLE: 'DATA_NOT_AVAILABLE',
  DATA_SOURCE_NOT_CONFIGURED: 'DATA_SOURCE_NOT_CONFIGURED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  INVALID_QUERY_PARAMETER: 400,
  INVALID_REQUEST_BODY: 400,
  INVALID_PATH_PARAMETER: 400,
  RESOURCE_NOT_FOUND: 404,
  // The resource type is recognized but no backing data exists for it (e.g. a sport
  // that does not model standings, or a sub-resource not yet loaded for this entity).
  DATA_NOT_AVAILABLE: 404,
  // Firebase Admin credentials are not configured on the server.
  DATA_SOURCE_NOT_CONFIGURED: 503,
  INTERNAL_SERVER_ERROR: 500,
};

export function httpStatusForCode(code: ErrorCode): number {
  return STATUS_BY_CODE[code];
}

/**
 * Typed application error. Thrown anywhere in a route/repository and translated into
 * the uniform error envelope by the central route handler.
 */
export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export function notFound(message = 'The requested resource was not found.'): ApiError {
  return new ApiError('RESOURCE_NOT_FOUND', message);
}

export function invalidPathParameter(message: string, details?: unknown): ApiError {
  return new ApiError('INVALID_PATH_PARAMETER', message, details);
}

export function invalidRequestBody(message: string, details?: unknown): ApiError {
  return new ApiError('INVALID_REQUEST_BODY', message, details);
}

export function dataNotAvailable(message: string): ApiError {
  return new ApiError('DATA_NOT_AVAILABLE', message);
}
