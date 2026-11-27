import Phaser from 'phaser';
import { Colors } from '../config/GameConfig';

export class ToBeContinuedScene extends Phaser.Scene {
  private animationTimer = 0;

  constructor() {
    super({ key: 'ToBeContinuedScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    this.add.rectangle(0, 0, width, height, 0x0a0a1a).setOrigin(0);

    this.drawNeonFrame(width, height);

    const title = this.add.text(centerX, centerY - 60, 'MISSIONS 1-3 COMPLETE', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#00ffff'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY - 30, 'نجحت في المهمات ١-٣', {
      fontFamily: 'serif',
      fontSize: '14px',
      color: '#ff00ff'
    }).setOrigin(0.5);

    const continueText = this.add.text(centerX, centerY + 20, 'TO BE CONTINUED...', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ff00ff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 55, 'يُتبع...', {
      fontFamily: 'serif',
      fontSize: '18px',
      color: '#00ffff'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 90, 'The story continues in future updates', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#888888'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 105, 'Missions 4-6: Mallaha Park → Irshad Building → Canal Mouth', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#666666'
    }).setOrigin(0.5);

    this.drawWaterAnimation(width, height);

    this.createBackButton(centerX, height - 40);

    this.tweens.add({
      targets: continueText,
      alpha: { from: 0.5, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    this.tweens.add({
      targets: title,
      y: centerY - 65,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private drawNeonFrame(width: number, height: number): void {
    const graphics = this.add.graphics();
    
    for (let i = 0; i < 3; i++) {
      const offset = i * 3;
      const alpha = 0.3 - i * 0.1;
      
      graphics.lineStyle(2, Colors.NEON_MAGENTA, alpha);
      graphics.strokeRect(10 + offset, 10 + offset, width - 20 - offset * 2, height - 20 - offset * 2);
      
      graphics.lineStyle(2, Colors.NEON_CYAN, alpha);
      graphics.strokeRect(15 + offset, 15 + offset, width - 30 - offset * 2, height - 30 - offset * 2);
    }
  }

  private drawWaterAnimation(width: number, height: number): void {
    const graphics = this.add.graphics();
    
    graphics.fillStyle(Colors.WATER, 0.3);
    graphics.fillRect(0, height - 50, width, 50);
    
    for (let i = 0; i < 5; i++) {
      const shipX = 50 + i * 100;
      const shipY = height - 35;
      
      graphics.fillStyle(0x444444, 0.5);
      graphics.fillRect(shipX, shipY, 30, 10);
      graphics.fillRect(shipX + 10, shipY - 8, 10, 8);
    }
    
    this.add.text(width / 2, height - 25, '◄ CANAL TRAFFIC RESTORED ►', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#00ffff'
    }).setOrigin(0.5);
  }

  private createBackButton(x: number, y: number): void {
    const button = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 100, 30, 0x222244, 0.8)
      .setStrokeStyle(2, Colors.NEON_CYAN);
    
    const text = this.add.text(0, 0, 'MAIN MENU', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    button.add([bg, text]);
    
    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        bg.setFillStyle(0x333366, 0.9);
        bg.setStrokeStyle(3, Colors.NEON_MAGENTA);
      })
      .on('pointerout', () => {
        bg.setFillStyle(0x222244, 0.8);
        bg.setStrokeStyle(2, Colors.NEON_CYAN);
      })
      .on('pointerdown', () => {
        this.scene.start('MainMenuScene');
      });
  }

  update(_time: number, delta: number): void {
    this.animationTimer += delta;
  }
}
