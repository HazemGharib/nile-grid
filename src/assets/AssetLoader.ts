import Phaser from 'phaser';

export function loadGameAssets(scene: Phaser.Scene): void {
  // Character spritesheets (96x128, 4 directions x 4 frames each)
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

  // Tile images
  scene.load.image('tile_road', '/tiles/road.png');
  scene.load.image('tile_sand', '/tiles/sand.png');
  scene.load.image('tile_building', '/tiles/building.png');
  scene.load.image('tile_water', '/tiles/water.png');
  scene.load.image('tile_canal', '/tiles/canal.png');
  scene.load.image('tile_bridge', '/tiles/bridge.png');
  scene.load.image('tile_grass', '/tiles/grass.png');
  scene.load.image('tile_building_wall', '/tiles/building_wall.png');

  // Character portraits
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
  const directions = ['down', 'left', 'right', 'up'];

  for (const char of characters) {
    for (let dirIdx = 0; dirIdx < directions.length; dirIdx++) {
      const dir = directions[dirIdx];
      const startFrame = dirIdx * 4;
      
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
}
