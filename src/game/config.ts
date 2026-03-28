// Centralized layout and tuning constants for the current vertical slice.
// Future balancing work should start here rather than scattering values
// throughout scenes and systems.
export const GAME_WIDTH = 1440;
export const GAME_HEIGHT = 900;
export const HUD_HEIGHT = 180;
export const PLAYFIELD_HEIGHT = GAME_HEIGHT - HUD_HEIGHT;
export const WORLD_WIDTH = 2600;
export const GROUND_Y = PLAYFIELD_HEIGHT - 118;
export const PLAYER_BASE_X = 150;
export const ENEMY_BASE_X = WORLD_WIDTH - 150;
export const UNIT_SPACING = 12;
// The activation zone is intentionally wide so camera movement feels forgiving
// on desktop instead of requiring the cursor to hug the exact screen edge.
export const CAMERA_EDGE_SCROLL_ZONE = 260;
export const CAMERA_SCROLL_SPEED = 580;
export const DEFAULT_STARTING_MONEY = 240;
export const AGE_UP_XP = 650;
