import Phaser from 'phaser';

export function loadGameAssets(scene: Phaser.Scene): void {
  // Character spritesheets (96x128, 4 directions x 4 frames each)
  // Layout: 4 columns (frames) x 4 rows (down, left, right, up)
  scene.load.spritesheet('nour', '/sprites/nour.png', {
    frameWidth: 24,
    frameHeight: 32
  });
  scene.load.spritesheet('adel', '/sprites/adel.png', {
    frameWidth: 24,
    frameHeight: 32
  });
  scene.load.spritesheet('laila', '/sprites/laila.png', {
    frameWidth: 24,
    frameHeight: 32
  });
  scene.load.spritesheet('enemy', '/sprites/enemy.png', {
    frameWidth: 24,
    frameHeight: 32
  });
  
  // Drone Bulbul
  scene.load.spritesheet('bulbul', '/sprites/bulbul.png', {
    frameWidth: 16,
    frameHeight: 16
  });

  // Environment tiles (16x16) - Nile Neon night-time style
  const tiles = [
    'water', 'water_highlight', 'sand', 'road', 'road_curb_top', 'road_curb_bottom',
    'grass', 'quay', 'quay_edge', 'building_roof', 'building_wall', 'building_wall_dark',
    'palm', 'neon_magenta', 'neon_cyan', 'lamp', 'railway', 'bridge', 'boat'
  ];
  
  for (const tile of tiles) {
    scene.load.image(`tile_${tile}`, `/tiles/${tile}.png`);
  }

  // Character portraits (64x64) with expressions
  const characters = ['nour', 'adel', 'laila', 'enemy', 'umm_sayed', 'karim', 'hajj_rashid'];
  const emotions = ['neutral', 'happy', 'concerned'];
  
  for (const char of characters) {
    for (const emotion of emotions) {
      scene.load.image(`portrait_${char}_${emotion}`, `/portraits/${char}_${emotion}.png`);
    }
  }
}

export function createCharacterAnimations(scene: Phaser.Scene): void {
  const characters = ['nour', 'adel', 'laila', 'enemy'];
  // Direction order in spritesheet: down (row 0), left (row 1), right (row 2), up (row 3)
  const directions = ['down', 'left', 'right', 'up'];

  for (const char of characters) {
    for (let dirIdx = 0; dirIdx < directions.length; dirIdx++) {
      const dir = directions[dirIdx];
      const startFrame = dirIdx * 4;  // Each row has 4 frames
      
      // Idle animation (single frame)
      scene.anims.create({
        key: `${char}_idle_${dir}`,
        frames: [{ key: char, frame: startFrame }],
        frameRate: 1,
        repeat: -1
      });

      // Walk animation (4 frames)
      scene.anims.create({
        key: `${char}_walk_${dir}`,
        frames: scene.anims.generateFrameNumbers(char, {
          start: startFrame,
          end: startFrame + 3
        }),
        frameRate: 8,
        repeat: -1
      });
    }

    // Default idle/walk (down direction)
    scene.anims.create({
      key: `${char}_idle`,
      frames: [{ key: char, frame: 0 }],
      frameRate: 1,
      repeat: -1
    });

    scene.anims.create({
      key: `${char}_walk`,
      frames: scene.anims.generateFrameNumbers(char, { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
  }
  
  // Drone animation
  scene.anims.create({
    key: 'bulbul_hover',
    frames: scene.anims.generateFrameNumbers('bulbul', { start: 0, end: 3 }),
    frameRate: 6,
    repeat: -1
  });
}
