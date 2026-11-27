import Phaser from 'phaser';
import { Colors } from '../config/GameConfig';
import { GameState } from '../state/GameState';

export class MainMenuScene extends Phaser.Scene {
  private animationTimer = 0;
  private titleText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    this.drawCityBackground(width, height);

    this.titleText = this.add.text(centerX, centerY - 60, 'NILE GRID', {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: '#ff00ff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(centerX, centerY - 20, 'نيل جريد', {
      fontFamily: 'serif',
      fontSize: '24px',
      color: '#00ffff'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 10, 'Egypt, 2077', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);

    this.startButton = this.createButton(centerX, centerY + 60, 'START', () => {
      GameState.getInstance().reset();
      this.scene.start('GameScene');
    });

    this.add.text(centerX, height - 30, 'Touch to play • Swipe to move • Tap action buttons', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#666666'
    }).setOrigin(0.5);

    this.add.text(centerX, height - 15, 'Keyboard: Arrow keys / WASD • Space to interact • Tab to switch', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#666666'
    }).setOrigin(0.5);

    this.pingServer();
  }

  private drawCityBackground(width: number, height: number): void {
    const graphics = this.add.graphics();
    
    graphics.fillStyle(0x111122, 1);
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * width;
      const buildingWidth = 20 + Math.random() * 40;
      const buildingHeight = 40 + Math.random() * 100;
      const y = height - buildingHeight;
      
      graphics.fillRect(x, y, buildingWidth, buildingHeight);
      
      graphics.fillStyle(Colors.NEON_CYAN, 0.3);
      for (let wy = y + 10; wy < height - 10; wy += 15) {
        for (let wx = x + 5; wx < x + buildingWidth - 5; wx += 10) {
          if (Math.random() > 0.5) {
            graphics.fillRect(wx, wy, 4, 6);
          }
        }
      }
      graphics.fillStyle(0x111122, 1);
    }

    graphics.fillStyle(Colors.WATER, 0.4);
    graphics.fillRect(0, height - 20, width, 20);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 120, 40, 0x333366, 0.8)
      .setStrokeStyle(2, Colors.NEON_MAGENTA);
    
    const label = this.add.text(0, 0, text, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    container.add([bg, label]);
    
    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        bg.setFillStyle(0x444488, 0.9);
        bg.setStrokeStyle(3, Colors.NEON_CYAN);
      })
      .on('pointerout', () => {
        bg.setFillStyle(0x333366, 0.8);
        bg.setStrokeStyle(2, Colors.NEON_MAGENTA);
      })
      .on('pointerdown', callback);
    
    return container;
  }

  private pingServer(): void {
    // Stubbed server wake hook for future Colyseus integration
    // In production, this would ping the game server to wake it from sleep
  }

  update(_time: number, delta: number): void {
    this.animationTimer += delta;
    
    const pulse = Math.sin(this.animationTimer * 0.002) * 0.2 + 0.8;
    this.titleText.setAlpha(pulse);
    
    const scale = Math.sin(this.animationTimer * 0.001) * 0.02 + 1;
    this.startButton.setScale(scale);
  }
}
