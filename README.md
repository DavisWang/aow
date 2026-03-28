# Age of War

`Age of War` is a browser-based real-time lane battler built with `Phaser`, `TypeScript`, and `Vite`.

This repository currently ships a `v0.1.0` prehistoric vertical slice:
- title screen
- one-lane base-vs-base combat
- unit buying with a 5-slot build queue
- tower buying with 3 tower slots
- super ability with cooldown
- simple enemy AI with passive income
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
| Scroll battlefield | Move the mouse near the left or right side of the viewport |
| Buy units | Click `BUY UNITS`, then click a unit in the submenu |
| Buy towers | Click `BUY TOWERS`, then click a tower in the submenu |
| Trigger super | Click `METEOR SHOWER` when it is off cooldown |
| Restart after match end | Click `PLAY AGAIN` |

## Current Scope

This release is intentionally narrow.

Included in `v0.1.0`:
- prehistoric age only
- placeholder visuals
- desktop-first interaction model
- local single-player loop against scripted AI

Not included yet:
- later ages
- save/progression
- audio
- final sprite assets
- mobile-specific UX

## Project Structure

| Path | Purpose |
| --- | --- |
| [`src/main.ts`](/Users/davis.wang/Documents/aow/src/main.ts) | Phaser bootstrap and scene selection |
| [`src/game/config.ts`](/Users/davis.wang/Documents/aow/src/game/config.ts) | Shared gameplay and layout constants |
| [`src/game/types.ts`](/Users/davis.wang/Documents/aow/src/game/types.ts) | Core runtime and content types |
| [`src/game/data/prehistoric.ts`](/Users/davis.wang/Documents/aow/src/game/data/prehistoric.ts) | Age content data and AI configuration |
| [`src/game/scenes/TitleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/TitleScene.ts) | Title screen scene |
| [`src/game/scenes/BattleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/BattleScene.ts) | Main gameplay scene and HUD |
| [`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts) | Match simulation, economy, combat, AI, and queues |
| [`docs/ARCHITECTURE.md`](/Users/davis.wang/Documents/aow/docs/ARCHITECTURE.md) | Architecture overview |
| [`docs/RELEASE_v0.1.0.md`](/Users/davis.wang/Documents/aow/docs/RELEASE_v0.1.0.md) | Release notes and deployment notes |

## Release

Release notes for the current cut live in:
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

- Add additional ages as pure data expansion where possible.
- Keep UI hit testing and text fitting stable under camera movement.
- Prefer extending the data model over baking new balance values into the scene code.
