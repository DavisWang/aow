import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { fitTextToBox } from "../ui/textFit";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("title");
  }

  create(): void {
    // The title scene intentionally stays lightweight: it presents the slice,
    // proves the outer shell, and hands off immediately into gameplay.
    const sky = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1b2d46);
    sky.setStrokeStyle(8, 0xf9c963, 0.22);

    const title = this.add
      .text(GAME_WIDTH / 2, 210, "AGE OF WAR", {
        fontFamily: "Courier New",
        fontSize: "64px",
        color: "#f6efd7",
        stroke: "#26170d",
        strokeThickness: 10,
      })
      .setOrigin(0.5);
    fitTextToBox(title, { maxWidth: GAME_WIDTH - 120, maxHeight: 84, minFontSize: 34 });

    const subtitle = this.add
      .text(GAME_WIDTH / 2, 300, "Prehistoric vertical slice", {
        fontFamily: "Courier New",
        fontSize: "26px",
        color: "#ffd680",
      })
      .setOrigin(0.5);
    fitTextToBox(subtitle, { maxWidth: GAME_WIDTH - 160, maxHeight: 34, minFontSize: 18 });

    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 520, 230, 0x11161f, 0.78);
    panel.setStrokeStyle(4, 0xf4b756, 0.7);

    const body = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, "Fight across one lane.\nEarn money from kills.\nHold the line or break the enemy base.", {
        align: "center",
        fontFamily: "Courier New",
        fontSize: "24px",
        color: "#f7f2df",
        lineSpacing: 8,
      })
      .setOrigin(0.5);
    fitTextToBox(body, { maxWidth: 460, maxHeight: 150, minFontSize: 16, paddingX: 12, paddingY: 10 });

    const startButton = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, 280, 72, 0xc86d3c);
    startButton.setStrokeStyle(4, 0xffd38c, 0.9);
    startButton.setInteractive({ useHandCursor: true });

    const startLabel = this.add
      .text(startButton.x, startButton.y, "NEW GAME", {
        fontFamily: "Courier New",
        fontSize: "28px",
        color: "#1a130f",
      })
      .setOrigin(0.5);
    fitTextToBox(startLabel, { maxWidth: 244, maxHeight: 44, minFontSize: 18 });

    startButton.on("pointerover", () => {
      startButton.setFillStyle(0xe59453);
      startLabel.setScale(1.03);
    });

    startButton.on("pointerout", () => {
      startButton.setFillStyle(0xc86d3c);
      startLabel.setScale(1);
    });

    startButton.on("pointerdown", () => {
      this.scene.start("battle");
    });

    const footer = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 46, "By Pwner Studios", {
        fontFamily: "Courier New",
        fontSize: "20px",
        color: "#f1dc9c",
      })
      .setOrigin(0.5);
    fitTextToBox(footer, { maxWidth: 280, maxHeight: 24, minFontSize: 14 });
  }
}
