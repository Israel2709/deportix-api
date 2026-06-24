/**
 * Generates a unique request identifier included in every response (`meta`/`error`
 * and the `x-request-id` header) so clients can correlate logs with support requests.
 */
export function newRequestId(): string {
  return `req_${crypto.randomUUID()}`;
}
