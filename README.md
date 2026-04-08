# Age of War

`Age of War` is a browser-based real-time lane battler built with `Phaser`, `TypeScript`, and `Vite`.

A fully playable five-age lane battler with:
- title screen
- one-lane base-vs-base combat
- functional age progression from `Prehistoric` through `Future`
- unit buying with a 5-slot build queue
- tower buying with 3 tower slots
- tower selling from an in-world `X` action
- super abilities per age with shared `45s` cooldowns
- low-mix synthesized battle music and combat sound effects
- persistent corner toggle for sound/music on or off
- simple enemy AI with passive income and age progression
- generated sprite art and light animation polish
- keyboard and edge-scroll camera control
- roster and age-breakpoint regression coverage
- win/loss flow and replay

## Quick Start

Requirements:
- `Node.js 20+`
- `npm`

Install and run:

```bash
npm install
npm run dev
```

Useful scripts:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Run the local Vite dev server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the built production bundle locally |
| `npm run test` | Run regression tests |

## Controls

| Action | Input |
| --- | --- |
| Start a match | Click `NEW GAME` |
| Start a sandboxed preview run | Click `TEST MODE` |
| Scroll battlefield | Move the mouse near the far left or right edge of the viewport |
| Scroll battlefield | Press the left/right arrow keys |
| Buy units | Click `BUY UNITS`, then click a unit in the submenu |
| Buy towers | Click `BUY TOWERS`, then click a tower in the submenu |
| Sell a built tower | Click the tower, then click the floating `X` above it |
| Advance age | Click `ADVANCE` once enough XP is earned |
| Trigger super | Click `SUPER` when it is off cooldown |
| Toggle sound/music | Click the small speaker button in the top-right corner |
| Restart after match end | Click `PLAY AGAIN` |

## Game Content
- all five ages:
  - `Prehistoric`
  - `Medieval`
  - `Renaissance`
  - `Modern`
  - `Future`
- full unit roster:
  - `Caveman`, `Stonethrower`, `Dino Rider`
  - `Swordsman`, `Archer`, `Knight`
  - `Musketeer`, `Cannoneer`, `Cavalier`
  - `Ground Infantry`, `Machine Gunner`, `Tank`
  - `Sentinels`, `Plasma Ranger`, `Titan Walker`, `Omega Colossus`
- full tower roster:
  - `Stone Guard`, `Fossil Catapult`, `Ember Totem`
  - `Arrow Tower`, `Ballista Tower`, `Fire Cauldron`
  - `Arquebus Tower`, `Bombard Tower`, `Alchemist Tower`
  - `Gun Turret`, `Gatling Gun`, `Missile Launcher`
  - `Pulse Turret`, `Drone Bay`, `Ion Blaster`
- in-match age advancement once each age's XP threshold is met
- synthesized in-browser battle music plus combat and UI sound effects
- persistent top-right audio toggle shared between title and battle scenes
- stylized generated sprite presentation
- top HUD and menu interaction hardened against camera scroll drift
- data-driven balance coverage for age breakpoints, duel ordering, super cooldowns, and camera-scroll input rules
- desktop-first interaction model
- local single-player loop against scripted AI

Planned future additions:
- save/progression
- hand-authored sprite sheets
- mobile UX
- late-game performance optimization for very large unit counts

## Project Structure

| Path | Purpose |
| --- | --- |
| [`src/main.ts`](/Users/davis.wang/Documents/aow/src/main.ts) | Phaser bootstrap and scene selection |
| [`src/game/config.ts`](/Users/davis.wang/Documents/aow/src/game/config.ts) | Shared gameplay and layout constants |
| [`src/game/types.ts`](/Users/davis.wang/Documents/aow/src/game/types.ts) | Core runtime and content types |
| [`src/game/data/ages.ts`](/Users/davis.wang/Documents/aow/src/game/data/ages.ts) | Ordered age registry and shared content lookups |
| [`src/game/data/prehistoric.ts`](/Users/davis.wang/Documents/aow/src/game/data/prehistoric.ts) | Prehistoric content data and AI configuration |
| [`src/game/data/medieval.ts`](/Users/davis.wang/Documents/aow/src/game/data/medieval.ts) | Medieval content data and AI configuration |
| [`src/game/data/renaissance.ts`](/Users/davis.wang/Documents/aow/src/game/data/renaissance.ts) | Renaissance content data and AI configuration |
| [`src/game/data/modern.ts`](/Users/davis.wang/Documents/aow/src/game/data/modern.ts) | Modern content data and AI configuration |
| [`src/game/data/future.ts`](/Users/davis.wang/Documents/aow/src/game/data/future.ts) | Future content data and AI configuration |
| [`src/game/scenes/TitleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/TitleScene.ts) | Title screen scene |
| [`src/game/scenes/BattleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/BattleScene.ts) | Main gameplay scene and HUD |
| [`src/game/audio/controller.ts`](/Users/davis.wang/Documents/aow/src/game/audio/controller.ts) | Shared synthesized music, SFX, and audio preference controller |
| [`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts) | Match simulation, economy, combat, AI, and queues |
| [`src/game/systems/match.test.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.test.ts) | Match-level regression tests for progression, balance, and duels |
| [`src/game/render/art.ts`](/Users/davis.wang/Documents/aow/src/game/render/art.ts) | Generated sprite art, UI textures, and render-only effects |
| [`src/game/ui/audioToggle.ts`](/Users/davis.wang/Documents/aow/src/game/ui/audioToggle.ts) | Shared top-right sound/music toggle helper |
| [`src/game/ui/cameraScroll.ts`](/Users/davis.wang/Documents/aow/src/game/ui/cameraScroll.ts) | Shared camera edge-scroll and keyboard-pan helpers |
| [`docs/ARCHITECTURE.md`](/Users/davis.wang/Documents/aow/docs/ARCHITECTURE.md) | Architecture overview |
| [`docs/GAMEPLAY.md`](/Users/davis.wang/Documents/aow/docs/GAMEPLAY.md) | Current gameplay and controls guide |
| [`docs/RELEASE_v0.1.0.md`](/Users/davis.wang/Documents/aow/docs/RELEASE_v0.1.0.md) | Historical v0.1.0 release notes |

## Release

Release notes:
- [`CHANGELOG.md`](/Users/davis.wang/Documents/aow/CHANGELOG.md)
- [`docs/RELEASE_v0.1.0.md`](/Users/davis.wang/Documents/aow/docs/RELEASE_v0.1.0.md)

Supporting docs:
- [`docs/ARCHITECTURE.md`](/Users/davis.wang/Documents/aow/docs/ARCHITECTURE.md)
- [`docs/GAMEPLAY.md`](/Users/davis.wang/Documents/aow/docs/GAMEPLAY.md)
- [`CONTRIBUTING.md`](/Users/davis.wang/Documents/aow/CONTRIBUTING.md)

## Deployment

The repo is configured for GitHub Pages deployment through GitHub Actions.

After pushing `main`:
1. GitHub Actions builds the app.
2. The Pages workflow uploads the static `dist/` artifact.
3. GitHub Pages serves the production site.

## Notes For Future Work

- Add stronger age-up ceremony and audiovisual feedback.
- Split music and SFX into separate settings if the single toggle starts feeling too coarse.
- Consider per-age music variants only if the single battle theme stops carrying the full match.
- Continue the late-game performance pass for battles with very high unit counts.
- Add more age-specific battlefield dressing so the environment evolves with the roster.
- Prefer extending the age registry and data model over baking balance or art rules into the scene code.
