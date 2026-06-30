/** API-Sports compatible response envelope consumed by the Flutter app. */

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
