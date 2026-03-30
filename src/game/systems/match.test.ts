import { describe, expect, it } from "vitest";
import { GROUND_Y, UNIT_SPACING } from "../config";
import { AGE_SEQUENCE, STARTING_AGE, getAgeDefinition } from "../data/ages";
import { getUnitDefinition } from "../data/ages";
import { EntityState, Side, UnitDefinition } from "../types";
import {
  advanceAge,
  canAdvanceAge,
  canAffordTower,
  canAffordUnit,
  createInitialMatchState,
  getAgeForSide,
  getTowerCount,
  getTowerSellValue,
  purchaseTower,
  purchaseUnit,
  sellTower,
  updateMatchState,
} from "./match";

describe("match age progression", () => {
  it("advances the player through the full age ladder once each threshold is met", () => {
    const state = createInitialMatchState();

    expect(getAgeForSide(state, "player").id).toBe("prehistoric");
    expect(canAdvanceAge(state, "player")).toBe(false);

    for (const [index, age] of AGE_SEQUENCE.entries()) {
      expect(getAgeForSide(state, "player").id).toBe(age.id);

      const nextAge = AGE_SEQUENCE[index + 1];
      if (!nextAge) {
        expect(canAdvanceAge(state, "player")).toBe(false);
        expect(advanceAge(state, "player")).toBe(false);
        continue;
      }

      state.economies.player.experience = age.unlockXp;

      expect(canAdvanceAge(state, "player")).toBe(true);
      expect(advanceAge(state, "player")).toBe(true);
      expect(getAgeForSide(state, "player").id).toBe(nextAge.id);
      expect(state.bases.player.definitionId).toBe(nextAge.base.id);
      expect(state.economies.player.experience).toBe(0);
    }
  });

  it("gates unit and tower purchases by the side's current age", () => {
    const state = createInitialMatchState();
    state.economies.player.money = 20_000;

    expect(canAffordUnit(state, "player", "caveman")).toBe(true);
    expect(canAffordUnit(state, "player", "musketeer")).toBe(false);
    expect(canAffordTower(state, "player", "stone-guard")).toBe(true);
    expect(canAffordTower(state, "player", "missile-launcher")).toBe(false);
    expect(purchaseUnit(state, "player", "musketeer")).toBe(false);
    expect(purchaseTower(state, "player", "missile-launcher")).toBe(false);

    state.economies.player.experience = STARTING_AGE.unlockXp;
    advanceAge(state, "player");
    state.economies.player.experience = getAgeForSide(state, "player").unlockXp;
    advanceAge(state, "player");

    expect(getAgeForSide(state, "player").id).toBe("renaissance");
    expect(canAffordUnit(state, "player", "musketeer")).toBe(true);
    expect(canAffordUnit(state, "player", "ground-infantry")).toBe(false);
    expect(canAffordTower(state, "player", "bombard-tower")).toBe(true);
    expect(canAffordTower(state, "player", "pulse-turret")).toBe(false);
    expect(purchaseUnit(state, "player", "musketeer")).toBe(true);
    expect(purchaseUnit(state, "player", "ground-infantry")).toBe(false);
    expect(purchaseTower(state, "player", "bombard-tower")).toBe(true);
    expect(purchaseTower(state, "player", "pulse-turret")).toBe(false);
  });

  it("lets the player sell a built tower for a partial refund", () => {
    const state = createInitialMatchState();
    state.economies.player.money = 2_000;

    expect(purchaseTower(state, "player", "stone-guard")).toBe(true);
    const moneyAfterPurchase = state.economies.player.money;
    const builtTower = state.entities.find((entity) => entity.side === "player" && entity.entityType === "tower");

    expect(builtTower).toBeTruthy();
    expect(getTowerCount(state, "player")).toBe(1);
    expect(sellTower(state, "player", builtTower!.id)).toBe(true);
    expect(state.economies.player.money).toBe(moneyAfterPurchase + getTowerSellValue("stone-guard"));
    expect(getTowerCount(state, "player")).toBe(0);
  });

  it("lets every tower fire when the shared frontline range reaches a target", () => {
    const state = createInitialMatchState();
    const caveman = getUnitDefinition("caveman");
    state.economies.player.money = 2_000;

    expect(purchaseTower(state, "player", "stone-guard")).toBe(true);
    expect(purchaseTower(state, "player", "stone-guard")).toBe(true);

    state.entities.push({
      id: "enemy-test-unit",
      entityType: "unit",
      side: "enemy",
      definitionId: caveman.id,
      x: 500,
      y: GROUND_Y - 30 - caveman.height / 2,
      hp: caveman.maxHp,
      maxHp: caveman.maxHp,
      attackCooldown: 0,
      spawnTime: state.elapsedTime,
      range: caveman.range,
      speed: caveman.speed,
      attackDamage: caveman.attackDamage,
      attackCadence: caveman.attackCadence,
      bodyWidth: caveman.width,
      bodyHeight: caveman.height,
      color: caveman.color,
      projectile: caveman.projectile,
      rewardMoney: caveman.rewardMoney,
      rewardXp: caveman.rewardXp,
      role: caveman.role,
    });

    updateMatchState(state, 0.26, []);

    expect(state.projectiles).toHaveLength(2);
  });

  it("keeps omega colossus as a capstone that beats two titans but not four", () => {
    const omegaOutcome = simulateFutureUnitSkirmish(1, 2);
    const overwhelmOutcome = simulateFutureUnitSkirmish(1, 4);

    expect(omegaOutcome.playerUnits).toBe(1);
    expect(omegaOutcome.enemyUnits).toBe(0);
    expect(omegaOutcome.winner).toBe("player");

    expect(overwhelmOutcome.playerUnits).toBe(0);
    expect(overwhelmOutcome.enemyUnits).toBeGreaterThan(0);
    expect(overwhelmOutcome.winner).toBe("enemy");
  });

  it("keeps same-age higher-cost units favored in 1v1 duels", () => {
    for (const age of AGE_SEQUENCE) {
      const unitsByCost = [...age.units].sort((left, right) => left.cost - right.cost);

      for (let lowerIndex = 0; lowerIndex < unitsByCost.length - 1; lowerIndex += 1) {
        for (let higherIndex = lowerIndex + 1; higherIndex < unitsByCost.length; higherIndex += 1) {
          const lower = unitsByCost[lowerIndex];
          const higher = unitsByCost[higherIndex];
          const duel = simulateUnitDuel(higher.id, lower.id);
          expect(
            duel.winner,
            `${age.id}:${higher.id} should beat lower-cost ${lower.id} in a 1v1 duel`,
          ).toBe("player");
        }
      }
    }
  });

  it("keeps omega colossus favored over plasma rangers in a 1v1", () => {
    expect(simulateUnitDuel("omega-colossus", "plasma-ranger").winner).toBe("player");
  });
});

function simulateFutureUnitSkirmish(playerOmegaCount: number, enemyTitanCount: number): {
  winner: Side | "draw";
  playerUnits: number;
  enemyUnits: number;
} {
  const state = createInitialMatchState(getAgeDefinition("future"));
  const omega = getUnitDefinition("omega-colossus");
  const titan = getUnitDefinition("titan-walker");
  const omegaSpacing = omega.width + UNIT_SPACING;
  const titanSpacing = titan.width + UNIT_SPACING;

  for (let index = 0; index < playerOmegaCount; index += 1) {
    state.entities.push(createTestUnit("player", omega, 420 - index * omegaSpacing, state.elapsedTime, index));
  }

  for (let index = 0; index < enemyTitanCount; index += 1) {
    state.entities.push(createTestUnit("enemy", titan, 860 + index * titanSpacing, state.elapsedTime, index));
  }

  for (let tick = 0; tick < 2_400 && state.phase === "active"; tick += 1) {
    updateMatchState(state, 0.05, []);

    const playerUnits = countUnits(state, "player");
    const enemyUnits = countUnits(state, "enemy");
    if (playerUnits === 0 || enemyUnits === 0) {
      return {
        winner: playerUnits > enemyUnits ? "player" : playerUnits < enemyUnits ? "enemy" : "draw",
        playerUnits,
        enemyUnits,
      };
    }
  }

  const playerUnits = countUnits(state, "player");
  const enemyUnits = countUnits(state, "enemy");
  return {
    winner: playerUnits > enemyUnits ? "player" : playerUnits < enemyUnits ? "enemy" : "draw",
    playerUnits,
    enemyUnits,
  };
}

function simulateUnitDuel(playerUnitId: string, enemyUnitId: string): {
  winner: Side | "draw";
  playerUnits: number;
  enemyUnits: number;
} {
  const state = createInitialMatchState(getAgeDefinition("future"));
  const playerUnit = getUnitDefinition(playerUnitId);
  const enemyUnit = getUnitDefinition(enemyUnitId);

  state.entities.push(createTestUnit("player", playerUnit, 420, state.elapsedTime, 0));
  state.entities.push(createTestUnit("enemy", enemyUnit, 860, state.elapsedTime, 0));

  for (let tick = 0; tick < 2_400 && state.phase === "active"; tick += 1) {
    updateMatchState(state, 0.05, []);

    const playerUnits = countUnits(state, "player");
    const enemyUnits = countUnits(state, "enemy");
    if (playerUnits === 0 || enemyUnits === 0) {
      return {
        winner: playerUnits > enemyUnits ? "player" : playerUnits < enemyUnits ? "enemy" : "draw",
        playerUnits,
        enemyUnits,
      };
    }
  }

  const playerUnits = countUnits(state, "player");
  const enemyUnits = countUnits(state, "enemy");
  return {
    winner: playerUnits > enemyUnits ? "player" : playerUnits < enemyUnits ? "enemy" : "draw",
    playerUnits,
    enemyUnits,
  };
}

function createTestUnit(
  side: Side,
  definition: UnitDefinition,
  x: number,
  spawnTime: number,
  index: number,
): EntityState {
  return {
    id: `test-${side}-${definition.id}-${index}`,
    entityType: "unit",
    side,
    definitionId: definition.id,
    x,
    y: GROUND_Y - 30 - definition.height / 2,
    hp: definition.maxHp,
    maxHp: definition.maxHp,
    attackCooldown: 0.15,
    spawnTime,
    range: definition.range,
    speed: definition.speed,
    attackDamage: definition.attackDamage,
    attackCadence: definition.attackCadence,
    bodyWidth: definition.width,
    bodyHeight: definition.height,
    color: definition.color,
    projectile: definition.projectile,
    rewardMoney: definition.rewardMoney,
    rewardXp: definition.rewardXp,
    role: definition.role,
  };
}

function countUnits(state: ReturnType<typeof createInitialMatchState>, side: Side): number {
  return state.entities.filter((entity) => entity.side === side && entity.entityType === "unit" && entity.hp > 0).length;
}
