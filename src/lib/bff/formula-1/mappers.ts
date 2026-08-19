import { asStr } from '@/lib/api/serializers';
import type { RawDoc } from '@/lib/firebase/repositories/helpers';

export function mapFormulaOneTeam(doc: RawDoc) {
  return {
    id: doc.id,
    name: asStr(doc.data.name) ?? '',
    logo: asStr(doc.data.logo),
  };
}

export function mapFormulaOneCircuit(doc: RawDoc) {
  return {
    id: doc.id,
    name: asStr(doc.data.name) ?? '',
    image: asStr(doc.data.image),
    country: asStr(doc.data.country),
  };
}

export function mapFormulaOneCompetition(doc: RawDoc) {
  return {
    id: doc.id,
    name: asStr(doc.data.name) ?? '',
  };
}

export function mapFormulaOneDriver(doc: RawDoc, teamDoc: RawDoc | null | undefined) {
  const teamId = asStr(doc.data.team_id);
  return {
    id: doc.id,
    name: asStr(doc.data.name) ?? '',
    nationality: asStr(doc.data.nationality),
    number: typeof doc.data.number === 'number' ? doc.data.number : null,
    team: teamDoc ? mapFormulaOneTeam(teamDoc) : teamId ? { id: teamId } : undefined,
  };
}

export function mapFormulaOneRace(
  doc: RawDoc,
  circuitDoc: RawDoc | null | undefined,
  competitionDoc: RawDoc | null | undefined,
) {
  const circuitId = asStr(doc.data.circuit_id);
  const competitionId = asStr(doc.data.competition_id);
  return {
    id: doc.id,
    competition: competitionDoc
      ? mapFormulaOneCompetition(competitionDoc)
      : competitionId
        ? { id: competitionId }
        : undefined,
    circuit: circuitDoc ? mapFormulaOneCircuit(circuitDoc) : circuitId ? { id: circuitId } : undefined,
    season: typeof doc.data.season === 'number' ? doc.data.season : null,
    type: asStr(doc.data.type),
    date: asStr(doc.data.race_date),
    status: asStr(doc.data.status),
    distance: doc.data.distance ?? null,
    laps: {
      current: doc.data.laps_current ?? null,
      total: typeof doc.data.laps_total === 'number' ? doc.data.laps_total : null,
    },
    timezone: asStr(doc.data.timezone),
  };
}

export function mapFormulaOneDriverRanking(
  doc: RawDoc,
  driverDoc: RawDoc | null | undefined,
  teamDoc: RawDoc | null | undefined,
) {
  return {
    position: typeof doc.data.position === 'number' ? doc.data.position : null,
    points: typeof doc.data.points === 'number' ? doc.data.points : null,
    wins: typeof doc.data.wins === 'number' ? doc.data.wins : null,
    behind: typeof doc.data.behind === 'number' ? doc.data.behind : null,
    driver: driverDoc
      ? mapFormulaOneDriver(driverDoc, teamDoc)
      : { id: asStr(doc.data.driver_id) ?? '' },
    team: teamDoc ? mapFormulaOneTeam(teamDoc) : undefined,
  };
}

export function mapFormulaOneTeamRanking(doc: RawDoc, teamDoc: RawDoc | null | undefined) {
  return {
    position: typeof doc.data.position === 'number' ? doc.data.position : null,
    points: typeof doc.data.points === 'number' ? doc.data.points : null,
    team: teamDoc ? mapFormulaOneTeam(teamDoc) : { id: asStr(doc.data.team_id) ?? '' },
  };
}

export function mapFormulaOneRaceRanking(
  doc: RawDoc,
  driverDoc: RawDoc | null | undefined,
  teamDoc: RawDoc | null | undefined,
) {
  return {
    position: typeof doc.data.position === 'number' ? doc.data.position : null,
    driver: driverDoc
      ? mapFormulaOneDriver(driverDoc, teamDoc)
      : { id: asStr(doc.data.driver_id) ?? '' },
    time: asStr(doc.data.time),
    gap: doc.data.gap ?? null,
    grid: asStr(doc.data.grid),
    laps: typeof doc.data.laps === 'number' ? doc.data.laps : null,
    pits: typeof doc.data.pits === 'number' ? doc.data.pits : null,
  };
}
