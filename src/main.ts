import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { LoadingScene } from './scenes/LoadingScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { DialogueScene } from './scenes/DialogueScene';
import { ToBeContinuedScene } from './scenes/ToBeContinuedScene';
import { GameConfig } from './config/GameConfig';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GameConfig.GAME_WIDTH,
  height: GameConfig.GAME_HEIGHT,
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 320,
      height: 240
    },
    max: {
      width: 1920,
      height: 1080
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  input: {
    activePointers: 3
  },
  scene: [
    BootScene,
    LoadingScene,
    MainMenuScene,
    GameScene,
    UIScene,
    DialogueScene,
    ToBeContinuedScene
  ]
};

const game = new Phaser.Game(config);

// Expose for production e2e tests and debugging
declare global {
  interface Window {
    game: Phaser.Game;
  }
}
window.game = game;

export default game;
