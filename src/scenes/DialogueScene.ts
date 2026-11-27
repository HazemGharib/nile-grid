import Phaser from 'phaser';
import { GameConfig, Colors } from '../config/GameConfig';
import { GameState, DialogueEntry } from '../state/GameState';

export class DialogueScene extends Phaser.Scene {
  private gameState!: GameState;
  
  private dialogueBox!: Phaser.GameObjects.Container;
  private bubbleContainer!: Phaser.GameObjects.Container;
  private currentBubble: Phaser.GameObjects.Container | null = null;
  
  private isShowingPortrait = false;
  private dialogueTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super({ key: 'DialogueScene' });
  }

  create(): void {
    this.gameState = GameState.getInstance();
    
    this.bubbleContainer = this.add.container(0, 0);
    this.createDialogueBox();
    
    this.gameState.subscribe(() => this.checkDialogueQueue());
    this.checkDialogueQueue();
  }

  private createDialogueBox(): void {
    const { width, height } = this.scale;
    
    this.dialogueBox = this.add.container(0, height - GameConfig.DIALOGUE_BOX_HEIGHT);
    this.dialogueBox.setVisible(false);
    
    const bg = this.add.rectangle(
      width / 2,
      GameConfig.DIALOGUE_BOX_HEIGHT / 2,
      width - 20,
      GameConfig.DIALOGUE_BOX_HEIGHT - 10,
      0x1a1a2e,
      0.95
    );
    bg.setStrokeStyle(2, Colors.NEON_MAGENTA);
    
    const portraitBg = this.add.rectangle(
      35,
      GameConfig.DIALOGUE_BOX_HEIGHT / 2,
      GameConfig.PORTRAIT_SIZE,
      GameConfig.PORTRAIT_SIZE,
      0x333366,
      1
    );
    portraitBg.setStrokeStyle(1, Colors.NEON_CYAN);
    
    const portrait = this.add.image(
      35,
      GameConfig.DIALOGUE_BOX_HEIGHT / 2,
      'portrait_nour_neutral'
    );
    portrait.setDisplaySize(GameConfig.PORTRAIT_SIZE - 8, GameConfig.PORTRAIT_SIZE - 8);
    portrait.setVisible(false);
    
    const nameText = this.add.text(80, 10, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ff00ff'
    });
    
    const dialogueText = this.add.text(80, 28, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
      wordWrap: { width: width - 120 }
    });
    
    const skipHint = this.add.text(width - 30, GameConfig.DIALOGUE_BOX_HEIGHT - 20, '[SPACE]', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#666666'
    }).setOrigin(1, 0.5);
    
    this.dialogueBox.add([bg, portraitBg, portrait, nameText, dialogueText, skipHint]);
    
    this.dialogueBox.setData('nameText', nameText);
    this.dialogueBox.setData('dialogueText', dialogueText);
    this.dialogueBox.setData('portrait', portrait);
  }

  private checkDialogueQueue(): void {
    if (this.isShowingPortrait) return;
    
    const state = this.gameState.getState();
    if (state.dialogueQueue.length === 0) return;
    
    const entry = state.dialogueQueue[0];
    
    if (entry.isPortraitDialogue) {
      this.showPortraitDialogue(entry);
    } else {
      this.showBubble(entry);
    }
  }

  private showPortraitDialogue(entry: DialogueEntry): void {
    this.isShowingPortrait = true;
    this.gameState.setInDialogue(true);
    this.dialogueBox.setVisible(true);
    
    const nameText = this.dialogueBox.getData('nameText') as Phaser.GameObjects.Text;
    const dialogueText = this.dialogueBox.getData('dialogueText') as Phaser.GameObjects.Text;
    const portrait = this.dialogueBox.getData('portrait') as Phaser.GameObjects.Image;
    
    nameText.setText(entry.speakerName);
    dialogueText.setText(entry.textEn);
    
    const emotion = entry.emotion || 'neutral';
    const portraitKey = `portrait_${entry.speakerId}_${emotion}`;
    
    if (this.textures.exists(portraitKey)) {
      portrait.setTexture(portraitKey);
      portrait.setVisible(true);
    } else {
      portrait.setVisible(false);
    }
    
    this.input.once('pointerdown', () => this.advanceDialogue());
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-SPACE', () => this.advanceDialogue());
    }
    
    this.dialogueTimer = this.time.delayedCall(GameConfig.DIALOGUE_DISPLAY_TIME, () => {
      this.advanceDialogue();
    });
  }

  private advanceDialogue(): void {
    if (this.dialogueTimer) {
      this.dialogueTimer.remove();
      this.dialogueTimer = null;
    }
    
    this.gameState.dequeueDialogue();
    
    const state = this.gameState.getState();
    if (state.dialogueQueue.length === 0) {
      this.dialogueBox.setVisible(false);
      this.isShowingPortrait = false;
      this.gameState.setInDialogue(false);
    } else {
      const nextEntry = state.dialogueQueue[0];
      if (nextEntry.isPortraitDialogue) {
        this.isShowingPortrait = false;
        this.showPortraitDialogue(nextEntry);
      } else {
        this.dialogueBox.setVisible(false);
        this.isShowingPortrait = false;
        this.gameState.setInDialogue(false);
        this.showBubble(nextEntry);
      }
    }
  }

  private showBubble(entry: DialogueEntry): void {
    if (this.currentBubble) {
      this.currentBubble.destroy();
    }
    
    const { width, height } = this.scale;
    
    const bubbleWidth = Math.min(width - 40, entry.textEn.length * 6 + 20);
    const bubbleHeight = 30;
    
    this.currentBubble = this.add.container(width / 2, height / 2 - 60);
    
    const bg = this.add.rectangle(0, 0, bubbleWidth, bubbleHeight, 0x000000, 0.8);
    bg.setStrokeStyle(1, Colors.NEON_CYAN);
    
    const text = this.add.text(0, 0, entry.textEn, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    const speaker = this.add.text(-bubbleWidth / 2 + 5, -bubbleHeight / 2 - 8, entry.speakerName, {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ff00ff'
    });
    
    this.currentBubble.add([bg, text, speaker]);
    this.bubbleContainer.add(this.currentBubble);
    
    this.gameState.dequeueDialogue();
    
    this.time.delayedCall(GameConfig.BUBBLE_DISPLAY_TIME, () => {
      if (this.currentBubble) {
        this.currentBubble.destroy();
        this.currentBubble = null;
      }
      this.checkDialogueQueue();
    });
  }

  update(): void {
    // Dialogue updates happen via state subscription
  }
}
