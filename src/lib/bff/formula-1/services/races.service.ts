import { asStr } from '@/lib/api/serializers';
import { fetchAll, fetchWhereEq, resolveDoc, type RawDoc } from '@/lib/firebase/repositories/helpers';
import { mapFormulaOneRace } from '../mappers';
import { loadFormulaOneLookupMaps } from '../lookup-maps';
export interface FormulaOneRacesQuery {
  id?: string;
  season?: number;
  type?: string;
  circuit?: string;
  competition?: string;
}

function resolveRelated(
  maps: Awaited<ReturnType<typeof loadFormulaOneLookupMaps>>,
  id: string | null | undefined,
  collection: 'circuits' | 'competitions',
): RawDoc | null {
  if (!id) return null;
  const fromMap = collection === 'circuits' ? maps.circuits.get(id) : maps.competitions.get(id);
  return fromMap ?? null;
}

export async function fetchFormulaOneRaces(query: FormulaOneRacesQuery) {
  const maps = await loadFormulaOneLookupMaps();

  if (query.id) {
    const doc = await resolveDoc('f1_races', query.id);
    if (!doc) return [];
    return [mapRaceDoc(doc, maps)];
  }

  let docs =
    query.season != null
      ? await fetchWhereEq('f1_races', 'season', query.season)
      : await fetchAll('f1_races');

  if (query.type) {
    const type = query.type.toLowerCase();
    docs = docs.filter((doc) => asStr(doc.data.type)?.toLowerCase() === type);
  }

  if (query.circuit) {
    const circuit = maps.circuits.get(query.circuit) ?? (await resolveDoc('f1_circuits', query.circuit));
    const circuitId = circuit?.id;
    docs = circuitId ? docs.filter((doc) => asStr(doc.data.circuit_id) === circuitId) : [];
  }

  if (query.competition) {
    const competition =
      maps.competitions.get(query.competition) ??
      (await resolveDoc('f1_competitions', query.competition));
    const competitionId = competition?.id;
    docs = competitionId
      ? docs.filter((doc) => asStr(doc.data.competition_id) === competitionId)
      : [];
  }

  docs.sort((a, b) => {
    const da = asStr(a.data.race_date) ?? '';
    const db = asStr(b.data.race_date) ?? '';
    return da.localeCompare(db);
  });

  return docs.map((doc) => mapRaceDoc(doc, maps));
}

function mapRaceDoc(doc: RawDoc, maps: Awaited<ReturnType<typeof loadFormulaOneLookupMaps>>) {
  const circuitId = asStr(doc.data.circuit_id);
  const competitionId = asStr(doc.data.competition_id);
  const circuitDoc = resolveRelated(maps, circuitId, 'circuits');
  const competitionDoc = resolveRelated(maps, competitionId, 'competitions');
  return mapFormulaOneRace(doc, circuitDoc, competitionDoc);
}
