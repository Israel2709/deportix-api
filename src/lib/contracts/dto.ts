/**
 * Public DTO shapes returned by the API. These are the *only* representations exposed to
 * consumers — internal Firestore fields (sources, ingestion metadata, raw provider blobs)
 * are never surfaced. Serializers in `src/lib/api/serializers.ts` map raw documents to these.
 */

export interface SportDTO {
  id: string;
  slug: string | null;
  name: string | null;
  logo: string | null;
}

export interface LeagueDTO {
  id: string;
  externalId: string | null;
  name: string | null;
  type: string | null;
  sport: string | null;
  country: string | null;
  logo: string | null;
  updatedAt: string | null;
}

export interface SeasonDTO {
  id: string;
  leagueId: string | null;
  year: number | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  externalId: string | null;
}

export interface VenueDTO {
  id: number | null;
  name: string | null;
  city: string | null;
  capacity: number | null;
}

export interface TeamDTO {
  id: string;
  externalId: string | null;
  sport: string | null;
  leagueId: string | null;
  name: string | null;
  code: string | null;
  country: string | null;
  logo: string | null;
  city: string | null;
  conference: string | null;
  division: string | null;
  venue: VenueDTO | null;
  updatedAt: string | null;
}

export interface MatchSideDTO {
  teamId: string | null;
  name: string | null;
  logo: string | null;
  score: number | null;
}

export interface MatchDTO {
  id: string;
  externalId: string | null;
  sport: string | null;
  leagueId: string | null;
  seasonId: string | null;
  date: string | null;
  status: string | null;
  round: string | null;
  venue: string | null;
  home: MatchSideDTO;
  away: MatchSideDTO;
  updatedAt: string | null;
}

export interface StandingDTO {
  teamId: string | null;
  teamName: string | null;
  points: number | null;
  played: number | null;
  wins: number | null;
  draws: number | null;
  losses: number | null;
  ties: number | null;
}

export interface LeagueCoverageDTO {
  id: string;
  externalId: string | null;
  name: string | null;
  sport: string | null;
  availableSeasons: number[];
  coverage: {
    teams: boolean;
    matches: boolean;
    standings: boolean;
    statistics: boolean;
  };
  updatedAt: string | null;
}
