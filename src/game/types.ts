// These types are the contract shared by content data, the simulation layer,
// and the rendering layer. New ages and mechanics should fit this model when
// possible instead of introducing scene-specific state shapes.
export type Side = "player" | "enemy";
export type MatchPhase = "active" | "ended";
export type MatchMode = "standard" | "test";
export type UnitRole = "melee" | "ranged" | "mega";
export type EntityType = "unit" | "tower" | "base";
export type AgeId = "prehistoric" | "medieval" | "renaissance" | "modern" | "future";
export type ProjectileSourceType = "unit" | "tower" | "super";
export type ProjectileTargetKind = "entity" | "base" | "area";
export type ProjectileVisualStyle =
  | "stone"
  | "fossil"
  | "ember"
  | "meteor"
  | "arrow"
  | "bolt"
  | "flask"
  | "arrow-rain"
  | "cannonball"
  | "bullet"
  | "rocket"
  | "bomb"
  | "plasma"
  | "laser";

export interface ProjectileDefinition {
  speed: number;
  radius: number;
  color: number;
  visualStyle: ProjectileVisualStyle;
}

export interface UnitDefinition {
  id: string;
  name: string;
  role: UnitRole;
  cost: number;
  buildTime: number;
  maxHp: number;
  speed: number;
  range: number;
  attackDamage: number;
  attackCadence: number;
  rewardMoney: number;
  rewardXp: number;
  color: number;
  width: number;
  height: number;
  projectile?: ProjectileDefinition;
}

export interface TowerDefinition {
  id: string;
  name: string;
  cost: number;
  range: number;
  damage: number;
  cadence: number;
  color: number;
  slotType: string;
  projectile: ProjectileDefinition;
}

export interface SuperDefinition {
  id: string;
  name: string;
  cooldown: number;
  duration: number;
  projectileCadence: number;
  impactDamage: number;
  impactRadius: number;
  projectileSpeed: number;
  color: number;
  visualStyle: ProjectileVisualStyle;
}

export interface BaseDefinition {
  id: string;
  name: string;
  maxHealth: number;
  width: number;
  height: number;
  color: number;
  towerSlots: number;
  towerSlotOffsets: number[];
}

export interface AgeDefinition {
  id: AgeId;
  theme: string;
  unlockXp: number;
  units: UnitDefinition[];
  towers: TowerDefinition[];
  super: SuperDefinition;
  base: BaseDefinition;
}

export interface EconomyState {
  money: number;
  experience: number;
}

export interface EntityState {
  id: string;
  entityType: EntityType;
  side: Side;
  definitionId: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attackCooldown: number;
  spawnTime: number;
  range: number;
  speed: number;
  attackDamage: number;
  attackCadence: number;
  bodyWidth: number;
  bodyHeight: number;
  color: number;
  projectile?: ProjectileDefinition;
  rewardMoney?: number;
  rewardXp?: number;
  role?: UnitRole;
  slotIndex?: number;
}

export interface ProjectileState {
  id: string;
  side: Side;
  sourceType: ProjectileSourceType;
  targetKind: ProjectileTargetKind;
  targetSide: Side;
  targetId?: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  radius: number;
  impactRadius: number;
  color: number;
  visualStyle: ProjectileVisualStyle;
}

export interface SuperState {
  active: boolean;
  endsAt: number;
  nextVolleyAt: number;
}

export interface CooldownState {
  superReadyAt: Record<Side, number>;
}

export interface BuildQueueEntry {
  id: string;
  unitId: string;
  totalBuildTime: number;
  remainingBuildTime: number;
}

export interface MatchState {
  // The simulation clock drives queues, cooldowns, AI scheduling, and other
  // time-based mechanics.
  phase: MatchPhase;
  winner: Side | "draw" | null;
  elapsedTime: number;
  ages: Record<Side, AgeDefinition>;
  economies: Record<Side, EconomyState>;
  bases: Record<Side, EntityState>;
  buildQueues: Record<Side, BuildQueueEntry[]>;
  entities: EntityState[];
  projectiles: ProjectileState[];
  cooldowns: CooldownState;
  supers: Record<Side, SuperState>;
  nextQueueId: number;
  nextEntityId: number;
  nextProjectileId: number;
}

export interface AIScriptStep {
  id: string;
  action: "buy-unit" | "buy-tower" | "cast-super" | "advance-age";
  startsAt: number;
  interval?: number;
  once?: boolean;
  lastTriggeredAt?: number;
  minEnemyUnits?: number;
  requiredAgeId?: AgeId;
  unitWeights?: Record<string, number>;
  towerId?: string;
}
