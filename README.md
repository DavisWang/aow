# Age of War

`Age of War` is a browser-based real-time lane battler built with `Phaser`, `TypeScript`, and `Vite`.

The current build is close to gameplay-complete for the core single-player loop. It now ships a browser-playable five-age ladder with:
- title screen
- one-lane base-vs-base combat
- functional age progression from `Prehistoric` through `Future`
- unit buying with a 5-slot build queue
- tower buying with 3 tower slots
- tower selling from an in-world `X` action
- super abilities per age with shared `45s` cooldowns
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
| Restart after match end | Click `PLAY AGAIN` |

## Current Scope

Included in the current build:
- all five ages:
  - `Prehistoric`
  - `Medieval`
  - `Renaissance`
  - `Modern`
  - `Future`
- full current unit roster:
  - `Caveman`, `Stonethrower`, `Dino Rider`
  - `Swordsman`, `Archer`, `Knight`
  - `Musketeer`, `Cannoneer`, `Cavalier`
  - `Ground Infantry`, `Machine Gunner`, `Tank`
  - `Sentinels`, `Plasma Ranger`, `Titan Walker`, `Omega Colossus`
- full current tower roster:
  - `Stone Guard`, `Fossil Catapult`, `Ember Totem`
  - `Arrow Tower`, `Ballista Tower`, `Fire Cauldron`
  - `Arquebus Tower`, `Bombard Tower`, `Alchemist Tower`
  - `Gun Turret`, `Gatling Gun`, `Missile Launcher`
  - `Pulse Turret`, `Drone Bay`, `Ion Blaster`
- in-match age advancement once each current-age XP threshold is met
- stylized generated sprite presentation
- top HUD and menu interaction hardened against camera scroll drift
- data-driven balance coverage for age breakpoints, duel ordering, super cooldowns, and camera-scroll input rules
- desktop-first interaction model
- local single-player loop against scripted AI

Not included yet:
- save/progression
- audio
- imported hand-authored sprite sheets
- mobile-specific UX
- deep performance optimization for very large late-game unit counts

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
| [`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts) | Match simulation, economy, combat, AI, and queues |
| [`src/game/systems/match.test.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.test.ts) | Match-level regression tests for progression, balance, and duels |
| [`src/game/render/art.ts`](/Users/davis.wang/Documents/aow/src/game/render/art.ts) | Generated sprite art, UI textures, and render-only effects |
| [`src/game/ui/cameraScroll.ts`](/Users/davis.wang/Documents/aow/src/game/ui/cameraScroll.ts) | Shared camera edge-scroll and keyboard-pan helpers |
| [`docs/ARCHITECTURE.md`](/Users/davis.wang/Documents/aow/docs/ARCHITECTURE.md) | Architecture overview |
| [`docs/GAMEPLAY.md`](/Users/davis.wang/Documents/aow/docs/GAMEPLAY.md) | Current gameplay and controls guide |
| [`docs/RELEASE_v0.1.0.md`](/Users/davis.wang/Documents/aow/docs/RELEASE_v0.1.0.md) | Historical initial release notes and deployment notes |

## Release

Release notes for the active build live in:
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

- Add stronger age-up ceremony and audiovisual feedback now that the full ladder is playable.
- Continue the late-game performance pass for battles with very high unit counts.
- Add more age-specific battlefield dressing so the environment evolves with the roster.
- Prefer extending the age registry and data model over baking balance or art rules into the scene code.
