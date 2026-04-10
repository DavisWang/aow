# Changelog

## Unreleased

- added English / Simplified Chinese i18n with a title-screen language toggle; battle HUD and shop strings follow the selected locale
- added battle simulation speed control (`0.5x`–`4x`) on a button below `ADVANCE`
- enemy receives passive experience (`5` XP/s) in addition to passive money; bottom HUD shows enemy XP vs current-age unlock threshold (mirrors the player XP line)
- removed minimum elapsed-time gates on AI age-up attempts so the enemy ages when XP allows, like the player
- added a synthesized audio pass:
  - quiet looping battle music
  - combat SFX for projectile fire/impact, melee contact hits, deaths, supers, and base damage/destruction
  - persistent top-right sound/music toggle shared by the title and battle scenes
- expanded the game from the original single age to the full five-age ladder:
  - `Renaissance`
  - `Modern`
  - `Future`
- added the full five-age rosters, towers, bases, and supers:
  - `Musketeer`, `Cannoneer`, `Cavalier`
  - `Ground Infantry`, `Machine Gunner`, `Tank`
  - `Sentinels`, `Plasma Ranger`, `Titan Walker`, `Omega Colossus`
  - `Arquebus Tower`, `Bombard Tower`, `Alchemist Tower`
  - `Gun Turret`, `Gatling Gun`, `Missile Launcher`
  - `Pulse Turret`, `Drone Bay`, `Ion Blaster`
  - `Trebuchet Volley`, `Carpet Bomb`, `Lazer Cannon`
- extended the shared age registry and enemy AI progression through all five ages
- expanded generated pixel-art coverage for the late-age units, towers, bases, projectiles, and impact effects
- added tower selling, shared tower firing behavior, and icon-led `SUPER` / `ADVANCE` HUD controls
- improved battle HUD stability with a top-band camera-scroll carveout and left/right arrow-key camera panning
- rebalanced units, towers, supers, and age breakpoints around stronger age separation and cleaner same-age duel ordering
- standardized all supers to a shared `45s` cooldown
- expanded regression coverage for ladder-wide progression, balance, duel ordering, camera-scroll rules, and content gating
- refreshed gameplay, architecture, and readme docs for the full five-age game

## 0.1.0 - 2026-03-27

Initial playable release.

- shipped initial prehistoric age
- added title screen and battle scene
- implemented units, towers, supers, queues, AI economy, and win/loss flow
- hardened HUD interaction while the camera scrolls
- added text fitting and regression tests for bounded UI text
- prepared the project for GitHub Pages deployment
