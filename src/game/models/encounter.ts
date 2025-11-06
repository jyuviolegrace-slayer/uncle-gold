export type EncounterData = Record<string, number[][]>;

export interface EncounterEntry {
  monsterId: number;
  weight: number;
}

export interface EncounterTable {
  areaId: string;
  encounters: EncounterEntry[];
}
