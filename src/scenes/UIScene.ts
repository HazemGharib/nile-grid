import Phaser from 'phaser';
import { GameConfig, Colors, CharacterStats } from '../config/GameConfig';
import { GameState } from '../state/GameState';

export class UIScene extends Phaser.Scene {
  private gameState!: GameState;
  
  private missionText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private characterInfo!: Phaser.GameObjects.Container;
  private minimap!: Phaser.GameObjects.Container;
  private healthBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this.gameState = GameState.getInstance();
    
    this.createMissionPanel();
    this.createCharacterInfo();
    this.createMinimap();
    this.createHealthBar();
    
    this.gameState.subscribe(() => this.updateUI());
    this.updateUI();
  }

  private createMissionPanel(): void {
    const { width } = this.scale;
    
    const panel = this.add.rectangle(width / 2, 25, 200, 40, 0x000000, 0.6);
    panel.setStrokeStyle(1, Colors.NEON_MAGENTA, 0.5);
    
    this.missionText = this.add.text(width / 2, 15, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ff00ff'
    }).setOrigin(0.5);
    
    this.objectiveText = this.add.text(width / 2, 32, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#00ffff'
    }).setOrigin(0.5);
  }

  private createCharacterInfo(): void {
    this.characterInfo = this.add.container(10, 10);
    
    const bg = this.add.rectangle(0, 0, 80, 50, 0x000000, 0.6)
      .setOrigin(0)
      .setStrokeStyle(1, Colors.NEON_CYAN, 0.5);
    
    const portrait = this.add.rectangle(5, 5, 40, 40, Colors.NEON_MAGENTA, 0.3)
      .setOrigin(0);
    
    const name = this.add.text(50, 8, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ffffff'
    });
    
    const role = this.add.text(50, 20, '', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#888888'
    });
    
    this.characterInfo.add([bg, portrait, name, role]);
  }

  private createMinimap(): void {
    const { width } = this.scale;
    
    this.minimap = this.add.container(width - GameConfig.MINIMAP_WIDTH - 10, 10);
    
    const bg = this.add.rectangle(0, 0, GameConfig.MINIMAP_WIDTH, GameConfig.MINIMAP_HEIGHT, 0x000000, 0.7)
      .setOrigin(0)
      .setStrokeStyle(1, Colors.NEON_CYAN, 0.5);
    
    const mapGraphics = this.add.graphics();
    mapGraphics.fillStyle(Colors.SAND, 0.3);
    mapGraphics.fillRect(2, 2, GameConfig.MINIMAP_WIDTH - 4, GameConfig.MINIMAP_HEIGHT - 4);
    
    mapGraphics.fillStyle(Colors.WATER, 0.5);
    mapGraphics.fillRect(2, GameConfig.MINIMAP_HEIGHT - 15, GameConfig.MINIMAP_WIDTH - 4, 13);
    
    const playerDot = this.add.circle(
      GameConfig.MINIMAP_WIDTH / 2,
      GameConfig.MINIMAP_HEIGHT / 2,
      3,
      Colors.NEON_MAGENTA
    );
    
    this.minimap.add([bg, mapGraphics, playerDot]);
    this.minimap.setData('playerDot', playerDot);
  }

  private createHealthBar(): void {
    this.healthBar = this.add.graphics();
    this.healthBar.setPosition(10, 65);
  }

  private updateUI(): void {
    const state = this.gameState.getState();
    
    const mission = this.gameState.getCurrentMission();
    if (mission) {
      this.missionText.setText(`Mission ${mission.id}: ${mission.name}`);
      
      const objective = this.gameState.getCurrentObjective();
      if (objective) {
        this.objectiveText.setText(objective.description);
      } else {
        this.objectiveText.setText('Mission Complete!');
      }
    }
    
    const characterId = state.player.characterId;
    const stats = CharacterStats[characterId];
    
    const nameText = this.characterInfo.list[2] as Phaser.GameObjects.Text;
    const roleText = this.characterInfo.list[3] as Phaser.GameObjects.Text;
    
    nameText.setText(stats.name.split(' ')[0]);
    roleText.setText(stats.role.toUpperCase());
    
    const portrait = this.characterInfo.list[1] as Phaser.GameObjects.Rectangle;
    portrait.setFillStyle(stats.color, 0.4);
    
    this.healthBar.clear();
    
    const maxHealth = state.player.maxHealth;
    const currentHealth = state.player.health;
    const barWidth = 70;
    const barHeight = 6;
    
    this.healthBar.fillStyle(0x333333, 1);
    this.healthBar.fillRect(0, 0, barWidth, barHeight);
    
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(1, 1, (barWidth - 2) * (currentHealth / maxHealth), barHeight - 2);
    
    const playerDot = this.minimap.getData('playerDot') as Phaser.GameObjects.Arc;
    if (playerDot) {
      const mapScale = GameConfig.MINIMAP_WIDTH / (1500 * GameConfig.TILE_SIZE);
      const dotX = state.player.position.x * mapScale;
      const dotY = state.player.position.y * mapScale;
      
      playerDot.setPosition(
        Math.min(Math.max(dotX, 3), GameConfig.MINIMAP_WIDTH - 3),
        Math.min(Math.max(dotY, 3), GameConfig.MINIMAP_HEIGHT - 3)
      );
      
      playerDot.setFillStyle(stats.color);
    }
  }

  update(): void {
    // UI updates happen via state subscription
  }
}
