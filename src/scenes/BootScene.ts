import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.load.on('complete', () => {
      this.scene.start('LoadingScene');
    });
  }

  create(): void {
    this.scene.start('LoadingScene');
  }
}
