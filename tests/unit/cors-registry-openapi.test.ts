import { afterEach, describe, expect, it } from 'vitest';
import { applyCorsHeaders, resolveAllowOrigin } from '@/lib/api/cors';
import { getSportConfig, isSportSlug } from '@/lib/firebase/sport-registry';
import { httpStatusForCode } from '@/lib/api/errors';
import { openapiDocument } from '@/generated/openapi';

describe('CORS', () => {
  const original = process.env.CORS_ALLOWED_ORIGINS;
  afterEach(() => {
    process.env.CORS_ALLOWED_ORIGINS = original;
  });

  it('defaults to wildcard', () => {
    delete process.env.CORS_ALLOWED_ORIGINS;
    expect(resolveAllowOrigin('https://x.com')).toBe('*');
  });

  it('echoes an allowed origin and blocks others when restricted', () => {
    process.env.CORS_ALLOWED_ORIGINS = 'https://a.com,https://b.com';
    expect(resolveAllowOrigin('https://b.com')).toBe('https://b.com');
    expect(resolveAllowOrigin('https://evil.com')).toBe('https://a.com');
  });

  it('sets GET/PATCH/OPTIONS headers', () => {
    delete process.env.CORS_ALLOWED_ORIGINS;
    const headers = new Headers();
    applyCorsHeaders(headers, null);
    expect(headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(headers.get('Access-Control-Allow-Methods')).toContain('GET');
    expect(headers.get('Access-Control-Allow-Methods')).toContain('PATCH');
  });
});

describe('sport registry', () => {
  it('maps soccer/nfl to collections and excludes f1 from generic endpoints', () => {
    expect(getSportConfig('soccer')?.collections.matches).toBe('soccer_matches');
    expect(getSportConfig('nfl')?.collections.matches).toBe('nfl_games');
    expect(getSportConfig('f1')?.genericEndpointsSupported).toBe(false);
    expect(getSportConfig('unknown')).toBeNull();
    expect(isSportSlug('soccer')).toBe(true);
    expect(isSportSlug('rugby')).toBe(false);
  });
});

describe('error status mapping', () => {
  it('maps codes to HTTP statuses', () => {
    expect(httpStatusForCode('INVALID_QUERY_PARAMETER')).toBe(400);
    expect(httpStatusForCode('INVALID_REQUEST_BODY')).toBe(400);
    expect(httpStatusForCode('RESOURCE_NOT_FOUND')).toBe(404);
    expect(httpStatusForCode('DATA_SOURCE_NOT_CONFIGURED')).toBe(503);
    expect(httpStatusForCode('INTERNAL_SERVER_ERROR')).toBe(500);
  });
});

describe('OpenAPI document', () => {
  it('is titled Deportix API and is 3.1', () => {
    expect(openapiDocument.openapi).toBe('3.1.0');
    expect(openapiDocument.info.title).toBe('Deportix API');
  });

  it('documents the core endpoints', () => {
    const paths = Object.keys(openapiDocument.paths);
    for (const p of [
      '/v1/health',
      '/v1/data-status',
      '/v1/sports',
      '/v1/leagues',
      '/v1/leagues/{leagueId}',
      '/v1/leagues/{leagueId}/standings',
      '/v1/leagues/{leagueId}/matches/{matchId}',
      '/v1/teams/{teamId}',
      '/v1/openapi.json',
    ]) {
      expect(paths).toContain(p);
    }
  });
});
