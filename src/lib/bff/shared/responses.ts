/** API-Sports compatible response envelopes for BFF routes. */

import type { NflApiSportsBody, NflPaging } from '@/lib/bff/nfl/schemas/envelope.schema';

/** Soccer BFF envelope (legacy — Flutter soccer app). */
export interface ApiSportsBody<T = unknown> {
  response: T[];
  results: number;
  errors: Record<string, string>;
}

export function buildApiSportsBody<T>(response: T[], errors: Record<string, string> = {}): ApiSportsBody<T> {
  return {
    response,
    results: response.length,
    errors,
  };
}

export function buildApiSportsError(message: string, field = 'parameters'): ApiSportsBody<never> {
  return buildApiSportsBody([], { [field]: message });
}

function defaultPaging(): NflPaging {
  return { current: 1, total: 1 };
}

export function searchParamsToParameters(searchParams: URLSearchParams): Record<string, string> {
  const parameters: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    parameters[key] = value;
  }
  return parameters;
}

/** Full NFL api-sports envelope (`get`, `parameters`, `paging`, …). */
export function buildNflApiSportsBody<T>(
  get: string,
  parameters: Record<string, unknown> | unknown[],
  response: T[],
  errors: unknown[] | Record<string, string> = [],
  paging?: NflPaging,
): NflApiSportsBody<T> {
  return {
    get,
    parameters,
    errors,
    results: response.length,
    paging: paging ?? defaultPaging(),
    response,
  };
}

export function buildNflApiSportsError(
  get: string,
  parameters: Record<string, unknown> | unknown[],
  message: string,
  field = 'parameters',
): NflApiSportsBody<never> {
  return buildNflApiSportsBody(get, parameters, [], { [field]: message });
}
