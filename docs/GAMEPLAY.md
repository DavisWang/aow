# Gameplay Guide

## Match Loop

Each match is a single horizontal battlefield with one base on each side.

The player and AI both:
- spend money to queue units
- buy towers into fixed slots
- gain money passively over time
- earn kill rewards
- try to destroy the opposing base

The match ends when either base reaches `0` HP.

## Prehistoric Roster

| Type | Unit | Role |
| --- | --- | --- |
| Basic | `Caveman` | Cheap melee frontliner |
| Ranged | `Stonethrower` | Mid-range projectile attacker |
| Heavy | `Dino Rider` | Expensive bruiser with stronger pressure |

## Towers

The prehistoric slice has three tower slots.

Design intent:
- towers should help control lane pressure near the base
- tower range should not lose trivially to ranged unit spacing
- tower purchases are permanent for the match

## Super

The prehistoric super is `Meteor Shower`.

Behavior:
- player-triggered or AI-triggered
- locked behind cooldown
- rains impacts onto the enemy side of the battlefield
- never damages friendly units

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
- scripted purchasing priorities and timings

Constraint:
- the match should still remain beatable with competent play

## Camera And HUD

The battlefield scrolls horizontally, but critical controls are anchored to the viewport:
- buy unit controls
- buy tower controls
- super button
- next age button
- end-of-match replay button

This is a hard requirement because input regressions were previously caused by camera movement.
