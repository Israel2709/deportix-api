import { asStr } from '@/lib/api/serializers';
import {
  getMatchById,
  listRawMatchesByLeague,
  listRawMatchesBySeason,
} from '@/lib/firebase/repositories/matches.repository';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import { buildCountryMap } from '@/lib/firebase/repositories/countries.repository';
import { getLeague } from '@/lib/firebase/repositories/leagues.repository';
import { getTeamById } from '@/lib/firebase/repositories/teams.repository';
import { buildTeamExternalIdMap, buildTeamMapForLeague } from '@/lib/firebase/repositories/teams.repository';
import type { FixtureLeagueContext } from '../mappers/fixture.mapper';
import {
  isLiveMatch,
  mapRawSoccerMatchToApiSports,
  matchDate,
  matchRoundName,
  matchStatusShort,
  matchVenueName,
} from '../mappers/fixture.mapper';
import type { FixtureQuery } from '../query-params';
import { buildFixtureLeagueContext } from './fixture-league-context';
import { resolveSoccerLeague, resolveSoccerSeason } from './leagues.service';

function upperBound(to: string): string {
  return to.length <= 10 ? `${to}T23:59:59.999Z` : to;
}

async function loadFixtureLeagueContext(leagueId: string): Promise<FixtureLeagueContext | null> {
  const league = await getLeague(leagueId);
  if (!league || league.sportSlug !== 'soccer') return null;

  const countryMap = await buildCountryMap();
  const country = league.dto.country
    ? (countryMap.get(league.dto.country.toLowerCase()) ?? null)
    : null;

  return buildFixtureLeagueContext(league.dto, country);
}

async function mapDocsForLeague(leagueId: string, docs: RawDoc[]): Promise<unknown[]> {
  const [teamMap, externalIds, leagueContext] = await Promise.all([
    buildTeamMapForLeague(leagueId, 'soccer'),
    buildTeamExternalIdMap(leagueId, 'soccer'),
    loadFixtureLeagueContext(leagueId),
  ]);

  return docs.map((doc) =>
    mapRawSoccerMatchToApiSports(
      doc,
      teamMap,
      {
        home: externalIds.get(asStr(doc.data.home_team_id) ?? '') ?? null,
        away: externalIds.get(asStr(doc.data.away_team_id) ?? '') ?? null,
      },
      leagueContext,
    ),
  );
}

function applyFixtureFilters(docs: RawDoc[], query: FixtureQuery): RawDoc[] {
  let filtered = docs;

  if (query.live) {
    filtered = filtered.filter((doc) => isLiveMatch(doc.data));
  }

  if (query.status) {
    filtered = filtered.filter((doc) => matchStatusShort(doc.data) === query.status);
  }

  if (query.round) {
    filtered = filtered.filter((doc) => matchRoundName(doc.data) === query.round);
  }

  if (query.venue) {
    const needle = query.venue.toLowerCase();
    filtered = filtered.filter((doc) => (matchVenueName(doc.data) ?? '').toLowerCase().includes(needle));
  }

  if (query.date) {
    const day = query.date.slice(0, 10);
    filtered = filtered.filter((doc) => (matchDate(doc.data) ?? '').slice(0, 10) === day);
  }

  if (query.from) {
    filtered = filtered.filter((doc) => {
      const date = matchDate(doc.data);
      return date != null && date >= query.from!;
    });
  }

  if (query.to) {
    const to = upperBound(query.to);
    filtered = filtered.filter((doc) => {
      const date = matchDate(doc.data);
      return date != null && date <= to;
    });
  }

  filtered = [...filtered].sort((a, b) => {
    const da = matchDate(a.data) ?? '';
    const db = matchDate(b.data) ?? '';
    return db.localeCompare(da);
  });

  if (query.last != null) {
    const now = new Date().toISOString();
    filtered = filtered.filter((doc) => (matchDate(doc.data) ?? '') < now).slice(0, query.last);
  } else if (query.next != null) {
    const now = new Date().toISOString();
    filtered = filtered
      .filter((doc) => (matchDate(doc.data) ?? '') >= now)
      .sort((a, b) => (matchDate(a.data) ?? '').localeCompare(matchDate(b.data) ?? ''))
      .slice(0, query.next);
  }

  return filtered;
}

async function fetchByIds(ids: string[]): Promise<unknown[]> {
  const docs: RawDoc[] = [];
  for (const id of ids) {
    const doc = await getMatchById('soccer', id);
    if (doc) docs.push(doc);
  }

  const byLeague = new Map<string, RawDoc[]>();
  for (const doc of docs) {
    const leagueId = asStr(doc.data.league_id);
    if (!leagueId) continue;
    const bucket = byLeague.get(leagueId) ?? [];
    bucket.push(doc);
    byLeague.set(leagueId, bucket);
  }

  const mapped: unknown[] = [];
  for (const [leagueId, leagueDocs] of byLeague) {
    mapped.push(...(await mapDocsForLeague(leagueId, leagueDocs)));
  }
  return mapped;
}

export async function fetchFootballFixtures(query: FixtureQuery): Promise<unknown[]> {
  if (query.id) return fetchByIds([query.id]);
  if (query.ids?.length) return fetchByIds(query.ids);

  let leagueId: string | undefined;
  if (query.leagueExternalId) {
    const league = await resolveSoccerLeague(query.leagueExternalId);
    if (!league) return [];
    leagueId = league.id;
  } else if (query.teamExternalId) {
    const team = await getTeamById(query.teamExternalId);
    if (!team || team.sport !== 'soccer' || !team.team.leagueId) return [];
    leagueId = team.team.leagueId;
  } else {
    return [];
  }

  const season = await resolveSoccerSeason(leagueId, query.seasonYear);
  const docs = season
    ? await listRawMatchesBySeason('soccer', season.id)
    : await listRawMatchesByLeague('soccer', leagueId);

  let filtered = applyFixtureFilters(docs, query);

  if (query.teamExternalId) {
    const team = await getTeamById(query.teamExternalId);
    if (team?.team.id) {
      filtered = filtered.filter(
        (doc) =>
          doc.data.home_team_id === team.team.id || doc.data.away_team_id === team.team.id,
      );
    }
  }

  if (query.timezone) {
    // Timezone is accepted for compatibility; stored dates remain UTC.
  }

  return mapDocsForLeague(leagueId, filtered);
}
