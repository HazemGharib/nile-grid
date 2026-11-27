import Phaser from 'phaser';
import { Colors, CharacterStats, CharacterId } from '../config/GameConfig';

export function generatePlaceholderSprites(scene: Phaser.Scene): void {
  generateCharacterSprites(scene);
  generateEnemySprite(scene);
  generateTileSprites(scene);
}

function generateCharacterSprites(scene: Phaser.Scene): void {
  const characters: CharacterId[] = ['nour', 'adel', 'laila'];
  
  characters.forEach(id => {
    const stats = CharacterStats[id];
    const color = stats.color;
    
    const idleTexture = generateCharacterFrame(scene, `character_${id}`, color, 'idle');
    scene.textures.addCanvas(`character_${id}`, idleTexture);
    
    const frames = [];
    for (let i = 0; i < 4; i++) {
      const frameCanvas = generateCharacterFrame(scene, `${id}_walk_${i}`, color, 'walk', i);
      const key = `${id}_walk_${i}`;
      scene.textures.addCanvas(key, frameCanvas);
      frames.push({ key, frame: 0 });
    }
    
    scene.anims.create({
      key: `${id}_idle`,
      frames: [{ key: `character_${id}`, frame: 0 }],
      frameRate: 1,
      repeat: -1
    });
    
    scene.anims.create({
      key: `${id}_walk`,
      frames: frames,
      frameRate: 8,
      repeat: -1
    });
  });
}

function generateCharacterFrame(
  _scene: Phaser.Scene,
  _key: string,
  color: number,
  _type: 'idle' | 'walk',
  frameIndex = 0
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 32;
  
  const ctx = canvas.getContext('2d')!;
  
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  const colorStr = `rgb(${r},${g},${b})`;
  const darkerColor = `rgb(${Math.floor(r * 0.6)},${Math.floor(g * 0.6)},${Math.floor(b * 0.6)})`;
  
  ctx.fillStyle = '#2a2a3a';
  ctx.beginPath();
  ctx.arc(12, 8, 6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = colorStr;
  const bodyOffset = Math.sin(frameIndex * Math.PI / 2) * 1;
  ctx.fillRect(6, 14 + bodyOffset, 12, 14);
  
  ctx.fillStyle = darkerColor;
  ctx.fillRect(8, 16 + bodyOffset, 8, 10);
  
  ctx.fillStyle = '#1a1a2a';
  const legOffset = Math.sin(frameIndex * Math.PI / 2) * 2;
  ctx.fillRect(7, 28, 4, 4 + legOffset);
  ctx.fillRect(13, 28, 4, 4 - legOffset);
  
  return canvas;
}

function generateEnemySprite(scene: Phaser.Scene): void {
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 32;
  
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#333344';
  ctx.beginPath();
  ctx.arc(12, 8, 6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(10, 4, 4, 4);
  
  ctx.fillStyle = '#222233';
  ctx.fillRect(6, 14, 12, 14);
  
  ctx.fillStyle = '#111122';
  ctx.fillRect(8, 16, 8, 10);
  
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(7, 28, 4, 4);
  ctx.fillRect(13, 28, 4, 4);
  
  scene.textures.addCanvas('character_enemy', canvas);
  
  scene.anims.create({
    key: 'enemy_idle',
    frames: [{ key: 'character_enemy', frame: 0 }],
    frameRate: 1,
    repeat: -1
  });
}

function generateTileSprites(scene: Phaser.Scene): void {
  const tiles = [
    { key: 'tile_sand', color: Colors.SAND },
    { key: 'tile_road', color: Colors.ROAD },
    { key: 'tile_grass', color: Colors.GRASS },
    { key: 'tile_water', color: Colors.WATER },
    { key: 'tile_building', color: Colors.BUILDING }
  ];
  
  tiles.forEach(({ key, color }) => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    
    const ctx = canvas.getContext('2d')!;
    
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, 16, 16);
    
    ctx.fillStyle = `rgba(255,255,255,0.1)`;
    for (let i = 0; i < 4; i++) {
      const x = Math.random() * 14;
      const y = Math.random() * 14;
      ctx.fillRect(x, y, 2, 2);
    }
    
    scene.textures.addCanvas(key, canvas);
  });
}

export function generatePortraitSprite(
  scene: Phaser.Scene,
  characterId: CharacterId,
  emotion: 'neutral' | 'happy' | 'concerned' | 'alert' = 'neutral'
): HTMLCanvasElement {
  const stats = CharacterStats[characterId];
  const color = stats.color;
  
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  
  const ctx = canvas.getContext('2d')!;
  
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  const colorStr = `rgb(${r},${g},${b})`;
  const darkerColor = `rgb(${Math.floor(r * 0.5)},${Math.floor(g * 0.5)},${Math.floor(b * 0.5)})`;
  
  ctx.fillStyle = darkerColor;
  ctx.fillRect(0, 0, 64, 64);
  
  ctx.fillStyle = '#3a3a4a';
  ctx.beginPath();
  ctx.arc(32, 28, 18, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = colorStr;
  ctx.fillRect(12, 46, 40, 18);
  
  ctx.fillStyle = '#ffffff';
  const eyeY = emotion === 'concerned' ? 26 : (emotion === 'alert' ? 24 : 25);
  ctx.fillRect(24, eyeY, 6, 4);
  ctx.fillRect(34, eyeY, 6, 4);
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(26, eyeY + 1, 3, 2);
  ctx.fillRect(36, eyeY + 1, 3, 2);
  
  ctx.fillStyle = '#2a2a3a';
  if (emotion === 'happy') {
    ctx.beginPath();
    ctx.arc(32, 36, 6, 0, Math.PI);
    ctx.fill();
  } else if (emotion === 'concerned') {
    ctx.fillRect(28, 36, 8, 2);
  } else {
    ctx.fillRect(28, 35, 8, 3);
  }
  
  const key = `portrait_${characterId}_${emotion}`;
  scene.textures.addCanvas(key, canvas);
  
  return canvas;
}
