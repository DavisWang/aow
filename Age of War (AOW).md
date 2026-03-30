# Age of War (AOW)

## Overview

- Age of War (AOW) is a browser based, 2d side view, real time, single player auto battler game where the objective of the game is to defeat the opposing side’s base.  
- When implementing this game, do not imagine and deviate from this product spec, do not infer, if context or decisions are needed, highlight for a decision rather than inferring silently.

## Game Mechanics

- Ages  
  - The game is split into 5 distinct ages, each representing a slice of time in human civilization. Units, supers, towers, sprites are themed and distinct for each age.  
  - The ages are as follows:  
    - Prehistoric  
    - Medieval  
    - Renaissance  
    - Modern  
    - Future
  - There will be a button to advance to the next age, a player can advance to the next age once the necessary experience is gained.
- Units  
  - There are 3 basic types of units for each age, melee, ranged, and mega, with the `Future` age additionally containing a 4th capstone unit. Units march in a single file line automatically towards the enemy base after being built.  
  - Units will automatically attack enemy units or their base when in range.  
  - Units take up space on the map and cannot march forward until the obstacle (ie. the enemy unit) are killed. So what this looks like visually is that there are two lines of units facing each other, and they either wait to get in range to attack, or attack any enemy units that are in range.


| Age/Unit                   | Prehistoric  | Medieval  | Renaissance | Modern          | Future          |
| -------------------------- | ------------ | --------- | ----------- | --------------- | --------------- |
| **Melee (melee attack)**   | Caveman      | Swordsman | Musketeer   | Ground Infantry | Sentinels       |
| **Ranged (ranged attack)** | Stonethrower | Archer    | Cannoneer   | Machine Gunner  | Plasma Ranger   |
| **Mega (melee)**           | Dino Rider   | Knight    | Cavalier    | Tank            | Titan Walker    |
| **Capstone**               | —            | —         | —           | —               | Omega Colossus  |


- 
- Super  
  - Supers can be triggered via a button that creates projectiles that rain down on enemy units, this lasts 3-5 seconds. Enemy units hit by projectiles will incur damage.  
  - Supers run on a cooldown, and cannot be triggered again until the cooldown has elapsed.


| Age       | Prehistoric   | Medieval       | Renaissance      | Modern      | Future       |
| --------- | ------------- | -------------- | ---------------- | ----------- | ------------ |
| **Super** | Meteor Shower | Rain of Arrows | Trebuchet Volley | Carpet Bomb | Lazer cannon |


- Towers  
  - Towers are static defences that are mounted on the top of bases, there are 3 distinct slots for building towers, there are 3 tower choices per each age the player can buy.
  - Tower placement order should not create a firing penalty; if one tower can shoot a unit, all ready towers should be able to shoot it.
  - Built towers can be sold from an in-world `X` action above the selected tower.


| Age     | Prehistoric       | Medieval       | Renaissance     | Modern           | Future       |
| ------- | ----------------- | -------------- | --------------- | ---------------- | ------------ |
| Tower A | Stone Guard       | Arrow Tower    | Arquebus Tower  | Gun Turret       | Pulse Turret |
| Tower B | Fossil Catapult   | Ballista Tower | Bombard Tower   | Gatling Gun      | Drone Bay    |
| Tower C | Ember Totem       | Fire Cauldron  | Alchemist Tower | Missile Launcher | Ion Blaster  |


- Base  
  - Bases are where bought units are spawned, have a health pool, and the destruction of the base means a loss for the player, and a destruction of the opponent’s base means a win for the player.  
  - Bases
- Map  
  - There is a single map that is side scrollable and stops scrolling once either the player or the enemy’s base comes into full view.
  - The user moves their mouse toward the left or right screen edge to scroll the camera, and can also use the left/right arrow keys.
  - The top HUD band should be safer from accidental edge scrolling so clicks on super/advance controls do not pull the camera.
- Money  
  - Money is earned on killing a unit, the amount of money given is dependent on the unit type.
- Experience  
  - Experience is earned on killing a unit,  the amount of experience given is dependent on the unit type.

## UI/Look and feel

- The game is rendered in a panel completely, and occupies the entire browser window and can be dynamically sized.  
- The look of the game is 8bit in aesthetics and design.

## Screens

- Title Screen  
  - Name of the game: Age of War  
  - New game button  
  - By Pwner Studios as a footer
- Gameplay screen  
  - A bottom bar with the following information  
    - Current base health  
    - Current money  
    - A button for buying units  
      - This opens a submenu that shows all the units for the current age that can be bought. Units that cost more than the current money amount is greyed out.
    - A button for buying towers  
      - This opens a submenu that shows all the towers for the current age that can be bought. Units that cost more than the current money amount is greyed out.
    - A button for advancing to the next age, this button is disabled until the necessary experience is achieved.
    - A button for triggering super, there is a cooldown for super that is reflected in the UX of the button.
    - Enemy base health
  - A top-left utility panel with `SUPER` and `ADVANCE`
  - A floating `X` sell action above a selected built tower

## Physics:

- There is a need for a basic physics engine to detect collisions and hits. Primary use case is to ensure that projectiles from ranged units and supers, once making contact with an opposing unit, deals the relevant damage.  
- Projectiles fired by ranged units /towers are targeted based on the position of the opposing unit at the time of firing the projectile, in other words, there is no prediction logic that optimizes for accuracy based on things like projectile speed, movement speed, etc. There is no friendly fire.  
- Supers will create projectiles as well that rain down on units, there is no friendly fire.  
- Towers will create projectiles as well that target enemy units, there is no friendly fire.
- `Omega Colossus` is intended to outrange towers.

## Sprites

- The current build uses generated in-repo art for units, supers, bases, towers, projectiles, and UI textures.
- Sprites needed in the future:  
  - Units  
    - Standing  
    - Walking animation  
    - Attacking animation  
      - Including projectiles for ranged units
    - Killed animation
  - Super  
    - Animation once triggered.  
    - Projectiles
  - Bases  
    - Standby state  
    - Building units state
  - Towers  
    - Standby state  
    - Attacking animation  
    - Projectiles
