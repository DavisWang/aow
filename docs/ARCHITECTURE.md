# Architecture

## Overview

The game is structured around three layers:

| Layer | Responsibility |
| --- | --- |
| Content data | Static definitions for units, towers, supers, and base properties |
| Simulation | Match state updates: economy, AI, movement, combat, queues, and win/loss |
| Scene/UI | Rendering, HUD, menus, overlays, and input wiring |

## Boot Flow

1. [`src/main.ts`](/Users/davis.wang/Documents/aow/src/main.ts) creates the Phaser game.
2. The app chooses `TitleScene` by default, or `BattleScene` when `?scene=battle` is present.
3. `TitleScene` hands off to `BattleScene`.
4. `BattleScene` owns the visible world and HUD, but delegates game rules to the match system.

## Data Model

Static content lives in [`src/game/data/prehistoric.ts`](/Users/davis.wang/Documents/aow/src/game/data/prehistoric.ts).

The key idea is that content is data-driven:
- units define their own cost, range, cadence, rewards, and build time
- towers define their own range and projectile profile
- the age definition bundles units, towers, base configuration, and super configuration
- AI behavior is described through simple timed script entries

This makes future ages mostly a data addition problem instead of a scene rewrite problem.

## Match Simulation

[`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts) is the authoritative game state update loop.

It handles:
- passive income
- build queue processing
- scripted enemy AI
- super volleys
- unit movement and targeting
- tower targeting
- projectile updates and impact resolution
- kill rewards
- win/loss conditions

The scene should treat this module as the source of truth and avoid duplicating gameplay rules in UI code.

## HUD Strategy

The battle HUD is camera-anchored in world space instead of relying on implicit fixed-position container behavior.

Reason:
- it keeps clickable bounds aligned with rendered positions after horizontal scrolling
- it avoids severe regressions for critical controls like `BUY UNITS`, `BUY TOWERS`, `METEOR SHOWER`, and `PLAY AGAIN`

## Text Fitting

[`src/game/ui/textFit.ts`](/Users/davis.wang/Documents/aow/src/game/ui/textFit.ts) centralizes bounded text sizing.

Use it whenever:
- text sits inside a button
- text must stay inside a banner/panel
- runtime-generated labels may grow or shrink

Regression tests for the sizing logic live in:
- [`src/game/ui/textFit.test.ts`](/Users/davis.wang/Documents/aow/src/game/ui/textFit.test.ts)

## Deployment Model

The app is built as a static site:
- Vite builds into `dist/`
- GitHub Actions publishes the built artifact
- GitHub Pages serves the result

This keeps production hosting simple and makes releases easy to verify locally with `npm run preview`.

