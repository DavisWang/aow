import "./styles.css";
import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./game/config";
import { BattleScene } from "./game/scenes/BattleScene";
import { TitleScene } from "./game/scenes/TitleScene";

// `?scene=battle` is a deliberate debug hook so the gameplay scene can be
// opened directly during combat and HUD iteration.
const searchParams = new URLSearchParams(window.location.search);
const startInBattle = searchParams.get("scene") === "battle";

// Keep the Phaser bootstrap intentionally small. Scenes and simulation systems
// own almost all game behavior so the entrypoint stays easy to reason about.
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "app",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#182436",
  pixelArt: true,
  scene: startInBattle ? [BattleScene, TitleScene] : [TitleScene, BattleScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
});

export default game;
