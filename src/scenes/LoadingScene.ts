import Phaser from 'phaser';
import { Colors } from '../config/GameConfig';
import { generatePlaceholderSprites } from '../assets/PlaceholderAssets';

export class LoadingScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private neonGlow!: Phaser.GameObjects.Graphics;
  private animationTimer = 0;

  constructor() {
    super({ key: 'LoadingScene' });
  }

  preload(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222244, 0.8);
    this.progressBox.fillRect(centerX - 120, centerY + 20, 240, 20);

    this.progressBar = this.add.graphics();

    this.neonGlow = this.add.graphics();

    this.add.text(centerX, centerY - 60, 'NILE GRID', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#ff00ff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(centerX, centerY - 30, 'نيل جريد', {
      fontFamily: 'serif',
      fontSize: '20px',
      color: '#00ffff'
    }).setOrigin(0.5);

    this.loadingText = this.add.text(centerX, centerY + 60, 'Loading...', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.drawNeonGlow(centerX, centerY - 45);

    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(Colors.NEON_MAGENTA, 1);
      this.progressBar.fillRect(centerX - 118, centerY + 22, 236 * value, 16);
    });

    this.load.on('complete', () => {
      this.loadingText.setText('Ready!');
      this.time.delayedCall(500, () => {
        this.scene.start('MainMenuScene');
      });
    });

    generatePlaceholderSprites(this);

    this.load.start();
  }

  private drawNeonGlow(x: number, y: number): void {
    this.neonGlow.clear();
    
    for (let i = 3; i > 0; i--) {
      const alpha = 0.1 * i;
      this.neonGlow.lineStyle(i * 2, Colors.NEON_MAGENTA, alpha);
      this.neonGlow.strokeRect(x - 100 - i * 2, y - 25 - i * 2, 200 + i * 4, 50 + i * 4);
    }
  }

  update(_time: number, delta: number): void {
    this.animationTimer += delta;
    
    const pulse = Math.sin(this.animationTimer * 0.003) * 0.3 + 0.7;
    this.neonGlow.setAlpha(pulse);
  }
}
