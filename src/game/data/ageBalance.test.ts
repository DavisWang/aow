import { describe, expect, it } from "vitest";
import { AGE_SEQUENCE } from "./ages";

function hitsToKill(maxHp: number, damage: number): number {
  return Math.ceil(maxHp / damage);
}

describe("age breakpoint balance", () => {
  it("keeps all super cooldowns at 45 seconds", () => {
    for (const age of AGE_SEQUENCE) {
      expect(age.super.cooldown, `${age.id}:${age.super.id} should stay at the shared cooldown target`).toBe(45);
    }
  });

  it("keeps omega colossus above the tower range ceiling", () => {
    const omegaColossus = AGE_SEQUENCE.flatMap((age) => age.units).find((unit) => unit.id === "omega-colossus");
    const maxTowerRange = Math.max(...AGE_SEQUENCE.flatMap((age) => age.towers.map((tower) => tower.range)));

    expect(omegaColossus).toBeTruthy();
    expect(omegaColossus!.range, "omega-colossus should outrange every tower").toBeGreaterThan(maxTowerRange);
  });

  it("keeps 2-age-up attackers lethal against lower-age non-mega units", () => {
    for (let attackerIndex = 2; attackerIndex < AGE_SEQUENCE.length; attackerIndex += 1) {
      const attackerAge = AGE_SEQUENCE[attackerIndex];
      const defenderAge = AGE_SEQUENCE[attackerIndex - 2];
      const lowerAgeRegularUnits = defenderAge.units.filter((unit) => unit.role !== "mega");

      for (const attacker of attackerAge.units) {
        for (const defender of lowerAgeRegularUnits) {
          expect(
            hitsToKill(defender.maxHp, attacker.attackDamage),
            `${attackerAge.id}:${attacker.id} should need at most 2 hits versus ${defenderAge.id}:${defender.id}`,
          ).toBeLessThanOrEqual(2);
        }
      }

      for (const tower of attackerAge.towers) {
        for (const defender of lowerAgeRegularUnits) {
          expect(
            hitsToKill(defender.maxHp, tower.damage),
            `${attackerAge.id}:${tower.id} should need at most 2 hits versus ${defenderAge.id}:${defender.id}`,
          ).toBeLessThanOrEqual(2);
        }
      }

      for (const defender of lowerAgeRegularUnits) {
        expect(
          hitsToKill(defender.maxHp, attackerAge.super.impactDamage),
          `${attackerAge.id}:${attackerAge.super.id} should need at most 2 hits versus ${defenderAge.id}:${defender.id}`,
        ).toBeLessThanOrEqual(2);
      }
    }
  });

  it("allows mega-unit resistance, but still keeps 2-age-up pressure high", () => {
    for (let attackerIndex = 2; attackerIndex < AGE_SEQUENCE.length; attackerIndex += 1) {
      const attackerAge = AGE_SEQUENCE[attackerIndex];
      const defenderMega = AGE_SEQUENCE[attackerIndex - 2].units.find((unit) => unit.role === "mega");
      expect(defenderMega).toBeTruthy();

      for (const attacker of attackerAge.units) {
        const hitBudget = attacker.role === "melee" ? 4 : 3;
        expect(
          hitsToKill(defenderMega!.maxHp, attacker.attackDamage),
          `${attackerAge.id}:${attacker.id} should stay within ${hitBudget} hits versus ${defenderMega!.id}`,
        ).toBeLessThanOrEqual(hitBudget);
      }
    }
  });
});
