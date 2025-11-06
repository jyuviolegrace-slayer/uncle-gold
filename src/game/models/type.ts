export interface TypeEffectiveness {
  [targetType: string]: number;
}

export interface CritterType {
  id: string;
  name: string;
  effectiveness: TypeEffectiveness;
}
