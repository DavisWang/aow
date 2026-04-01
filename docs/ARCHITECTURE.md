# Architecture

## Overview

The game is structured around four layers:

| Layer | Responsibility |
| --- | --- |
| Content data | Static definitions for units, towers, supers, and base properties |
| Simulation | Match state updates: economy, AI, movement, combat, queues, and win/loss |
| Scene/UI | Rendering, generated art, HUD, menus, overlays, and input wiring |
| Audio | Synthesized music, SFX playback, unlock handling, and persisted audio state |

## Boot Flow

1. [`src/main.ts`](/Users/davis.wang/Documents/aow/src/main.ts) creates the Phaser game.
2. The app chooses `TitleScene` by default, or `BattleScene` when `?scene=battle` is present.
3. `TitleScene` hands off to `BattleScene`.
4. `BattleScene` owns the visible world and HUD, but delegates game rules to the match system.

## Data Model

Static content now lives across:
- [`src/game/data/ages.ts`](/Users/davis.wang/Documents/aow/src/game/data/ages.ts)
- [`src/game/data/prehistoric.ts`](/Users/davis.wang/Documents/aow/src/game/data/prehistoric.ts)
- [`src/game/data/medieval.ts`](/Users/davis.wang/Documents/aow/src/game/data/medieval.ts)
- [`src/game/data/renaissance.ts`](/Users/davis.wang/Documents/aow/src/game/data/renaissance.ts)
- [`src/game/data/modern.ts`](/Users/davis.wang/Documents/aow/src/game/data/modern.ts)
- [`src/game/data/future.ts`](/Users/davis.wang/Documents/aow/src/game/data/future.ts)

Key ideas:
- units define their own cost, range, cadence, rewards, build time, and optional projectile profile
- towers define their own range, cadence, and projectile profile
- an age definition bundles units, towers, base configuration, and super configuration
- an ordered age registry decides what comes next
- AI behavior is described through timed script entries gated by the enemy's current age

The match state is side-aware for ages, so player and enemy can progress independently while existing entities remain valid.

This keeps new ages mostly a data addition problem instead of a scene rewrite problem.

## Match Simulation

[`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts) is the authoritative game state update loop.

It handles:
- build queue processing
- scripted enemy AI
- side-specific age advancement
- super volleys
- unit movement and targeting
- tower targeting
- projectile updates and impact resolution
- combat audio event emission
- kill rewards
- win/loss conditions

The scene should treat this module as the source of truth and avoid duplicating gameplay rules in UI code.

The simulation now also emits lightweight audio events for:
- projectile launches
- projectile impacts
- melee contact hits
- deaths
- super casts
- base damage and destruction

The battle scene drains that queue and decides how to render it sonically, so combat feel improves without moving gameplay authority out of the simulation layer.

Regression coverage for this layer lives in:
- [`src/game/systems/match.test.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.test.ts)

That suite currently protects:
- age progression through all five ages
- age-gated purchases
- tower selling
- shared tower targeting behavior
- same-age duel ordering
- `Omega Colossus` matchup intent

## Age Progression Boundary

The battle scene is allowed to:
- show the current player/enemy ages
- rebuild the purchase menus when the player's age changes
- invoke the age-up action through the HUD button

The match system owns:
- whether a side is eligible to advance
- base upgrades and tower-slot repositioning on age-up
- which super belongs to each side's current age
- content gating so a side cannot buy units or towers from an age it has not reached

## HUD Strategy

The battle HUD is camera-anchored in world space instead of relying on implicit fixed-position container behavior.

Reason:
- it keeps clickable bounds aligned with rendered positions after horizontal scrolling
- it avoids severe regressions for critical controls like `BUY UNITS`, `BUY TOWERS`, age-up, supers, and `PLAY AGAIN`

## Text Fitting

[`src/game/ui/textFit.ts`](/Users/davis.wang/Documents/aow/src/game/ui/textFit.ts) centralizes bounded text sizing.

Use it whenever:
- text sits inside a button
- text must stay inside a banner/panel
- runtime-generated labels may grow or shrink

Regression tests for the sizing logic live in:
- [`src/game/ui/textFit.test.ts`](/Users/davis.wang/Documents/aow/src/game/ui/textFit.test.ts)

## Camera Input

Camera movement rules now live in:
- [`src/game/ui/cameraScroll.ts`](/Users/davis.wang/Documents/aow/src/game/ui/cameraScroll.ts)

The battle scene uses this helper so:
- pointer edge scrolling can stay wide across most of the battlefield
- the top HUD band can use a much shallower edge zone
- left/right arrow-key panning shares the same speed model instead of becoming a separate ad hoc path

Regression tests for these input rules live in:
- [`src/game/ui/cameraScroll.test.ts`](/Users/davis.wang/Documents/aow/src/game/ui/cameraScroll.test.ts)

## Generated Art Layer

The current build uses a dedicated render helper:
- [`src/game/render/art.ts`](/Users/davis.wang/Documents/aow/src/game/render/art.ts)

It owns:
- generated sprite textures for units, towers, bases, projectiles, and world dressing
- generated panel/button textures for the HUD and overlays
- generated HUD icon textures for utility controls, including the audio toggle
- render-only impact and dust effects
- animation registration for sprite-driven idle/walk loops
- per-projectile visual styles so content data can choose stone, arrow, cannonball, bullet, rocket, bomb, plasma, laser, and other effect families explicitly

This keeps presentation upgrades out of [`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts), so the simulation stays authoritative while the scene layer remains free to iterate on visuals.

## Audio Layer

The current build uses a dedicated synthesized audio helper:
- [`src/game/audio/controller.ts`](/Users/davis.wang/Documents/aow/src/game/audio/controller.ts)

It owns:
- browser-safe audio unlock and `AudioContext` lifecycle
- a single low-mix battle music loop
- family-based SFX synthesis for combat and UI events
- persisted `audioEnabled` preference storage
- result stings and other non-simulation audio cues

The corner toggle is shared through:
- [`src/game/ui/audioToggle.ts`](/Users/davis.wang/Documents/aow/src/game/ui/audioToggle.ts)

That helper keeps the small speaker button consistent between the title and battle scenes while the audio controller remains the single source of truth for enabled/disabled state.

## Balance Contracts

Content tuning is protected by:
- [`src/game/data/ageBalance.test.ts`](/Users/davis.wang/Documents/aow/src/game/data/ageBalance.test.ts)

Current protected contracts:
- all supers stay on the shared `45s` cooldown target
- `Omega Colossus` stays above the global tower-range ceiling
- `2`-age-up attackers remain lethal against lower-age non-mega units
- lower-age mega resistance stays bounded

## Deployment Model

The app is built as a static site:
- Vite builds into `dist/`
- GitHub Actions publishes the built artifact
- GitHub Pages serves the result

This keeps production hosting simple and makes releases easy to verify locally with `npm run preview`.
