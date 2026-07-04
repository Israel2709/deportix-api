import { describe, expect, it } from 'vitest';
import { buildTeamFirestorePatch } from '@/lib/api/team-patch';

describe('buildTeamFirestorePatch', () => {
  it('maps soccer logo and altLogo to Firestore fields', () => {
    expect(
      buildTeamFirestorePatch('soccer', {
        logo: 'https://cdn.example/logo.png',
        altLogo: 'https://cdn.example/alt.png',
      }),
    ).toEqual({
      logo: 'https://cdn.example/logo.png',
      'team.logo': 'https://cdn.example/logo.png',
      alt_logo: 'https://cdn.example/alt.png',
    });
  });

  it('maps nfl altLogo to alt_logo', () => {
    expect(
      buildTeamFirestorePatch('american-football', {
        logo: 'https://cdn.example/logo.png',
        altLogo: 'https://cdn.example/alt.png',
      }),
    ).toEqual({
      logo: 'https://cdn.example/logo.png',
      alt_logo: 'https://cdn.example/alt.png',
    });
  });
});
