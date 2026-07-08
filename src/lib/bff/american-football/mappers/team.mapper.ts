import { asStr } from '@/lib/api/serializers';
import type { TeamMap } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { AmericanFootballTeamItem } from '../schemas/team.schema';

export function mapAmericanFootballTeamDocToApiSports(doc: RawDoc): AmericanFootballTeamItem {
  return {
    id: doc.id,
    name: asStr(doc.data.name) ?? '',
    logo: asStr(doc.data.logo),
    altLogo: asStr(doc.data.alt_logo),
  };
}

export function mapAmericanFootballTeamsForLeague(docs: RawDoc[]): AmericanFootballTeamItem[] {
  return docs.map((doc) => mapAmericanFootballTeamDocToApiSports(doc));
}

export function enrichTeamSide(
  side: Record<string, unknown>,
  teamId: string | null,
  teamMap: TeamMap | undefined,
): Record<string, unknown> {
  const enriched = { ...side };
  const fromMap = teamId && teamMap ? teamMap.get(teamId) : undefined;
  if (fromMap?.name) enriched.name = fromMap.name;
  if (fromMap?.logo) enriched.logo = fromMap.logo;
  if (teamId) enriched.id = teamId;
  return enriched;
}
