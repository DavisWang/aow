import {
  DEFAULT_STARTING_MONEY,
  ENEMY_BASE_X,
  GROUND_Y,
  PLAYER_BASE_X,
  UNIT_SPACING,
} from "../config";
import { getTowerDefinition, getUnitDefinition, PREHISTORIC_AGE } from "../data/prehistoric";
import {
  AIScriptStep,
  AgeDefinition,
  BuildQueueEntry,
  EntityState,
  MatchState,
  ProjectileDefinition,
  ProjectileState,
  Side,
  TowerDefinition,
  UnitDefinition,
} from "../types";

// These constants shape the current feel of the prehistoric slice. Most are
// intentionally conservative because v0.1 optimizes for stable playability,
// not final balance.
const PLAYER_SPAWN_X = PLAYER_BASE_X + 120;
const ENEMY_SPAWN_X = ENEMY_BASE_X - 120;
const PLAYER_TOWER_Y = GROUND_Y - PREHISTORIC_AGE.base.height + 34;
const UNIT_BASE_Y = GROUND_Y - 30;
const SUPER_SPAWN_Y = 30;
const MAX_BUILD_QUEUE_LENGTH = 5;
const PASSIVE_MONEY_PER_SECOND: Record<Side, number> = {
  player: 0,
  enemy: 24,
};
const KILL_REWARD_MULTIPLIER: Record<Side, number> = {
  player: 1,
  enemy: 2,
};
const PROJECTILE_HIT_PADDING = 18;

export function cloneAISteps(steps: AIScriptStep[]): AIScriptStep[] {
  return steps.map((step) => ({ ...step, unitWeights: step.unitWeights ? { ...step.unitWeights } : undefined }));
}

export function createInitialMatchState(age: AgeDefinition): MatchState {
  // Reconstructing match state from scratch keeps restarts deterministic and
  // avoids scene-specific partial reset bugs.
  return {
    phase: "active",
    winner: null,
    elapsedTime: 0,
    age,
    economies: {
      player: {
        money: DEFAULT_STARTING_MONEY,
        experience: 0,
      },
      enemy: {
        money: DEFAULT_STARTING_MONEY,
        experience: 0,
      },
    },
    bases: {
      player: createBaseState("player", age),
      enemy: createBaseState("enemy", age),
    },
    buildQueues: {
      player: [],
      enemy: [],
    },
    entities: [],
    projectiles: [],
    cooldowns: {
      superReadyAt: {
        player: 0,
        enemy: 0,
      },
    },
    supers: {
      player: {
        active: false,
        endsAt: 0,
        nextVolleyAt: 0,
      },
      enemy: {
        active: false,
        endsAt: 0,
        nextVolleyAt: 0,
      },
    },
    nextQueueId: 1,
    nextEntityId: 1,
    nextProjectileId: 1,
  };
}

function createBaseState(side: Side, age: AgeDefinition): EntityState {
  return {
    id: `${side}-base`,
    entityType: "base",
    side,
    definitionId: age.base.id,
    x: side === "player" ? PLAYER_BASE_X : ENEMY_BASE_X,
    y: GROUND_Y - age.base.height / 2,
    hp: age.base.maxHealth,
    maxHp: age.base.maxHealth,
    attackCooldown: 0,
    spawnTime: 0,
    range: 0,
    speed: 0,
    attackDamage: 0,
    attackCadence: 0,
    bodyWidth: age.base.width,
    bodyHeight: age.base.height,
    color: age.base.color,
  };
}

export function updateMatchState(state: MatchState, dt: number, aiSteps: AIScriptStep[]): void {
  if (state.phase !== "active") {
    return;
  }

  // Update order matters: economy and queues advance before AI decisions, and
  // combat resolves before final win/loss checks.
  state.elapsedTime += dt;

  applyPassiveIncome(state, dt);
  decayAttackCooldowns(state, dt);
  updateBuildQueues(state, dt);
  runAIScript(state, aiSteps);
  updateSuperVolleys(state);
  updateUnits(state, dt);
  updateTowers(state);
  updateProjectiles(state, dt);
  cleanupDeadEntities(state);
  refreshSuperState(state);
  resolveWinCondition(state);
}

function applyPassiveIncome(state: MatchState, dt: number): void {
  for (const side of ["player", "enemy"] as const) {
    state.economies[side].money += PASSIVE_MONEY_PER_SECOND[side] * dt;
  }
}

function decayAttackCooldowns(state: MatchState, dt: number): void {
  for (const entity of state.entities) {
    entity.attackCooldown = Math.max(0, entity.attackCooldown - dt);
  }
}

function updateBuildQueues(state: MatchState, dt: number): void {
  for (const side of ["player", "enemy"] as const) {
    let carry = dt;
    const queue = state.buildQueues[side];

    // Carry leftover frame time forward so multiple queued units can complete
    // in a single update when the frame crosses more than one threshold.
    while (queue.length > 0 && carry > 0) {
      const current = queue[0];
      current.remainingBuildTime -= carry;

      if (current.remainingBuildTime > 0) {
        break;
      }

      carry = -current.remainingBuildTime;
      queue.shift();
      state.entities.push(createUnitState(state, side, getUnitDefinition(current.unitId)));
    }
  }
}

function runAIScript(state: MatchState, aiSteps: AIScriptStep[]): void {
  // The current opponent is intentionally script-driven rather than reactive.
  // That keeps the AI easy to tune during the vertical-slice phase.
  for (const step of aiSteps) {
    if (state.elapsedTime < step.startsAt) {
      continue;
    }

    if (step.once && step.lastTriggeredAt !== undefined) {
      continue;
    }

    if (!step.once && step.interval !== undefined && step.lastTriggeredAt !== undefined) {
      if (state.elapsedTime < step.lastTriggeredAt + step.interval) {
        continue;
      }
    }

    const triggered = executeAIStep(state, step);
    if (triggered) {
      step.lastTriggeredAt = state.elapsedTime;
    }
  }
}

function executeAIStep(state: MatchState, step: AIScriptStep): boolean {
  switch (step.action) {
    case "buy-unit": {
      const unitId = chooseWeightedUnit(step.unitWeights ?? {});
      return unitId ? purchaseUnit(state, "enemy", unitId) : false;
    }
    case "buy-tower":
      return step.towerId ? purchaseTower(state, "enemy", step.towerId) : false;
    case "cast-super": {
      const playerUnitCount = countUnitsForSide(state, "player");
      if ((step.minEnemyUnits ?? 0) > playerUnitCount) {
        return false;
      }

      return activateSuper(state, "enemy");
    }
  }
}

function chooseWeightedUnit(weights: Record<string, number>): string | null {
  const entries = Object.entries(weights);
  if (entries.length === 0) {
    return null;
  }

  const roll = Math.random();
  let cursor = 0;

  for (const [unitId, weight] of entries) {
    cursor += weight;
    if (roll <= cursor) {
      return unitId;
    }
  }

  return entries[entries.length - 1]?.[0] ?? null;
}

export function purchaseUnit(state: MatchState, side: Side, unitId: string): boolean {
  const definition = getUnitDefinition(unitId);
  const economy = state.economies[side];

  // Queue capacity is enforced in the simulation layer so UI and gameplay rules
  // cannot drift apart.
  if (economy.money < definition.cost || state.buildQueues[side].length >= MAX_BUILD_QUEUE_LENGTH) {
    return false;
  }

  economy.money -= definition.cost;
  state.buildQueues[side].push(createBuildQueueEntry(state, definition));
  return true;
}

function createBuildQueueEntry(state: MatchState, definition: UnitDefinition): BuildQueueEntry {
  return {
    id: `queue-${state.nextQueueId++}`,
    unitId: definition.id,
    totalBuildTime: definition.buildTime,
    remainingBuildTime: definition.buildTime,
  };
}

export function purchaseTower(state: MatchState, side: Side, towerId: string): boolean {
  const definition = getTowerDefinition(towerId);
  const economy = state.economies[side];

  if (economy.money < definition.cost) {
    return false;
  }

  const openSlot = getOpenTowerSlot(state, side);
  if (openSlot === null) {
    return false;
  }

  economy.money -= definition.cost;
  state.entities.push(createTowerState(state, side, definition, openSlot));
  return true;
}

function createUnitState(state: MatchState, side: Side, definition: UnitDefinition): EntityState {
  return {
    id: `entity-${state.nextEntityId++}`,
    entityType: "unit",
    side,
    definitionId: definition.id,
    x: side === "player" ? PLAYER_SPAWN_X : ENEMY_SPAWN_X,
    y: UNIT_BASE_Y - definition.height / 2,
    hp: definition.maxHp,
    maxHp: definition.maxHp,
    attackCooldown: 0.15,
    spawnTime: state.elapsedTime,
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

function createTowerState(state: MatchState, side: Side, definition: TowerDefinition, slotIndex: number): EntityState {
  const base = state.bases[side];
  const xOffset = PREHISTORIC_AGE.base.towerSlotOffsets[slotIndex] ?? 0;

  return {
    id: `entity-${state.nextEntityId++}`,
    entityType: "tower",
    side,
    definitionId: definition.id,
    x: base.x + xOffset,
    y: PLAYER_TOWER_Y,
    hp: 120,
    maxHp: 120,
    attackCooldown: 0.25,
    spawnTime: state.elapsedTime,
    range: definition.range,
    speed: 0,
    attackDamage: definition.damage,
    attackCadence: definition.cadence,
    bodyWidth: 38,
    bodyHeight: 74,
    color: definition.color,
    projectile: definition.projectile,
    slotIndex,
  };
}

function getOpenTowerSlot(state: MatchState, side: Side): number | null {
  const taken = new Set(
    state.entities
      .filter((entity) => entity.side === side && entity.entityType === "tower" && entity.hp > 0)
      .map((tower) => tower.slotIndex),
  );

  for (let slotIndex = 0; slotIndex < PREHISTORIC_AGE.base.towerSlots; slotIndex += 1) {
    if (!taken.has(slotIndex)) {
      return slotIndex;
    }
  }

  return null;
}

export function activateSuper(state: MatchState, side: Side): boolean {
  if (state.elapsedTime < state.cooldowns.superReadyAt[side]) {
    return false;
  }

  state.cooldowns.superReadyAt[side] = state.elapsedTime + state.age.super.cooldown;
  state.supers[side] = {
    active: true,
    endsAt: state.elapsedTime + state.age.super.duration,
    nextVolleyAt: state.elapsedTime,
  };
  return true;
}

function refreshSuperState(state: MatchState): void {
  for (const side of ["player", "enemy"] as const) {
    const superState = state.supers[side];
    if (superState.active && state.elapsedTime >= superState.endsAt) {
      superState.active = false;
    }
  }
}

function updateSuperVolleys(state: MatchState): void {
  for (const side of ["player", "enemy"] as const) {
    const superState = state.supers[side];
    if (!superState.active) {
      continue;
    }

    while (state.elapsedTime >= superState.nextVolleyAt && superState.nextVolleyAt <= superState.endsAt) {
      spawnSuperProjectile(state, side);
      superState.nextVolleyAt += state.age.super.projectileCadence;
    }
  }
}

function spawnSuperProjectile(state: MatchState, side: Side): void {
  const targetSide: Side = side === "player" ? "enemy" : "player";
  const fieldMinX = targetSide === "enemy" ? PLAYER_BASE_X + 560 : PLAYER_BASE_X + 120;
  const fieldMaxX = targetSide === "enemy" ? ENEMY_BASE_X - 120 : ENEMY_BASE_X - 560;
  const targetX = randomBetween(fieldMinX, fieldMaxX);
  const targetY = UNIT_BASE_Y - 20;

  state.projectiles.push({
    id: `projectile-${state.nextProjectileId++}`,
    side,
    sourceType: "super",
    targetKind: "area",
    targetSide,
    x: targetX + randomBetween(-60, 60),
    y: SUPER_SPAWN_Y,
    startX: targetX,
    startY: SUPER_SPAWN_Y,
    targetX,
    targetY,
    speed: state.age.super.projectileSpeed,
    damage: state.age.super.impactDamage,
    radius: 10,
    impactRadius: state.age.super.impactRadius,
    color: state.age.super.color,
  });
}

function updateUnits(state: MatchState, dt: number): void {
  const units = state.entities.filter((entity) => entity.entityType === "unit" && entity.hp > 0);

  for (const unit of units) {
    const enemySide = oppositeSide(unit.side);
    const enemyBase = state.bases[enemySide];
    const enemyAhead = findNearestEnemyAhead(state, unit);
    const allyAhead = findNearestAllyAhead(state, unit);

    if (enemyAhead) {
      const desiredX = stopPositionBeforeTarget(unit, enemyAhead);
      if (distanceBetweenEntities(unit, enemyAhead) <= unit.range) {
        tryAttackEntity(state, unit, enemyAhead);
      } else {
        moveUnitToward(unit, desiredX, dt, allyAhead);
      }
      continue;
    }

    const baseDistance = distanceToBase(unit, enemyBase);
    const desiredX = stopPositionBeforeBase(unit, enemyBase);

    if (baseDistance <= unit.range) {
      tryAttackBase(state, unit, enemyBase.side);
      continue;
    }

    moveUnitToward(unit, desiredX, dt, allyAhead);
  }
}

function updateTowers(state: MatchState): void {
  const towers = state.entities.filter((entity) => entity.entityType === "tower" && entity.hp > 0);

  for (const tower of towers) {
    if (tower.attackCooldown > 0 || !tower.projectile) {
      continue;
    }

    const target = findNearestEnemyInRange(state, tower.side, tower.x, tower.range);
    if (!target) {
      continue;
    }

    tower.attackCooldown = tower.attackCadence;
    spawnProjectile(state, tower, target.x, target.y, "entity", target.side, target.id);
  }
}

function updateProjectiles(state: MatchState, dt: number): void {
  const survivors: ProjectileState[] = [];

  for (const projectile of state.projectiles) {
    const dx = projectile.targetX - projectile.x;
    const dy = projectile.targetY - projectile.y;
    const distance = Math.hypot(dx, dy);
    const stepDistance = projectile.speed * dt;

    if (distance <= stepDistance || distance === 0) {
      resolveProjectileImpact(state, projectile);
      continue;
    }

    projectile.x += (dx / distance) * stepDistance;
    projectile.y += (dy / distance) * stepDistance;
    survivors.push(projectile);
  }

  state.projectiles = survivors;
}

function resolveProjectileImpact(state: MatchState, projectile: ProjectileState): void {
  const enemies = state.entities
    .filter((entity) => entity.hp > 0 && entity.side === projectile.targetSide && entity.entityType === "unit")
    .filter((entity) => projectileHitsEntity(projectile, entity))
    .sort(
      (left, right) =>
        projectileDistanceToEntity(projectile, left) - projectileDistanceToEntity(projectile, right),
    );

  if (enemies.length > 0) {
    if (projectile.sourceType === "super") {
      for (const enemy of enemies) {
        applyDamageToEntity(state, enemy, projectile.damage, projectile.side);
      }
    } else {
      applyDamageToEntity(state, enemies[0], projectile.damage, projectile.side);
    }
    return;
  }

  if (projectile.targetKind === "base") {
    applyDamageToBase(state, projectile.targetSide, projectile.damage);
  }
}

function projectileHitsEntity(projectile: ProjectileState, entity: EntityState): boolean {
  return projectileDistanceToEntity(projectile, entity) <= projectile.impactRadius + PROJECTILE_HIT_PADDING;
}

function projectileDistanceToEntity(projectile: ProjectileState, entity: EntityState): number {
  const nearestX = clamp(projectile.targetX, entity.x - entity.bodyWidth / 2, entity.x + entity.bodyWidth / 2);
  const nearestY = clamp(projectile.targetY, entity.y - entity.bodyHeight / 2, entity.y + entity.bodyHeight / 2);
  return Math.hypot(projectile.targetX - nearestX, projectile.targetY - nearestY);
}

function tryAttackEntity(state: MatchState, attacker: EntityState, target: EntityState): void {
  if (attacker.attackCooldown > 0) {
    return;
  }

  attacker.attackCooldown = attacker.attackCadence;

  if (attacker.projectile) {
    spawnProjectile(state, attacker, target.x, target.y, "entity", target.side, target.id);
    return;
  }

  applyDamageToEntity(state, target, attacker.attackDamage, attacker.side);
}

function tryAttackBase(state: MatchState, attacker: EntityState, targetSide: Side): void {
  if (attacker.attackCooldown > 0) {
    return;
  }

  attacker.attackCooldown = attacker.attackCadence;

  if (attacker.projectile) {
    const base = state.bases[targetSide];
    spawnProjectile(state, attacker, base.x, base.y, "base", targetSide);
    return;
  }

  applyDamageToBase(state, targetSide, attacker.attackDamage);
}

function spawnProjectile(
  state: MatchState,
  attacker: EntityState,
  targetX: number,
  targetY: number,
  targetKind: ProjectileState["targetKind"],
  targetSide: Side,
  targetId?: string,
): void {
  const projectile = attacker.projectile as ProjectileDefinition;

  state.projectiles.push({
    id: `projectile-${state.nextProjectileId++}`,
    side: attacker.side,
    sourceType: attacker.entityType === "tower" ? "tower" : "unit",
    targetKind,
    targetSide,
    targetId,
    x: attacker.x,
    y: attacker.y - attacker.bodyHeight / 3,
    startX: attacker.x,
    startY: attacker.y - attacker.bodyHeight / 3,
    targetX,
    targetY,
    speed: projectile.speed,
    damage: attacker.attackDamage,
    radius: projectile.radius,
    impactRadius: projectile.radius * 4,
    color: projectile.color,
  });
}

function moveUnitToward(unit: EntityState, desiredX: number, dt: number, allyAhead: EntityState | null): void {
  const direction = unit.side === "player" ? 1 : -1;
  const step = unit.speed * dt * direction;
  let nextX = unit.x + step;

  if (unit.side === "player") {
    nextX = Math.min(nextX, desiredX);
  } else {
    nextX = Math.max(nextX, desiredX);
  }

  if (allyAhead) {
    const allyStopX =
      unit.side === "player"
        ? allyAhead.x - allyAhead.bodyWidth / 2 - unit.bodyWidth / 2 - UNIT_SPACING
        : allyAhead.x + allyAhead.bodyWidth / 2 + unit.bodyWidth / 2 + UNIT_SPACING;

    if (unit.side === "player") {
      nextX = Math.min(nextX, allyStopX);
    } else {
      nextX = Math.max(nextX, allyStopX);
    }
  }

  unit.x = clamp(nextX, PLAYER_BASE_X + 70, ENEMY_BASE_X - 70);
}

function stopPositionBeforeTarget(unit: EntityState, target: EntityState): number {
  return unit.side === "player"
    ? target.x - target.bodyWidth / 2 - unit.bodyWidth / 2 - unit.range
    : target.x + target.bodyWidth / 2 + unit.bodyWidth / 2 + unit.range;
}

function stopPositionBeforeBase(unit: EntityState, base: EntityState): number {
  return unit.side === "player"
    ? base.x - base.bodyWidth / 2 - unit.bodyWidth / 2 - unit.range
    : base.x + base.bodyWidth / 2 + unit.bodyWidth / 2 + unit.range;
}

function distanceBetweenEntities(attacker: EntityState, target: EntityState): number {
  return Math.max(0, Math.abs(target.x - attacker.x) - attacker.bodyWidth / 2 - target.bodyWidth / 2);
}

function distanceToBase(attacker: EntityState, base: EntityState): number {
  return Math.max(0, Math.abs(base.x - attacker.x) - attacker.bodyWidth / 2 - base.bodyWidth / 2);
}

function distanceToEntityFromX(x: number, entity: EntityState): number {
  return Math.max(0, Math.abs(entity.x - x) - entity.bodyWidth / 2);
}

function findNearestEnemyAhead(state: MatchState, unit: EntityState): EntityState | null {
  const enemies = state.entities
    .filter((entity) => entity.hp > 0 && entity.entityType === "unit" && entity.side !== unit.side)
    .filter((entity) => (unit.side === "player" ? entity.x >= unit.x : entity.x <= unit.x))
    .sort((left, right) => distanceBetweenEntities(unit, left) - distanceBetweenEntities(unit, right));

  return enemies[0] ?? null;
}

function findNearestAllyAhead(state: MatchState, unit: EntityState): EntityState | null {
  const allies = state.entities
    .filter((entity) => entity.id !== unit.id && entity.hp > 0 && entity.entityType === "unit" && entity.side === unit.side)
    .filter((entity) => (unit.side === "player" ? entity.x > unit.x : entity.x < unit.x))
    .sort((left, right) => Math.abs(left.x - unit.x) - Math.abs(right.x - unit.x));

  return allies[0] ?? null;
}

function findNearestEnemyInRange(state: MatchState, side: Side, x: number, range: number): EntityState | null {
  const candidates = state.entities
    .filter((entity) => entity.hp > 0 && entity.entityType === "unit" && entity.side !== side)
    .filter((entity) => distanceToEntityFromX(x, entity) <= range)
    .sort((left, right) => distanceToEntityFromX(x, left) - distanceToEntityFromX(x, right));

  return candidates[0] ?? null;
}

function applyDamageToEntity(state: MatchState, entity: EntityState, damage: number, attackerSide: Side): void {
  if (entity.hp <= 0) {
    return;
  }

  entity.hp = Math.max(0, entity.hp - damage);
  if (entity.hp > 0) {
    return;
  }

  const multiplier = KILL_REWARD_MULTIPLIER[attackerSide];
  state.economies[attackerSide].money += (entity.rewardMoney ?? 0) * multiplier;
  state.economies[attackerSide].experience += (entity.rewardXp ?? 0) * multiplier;
}

function applyDamageToBase(state: MatchState, targetSide: Side, damage: number): void {
  state.bases[targetSide].hp = Math.max(0, state.bases[targetSide].hp - damage);
}

function cleanupDeadEntities(state: MatchState): void {
  state.entities = state.entities.filter((entity) => entity.hp > 0);
}

function resolveWinCondition(state: MatchState): void {
  if (state.bases.player.hp <= 0 && state.bases.enemy.hp <= 0) {
    state.phase = "ended";
    state.winner = "draw";
    return;
  }

  if (state.bases.enemy.hp <= 0) {
    state.phase = "ended";
    state.winner = "player";
    return;
  }

  if (state.bases.player.hp <= 0) {
    state.phase = "ended";
    state.winner = "enemy";
  }
}

export function countUnitsForSide(state: MatchState, side: Side): number {
  return state.entities.filter((entity) => entity.side === side && entity.entityType === "unit" && entity.hp > 0).length;
}

export function canAffordUnit(state: MatchState, side: Side, unitId: string): boolean {
  return (
    state.economies[side].money >= getUnitDefinition(unitId).cost &&
    state.buildQueues[side].length < MAX_BUILD_QUEUE_LENGTH
  );
}

export function canAffordTower(state: MatchState, side: Side, towerId: string): boolean {
  return state.economies[side].money >= getTowerDefinition(towerId).cost && getOpenTowerSlot(state, side) !== null;
}

export function getBuildQueue(state: MatchState, side: Side): BuildQueueEntry[] {
  return state.buildQueues[side];
}

export function getBuildQueueCapacity(): number {
  return MAX_BUILD_QUEUE_LENGTH;
}

export function getSuperCooldownRemaining(state: MatchState, side: Side): number {
  return Math.max(0, state.cooldowns.superReadyAt[side] - state.elapsedTime);
}

export function getTowerCount(state: MatchState, side: Side): number {
  return state.entities.filter((entity) => entity.side === side && entity.entityType === "tower" && entity.hp > 0).length;
}

function oppositeSide(side: Side): Side {
  return side === "player" ? "enemy" : "player";
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
