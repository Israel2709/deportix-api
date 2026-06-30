/**
 * Prefer canonical Firestore values over denormalized provider snapshots embedded in match
 * documents (e.g. API-Sports URLs copied at ingestion time).
 */
export function preferCanonicalString(
  canonical: string | null | undefined,
  fallback: string | null | undefined,
): string | null {
  if (canonical != null && canonical.length > 0) return canonical;
  if (fallback != null && fallback.length > 0) return fallback;
  return null;
}
