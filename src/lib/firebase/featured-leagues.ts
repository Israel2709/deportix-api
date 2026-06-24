/**
 * Controlled configuration of "featured" leagues highlighted by `GET /v1/data-status`.
 *
 * WHY A CONFIG: the platform holds 1200+ leagues. Deriving per-league coverage for all of
 * them on every request is impractical (fan-out of count() queries) and unhelpful. So
 * data-status reports (a) a derived sport-level summary for every sport, plus (b) per-league
 * coverage for this curated set. Coverage itself is always DERIVED from real Firestore
 * counts — only the *selection* of leagues to highlight is configured here.
 *
 * MAINTENANCE: leagues are identified by their stable provider `external_id` (resilient to
 * Firestore document-id changes). Add/remove ids here; no code changes required. The first
 * entries reflect the MVP focus (Liga MX) plus a few data-rich leagues for demonstration.
 */
export const FEATURED_LEAGUE_EXTERNAL_IDS: readonly string[] = [
  '262', // Liga MX (MVP focus) — season metadata only at time of writing
  '128', // Liga Profesional Argentina — teams + matches + standings
  '61', // Ligue 1 — matches + standings
  '71', // Serie A (Brazil) — matches + standings
  '253', // Major League Soccer
];
