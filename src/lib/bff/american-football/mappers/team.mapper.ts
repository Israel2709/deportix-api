import { asStr } from '@/lib/api/serializers';
import type { TeamMap } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';
import type { AmericanFootballTeamItem } from '../schemas/team.schema';

function externalNumericId(value: string | null): number | string | null {
  if (!value) return null;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
}

export function mapAmericanFootballTeamDocToApiSports(
  doc: RawDoc,
  externalId?: string | null,
): AmericanFootballTeamItem {
  const raw = doc.data;
  const payload = raw.api_sports_payload;
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const item = payload as AmericanFootballTeamItem;
    return {
      id: item.id ?? externalNumericId(asStr(raw.external_id)),
      name: item.name ?? asStr(raw.name) ?? '',
      logo: item.logo ?? asStr(raw.logo),
      altLogo: item.altLogo ?? asStr(raw.alt_logo),
    };
  }

  return {
    id: externalNumericId(externalId ?? asStr(raw.external_id)) ?? doc.id,
    name: asStr(raw.name) ?? '',
    logo: asStr(raw.logo),
    altLogo: asStr(raw.alt_logo),
  };
}

export function mapAmericanFootballTeamsForLeague(
  docs: RawDoc[],
  externalIds: Map<string, string | null>,
): AmericanFootballTeamItem[] {
  return docs.map((doc) =>
    mapAmericanFootballTeamDocToApiSports(doc, externalIds.get(doc.id) ?? asStr(doc.data.external_id)),
  );
}

export function enrichTeamSide(
  side: Record<string, unknown>,
  teamId: string | null,
  teamMap: TeamMap | undefined,
  externalId: string | null,
): Record<string, unknown> {
  const enriched = { ...side };
  const fromMap = teamId && teamMap ? teamMap.get(teamId) : undefined;
  if (fromMap?.name) enriched.name = fromMap.name;
  if (fromMap?.logo) enriched.logo = fromMap.logo;
  if (enriched.id == null && externalId != null) enriched.id = externalNumericId(externalId);
  return enriched;
}
