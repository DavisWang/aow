import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { ensureArt, ensureButtonTexture, ensurePanelTexture, fitDisplayObjectToBox } from "../render/art";
import { MatchMode } from "../types";
import { fitTextToBox } from "../ui/textFit";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("title");
  }

  create(): void {
    ensureArt(this);

    this.cameras.main.setBackgroundColor(0x1d3047);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x223754);
    this.add.rectangle(GAME_WIDTH / 2, 250, GAME_WIDTH, 500, 0x2d4767, 0.65);
    this.add.rectangle(GAME_WIDTH / 2, 660, GAME_WIDTH, 220, 0x85613d);
    this.add.rectangle(GAME_WIDTH / 2, 714, GAME_WIDTH, 118, 0x45693f);
    this.add.rectangle(GAME_WIDTH / 2, 724, GAME_WIDTH, 8, 0xd4c688, 0.6);

    const sun = this.add.image(220, 182, "art/world/sun").setAlpha(0.92).setScale(1.08);
    this.tweens.add({
      targets: sun,
      scale: 1.16,
      alpha: 1,
      duration: 3400,
      yoyo: true,
      repeat: -1,
    });

    const mountains = [
      { x: 270, y: 520, scale: 1.1, alpha: 0.62 },
      { x: 600, y: 508, scale: 1.2, alpha: 0.55 },
      { x: 900, y: 522, scale: 1.1, alpha: 0.52 },
      { x: 1180, y: 516, scale: 1.26, alpha: 0.5 },
    ];
    mountains.forEach((mountain) => {
      this.add.image(mountain.x, mountain.y, "art/world/mountain").setScale(mountain.scale).setAlpha(mountain.alpha);
    });

    const clouds = [
      { x: 260, y: 160, scale: 0.95, duration: 18000, offset: 120 },
      { x: 1060, y: 220, scale: 1.05, duration: 21000, offset: -140 },
      { x: 880, y: 128, scale: 0.8, duration: 16000, offset: 100 },
    ];
    clouds.forEach((cloud) => {
      const sprite = this.add.image(cloud.x, cloud.y, "art/world/cloud").setScale(cloud.scale).setAlpha(0.8);
      this.tweens.add({
        targets: sprite,
        x: cloud.x + cloud.offset,
        duration: cloud.duration,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });

    const leftHero = this.add.sprite(248, 574, "art/unit/caveman-0").setScale(1.7).setAlpha(0.95);
    leftHero.play("anim/unit/caveman");
    fitDisplayObjectToBox(leftHero, 96, 124);
    this.tweens.add({
      targets: leftHero,
      y: 566,
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const rightHero = this.add.sprite(1168, 556, "art/unit/titan-walker-0").setScale(1.52).setFlipX(true).setAlpha(0.96);
    rightHero.play("anim/unit/titan-walker");
    fitDisplayObjectToBox(rightHero, 196, 146);
    this.tweens.add({
      targets: rightHero,
      y: 554,
      duration: 760,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.add.image(176, 642, "art/world/fern").setScale(1.28).setAlpha(0.82);
    this.add.image(318, 650, "art/world/rock").setScale(1.2).setAlpha(0.88);
    this.add.image(1086, 646, "art/world/bone").setScale(1.1).setAlpha(0.72);
    this.add.image(1240, 640, "art/world/fern").setScale(1.12).setFlipX(true).setAlpha(0.78);

    const frame = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 120, GAME_HEIGHT - 4, 0x000000, 0);
    frame.setStrokeStyle(6, 0xf4c66f, 0.42);

    const title = this.add
      .text(GAME_WIDTH / 2, 206, "AGE OF WAR", {
        fontFamily: "Courier New",
        fontSize: "64px",
        color: "#fdf0c7",
        stroke: "#28180e",
        strokeThickness: 12,
      })
      .setOrigin(0.5);
    fitTextToBox(title, { maxWidth: GAME_WIDTH - 220, maxHeight: 84, minFontSize: 34 });

    const subtitle = this.add
      .text(GAME_WIDTH / 2, 290, "Prehistoric to Future playable build", {
        fontFamily: "Courier New",
        fontSize: "26px",
        color: "#f8d68f",
      })
      .setOrigin(0.5);
    fitTextToBox(subtitle, { maxWidth: GAME_WIDTH - 240, maxHeight: 34, minFontSize: 18 });

    const panelKey = ensurePanelTexture(this, "ui/title/panel-520x230", 520, 230, "banner");
    const panel = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, panelKey);

    const body = this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 - 4,
        "Fight across one lane.\nEarn kill XP to climb all five ages.\nBreak the enemy base before their late game arrives.",
        {
          align: "center",
          fontFamily: "Courier New",
          fontSize: "24px",
          color: "#f8f0dd",
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5);
    fitTextToBox(body, { maxWidth: 440, maxHeight: 132, minFontSize: 16, paddingX: 12, paddingY: 10 });

    const newGameButton = this.createTitleButton(GAME_WIDTH / 2 - 146, GAME_HEIGHT / 2 + 150, 248, 72, "NEW GAME", "standard");
    const testModeButton = this.createTitleButton(GAME_WIDTH / 2 + 146, GAME_HEIGHT / 2 + 150, 248, 72, "TEST MODE", "test");

    const testModeHint = this.add
      .text(GAME_WIDTH / 2 + 146, GAME_HEIGHT / 2 + 196, "UNLIMITED CASH, XP, AND SUPERS", {
        fontFamily: "Courier New",
        fontSize: "14px",
        color: "#f8d68f",
      })
      .setOrigin(0.5);
    fitTextToBox(testModeHint, { maxWidth: 248, maxHeight: 18, minFontSize: 9 });

    const footer = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 52, "By Pwner Studios", {
        fontFamily: "Courier New",
        fontSize: "20px",
        color: "#f4e0a8",
      })
      .setOrigin(0.5);
    fitTextToBox(footer, { maxWidth: 320, maxHeight: 24, minFontSize: 14 });

    panel.setDepth(2);
    body.setDepth(3);
    newGameButton.button.setDepth(4);
    testModeButton.button.setDepth(4);
    newGameButton.label.setDepth(5);
    testModeButton.label.setDepth(5);
    testModeHint.setDepth(5);
    frame.setDepth(6);
  }

  private createTitleButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    mode: MatchMode,
  ): { button: Phaser.GameObjects.Image; label: Phaser.GameObjects.Text } {
    const upKey = ensureButtonTexture(this, `ui/title/${mode}-${width}x${height}`, width, height, "button");
    const hoverKey = ensureButtonTexture(this, `ui/title/${mode}-${width}x${height}-hover`, width, height, "buttonHover");
    const button = this.add.image(x, y, upKey).setInteractive({ useHandCursor: true });
    const text = this.add
      .text(button.x, button.y, label, {
        fontFamily: "Courier New",
        fontSize: "28px",
        color: "#20160f",
      })
      .setOrigin(0.5);
    fitTextToBox(text, { maxWidth: width - 48, maxHeight: 44, minFontSize: 16 });

    this.tweens.add({
      targets: [button, text],
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 920,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    button.on("pointerover", () => {
      button.setTexture(hoverKey);
      text.setScale(1.05);
    });

    button.on("pointerout", () => {
      button.setTexture(upKey);
      text.setScale(1);
    });

    button.on("pointerdown", () => {
      this.scene.start("battle", { mode });
    });

    return { button, label: text };
  }
}
