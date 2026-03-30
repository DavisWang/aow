import Phaser from "phaser";
import { EntityState, ProjectileState, ProjectileVisualStyle } from "../types";

export type { ProjectileVisualStyle } from "../types";

type DrawTexture = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

const UI_STYLES = {
  hud: {
    base: "#141b26",
    inset: "#0b1119",
    top: "#26364c",
    bottom: "#080d13",
    border: "#c79b58",
    glow: "#f0c27d",
  },
  banner: {
    base: "#172131",
    inset: "#0e1622",
    top: "#2f4460",
    bottom: "#0a0e14",
    border: "#d6aa63",
    glow: "#f6d59e",
  },
  button: {
    base: "#b56735",
    inset: "#d78448",
    top: "#f0b168",
    bottom: "#6c3417",
    border: "#ffd79f",
    glow: "#ffe6be",
  },
  buttonHover: {
    base: "#cc7d3d",
    inset: "#ee9d52",
    top: "#ffd08a",
    bottom: "#7a3a17",
    border: "#ffe4b9",
    glow: "#fff2d4",
  },
  buttonDisabled: {
    base: "#485462",
    inset: "#5e6977",
    top: "#818e9e",
    bottom: "#2c323b",
    border: "#9ba7b6",
    glow: "#c9d0d8",
  },
} as const;

const HUD_ICON_KEYS = {
  ageAdvance: "ui/icon/age-advance",
  sellTower: "ui/icon/sell-tower",
} as const;

const ENTITY_TEXTURE_KEYS = {
  caveman: "art/unit/caveman",
  stonethrower: "art/unit/stonethrower",
  "dino-rider": "art/unit/dino-rider",
  swordsman: "art/unit/swordsman",
  archer: "art/unit/archer",
  knight: "art/unit/knight",
  musketeer: "art/unit/musketeer",
  cannoneer: "art/unit/cannoneer",
  cavalier: "art/unit/cavalier",
  "ground-infantry": "art/unit/ground-infantry",
  "machine-gunner": "art/unit/machine-gunner",
  tank: "art/unit/tank",
  sentinels: "art/unit/sentinels",
  "plasma-ranger": "art/unit/plasma-ranger",
  "titan-walker": "art/unit/titan-walker",
  "omega-colossus": "art/unit/omega-colossus",
  "stone-guard": "art/tower/stone-guard",
  "fossil-catapult": "art/tower/fossil-catapult",
  "ember-totem": "art/tower/ember-totem",
  "arrow-tower": "art/tower/arrow-tower",
  "ballista-tower": "art/tower/ballista-tower",
  "fire-cauldron": "art/tower/fire-cauldron",
  "arquebus-tower": "art/tower/arquebus-tower",
  "bombard-tower": "art/tower/bombard-tower",
  "alchemist-tower": "art/tower/alchemist-tower",
  "gun-turret": "art/tower/gun-turret",
  "gatling-gun": "art/tower/gatling-gun",
  "missile-launcher": "art/tower/missile-launcher",
  "pulse-turret": "art/tower/pulse-turret",
  "drone-bay": "art/tower/drone-bay",
  "ion-blaster": "art/tower/ion-blaster",
  "prehistoric-base": "art/base/prehistoric",
  "medieval-base": "art/base/medieval",
  "renaissance-base": "art/base/renaissance",
  "modern-base": "art/base/modern",
  "future-base": "art/base/future",
} as const;

const PROJECTILE_TEXTURE_KEYS = {
  stone: "art/projectile/stone",
  fossil: "art/projectile/fossil",
  ember: "art/projectile/ember",
  meteor: "art/projectile/meteor",
  arrow: "art/projectile/arrow",
  bolt: "art/projectile/bolt",
  flask: "art/projectile/flask",
  "arrow-rain": "art/projectile/arrow-rain",
  cannonball: "art/projectile/cannonball",
  bullet: "art/projectile/bullet",
  rocket: "art/projectile/rocket",
  bomb: "art/projectile/bomb",
  plasma: "art/projectile/plasma",
  laser: "art/projectile/laser",
} as const;

const IMPACT_TEXTURE_KEYS = {
  stone: "art/effect/impact-stone",
  fossil: "art/effect/impact-fossil",
  ember: "art/effect/impact-ember",
  meteor: "art/effect/impact-meteor",
  arrow: "art/effect/impact-arrow",
  bolt: "art/effect/impact-bolt",
  flask: "art/effect/impact-flask",
  "arrow-rain": "art/effect/impact-arrow-rain",
  cannonball: "art/effect/impact-cannonball",
  bullet: "art/effect/impact-bullet",
  rocket: "art/effect/impact-rocket",
  bomb: "art/effect/impact-bomb",
  plasma: "art/effect/impact-plasma",
  laser: "art/effect/impact-laser",
} as const;

const ANIMATION_KEYS = {
  caveman: "anim/unit/caveman",
  stonethrower: "anim/unit/stonethrower",
  "dino-rider": "anim/unit/dino-rider",
  swordsman: "anim/unit/swordsman",
  archer: "anim/unit/archer",
  knight: "anim/unit/knight",
  musketeer: "anim/unit/musketeer",
  cannoneer: "anim/unit/cannoneer",
  cavalier: "anim/unit/cavalier",
  "ground-infantry": "anim/unit/ground-infantry",
  "machine-gunner": "anim/unit/machine-gunner",
  tank: "anim/unit/tank",
  sentinels: "anim/unit/sentinels",
  "plasma-ranger": "anim/unit/plasma-ranger",
  "titan-walker": "anim/unit/titan-walker",
  "omega-colossus": "anim/unit/omega-colossus",
  "stone-guard": "anim/tower/stone-guard",
  "fossil-catapult": "anim/tower/fossil-catapult",
  "ember-totem": "anim/tower/ember-totem",
  "arrow-tower": "anim/tower/arrow-tower",
  "ballista-tower": "anim/tower/ballista-tower",
  "fire-cauldron": "anim/tower/fire-cauldron",
  "arquebus-tower": "anim/tower/arquebus-tower",
  "bombard-tower": "anim/tower/bombard-tower",
  "alchemist-tower": "anim/tower/alchemist-tower",
  "gun-turret": "anim/tower/gun-turret",
  "gatling-gun": "anim/tower/gatling-gun",
  "missile-launcher": "anim/tower/missile-launcher",
  "pulse-turret": "anim/tower/pulse-turret",
  "drone-bay": "anim/tower/drone-bay",
  "ion-blaster": "anim/tower/ion-blaster",
  "prehistoric-base": "anim/base/prehistoric",
  "medieval-base": "anim/base/medieval",
  "renaissance-base": "anim/base/renaissance",
  "modern-base": "anim/base/modern",
  "future-base": "anim/base/future",
  projectileStone: "anim/projectile/stone",
  projectileFossil: "anim/projectile/fossil",
  projectileEmber: "anim/projectile/ember",
  projectileMeteor: "anim/projectile/meteor",
  projectileArrow: "anim/projectile/arrow",
  projectileBolt: "anim/projectile/bolt",
  projectileFlask: "anim/projectile/flask",
  projectileArrowRain: "anim/projectile/arrow-rain",
  projectileCannonball: "anim/projectile/cannonball",
  projectileBullet: "anim/projectile/bullet",
  projectileRocket: "anim/projectile/rocket",
  projectileBomb: "anim/projectile/bomb",
  projectilePlasma: "anim/projectile/plasma",
  projectileLaser: "anim/projectile/laser",
} as const;

const PROJECTILE_ANIMATION_KEYS = {
  stone: ANIMATION_KEYS.projectileStone,
  fossil: ANIMATION_KEYS.projectileFossil,
  ember: ANIMATION_KEYS.projectileEmber,
  meteor: ANIMATION_KEYS.projectileMeteor,
  arrow: ANIMATION_KEYS.projectileArrow,
  bolt: ANIMATION_KEYS.projectileBolt,
  flask: ANIMATION_KEYS.projectileFlask,
  "arrow-rain": ANIMATION_KEYS.projectileArrowRain,
  cannonball: ANIMATION_KEYS.projectileCannonball,
  bullet: ANIMATION_KEYS.projectileBullet,
  rocket: ANIMATION_KEYS.projectileRocket,
  bomb: ANIMATION_KEYS.projectileBomb,
  plasma: ANIMATION_KEYS.projectilePlasma,
  laser: ANIMATION_KEYS.projectileLaser,
} as const;

interface AnimationConfig {
  frames: string[];
  frameRate: number;
}

const IDLE_ANIMATIONS: Record<string, AnimationConfig> = {
  [ANIMATION_KEYS.caveman]: {
    frames: ["art/unit/caveman-0", "art/unit/caveman-1"],
    frameRate: 6,
  },
  [ANIMATION_KEYS.stonethrower]: {
    frames: ["art/unit/stonethrower-0", "art/unit/stonethrower-1"],
    frameRate: 5,
  },
  [ANIMATION_KEYS["dino-rider"]]: {
    frames: ["art/unit/dino-rider-0", "art/unit/dino-rider-1"],
    frameRate: 4,
  },
  [ANIMATION_KEYS.swordsman]: {
    frames: ["art/unit/swordsman-0", "art/unit/swordsman-1"],
    frameRate: 6,
  },
  [ANIMATION_KEYS.archer]: {
    frames: ["art/unit/archer-0", "art/unit/archer-1"],
    frameRate: 5,
  },
  [ANIMATION_KEYS.knight]: {
    frames: ["art/unit/knight-0", "art/unit/knight-1"],
    frameRate: 4,
  },
  [ANIMATION_KEYS.musketeer]: {
    frames: ["art/unit/musketeer-0", "art/unit/musketeer-1"],
    frameRate: 6,
  },
  [ANIMATION_KEYS.cannoneer]: {
    frames: ["art/unit/cannoneer-0", "art/unit/cannoneer-1"],
    frameRate: 4,
  },
  [ANIMATION_KEYS.cavalier]: {
    frames: ["art/unit/cavalier-0", "art/unit/cavalier-1"],
    frameRate: 4,
  },
  [ANIMATION_KEYS["ground-infantry"]]: {
    frames: ["art/unit/ground-infantry-0", "art/unit/ground-infantry-1"],
    frameRate: 6,
  },
  [ANIMATION_KEYS["machine-gunner"]]: {
    frames: ["art/unit/machine-gunner-0", "art/unit/machine-gunner-1"],
    frameRate: 6,
  },
  [ANIMATION_KEYS.tank]: {
    frames: ["art/unit/tank-0", "art/unit/tank-1"],
    frameRate: 3,
  },
  [ANIMATION_KEYS.sentinels]: {
    frames: ["art/unit/sentinels-0", "art/unit/sentinels-1"],
    frameRate: 6,
  },
  [ANIMATION_KEYS["plasma-ranger"]]: {
    frames: ["art/unit/plasma-ranger-0", "art/unit/plasma-ranger-1"],
    frameRate: 5,
  },
  [ANIMATION_KEYS["titan-walker"]]: {
    frames: ["art/unit/titan-walker-0", "art/unit/titan-walker-1"],
    frameRate: 3,
  },
  [ANIMATION_KEYS["omega-colossus"]]: {
    frames: ["art/unit/omega-colossus-0", "art/unit/omega-colossus-1"],
    frameRate: 2,
  },
  [ANIMATION_KEYS["stone-guard"]]: {
    frames: ["art/tower/stone-guard-0", "art/tower/stone-guard-1"],
    frameRate: 2,
  },
  [ANIMATION_KEYS["fossil-catapult"]]: {
    frames: ["art/tower/fossil-catapult-0", "art/tower/fossil-catapult-1"],
    frameRate: 2,
  },
  [ANIMATION_KEYS["ember-totem"]]: {
    frames: ["art/tower/ember-totem-0", "art/tower/ember-totem-1"],
    frameRate: 3,
  },
  [ANIMATION_KEYS["arrow-tower"]]: {
    frames: ["art/tower/arrow-tower-0", "art/tower/arrow-tower-1"],
    frameRate: 2,
  },
  [ANIMATION_KEYS["ballista-tower"]]: {
    frames: ["art/tower/ballista-tower-0", "art/tower/ballista-tower-1"],
    frameRate: 2,
  },
  [ANIMATION_KEYS["fire-cauldron"]]: {
    frames: ["art/tower/fire-cauldron-0", "art/tower/fire-cauldron-1"],
    frameRate: 3,
  },
  [ANIMATION_KEYS["arquebus-tower"]]: {
    frames: ["art/tower/arquebus-tower-0", "art/tower/arquebus-tower-1"],
    frameRate: 3,
  },
  [ANIMATION_KEYS["bombard-tower"]]: {
    frames: ["art/tower/bombard-tower-0", "art/tower/bombard-tower-1"],
    frameRate: 2,
  },
  [ANIMATION_KEYS["alchemist-tower"]]: {
    frames: ["art/tower/alchemist-tower-0", "art/tower/alchemist-tower-1"],
    frameRate: 3,
  },
  [ANIMATION_KEYS["gun-turret"]]: {
    frames: ["art/tower/gun-turret-0", "art/tower/gun-turret-1"],
    frameRate: 3,
  },
  [ANIMATION_KEYS["gatling-gun"]]: {
    frames: ["art/tower/gatling-gun-0", "art/tower/gatling-gun-1"],
    frameRate: 4,
  },
  [ANIMATION_KEYS["missile-launcher"]]: {
    frames: ["art/tower/missile-launcher-0", "art/tower/missile-launcher-1"],
    frameRate: 2,
  },
  [ANIMATION_KEYS["pulse-turret"]]: {
    frames: ["art/tower/pulse-turret-0", "art/tower/pulse-turret-1"],
    frameRate: 4,
  },
  [ANIMATION_KEYS["drone-bay"]]: {
    frames: ["art/tower/drone-bay-0", "art/tower/drone-bay-1"],
    frameRate: 3,
  },
  [ANIMATION_KEYS["ion-blaster"]]: {
    frames: ["art/tower/ion-blaster-0", "art/tower/ion-blaster-1"],
    frameRate: 4,
  },
  [ANIMATION_KEYS["prehistoric-base"]]: {
    frames: ["art/base/prehistoric-0", "art/base/prehistoric-1"],
    frameRate: 2,
  },
  [ANIMATION_KEYS["medieval-base"]]: {
    frames: ["art/base/medieval-0", "art/base/medieval-1"],
    frameRate: 2,
  },
  [ANIMATION_KEYS["renaissance-base"]]: {
    frames: ["art/base/renaissance-0", "art/base/renaissance-1"],
    frameRate: 2,
  },
  [ANIMATION_KEYS["modern-base"]]: {
    frames: ["art/base/modern-0", "art/base/modern-1"],
    frameRate: 2,
  },
  [ANIMATION_KEYS["future-base"]]: {
    frames: ["art/base/future-0", "art/base/future-1"],
    frameRate: 2,
  },
  [ANIMATION_KEYS.projectileStone]: {
    frames: ["art/projectile/stone-0", "art/projectile/stone-1"],
    frameRate: 10,
  },
  [ANIMATION_KEYS.projectileFossil]: {
    frames: ["art/projectile/fossil-0", "art/projectile/fossil-1"],
    frameRate: 10,
  },
  [ANIMATION_KEYS.projectileEmber]: {
    frames: ["art/projectile/ember-0", "art/projectile/ember-1"],
    frameRate: 12,
  },
  [ANIMATION_KEYS.projectileMeteor]: {
    frames: ["art/projectile/meteor-0", "art/projectile/meteor-1"],
    frameRate: 12,
  },
  [ANIMATION_KEYS.projectileArrow]: {
    frames: ["art/projectile/arrow-0", "art/projectile/arrow-1"],
    frameRate: 12,
  },
  [ANIMATION_KEYS.projectileBolt]: {
    frames: ["art/projectile/bolt-0", "art/projectile/bolt-1"],
    frameRate: 10,
  },
  [ANIMATION_KEYS.projectileFlask]: {
    frames: ["art/projectile/flask-0", "art/projectile/flask-1"],
    frameRate: 12,
  },
  [ANIMATION_KEYS.projectileArrowRain]: {
    frames: ["art/projectile/arrow-rain-0", "art/projectile/arrow-rain-1"],
    frameRate: 12,
  },
  [ANIMATION_KEYS.projectileCannonball]: {
    frames: ["art/projectile/cannonball-0", "art/projectile/cannonball-1"],
    frameRate: 10,
  },
  [ANIMATION_KEYS.projectileBullet]: {
    frames: ["art/projectile/bullet-0", "art/projectile/bullet-1"],
    frameRate: 14,
  },
  [ANIMATION_KEYS.projectileRocket]: {
    frames: ["art/projectile/rocket-0", "art/projectile/rocket-1"],
    frameRate: 10,
  },
  [ANIMATION_KEYS.projectileBomb]: {
    frames: ["art/projectile/bomb-0", "art/projectile/bomb-1"],
    frameRate: 10,
  },
  [ANIMATION_KEYS.projectilePlasma]: {
    frames: ["art/projectile/plasma-0", "art/projectile/plasma-1"],
    frameRate: 14,
  },
  [ANIMATION_KEYS.projectileLaser]: {
    frames: ["art/projectile/laser-0", "art/projectile/laser-1"],
    frameRate: 16,
  },
};

export function ensureArt(scene: Phaser.Scene): void {
  ensureCanvasTexture(scene, "art/world/sun", 220, 220, drawSunTexture);
  ensureCanvasTexture(scene, "art/world/cloud", 164, 88, drawCloudTexture);
  ensureCanvasTexture(scene, "art/world/mountain", 256, 160, drawMountainTexture);
  ensureCanvasTexture(scene, "art/world/fern", 80, 84, drawFernTexture);
  ensureCanvasTexture(scene, "art/world/rock", 64, 40, drawRockTexture);
  ensureCanvasTexture(scene, "art/world/bone", 76, 36, drawBoneTexture);
  ensureCanvasTexture(scene, "art/world/tower-slot", 24, 24, drawTowerSlotTexture);
  ensureCanvasTexture(scene, HUD_ICON_KEYS.ageAdvance, 48, 48, drawAgeAdvanceIconTexture);
  ensureCanvasTexture(scene, HUD_ICON_KEYS.sellTower, 48, 48, drawSellTowerIconTexture);
  ensureCanvasTexture(scene, IMPACT_TEXTURE_KEYS.stone, 60, 44, drawStoneImpactTexture);
  ensureCanvasTexture(scene, IMPACT_TEXTURE_KEYS.fossil, 66, 48, drawFossilImpactTexture);
  ensureCanvasTexture(scene, IMPACT_TEXTURE_KEYS.ember, 56, 56, drawEmberImpactTexture);
  ensureCanvasTexture(scene, IMPACT_TEXTURE_KEYS.meteor, 86, 70, drawMeteorImpactTexture);
  ensureCanvasTexture(scene, IMPACT_TEXTURE_KEYS.arrow, 58, 42, drawArrowImpactTexture);
  ensureCanvasTexture(scene, IMPACT_TEXTURE_KEYS.bolt, 70, 48, drawBoltImpactTexture);
  ensureCanvasTexture(scene, IMPACT_TEXTURE_KEYS.flask, 60, 60, drawFlaskImpactTexture);
  ensureCanvasTexture(scene, IMPACT_TEXTURE_KEYS["arrow-rain"], 72, 54, drawArrowRainImpactTexture);
  ensureCanvasTexture(scene, IMPACT_TEXTURE_KEYS.cannonball, 78, 58, drawCannonballImpactTexture);
  ensureCanvasTexture(scene, IMPACT_TEXTURE_KEYS.bullet, 52, 24, drawBulletImpactTexture);
  ensureCanvasTexture(scene, IMPACT_TEXTURE_KEYS.rocket, 84, 60, drawRocketImpactTexture);
  ensureCanvasTexture(scene, IMPACT_TEXTURE_KEYS.bomb, 92, 74, drawBombImpactTexture);
  ensureCanvasTexture(scene, IMPACT_TEXTURE_KEYS.plasma, 76, 64, drawPlasmaImpactTexture);
  ensureCanvasTexture(scene, IMPACT_TEXTURE_KEYS.laser, 96, 34, drawLaserImpactTexture);
  ensureCanvasTexture(scene, "art/effect/dust", 56, 40, drawDustTexture);
  ensureCanvasTexture(scene, "art/projectile/stone-0", 28, 28, (ctx) => drawStoneProjectileTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/projectile/stone-1", 28, 28, (ctx) => drawStoneProjectileTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/projectile/fossil-0", 34, 34, (ctx) => drawFossilProjectileTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/projectile/fossil-1", 34, 34, (ctx) => drawFossilProjectileTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/projectile/ember-0", 34, 34, (ctx) => drawEmberProjectileTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/projectile/ember-1", 34, 34, (ctx) => drawEmberProjectileTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/projectile/meteor-0", 44, 52, (ctx) => drawMeteorProjectileTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/projectile/meteor-1", 44, 52, (ctx) => drawMeteorProjectileTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/projectile/arrow-0", 38, 16, (ctx) => drawArrowProjectileTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/projectile/arrow-1", 38, 16, (ctx) => drawArrowProjectileTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/projectile/bolt-0", 42, 18, (ctx) => drawBoltProjectileTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/projectile/bolt-1", 42, 18, (ctx) => drawBoltProjectileTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/projectile/flask-0", 36, 36, (ctx) => drawFlaskProjectileTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/projectile/flask-1", 36, 36, (ctx) => drawFlaskProjectileTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/projectile/arrow-rain-0", 34, 42, (ctx) => drawArrowRainProjectileTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/projectile/arrow-rain-1", 34, 42, (ctx) => drawArrowRainProjectileTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/projectile/cannonball-0", 36, 36, (ctx) => drawCannonballProjectileTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/projectile/cannonball-1", 36, 36, (ctx) => drawCannonballProjectileTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/projectile/bullet-0", 34, 12, (ctx) => drawBulletProjectileTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/projectile/bullet-1", 34, 12, (ctx) => drawBulletProjectileTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/projectile/rocket-0", 46, 18, (ctx) => drawRocketProjectileTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/projectile/rocket-1", 46, 18, (ctx) => drawRocketProjectileTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/projectile/bomb-0", 44, 44, (ctx) => drawBombProjectileTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/projectile/bomb-1", 44, 44, (ctx) => drawBombProjectileTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/projectile/plasma-0", 36, 36, (ctx) => drawPlasmaProjectileTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/projectile/plasma-1", 36, 36, (ctx) => drawPlasmaProjectileTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/projectile/laser-0", 52, 12, (ctx) => drawLaserProjectileTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/projectile/laser-1", 52, 12, (ctx) => drawLaserProjectileTexture(ctx, 1));

  ensureCanvasTexture(scene, "art/unit/caveman-0", 56, 68, (ctx) => drawCavemanTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/caveman-1", 56, 68, (ctx) => drawCavemanTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/unit/stonethrower-0", 58, 68, (ctx) => drawStonethrowerTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/stonethrower-1", 58, 68, (ctx) => drawStonethrowerTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/unit/dino-rider-0", 92, 84, (ctx) => drawDinoRiderTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/dino-rider-1", 92, 84, (ctx) => drawDinoRiderTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/unit/swordsman-0", 58, 70, (ctx) => drawSwordsmanTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/swordsman-1", 58, 70, (ctx) => drawSwordsmanTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/unit/archer-0", 58, 68, (ctx) => drawArcherTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/archer-1", 58, 68, (ctx) => drawArcherTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/unit/knight-0", 96, 88, (ctx) => drawKnightTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/knight-1", 96, 88, (ctx) => drawKnightTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/unit/musketeer-0", 60, 72, (ctx) => drawMusketeerTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/musketeer-1", 60, 72, (ctx) => drawMusketeerTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/unit/cannoneer-0", 64, 72, (ctx) => drawCannoneerTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/cannoneer-1", 64, 72, (ctx) => drawCannoneerTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/unit/cavalier-0", 100, 90, (ctx) => drawCavalierTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/cavalier-1", 100, 90, (ctx) => drawCavalierTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/unit/ground-infantry-0", 60, 74, (ctx) => drawGroundInfantryTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/ground-infantry-1", 60, 74, (ctx) => drawGroundInfantryTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/unit/machine-gunner-0", 64, 74, (ctx) => drawMachineGunnerTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/machine-gunner-1", 64, 74, (ctx) => drawMachineGunnerTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/unit/tank-0", 108, 88, (ctx) => drawTankTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/tank-1", 108, 88, (ctx) => drawTankTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/unit/sentinels-0", 62, 74, (ctx) => drawSentinelsTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/sentinels-1", 62, 74, (ctx) => drawSentinelsTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/unit/plasma-ranger-0", 62, 74, (ctx) => drawPlasmaRangerTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/plasma-ranger-1", 62, 74, (ctx) => drawPlasmaRangerTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/unit/titan-walker-0", 112, 98, (ctx) => drawTitanWalkerTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/titan-walker-1", 112, 98, (ctx) => drawTitanWalkerTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/unit/omega-colossus-0", 142, 124, (ctx) => drawOmegaColossusTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/unit/omega-colossus-1", 142, 124, (ctx) => drawOmegaColossusTexture(ctx, 1));

  ensureCanvasTexture(scene, "art/tower/stone-guard-0", 58, 98, (ctx) => drawStoneGuardTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/tower/stone-guard-1", 58, 98, (ctx) => drawStoneGuardTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/tower/fossil-catapult-0", 66, 96, (ctx) => drawFossilCatapultTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/tower/fossil-catapult-1", 66, 96, (ctx) => drawFossilCatapultTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/tower/ember-totem-0", 52, 96, (ctx) => drawEmberTotemTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/tower/ember-totem-1", 52, 96, (ctx) => drawEmberTotemTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/tower/arrow-tower-0", 58, 100, (ctx) => drawArrowTowerTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/tower/arrow-tower-1", 58, 100, (ctx) => drawArrowTowerTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/tower/ballista-tower-0", 70, 100, (ctx) => drawBallistaTowerTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/tower/ballista-tower-1", 70, 100, (ctx) => drawBallistaTowerTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/tower/fire-cauldron-0", 58, 98, (ctx) => drawFireCauldronTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/tower/fire-cauldron-1", 58, 98, (ctx) => drawFireCauldronTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/tower/arquebus-tower-0", 60, 100, (ctx) => drawArquebusTowerTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/tower/arquebus-tower-1", 60, 100, (ctx) => drawArquebusTowerTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/tower/bombard-tower-0", 76, 104, (ctx) => drawBombardTowerTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/tower/bombard-tower-1", 76, 104, (ctx) => drawBombardTowerTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/tower/alchemist-tower-0", 60, 100, (ctx) => drawAlchemistTowerTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/tower/alchemist-tower-1", 60, 100, (ctx) => drawAlchemistTowerTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/tower/gun-turret-0", 64, 100, (ctx) => drawGunTurretTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/tower/gun-turret-1", 64, 100, (ctx) => drawGunTurretTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/tower/gatling-gun-0", 68, 100, (ctx) => drawGatlingGunTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/tower/gatling-gun-1", 68, 100, (ctx) => drawGatlingGunTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/tower/missile-launcher-0", 64, 102, (ctx) => drawMissileLauncherTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/tower/missile-launcher-1", 64, 102, (ctx) => drawMissileLauncherTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/tower/pulse-turret-0", 64, 102, (ctx) => drawPulseTurretTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/tower/pulse-turret-1", 64, 102, (ctx) => drawPulseTurretTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/tower/drone-bay-0", 68, 102, (ctx) => drawDroneBayTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/tower/drone-bay-1", 68, 102, (ctx) => drawDroneBayTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/tower/ion-blaster-0", 66, 102, (ctx) => drawIonBlasterTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/tower/ion-blaster-1", 66, 102, (ctx) => drawIonBlasterTexture(ctx, 1));

  ensureCanvasTexture(scene, "art/base/prehistoric-0", 184, 244, (ctx) => drawBaseTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/base/prehistoric-1", 184, 244, (ctx) => drawBaseTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/base/medieval-0", 196, 250, (ctx) => drawMedievalBaseTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/base/medieval-1", 196, 250, (ctx) => drawMedievalBaseTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/base/renaissance-0", 202, 256, (ctx) => drawRenaissanceBaseTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/base/renaissance-1", 202, 256, (ctx) => drawRenaissanceBaseTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/base/modern-0", 208, 260, (ctx) => drawModernBaseTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/base/modern-1", 208, 260, (ctx) => drawModernBaseTexture(ctx, 1));
  ensureCanvasTexture(scene, "art/base/future-0", 216, 268, (ctx) => drawFutureBaseTexture(ctx, 0));
  ensureCanvasTexture(scene, "art/base/future-1", 216, 268, (ctx) => drawFutureBaseTexture(ctx, 1));

  registerAnimation(scene, ANIMATION_KEYS.caveman);
  registerAnimation(scene, ANIMATION_KEYS.stonethrower);
  registerAnimation(scene, ANIMATION_KEYS["dino-rider"]);
  registerAnimation(scene, ANIMATION_KEYS.swordsman);
  registerAnimation(scene, ANIMATION_KEYS.archer);
  registerAnimation(scene, ANIMATION_KEYS.knight);
  registerAnimation(scene, ANIMATION_KEYS.musketeer);
  registerAnimation(scene, ANIMATION_KEYS.cannoneer);
  registerAnimation(scene, ANIMATION_KEYS.cavalier);
  registerAnimation(scene, ANIMATION_KEYS["ground-infantry"]);
  registerAnimation(scene, ANIMATION_KEYS["machine-gunner"]);
  registerAnimation(scene, ANIMATION_KEYS.tank);
  registerAnimation(scene, ANIMATION_KEYS.sentinels);
  registerAnimation(scene, ANIMATION_KEYS["plasma-ranger"]);
  registerAnimation(scene, ANIMATION_KEYS["titan-walker"]);
  registerAnimation(scene, ANIMATION_KEYS["omega-colossus"]);
  registerAnimation(scene, ANIMATION_KEYS["stone-guard"]);
  registerAnimation(scene, ANIMATION_KEYS["fossil-catapult"]);
  registerAnimation(scene, ANIMATION_KEYS["ember-totem"]);
  registerAnimation(scene, ANIMATION_KEYS["arrow-tower"]);
  registerAnimation(scene, ANIMATION_KEYS["ballista-tower"]);
  registerAnimation(scene, ANIMATION_KEYS["fire-cauldron"]);
  registerAnimation(scene, ANIMATION_KEYS["arquebus-tower"]);
  registerAnimation(scene, ANIMATION_KEYS["bombard-tower"]);
  registerAnimation(scene, ANIMATION_KEYS["alchemist-tower"]);
  registerAnimation(scene, ANIMATION_KEYS["gun-turret"]);
  registerAnimation(scene, ANIMATION_KEYS["gatling-gun"]);
  registerAnimation(scene, ANIMATION_KEYS["missile-launcher"]);
  registerAnimation(scene, ANIMATION_KEYS["pulse-turret"]);
  registerAnimation(scene, ANIMATION_KEYS["drone-bay"]);
  registerAnimation(scene, ANIMATION_KEYS["ion-blaster"]);
  registerAnimation(scene, ANIMATION_KEYS["prehistoric-base"]);
  registerAnimation(scene, ANIMATION_KEYS["medieval-base"]);
  registerAnimation(scene, ANIMATION_KEYS["renaissance-base"]);
  registerAnimation(scene, ANIMATION_KEYS["modern-base"]);
  registerAnimation(scene, ANIMATION_KEYS["future-base"]);
  registerAnimation(scene, ANIMATION_KEYS.projectileStone);
  registerAnimation(scene, ANIMATION_KEYS.projectileFossil);
  registerAnimation(scene, ANIMATION_KEYS.projectileEmber);
  registerAnimation(scene, ANIMATION_KEYS.projectileMeteor);
  registerAnimation(scene, ANIMATION_KEYS.projectileArrow);
  registerAnimation(scene, ANIMATION_KEYS.projectileBolt);
  registerAnimation(scene, ANIMATION_KEYS.projectileFlask);
  registerAnimation(scene, ANIMATION_KEYS.projectileArrowRain);
  registerAnimation(scene, ANIMATION_KEYS.projectileCannonball);
  registerAnimation(scene, ANIMATION_KEYS.projectileBullet);
  registerAnimation(scene, ANIMATION_KEYS.projectileRocket);
  registerAnimation(scene, ANIMATION_KEYS.projectileBomb);
  registerAnimation(scene, ANIMATION_KEYS.projectilePlasma);
  registerAnimation(scene, ANIMATION_KEYS.projectileLaser);
}

export function ensurePanelTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  style: keyof typeof UI_STYLES = "hud",
): string {
  return ensureCanvasTexture(scene, key, width, height, (ctx) => drawPanelTexture(ctx, width, height, UI_STYLES[style]));
}

export function ensureButtonTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  style: "button" | "buttonHover" | "buttonDisabled",
): string {
  return ensureCanvasTexture(scene, key, width, height, (ctx) => drawButtonTexture(ctx, width, height, UI_STYLES[style]));
}

export function getEntityTextureKey(entity: EntityState): string {
  return ENTITY_TEXTURE_KEYS[entity.definitionId as keyof typeof ENTITY_TEXTURE_KEYS] ?? ENTITY_TEXTURE_KEYS.caveman;
}

export function getEntityAnimationKey(entity: EntityState): string | null {
  return ANIMATION_KEYS[entity.definitionId as keyof typeof ANIMATION_KEYS] ?? null;
}

export function getProjectileTextureKey(projectile: ProjectileState): string {
  return PROJECTILE_TEXTURE_KEYS[getProjectileVisualStyle(projectile)];
}

export function getProjectileTextureKeyForStyle(style: ProjectileVisualStyle): string {
  return PROJECTILE_TEXTURE_KEYS[style];
}

export function getHudIconTextureKey(icon: keyof typeof HUD_ICON_KEYS): string {
  return HUD_ICON_KEYS[icon];
}

export function getProjectileAnimationKey(projectile: ProjectileState): string {
  return PROJECTILE_ANIMATION_KEYS[getProjectileVisualStyle(projectile)];
}

export function getProjectileVisualStyle(projectile: ProjectileState): ProjectileVisualStyle {
  return projectile.visualStyle;
}

export function getEntityOrigin(entity: EntityState): Phaser.Math.Vector2 {
  if (entity.entityType === "base") {
    return new Phaser.Math.Vector2(0.5, 0.58);
  }

  if (entity.entityType === "tower") {
    return new Phaser.Math.Vector2(0.5, 0.64);
  }

  if (
    entity.definitionId === "dino-rider"
    || entity.definitionId === "knight"
    || entity.definitionId === "cavalier"
    || entity.definitionId === "tank"
    || entity.definitionId === "titan-walker"
    || entity.definitionId === "omega-colossus"
  ) {
    return new Phaser.Math.Vector2(0.5, 0.6);
  }

  return new Phaser.Math.Vector2(0.5, 0.62);
}

export function fitDisplayObjectToBox(
  displayObject: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
  maxWidth: number,
  maxHeight: number,
): number {
  const sourceWidth = displayObject.width || displayObject.displayWidth || 1;
  const sourceHeight = displayObject.height || displayObject.displayHeight || 1;
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
  displayObject.setScale(scale);
  return scale;
}

export function spawnImpact(
  scene: Phaser.Scene,
  x: number,
  y: number,
  style: ProjectileVisualStyle,
  tint: number,
): void {
  const effect = scene.add.image(x, y, IMPACT_TEXTURE_KEYS[style]).setDepth(style === "meteor" ? 7 : 6);
  const config =
    style === "meteor"
      ? { alpha: 0.92, startScale: 0.74, endScale: 1.58, duration: 280, lift: -8 }
      : style === "arrow-rain"
        ? { alpha: 0.9, startScale: 0.78, endScale: 1.34, duration: 230, lift: -5 }
        : style === "ember"
        || style === "flask"
        ? { alpha: 0.9, startScale: 0.72, endScale: 1.32, duration: 210, lift: -6 }
        : style === "bomb"
          ? { alpha: 0.94, startScale: 0.76, endScale: 1.5, duration: 250, lift: -8 }
          : style === "plasma"
            ? { alpha: 0.92, startScale: 0.74, endScale: 1.4, duration: 210, lift: -4 }
            : style === "laser"
              ? { alpha: 0.9, startScale: 0.92, endScale: 1.2, duration: 150, lift: 0 }
              : style === "rocket"
                ? { alpha: 0.92, startScale: 0.78, endScale: 1.36, duration: 220, lift: -5 }
        : style === "fossil"
          || style === "bolt"
          || style === "cannonball"
          ? { alpha: 0.88, startScale: 0.78, endScale: 1.18, duration: 190, lift: -3 }
          : style === "bullet"
            ? { alpha: 0.82, startScale: 0.9, endScale: 1.1, duration: 120, lift: 0 }
          : { alpha: 0.84, startScale: 0.82, endScale: 1.14, duration: 180, lift: -2 };

  effect.setAlpha(config.alpha).setScale(config.startScale);
  effect.setRotation(Phaser.Math.FloatBetween(-0.18, 0.18));

  if (
    style === "ember"
    || style === "meteor"
    || style === "flask"
    || style === "arrow-rain"
    || style === "bomb"
    || style === "plasma"
    || style === "laser"
    || style === "rocket"
  ) {
    effect.setTint(tint);
  }

  scene.tweens.add({
    targets: effect,
    y: y + config.lift,
    scaleX: config.endScale,
    scaleY: config.endScale,
    alpha: 0,
    duration: config.duration,
    ease: style === "meteor" ? "Cubic.easeOut" : "Quad.easeOut",
    onComplete: () => effect.destroy(),
  });
}

export function spawnDust(scene: Phaser.Scene, x: number, y: number, tint: number): void {
  const puff = scene.add.image(x, y, "art/effect/dust").setTint(tint).setDepth(4).setAlpha(0.75);
  scene.tweens.add({
    targets: puff,
    y: y - 10,
    scaleX: 1.3,
    scaleY: 1.1,
    alpha: 0,
    duration: 320,
    onComplete: () => puff.destroy(),
  });
}

function registerAnimation(scene: Phaser.Scene, key: string): void {
  if (scene.anims.exists(key)) {
    return;
  }

  const config = IDLE_ANIMATIONS[key];
  if (!config) {
    return;
  }

  scene.anims.create({
    key,
    frames: config.frames.map((frame) => ({ key: frame })),
    frameRate: config.frameRate,
    repeat: -1,
  });
}

function ensureCanvasTexture(scene: Phaser.Scene, key: string, width: number, height: number, draw: DrawTexture): string {
  if (scene.textures.exists(key)) {
    return key;
  }

  const texture = scene.textures.createCanvas(key, width, height);
  if (!texture) {
    throw new Error(`Unable to create texture: ${key}`);
  }

  const ctx = texture.getContext();
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = false;
  draw(ctx, width, height);
  texture.refresh();
  return key;
}

function drawPanelTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: (typeof UI_STYLES)[keyof typeof UI_STYLES],
): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, style.top);
  gradient.addColorStop(0.18, style.base);
  gradient.addColorStop(1, style.bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = style.inset;
  ctx.fillRect(10, 10, width - 20, height - 20);
  ctx.fillStyle = withAlpha(style.glow, 0.08);
  ctx.fillRect(16, 16, width - 32, Math.max(8, height * 0.16));

  ctx.strokeStyle = style.border;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, width - 4, height - 4);
  ctx.strokeStyle = withAlpha(style.glow, 0.65);
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, width - 16, height - 16);

  ctx.fillStyle = withAlpha(style.glow, 0.12);
  for (let index = 0; index < width; index += 24) {
    ctx.fillRect(index, height - 12, 12, 4);
  }
}

function drawButtonTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: (typeof UI_STYLES)[keyof typeof UI_STYLES],
): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, style.top);
  gradient.addColorStop(0.2, style.inset);
  gradient.addColorStop(1, style.base);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = withAlpha(style.glow, 0.16);
  ctx.fillRect(8, 8, width - 16, Math.max(6, height * 0.18));
  ctx.fillStyle = withAlpha(style.bottom, 0.4);
  ctx.fillRect(6, height - 14, width - 12, 8);

  ctx.strokeStyle = style.border;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, width - 4, height - 4);
  ctx.strokeStyle = withAlpha(style.glow, 0.5);
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, width - 16, height - 16);
}

function drawSunTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 16, width / 2, height / 2, width / 2);
  gradient.addColorStop(0, "#fff3c2");
  gradient.addColorStop(0.35, "#f8c05f");
  gradient.addColorStop(1, "rgba(255, 183, 87, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255, 225, 170, 0.18)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 60, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCloudTexture(ctx: CanvasRenderingContext2D, width: number): void {
  ctx.fillStyle = "rgba(248, 242, 224, 0.8)";
  ctx.beginPath();
  ctx.ellipse(42, 44, 32, 22, 0, 0, Math.PI * 2);
  ctx.ellipse(72, 34, 32, 24, 0, 0, Math.PI * 2);
  ctx.ellipse(102, 44, 36, 24, 0, 0, Math.PI * 2);
  ctx.ellipse(78, 50, 52, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(175, 190, 214, 0.22)";
  ctx.fillRect(24, 52, width - 48, 8);
}

function drawMountainTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(101, 130, 160, 0.28)");
  gradient.addColorStop(1, "rgba(42, 63, 89, 0.72)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(20, height - 8);
  ctx.lineTo(width * 0.36, 26);
  ctx.lineTo(width * 0.52, height * 0.48);
  ctx.lineTo(width * 0.66, 48);
  ctx.lineTo(width - 18, height - 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(211, 226, 242, 0.18)";
  ctx.beginPath();
  ctx.moveTo(width * 0.34, 34);
  ctx.lineTo(width * 0.46, height * 0.34);
  ctx.lineTo(width * 0.56, height * 0.26);
  ctx.lineTo(width * 0.48, 18);
  ctx.closePath();
  ctx.fill();
}

function drawFernTexture(ctx: CanvasRenderingContext2D): void {
  fill(ctx, "#2e4d37", 36, 8, 8, 68);
  fill(ctx, "#5e8a57", 12, 34, 28, 10);
  fill(ctx, "#6fa765", 8, 46, 28, 10);
  fill(ctx, "#7db96c", 16, 18, 24, 10);
  fill(ctx, "#5e8a57", 40, 34, 28, 10);
  fill(ctx, "#6fa765", 44, 46, 28, 10);
  fill(ctx, "#7db96c", 40, 18, 24, 10);
}

function drawRockTexture(ctx: CanvasRenderingContext2D): void {
  fill(ctx, "#4a5160", 8, 18, 44, 18);
  fill(ctx, "#717b8c", 12, 12, 40, 10);
  fill(ctx, "#8f9aab", 18, 8, 20, 6);
  fill(ctx, "#343a44", 16, 26, 28, 8);
}

function drawBoneTexture(ctx: CanvasRenderingContext2D): void {
  fill(ctx, "#efe3c0", 14, 12, 48, 12);
  fill(ctx, "#d7c390", 18, 16, 40, 4);
  fill(ctx, "#efe3c0", 6, 10, 14, 16);
  fill(ctx, "#efe3c0", 54, 10, 14, 16);
}

function drawTowerSlotTexture(ctx: CanvasRenderingContext2D): void {
  fill(ctx, "#8a6b3f", 6, 6, 12, 12);
  fill(ctx, "#deb56f", 8, 8, 8, 8);
  ctx.strokeStyle = "rgba(255, 237, 193, 0.7)";
  ctx.lineWidth = 2;
  ctx.strokeRect(3, 3, 18, 18);
}

function drawAgeAdvanceIconTexture(ctx: CanvasRenderingContext2D): void {
  fill(ctx, "#2a2034", 16, 26, 16, 14);
  fill(ctx, "#4f7db5", 12, 14, 24, 14);
  fill(ctx, "#9fc8ff", 18, 4, 12, 14);
  fill(ctx, "#ffffff", 22, 8, 4, 6);
  fill(ctx, "#d6ecff", 20, 18, 8, 8);
  fill(ctx, "#f6d59e", 14, 36, 20, 6);
}

function drawSellTowerIconTexture(ctx: CanvasRenderingContext2D): void {
  fill(ctx, "#6d553b", 10, 22, 14, 16);
  fill(ctx, "#9e7b54", 8, 16, 18, 10);
  fill(ctx, "#f5d18b", 28, 12, 10, 10);
  fill(ctx, "#dba845", 30, 14, 6, 6);
  fill(ctx, "#f5d18b", 22, 26, 10, 10);
  fill(ctx, "#dba845", 24, 28, 6, 6);
  fill(ctx, "#ff8a73", 34, 28, 10, 4);
  fill(ctx, "#ff8a73", 37, 22, 4, 16);
}

function drawStoneImpactTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "rgba(132, 104, 76, 0.62)";
  ctx.beginPath();
  ctx.ellipse(width / 2, height - 10, 22, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(width / 2 - 12, height - 14, 12, 6, -0.2, 0, Math.PI * 2);
  ctx.ellipse(width / 2 + 10, height - 15, 11, 6, 0.2, 0, Math.PI * 2);
  ctx.fill();

  fill(ctx, "#c8d2dc", 12, 18, 8, 8);
  fill(ctx, "#8e99aa", 14, 20, 4, 4);
  fill(ctx, "#d9e2ea", 24, 8, 10, 10);
  fill(ctx, "#8e99aa", 28, 12, 4, 4);
  fill(ctx, "#c8d2dc", 40, 20, 8, 8);
  fill(ctx, "#8e99aa", 42, 22, 4, 4);
  fill(ctx, "#eef3f7", 30, 16, 4, 4);
}

function drawFossilImpactTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "rgba(122, 92, 60, 0.54)";
  ctx.beginPath();
  ctx.ellipse(width / 2, height - 10, 24, 9, 0, 0, Math.PI * 2);
  ctx.ellipse(width / 2 - 16, height - 15, 12, 6, -0.35, 0, Math.PI * 2);
  ctx.ellipse(width / 2 + 14, height - 14, 11, 6, 0.28, 0, Math.PI * 2);
  ctx.fill();

  fill(ctx, "#f5dfb5", 12, 18, 6, 18);
  fill(ctx, "#d7b07a", 14, 20, 2, 12);
  fill(ctx, "#f5dfb5", 24, 8, 8, 22);
  fill(ctx, "#8a6139", 28, 12, 2, 12);
  fill(ctx, "#f5dfb5", 42, 16, 6, 16);
  fill(ctx, "#d7b07a", 44, 18, 2, 10);
  fill(ctx, "#fff0d0", 28, 14, 2, 4);
}

function drawEmberImpactTexture(ctx: CanvasRenderingContext2D): void {
  fill(ctx, "#f48f4b", 16, 18, 8, 20);
  fill(ctx, "#f48f4b", 24, 10, 8, 28);
  fill(ctx, "#f48f4b", 32, 16, 8, 22);
  fill(ctx, "#ffd36e", 20, 18, 4, 12);
  fill(ctx, "#ffd36e", 28, 14, 4, 14);
  fill(ctx, "#ffd36e", 36, 20, 4, 10);
  fill(ctx, "#fff5bf", 28, 18, 4, 8);
  fill(ctx, "#f48f4b", 10, 24, 4, 4);
  fill(ctx, "#f48f4b", 42, 24, 4, 4);
  fill(ctx, "#ffd36e", 12, 16, 4, 4);
  fill(ctx, "#ffd36e", 40, 14, 4, 4);
}

function drawMeteorImpactTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "rgba(124, 86, 58, 0.56)";
  ctx.beginPath();
  ctx.ellipse(width / 2, height - 14, 30, 12, 0, 0, Math.PI * 2);
  ctx.ellipse(width / 2 - 18, height - 22, 16, 8, -0.25, 0, Math.PI * 2);
  ctx.ellipse(width / 2 + 16, height - 22, 16, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();

  fill(ctx, "#d86a34", 34, 16, 16, 18);
  fill(ctx, "#f5ae5c", 30, 22, 24, 12);
  fill(ctx, "#ffea9e", 38, 24, 8, 8);
  fill(ctx, "#f5ae5c", 18, 10, 8, 10);
  fill(ctx, "#f5ae5c", 56, 12, 8, 10);
  fill(ctx, "#d86a34", 12, 18, 6, 8);
  fill(ctx, "#d86a34", 66, 20, 6, 8);
  fill(ctx, "#ffcf7f", 8, 26, 4, 6);
  fill(ctx, "#ffcf7f", 74, 24, 4, 6);
}

function drawDustTexture(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "rgba(228, 207, 168, 0.85)";
  ctx.beginPath();
  ctx.ellipse(18, 22, 12, 9, 0, 0, Math.PI * 2);
  ctx.ellipse(32, 18, 16, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(42, 24, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawStoneProjectileTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  if (frame === 0) {
    fill(ctx, "#7c8795", 6, 8, 16, 12);
    fill(ctx, "#c8d2dc", 8, 6, 12, 14);
    fill(ctx, "#8e99aa", 10, 10, 10, 8);
    fill(ctx, "#eef3f7", 10, 8, 4, 4);
    fill(ctx, "#74808d", 18, 14, 4, 4);
  } else {
    fill(ctx, "#7c8795", 8, 6, 12, 16);
    fill(ctx, "#c8d2dc", 6, 8, 14, 12);
    fill(ctx, "#8e99aa", 10, 10, 8, 10);
    fill(ctx, "#eef3f7", 14, 8, 4, 4);
    fill(ctx, "#74808d", 8, 18, 4, 4);
  }
}

function drawFossilProjectileTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  if (frame === 0) {
    fill(ctx, "#d7b07a", 8, 10, 18, 10);
    fill(ctx, "#f5dfb5", 6, 8, 8, 14);
    fill(ctx, "#f5dfb5", 20, 12, 8, 14);
    fill(ctx, "#8a6139", 14, 12, 6, 8);
    fill(ctx, "#fff0d0", 10, 10, 2, 4);
    fill(ctx, "#fff0d0", 24, 16, 2, 4);
  } else {
    fill(ctx, "#d7b07a", 10, 8, 14, 12);
    fill(ctx, "#f5dfb5", 8, 12, 8, 14);
    fill(ctx, "#f5dfb5", 18, 6, 8, 14);
    fill(ctx, "#8a6139", 14, 12, 6, 8);
    fill(ctx, "#fff0d0", 22, 10, 2, 4);
    fill(ctx, "#fff0d0", 12, 18, 2, 4);
  }
}

function drawEmberProjectileTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  if (frame === 0) {
    fill(ctx, "#f48f4b", 12, 6, 8, 20);
    fill(ctx, "#f48f4b", 8, 12, 16, 12);
    fill(ctx, "#ffd36e", 12, 12, 8, 10);
    fill(ctx, "#fff5bf", 14, 14, 4, 4);
    fill(ctx, "#f48f4b", 20, 10, 4, 6);
  } else {
    fill(ctx, "#f48f4b", 10, 8, 10, 18);
    fill(ctx, "#f48f4b", 14, 6, 8, 20);
    fill(ctx, "#ffd36e", 14, 12, 8, 10);
    fill(ctx, "#fff5bf", 16, 14, 4, 4);
    fill(ctx, "#ffd36e", 10, 18, 4, 4);
  }
}

function drawMeteorProjectileTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#d86a34", 14, 18, 18, 18);
  fill(ctx, "#f5ae5c", 18, 20, 14, 14);
  fill(ctx, "#ffea9e", 22, 24, 6, 6);
  if (frame === 0) {
    fill(ctx, "#ffd184", 18, 4, 6, 14);
    fill(ctx, "#f6a34f", 24, 8, 6, 16);
    fill(ctx, "#ffcf7f", 14, 8, 4, 10);
  } else {
    fill(ctx, "#ffd184", 16, 6, 8, 12);
    fill(ctx, "#f6a34f", 24, 4, 8, 18);
    fill(ctx, "#ffcf7f", 30, 10, 4, 10);
  }
}

function drawArrowImpactTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "rgba(110, 82, 54, 0.48)";
  ctx.beginPath();
  ctx.ellipse(width / 2, height - 10, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  fill(ctx, "#8c5b38", 18, 10, 4, 22);
  fill(ctx, "#8c5b38", 30, 14, 4, 20);
  fill(ctx, "#d2c3a0", 16, 8, 8, 6);
  fill(ctx, "#d2c3a0", 28, 12, 8, 6);
  fill(ctx, "#ebe0c0", 20, 28, 4, 6);
  fill(ctx, "#ebe0c0", 32, 30, 4, 4);
}

function drawBoltImpactTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "rgba(94, 70, 46, 0.56)";
  ctx.beginPath();
  ctx.ellipse(width / 2, height - 10, 26, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  fill(ctx, "#6f4e2f", 24, 10, 6, 24);
  fill(ctx, "#6f4e2f", 36, 14, 6, 22);
  fill(ctx, "#c6b188", 20, 8, 12, 8);
  fill(ctx, "#c6b188", 32, 12, 12, 8);
  fill(ctx, "#8b6f4d", 18, 30, 10, 4);
  fill(ctx, "#8b6f4d", 40, 32, 10, 4);
}

function drawFlaskImpactTexture(ctx: CanvasRenderingContext2D): void {
  fill(ctx, "#d96e37", 16, 20, 10, 22);
  fill(ctx, "#ffb45e", 20, 16, 14, 24);
  fill(ctx, "#ffe29a", 24, 18, 8, 12);
  fill(ctx, "#f18842", 10, 28, 6, 8);
  fill(ctx, "#f18842", 42, 24, 6, 10);
  fill(ctx, "#ffd36e", 14, 14, 4, 6);
  fill(ctx, "#ffd36e", 40, 14, 4, 6);
}

function drawArrowRainImpactTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "rgba(120, 84, 52, 0.52)";
  ctx.beginPath();
  ctx.ellipse(width / 2, height - 12, 28, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  fill(ctx, "#8c5b38", 18, 10, 4, 28);
  fill(ctx, "#8c5b38", 32, 6, 4, 32);
  fill(ctx, "#8c5b38", 46, 12, 4, 26);
  fill(ctx, "#e4d3af", 16, 8, 8, 6);
  fill(ctx, "#e4d3af", 30, 4, 8, 6);
  fill(ctx, "#e4d3af", 44, 10, 8, 6);
  fill(ctx, "#ffd98f", 24, 22, 6, 8);
  fill(ctx, "#ffd98f", 38, 20, 6, 8);
}

function drawArrowProjectileTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#d9cfb3", frame === 0 ? 4 : 6, 6, 12, 4);
  fill(ctx, "#8a5e38", 14, 6, 18, 4);
  fill(ctx, "#d9cfb3", 28, 4, 8, 8);
  fill(ctx, "#f1e6c8", 30, 2, 4, 12);
}

function drawBoltProjectileTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#d4c19d", frame === 0 ? 4 : 8, 6, 10, 6);
  fill(ctx, "#7c5635", 14, 6, 20, 6);
  fill(ctx, "#c9b086", 28, 2, 10, 14);
  fill(ctx, "#efe4ca", 32, 4, 4, 10);
}

function drawFlaskProjectileTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#8b6f4d", 14, 22, 8, 6);
  fill(ctx, "#c7a271", 10, 10, 16, 16);
  fill(ctx, frame === 0 ? "#f4a154" : "#ffcf7d", 12, 12, 12, 12);
  fill(ctx, "#fff1ba", 16, 14, 4, 4);
  fill(ctx, "#714b2f", 14, 6, 8, 6);
}

function drawArrowRainProjectileTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#8c5b38", 14, 10, 6, 20);
  fill(ctx, "#ead8b2", 12, 6, 10, 8);
  fill(ctx, frame === 0 ? "#ffcf7f" : "#ffe29a", 10, 2, 14, 8);
  fill(ctx, "#fff2c8", 14, 4, 6, 4);
}

function drawCavemanTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#6a4324", 36, 18, 6, 28);
  fill(ctx, "#99643a", 40, 12, 8, 12);
  fill(ctx, "#3a2618", 20, 8, 18, 10);
  fill(ctx, "#ddb782", 18, 16, 18, 14);
  fill(ctx, "#1f1711", 30, 20, 2, 2);
  fill(ctx, "#1f1711", 34, 20, 2, 2);
  fill(ctx, "#8a5731", 16, 28, 22, 20);
  fill(ctx, "#c58a51", 18, 30, 18, 6);
  fill(ctx, "#7b5136", 12, 30, 6, 12);
  fill(ctx, "#ddb782", 14, 36, 4, 12);
  if (frame === 0) {
    fill(ctx, "#8a5731", 18, 48, 8, 16);
    fill(ctx, "#8a5731", 30, 48, 6, 14);
  } else {
    fill(ctx, "#8a5731", 18, 50, 6, 14);
    fill(ctx, "#8a5731", 28, 46, 8, 18);
  }
  fill(ctx, "#4a2f1e", 18, 60, 8, 4);
  fill(ctx, "#4a2f1e", 28, 60, 8, 4);
}

function drawStonethrowerTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#4a3522", 8, 18, 6, 28);
  fill(ctx, "#7b5b34", 6, 14, 10, 10);
  fill(ctx, "#28333f", 22, 10, 16, 10);
  fill(ctx, "#e1c195", 20, 18, 16, 14);
  fill(ctx, "#1b1511", 30, 22, 2, 2);
  fill(ctx, "#5c7e92", 18, 30, 18, 18);
  fill(ctx, "#90a9bd", 18, 30, 18, 6);
  fill(ctx, "#c5cfd9", 38, 18, 10, 10);
  fill(ctx, "#5f4a33", 38, 28, 6, 12);
  if (frame === 0) {
    fill(ctx, "#5c7e92", 20, 48, 8, 16);
    fill(ctx, "#5c7e92", 30, 50, 6, 14);
  } else {
    fill(ctx, "#5c7e92", 20, 50, 6, 14);
    fill(ctx, "#5c7e92", 28, 46, 8, 18);
  }
  fill(ctx, "#324250", 18, 62, 8, 4);
  fill(ctx, "#324250", 28, 62, 8, 4);
}

function drawDinoRiderTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#4d7e45", 18, 34, 44, 22);
  fill(ctx, "#6ca260", 18, 26, 38, 14);
  fill(ctx, "#85ba6f", 26, 22, 24, 10);
  fill(ctx, "#304c2d", 54, 24, 18, 14);
  fill(ctx, "#6ca260", 62, 18, 12, 12);
  fill(ctx, "#f0e0ab", 70, 22, 6, 4);
  fill(ctx, "#5b4332", 24, 18, 10, 10);
  fill(ctx, "#c9975c", 28, 12, 10, 10);
  fill(ctx, "#7d5635", 32, 22, 4, 12);
  if (frame === 0) {
    fill(ctx, "#4d7e45", 22, 54, 10, 18);
    fill(ctx, "#4d7e45", 40, 54, 10, 16);
    fill(ctx, "#4d7e45", 56, 52, 8, 18);
    fill(ctx, "#4d7e45", 68, 50, 8, 20);
  } else {
    fill(ctx, "#4d7e45", 22, 52, 10, 20);
    fill(ctx, "#4d7e45", 40, 56, 10, 14);
    fill(ctx, "#4d7e45", 56, 54, 8, 16);
    fill(ctx, "#4d7e45", 68, 48, 8, 22);
  }
  fill(ctx, "#2f4728", 24, 70, 8, 4);
  fill(ctx, "#2f4728", 42, 70, 8, 4);
  fill(ctx, "#2f4728", 58, 70, 8, 4);
  fill(ctx, "#2f4728", 70, 70, 8, 4);
  fill(ctx, "#3f6f38", 12, 44, 10, 6);
  fill(ctx, "#4d7e45", 10, 42, 12, 8);
}

function drawStoneGuardTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#7b858f", 14, 18, 28, 58);
  fill(ctx, "#545d66", 10, 26, 36, 12);
  fill(ctx, "#adb7c1", 18, 14, 20, 10);
  fill(ctx, "#d7bf89", 18, 34, 8, 8);
  fill(ctx, "#1d2026", 22, 38, 4, 8);
  fill(ctx, "#d7bf89", 30, 34, 8, 8);
  fill(ctx, "#1d2026", 34, 38, 4, 8);
  fill(ctx, "#3a434c", 18, 62, 20, 8);
  fill(ctx, "#63717c", 8, 72, 40, 10);
  fill(ctx, frame === 0 ? "#b8c7d6" : "#dce8f2", 24, 12, 8, 4);
}

function drawFossilCatapultTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#7c5a3b", 12, 54, 38, 10);
  fill(ctx, "#5d3f28", 18, 22, 8, 34);
  fill(ctx, "#5d3f28", 36, 22, 8, 34);
  fill(ctx, "#aa855c", 10, 18, 42, 8);
  fill(ctx, "#d7c191", 22, 28, 18, 12);
  fill(ctx, "#5d3f28", 26, 32, 4, 4);
  fill(ctx, "#5d3f28", 34, 32, 4, 4);
  fill(ctx, "#d7c191", 26 + (frame === 0 ? 0 : 4), 6, 14, 10);
  fill(ctx, "#7c5a3b", 32 + (frame === 0 ? 0 : 4), 14, 4, 14);
  fill(ctx, "#6b4a31", 18, 64, 8, 18);
  fill(ctx, "#6b4a31", 34, 64, 8, 18);
}

function drawEmberTotemTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#6b4028", 18, 20, 16, 50);
  fill(ctx, "#8d5632", 12, 24, 28, 10);
  fill(ctx, "#281812", 20, 34, 4, 4);
  fill(ctx, "#281812", 28, 34, 4, 4);
  fill(ctx, "#281812", 24, 46, 4, 10);
  fill(ctx, "#a56a41", 10, 70, 32, 8);
  fill(ctx, frame === 0 ? "#f4a154" : "#ffce78", 18, 4, 16, 16);
  fill(ctx, frame === 0 ? "#ffd77b" : "#fff3bb", 22, 8, 8, 8);
}

function drawSwordsmanTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#5a6470", 10, 18, 6, 30);
  fill(ctx, "#b8c3cf", 20, 10, 16, 12);
  fill(ctx, "#efcf9f", 22, 18, 14, 12);
  fill(ctx, "#23262c", 28, 22, 2, 2);
  fill(ctx, "#8b3a2d", 20, 30, 18, 18);
  fill(ctx, "#d5e0ec", 38, 22, 10, 14);
  fill(ctx, "#7d5736", 42, 26, 4, 10);
  if (frame === 0) {
    fill(ctx, "#5f6d7b", 22, 48, 8, 18);
    fill(ctx, "#5f6d7b", 32, 50, 6, 16);
  } else {
    fill(ctx, "#5f6d7b", 22, 50, 6, 16);
    fill(ctx, "#5f6d7b", 30, 46, 8, 20);
  }
  fill(ctx, "#34404c", 22, 64, 8, 4);
  fill(ctx, "#34404c", 30, 64, 8, 4);
}

function drawArcherTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#4f653a", 10, 18, 6, 28);
  fill(ctx, "#779459", 20, 10, 16, 12);
  fill(ctx, "#efcf9f", 20, 18, 14, 12);
  fill(ctx, "#23262c", 26, 22, 2, 2);
  fill(ctx, "#5f7b48", 18, 30, 18, 18);
  fill(ctx, "#8c5b38", 36, 18, 4, 30);
  fill(ctx, "#d9cfb3", 38, 18, 8, 4);
  fill(ctx, "#d9cfb3", 38, 42, 8, 4);
  if (frame === 0) {
    fill(ctx, "#5f7b48", 20, 48, 8, 16);
    fill(ctx, "#5f7b48", 30, 50, 6, 14);
  } else {
    fill(ctx, "#5f7b48", 20, 50, 6, 14);
    fill(ctx, "#5f7b48", 28, 46, 8, 18);
  }
  fill(ctx, "#38482d", 20, 62, 8, 4);
  fill(ctx, "#38482d", 28, 62, 8, 4);
}

function drawKnightTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#6d737b", 18, 34, 46, 22);
  fill(ctx, "#8d959f", 18, 26, 40, 14);
  fill(ctx, "#aeb8c2", 24, 22, 26, 10);
  fill(ctx, "#43484f", 58, 22, 18, 14);
  fill(ctx, "#aeb8c2", 64, 18, 12, 12);
  fill(ctx, "#f0e0ab", 70, 22, 6, 4);
  fill(ctx, "#7d2c23", 24, 18, 12, 10);
  fill(ctx, "#d7dfe7", 28, 12, 12, 10);
  fill(ctx, "#8c5b38", 36, 22, 4, 12);
  if (frame === 0) {
    fill(ctx, "#6d737b", 22, 54, 10, 18);
    fill(ctx, "#6d737b", 40, 54, 10, 16);
    fill(ctx, "#6d737b", 56, 52, 8, 18);
    fill(ctx, "#6d737b", 68, 50, 8, 20);
  } else {
    fill(ctx, "#6d737b", 22, 52, 10, 20);
    fill(ctx, "#6d737b", 40, 56, 10, 14);
    fill(ctx, "#6d737b", 56, 54, 8, 16);
    fill(ctx, "#6d737b", 68, 48, 8, 22);
  }
  fill(ctx, "#3a4148", 24, 70, 8, 4);
  fill(ctx, "#3a4148", 42, 70, 8, 4);
  fill(ctx, "#3a4148", 58, 70, 8, 4);
  fill(ctx, "#3a4148", 70, 70, 8, 4);
  fill(ctx, "#8d2020", 12, 42, 10, 8);
}

function drawArrowTowerTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#8d6842", 14, 18, 28, 56);
  fill(ctx, "#67492e", 10, 26, 36, 10);
  fill(ctx, "#b79873", 18, 14, 20, 10);
  fill(ctx, "#3b2618", 20, 38, 4, 12);
  fill(ctx, "#3b2618", 32, 38, 4, 12);
  fill(ctx, "#d4ccb8", 24, 26, 8, 10);
  fill(ctx, "#7d2c23", 18, 10, 20, 4);
  fill(ctx, "#74563b", 8, 72, 40, 10);
  fill(ctx, frame === 0 ? "#e4d3af" : "#fff0cf", 22, 20, 10, 4);
}

function drawBallistaTowerTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#7c5a39", 14, 56, 42, 8);
  fill(ctx, "#5b4028", 22, 24, 8, 34);
  fill(ctx, "#5b4028", 40, 24, 8, 34);
  fill(ctx, "#b28d68", 12, 20, 46, 8);
  fill(ctx, "#d9cfb3", 18, 30, 30, 10);
  fill(ctx, "#6d4e34", 24, 12 + (frame === 0 ? 0 : 4), 22, 6);
  fill(ctx, "#d9cfb3", 44 + (frame === 0 ? 0 : 4), 8, 10, 10);
  fill(ctx, "#6d4e34", 18, 66, 8, 16);
  fill(ctx, "#6d4e34", 40, 66, 8, 16);
}

function drawFireCauldronTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#6a4830", 18, 26, 18, 42);
  fill(ctx, "#8a5f3e", 12, 30, 30, 10);
  fill(ctx, "#2e1d14", 20, 40, 4, 4);
  fill(ctx, "#2e1d14", 30, 40, 4, 4);
  fill(ctx, "#6a4830", 12, 70, 30, 8);
  fill(ctx, frame === 0 ? "#f2974c" : "#ffd07c", 16, 10, 20, 16);
  fill(ctx, frame === 0 ? "#ffd98a" : "#fff2c6", 22, 14, 8, 8);
  fill(ctx, "#7c2f1f", 18, 18, 4, 8);
  fill(ctx, "#7c2f1f", 30, 18, 4, 8);
}

function drawBaseTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#7b5436", 42, 58, 100, 170);
  fill(ctx, "#a06b43", 48, 64, 88, 166);
  fill(ctx, "#d8a15f", 34, 52, 116, 18);
  fill(ctx, "#cfb67d", 30, 68, 124, 12);
  fill(ctx, "#e7cf8c", 54, 62, 16, 16);
  fill(ctx, "#e7cf8c", 84, 62, 16, 16);
  fill(ctx, "#e7cf8c", 114, 62, 16, 16);
  fill(ctx, "#7b5436", 38, 180, 10, 48);
  fill(ctx, "#7b5436", 136, 180, 10, 48);
  fill(ctx, "#2d1d16", 72, 126, 40, 102);
  fill(ctx, "#5b3b22", 70, 124, 44, 104);
  fill(ctx, "#2d1d16", 78, 132, 28, 96);
  fill(ctx, "#8b6544", 54, 188, 80, 24);
  fill(ctx, "#705138", 48, 206, 88, 18);
  fill(ctx, "#5a4331", 36, 222, 112, 12);
  fill(ctx, "#362a21", 30, 234, 124, 6);
  fill(ctx, "#516c78", 38, 90, 12, 28);
  fill(ctx, "#516c78", 134, 90, 12, 28);
  fill(ctx, frame === 0 ? "#f7a14d" : "#ffd77f", 44, 96, 4, 10);
  fill(ctx, frame === 0 ? "#f7a14d" : "#ffd77f", 136, 96, 4, 10);
  fill(ctx, frame === 0 ? "#ffdf95" : "#fff6cf", 42, 92, 8, 8);
  fill(ctx, frame === 0 ? "#ffdf95" : "#fff6cf", 134, 92, 8, 8);
}

function drawMedievalBaseTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#757c84", 34, 74, 128, 154);
  fill(ctx, "#9aa2ab", 40, 80, 116, 146);
  fill(ctx, "#c6b792", 28, 68, 140, 16);
  fill(ctx, "#dadee4", 34, 86, 20, 60);
  fill(ctx, "#dadee4", 74, 86, 20, 60);
  fill(ctx, "#dadee4", 114, 86, 20, 60);
  fill(ctx, "#dadee4", 142, 86, 20, 60);
  fill(ctx, "#6b727a", 28, 60, 140, 16);
  fill(ctx, "#dcdfe5", 40, 56, 22, 16);
  fill(ctx, "#dcdfe5", 86, 56, 22, 16);
  fill(ctx, "#dcdfe5", 132, 56, 22, 16);
  fill(ctx, "#333942", 78, 132, 40, 96);
  fill(ctx, "#5b6168", 74, 128, 48, 100);
  fill(ctx, "#2b3138", 84, 136, 28, 92);
  fill(ctx, "#8c2e28", 34, 96, 12, 30);
  fill(ctx, "#8c2e28", 146, 96, 12, 30);
  fill(ctx, frame === 0 ? "#d9b45f" : "#ffe39a", 38, 102, 4, 12);
  fill(ctx, frame === 0 ? "#d9b45f" : "#ffe39a", 150, 102, 4, 12);
  fill(ctx, "#5f6870", 30, 226, 136, 10);
  fill(ctx, "#474d55", 24, 236, 148, 6);
}

function drawCannonballImpactTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "rgba(92, 76, 68, 0.62)";
  ctx.beginPath();
  ctx.ellipse(width / 2, height - 12, 24, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  fill(ctx, "#6f737c", 18, 14, 12, 12);
  fill(ctx, "#9aa2ab", 22, 18, 4, 4);
  fill(ctx, "#6f737c", 34, 8, 14, 14);
  fill(ctx, "#b9c1c9", 38, 12, 4, 4);
  fill(ctx, "#6f737c", 52, 18, 10, 10);
  fill(ctx, "#aab3bd", 54, 20, 4, 4);
}

function drawBulletImpactTexture(ctx: CanvasRenderingContext2D): void {
  fill(ctx, "#ffe6a9", 18, 8, 16, 4);
  fill(ctx, "#ffe6a9", 24, 2, 4, 20);
  fill(ctx, "#ffb85a", 12, 10, 12, 2);
  fill(ctx, "#ffb85a", 30, 10, 12, 2);
  fill(ctx, "#ffb85a", 24, 0, 4, 8);
  fill(ctx, "#ffb85a", 24, 14, 4, 8);
}

function drawRocketImpactTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "rgba(98, 95, 110, 0.46)";
  ctx.beginPath();
  ctx.ellipse(width / 2 - 10, height - 16, 18, 10, -0.1, 0, Math.PI * 2);
  ctx.ellipse(width / 2 + 12, height - 18, 22, 12, 0.14, 0, Math.PI * 2);
  ctx.fill();
  fill(ctx, "#ff955f", 24, 18, 16, 18);
  fill(ctx, "#ffd07a", 30, 12, 8, 16);
  fill(ctx, "#ffcf78", 42, 22, 10, 12);
  fill(ctx, "#ff955f", 50, 16, 12, 18);
  fill(ctx, "#fbe7b5", 32, 18, 6, 10);
}

function drawBombImpactTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "rgba(108, 78, 72, 0.54)";
  ctx.beginPath();
  ctx.ellipse(width / 2, height - 16, 28, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  fill(ctx, "#ff8d62", 24, 26, 20, 18);
  fill(ctx, "#ffc76a", 18, 18, 24, 18);
  fill(ctx, "#ffe79c", 28, 10, 18, 20);
  fill(ctx, "#ffb24f", 44, 20, 18, 18);
  fill(ctx, "#ff8d62", 56, 28, 14, 14);
  fill(ctx, "#f7f1c7", 34, 18, 8, 12);
}

function drawPlasmaImpactTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "rgba(92, 255, 242, 0.18)";
  ctx.beginPath();
  ctx.ellipse(width / 2, height / 2, 24, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  fill(ctx, "#7ffff1", 26, 18, 8, 8);
  fill(ctx, "#dfffff", 34, 24, 10, 10);
  fill(ctx, "#7ffff1", 44, 18, 8, 8);
  fill(ctx, "#63d8ff", 32, 10, 6, 8);
  fill(ctx, "#63d8ff", 32, 36, 6, 8);
}

function drawLaserImpactTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  fill(ctx, "rgba(248, 183, 255, 0.26)", 14, 8, width - 28, height - 16);
  fill(ctx, "#f7b0ff", 22, 12, width - 44, 10);
  fill(ctx, "#fff4ff", 28, 14, width - 56, 6);
  fill(ctx, "#b56cff", 40, 8, 10, height - 16);
  fill(ctx, "#b56cff", width - 50, 8, 10, height - 16);
}

function drawCannonballProjectileTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#3f434a", 8, 8, 20, 20);
  fill(ctx, "#69707a", 10, 10, 16, 16);
  fill(ctx, frame === 0 ? "#c2cad1" : "#ffffff", 14, 12, 6, 6);
}

function drawBulletProjectileTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, frame === 0 ? "#ffd996" : "#fff3cf", 8, 4, 18, 4);
  fill(ctx, "#ffb85a", 4, 4, 8, 4);
}

function drawRocketProjectileTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#b8c1cc", 12, 4, 18, 8);
  fill(ctx, "#ff855f", 6, 4, 8, 8);
  fill(ctx, "#d64242", 22, 2, 8, 12);
  fill(ctx, frame === 0 ? "#ffd27a" : "#fff3c0", 2, 6, 6, 4);
}

function drawBombProjectileTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#4f5963", 12, 12, 20, 20);
  fill(ctx, "#808996", 14, 14, 16, 16);
  fill(ctx, "#d6a66d", 26, 6, 4, 8);
  fill(ctx, frame === 0 ? "#ff9e5e" : "#ffe29b", 26, 2, 4, 4);
}

function drawPlasmaProjectileTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "rgba(118, 255, 244, 0.28)", 4, 4, 28, 28);
  fill(ctx, "#7ffff1", 10, 10, 16, 16);
  fill(ctx, frame === 0 ? "#dfffff" : "#ffffff", 14, 14, 8, 8);
}

function drawLaserProjectileTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, frame === 0 ? "#f7b0ff" : "#ffffff", 8, 4, 36, 4);
  fill(ctx, "#b56cff", 4, 2, 8, 8);
}

function drawMusketeerTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#2c1d19", 18, 54, 10, 14);
  fill(ctx, "#2c1d19", 34, 54, 10, 14);
  fill(ctx, "#2c1d19", 30, 26, 10, 32);
  fill(ctx, "#8b4338", 24, 22, 22, 22);
  fill(ctx, "#d8b28b", 26, 10, 18, 18);
  fill(ctx, "#1f1613", 20, 4, 30, 8);
  fill(ctx, "#6a2323", 14, 10, 42, 6);
  fill(ctx, "#d9c689", 44, 16 + frame, 6, 24);
  fill(ctx, "#b7bfc8", 46, 40, 6, 18);
}

function drawCannoneerTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#2d3038", 18, 56, 10, 14);
  fill(ctx, "#2d3038", 34, 56, 10, 14);
  fill(ctx, "#40546c", 22, 26, 22, 30);
  fill(ctx, "#d9bb91", 24, 12, 18, 18);
  fill(ctx, "#717b8c", 22, 8, 22, 8);
  fill(ctx, "#464d59", 40, 28, 14, 10);
  fill(ctx, "#7f8c9c", 46, 24 + frame, 12, 12);
  fill(ctx, "#3a424f", 52, 28 + frame, 10, 6);
  fill(ctx, "#d9b86d", 12, 34, 10, 6);
}

function drawCavalierTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#6d5037", 18, 54, 56, 20);
  fill(ctx, "#8a6846", 20, 46, 54, 14);
  fill(ctx, "#4a3220", 22, 72, 10, 14);
  fill(ctx, "#4a3220", 42, 74 - frame, 10, 14);
  fill(ctx, "#4a3220", 62, 72, 10, 14);
  fill(ctx, "#2f2531", 36, 28, 20, 24);
  fill(ctx, "#d7b58a", 38, 16, 16, 16);
  fill(ctx, "#9e2f33", 34, 12, 24, 8);
  fill(ctx, "#d9c689", 64, 24 + frame, 16, 4);
  fill(ctx, "#d9c689", 76, 20 + frame, 4, 18);
}

function drawGroundInfantryTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#30372f", 18, 58, 10, 14);
  fill(ctx, "#30372f", 34, 58, 10, 14);
  fill(ctx, "#5b6f5d", 22, 28, 22, 32);
  fill(ctx, "#d0b08b", 24, 12, 18, 18);
  fill(ctx, "#6b7465", 20, 8, 22, 8);
  fill(ctx, "#353d43", 42, 28, 14, 8);
  fill(ctx, "#4b555d", 44, 34 + frame, 14, 6);
  fill(ctx, "#b3bcc2", 52, 26, 8, 18);
}

function drawMachineGunnerTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#2f353a", 16, 58, 10, 14);
  fill(ctx, "#2f353a", 32, 58, 10, 14);
  fill(ctx, "#55636e", 18, 26, 26, 32);
  fill(ctx, "#d3b38d", 20, 12, 18, 18);
  fill(ctx, "#6c7b87", 16, 8, 24, 8);
  fill(ctx, "#2f353a", 40, 30, 18, 10);
  fill(ctx, "#7b8792", 46, 26 + frame, 14, 10);
  fill(ctx, "#ffcf78", 58, 30 + frame, 4, 4);
  fill(ctx, "#97a4af", 42, 40, 14, 10);
}

function drawTankTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#3d5142", 18, 50, 64, 18);
  fill(ctx, "#556e5c", 22, 44, 56, 12);
  fill(ctx, "#2d342f", 18, 66, 64, 10);
  fill(ctx, "#758b7a", 34, 32, 36, 16);
  fill(ctx, "#556e5c", 42, 22, 20, 14);
  fill(ctx, "#2d342f", 60, 28 + frame, 26, 6);
  fill(ctx, "#ffb76a", 84, 28 + frame, 8, 4);
  fill(ctx, "#1e241f", 26, 68, 10, 6);
  fill(ctx, "#1e241f", 44, 68, 10, 6);
  fill(ctx, "#1e241f", 62, 68, 10, 6);
}

function drawSentinelsTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#273554", 18, 58, 10, 14);
  fill(ctx, "#273554", 34, 58, 10, 14);
  fill(ctx, "#4a6ea4", 20, 26, 24, 34);
  fill(ctx, "#9acaff", 22, 12, 20, 16);
  fill(ctx, "#f6ffff", 26, 16, 4, 4);
  fill(ctx, "#f6ffff", 34, 16, 4, 4);
  fill(ctx, "#63d8ff", 44, 26 + frame, 8, 20);
  fill(ctx, "#63d8ff", 10, 30, 8, 12);
}

function drawPlasmaRangerTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#212f45", 18, 58, 10, 14);
  fill(ctx, "#212f45", 34, 58, 10, 14);
  fill(ctx, "#235a68", 20, 26, 24, 34);
  fill(ctx, "#cde6e9", 22, 12, 20, 16);
  fill(ctx, "#75fff2", 42, 28, 16, 8);
  fill(ctx, "#3dd8ff", 48, 24 + frame, 12, 16);
  fill(ctx, "#dfffff", 54, 28 + frame, 4, 8);
}

function drawTitanWalkerTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#2e3568", 24, 56, 64, 18);
  fill(ctx, "#5363a6", 28, 44, 56, 16);
  fill(ctx, "#98a9ff", 38, 28, 36, 18);
  fill(ctx, "#dff0ff", 46, 20, 20, 12);
  fill(ctx, "#3b4684", 30, 72, 10, 18);
  fill(ctx, "#3b4684", 72, 72 - frame, 10, 18);
  fill(ctx, "#7ffff1", 84, 34, 18, 6);
  fill(ctx, "#f7b0ff", 96, 30 + frame, 10, 14);
}

function drawOmegaColossusTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#2a2250", 22, 78, 92, 24);
  fill(ctx, "#53488f", 26, 62, 84, 22);
  fill(ctx, "#8a7dff", 42, 38, 50, 24);
  fill(ctx, "#f0dbff", 52, 20, 30, 18);
  fill(ctx, "#1f1a3c", 30, 102, 14, 20);
  fill(ctx, "#1f1a3c", 54, 104 - frame * 2, 14, 20);
  fill(ctx, "#1f1a3c", 82, 104, 14, 20);
  fill(ctx, "#1f1a3c", 106, 102 + frame * 2, 14, 20);
  fill(ctx, "#f0a8ff", 92, 46, 30, 10);
  fill(ctx, "#ffffff", 114, 48, 10, 6);
  fill(ctx, "#7ffff1", 12, 70, 18, 12);
  fill(ctx, "#7ffff1", 30, 66, 18, 12);
  fill(ctx, "#b9c7ff", 116, 58, 16, 12);
  fill(ctx, "#9b8cff", 122, 54 + frame, 12, 18);
}

function drawArquebusTowerTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#70563c", 20, 72, 20, 20);
  fill(ctx, "#9d7c54", 18, 66, 24, 10);
  fill(ctx, "#4a3423", 24, 18, 12, 50);
  fill(ctx, "#2d3239", 32, 26 + frame, 18, 6);
  fill(ctx, "#7b8792", 48, 24 + frame, 10, 8);
  fill(ctx, "#ffcf78", 56, 26 + frame, 4, 4);
}

function drawBombardTowerTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#7e7c79", 18, 72, 32, 20);
  fill(ctx, "#a2a09d", 16, 64, 36, 12);
  fill(ctx, "#52565d", 28, 28, 20, 16);
  fill(ctx, "#6c737d", 40, 24 + frame, 18, 10);
  fill(ctx, "#ffb76a", 56, 26 + frame, 6, 4);
  fill(ctx, "#4c3524", 20, 58, 8, 10);
  fill(ctx, "#4c3524", 40, 58, 8, 10);
}

function drawAlchemistTowerTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#6b7a55", 18, 70, 22, 22);
  fill(ctx, "#91a871", 16, 62, 26, 12);
  fill(ctx, "#4d5d3a", 24, 20, 12, 42);
  fill(ctx, "#d7c9a1", 20, 18, 20, 8);
  fill(ctx, "#f0bb63", 22, 34, 16, 18);
  fill(ctx, frame === 0 ? "#ffd57f" : "#fff5ba", 24, 36, 12, 12);
}

function drawGunTurretTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#5b656e", 18, 72, 28, 20);
  fill(ctx, "#808d97", 18, 64, 28, 12);
  fill(ctx, "#3b4249", 24, 42, 16, 24);
  fill(ctx, "#3b4249", 36, 34 + frame, 18, 8);
  fill(ctx, "#d1d7dd", 52, 34 + frame, 8, 4);
}

function drawGatlingGunTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#7e6b46", 18, 72, 28, 20);
  fill(ctx, "#a18b5c", 18, 64, 28, 12);
  fill(ctx, "#44484c", 24, 44, 12, 20);
  fill(ctx, "#44484c", 36, 34, 18, 4);
  fill(ctx, "#44484c", 36, 40, 18, 4);
  fill(ctx, "#44484c", 36, 46, 18, 4);
  fill(ctx, "#ffcf78", 52, 34 + frame, 4, 4);
}

function drawMissileLauncherTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#6c5b5b", 18, 72, 28, 20);
  fill(ctx, "#8f7878", 18, 64, 28, 12);
  fill(ctx, "#47515a", 20, 34, 24, 20);
  fill(ctx, "#ff855f", 24, 28 + frame, 6, 14);
  fill(ctx, "#ff855f", 34, 24 + frame, 6, 14);
  fill(ctx, "#e7edf1", 24, 26 + frame, 6, 4);
  fill(ctx, "#e7edf1", 34, 22 + frame, 6, 4);
}

function drawPulseTurretTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#2c5d78", 18, 72, 28, 20);
  fill(ctx, "#4990b0", 18, 64, 28, 12);
  fill(ctx, "#153043", 24, 38, 16, 26);
  fill(ctx, "#7ffff1", 22, 26, 20, 12);
  fill(ctx, frame === 0 ? "#a8ffff" : "#ffffff", 26, 30, 12, 4);
}

function drawDroneBayTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#505a8e", 18, 72, 32, 20);
  fill(ctx, "#737fd1", 18, 64, 32, 12);
  fill(ctx, "#2b3260", 22, 40, 24, 24);
  fill(ctx, "#9ecbff", 30, 32, 8, 8);
  fill(ctx, "#7ffff1", 40, 26 + frame, 12, 12);
  fill(ctx, "#dfffff", 44, 30 + frame, 4, 4);
}

function drawIonBlasterTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#594d8f", 18, 72, 30, 20);
  fill(ctx, "#7b6ac4", 18, 64, 30, 12);
  fill(ctx, "#2e2355", 24, 42, 18, 22);
  fill(ctx, "#f7b0ff", 26, 28, 14, 16);
  fill(ctx, frame === 0 ? "#fff4ff" : "#dfffff", 40, 30, 14, 6);
}

function drawRenaissanceBaseTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#9b7b58", 30, 88, 142, 144);
  fill(ctx, "#c8ae86", 36, 94, 130, 136);
  fill(ctx, "#e0d2b4", 30, 80, 142, 14);
  fill(ctx, "#856341", 28, 70, 146, 16);
  fill(ctx, "#754b3a", 80, 138, 42, 94);
  fill(ctx, "#3d2822", 86, 144, 30, 88);
  fill(ctx, "#b22f34", 36, 102, 12, 34);
  fill(ctx, "#b22f34", 154, 102, 12, 34);
  fill(ctx, frame === 0 ? "#f2d282" : "#fff1be", 40, 108, 4, 14);
  fill(ctx, frame === 0 ? "#f2d282" : "#fff1be", 158, 108, 4, 14);
  fill(ctx, "#7b6144", 24, 232, 154, 10);
  fill(ctx, "#574635", 18, 242, 166, 6);
}

function drawModernBaseTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#656a63", 26, 98, 156, 140);
  fill(ctx, "#878d84", 32, 104, 144, 132);
  fill(ctx, "#484d49", 74, 148, 60, 90);
  fill(ctx, "#262a27", 82, 156, 44, 82);
  fill(ctx, "#9aa39e", 38, 86, 26, 18);
  fill(ctx, "#9aa39e", 88, 86, 26, 18);
  fill(ctx, "#9aa39e", 138, 86, 26, 18);
  fill(ctx, "#526b79", 144, 60, 10, 36);
  fill(ctx, "#d5dfeb", 146, 54, 6, 12);
  fill(ctx, "#ff8d62", 146, 68 + frame, 6, 6);
  fill(ctx, "#55605a", 20, 238, 168, 12);
  fill(ctx, "#39413d", 14, 250, 180, 6);
}

function drawFutureBaseTexture(ctx: CanvasRenderingContext2D, frame: number): void {
  fill(ctx, "#434a86", 28, 92, 160, 150);
  fill(ctx, "#6672c5", 34, 98, 148, 142);
  fill(ctx, "#9ea8ff", 72, 64, 72, 34);
  fill(ctx, "#e6f3ff", 88, 72, 40, 18);
  fill(ctx, "#28306a", 80, 142, 56, 100);
  fill(ctx, "#151b43", 90, 150, 36, 92);
  fill(ctx, "#7ffff1", 40, 114, 10, 48);
  fill(ctx, "#7ffff1", 166, 114, 10, 48);
  fill(ctx, frame === 0 ? "#f7b0ff" : "#ffffff", 44, 118, 4, 18);
  fill(ctx, frame === 0 ? "#f7b0ff" : "#ffffff", 170, 118, 4, 18);
  fill(ctx, "#6370c6", 22, 242, 172, 12);
  fill(ctx, "#414d8a", 16, 254, 184, 6);
}

function withAlpha(hex: string, alpha: number): string {
  const color = Phaser.Display.Color.HexStringToColor(hex);
  return `rgba(${color.red}, ${color.green}, ${color.blue}, ${alpha})`;
}

function fill(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, width: number, height: number): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}
