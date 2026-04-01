import Phaser from "phaser";
import { audioController } from "../audio/controller";
import { ensureButtonTexture, fitDisplayObjectToBox, getHudIconTextureKey } from "../render/art";

export interface AudioToggleView {
  container: Phaser.GameObjects.Container;
  syncState: () => void;
  destroy: () => void;
}

export function createAudioToggle(scene: Phaser.Scene, x: number, y: number): AudioToggleView {
  const width = 42;
  const height = 42;
  const baseKey = ensureButtonTexture(scene, `ui/audio-toggle/${width}x${height}`, width, height, "button");
  const hoverKey = ensureButtonTexture(scene, `ui/audio-toggle/${width}x${height}-hover`, width, height, "buttonHover");
  const container = scene.add.container(x, y);
  const background = scene.add.image(0, 0, baseKey).setInteractive({ useHandCursor: true });
  const icon = scene.add.image(0, 0, getHudIconTextureKey("audioOn")).setAlpha(0.82);
  fitDisplayObjectToBox(icon, 20, 20);
  container.add([background, icon]);

  const syncState = (): void => {
    const enabled = audioController.isEnabled();
    icon.setTexture(getHudIconTextureKey(enabled ? "audioOn" : "audioOff"));
    fitDisplayObjectToBox(icon, 20, 20);
    background.setAlpha(enabled ? 0.76 : 0.62);
    icon.setAlpha(enabled ? 0.86 : 0.72);
  };

  const unsubscribe = audioController.subscribe(syncState);
  syncState();

  background.on("pointerover", () => {
    background.setTexture(hoverKey);
    container.setScale(1.04);
  });

  background.on("pointerout", () => {
    background.setTexture(baseKey);
    container.setScale(1);
  });

  background.on("pointerdown", async () => {
    await audioController.unlock();
    const enabled = audioController.toggleEnabled();
    if (enabled) {
      audioController.playUiClick();
    }
    syncState();
  });

  return {
    container,
    syncState,
    destroy: () => {
      unsubscribe();
      container.destroy();
    },
  };
}
