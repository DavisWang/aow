import { AIScriptStep, AgeDefinition, AgeId, TowerDefinition, UnitDefinition } from "../types";
import { FUTURE_AGE, FUTURE_AI_SCRIPT } from "./future";
import { MEDIEVAL_AGE, MEDIEVAL_AI_SCRIPT } from "./medieval";
import { MODERN_AGE, MODERN_AI_SCRIPT } from "./modern";
import { PREHISTORIC_AGE, PREHISTORIC_AI_SCRIPT } from "./prehistoric";
import { RENAISSANCE_AGE, RENAISSANCE_AI_SCRIPT } from "./renaissance";

export const AGE_SEQUENCE: AgeDefinition[] = [
  PREHISTORIC_AGE,
  MEDIEVAL_AGE,
  RENAISSANCE_AGE,
  MODERN_AGE,
  FUTURE_AGE,
];
export const STARTING_AGE = PREHISTORIC_AGE;

const AGE_BY_ID = new Map<AgeId, AgeDefinition>(AGE_SEQUENCE.map((age) => [age.id, age]));
const UNIT_BY_ID = new Map<string, UnitDefinition>(AGE_SEQUENCE.flatMap((age) => age.units.map((unit) => [unit.id, unit] as const)));
const TOWER_BY_ID = new Map<string, TowerDefinition>(
  AGE_SEQUENCE.flatMap((age) => age.towers.map((tower) => [tower.id, tower] as const)),
);

export const DEFAULT_AI_SCRIPT: AIScriptStep[] = [
  ...PREHISTORIC_AI_SCRIPT,
  {
    id: "enemy-age-up-medieval",
    action: "advance-age",
    requiredAgeId: "prehistoric",
    startsAt: 0,
  },
  ...MEDIEVAL_AI_SCRIPT,
  {
    id: "enemy-age-up-renaissance",
    action: "advance-age",
    requiredAgeId: "medieval",
    startsAt: 0,
  },
  ...RENAISSANCE_AI_SCRIPT,
  {
    id: "enemy-age-up-modern",
    action: "advance-age",
    requiredAgeId: "renaissance",
    startsAt: 0,
  },
  ...MODERN_AI_SCRIPT,
  {
    id: "enemy-age-up-future",
    action: "advance-age",
    requiredAgeId: "modern",
    startsAt: 0,
  },
  ...FUTURE_AI_SCRIPT,
];

export function getAgeDefinition(ageId: AgeId): AgeDefinition {
  const definition = AGE_BY_ID.get(ageId);

  if (!definition) {
    throw new Error(`Unknown age definition: ${ageId}`);
  }

  return definition;
}

export function getNextAgeDefinition(ageId: AgeId): AgeDefinition | null {
  const currentIndex = AGE_SEQUENCE.findIndex((age) => age.id === ageId);

  if (currentIndex === -1) {
    throw new Error(`Unknown age sequence index for: ${ageId}`);
  }

  return AGE_SEQUENCE[currentIndex + 1] ?? null;
}

export function getUnitDefinition(unitId: string): UnitDefinition {
  const definition = UNIT_BY_ID.get(unitId);

  if (!definition) {
    throw new Error(`Unknown unit definition: ${unitId}`);
  }

  return definition;
}

export function getTowerDefinition(towerId: string): TowerDefinition {
  const definition = TOWER_BY_ID.get(towerId);

  if (!definition) {
    throw new Error(`Unknown tower definition: ${towerId}`);
  }

  return definition;
}
