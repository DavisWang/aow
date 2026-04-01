# Build Note

## Header

- Project: `Age of War`
- Owner: `Game Developer`
- Date: `2026-03-31`
- Status: `ready_for_review`

## Summary

Implemented a browser-safe synthesized audio pass on top of the existing five-age build, including quiet battle music, combat SFX, and a persistent top-right sound/music toggle.

## What Changed

- Added [`src/game/audio/controller.ts`](/Users/davis.wang/Documents/aow/src/game/audio/controller.ts) for synthesized music, SFX playback, unlock handling, and persisted audio state.
- Added [`src/game/audio/preferences.ts`](/Users/davis.wang/Documents/aow/src/game/audio/preferences.ts) for the stored `audioEnabled` preference.
- Added [`src/game/ui/audioToggle.ts`](/Users/davis.wang/Documents/aow/src/game/ui/audioToggle.ts) so the title and battle scenes share the same small speaker toggle.
- Extended [`src/game/systems/match.ts`](/Users/davis.wang/Documents/aow/src/game/systems/match.ts) to emit combat audio events without changing the existing gameplay rules.
- Updated [`src/game/scenes/TitleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/TitleScene.ts) and [`src/game/scenes/BattleScene.ts`](/Users/davis.wang/Documents/aow/src/game/scenes/BattleScene.ts) to unlock audio on interaction, drive music lifecycle, and consume match audio events.
- Added generated `audioOn` / `audioOff` HUD textures in [`src/game/render/art.ts`](/Users/davis.wang/Documents/aow/src/game/render/art.ts).
- Refreshed the readme, gameplay guide, architecture note, changelog, and current-loop producer artifacts.

## Behavior Preserved

- title boot flow
- `?scene=battle` direct boot
- one-lane combat loop
- five-age progression
- camera edge scroll and keyboard pan
- existing HUD/menu layout
- replay flow
- current local run/test/build commands

## Known Residuals

- The browser automation pass can prove render state and boot flow, but it cannot substitute for a real human listen on speakers/headphones for final loudness/timbre judgment.
- The current audio settings surface is intentionally minimal: one on/off toggle for both music and SFX.
