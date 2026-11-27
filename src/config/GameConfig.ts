export const GameConfig = {
  GAME_WIDTH: 480,
  GAME_HEIGHT: 320,
  
  TILE_SIZE: 16,
  CHARACTER_WIDTH: 24,
  CHARACTER_HEIGHT: 32,
  PORTRAIT_SIZE: 64,
  
  PLAYER_SPEED: 80,
  SPRINT_MULTIPLIER: 1.5,
  
  MAP_SCALE: 3.5,
  CHUNK_SIZE: 32,
  CHUNK_LOAD_RADIUS: 2,
  
  CAMERA_LERP: 0.1,
  
  MINIMAP_WIDTH: 100,
  MINIMAP_HEIGHT: 60,
  
  PATROL_CYCLE_MS: 9000,
  
  JOYSTICK_RADIUS: 40,
  JOYSTICK_THRESHOLD: 10,
  
  DIALOGUE_BOX_HEIGHT: 80,
  DIALOGUE_DISPLAY_TIME: 3000,
  BUBBLE_DISPLAY_TIME: 2000,
  
  DEBUG: false
} as const;

export const Colors = {
  NEON_MAGENTA: 0xff00ff,
  NEON_CYAN: 0x00ffff,
  NEON_GOLD: 0xffd700,
  HORUS_RED: 0xff3333,
  
  UI_BG: 0x1a1a2e,
  UI_BORDER: 0x4a4a6e,
  UI_TEXT: 0xffffff,
  UI_HIGHLIGHT: 0xff00ff,
  
  WATER: 0x2266aa,
  GRASS: 0x336633,
  SAND: 0xccaa66,
  ROAD: 0x444444,
  BUILDING: 0x666677
} as const;

export const CharacterStats = {
  nour: {
    name: 'Nour Hassan',
    nameAr: 'نور حسن',
    role: 'courier',
    speed: 5,
    health: 2,
    stealth: 4,
    hacking: 2,
    combat: 3,
    support: 1,
    puzzle: 3,
    color: 0xff00ff
  },
  adel: {
    name: 'Adel Mansour',
    nameAr: 'عادل منصور',
    role: 'mechanic',
    speed: 2,
    health: 5,
    stealth: 2,
    hacking: 2,
    combat: 4,
    support: 5,
    puzzle: 3,
    color: 0xffd700
  },
  laila: {
    name: 'Laila Farouk',
    nameAr: 'ليلى فاروق',
    role: 'hacker',
    speed: 3,
    health: 2,
    stealth: 4,
    hacking: 5,
    combat: 2,
    support: 2,
    puzzle: 5,
    color: 0x00ffff
  }
} as const;

export type CharacterId = keyof typeof CharacterStats;
