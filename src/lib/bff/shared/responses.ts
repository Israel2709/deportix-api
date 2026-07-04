/** API-Sports compatible response envelopes for BFF routes. */

import type { AmericanFootballApiSportsBody, AmericanFootballPaging } from '@/lib/bff/american-football/schemas/envelope.schema';

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

function defaultPaging(): AmericanFootballPaging {
  return { current: 1, total: 1 };
}

export function searchParamsToParameters(searchParams: URLSearchParams): Record<string, string> {
  const parameters: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    parameters[key] = value;
  }
  return parameters;
}

/** Full American Football api-sports envelope (`get`, `parameters`, `paging`, …). */
export function buildAmericanFootballApiSportsBody<T>(
  get: string,
  parameters: Record<string, unknown> | unknown[],
  response: T[],
  errors: unknown[] | Record<string, string> = [],
  paging?: AmericanFootballPaging,
): AmericanFootballApiSportsBody<T> {
  return {
    get,
    parameters,
    errors,
    results: response.length,
    paging: paging ?? defaultPaging(),
    response,
  };
}

export function buildAmericanFootballApiSportsError(
  get: string,
  parameters: Record<string, unknown> | unknown[],
  message: string,
  field = 'parameters',
): AmericanFootballApiSportsBody<never> {
  return buildAmericanFootballApiSportsBody(get, parameters, [], { [field]: message });
}
