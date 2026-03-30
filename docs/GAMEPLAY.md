# Gameplay Guide

## Match Loop

Each match is a single horizontal battlefield with one base on each side.

The player and AI both:
- spend money to queue units
- buy towers into fixed slots
- earn kill rewards
- try to destroy the opposing base
- can advance into the next age once enough XP is earned

The AI also receives passive income so the lane stays active.

The match ends when either base reaches `0` HP.

## Age Progression

Implemented age path:

| Order | Age | Unlock |
| --- | --- | --- |
| 1 | `Prehistoric` | Starts active |
| 2 | `Medieval` | Requires the prehistoric XP threshold |
| 3 | `Renaissance` | Requires the medieval XP threshold |
| 4 | `Modern` | Requires the renaissance XP threshold |
| 5 | `Future` | Requires the modern XP threshold |

Rules:
- the player advances through the HUD button
- the AI advances through its scripted loop once the same threshold is met
- existing units and towers stay on the field after an age-up
- new purchases come from the side's current age only

## Rosters

| Age | Slot 1 | Slot 2 | Slot 3 | Slot 4 |
| --- | --- | --- | --- | --- |
| `Prehistoric` | `Caveman` | `Stonethrower` | `Dino Rider` | — |
| `Medieval` | `Swordsman` | `Archer` | `Knight` | — |
| `Renaissance` | `Musketeer` | `Cannoneer` | `Cavalier` | — |
| `Modern` | `Ground Infantry` | `Machine Gunner` | `Tank` | — |
| `Future` | `Sentinels` | `Plasma Ranger` | `Titan Walker` | `Omega Colossus` |

Late-game read:
- `Omega Colossus` is the capstone Future unit.
- it is intended to outrange towers
- it should beat `2` `Titan Walkers`, but lose to `4`

## Towers

Every age keeps `3` tower slots.

| Age | Tower 1 | Tower 2 | Tower 3 |
| --- | --- | --- | --- |
| `Prehistoric` | `Stone Guard` | `Fossil Catapult` | `Ember Totem` |
| `Medieval` | `Arrow Tower` | `Ballista Tower` | `Fire Cauldron` |
| `Renaissance` | `Arquebus Tower` | `Bombard Tower` | `Alchemist Tower` |
| `Modern` | `Gun Turret` | `Gatling Gun` | `Missile Launcher` |
| `Future` | `Pulse Turret` | `Drone Bay` | `Ion Blaster` |

Design intent:
- towers help control lane pressure near the base
- tower placement order does not affect whether they can fire
- tower purchases are permanent for the match
- towers can be sold by selecting the tower and using the floating `X` action

## Supers

| Age | Super |
| --- | --- |
| `Prehistoric` | `Meteor Shower` |
| `Medieval` | `Rain of Arrows` |
| `Renaissance` | `Trebuchet Volley` |
| `Modern` | `Carpet Bomb` |
| `Future` | `Lazer Cannon` |

Behavior:
- player-triggered or AI-triggered
- locked behind cooldown
- rains impacts onto the enemy side of the battlefield
- never damages friendly units
- all supers currently share a `45s` cooldown target

## Build Queue

Units do not spawn instantly.

Rules:
- the queue holds up to `5` units
- only the front item builds at a time
- each unit has its own build duration
- the HUD shows the queue as five bounded slots

This keeps unit production readable and creates timing decisions without adding more menus.

## Enemy AI

The AI is intentionally simple but active enough to pressure the player.

Current advantages:
- passive income to sustain constant pressure
- double money and XP rewards for kills
- scripted purchasing priorities, age-up timing, tower timings, and super timing across all ages

Constraint:
- the match should still remain beatable with competent play

## Camera And HUD

The battlefield scrolls horizontally, but critical controls are anchored to the viewport:
- buy unit controls
- buy tower controls
- super button
- advance age button
- end-of-match replay button

Current input model:
- mouse edge scrolling remains available
- left/right arrow keys also pan the battlefield
- the top screen band uses a narrower edge-scroll activation zone so clicks on `SUPER` and `ADVANCE` do not accidentally drag the camera

This is a hard requirement because input regressions were previously caused by camera movement.

## Balance Direction

Current balance tenets enforced by regression tests:
- a unit, tower, or super that is `2` ages ahead should usually kill lower-age non-mega units in `1-2` hits
- same-age higher-cost units should generally beat lower-cost units in clean `1v1` fights
- mega units received larger movement-speed buffs so they can actually close and use their damage budgets
