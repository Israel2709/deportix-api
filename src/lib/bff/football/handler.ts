import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { ApiError, httpStatusForCode, type ErrorCode } from '@/lib/api/errors';
import { applyCorsHeaders } from '@/lib/api/cors';
import { newRequestId } from '@/lib/api/request-id';
import { CACHE, type CachePolicy } from '@/lib/api/cache';
import { buildApiSportsBody, buildApiSportsError } from './responses';

export interface BffRouteContext {
  request: NextRequest;
  params: Record<string, string>;
  searchParams: URLSearchParams;
  requestId: string;
}

export interface BffRouteOutput {
  response: unknown[];
  cache?: CachePolicy;
  status?: number;
}

export type BffRouteHandler = (ctx: BffRouteContext) => Promise<BffRouteOutput>;

function weakEtag(payload: string): string {
  const hash = createHash('sha1').update(payload).digest('base64');
  return `W/"${hash}"`;
}

function baseHeaders(requestId: string, origin: string | null): Headers {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('X-Request-Id', requestId);
  applyCorsHeaders(headers, origin);
  return headers;
}

function errorFieldForCode(code: ErrorCode): string {
  if (code === 'INVALID_QUERY_PARAMETER') return 'parameters';
  if (code === 'RESOURCE_NOT_FOUND') return 'resource';
  if (code === 'DATA_SOURCE_NOT_CONFIGURED') return 'service';
  return 'error';
}

function buildErrorResponse(
  err: unknown,
  requestId: string,
  origin: string | null,
): NextResponse {
  let code: ErrorCode;
  let message: string;

  if (err instanceof ApiError) {
    code = err.code;
    message = err.message;
  } else if (err instanceof ZodError) {
    code = 'INVALID_QUERY_PARAMETER';
    message = err.issues[0]?.message ?? 'One or more query parameters are invalid.';
  } else {
    code = 'INTERNAL_SERVER_ERROR';
    message = 'An unexpected error occurred.';
    console.error(`[${requestId}] BFF unhandled error:`, err);
  }

  const body = buildApiSportsError(message, errorFieldForCode(code));
  const headers = baseHeaders(requestId, origin);
  headers.set('Cache-Control', CACHE.none);
  return new NextResponse(JSON.stringify(body), {
    status: httpStatusForCode(code),
    headers,
  });
}

/** Wraps a BFF route with CORS, ETag, and the API-Sports response envelope. */
export function bffGetRoute(handler: BffRouteHandler) {
  return async function GET(request: NextRequest, ctx: { params: Promise<Record<string, string>> }): Promise<NextResponse> {
    const requestId = newRequestId();
    const origin = request.headers.get('origin');

    try {
      const params = ctx?.params ? await ctx.params : {};
      const searchParams = new URL(request.url).searchParams;
      const out = await handler({ request, params, searchParams, requestId });

      const body = buildApiSportsBody(out.response);
      const payload = JSON.stringify(body);
      const etag = weakEtag(payload);
      const headers = baseHeaders(requestId, origin);
      headers.set('Cache-Control', out.cache ?? CACHE.standard);
      headers.set('ETag', etag);

      const status = out.status ?? 200;
      if (status === 200 && request.headers.get('if-none-match') === etag) {
        return new NextResponse(null, { status: 304, headers });
      }

      return new NextResponse(payload, { status, headers });
    } catch (err) {
      return buildErrorResponse(err, requestId, origin);
    }
  };
}

export function bffOptionsRoute() {
  return async function OPTIONS(request: NextRequest): Promise<NextResponse> {
    const headers = baseHeaders(newRequestId(), request.headers.get('origin'));
    return new NextResponse(null, { status: 204, headers });
  };
}
