import Phaser from 'phaser';
import { GameConfig, Colors, CharacterStats, CharacterId } from '../config/GameConfig';
import { GameState, Position } from '../state/GameState';
import { InputManager } from '../input/InputManager';
import { ismailiaLandmarks, getLandmarkById } from '../map/LandmarkData';
import { getPatrolsForMission, createPatrolEnemy, getPatrolPosition, isPlayerDetected } from '../entities/PatrolSchedule';
import { getDialogueForTrigger } from '../dialogue/DialogueData';

interface MapChunk {
  x: number;
  y: number;
  container: Phaser.GameObjects.Container;
  loaded: boolean;
}

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private inputManager!: InputManager;
  private gameState!: GameState;
  
  private chunks: Map<string, MapChunk> = new Map();
  private enemies: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private landmarks: Map<string, Phaser.GameObjects.Container> = new Map();
  private objectives: Map<string, Phaser.GameObjects.Arc> = new Map();
  
  private mapContainer!: Phaser.GameObjects.Container;
  private playerContainer!: Phaser.GameObjects.Container;
  
  private interactableTarget: string | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.gameState = GameState.getInstance();
    
    this.setupMap();
    this.setupPlayer();
    this.setupCamera();
    this.setupEnemies();
    this.setupObjectives();
    this.setupLandmarks();
    
    this.inputManager = new InputManager(this);
    
    this.scene.launch('UIScene');
    this.scene.launch('DialogueScene');
    
    this.triggerMissionStart();
  }

  private setupMap(): void {
    this.mapContainer = this.add.container(0, 0);
    
    const mapWidth = 1500 * GameConfig.TILE_SIZE;
    const mapHeight = 800 * GameConfig.TILE_SIZE;
    
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    
    this.generateMapChunks();
  }

  private generateMapChunks(): void {
    const chunkTiles = GameConfig.CHUNK_SIZE;
    const chunkPx = chunkTiles * GameConfig.TILE_SIZE;
    const mapWidthChunks = Math.ceil(1500 / chunkTiles);
    const mapHeightChunks = Math.ceil(800 / chunkTiles);
    
    for (let cy = 0; cy < Math.min(mapHeightChunks, 10); cy++) {
      for (let cx = 0; cx < Math.min(mapWidthChunks, 20); cx++) {
        const key = `${cx}_${cy}`;
        const container = this.add.container(cx * chunkPx, cy * chunkPx);
        
        this.generateChunkContent(container, cx, cy, chunkPx);
        
        this.chunks.set(key, {
          x: cx,
          y: cy,
          container,
          loaded: true
        });
        
        this.mapContainer.add(container);
      }
    }
  }

  private generateChunkContent(container: Phaser.GameObjects.Container, chunkX: number, chunkY: number, size: number): void {
    const graphics = this.add.graphics();
    
    const baseSeed = chunkX * 1000 + chunkY;
    const random = (offset: number) => {
      const x = Math.sin(baseSeed + offset) * 10000;
      return x - Math.floor(x);
    };
    
    graphics.fillStyle(Colors.SAND, 1);
    graphics.fillRect(0, 0, size, size);
    
    for (let i = 0; i < 5; i++) {
      const roadX = random(i * 10) * size;
      const roadWidth = 16 + random(i * 10 + 1) * 16;
      graphics.fillStyle(Colors.ROAD, 1);
      graphics.fillRect(roadX, 0, roadWidth, size);
    }
    
    for (let i = 0; i < 3; i++) {
      const roadY = random(i * 20 + 100) * size;
      const roadWidth = 16 + random(i * 20 + 101) * 16;
      graphics.fillStyle(Colors.ROAD, 1);
      graphics.fillRect(0, roadY, size, roadWidth);
    }
    
    for (let i = 0; i < 8; i++) {
      const bx = random(i * 30 + 200) * (size - 64);
      const by = random(i * 30 + 201) * (size - 64);
      const bw = 32 + random(i * 30 + 202) * 48;
      const bh = 32 + random(i * 30 + 203) * 48;
      
      graphics.fillStyle(Colors.BUILDING, 1);
      graphics.fillRect(bx, by, bw, bh);
      
      graphics.lineStyle(1, Colors.NEON_CYAN, 0.3);
      graphics.strokeRect(bx, by, bw, bh);
    }
    
    if (chunkY > 15 || (chunkX > 10 && chunkY > 10)) {
      graphics.fillStyle(Colors.WATER, 0.8);
      graphics.fillRect(0, size * 0.7, size, size * 0.3);
    }
    
    container.add(graphics);
  }

  private setupPlayer(): void {
    const startLandmark = getLandmarkById('railway_station');
    const startX = startLandmark ? startLandmark.pixelPosition.x + 800 : 400;
    const startY = startLandmark ? startLandmark.pixelPosition.y + 600 : 300;
    
    this.playerContainer = this.add.container(startX, startY);
    
    const characterId = this.gameState.getState().player.characterId;
    this.player = this.add.sprite(0, 0, `character_${characterId}`);
    this.player.setOrigin(0.5, 1);
    
    this.playerContainer.add(this.player);
    
    const nameTag = this.add.text(0, -40, CharacterStats[characterId].name, {
      fontSize: '8px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 2, y: 1 }
    }).setOrigin(0.5);
    this.playerContainer.add(nameTag);
    
    this.physics.world.enable(this.playerContainer);
    const body = this.playerContainer.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(16, 16);
    body.setOffset(-8, -16);
    
    this.gameState.updatePlayerPosition({ x: startX, y: startY });
  }

  private setupCamera(): void {
    this.cameras.main.startFollow(this.playerContainer, true, GameConfig.CAMERA_LERP, GameConfig.CAMERA_LERP);
    this.cameras.main.setZoom(2);
    this.cameras.main.setBounds(0, 0, 1500 * GameConfig.TILE_SIZE, 800 * GameConfig.TILE_SIZE);
  }

  private setupEnemies(): void {
    const currentMission = this.gameState.getState().currentMission;
    const patrols = getPatrolsForMission(currentMission);
    
    patrols.forEach((route, index) => {
      const enemyState = createPatrolEnemy(`enemy_${currentMission}_${index}`, route);
      this.gameState.addEnemy(enemyState);
      
      const enemySprite = this.add.sprite(
        enemyState.position.x,
        enemyState.position.y,
        'character_enemy'
      ).setOrigin(0.5, 1);
      
      this.enemies.set(enemyState.id, enemySprite);
      
      const detectionCircle = this.add.circle(
        enemyState.position.x,
        enemyState.position.y,
        enemyState.detectionRadius,
        Colors.HORUS_RED,
        0.1
      );
      detectionCircle.setStrokeStyle(1, Colors.HORUS_RED, 0.3);
      
      this.mapContainer.add([detectionCircle, enemySprite]);
    });
  }

  private setupObjectives(): void {
    const mission = this.gameState.getCurrentMission();
    if (!mission) return;
    
    mission.objectives.forEach((objective, index) => {
      let targetPos: Position;
      
      switch (objective.id) {
        case 'm1_reach_station':
          targetPos = { x: 450, y: 350 };
          break;
        case 'm1_blind_cameras':
          targetPos = { x: 500, y: 300 };
          break;
        case 'm1_cross_checkpoint':
          targetPos = { x: 600, y: 400 };
          break;
        case 'm2_reach_gumhuriya':
          targetPos = { x: 700, y: 350 };
          break;
        case 'm2_copy_patrol_mesh':
          targetPos = { x: 750, y: 320 };
          break;
        case 'm2_cross_quarter':
          targetPos = { x: 850, y: 380 };
          break;
        case 'm3_retrieve_key':
          targetPos = { x: 900, y: 400 };
          break;
        case 'm3_decrypt_token':
          targetPos = { x: 950, y: 350 };
          break;
        case 'm3_repair_bridge':
          targetPos = { x: 1000, y: 420 };
          break;
        case 'm3_cross_canal':
          targetPos = { x: 1100, y: 400 };
          break;
        default:
          targetPos = { x: 400 + index * 100, y: 300 };
      }
      
      objective.targetPosition = targetPos;
      
      const marker = this.add.circle(
        targetPos.x,
        targetPos.y,
        objective.targetRadius,
        objective.isActive ? Colors.NEON_CYAN : 0x444444,
        0.2
      );
      marker.setStrokeStyle(2, objective.isActive ? Colors.NEON_CYAN : 0x444444, 0.5);
      
      this.objectives.set(objective.id, marker);
      this.mapContainer.add(marker);
    });
  }

  private setupLandmarks(): void {
    const relevantLandmarks = ismailiaLandmarks.filter(l => 
      l.missionRelevance?.includes(this.gameState.getState().currentMission)
    );
    
    relevantLandmarks.forEach(landmark => {
      const container = this.add.container(landmark.pixelPosition.x + 800, landmark.pixelPosition.y + 600);
      
      const building = this.add.rectangle(0, 0, 48, 48, Colors.BUILDING);
      building.setStrokeStyle(2, Colors.NEON_MAGENTA);
      
      const label = this.add.text(0, -35, landmark.nameEn, {
        fontSize: '8px',
        color: '#ffffff',
        backgroundColor: '#000000cc',
        padding: { x: 2, y: 1 }
      }).setOrigin(0.5);
      
      container.add([building, label]);
      this.landmarks.set(landmark.id, container);
      this.mapContainer.add(container);
    });
  }

  private triggerMissionStart(): void {
    const mission = this.gameState.getCurrentMission();
    if (!mission) return;
    
    const dialogueSeq = getDialogueForTrigger(`mission${mission.id}_start`);
    if (dialogueSeq) {
      dialogueSeq.entries.forEach(entry => {
        this.gameState.queueDialogue(entry);
      });
    }
  }

  update(time: number, delta: number): void {
    this.gameState.tick(delta);
    
    const input = this.inputManager.getInput();
    this.handlePlayerMovement(input);
    this.handlePlayerActions(input);
    
    this.updateEnemies(time);
    this.checkObjectives();
    this.checkDetection();
    this.updateChunkLoading();
  }

  private handlePlayerMovement(input: { moveX: number; moveY: number; sprint: boolean }): void {
    const state = this.gameState.getState();
    if (state.player.inDialogue) return;
    
    const stats = CharacterStats[state.player.characterId];
    let speed = GameConfig.PLAYER_SPEED * (stats.speed / 3);
    
    if (input.sprint) {
      speed *= GameConfig.SPRINT_MULTIPLIER;
      this.gameState.setPlayerSprinting(true);
    } else {
      this.gameState.setPlayerSprinting(false);
    }
    
    const body = this.playerContainer.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(input.moveX * speed, input.moveY * speed);
    
    if (input.moveX !== 0 || input.moveY !== 0) {
      this.gameState.updatePlayerVelocity({ x: input.moveX, y: input.moveY });
      
      if (Math.abs(input.moveX) > Math.abs(input.moveY)) {
        this.gameState.setPlayerFacing(input.moveX > 0 ? 'right' : 'left');
      } else {
        this.gameState.setPlayerFacing(input.moveY > 0 ? 'down' : 'up');
      }
      
      this.player.play(`${state.player.characterId}_walk`, true);
    } else {
      this.player.play(`${state.player.characterId}_idle`, true);
    }
    
    this.gameState.updatePlayerPosition({ 
      x: this.playerContainer.x, 
      y: this.playerContainer.y 
    });
  }

  private handlePlayerActions(input: { action: boolean; interact: boolean; switchCharacter: boolean }): void {
    if (input.switchCharacter) {
      this.cycleCharacter();
    }
    
    if (input.interact && this.interactableTarget) {
      this.interact(this.interactableTarget);
    }
  }

  private cycleCharacter(): void {
    const characters: CharacterId[] = ['nour', 'adel', 'laila'];
    const currentIndex = characters.indexOf(this.gameState.getState().player.characterId);
    const nextIndex = (currentIndex + 1) % characters.length;
    const nextCharacter = characters[nextIndex];
    
    this.gameState.switchCharacter(nextCharacter);
    this.player.setTexture(`character_${nextCharacter}`);
    
    const nameTag = this.playerContainer.list[1] as Phaser.GameObjects.Text;
    if (nameTag) {
      nameTag.setText(CharacterStats[nextCharacter].name);
    }
  }

  private interact(targetId: string): void {
    const objective = this.gameState.getCurrentObjective();
    if (objective && objective.id === targetId) {
      const requiredChar = objective.requiredCharacter;
      const currentChar = this.gameState.getState().player.characterId;
      
      if (!requiredChar || requiredChar === currentChar) {
        this.completeObjective(objective.id);
      } else {
        const dialogueSeq = getDialogueForTrigger('wrong_character');
        if (dialogueSeq) {
          dialogueSeq.entries.forEach(entry => {
            this.gameState.queueDialogue(entry);
          });
        }
      }
    }
  }

  private completeObjective(objectiveId: string): void {
    this.gameState.completeObjective(objectiveId);
    
    const marker = this.objectives.get(objectiveId);
    if (marker) {
      marker.setFillStyle(Colors.NEON_GOLD, 0.3);
      marker.setStrokeStyle(2, Colors.NEON_GOLD);
    }
    
    const nextObjective = this.gameState.getCurrentObjective();
    if (nextObjective) {
      const nextMarker = this.objectives.get(nextObjective.id);
      if (nextMarker) {
        nextMarker.setFillStyle(Colors.NEON_CYAN, 0.2);
        nextMarker.setStrokeStyle(2, Colors.NEON_CYAN);
      }
    }
    
    const mission = this.gameState.getCurrentMission();
    if (mission?.isCompleted) {
      this.onMissionComplete(mission.id);
    }
  }

  private onMissionComplete(missionId: number): void {
    if (missionId === 3) {
      this.time.delayedCall(2000, () => {
        this.scene.stop('UIScene');
        this.scene.stop('DialogueScene');
        this.scene.start('ToBeContinuedScene');
      });
    } else {
      this.setupObjectives();
      this.triggerMissionStart();
    }
  }

  private updateEnemies(_time: number): void {
    const state = this.gameState.getState();
    const currentMission = state.currentMission;
    const patrols = getPatrolsForMission(currentMission);
    
    patrols.forEach((route, index) => {
      const enemyId = `enemy_${currentMission}_${index}`;
      const enemySprite = this.enemies.get(enemyId);
      
      if (enemySprite) {
        const { position } = getPatrolPosition(route, state.gameTime);
        enemySprite.setPosition(position.x, position.y);
        
        this.gameState.updateEnemy(enemyId, { position });
      }
    });
  }

  private checkObjectives(): void {
    const objective = this.gameState.getCurrentObjective();
    if (!objective) return;
    
    const playerPos = this.gameState.getState().player.position;
    const dx = playerPos.x - objective.targetPosition.x;
    const dy = playerPos.y - objective.targetPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < objective.targetRadius) {
      this.interactableTarget = objective.id;
      
      if (objective.type === 'reach') {
        this.completeObjective(objective.id);
      }
    } else {
      this.interactableTarget = null;
    }
  }

  private checkDetection(): void {
    const state = this.gameState.getState();
    const playerPos = state.player.position;
    const stats = CharacterStats[state.player.characterId];
    
    for (const enemy of state.enemies) {
      if (isPlayerDetected(playerPos, enemy.position, enemy.detectionRadius, stats.stealth)) {
        if (!state.player.isSprinting) {
          this.gameState.updateEnemy(enemy.id, { alertLevel: 'suspicious' });
        } else {
          this.gameState.updateEnemy(enemy.id, { alertLevel: 'alert' });
        }
      } else {
        this.gameState.updateEnemy(enemy.id, { alertLevel: 'idle' });
      }
    }
  }

  private updateChunkLoading(): void {
    // Chunk loading/unloading based on camera position
    // For now, all visible chunks are pre-loaded
  }

  shutdown(): void {
    this.inputManager?.destroy();
    this.chunks.clear();
    this.enemies.clear();
    this.landmarks.clear();
    this.objectives.clear();
  }
}
