import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { ApiError, httpStatusForCode, invalidRequestBody, type ErrorCode } from './errors';
import { applyCorsHeaders } from './cors';
import { newRequestId } from './request-id';
import { CACHE, type CachePolicy } from './cache';
import {
  buildCollectionBody,
  buildErrorBody,
  buildResourceBody,
  type Pagination,
} from './responses';

export interface RouteContext {
  request: NextRequest;
  params: Record<string, string>;
  searchParams: URLSearchParams;
  requestId: string;
}

export interface PatchRouteContext extends RouteContext {
  body: unknown;
}

export type RouteOutput =
  | {
      kind: 'collection';
      data: unknown[];
      pagination: Pagination;
      updatedAt?: string | null;
      cache?: CachePolicy;
    }
  | { kind: 'resource'; data: unknown; updatedAt?: string | null; cache?: CachePolicy }
  | { kind: 'raw'; body: unknown; status?: number; cache?: CachePolicy };

export type RouteHandler = (ctx: RouteContext) => Promise<RouteOutput>;
export type PatchRouteHandler = (ctx: PatchRouteContext) => Promise<RouteOutput>;
export type DeleteRouteHandler = (ctx: RouteContext) => Promise<void>;

type NextRouteArgs = { params: Promise<Record<string, string>> };

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

export function buildErrorResponse(
  err: unknown,
  requestId: string,
  origin: string | null,
): NextResponse {
  let code: ErrorCode;
  let message: string;
  let details: unknown;

  if (err instanceof ApiError) {
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    code = 'INVALID_QUERY_PARAMETER';
    message = err.issues[0]?.message ?? 'One or more query parameters are invalid.';
    details = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  } else {
    code = 'INTERNAL_SERVER_ERROR';
    message = 'An unexpected error occurred.';
    // Never leak internal error details to clients; log server-side for debugging.
    console.error(`[${requestId}] Unhandled error:`, err);
  }

  const headers = baseHeaders(requestId, origin);
  headers.set('Cache-Control', CACHE.none);
  return new NextResponse(JSON.stringify(buildErrorBody(code, message, requestId, details)), {
    status: httpStatusForCode(code),
    headers,
  });
}

/**
 * Wraps a route handler with all cross-cutting concerns: request id, CORS, uniform
 * envelopes, weak ETag + conditional `304`, cache headers, and error translation.
 */
export function getRoute(handler: RouteHandler) {
  return async function GET(request: NextRequest, ctx: NextRouteArgs): Promise<NextResponse> {
    const requestId = newRequestId();
    const origin = request.headers.get('origin');

    try {
      const params = ctx?.params ? await ctx.params : {};
      const searchParams = new URL(request.url).searchParams;
      const out = await handler({ request, params, searchParams, requestId });

      let body: unknown;
      let cache: CachePolicy;
      let status = 200;

      if (out.kind === 'collection') {
        body = buildCollectionBody(out.data, out.pagination, out.updatedAt ?? null);
        cache = out.cache ?? CACHE.standard;
      } else if (out.kind === 'resource') {
        body = buildResourceBody(out.data, out.updatedAt ?? null);
        cache = out.cache ?? CACHE.standard;
      } else {
        body = out.body;
        cache = out.cache ?? CACHE.none;
        status = out.status ?? 200;
      }

      const payload = JSON.stringify(body);
      const etag = weakEtag(payload);
      const headers = baseHeaders(requestId, origin);
      headers.set('Cache-Control', cache);
      headers.set('ETag', etag);

      if (status === 200 && request.headers.get('if-none-match') === etag) {
        return new NextResponse(null, { status: 304, headers });
      }

      return new NextResponse(payload, { status, headers });
    } catch (err) {
      return buildErrorResponse(err, requestId, origin);
    }
  };
}

/**
 * Wraps a POST handler. Returns `201 Created` for resource responses.
 */
export function postRoute(handler: PatchRouteHandler) {
  return async function POST(request: NextRequest, ctx: NextRouteArgs): Promise<NextResponse> {
    const requestId = newRequestId();
    const origin = request.headers.get('origin');

    try {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw invalidRequestBody('Request body must be valid JSON.');
      }

      const params = ctx?.params ? await ctx.params : {};
      const searchParams = new URL(request.url).searchParams;
      const out = await handler({ request, params, searchParams, requestId, body });

      let responseBody: unknown;
      let cache: CachePolicy;
      let status = 201;

      if (out.kind === 'collection') {
        responseBody = buildCollectionBody(out.data, out.pagination, out.updatedAt ?? null);
        cache = out.cache ?? CACHE.none;
        status = 200;
      } else if (out.kind === 'resource') {
        responseBody = buildResourceBody(out.data, out.updatedAt ?? null);
        cache = out.cache ?? CACHE.none;
        status = 201;
      } else {
        responseBody = out.body;
        cache = out.cache ?? CACHE.none;
        status = out.status ?? 201;
      }

      const headers = baseHeaders(requestId, origin);
      headers.set('Cache-Control', cache);
      return new NextResponse(JSON.stringify(responseBody), { status, headers });
    } catch (err) {
      return buildErrorResponse(err, requestId, origin);
    }
  };
}

/**
 * Wraps a PATCH handler with the same cross-cutting concerns as `getRoute`, but parses a JSON
 * request body and skips ETag / conditional GET handling.
 */
export function patchRoute(handler: PatchRouteHandler) {
  return async function PATCH(request: NextRequest, ctx: NextRouteArgs): Promise<NextResponse> {
    const requestId = newRequestId();
    const origin = request.headers.get('origin');

    try {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw invalidRequestBody('Request body must be valid JSON.');
      }

      const params = ctx?.params ? await ctx.params : {};
      const searchParams = new URL(request.url).searchParams;
      const out = await handler({ request, params, searchParams, requestId, body });

      let responseBody: unknown;
      let cache: CachePolicy;
      let status = 200;

      if (out.kind === 'collection') {
        responseBody = buildCollectionBody(out.data, out.pagination, out.updatedAt ?? null);
        cache = out.cache ?? CACHE.none;
      } else if (out.kind === 'resource') {
        responseBody = buildResourceBody(out.data, out.updatedAt ?? null);
        cache = out.cache ?? CACHE.none;
      } else {
        responseBody = out.body;
        cache = out.cache ?? CACHE.none;
        status = out.status ?? 200;
      }

      const headers = baseHeaders(requestId, origin);
      headers.set('Cache-Control', cache);
      return new NextResponse(JSON.stringify(responseBody), { status, headers });
    } catch (err) {
      return buildErrorResponse(err, requestId, origin);
    }
  };
}

/**
 * Wraps a DELETE handler. Returns `204 No Content` on success (no response body).
 */
export function deleteRoute(handler: DeleteRouteHandler) {
  return async function DELETE(request: NextRequest, ctx: NextRouteArgs): Promise<NextResponse> {
    const requestId = newRequestId();
    const origin = request.headers.get('origin');

    try {
      const params = ctx?.params ? await ctx.params : {};
      const searchParams = new URL(request.url).searchParams;
      await handler({ request, params, searchParams, requestId });

      const headers = new Headers();
      headers.set('X-Request-Id', requestId);
      applyCorsHeaders(headers, origin);
      headers.set('Cache-Control', CACHE.none);
      return new NextResponse(null, { status: 204, headers });
    } catch (err) {
      return buildErrorResponse(err, requestId, origin);
    }
  };
}

/** Shared CORS preflight handler for `OPTIONS` on any `/v1` route. */
export function optionsRoute() {
  return async function OPTIONS(request: NextRequest): Promise<NextResponse> {
    const headers = new Headers();
    applyCorsHeaders(headers, request.headers.get('origin'));
    return new NextResponse(null, { status: 204, headers });
  };
}
