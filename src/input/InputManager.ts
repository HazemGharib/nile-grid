import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export interface InputState {
  moveX: number;
  moveY: number;
  action: boolean;
  sprint: boolean;
  switchCharacter: boolean;
  pause: boolean;
  interact: boolean;
}

export class InputManager {
  private scene: Phaser.Scene;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private actionKey?: Phaser.Input.Keyboard.Key;
  private sprintKey?: Phaser.Input.Keyboard.Key;
  private switchKey?: Phaser.Input.Keyboard.Key;
  private interactKey?: Phaser.Input.Keyboard.Key;
  private pauseKey?: Phaser.Input.Keyboard.Key;
  
  private joystickBase?: Phaser.GameObjects.Arc;
  private joystickThumb?: Phaser.GameObjects.Arc;
  private actionButton?: Phaser.GameObjects.Arc;
  private switchButton?: Phaser.GameObjects.Arc;
  
  private joystickPointer?: Phaser.Input.Pointer;
  private joystickCenter: { x: number; y: number } = { x: 0, y: 0 };
  private joystickActive = false;
  
  private touchInput: InputState = {
    moveX: 0,
    moveY: 0,
    action: false,
    sprint: false,
    switchCharacter: false,
    pause: false,
    interact: false
  };
  
  private isMobile: boolean;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.isMobile = this.detectMobile();
    this.setupKeyboard();
    if (this.isMobile) {
      this.setupTouchControls();
    }
  }
  
  private detectMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
  }
  
  private setupKeyboard(): void {
    if (!this.scene.input.keyboard) return;
    
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    this.actionKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.sprintKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.switchKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.interactKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.pauseKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }
  
  private setupTouchControls(): void {
    const { width, height } = this.scene.scale;
    const joystickX = GameConfig.JOYSTICK_RADIUS + 20;
    const joystickY = height - GameConfig.JOYSTICK_RADIUS - 20;
    
    this.joystickBase = this.scene.add.circle(joystickX, joystickY, GameConfig.JOYSTICK_RADIUS, 0x333366, 0.5)
      .setScrollFactor(0)
      .setDepth(1000);
    
    this.joystickThumb = this.scene.add.circle(joystickX, joystickY, GameConfig.JOYSTICK_RADIUS * 0.5, 0x6666aa, 0.7)
      .setScrollFactor(0)
      .setDepth(1001);
    
    const buttonX = width - 50;
    const buttonY = height - 50;
    
    this.actionButton = this.scene.add.circle(buttonX, buttonY, 30, 0xff00ff, 0.6)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive();
    
    this.switchButton = this.scene.add.circle(buttonX - 70, buttonY, 25, 0x00ffff, 0.6)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive();
    
    this.scene.add.text(buttonX, buttonY, 'A', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
    
    this.scene.add.text(buttonX - 70, buttonY, '⇄', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
    
    this.setupTouchEvents();
  }
  
  private setupTouchEvents(): void {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const { width } = this.scene.scale;
      
      if (pointer.x < width / 2) {
        this.joystickPointer = pointer;
        this.joystickActive = true;
        this.joystickCenter = { x: pointer.x, y: pointer.y };
        if (this.joystickBase) {
          this.joystickBase.setPosition(pointer.x, pointer.y);
        }
        if (this.joystickThumb) {
          this.joystickThumb.setPosition(pointer.x, pointer.y);
        }
      }
      
      if (this.actionButton && this.isPointerOnButton(pointer, this.actionButton)) {
        this.touchInput.action = true;
        this.touchInput.interact = true;
      }
      
      if (this.switchButton && this.isPointerOnButton(pointer, this.switchButton)) {
        this.touchInput.switchCharacter = true;
      }
    });
    
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.joystickActive && this.joystickPointer && pointer.id === this.joystickPointer.id) {
        this.updateJoystick(pointer);
      }
    });
    
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.joystickPointer && pointer.id === this.joystickPointer.id) {
        this.joystickActive = false;
        this.joystickPointer = undefined;
        this.touchInput.moveX = 0;
        this.touchInput.moveY = 0;
        if (this.joystickThumb && this.joystickBase) {
          this.joystickThumb.setPosition(this.joystickBase.x, this.joystickBase.y);
        }
      }
      
      this.touchInput.action = false;
      this.touchInput.interact = false;
      this.touchInput.switchCharacter = false;
    });
  }
  
  private updateJoystick(pointer: Phaser.Input.Pointer): void {
    const dx = pointer.x - this.joystickCenter.x;
    const dy = pointer.y - this.joystickCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const maxDistance = GameConfig.JOYSTICK_RADIUS;
    const clampedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(dy, dx);
    
    const thumbX = this.joystickCenter.x + Math.cos(angle) * clampedDistance;
    const thumbY = this.joystickCenter.y + Math.sin(angle) * clampedDistance;
    
    if (this.joystickThumb) {
      this.joystickThumb.setPosition(thumbX, thumbY);
    }
    
    if (distance > GameConfig.JOYSTICK_THRESHOLD) {
      this.touchInput.moveX = Math.cos(angle);
      this.touchInput.moveY = Math.sin(angle);
      
      if (distance > maxDistance * 0.8) {
        this.touchInput.sprint = true;
      } else {
        this.touchInput.sprint = false;
      }
    } else {
      this.touchInput.moveX = 0;
      this.touchInput.moveY = 0;
      this.touchInput.sprint = false;
    }
  }
  
  private isPointerOnButton(pointer: Phaser.Input.Pointer, button: Phaser.GameObjects.Arc): boolean {
    const dx = pointer.x - button.x;
    const dy = pointer.y - button.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= button.radius;
  }
  
  getInput(): InputState {
    if (this.isMobile) {
      return { ...this.touchInput };
    }
    
    let moveX = 0;
    let moveY = 0;
    
    if (this.cursors) {
      if (this.cursors.left.isDown) moveX -= 1;
      if (this.cursors.right.isDown) moveX += 1;
      if (this.cursors.up.isDown) moveY -= 1;
      if (this.cursors.down.isDown) moveY += 1;
    }
    
    if (this.wasd) {
      if (this.wasd.A.isDown) moveX -= 1;
      if (this.wasd.D.isDown) moveX += 1;
      if (this.wasd.W.isDown) moveY -= 1;
      if (this.wasd.S.isDown) moveY += 1;
    }
    
    if (moveX !== 0 && moveY !== 0) {
      const normalize = 1 / Math.sqrt(2);
      moveX *= normalize;
      moveY *= normalize;
    }
    
    return {
      moveX,
      moveY,
      action: this.actionKey?.isDown ?? false,
      sprint: this.sprintKey?.isDown ?? false,
      switchCharacter: Phaser.Input.Keyboard.JustDown(this.switchKey!),
      pause: Phaser.Input.Keyboard.JustDown(this.pauseKey!),
      interact: Phaser.Input.Keyboard.JustDown(this.interactKey!)
    };
  }
  
  showTouchControls(): void {
    if (!this.isMobile) return;
    this.joystickBase?.setVisible(true);
    this.joystickThumb?.setVisible(true);
    this.actionButton?.setVisible(true);
    this.switchButton?.setVisible(true);
  }
  
  hideTouchControls(): void {
    this.joystickBase?.setVisible(false);
    this.joystickThumb?.setVisible(false);
    this.actionButton?.setVisible(false);
    this.switchButton?.setVisible(false);
  }
  
  destroy(): void {
    this.joystickBase?.destroy();
    this.joystickThumb?.destroy();
    this.actionButton?.destroy();
    this.switchButton?.destroy();
  }
}
