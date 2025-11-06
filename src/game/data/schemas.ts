import { z } from 'zod';

export const CritterBaseStatsSchema = z.object({
  hp: z.number(),
  attack: z.number(),
  defense: z.number(),
  spAtk: z.number(),
  spDef: z.number(),
  speed: z.number(),
});

export const CritterSchema = z.object({
  id: z.string(),
  name: z.string(),
  types: z.array(z.string()),
  baseStats: CritterBaseStatsSchema,
  moves: z.array(z.string()),
  evolvesInto: z.string().optional(),
  evolvesFrom: z.string().optional(),
  evolutionLevel: z.number().optional(),
  pokedexEntry: z.string(),
  height: z.number(),
  weight: z.number(),
  catchRate: z.number(),
});

export const CrittersSchema = z.array(CritterSchema);

export const MoveEffectSchema = z.object({
  type: z.string(),
  chance: z.number().optional(),
  value: z.number().optional(),
});

export const MoveSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  power: z.number(),
  accuracy: z.number(),
  basePP: z.number(),
  category: z.enum(['Physical', 'Special', 'Status']),
  effect: MoveEffectSchema.optional(),
});

export const MovesSchema = z.array(MoveSchema);

export const ItemEffectSchema = z.object({
  type: z.string(),
  value: z.number().optional(),
  chance: z.number().optional(),
});

export const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.string(),
  effect: ItemEffectSchema.optional(),
});

export const ItemsSchema = z.array(ItemSchema);

export const EncounterDataSchema = z.record(z.string(), z.array(z.array(z.number())));

export const LegacyAttackSchema = z.object({
  id: z.number(),
  name: z.string(),
  animationName: z.string(),
  audioKey: z.string(),
});

export const LegacyAttacksSchema = z.array(LegacyAttackSchema);

export const LegacyItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  effect: z.string(),
});

export const LegacyItemsSchema = z.array(LegacyItemSchema);

export const LegacyMonsterSchema = z.object({
  id: z.string(),
  monsterId: z.number(),
  name: z.string(),
  assetKey: z.string(),
  assetFrame: z.number(),
  currentHp: z.number(),
  maxHp: z.number(),
  attackIds: z.array(z.number()),
  baseAttack: z.number(),
  currentAttack: z.number(),
  currentLevel: z.number(),
  baseExp: z.number(),
  currentExp: z.number(),
});

export const LegacyMonstersSchema = z.array(LegacyMonsterSchema);

export const TypeEffectivenessSchema = z.record(z.string(), z.number());

export const CritterTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  effectiveness: TypeEffectivenessSchema,
});

export const CritterTypesSchema = z.array(CritterTypeSchema);

export const TypeMatrixSchema = z.object({
  types: z.array(z.string()),
  matrix: z.record(z.string(), z.record(z.string(), z.number())),
});
