import { CACHE } from '@/lib/api/cache';
import {
  bffGetRoute,
  bffOptionsRoute,
  soccerBffPostRoute,
} from '@/lib/bff/football/handler';
import { parseFixtureQuery } from '@/lib/bff/football/query-params';
import { fetchFootballFixtures } from '@/lib/bff/football/services/fixtures.service';
import { createSoccerFixture } from '@/lib/bff/football/writers/fixtures.writer';

export const runtime = 'nodejs';

export const GET = bffGetRoute(async ({ searchParams }) => {
  const response = await fetchFootballFixtures(parseFixtureQuery(searchParams));
  return { response, cache: CACHE.dynamic };
});

export const POST = soccerBffPostRoute('fixtures')(async ({ body }) => {
  const fixture = await createSoccerFixture(body);
  return { response: [fixture], status: 201 };
});

export const OPTIONS = bffOptionsRoute();
