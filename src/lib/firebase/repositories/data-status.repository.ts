import { asStr, serializeSeason, updatedAtOf } from '@/lib/api/serializers';
import type { LeagueCoverageDTO } from '@/lib/contracts/dto';
import { getSportConfig, isSportSlug } from '../sport-registry';
import { FEATURED_LEAGUE_EXTERNAL_IDS } from '../featured-leagues';
import { loadCatalogContext } from './catalog.repository';
import { countCollection, countWhereEq, fetchAll, fetchWhereEq, findByExternalId } from './helpers';

export interface Coverage {
  teams: boolean;
  matches: boolean;
  standings: boolean;
  statistics: boolean;
}

export interface SportSummary {
  id: string;
  slug: string | null;
  name: string | null;
  leagueCount: number;
  coverage: Coverage;
}

export interface DataStatus {
  sports: SportSummary[];
  leagues: LeagueCoverageDTO[];
}

/**
 * Data coverage derived entirely from real Firestore counts — never hardcoded.
 *
 *  - `sports`: every sport, with how many leagues it has and whether its collections hold
 *    any teams/matches/standings at all.
 *  - `leagues`: per-league coverage for the curated FEATURED list (see featured-leagues.ts),
 *    each with the seasons present and which resources are populated.
 */
export async function buildDataStatus(): Promise<DataStatus> {
  const ctx = await loadCatalogContext();
  const [sportDocs, leagueDocs] = await Promise.all([fetchAll('sports'), fetchAll('leagues')]);

  const leagueCountBySportId = new Map<string, number>();
  for (const doc of leagueDocs) {
    const sportId = asStr(doc.data.sport_id);
    if (sportId) leagueCountBySportId.set(sportId, (leagueCountBySportId.get(sportId) ?? 0) + 1);
  }

  // Sport-level coverage: do the sport's collections contain any documents?
  const sports: SportSummary[] = await Promise.all(
    sportDocs.map(async (doc) => {
      const slug = asStr(doc.data.slug);
      const config = isSportSlug(slug) ? getSportConfig(slug) : null;
      let coverage: Coverage = { teams: false, matches: false, standings: false, statistics: false };
      if (config) {
        const [teams, matches, standings] = await Promise.all([
          countCollection(config.collections.teams).catch(() => 0),
          countCollection(config.collections.matches).catch(() => 0),
          countCollection(config.collections.standings).catch(() => 0),
        ]);
        coverage = {
          teams: teams > 0,
          matches: matches > 0,
          standings: standings > 0,
          statistics: false,
        };
      }
      return {
        id: doc.id,
        slug,
        name: asStr(doc.data.name),
        leagueCount: leagueCountBySportId.get(doc.id) ?? 0,
        coverage,
      };
    }),
  );
  sports.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

  // Per-league coverage for the curated featured set.
  const leagues: LeagueCoverageDTO[] = [];
  for (const externalId of FEATURED_LEAGUE_EXTERNAL_IDS) {
    const doc = await findByExternalId('leagues', externalId);
    if (!doc) continue;

    const sportId = asStr(doc.data.sport_id);
    const sportSlug = sportId ? (ctx.sportSlugById.get(sportId) ?? null) : null;
    const config = isSportSlug(sportSlug) ? getSportConfig(sportSlug) : null;

    let coverage: Coverage = { teams: false, matches: false, standings: false, statistics: false };
    if (config) {
      const [teams, matches, standings] = await Promise.all([
        countWhereEq(config.collections.teams, 'league_id', doc.id),
        countWhereEq(config.collections.matches, 'league_id', doc.id),
        countWhereEq(config.collections.standings, 'league_id', doc.id),
      ]);
      coverage = {
        teams: teams > 0,
        matches: matches > 0,
        standings: standings > 0,
        statistics: false,
      };
    }

    const seasonDocs = await fetchWhereEq('seasons', 'league_id', doc.id);
    const availableSeasons = seasonDocs
      .map((s) => serializeSeason(s.id, s.data).year)
      .filter((year): year is number => year != null)
      .sort((a, b) => b - a);

    leagues.push({
      id: doc.id,
      externalId: asStr(doc.data.external_id),
      name: asStr(doc.data.name),
      sport: sportSlug,
      availableSeasons,
      coverage,
      updatedAt: updatedAtOf(doc.data),
    });
  }

  return { sports, leagues };
}
