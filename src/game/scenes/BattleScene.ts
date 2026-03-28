import Phaser from "phaser";
import {
  CAMERA_EDGE_SCROLL_ZONE,
  CAMERA_SCROLL_SPEED,
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_Y,
  HUD_HEIGHT,
  PLAYFIELD_HEIGHT,
  WORLD_WIDTH,
} from "../config";
import { getUnitDefinition, PREHISTORIC_AGE, PREHISTORIC_AI_SCRIPT } from "../data/prehistoric";
import {
  activateSuper,
  canAffordTower,
  canAffordUnit,
  cloneAISteps,
  countUnitsForSide,
  createInitialMatchState,
  getBuildQueue,
  getBuildQueueCapacity,
  getSuperCooldownRemaining,
  getTowerCount,
  purchaseTower,
  purchaseUnit,
  updateMatchState,
} from "../systems/match";
import { AIScriptStep, EntityState, MatchState, Side } from "../types";
import { fitTextToBox } from "../ui/textFit";

interface EntityView {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  hpBackground: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

interface ProjectileView {
  body: Phaser.GameObjects.Arc;
}

interface ActionButton {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  onClick: () => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  setLabel: (label: string) => void;
}

interface QueueSlotView {
  fill: Phaser.GameObjects.Rectangle;
  border: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

export class BattleScene extends Phaser.Scene {
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
  private superButton!: ActionButton;
  private ageButton!: ActionButton;
  private titleOverlay!: Phaser.GameObjects.Container;
  private resultOverlay!: Phaser.GameObjects.Container;
  private resultRetryButton!: ActionButton;

  constructor() {
    super("battle");
  }

  create(): void {
    // The battle scene owns rendering and input. The match system owns the
    // actual rules so UI iteration and gameplay iteration stay decoupled.
    this.state = createInitialMatchState(PREHISTORIC_AGE);
    this.aiSteps = cloneAISteps(PREHISTORIC_AI_SCRIPT);
    this.entityViews.clear();
    this.projectileViews.clear();

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, PLAYFIELD_HEIGHT);
    this.cameras.main.setBackgroundColor(0x5a87a2);
    this.cameras.main.setRoundPixels(true);

    this.drawWorld();
    this.baseViews = {
      player: this.createBaseView("player"),
      enemy: this.createBaseView("enemy"),
    };
    this.createHud();
    this.createOverlays();
    this.syncFixedUi();
    this.syncWorldViews();
    this.refreshHud();
  }

  update(_: number, deltaMs: number): void {
    const dt = Math.min(deltaMs / 1000, 0.033);

    if (this.state.phase === "active") {
      updateMatchState(this.state, dt, this.aiSteps);
    }

    this.updateCameraScroll(dt);
    this.syncFixedUi();
    this.syncWorldViews();
    this.refreshHud();

    if (this.state.phase === "ended" && !this.resultOverlay.visible) {
      this.showResultOverlay();
    }
  }

  private drawWorld(): void {
    this.add.rectangle(WORLD_WIDTH / 2, PLAYFIELD_HEIGHT / 2, WORLD_WIDTH, PLAYFIELD_HEIGHT, 0x5b84a1);
    this.add.rectangle(WORLD_WIDTH / 2, PLAYFIELD_HEIGHT - 72, WORLD_WIDTH, 144, 0x7c5d3d);
    this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y + 10, WORLD_WIDTH, 46, 0x4d7a45);

    for (let index = 0; index < 9; index += 1) {
      const x = 180 + index * 280;
      const mountain = this.add.triangle(x, GROUND_Y - 110, 0, 120, 80, 0, 160, 120, 0x48647b, 0.85);
      mountain.setOrigin(0.5, 1);
    }

    this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y - 6, WORLD_WIDTH, 4, 0xf4de98, 0.45);

  }

  private createBaseView(side: Side): EntityView {
    const base = this.state.bases[side];
    const container = this.add.container(base.x, base.y);
    const body = this.add.rectangle(0, 0, base.bodyWidth, base.bodyHeight, base.color);
    body.setStrokeStyle(5, 0xecc67a, 0.78);
    const roof = this.add.rectangle(0, -base.bodyHeight / 2 + 18, base.bodyWidth + 18, 20, 0xd1a35e);
    const door = this.add.rectangle(0, base.bodyHeight / 2 - 42, 42, 68, 0x2f2118);
    const hpBackground = this.add.rectangle(0, -base.bodyHeight / 2 - 28, base.bodyWidth, 12, 0x1c1f25);
    const hpFill = this.add.rectangle(-base.bodyWidth / 2, -base.bodyHeight / 2 - 28, base.bodyWidth, 12, 0x69db7c);
    hpFill.setOrigin(0, 0.5);
    const label = this.add
      .text(0, -base.bodyHeight / 2 - 54, side === "player" ? "YOUR BASE" : "ENEMY BASE", {
        fontFamily: "Courier New",
        fontSize: "18px",
        color: "#f6f0d7",
        stroke: "#291a10",
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    fitTextToBox(label, { maxWidth: base.bodyWidth + 40, maxHeight: 24, minFontSize: 12 });

    container.add([body, roof, door, hpBackground, hpFill, label]);

    for (let index = 0; index < PREHISTORIC_AGE.base.towerSlots; index += 1) {
      const slotOffset = PREHISTORIC_AGE.base.towerSlotOffsets[index];
      const slot = this.add.rectangle(slotOffset, -base.bodyHeight / 2 + 20, 18, 18, 0xf8dea1, 0.18);
      slot.setStrokeStyle(2, 0xf8dea1, 0.5);
      container.add(slot);
    }

    return { container, body, hpBackground, hpFill, label };
  }

  private createHud(): void {
    // The bottom HUD is camera-anchored in world space so rendered positions
    // and interactive hit areas stay aligned after horizontal scrolling.
    const hud = this.add.container(0, GAME_HEIGHT - HUD_HEIGHT).setDepth(100);
    this.hud = hud;
    const panel = this.add.rectangle(GAME_WIDTH / 2, HUD_HEIGHT / 2, GAME_WIDTH, HUD_HEIGHT, 0x121720, 0.94);
    panel.setStrokeStyle(4, 0xf3b55d, 0.5);
    hud.add(panel);

    this.playerBaseText = this.add.text(32, 14, "", {
      fontFamily: "Courier New",
      fontSize: "16px",
      color: "#f7efdc",
    });

    this.enemyBaseText = this.add.text(32, 36, "", {
      fontFamily: "Courier New",
      fontSize: "16px",
      color: "#f6b7a8",
    });

    this.moneyText = this.add.text(32, 62, "", {
      fontFamily: "Courier New",
      fontSize: "20px",
      color: "#f6d977",
    });

    this.xpText = this.add.text(32, 88, "", {
      fontFamily: "Courier New",
      fontSize: "16px",
      color: "#a7d8ff",
    });

    this.queueLabelText = this.add.text(32, 116, "", {
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
      const fill = this.add.rectangle(slotX, 146, queueSlotWidth, queueSlotHeight, 0x283041).setOrigin(0, 0.5);
      const border = this.add.rectangle(slotX, 146, queueSlotWidth, queueSlotHeight, 0x000000, 0).setOrigin(0, 0.5);
      border.setStrokeStyle(2, 0xf3b55d, 0.45);
      const label = this.add
        .text(slotX + queueSlotWidth / 2, 146, "", {
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

    const buyUnitsButton = this.createButton(460, 50, 180, 56, "BUY UNITS", () => {
      this.unitMenu.setVisible(!this.unitMenu.visible);
      if (this.unitMenu.visible) {
        this.towerMenu.setVisible(false);
      }
    });
    const buyTowersButton = this.createButton(460, 116, 180, 56, "BUY TOWERS", () => {
      this.towerMenu.setVisible(!this.towerMenu.visible);
      if (this.towerMenu.visible) {
        this.unitMenu.setVisible(false);
      }
    });
    hud.add([buyUnitsButton.container, buyTowersButton.container]);

    this.statusText = this.add
      .text(1392, 82, "", {
        fontFamily: "Courier New",
        fontSize: "20px",
        color: "#f6efd7",
        align: "right",
      })
      .setOrigin(1, 0.5);
    hud.add(this.statusText);

    this.unitMenu = this.createUnitMenu();
    this.towerMenu = this.createTowerMenu();
    hud.add([this.unitMenu, this.towerMenu]);

    this.createTopControls();
  }

  private createTopControls(): void {
    // Utility actions sit above the battlefield so opening purchase submenus
    // never obscures cooldown-driven controls.
    this.topControls = this.add.container(24, 84).setDepth(140);

    const panel = this.add.rectangle(0, 0, 164, 118, 0x121720, 0.9).setOrigin(0);
    panel.setStrokeStyle(3, 0xf3b55d, 0.45);

    this.superButton = this.createButton(82, 34, 140, 44, "METEOR SHOWER", () => {
      activateSuper(this.state, "player");
    });

    this.ageButton = this.createButton(82, 82, 140, 44, "NEXT AGE LOCKED", () => undefined);
    this.ageButton.setEnabled(false);

    this.topControls.add([panel, this.superButton.container, this.ageButton.container]);
  }

  private createUnitMenu(): Phaser.GameObjects.Container {
    const menu = this.add.container(640, 12).setDepth(120);
    menu.setVisible(false);
    const panel = this.add.rectangle(0, 0, 430, 144, 0x1c2430, 0.98).setOrigin(0);
    panel.setStrokeStyle(3, 0xd4a15b, 0.6);
    menu.add(panel);

    PREHISTORIC_AGE.units.forEach((unit, index) => {
      const button = this.createButton(
        74 + index * 138,
        72,
        124,
        108,
        `${unit.name}\n$${unit.cost}\n${unit.buildTime.toFixed(1)}s`,
        () => {
          purchaseUnit(this.state, "player", unit.id);
        },
      );
      this.unitMenuButtons.push({ button, unitId: unit.id, cost: unit.cost });
      menu.add(button.container);
    });

    return menu;
  }

  private createTowerMenu(): Phaser.GameObjects.Container {
    const menu = this.add.container(640, 12).setDepth(120);
    menu.setVisible(false);
    const panel = this.add.rectangle(0, 0, 430, 144, 0x1c2430, 0.98).setOrigin(0);
    panel.setStrokeStyle(3, 0xd4a15b, 0.6);
    menu.add(panel);

    PREHISTORIC_AGE.towers.forEach((tower, index) => {
      const button = this.createButton(74 + index * 138, 72, 124, 108, `${tower.name}\n$${tower.cost}`, () => {
        purchaseTower(this.state, "player", tower.id);
      });
      this.towerMenuButtons.push({ button, towerId: tower.id, cost: tower.cost });
      menu.add(button.container);
    });

    return menu;
  }

  private createOverlays(): void {
    this.titleOverlay = this.add.container(GAME_WIDTH / 2, 76).setDepth(80);
    const banner = this.add.rectangle(0, 0, 400, 70, 0x10151c, 0.8);
    banner.setStrokeStyle(4, 0xf5b55d, 0.5);
    const title = this.add
      .text(0, -8, "PREHISTORIC WAR", {
        fontFamily: "Courier New",
        fontSize: "28px",
        color: "#fff1d0",
      })
      .setOrigin(0.5);
    fitTextToBox(title, { maxWidth: 340, maxHeight: 26, minFontSize: 16 });
    const subtitle = this.add
      .text(0, 20, "Build units, buy towers, break the enemy base", {
        fontFamily: "Courier New",
        fontSize: "16px",
        color: "#e9c98d",
      })
      .setOrigin(0.5);
    fitTextToBox(subtitle, { maxWidth: 360, maxHeight: 20, minFontSize: 10 });
    this.titleOverlay.add([banner, title, subtitle]);

    this.resultOverlay = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(250);
    const veil = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x05080d, 0.68);
    const panel = this.add.rectangle(0, 0, 460, 250, 0x131a23, 0.95);
    panel.setStrokeStyle(5, 0xf4bb67, 0.75);
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
      this.scene.start("battle");
    });
    this.resultRetryButton.container.setDepth(260);
    this.resultRetryButton.container.setVisible(false);
    this.resultOverlay.add([veil, panel, heading, body]);
    this.add.existing(this.resultRetryButton.container);
    this.resultOverlay.setData("body", body);
    this.resultOverlay.setVisible(false);
  }

  private showResultOverlay(): void {
    const body = this.resultOverlay.getData("body") as Phaser.GameObjects.Text;
    if (this.state.winner === "player") {
      body.setText("Enemy base destroyed.\nPrehistoric slice complete.");
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
  }

  private syncWorldViews(): void {
    // Views are derived from simulation state each frame. We lazily create and
    // destroy display objects as entities and projectiles enter or leave play.
    this.syncBaseView("player");
    this.syncBaseView("enemy");

    for (const entity of this.state.entities) {
      if (!this.entityViews.has(entity.id)) {
        this.entityViews.set(entity.id, this.createEntityView(entity));
      }
      this.updateEntityView(entity, this.entityViews.get(entity.id) as EntityView);
    }

    for (const [entityId, view] of this.entityViews.entries()) {
      if (!this.state.entities.some((entity) => entity.id === entityId)) {
        view.container.destroy();
        this.entityViews.delete(entityId);
      }
    }

    for (const projectile of this.state.projectiles) {
      if (!this.projectileViews.has(projectile.id)) {
        const body = this.add.circle(projectile.x, projectile.y, projectile.radius, projectile.color).setDepth(3);
        this.projectileViews.set(projectile.id, { body });
      }

      const view = this.projectileViews.get(projectile.id) as ProjectileView;
      view.body.setPosition(projectile.x, projectile.y);
    }

    for (const [projectileId, view] of this.projectileViews.entries()) {
      if (!this.state.projectiles.some((projectile) => projectile.id === projectileId)) {
        view.body.destroy();
        this.projectileViews.delete(projectileId);
      }
    }
  }

  private syncBaseView(side: Side): void {
    this.updateEntityView(this.state.bases[side], this.baseViews[side]);
  }

  private createEntityView(entity: EntityState): EntityView {
    const container = this.add.container(entity.x, entity.y).setDepth(entity.entityType === "unit" ? 2 : 1);
    const body = this.add.rectangle(0, 0, entity.bodyWidth, entity.bodyHeight, entity.color);
    body.setStrokeStyle(3, 0x26170d, 0.45);
    const hpBackground = this.add.rectangle(0, -entity.bodyHeight / 2 - 12, entity.bodyWidth, 8, 0x191c21);
    const hpFill = this.add.rectangle(-entity.bodyWidth / 2, -entity.bodyHeight / 2 - 12, entity.bodyWidth, 8, 0x67dc7d);
    hpFill.setOrigin(0, 0.5);
    const label = this.add
      .text(0, 0, this.getEntityLabel(entity), {
        fontFamily: "Courier New",
        fontSize: entity.entityType === "tower" ? "14px" : "18px",
        color: "#1b140f",
      })
      .setOrigin(0.5);
    fitTextToBox(label, { maxWidth: entity.bodyWidth - 6, maxHeight: entity.bodyHeight - 6, minFontSize: 8 });

    if (entity.entityType === "unit" && entity.side === "enemy") {
      body.setAngle(180);
    }

    container.add([body, hpBackground, hpFill, label]);
    return { container, body, hpBackground, hpFill, label };
  }

  private getEntityLabel(entity: EntityState): string {
    switch (entity.definitionId) {
      case "caveman":
        return "C";
      case "stonethrower":
        return "S";
      case "dino-rider":
        return "D";
      case "stone-guard":
        return "SG";
      case "fossil-catapult":
        return "FC";
      case "ember-totem":
        return "ET";
      default:
        return entity.entityType === "base" ? "B" : "?";
    }
  }

  private updateEntityView(entity: EntityState, view: EntityView): void {
    view.container.setPosition(entity.x, entity.y);
    view.body.setSize(entity.bodyWidth, entity.bodyHeight);
    view.body.setFillStyle(entity.color);
    view.hpFill.width = entity.bodyWidth * (entity.hp / entity.maxHp);
    view.hpFill.setDisplaySize(entity.bodyWidth * (entity.hp / entity.maxHp), view.hpFill.height);
    view.hpFill.x = -entity.bodyWidth / 2;
    view.hpBackground.width = entity.bodyWidth;
    view.hpFill.setFillStyle(entity.hp / entity.maxHp < 0.35 ? 0xff8b72 : 0x67dc7d);
    view.label.setText(this.getEntityLabel(entity));
    fitTextToBox(view.label, { maxWidth: entity.bodyWidth - 6, maxHeight: entity.bodyHeight - 6, minFontSize: 8 });

    if (entity.side === "enemy" && entity.entityType === "unit") {
      view.body.setAngle(180);
    } else {
      view.body.setAngle(0);
    }
  }

  private refreshHud(): void {
    const playerBaseHp = Math.ceil(this.state.bases.player.hp);
    const enemyBaseHp = Math.ceil(this.state.bases.enemy.hp);
    const playerEconomy = this.state.economies.player;
    const playerQueue = getBuildQueue(this.state, "player");

    this.playerBaseText.setText(`Base HP: ${playerBaseHp}/${this.state.bases.player.maxHp}`);
    this.enemyBaseText.setText(`Enemy HP: ${enemyBaseHp}/${this.state.bases.enemy.maxHp}`);
    this.moneyText.setText(`Money: $${Math.floor(playerEconomy.money)}`);
    this.xpText.setText(`XP: ${Math.floor(playerEconomy.experience)}/${this.state.age.unlockXp}`);
    fitTextToBox(this.playerBaseText, { maxWidth: 190, maxHeight: 18, minFontSize: 11 });
    fitTextToBox(this.enemyBaseText, { maxWidth: 190, maxHeight: 18, minFontSize: 11 });
    fitTextToBox(this.moneyText, { maxWidth: 190, maxHeight: 22, minFontSize: 13 });
    fitTextToBox(this.xpText, { maxWidth: 190, maxHeight: 18, minFontSize: 11 });
    this.queueLabelText.setText("Build Queue");
    fitTextToBox(this.queueLabelText, { maxWidth: 210, maxHeight: 16, minFontSize: 9 });
    this.refreshQueueSlots(playerQueue);

    const playerUnits = countUnitsForSide(this.state, "player");
    const enemyUnits = countUnitsForSide(this.state, "enemy");
    const towerCount = getTowerCount(this.state, "player");
    this.statusText.setText(
      `Theme: ${this.state.age.theme}\nUnits ${playerUnits} vs ${enemyUnits}\nTowers ${towerCount}/3 | AI $${Math.floor(this.state.economies.enemy.money)}`,
    );
    fitTextToBox(this.statusText, { maxWidth: 180, maxHeight: 70, minFontSize: 9 });

    for (const entry of this.unitMenuButtons) {
      entry.button.setEnabled(this.state.phase === "active" && canAffordUnit(this.state, "player", entry.unitId));
    }

    for (const entry of this.towerMenuButtons) {
      entry.button.setEnabled(this.state.phase === "active" && canAffordTower(this.state, "player", entry.towerId));
    }

    const cooldownRemaining = getSuperCooldownRemaining(this.state, "player");
    if (cooldownRemaining > 0 || this.state.phase !== "active") {
      this.superButton.setEnabled(false);
      this.superButton.setLabel(`METEOR SHOWER\n${cooldownRemaining.toFixed(1)}s`);
    } else {
      this.superButton.setEnabled(true);
      this.superButton.setLabel("METEOR SHOWER\nREADY");
    }

    this.ageButton.setLabel(`NEXT AGE\n${Math.floor(playerEconomy.experience)}/${this.state.age.unlockXp}`);
  }

  private updateCameraScroll(dt: number): void {
    // Freeze the camera once the match ends so post-game actions remain stable.
    if (this.state.phase !== "active" || this.resultOverlay.visible) {
      return;
    }

    const pointer = this.input.activePointer;
    if (pointer.y > PLAYFIELD_HEIGHT) {
      return;
    }

    let delta = 0;
    if (pointer.x < CAMERA_EDGE_SCROLL_ZONE) {
      delta = -CAMERA_SCROLL_SPEED * (1 - pointer.x / CAMERA_EDGE_SCROLL_ZONE) * dt;
    } else if (pointer.x > GAME_WIDTH - CAMERA_EDGE_SCROLL_ZONE) {
      delta =
        CAMERA_SCROLL_SPEED *
        (1 - (GAME_WIDTH - pointer.x) / CAMERA_EDGE_SCROLL_ZONE) *
        dt;
    }

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
  }

  private refreshQueueSlots(playerQueue: ReturnType<typeof getBuildQueue>): void {
    // The queue row doubles as both occupancy display and active build
    // progress, avoiding extra HUD text while keeping capacity legible.
    this.queueSlots.forEach((slot, index) => {
      const entry = playerQueue[index];
      if (!entry) {
        slot.fill.setFillStyle(0x283041, 1);
        slot.label.setText("");
        return;
      }

      const definition = getUnitDefinition(entry.unitId);
      const baseColor = definition.color;

      if (index === 0) {
        const progress = Phaser.Math.Clamp(1 - entry.remainingBuildTime / entry.totalBuildTime, 0, 1);
        slot.fill.setFillStyle(baseColor, 0.25 + progress * 0.75);
      } else {
        slot.fill.setFillStyle(baseColor, 0.5);
      }

      slot.label.setText(this.getQueueSlotLabel(entry.unitId));
      fitTextToBox(slot.label, { maxWidth: 26, maxHeight: 18, minFontSize: 10 });
    });
  }

  private getQueueSlotLabel(unitId: string): string {
    switch (unitId) {
      case "caveman":
        return "C";
      case "stonethrower":
        return "S";
      case "dino-rider":
        return "D";
      default:
        return "?";
    }
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
    const background = this.add.rectangle(0, 0, width, height, 0xc07a3f);
    background.setStrokeStyle(3, 0xffd595, 0.72);
    background.setInteractive({ useHandCursor: true });
    const text = this.add
      .text(0, 0, label, {
        align: "center",
        fontFamily: "Courier New",
        fontSize: "20px",
        color: "#18110d",
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
          background.setFillStyle(0xc07a3f);
          text.setColor("#18110d");
        } else {
          background.setFillStyle(0x4c5563);
          text.setColor("#d4d6db");
        }
      },
      setLabel: (nextLabel: string) => {
        text.setText(nextLabel);
        fitTextToBox(text, { maxWidth: width - 18, maxHeight: height - 14, minFontSize: 10, paddingX: 6, paddingY: 6 });
      },
    };

    background.on("pointerover", () => {
      if (!actionButton.enabled) {
        return;
      }
      background.setFillStyle(0xdd9251);
      text.setScale(1.02);
    });

    background.on("pointerout", () => {
      if (!actionButton.enabled) {
        return;
      }
      background.setFillStyle(0xc07a3f);
      text.setScale(1);
    });

    background.on("pointerdown", () => {
      if (actionButton.enabled) {
        actionButton.onClick();
      }
    });

    return actionButton;
  }
}
