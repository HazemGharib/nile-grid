import Phaser from 'phaser';

// Character keys - note: map uses umm_sayed but sprite file is umm-sayed
export const CHARACTERS = ['nour', 'adel', 'laila', 'guard', 'umm-sayed', 'karim', 'rashid', 'ragab'] as const;
export const PLAYABLE_CHARACTERS = ['nour', 'adel', 'laila'] as const;
export const PORTRAIT_CHARACTERS = ['nour', 'adel', 'laila', 'umm-sayed', 'karim', 'rashid', 'ragab'] as const;

// Map character ID from map (uses underscores) to sprite key (uses hyphens)
export function mapCharacterIdToSpriteKey(characterId: string): string {
  return characterId.replace(/_/g, '-');
}

// Sprite index interface
export interface SpriteInfo {
  name: string;
  file: string;
  size: [number, number];
  tiles: [number, number];
  group: string;
}

let spritesIndex: SpriteInfo[] = [];

export function getSpritesIndex(): SpriteInfo[] {
  return spritesIndex;
}

export function setSpritesIndex(data: SpriteInfo[]): void {
  spritesIndex = data;
}

export function loadGameAssets(scene: Phaser.Scene): void {
  // Character spritesheets (96x128, 24x32 frames)
  // Rows: down, left, right, up (4 frames each)
  CHARACTERS.forEach(key => {
    scene.load.spritesheet(key, `/art/sheets/${key}.png`, {
      frameWidth: 24,
      frameHeight: 32
    });
  });
  
  // Bolbol drone (64x64, 16x16 frames)
  scene.load.spritesheet('bolbol', '/art/sheets/bolbol.png', {
    frameWidth: 16,
    frameHeight: 16
  });
  
  // Portraits (256x64 strips, 64x64 frames - 4 expressions)
  PORTRAIT_CHARACTERS.forEach(key => {
    scene.load.spritesheet(`portrait-${key}`, `/art/sheets/portraits/${key}.png`, {
      frameWidth: 64,
      frameHeight: 64
    });
  });
  
  // Tiled map
  scene.load.tilemapTiledJSON('ismailia', '/art/maps/ismailia-m1-3.json');
  
  // Tilesets
  scene.load.image('ground', '/art/tilesets/ismailia-m1-3-ground.png');
  scene.load.image('collision', '/art/tilesets/collision.png');
  
  // Map sprites (loaded from sprites index)
  spritesIndex.forEach(sprite => {
    scene.load.image(sprite.name, `/art/${sprite.file}`);
  });
}

export function createCharacterAnimations(scene: Phaser.Scene): void {
  const DIRECTIONS = ['down', 'left', 'right', 'up'] as const;
  
  CHARACTERS.forEach(key => {
    DIRECTIONS.forEach((dir, rowIndex) => {
      // Walk animation (4 frames per direction)
      scene.anims.create({
        key: `${key}-walk-${dir}`,
        frames: scene.anims.generateFrameNumbers(key, {
          start: rowIndex * 4,
          end: rowIndex * 4 + 3
        }),
        frameRate: 8,
        repeat: -1
      });
      
      // Idle animation (single frame)
      scene.anims.create({
        key: `${key}-idle-${dir}`,
        frames: [{ key, frame: rowIndex * 4 }],
        frameRate: 1,
        repeat: -1
      });
    });
    
    // Default idle/walk (down direction)
    scene.anims.create({
      key: `${key}-idle`,
      frames: [{ key, frame: 0 }],
      frameRate: 1,
      repeat: -1
    });
    
    scene.anims.create({
      key: `${key}-walk`,
      frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
  });
  
  // Bolbol hover animation (4 frames per direction, same layout as characters)
  ['down', 'left', 'right', 'up'].forEach((dir, rowIndex) => {
    scene.anims.create({
      key: `bolbol-hover-${dir}`,
      frames: scene.anims.generateFrameNumbers('bolbol', {
        start: rowIndex * 4,
        end: rowIndex * 4 + 3
      }),
      frameRate: 6,
      repeat: -1
    });
  });
  
  // Default bolbol hover
  scene.anims.create({
    key: 'bolbol-hover',
    frames: scene.anims.generateFrameNumbers('bolbol', { start: 0, end: 3 }),
    frameRate: 6,
    repeat: -1
  });
}
