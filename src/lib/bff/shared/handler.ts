import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { ApiError, httpStatusForCode, type ErrorCode } from '@/lib/api/errors';
import { applyCorsHeaders } from '@/lib/api/cors';
import { newRequestId } from '@/lib/api/request-id';
import { CACHE, type CachePolicy } from '@/lib/api/cache';
import {
  buildApiSportsBody,
  buildApiSportsError,
  buildNflApiSportsBody,
  buildNflApiSportsError,
  searchParamsToParameters,
} from './responses';

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
  parameters?: Record<string, unknown> | unknown[];
  paging?: { current: number; total: number };
}

export type BffRouteHandler = (ctx: BffRouteContext) => Promise<BffRouteOutput>;

export interface BffWriteContext extends BffRouteContext {
  body: unknown;
}

export interface BffWriteOutput extends BffRouteOutput {
  status?: number;
}

export type BffWriteHandler = (ctx: BffWriteContext) => Promise<BffWriteOutput>;

type EnvelopeKind = 'soccer' | 'nfl';

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
  if (code === 'INVALID_REQUEST_BODY') return 'parameters';
  if (code === 'RESOURCE_NOT_FOUND') return 'resource';
  if (code === 'DATA_SOURCE_NOT_CONFIGURED') return 'service';
  return 'error';
}

function buildEnvelope(
  kind: EnvelopeKind,
  get: string | undefined,
  parameters: Record<string, unknown> | unknown[],
  response: unknown[],
  errors?: unknown[] | Record<string, string>,
  paging?: { current: number; total: number },
) {
  if (kind === 'nfl' && get) {
    return buildNflApiSportsBody(get, parameters, response, errors ?? [], paging);
  }
  return buildApiSportsBody(response, (errors as Record<string, string>) ?? {});
}

function buildEnvelopeError(
  kind: EnvelopeKind,
  get: string | undefined,
  parameters: Record<string, unknown> | unknown[],
  message: string,
  field: string,
) {
  if (kind === 'nfl' && get) {
    return buildNflApiSportsError(get, parameters, message, field);
  }
  return buildApiSportsError(message, field);
}

function buildErrorResponse(
  kind: EnvelopeKind,
  get: string | undefined,
  parameters: Record<string, unknown> | unknown[],
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
    message = err.issues[0]?.message ?? 'One or more parameters are invalid.';
  } else {
    code = 'INTERNAL_SERVER_ERROR';
    message = 'An unexpected error occurred.';
    console.error(`[${requestId}] BFF unhandled error:`, err);
  }

  const body = buildEnvelopeError(kind, get, parameters, message, errorFieldForCode(code));
  const headers = baseHeaders(requestId, origin);
  headers.set('Cache-Control', CACHE.none);
  return new NextResponse(JSON.stringify(body), {
    status: httpStatusForCode(code),
    headers,
  });
}

async function parseJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError('INVALID_REQUEST_BODY', 'Request body must be valid JSON.');
  }
}

function createRouteResponder(kind: EnvelopeKind, get?: string) {
  return function respond(
    out: BffRouteOutput,
    parameters: Record<string, unknown> | unknown[],
    request: NextRequest,
    requestId: string,
    origin: string | null,
  ): NextResponse {
    const body = buildEnvelope(kind, get, parameters, out.response, [], out.paging);
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
  };
}

export function createBffGetRoute(kind: EnvelopeKind, get?: string) {
  const respond = createRouteResponder(kind, get);

  return function bffGetRoute(handler: BffRouteHandler) {
    return async function GET(
      request: NextRequest,
      ctx: { params: Promise<Record<string, string>> },
    ): Promise<NextResponse> {
      const requestId = newRequestId();
      const origin = request.headers.get('origin');

      try {
        const params = ctx?.params ? await ctx.params : {};
        const searchParams = new URL(request.url).searchParams;
        const parameters = searchParamsToParameters(searchParams);
        const out = await handler({ request, params, searchParams, requestId });
        const resolvedParameters = out.parameters ?? parameters;
        return respond(out, resolvedParameters, request, requestId, origin);
      } catch (err) {
        const searchParams = new URL(request.url).searchParams;
        return buildErrorResponse(
          kind,
          get,
          searchParamsToParameters(searchParams),
          err,
          requestId,
          origin,
        );
      }
    };
  };
}

export function createBffWriteRoute(
  kind: EnvelopeKind,
  get: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  defaultStatus: number,
) {
  const respond = createRouteResponder(kind, get);

  return function bffWriteRoute(handler: BffWriteHandler) {
    return async function routeHandler(
      request: NextRequest,
      ctx: { params: Promise<Record<string, string>> },
    ): Promise<NextResponse> {
      const requestId = newRequestId();
      const origin = request.headers.get('origin');
      const searchParams = new URL(request.url).searchParams;
      const parameters = searchParamsToParameters(searchParams);

      try {
        const params = ctx?.params ? await ctx.params : {};
        const body = method === 'DELETE' ? undefined : await parseJsonBody(request);
        const out = await handler({ request, params, searchParams, requestId, body });
        const status = out.status ?? defaultStatus;

        if (status === 204) {
          const headers = baseHeaders(requestId, origin);
          headers.set('Cache-Control', CACHE.none);
          return new NextResponse(null, { status: 204, headers });
        }

        return respond(
          { ...out, status: status === 201 ? 201 : 200 },
          out.parameters ?? parameters,
          request,
          requestId,
          origin,
        );
      } catch (err) {
        return buildErrorResponse(kind, get, parameters, err, requestId, origin);
      }
    };
  };
}

export function bffOptionsRoute() {
  return async function OPTIONS(request: NextRequest): Promise<NextResponse> {
    const headers = baseHeaders(newRequestId(), request.headers.get('origin'));
    return new NextResponse(null, { status: 204, headers });
  };
}

/** Soccer BFF GET wrapper (reduced envelope). */
export const bffGetRoute = createBffGetRoute('soccer');

/** NFL BFF route factories (full api-sports envelope). */
export function nflBffGetRoute(get: string) {
  return createBffGetRoute('nfl', get);
}

export function nflBffPostRoute(get: string) {
  return createBffWriteRoute('nfl', get, 'POST', 201);
}

export function nflBffPatchRoute(get: string) {
  return createBffWriteRoute('nfl', get, 'PATCH', 200);
}

export function nflBffDeleteRoute(get: string) {
  return createBffWriteRoute('nfl', get, 'DELETE', 204);
}
