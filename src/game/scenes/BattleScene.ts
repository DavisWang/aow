import Phaser from "phaser";
import { audioController } from "../audio/controller";
import {
  CAMERA_EDGE_SCROLL_ZONE,
  CAMERA_SCROLL_SPEED,
  CAMERA_TOP_EDGE_SCROLL_BAND_HEIGHT,
  CAMERA_TOP_EDGE_SCROLL_ZONE,
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_Y,
  HUD_HEIGHT,
  PLAYFIELD_HEIGHT,
  WORLD_WIDTH,
} from "../config";
import { DEFAULT_AI_SCRIPT, getNextAgeDefinition, getUnitDefinition, STARTING_AGE } from "../data/ages";
import {
  activateSuper,
  advanceAge,
  canAffordTower,
  canAdvanceAge,
  canAffordUnit,
  cloneAISteps,
  consumeAudioEvents,
  countUnitsForSide,
  createInitialMatchState,
  getAgeForSide,
  getBuildQueue,
  getBuildQueueCapacity,
  getSuperCooldownRemaining,
  getTowerCount,
  purchaseTower,
  purchaseUnit,
  sellTower,
  updateMatchState,
} from "../systems/match";
import { AgeDefinition, AgeId, AIScriptStep, EntityState, MatchMode, MatchState, Side } from "../types";
import {
  ensureArt,
  ensureButtonTexture,
  ensurePanelTexture,
  fitDisplayObjectToBox,
  getEntityAnimationKey,
  getHudIconTextureKey,
  getEntityOrigin,
  getEntityTextureKey,
  getProjectileAnimationKey,
  getProjectileTextureKey,
  getProjectileTextureKeyForStyle,
  getProjectileVisualStyle,
  ProjectileVisualStyle,
  spawnDust,
  spawnImpact,
} from "../render/art";
import { AudioToggleView, createAudioToggle } from "../ui/audioToggle";
import { getCameraEdgeScrollDelta, getKeyboardCameraScrollDelta } from "../ui/cameraScroll";
import { fitTextToBox } from "../ui/textFit";

interface EntityView {
  container: Phaser.GameObjects.Container;
  shadow: Phaser.GameObjects.Ellipse;
  sprite: Phaser.GameObjects.Sprite;
  hpFrame: Phaser.GameObjects.Rectangle;
  hpBackground: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
  hpHighlight: Phaser.GameObjects.Rectangle;
  hpMaxWidth: number;
  label: Phaser.GameObjects.Text;
  lastX: number;
  currentDefinitionId?: string;
  towerSlots?: Phaser.GameObjects.Image[];
}

interface ProjectileView {
  body: Phaser.GameObjects.Sprite;
  style: ProjectileVisualStyle;
  spawnedAt: number;
  rotationOffset: number;
  spinRate: number;
}

interface ActionButton {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  onClick: () => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  setLabel: (label: string) => void;
  setIcon?: (textureKey: string) => void;
}

interface QueueSlotView {
  fill: Phaser.GameObjects.Rectangle;
  border: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

interface BattleSceneData {
  mode?: MatchMode;
}

const TEST_MODE_PLAYER_MONEY = 999_999;
const TEST_MODE_PLAYER_XP = 9_999;
const TEST_MODE_ENEMY_MONEY = 999_999;

export class BattleScene extends Phaser.Scene {
  private mode: MatchMode = "standard";
  private state!: MatchState;
  private aiSteps: AIScriptStep[] = [];
  private hud!: Phaser.GameObjects.Container;
  private topControls!: Phaser.GameObjects.Container;
  private entityViews = new Map<string, EntityView>();
  private projectileViews = new Map<string, ProjectileView>();
  private baseViews!: Record<Side, EntityView>;
  private unitMenuButtons: { button: ActionButton; unitId: string; cost: number }[] = [];
  private towerMenuButtons: { button: ActionButton; towerId: string; cost: number }[] = [];
  private statusText!: Phaser.GameObjects.Text;
  private moneyText!: Phaser.GameObjects.Text;
  private xpText!: Phaser.GameObjects.Text;
  private playerBaseText!: Phaser.GameObjects.Text;
  private enemyBaseText!: Phaser.GameObjects.Text;
  private queueLabelText!: Phaser.GameObjects.Text;
  private queueSlots: QueueSlotView[] = [];
  private unitMenu!: Phaser.GameObjects.Container;
  private towerMenu!: Phaser.GameObjects.Container;
  private currentMenuAgeId: AgeId | null = null;
  private superButton!: ActionButton;
  private ageButton!: ActionButton;
  private towerSellOverlay!: Phaser.GameObjects.Container;
  private towerSellOverlayButton!: Phaser.GameObjects.Arc;
  private towerSellOverlayLabel!: Phaser.GameObjects.Text;
  private titleOverlay!: Phaser.GameObjects.Container;
  private overlayTitleText!: Phaser.GameObjects.Text;
  private overlaySubtitleText!: Phaser.GameObjects.Text;
  private resultOverlay!: Phaser.GameObjects.Container;
  private resultRetryButton!: ActionButton;
  private audioToggle?: AudioToggleView;
  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  private testModeEnemyUnitCursor = 0;
  private selectedPlayerTowerId: string | null = null;

  constructor() {
    super("battle");
  }

  create(data?: BattleSceneData): void {
    // The battle scene owns rendering and input. The match system owns the
    // actual rules so UI iteration and gameplay iteration stay decoupled.
    this.mode = data?.mode ?? this.resolveModeFromUrl();
    this.state = createInitialMatchState(STARTING_AGE);
    this.aiSteps = cloneAISteps(DEFAULT_AI_SCRIPT);
    this.entityViews.clear();
    this.projectileViews.clear();
    this.unitMenuButtons = [];
    this.towerMenuButtons = [];
    this.currentMenuAgeId = null;
    this.testModeEnemyUnitCursor = 0;
    this.selectedPlayerTowerId = null;

    ensureArt(this);
    audioController.startBattleMusic();
    this.input.once("pointerdown", async () => {
      await audioController.unlock();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.audioToggle?.destroy();
      this.audioToggle = undefined;
      audioController.stopBattleMusic();
    });

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, PLAYFIELD_HEIGHT);
    this.cameras.main.setBackgroundColor(0x688db0);
    this.cameras.main.setRoundPixels(true);

    this.drawWorld();
    this.baseViews = {
      player: this.createBaseView("player"),
      enemy: this.createBaseView("enemy"),
    };
    this.createHud();
    this.createOverlays();
    this.createTowerSellOverlay();
    this.audioToggle = createAudioToggle(this, GAME_WIDTH - 34, 36);
    this.audioToggle.container.setDepth(180);
    this.cursorKeys = this.input.keyboard?.createCursorKeys();
    this.applyModeOverrides();
    this.syncFixedUi();
    this.syncWorldViews();
    this.refreshHud();
  }

  update(_: number, deltaMs: number): void {
    const dt = Math.min(deltaMs / 1000, 0.033);

    this.applyModeOverrides();

    if (this.state.phase === "active") {
      updateMatchState(this.state, dt, this.aiSteps);
      this.applyModeOverrides();
    }

    this.playPendingAudioEvents();

    this.rebuildAgeMenusIfNeeded();
    this.updateCameraScroll(dt);
    this.syncFixedUi();
    this.syncWorldViews();
    this.refreshHud();

    if (this.state.phase === "ended" && !this.resultOverlay.visible) {
      this.showResultOverlay();
    }
  }

  private drawWorld(): void {
    this.add.rectangle(WORLD_WIDTH / 2, PLAYFIELD_HEIGHT / 2, WORLD_WIDTH, PLAYFIELD_HEIGHT, 0x6f97b7);
    this.add.rectangle(WORLD_WIDTH / 2, 220, WORLD_WIDTH, 420, 0x90b1c8, 0.28);

    const sun = this.add.image(360, 180, "art/world/sun").setScrollFactor(0.12).setAlpha(0.94);
    this.tweens.add({
      targets: sun,
      scale: 1.12,
      duration: 3400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    for (let index = 0; index < 5; index += 1) {
      const cloud = this.add
        .image(160 + index * 520, 120 + (index % 2) * 56, "art/world/cloud")
        .setScrollFactor(0.2)
        .setAlpha(0.72 - index * 0.06)
        .setScale(0.9 + (index % 2) * 0.18);
      this.tweens.add({
        targets: cloud,
        x: cloud.x + (index % 2 === 0 ? 80 : -100),
        duration: 16000 + index * 1800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    for (let index = 0; index < 10; index += 1) {
      const mountain = this.add
        .image(120 + index * 280, GROUND_Y - 122 - (index % 2) * 12, "art/world/mountain")
        .setOrigin(0.5, 1)
        .setScale(0.72 + (index % 3) * 0.08)
        .setAlpha(0.48 + (index % 2) * 0.08);
      mountain.setScrollFactor(0.34 + (index % 3) * 0.03, 1);
    }

    this.add.rectangle(WORLD_WIDTH / 2, PLAYFIELD_HEIGHT - 74, WORLD_WIDTH, 148, 0x875f3a);
    this.add.rectangle(WORLD_WIDTH / 2, PLAYFIELD_HEIGHT - 50, WORLD_WIDTH, 104, 0x6b4b2d, 0.5);
    this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y + 12, WORLD_WIDTH, 54, 0x507b47);
    this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y - 10, WORLD_WIDTH, 6, 0xe8d89d, 0.56);

    for (let index = 0; index < 22; index += 1) {
      const fern = this.add
        .image(80 + index * 118, GROUND_Y + 18 - (index % 2) * 4, "art/world/fern")
        .setAlpha(0.58)
        .setScale(0.52 + (index % 3) * 0.06);
      if (index % 2 === 0) {
        fern.setFlipX(true);
      }
    }

    for (let index = 0; index < 15; index += 1) {
      this.add
        .image(120 + index * 164, GROUND_Y + 8 + (index % 3) * 5, "art/world/rock")
        .setAlpha(0.4)
        .setScale(0.66 + (index % 2) * 0.08);
    }

    for (let index = 0; index < 8; index += 1) {
      this.add
        .image(230 + index * 310, GROUND_Y - 8 + (index % 2) * 6, "art/world/bone")
        .setAlpha(0.34)
        .setScale(0.78 + (index % 2) * 0.08);
    }
  }

  private resolveModeFromUrl(): MatchMode {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("mode") === "test" ? "test" : "standard";
  }

  private applyModeOverrides(): void {
    if (this.mode !== "test") {
      return;
    }

    this.state.economies.player.money = TEST_MODE_PLAYER_MONEY;
    this.state.economies.player.experience = TEST_MODE_PLAYER_XP;
    this.state.economies.enemy.money = TEST_MODE_ENEMY_MONEY;
    this.state.economies.enemy.experience = TEST_MODE_PLAYER_XP;
    this.state.cooldowns.superReadyAt.player = this.state.elapsedTime;

    if (this.state.phase !== "active") {
      return;
    }

    while (this.state.buildQueues.enemy.length < getBuildQueueCapacity()) {
      const enemyAgeUnits = getAgeForSide(this.state, "enemy").units;
      const unitId = enemyAgeUnits[this.testModeEnemyUnitCursor % enemyAgeUnits.length]?.id;
      if (!unitId) {
        break;
      }
      purchaseUnit(this.state, "enemy", unitId);
      this.testModeEnemyUnitCursor += 1;
    }
  }

  private createHealthBar(y: number, frameWidth: number, frameHeight: number, fillColor: number): {
    hpFrame: Phaser.GameObjects.Rectangle;
    hpBackground: Phaser.GameObjects.Rectangle;
    hpFill: Phaser.GameObjects.Rectangle;
    hpHighlight: Phaser.GameObjects.Rectangle;
    hpMaxWidth: number;
  } {
    const hpFrame = this.add.rectangle(0, y, frameWidth, frameHeight, 0x24160f, 0.98);
    hpFrame.setStrokeStyle(2, 0xf0d69a, 0.82);

    const trackWidth = Math.max(8, frameWidth - 8);
    const trackHeight = Math.max(4, frameHeight - 8);
    const hpBackground = this.add.rectangle(0, y, trackWidth, trackHeight, 0x55241a, 1);
    hpBackground.setStrokeStyle(1, 0x1a0e09, 0.75);

    const hpMaxWidth = Math.max(6, trackWidth);
    const fillHeight = Math.max(3, trackHeight - 2);
    const hpFill = this.add.rectangle(-hpMaxWidth / 2, y, hpMaxWidth, fillHeight, fillColor, 1);
    hpFill.setOrigin(0, 0.5);
    hpFill.setStrokeStyle(1, 0x1f4d27, 0.22);

    const hpHighlight = this.add.rectangle(
      -hpMaxWidth / 2,
      y - Math.max(1, fillHeight * 0.18),
      hpMaxWidth,
      Math.max(2, fillHeight * 0.34),
      0xf4fff1,
      0.18,
    );
    hpHighlight.setOrigin(0, 0.5);

    return { hpFrame, hpBackground, hpFill, hpHighlight, hpMaxWidth };
  }

  private createBaseView(side: Side): EntityView {
    const base = this.state.bases[side];
    const container = this.add.container(base.x, base.y).setDepth(1);
    const shadow = this.add.ellipse(0, base.bodyHeight / 2 - 10, base.bodyWidth + 24, 30, 0x24150f, 0.3);
    const sprite = this.add.sprite(0, 0, `${getEntityTextureKey(base)}-0`);
    sprite.setOrigin(getEntityOrigin(base).x, getEntityOrigin(base).y);
    const animationKey = getEntityAnimationKey(base);
    if (animationKey) {
      sprite.play(animationKey);
    }
    fitDisplayObjectToBox(sprite, base.bodyWidth + 36, base.bodyHeight + 28);
    const { hpFrame, hpBackground, hpFill, hpHighlight, hpMaxWidth } = this.createHealthBar(
      -base.bodyHeight / 2 - 30,
      base.bodyWidth + 28,
      18,
      0x78e381,
    );
    const label = this.add
      .text(0, -base.bodyHeight / 2 - 58, side === "player" ? "YOUR BASE" : "ENEMY BASE", {
        fontFamily: "Courier New",
        fontSize: "18px",
        color: "#fff0cf",
        stroke: "#26170f",
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    fitTextToBox(label, { maxWidth: base.bodyWidth + 50, maxHeight: 24, minFontSize: 12 });

    container.add([shadow, sprite, hpFrame, hpBackground, hpFill, hpHighlight, label]);
    const view: EntityView = {
      container,
      shadow,
      sprite,
      hpFrame,
      hpBackground,
      hpFill,
      hpHighlight,
      hpMaxWidth,
      label,
      lastX: base.x,
      currentDefinitionId: base.definitionId,
      towerSlots: [],
    };
    this.syncBaseTowerSlots(side, view);
    return view;
  }

  private syncBaseTowerSlots(side: Side, view: EntityView): void {
    const age = getAgeForSide(this.state, side);
    const base = this.state.bases[side];
    const towerSlots = view.towerSlots ?? [];

    while (towerSlots.length > age.base.towerSlots) {
      const slot = towerSlots.pop();
      slot?.destroy();
    }

    for (let index = 0; index < age.base.towerSlots; index += 1) {
      let slot = towerSlots[index];
      if (!slot) {
        slot = this.add.image(0, 0, "art/world/tower-slot").setAlpha(0.72);
        towerSlots[index] = slot;
        view.container.add(slot);
      }
      slot.setPosition(age.base.towerSlotOffsets[index] ?? 0, -base.bodyHeight / 2 + 18);
    }

    view.towerSlots = towerSlots;
    view.label.setDepth(3);
  }

  private rebuildAgeMenusIfNeeded(force = false): void {
    const playerAge = getAgeForSide(this.state, "player");
    if (!force && this.currentMenuAgeId === playerAge.id) {
      return;
    }

    const unitMenuVisible = this.unitMenu?.visible ?? false;
    const towerMenuVisible = this.towerMenu?.visible ?? false;

    if (this.unitMenu) {
      this.unitMenu.destroy();
    }

    if (this.towerMenu) {
      this.towerMenu.destroy();
    }

    this.unitMenuButtons = [];
    this.towerMenuButtons = [];
    this.unitMenu = this.createUnitMenu(playerAge);
    this.towerMenu = this.createTowerMenu(playerAge);
    this.unitMenu.setVisible(unitMenuVisible);
    this.towerMenu.setVisible(towerMenuVisible);
    this.hud.add([this.unitMenu, this.towerMenu]);
    this.currentMenuAgeId = playerAge.id;
  }

  private createHud(): void {
    // The bottom HUD is camera-anchored in world space so rendered positions
    // and interactive hit areas stay aligned after horizontal scrolling.
    const hud = this.add.container(0, GAME_HEIGHT - HUD_HEIGHT).setDepth(100);
    this.hud = hud;
    const panelKey = ensurePanelTexture(this, "ui/battle/hud-1440x180", GAME_WIDTH, HUD_HEIGHT, "hud");
    const panel = this.add.image(GAME_WIDTH / 2, HUD_HEIGHT / 2, panelKey);
    hud.add(panel);

    this.playerBaseText = this.add.text(32, 16, "", {
      fontFamily: "Courier New",
      fontSize: "16px",
      color: "#f7efdc",
    });

    this.enemyBaseText = this.add.text(32, 40, "", {
      fontFamily: "Courier New",
      fontSize: "16px",
      color: "#ffbfaa",
    });

    this.moneyText = this.add.text(32, 66, "", {
      fontFamily: "Courier New",
      fontSize: "22px",
      color: "#f7da7a",
    });

    this.xpText = this.add.text(32, 94, "", {
      fontFamily: "Courier New",
      fontSize: "16px",
      color: "#abd9ff",
    });

    this.queueLabelText = this.add.text(32, 120, "", {
      fontFamily: "Courier New",
      fontSize: "14px",
      color: "#f7efdc",
    });
    this.queueSlots = [];

    const queueStartX = 32;
    const queueSlotWidth = 34;
    const queueSlotHeight = 22;
    const queueGap = 8;
    for (let index = 0; index < getBuildQueueCapacity(); index += 1) {
      const slotX = queueStartX + index * (queueSlotWidth + queueGap);
      const fill = this.add.rectangle(slotX, 148, queueSlotWidth, queueSlotHeight, 0x27303d).setOrigin(0, 0.5);
      fill.setStrokeStyle(2, 0xc99553, 0.12);
      const border = this.add.rectangle(slotX, 148, queueSlotWidth, queueSlotHeight, 0x000000, 0).setOrigin(0, 0.5);
      border.setStrokeStyle(2, 0xf1c577, 0.55);
      const label = this.add
        .text(slotX + queueSlotWidth / 2, 148, "", {
          fontFamily: "Courier New",
          fontSize: "13px",
          color: "#f7efdc",
          align: "center",
        })
        .setOrigin(0.5);
      this.queueSlots.push({ fill, border, label });
    }

    hud.add([
      this.playerBaseText,
      this.enemyBaseText,
      this.moneyText,
      this.xpText,
      this.queueLabelText,
      ...this.queueSlots.flatMap((slot) => [slot.fill, slot.border, slot.label]),
    ]);

    const buyUnitsButton = this.createButton(458, 50, 188, 56, "BUY UNITS", () => {
      this.unitMenu.setVisible(!this.unitMenu.visible);
      if (this.unitMenu.visible) {
        this.towerMenu.setVisible(false);
      }
    });
    const buyTowersButton = this.createButton(458, 118, 188, 56, "BUY TOWERS", () => {
      this.towerMenu.setVisible(!this.towerMenu.visible);
      if (this.towerMenu.visible) {
        this.unitMenu.setVisible(false);
      }
    });
    hud.add([buyUnitsButton.container, buyTowersButton.container]);

    this.statusText = this.add
      .text(1400, 88, "", {
        fontFamily: "Courier New",
        fontSize: "18px",
        color: "#f6efd7",
        align: "right",
      })
      .setOrigin(1, 0.5);
    hud.add(this.statusText);

    this.createTopControls();
    this.rebuildAgeMenusIfNeeded(true);
  }

  private createTopControls(): void {
    // Utility actions sit above the battlefield so opening purchase submenus
    // never obscures cooldown-driven controls.
    this.topControls = this.add.container(24, 84).setDepth(140);
    const panelKey = ensurePanelTexture(this, "ui/battle/top-controls-188x124", 188, 124, "hud");
    const panel = this.add.image(0, 0, panelKey).setOrigin(0);

    this.superButton = this.createIconButton(
      94,
      34,
      164,
      44,
      `${getProjectileTextureKeyForStyle(getAgeForSide(this.state, "player").super.visualStyle)}-0`,
      () => {
        activateSuper(this.state, "player");
      },
    );

    this.ageButton = this.createIconButton(94, 88, 164, 44, getHudIconTextureKey("ageAdvance"), () => {
      if (advanceAge(this.state, "player")) {
        this.unitMenu.setVisible(false);
        this.towerMenu.setVisible(false);
        this.rebuildAgeMenusIfNeeded(true);
      }
    });
    this.ageButton.setEnabled(false);
    this.topControls.add([panel, this.superButton.container, this.ageButton.container]);
  }

  private createUnitMenu(age: AgeDefinition): Phaser.GameObjects.Container {
    const menu = this.add.container(640, 12).setDepth(120);
    menu.setVisible(false);
    const panelWidth = 154 + Math.max(0, age.units.length - 1) * 138;
    const panelKey = ensurePanelTexture(this, `ui/battle/unit-menu-${panelWidth}x144`, panelWidth, 144, "banner");
    const panel = this.add.image(0, 0, panelKey).setOrigin(0);
    menu.add(panel);

    age.units.forEach((unit, index) => {
      const button = this.createButton(74 + index * 138, 72, 124, 108, "", () => {
        purchaseUnit(this.state, "player", unit.id);
      });
      const icon = this.add.sprite(
        0,
        -24,
        `${getEntityTextureKey({ ...this.state.bases.player, entityType: "unit", definitionId: unit.id })}-0`,
      );
      const animationKey = getEntityAnimationKey({ ...this.state.bases.player, entityType: "unit", definitionId: unit.id });
      if (animationKey) {
        icon.play(animationKey);
      }
      fitDisplayObjectToBox(icon, 72, 40);
      button.container.add(icon);
      this.decorateShopCardButton(button, icon, unit.name, unit.cost);
      this.unitMenuButtons.push({ button, unitId: unit.id, cost: unit.cost });
      menu.add(button.container);
    });

    return menu;
  }

  private createTowerMenu(age: AgeDefinition): Phaser.GameObjects.Container {
    const menu = this.add.container(640, 12).setDepth(120);
    menu.setVisible(false);
    const panelKey = ensurePanelTexture(this, "ui/battle/tower-menu-430x144", 430, 144, "banner");
    const panel = this.add.image(0, 0, panelKey).setOrigin(0);
    menu.add(panel);

    age.towers.forEach((tower, index) => {
      const button = this.createButton(74 + index * 138, 72, 124, 108, "", () => {
        purchaseTower(this.state, "player", tower.id);
      });
      const icon = this.add.sprite(
        0,
        -24,
        `${getEntityTextureKey({ ...this.state.bases.player, entityType: "tower", definitionId: tower.id })}-0`,
      );
      const animationKey = getEntityAnimationKey({ ...this.state.bases.player, entityType: "tower", definitionId: tower.id });
      if (animationKey) {
        icon.play(animationKey);
      }
      fitDisplayObjectToBox(icon, 64, 42);
      button.container.add(icon);
      this.decorateShopCardButton(button, icon, tower.name, tower.cost);
      this.towerMenuButtons.push({ button, towerId: tower.id, cost: tower.cost });
      menu.add(button.container);
    });

    return menu;
  }

  private createOverlays(): void {
    this.titleOverlay = this.add.container(GAME_WIDTH / 2, 76).setDepth(80);
    const bannerKey = ensurePanelTexture(this, "ui/battle/title-banner-420x74", 420, 74, "banner");
    const banner = this.add.image(0, 0, bannerKey);
    this.overlayTitleText = this.add
      .text(0, -8, "AGE OF WAR", {
        fontFamily: "Courier New",
        fontSize: "28px",
        color: "#fff1d0",
      })
      .setOrigin(0.5);
    fitTextToBox(this.overlayTitleText, { maxWidth: 340, maxHeight: 26, minFontSize: 16 });
    this.overlaySubtitleText = this.add
      .text(0, 20, "", {
        fontFamily: "Courier New",
        fontSize: "16px",
        color: "#ecd59d",
      })
      .setOrigin(0.5);
    fitTextToBox(this.overlaySubtitleText, { maxWidth: 392, maxHeight: 24, minFontSize: 10 });
    this.titleOverlay.add([banner, this.overlayTitleText, this.overlaySubtitleText]);

    this.resultOverlay = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(250);
    const veil = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x04070b, 0.72);
    const panelKey = ensurePanelTexture(this, "ui/battle/result-panel-460x250", 460, 250, "banner");
    const panel = this.add.image(0, 0, panelKey);
    const heading = this.add
      .text(0, -56, "BATTLE OVER", {
        fontFamily: "Courier New",
        fontSize: "40px",
        color: "#fff0d1",
      })
      .setOrigin(0.5);
    fitTextToBox(heading, { maxWidth: 360, maxHeight: 44, minFontSize: 18 });
    const body = this.add
      .text(0, 8, "", {
        fontFamily: "Courier New",
        fontSize: "24px",
        color: "#f5d897",
        align: "center",
      })
      .setOrigin(0.5);
    this.resultRetryButton = this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 82, 240, 60, "PLAY AGAIN", () => {
      this.scene.start("battle", { mode: this.mode });
    });
    this.resultRetryButton.container.setDepth(260);
    this.resultRetryButton.container.setVisible(false);
    this.resultOverlay.add([veil, panel, heading, body]);
    this.add.existing(this.resultRetryButton.container);
    this.resultOverlay.setData("body", body);
    this.resultOverlay.setVisible(false);
  }

  private createTowerSellOverlay(): void {
    this.towerSellOverlay = this.add.container(0, 0).setDepth(25).setVisible(false);
    this.towerSellOverlayButton = this.add.circle(0, 0, 15, 0xa92b2b, 0.96);
    this.towerSellOverlayButton.setStrokeStyle(2, 0xffd9c3, 0.92);
    this.towerSellOverlayButton.setInteractive({ useHandCursor: true });
    this.towerSellOverlayLabel = this.add
      .text(0, 0, "X", {
        fontFamily: "Courier New",
        fontSize: "18px",
        color: "#fff8f1",
        stroke: "#2a0a0a",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.towerSellOverlay.add([this.towerSellOverlayButton, this.towerSellOverlayLabel]);

    this.towerSellOverlayButton.on("pointerover", () => {
      this.towerSellOverlayButton.setFillStyle(0xc63737, 1);
      this.towerSellOverlay.setScale(1.05);
    });

    this.towerSellOverlayButton.on("pointerout", () => {
      this.towerSellOverlayButton.setFillStyle(0xa92b2b, 0.96);
      this.towerSellOverlay.setScale(1);
    });

    this.towerSellOverlayButton.on("pointerdown", () => {
      const selectedTower = this.getSelectedPlayerTower();
      if (!selectedTower || this.state.phase !== "active") {
        return;
      }

      if (sellTower(this.state, "player", selectedTower.id)) {
        this.selectedPlayerTowerId = null;
      }
    });
  }

  private showResultOverlay(): void {
    const body = this.resultOverlay.getData("body") as Phaser.GameObjects.Text;
    if (this.state.winner === "player") {
      body.setText("Enemy base destroyed.\nYour war machine holds.");
    } else if (this.state.winner === "enemy") {
      body.setText("Your base fell.\nRebuild and try again.");
    } else {
      body.setText("Both bases collapsed.\nCall it a draw.");
    }
    fitTextToBox(body, { maxWidth: 360, maxHeight: 96, minFontSize: 14 });
    // The retry CTA is intentionally separate from the overlay container so it
    // stays clickable even when the battlefield is scrolled far from the base.
    this.resultOverlay.setVisible(true);
    this.resultRetryButton.container.setVisible(true);
    this.unitMenu.setVisible(false);
    this.towerMenu.setVisible(false);
    audioController.playResultSting(this.state.winner === "player");
  }

  private playPendingAudioEvents(): void {
    const events = consumeAudioEvents(this.state);
    for (const event of events) {
      audioController.playMatchAudioEvent(event);
    }
  }

  private syncWorldViews(): void {
    // Views are derived from simulation state each frame. We lazily create and
    // destroy display objects as entities and projectiles enter or leave play.
    this.syncBaseView("player");
    this.syncBaseView("enemy");
    const liveEntityIds = new Set(this.state.entities.map((entity) => entity.id));
    const liveProjectileIds = new Set(this.state.projectiles.map((projectile) => projectile.id));

    if (this.selectedPlayerTowerId && !liveEntityIds.has(this.selectedPlayerTowerId)) {
      this.selectedPlayerTowerId = null;
    }

    for (const entity of this.state.entities) {
      if (!this.entityViews.has(entity.id)) {
        this.entityViews.set(entity.id, this.createEntityView(entity));
      }
      this.updateEntityView(entity, this.entityViews.get(entity.id) as EntityView);
    }

    for (const [entityId, view] of this.entityViews.entries()) {
      if (!liveEntityIds.has(entityId)) {
        spawnDust(this, view.container.x, view.container.y + 20, 0xd8c08b);
        view.container.destroy();
        this.entityViews.delete(entityId);
      }
    }

    for (const projectile of this.state.projectiles) {
      if (!this.projectileViews.has(projectile.id)) {
        const style = getProjectileVisualStyle(projectile);
        const body = this.add
          .sprite(projectile.x, projectile.y, `${getProjectileTextureKey(projectile)}-0`)
          .setDepth(projectile.sourceType === "super" ? 5 : 3);
        const animationKey = getProjectileAnimationKey(projectile);
        if (animationKey) {
          body.play(animationKey);
        }
        this.projectileViews.set(projectile.id, {
          body,
          style,
          spawnedAt: this.time.now,
          rotationOffset: Phaser.Math.FloatBetween(-Math.PI, Math.PI),
          spinRate: style === "fossil" ? 11 : 14,
        });
      }

      const view = this.projectileViews.get(projectile.id) as ProjectileView;
      view.body.setPosition(projectile.x, projectile.y);
      view.body.setTint(projectile.color);

      const elapsed = (this.time.now - view.spawnedAt) / 1000;
      const angle = Phaser.Math.Angle.Between(projectile.startX, projectile.startY, projectile.targetX, projectile.targetY);
      const baseScale = projectile.sourceType === "super" ? 1.02 : 0.88 + projectile.radius * 0.018;
      switch (view.style) {
        case "stone":
          view.body.setRotation(view.rotationOffset + elapsed * view.spinRate);
          view.body.setScale(baseScale);
          break;
        case "fossil":
          view.body.setRotation(view.rotationOffset + elapsed * view.spinRate);
          view.body.setScale(baseScale * (1 + Math.sin(elapsed * 18 + view.rotationOffset) * 0.04));
          break;
        case "ember":
          view.body.setRotation(angle + Math.sin(elapsed * 22 + view.rotationOffset) * 0.08);
          view.body.setScale(baseScale * (1 + Math.sin(elapsed * 26) * 0.06));
          break;
        case "meteor":
          view.body.setRotation(angle + Math.PI / 2 + Math.sin(elapsed * 16) * 0.05);
          view.body.setScale(baseScale * 1.08 + Math.sin(elapsed * 18) * 0.05);
          break;
        case "arrow":
        case "bolt":
          view.body.setRotation(angle);
          view.body.setScale(baseScale * (view.style === "bolt" ? 1.05 : 0.96));
          break;
        case "flask":
          view.body.setRotation(view.rotationOffset + elapsed * view.spinRate * 0.7);
          view.body.setScale(baseScale * (1 + Math.sin(elapsed * 20) * 0.04));
          break;
        case "arrow-rain":
          view.body.setRotation(angle + Math.PI / 2);
          view.body.setScale(baseScale * 1.04 + Math.sin(elapsed * 22) * 0.04);
          break;
        case "cannonball":
          view.body.setRotation(view.rotationOffset + elapsed * view.spinRate * 0.7);
          view.body.setScale(baseScale * 1.06 + Math.sin(elapsed * 12 + view.rotationOffset) * 0.03);
          break;
        case "bullet":
          view.body.setRotation(angle);
          view.body.setScale(baseScale * 0.92);
          break;
        case "rocket":
          view.body.setRotation(angle + Math.sin(elapsed * 18 + view.rotationOffset) * 0.04);
          view.body.setScale(baseScale * 1.02 + Math.sin(elapsed * 20) * 0.03);
          break;
        case "bomb":
          view.body.setRotation(angle + Math.PI / 2 + Math.sin(elapsed * 12) * 0.08);
          view.body.setScale(baseScale * 1.1 + Math.sin(elapsed * 14 + view.rotationOffset) * 0.04);
          break;
        case "plasma":
          view.body.setRotation(angle + Math.sin(elapsed * 20 + view.rotationOffset) * 0.06);
          view.body.setScale(baseScale * 1.08 + Math.sin(elapsed * 24) * 0.08);
          break;
        case "laser":
          view.body.setRotation(angle);
          view.body.setScale(baseScale * 0.98 + Math.sin(elapsed * 30) * 0.02);
          break;
      }
    }

    for (const [projectileId, view] of this.projectileViews.entries()) {
      if (!liveProjectileIds.has(projectileId)) {
        spawnImpact(this, view.body.x, view.body.y, view.style, view.body.tintTopLeft);
        view.body.destroy();
        this.projectileViews.delete(projectileId);
      }
    }

    this.syncTowerSellOverlay();
  }

  private syncBaseView(side: Side): void {
    this.updateEntityView(this.state.bases[side], this.baseViews[side]);
  }

  private syncTowerSellOverlay(): void {
    const selectedTower = this.getSelectedPlayerTower();
    if (!selectedTower || this.state.phase !== "active") {
      this.towerSellOverlay.setVisible(false);
      return;
    }

    this.towerSellOverlay.setPosition(
      selectedTower.x + selectedTower.bodyWidth / 2 + 14,
      selectedTower.y - selectedTower.bodyHeight / 2 - 16,
    );
    this.towerSellOverlay.setVisible(true);
  }

  private createEntityView(entity: EntityState): EntityView {
    const container = this.add.container(entity.x, entity.y).setDepth(entity.entityType === "unit" ? 2 : 1);
    const shadow = this.add.ellipse(0, entity.bodyHeight / 2 - 2, entity.bodyWidth * 0.9, 16, 0x24150f, 0.26);
    const spriteKey = `${getEntityTextureKey(entity)}-0`;
    const sprite = this.add.sprite(0, 0, spriteKey);
    const origin = getEntityOrigin(entity);
    sprite.setOrigin(origin.x, origin.y);
    const animationKey = getEntityAnimationKey(entity);
    if (animationKey) {
      sprite.play(animationKey);
    }
    if (entity.entityType === "tower") {
      fitDisplayObjectToBox(sprite, entity.bodyWidth + 22, entity.bodyHeight + 16);
      if (entity.side === "player") {
        sprite.setInteractive({ useHandCursor: true });
        sprite.on("pointerdown", () => {
          this.togglePlayerTowerSelection(entity.id);
        });
      }
    } else {
      fitDisplayObjectToBox(sprite, entity.bodyWidth + 28, entity.bodyHeight + 16);
    }
    const { hpFrame, hpBackground, hpFill, hpHighlight, hpMaxWidth } = this.createHealthBar(
      -entity.bodyHeight / 2 - 12,
      entity.bodyWidth + 8,
      10,
      0x67dc7d,
    );
    if (entity.entityType === "tower") {
      hpFrame.setVisible(false);
      hpBackground.setVisible(false);
      hpFill.setVisible(false);
      hpHighlight.setVisible(false);
    }
    const label = this.add
      .text(0, entity.bodyHeight / 2 + 12, this.getEntityCaption(entity), {
        fontFamily: "Courier New",
        fontSize: entity.entityType === "tower" ? "11px" : "10px",
        color: entity.side === "player" ? "#f7efdc" : "#ffd4c8",
      })
      .setOrigin(0.5);
    if (label.text.length > 0) {
      fitTextToBox(label, { maxWidth: entity.bodyWidth + 18, maxHeight: 12, minFontSize: 8 });
    } else {
      label.setVisible(false);
    }

    container.add([shadow, sprite, hpFrame, hpBackground, hpFill, hpHighlight, label]);
    return {
      container,
      shadow,
      sprite,
      hpFrame,
      hpBackground,
      hpFill,
      hpHighlight,
      hpMaxWidth,
      label,
      lastX: entity.x,
      currentDefinitionId: entity.definitionId,
    };
  }

  private getEntityCaption(entity: EntityState): string {
    if (entity.entityType === "base") {
      return entity.side === "player" ? "YOUR BASE" : "ENEMY BASE";
    }

    return "";
  }

  private updateEntityView(entity: EntityState, view: EntityView): void {
    const moved = Math.abs(entity.x - view.lastX) > 0.35;
    view.container.setPosition(entity.x, entity.y);
    const desiredTextureKey = `${getEntityTextureKey(entity)}-0`;
    if (view.currentDefinitionId !== entity.definitionId || view.sprite.texture.key !== desiredTextureKey) {
      view.sprite.setTexture(desiredTextureKey);
      const animationKey = getEntityAnimationKey(entity);
      if (animationKey) {
        view.sprite.play(animationKey);
      }
      if (entity.entityType === "tower") {
        fitDisplayObjectToBox(view.sprite, entity.bodyWidth + 22, entity.bodyHeight + 16);
      } else if (entity.entityType === "base") {
        fitDisplayObjectToBox(view.sprite, entity.bodyWidth + 36, entity.bodyHeight + 28);
      } else {
        fitDisplayObjectToBox(view.sprite, entity.bodyWidth + 28, entity.bodyHeight + 16);
      }
      view.currentDefinitionId = entity.definitionId;
      if (entity.entityType === "base") {
        this.syncBaseTowerSlots(entity.side, view);
      }
    }
    if (entity.entityType !== "tower") {
      const hpWidth = view.hpMaxWidth * (entity.hp / entity.maxHp);
      view.hpFill.width = hpWidth;
      view.hpFill.setDisplaySize(hpWidth, view.hpFill.height);
      view.hpFill.x = -view.hpMaxWidth / 2;
      const highlightWidth = Math.max(0, hpWidth - 2);
      view.hpHighlight.width = highlightWidth;
      view.hpHighlight.setDisplaySize(highlightWidth, view.hpHighlight.height);
      view.hpHighlight.x = -view.hpMaxWidth / 2 + 1;
      view.hpHighlight.setVisible(highlightWidth > 4);
      view.hpFill.setFillStyle(entity.hp / entity.maxHp < 0.35 ? 0xff8b72 : 0x67dc7d);
    }

    const bob = entity.entityType === "unit" ? Math.sin((this.time.now / 110) + entity.spawnTime * 6) * (moved ? 2.6 : 1.2) : 0;
    view.sprite.setY(bob);
    view.shadow.setScale(moved ? 1.05 : 0.94, moved ? 1.05 : 0.9);
    view.shadow.y = entity.bodyHeight / 2 + (entity.entityType === "base" ? 8 : 0);
    const towerSelected =
      entity.entityType === "tower" && entity.side === "player" && this.selectedPlayerTowerId === entity.id;
    if (towerSelected) {
      view.shadow.setFillStyle(0x7c5322, 0.42);
    } else {
      view.shadow.setFillStyle(0x24150f, 0.26);
    }

    if (entity.side === "enemy" && entity.entityType === "unit") {
      view.sprite.setFlipX(true);
    } else {
      view.sprite.setFlipX(false);
    }

    if (entity.entityType === "base") {
      this.syncBaseTowerSlots(entity.side, view);
    }

    view.lastX = entity.x;
  }

  private refreshHud(): void {
    const playerBaseHp = Math.ceil(this.state.bases.player.hp);
    const enemyBaseHp = Math.ceil(this.state.bases.enemy.hp);
    const playerEconomy = this.state.economies.player;
    const playerQueue = getBuildQueue(this.state, "player");
    const playerAge = getAgeForSide(this.state, "player");
    const enemyAge = getAgeForSide(this.state, "enemy");
    const nextPlayerAge = getNextAgeDefinition(playerAge.id);

    this.playerBaseText.setText(`Base HP: ${playerBaseHp}/${this.state.bases.player.maxHp}`);
    this.enemyBaseText.setText(`Enemy HP: ${enemyBaseHp}/${this.state.bases.enemy.maxHp}`);
    this.moneyText.setText(`Money: $${Math.floor(playerEconomy.money)}`);
    this.xpText.setText(
      nextPlayerAge
        ? `XP: ${Math.floor(playerEconomy.experience)}/${playerAge.unlockXp}`
        : `XP: ${Math.floor(playerEconomy.experience)} | FINAL AGE`,
    );
    fitTextToBox(this.playerBaseText, { maxWidth: 200, maxHeight: 18, minFontSize: 11 });
    fitTextToBox(this.enemyBaseText, { maxWidth: 200, maxHeight: 18, minFontSize: 11 });
    fitTextToBox(this.moneyText, { maxWidth: 200, maxHeight: 22, minFontSize: 13 });
    fitTextToBox(this.xpText, { maxWidth: 200, maxHeight: 18, minFontSize: 11 });
    this.queueLabelText.setText("Build Queue");
    fitTextToBox(this.queueLabelText, { maxWidth: 210, maxHeight: 16, minFontSize: 9 });
    this.refreshQueueSlots(playerQueue);

    const playerUnits = countUnitsForSide(this.state, "player");
    const enemyUnits = countUnitsForSide(this.state, "enemy");
    const towerCount = getTowerCount(this.state, "player");
    this.statusText.setText(
      `Player: ${playerAge.theme}\nEnemy: ${enemyAge.theme}\nUnits ${playerUnits}/${enemyUnits} | Towers ${towerCount}/${playerAge.base.towerSlots}`,
    );
    fitTextToBox(this.statusText, { maxWidth: 200, maxHeight: 70, minFontSize: 9 });

    this.overlayTitleText.setText(`PLAYER ${playerAge.theme.toUpperCase()} AGE`);
    fitTextToBox(this.overlayTitleText, { maxWidth: 340, maxHeight: 26, minFontSize: 16 });
    this.overlaySubtitleText.setText(
      this.mode === "test"
        ? `Enemy ${enemyAge.theme} | TEST MODE: free cash, XP, and full ladder previews`
        : `Enemy ${enemyAge.theme} | Build units, towers, supers, and age up on kill XP`,
    );
    fitTextToBox(this.overlaySubtitleText, { maxWidth: 392, maxHeight: 24, minFontSize: 10 });

    for (const entry of this.unitMenuButtons) {
      entry.button.setEnabled(this.state.phase === "active" && canAffordUnit(this.state, "player", entry.unitId));
    }

    for (const entry of this.towerMenuButtons) {
      entry.button.setEnabled(this.state.phase === "active" && canAffordTower(this.state, "player", entry.towerId));
    }

    const cooldownRemaining = getSuperCooldownRemaining(this.state, "player");
    this.superButton.setIcon?.(`${getProjectileTextureKeyForStyle(playerAge.super.visualStyle)}-0`);
    if (cooldownRemaining > 0 || this.state.phase !== "active") {
      this.superButton.setEnabled(false);
      this.superButton.setLabel("SUPER");
    } else {
      this.superButton.setEnabled(true);
      this.superButton.setLabel("SUPER");
    }

    if (!nextPlayerAge) {
      this.ageButton.setEnabled(false);
      this.ageButton.setLabel("ADVANCE");
    } else if (this.state.phase === "active" && canAdvanceAge(this.state, "player")) {
      this.ageButton.setEnabled(true);
      this.ageButton.setLabel("ADVANCE");
    } else {
      this.ageButton.setEnabled(false);
      this.ageButton.setLabel("ADVANCE");
    }
  }

  private updateCameraScroll(dt: number): void {
    // Freeze the camera once the match ends so post-game actions remain stable.
    if (this.state.phase !== "active" || this.resultOverlay.visible) {
      return;
    }

    const pointer = this.input.activePointer;
    const pointerDelta = getCameraEdgeScrollDelta({
      pointerX: pointer.x,
      pointerY: pointer.y,
      dt,
      gameWidth: GAME_WIDTH,
      playfieldHeight: PLAYFIELD_HEIGHT,
      edgeScrollZone: CAMERA_EDGE_SCROLL_ZONE,
      topEdgeScrollZone: CAMERA_TOP_EDGE_SCROLL_ZONE,
      topEdgeScrollBandHeight: CAMERA_TOP_EDGE_SCROLL_BAND_HEIGHT,
      scrollSpeed: CAMERA_SCROLL_SPEED,
    });
    const keyboardDelta = getKeyboardCameraScrollDelta({
      leftPressed: this.cursorKeys?.left?.isDown ?? false,
      rightPressed: this.cursorKeys?.right?.isDown ?? false,
      dt,
      scrollSpeed: CAMERA_SCROLL_SPEED,
    });
    const delta = pointerDelta + keyboardDelta;

    const maxScroll = WORLD_WIDTH - GAME_WIDTH;
    this.cameras.main.scrollX = Phaser.Math.Clamp(this.cameras.main.scrollX + delta, 0, maxScroll);
  }

  private syncFixedUi(): void {
    // Re-anchor fixed UI every frame from camera coordinates to prevent
    // interaction drift between rendered controls and pointer hit areas.
    const camera = this.cameras.main;
    this.hud.setPosition(camera.scrollX, camera.scrollY + GAME_HEIGHT - HUD_HEIGHT);
    this.topControls.setPosition(camera.scrollX + 24, camera.scrollY + 84);
    this.titleOverlay.setPosition(camera.scrollX + GAME_WIDTH / 2, camera.scrollY + 76);
    this.resultOverlay.setPosition(camera.scrollX + GAME_WIDTH / 2, camera.scrollY + GAME_HEIGHT / 2);
    this.resultRetryButton.container.setPosition(camera.scrollX + GAME_WIDTH / 2, camera.scrollY + GAME_HEIGHT / 2 + 82);
    this.audioToggle?.container.setPosition(camera.scrollX + GAME_WIDTH - 34, camera.scrollY + 36);
  }

  private refreshQueueSlots(playerQueue: ReturnType<typeof getBuildQueue>): void {
    // The queue row doubles as both occupancy display and active build
    // progress, avoiding extra HUD text while keeping capacity legible.
    this.queueSlots.forEach((slot, index) => {
      const entry = playerQueue[index];
      if (!entry) {
        slot.fill.setFillStyle(0x27303d, 1);
        slot.label.setText("");
        return;
      }

      const definition = getUnitDefinition(entry.unitId);
      const baseColor = definition.color;

      if (index === 0) {
        const progress = Phaser.Math.Clamp(1 - entry.remainingBuildTime / entry.totalBuildTime, 0, 1);
        slot.fill.setFillStyle(baseColor, 0.25 + progress * 0.75);
      } else {
        slot.fill.setFillStyle(baseColor, 0.55);
      }

      slot.label.setText(this.getQueueSlotLabel(entry.unitId));
      fitTextToBox(slot.label, { maxWidth: 26, maxHeight: 18, minFontSize: 10 });
    });
  }

  private getQueueSlotLabel(unitId: string): string {
    const name = getUnitDefinition(unitId).name;
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return initials || "?";
  }

  private getSelectedPlayerTower(): EntityState | null {
    if (!this.selectedPlayerTowerId) {
      return null;
    }

    const tower =
      this.state.entities.find(
        (entity) => entity.id === this.selectedPlayerTowerId && entity.side === "player" && entity.entityType === "tower",
      ) ?? null;

    if (!tower) {
      this.selectedPlayerTowerId = null;
    }

    return tower;
  }

  private decorateShopCardButton(
    button: ActionButton,
    icon: Phaser.GameObjects.Sprite,
    name: string,
    price: number,
  ): void {
    button.label.setText("");
    button.label.setVisible(false);

    const labelPlate = this.add.rectangle(0, 29, 110, 38, 0x25150d, 0.96);
    labelPlate.setStrokeStyle(2, 0xf0ca8b, 0.18);
    button.container.addAt(labelPlate, 1);

    const nameLabel = this.add
      .text(0, 18, name.toUpperCase(), {
        align: "center",
        fontFamily: "Courier New",
        fontSize: "12px",
        color: "#fff1d6",
      })
      .setOrigin(0.5);
    fitTextToBox(nameLabel, { maxWidth: 100, maxHeight: 16, minFontSize: 9, paddingX: 4, paddingY: 2 });

    const priceLabel = this.add
      .text(0, 39, `$${price}`, {
        align: "center",
        fontFamily: "Courier New",
        fontSize: "13px",
        color: "#ffd36b",
      })
      .setOrigin(0.5);
    fitTextToBox(priceLabel, { maxWidth: 82, maxHeight: 14, minFontSize: 10, paddingX: 2, paddingY: 1 });

    button.container.add([nameLabel, priceLabel]);
    button.container.bringToTop(nameLabel);
    button.container.bringToTop(priceLabel);

    const baseSetEnabled = button.setEnabled;
    button.setEnabled = (enabled: boolean) => {
      baseSetEnabled(enabled);
      nameLabel.setColor(enabled ? "#fff1d6" : "#d5c1a7");
      priceLabel.setColor(enabled ? "#ffd36b" : "#b39a7c");
      nameLabel.setAlpha(enabled ? 1 : 0.84);
      priceLabel.setAlpha(enabled ? 1 : 0.84);
      icon.setAlpha(enabled ? 1 : 0.62);
      labelPlate.setAlpha(enabled ? 0.96 : 0.82);
    };

    button.setEnabled(button.enabled);
  }

  private togglePlayerTowerSelection(towerId: string): void {
    this.selectedPlayerTowerId = this.selectedPlayerTowerId === towerId ? null : towerId;
  }

  private createIconButton(
    x: number,
    y: number,
    width: number,
    height: number,
    iconTextureKey: string,
    onClick: () => void,
  ): ActionButton {
    const container = this.add.container(x, y);
    const baseKey = ensureButtonTexture(this, `ui/icon-button/${width}x${height}`, width, height, "button");
    const hoverKey = ensureButtonTexture(this, `ui/icon-button/${width}x${height}-hover`, width, height, "buttonHover");
    const disabledKey = ensureButtonTexture(this, `ui/icon-button/${width}x${height}-disabled`, width, height, "buttonDisabled");
    const background = this.add.image(0, 0, baseKey);
    background.setInteractive({ useHandCursor: true });
    const icon = this.add.image(-46, 0, iconTextureKey).setAlpha(0.95);
    let iconBaseScale = fitDisplayObjectToBox(icon, 34, 34);
    const text = this.add
      .text(24, 0, "", {
        align: "center",
        fontFamily: "Courier New",
        fontSize: "16px",
        color: "#fff6df",
        stroke: "#1d120b",
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    fitTextToBox(text, { maxWidth: width - 74, maxHeight: height - 10, minFontSize: 10, paddingX: 4, paddingY: 4 });
    container.add([background, icon, text]);

    const actionButton: ActionButton = {
      container,
      background,
      label: text,
      onClick,
      enabled: true,
      setEnabled: (enabled: boolean) => {
        actionButton.enabled = enabled;
        background.disableInteractive();
        if (enabled) {
          background.setInteractive({ useHandCursor: true });
          background.setTexture(baseKey);
          text.setColor("#fff6df");
          icon.setAlpha(0.95);
        } else {
          background.setTexture(disabledKey);
          text.setColor("#d4d6db");
          icon.setAlpha(0.56);
        }
      },
      setLabel: (nextLabel: string) => {
        text.setText(nextLabel);
        fitTextToBox(text, {
          maxWidth: width - 74,
          maxHeight: height - 10,
          minFontSize: 10,
          paddingX: 4,
          paddingY: 4,
        });
      },
      setIcon: (textureKey: string) => {
        icon.setTexture(textureKey);
        iconBaseScale = fitDisplayObjectToBox(icon, 34, 34);
      },
    };

    background.on("pointerover", () => {
      if (!actionButton.enabled) {
        return;
      }
      background.setTexture(hoverKey);
      icon.setScale(iconBaseScale * 1.06);
    });

    background.on("pointerout", () => {
      if (!actionButton.enabled) {
        return;
      }
      background.setTexture(baseKey);
      icon.setScale(iconBaseScale);
    });

    background.on("pointerdown", async () => {
      if (actionButton.enabled) {
        await audioController.unlock();
        audioController.playUiClick();
        actionButton.onClick();
      }
    });

    return actionButton;
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void,
  ): ActionButton {
    const container = this.add.container(x, y);
    const baseKey = ensureButtonTexture(this, `ui/button/${width}x${height}`, width, height, "button");
    const hoverKey = ensureButtonTexture(this, `ui/button/${width}x${height}-hover`, width, height, "buttonHover");
    const disabledKey = ensureButtonTexture(this, `ui/button/${width}x${height}-disabled`, width, height, "buttonDisabled");
    const background = this.add.image(0, 0, baseKey);
    background.setInteractive({ useHandCursor: true });
    const text = this.add
      .text(0, 0, label, {
        align: "center",
        fontFamily: "Courier New",
        fontSize: "20px",
        color: "#1b130e",
      })
      .setOrigin(0.5);
    fitTextToBox(text, { maxWidth: width - 18, maxHeight: height - 14, minFontSize: 10, paddingX: 6, paddingY: 6 });
    container.add([background, text]);

    const actionButton: ActionButton = {
      container,
      background,
      label: text,
      onClick,
      enabled: true,
      setEnabled: (enabled: boolean) => {
        actionButton.enabled = enabled;
        background.disableInteractive();
        if (enabled) {
          background.setInteractive({ useHandCursor: true });
          background.setTexture(baseKey);
          text.setColor("#1b130e");
        } else {
          background.setTexture(disabledKey);
          text.setColor("#d4d6db");
        }
      },
      setLabel: (nextLabel: string) => {
        text.setText(nextLabel);
        fitTextToBox(text, {
          maxWidth: width - 18,
          maxHeight: height - 14,
          minFontSize: 10,
          paddingX: 6,
          paddingY: 6,
        });
      },
    };

    background.on("pointerover", () => {
      if (!actionButton.enabled) {
        return;
      }
      background.setTexture(hoverKey);
      text.setScale(1.02);
    });

    background.on("pointerout", () => {
      if (!actionButton.enabled) {
        return;
      }
      background.setTexture(baseKey);
      text.setScale(1);
    });

    background.on("pointerdown", async () => {
      if (actionButton.enabled) {
        await audioController.unlock();
        audioController.playUiClick();
        actionButton.onClick();
      }
    });

    return actionButton;
  }
}
