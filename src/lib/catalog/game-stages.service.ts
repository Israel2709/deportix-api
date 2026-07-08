import {
  listGameStages,
  seedDefaultGameStagesIfEmpty,
  type GameStageRecord,
} from '@/lib/firebase/repositories/game-stages.repository';

export interface CatalogGameStageDto {
  value: string;
  label: string;
}

function toDto(record: GameStageRecord): CatalogGameStageDto {
  return { value: record.value, label: record.label };
}

/** List game stages from the global Firestore `game_stages` catalog (api-sports American Football). */
export async function listCatalogGameStages(): Promise<CatalogGameStageDto[]> {
  await seedDefaultGameStagesIfEmpty();
  const stages = await listGameStages();
  return stages.map(toDto);
}
