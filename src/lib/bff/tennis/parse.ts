import { invalidRequestBody } from '@/lib/api/errors';

export function parseBody<T>(
  schema: {
    safeParse: (v: unknown) => { success: true; data: T } | { success: false; error: { issues: { message?: string }[] } };
  },
  body: unknown,
  label: string,
): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw invalidRequestBody(parsed.error.issues[0]?.message ?? `Invalid ${label} body.`);
  }
  return parsed.data;
}
