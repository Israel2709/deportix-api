/**
 * Cache-Control policies. Tuned so that manual Firestore edits surface quickly while
 * still letting Vercel's edge/CDN absorb repeated reads.
 *
 * `max-age=0` keeps the *browser* from caching (so a manual data load is visible on
 * refresh), while `s-maxage` lets the shared CDN serve a cached copy, and
 * `stale-while-revalidate` avoids a latency cliff when the CDN copy expires.
 */
export const CACHE = {
  /** Health/meta endpoints — never cache. */
  none: 'no-store',
  /** Fast-moving data (matches, live status). Short shared TTL. */
  dynamic: 'public, max-age=0, s-maxage=30, stale-while-revalidate=60',
  /** Lists that change a few times a day (leagues, teams, standings, data-status). */
  standard: 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
  /** Rarely-changing reference data (sports, OpenAPI). */
  reference: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
} as const;

export type CachePolicy = (typeof CACHE)[keyof typeof CACHE];
