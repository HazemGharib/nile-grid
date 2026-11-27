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

type TileType = 'water' | 'water_highlight' | 'sand' | 'road' | 'road_curb_top' | 'road_curb_bottom' |
  'grass' | 'quay' | 'quay_edge' | 'building_roof' | 'building_wall' | 'building_wall_dark' |
  'palm' | 'neon_magenta' | 'neon_cyan' | 'lamp' | 'railway' | 'bridge' | 'boat';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private drone!: Phaser.GameObjects.Sprite;
  private inputManager!: InputManager;
  private gameState!: GameState;
  
  private chunks: Map<string, MapChunk> = new Map();
  private enemies: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private landmarks: Map<string, Phaser.GameObjects.Container> = new Map();
  private objectives: Map<string, Phaser.GameObjects.Arc> = new Map();
  
  private mapContainer!: Phaser.GameObjects.Container;
  private playerContainer!: Phaser.GameObjects.Container;
  
  private interactableTarget: string | null = null;
  private lastDirection: string = 'down';

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.gameState = GameState.getInstance();
    
    // Enable pixel-perfect rendering
    this.cameras.main.setRoundPixels(true);
    
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
        
        this.generateNileNeonChunk(container, cx, cy, chunkPx);
        
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

  private generateNileNeonChunk(container: Phaser.GameObjects.Container, chunkX: number, chunkY: number, size: number): void {
    const tileSize = GameConfig.TILE_SIZE;
    const tilesPerChunk = size / tileSize;
    
    // Deterministic random based on chunk position
    const baseSeed = chunkX * 1000 + chunkY;
    const random = (offset: number) => {
      const x = Math.sin(baseSeed + offset) * 10000;
      return x - Math.floor(x);
    };

    // Create tile grid - night-time Ismailia style
    const tileGrid: TileType[][] = [];
    for (let ty = 0; ty < tilesPerChunk; ty++) {
      tileGrid[ty] = [];
      for (let tx = 0; tx < tilesPerChunk; tx++) {
        // Base terrain: sand in most areas
        tileGrid[ty][tx] = 'sand';
      }
    }

    // Water zones (canal and lake areas based on chunk position)
    const isLakeArea = chunkY > 12 || (chunkX > 12 && chunkY > 8);
    const isCanalArea = (chunkX > 5 && chunkX < 15 && chunkY > 10);
    
    if (isLakeArea || isCanalArea) {
      const waterStartRow = isCanalArea ? Math.floor(tilesPerChunk * 0.6) : Math.floor(tilesPerChunk * 0.4);
      for (let ty = waterStartRow; ty < tilesPerChunk; ty++) {
        for (let tx = 0; tx < tilesPerChunk; tx++) {
          // Quay edge at transition
          if (ty === waterStartRow) {
            tileGrid[ty][tx] = 'quay_edge';
          } else if (ty === waterStartRow + 1) {
            tileGrid[ty][tx] = 'quay';
          } else {
            // Water with occasional highlights (lamp reflections)
            if (random(tx + ty * 100) < 0.1) {
              tileGrid[ty][tx] = 'water_highlight';
            } else {
              tileGrid[ty][tx] = 'water';
            }
          }
        }
      }
      
      // Add bridge crossing
      if (chunkX === 10 || chunkX === 8) {
        const bridgeCol = Math.floor(tilesPerChunk * 0.5);
        for (let ty = waterStartRow; ty < tilesPerChunk; ty++) {
          for (let bw = 0; bw < 3; bw++) {
            if (bridgeCol + bw < tilesPerChunk) {
              tileGrid[ty][bridgeCol + bw] = 'bridge';
            }
          }
        }
      }
      
      // Add boats
      if (random(500) < 0.3 && chunkY > 13) {
        const boatX = Math.floor(random(501) * (tilesPerChunk - 2)) + 1;
        const boatY = waterStartRow + 3 + Math.floor(random(502) * 3);
        if (boatY < tilesPerChunk) {
          tileGrid[boatY][boatX] = 'boat';
        }
      }
    }

    // Roads - main arteries
    const hasMainRoad = chunkX % 3 === 0 || chunkY % 4 === 0;
    if (hasMainRoad) {
      // Vertical road
      if (chunkX % 3 === 0) {
        const roadCol = Math.floor(tilesPerChunk * 0.4);
        for (let ty = 0; ty < tilesPerChunk; ty++) {
          if (tileGrid[ty][roadCol] === 'sand') {
            tileGrid[ty][roadCol] = 'road_curb_top';
            if (roadCol + 1 < tilesPerChunk && tileGrid[ty][roadCol + 1] === 'sand') {
              tileGrid[ty][roadCol + 1] = 'road';
            }
            if (roadCol + 2 < tilesPerChunk && tileGrid[ty][roadCol + 2] === 'sand') {
              tileGrid[ty][roadCol + 2] = 'road_curb_bottom';
            }
          }
        }
      }
      // Horizontal road
      if (chunkY % 4 === 0) {
        const roadRow = Math.floor(tilesPerChunk * 0.3);
        for (let tx = 0; tx < tilesPerChunk; tx++) {
          if (tileGrid[roadRow][tx] === 'sand') {
            tileGrid[roadRow][tx] = 'road_curb_top';
          }
          if (roadRow + 1 < tilesPerChunk && tileGrid[roadRow + 1][tx] === 'sand') {
            tileGrid[roadRow + 1][tx] = 'road';
          }
          if (roadRow + 2 < tilesPerChunk && tileGrid[roadRow + 2][tx] === 'sand') {
            tileGrid[roadRow + 2][tx] = 'road_curb_bottom';
          }
        }
      }
    }

    // Railway (top of map)
    if (chunkY === 0 || chunkY === 1) {
      const railRow = chunkY === 0 ? tilesPerChunk - 2 : 2;
      for (let tx = 0; tx < tilesPerChunk; tx++) {
        tileGrid[railRow][tx] = 'railway';
      }
    }

    // Buildings - colonial style with roofs and walls
    const numBuildings = 3 + Math.floor(random(300) * 4);
    for (let i = 0; i < numBuildings; i++) {
      const bxTile = Math.floor(random(i * 30 + 200) * (tilesPerChunk - 6)) + 1;
      const byTile = Math.floor(random(i * 30 + 201) * (tilesPerChunk - 6)) + 1;
      const bwTiles = 3 + Math.floor(random(i * 30 + 202) * 3);
      const bhTiles = 3 + Math.floor(random(i * 30 + 203) * 3);
      
      // Check if area is clear (not water/road)
      let canPlace = true;
      for (let dy = 0; dy < bhTiles && canPlace; dy++) {
        for (let dx = 0; dx < bwTiles && canPlace; dx++) {
          const ty = byTile + dy;
          const tx = bxTile + dx;
          if (ty >= tilesPerChunk || tx >= tilesPerChunk) canPlace = false;
          else if (tileGrid[ty][tx] !== 'sand') canPlace = false;
        }
      }
      
      if (canPlace) {
        for (let dy = 0; dy < bhTiles; dy++) {
          for (let dx = 0; dx < bwTiles; dx++) {
            const ty = byTile + dy;
            const tx = bxTile + dx;
            
            // Top row: roof
            if (dy === 0) {
              tileGrid[ty][tx] = 'building_roof';
            } 
            // Front wall with windows/neon
            else if (dy === bhTiles - 1) {
              // Add neon signs occasionally
              if (dx === Math.floor(bwTiles / 2) && random(i * 100 + dx) < 0.3) {
                tileGrid[ty][tx] = random(i * 101) < 0.5 ? 'neon_magenta' : 'neon_cyan';
              } else {
                tileGrid[ty][tx] = 'building_wall';
              }
            }
            // Side walls
            else if (dx === 0 || dx === bwTiles - 1) {
              tileGrid[ty][tx] = 'building_wall_dark';
            }
            // Interior roof
            else {
              tileGrid[ty][tx] = 'building_roof';
            }
          }
        }
      }
    }

    // Palm trees and grass patches
    for (let i = 0; i < 5; i++) {
      const px = Math.floor(random(i * 50 + 400) * tilesPerChunk);
      const py = Math.floor(random(i * 50 + 401) * tilesPerChunk);
      if (px < tilesPerChunk && py < tilesPerChunk && tileGrid[py][px] === 'sand') {
        tileGrid[py][px] = 'palm';
        // Grass around palm
        for (let gx = -1; gx <= 1; gx++) {
          for (let gy = -1; gy <= 1; gy++) {
            const gpx = px + gx;
            const gpy = py + gy;
            if (gpx >= 0 && gpx < tilesPerChunk && gpy >= 0 && gpy < tilesPerChunk) {
              if (tileGrid[gpy][gpx] === 'sand') {
                tileGrid[gpy][gpx] = 'grass';
              }
            }
          }
        }
      }
    }

    // Street lamps along roads
    for (let tx = 0; tx < tilesPerChunk; tx++) {
      for (let ty = 0; ty < tilesPerChunk; ty++) {
        if (tileGrid[ty][tx] === 'road' || tileGrid[ty][tx] === 'road_curb_top') {
          // Place lamp every 8 tiles
          if (tx % 8 === 0 && ty > 0 && tileGrid[ty - 1][tx] === 'sand') {
            tileGrid[ty - 1][tx] = 'lamp';
          }
        }
      }
    }

    // Render tiles
    for (let ty = 0; ty < tilesPerChunk; ty++) {
      for (let tx = 0; tx < tilesPerChunk; tx++) {
        const tileKey = `tile_${tileGrid[ty][tx]}`;
        const tile = this.add.image(tx * tileSize, ty * tileSize, tileKey);
        tile.setOrigin(0, 0);
        container.add(tile);
      }
    }
  }

  private setupPlayer(): void {
    const startLandmark = getLandmarkById('railway_station');
    const startX = startLandmark ? startLandmark.pixelPosition.x + 800 : 400;
    const startY = startLandmark ? startLandmark.pixelPosition.y + 600 : 300;
    
    this.playerContainer = this.add.container(startX, startY);
    
    const characterId = this.gameState.getState().player.characterId;
    this.player = this.add.sprite(0, 0, characterId);
    this.player.setOrigin(0.5, 1);
    this.player.play(`${characterId}_idle_down`);
    
    this.playerContainer.add(this.player);
    
    // Add drone for Adel
    this.drone = this.add.sprite(12, -20, 'bulbul');
    this.drone.setOrigin(0.5, 0.5);
    this.drone.play('bulbul_hover');
    this.drone.setVisible(characterId === 'adel');
    this.playerContainer.add(this.drone);
    
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
    const cam = this.cameras.main;
    
    // Pixel-perfect camera settings
    cam.setRoundPixels(true);
    cam.setZoom(3);  // Integer zoom for pixel-perfect rendering
    
    cam.startFollow(this.playerContainer, true, 0.1, 0.1);
    cam.setBounds(0, 0, 1500 * GameConfig.TILE_SIZE, 800 * GameConfig.TILE_SIZE);
    
    // Deadzone to reduce camera movement jitter
    cam.setDeadzone(32, 32);
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
        'enemy'
      ).setOrigin(0.5, 1);
      enemySprite.play('enemy_idle_down');
      
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
      
      // Use building tiles for landmark visualization
      const building = this.add.rectangle(0, 0, 48, 48, 0x1a1a2e);
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
    
    // Update drone position (follows player with slight delay)
    if (this.drone.visible) {
      const offset = Math.sin(time * 0.003) * 2;
      this.drone.setPosition(12, -20 + offset);
    }
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
    
    const characterId = state.player.characterId;
    
    if (input.moveX !== 0 || input.moveY !== 0) {
      this.gameState.updatePlayerVelocity({ x: input.moveX, y: input.moveY });
      
      // Determine direction based on input
      let direction = this.lastDirection;
      if (Math.abs(input.moveX) > Math.abs(input.moveY)) {
        direction = input.moveX > 0 ? 'right' : 'left';
      } else {
        direction = input.moveY > 0 ? 'down' : 'up';
      }
      this.lastDirection = direction;
      this.gameState.setPlayerFacing(direction as 'up' | 'down' | 'left' | 'right');
      
      // Play directional walk animation
      const animKey = `${characterId}_walk_${direction}`;
      if (this.player.anims.currentAnim?.key !== animKey) {
        this.player.play(animKey, true);
      }
    } else {
      // Play directional idle animation
      const animKey = `${characterId}_idle_${this.lastDirection}`;
      if (this.player.anims.currentAnim?.key !== animKey) {
        this.player.play(animKey, true);
      }
    }
    
    // Round position for pixel-perfect rendering
    this.playerContainer.x = Math.round(this.playerContainer.x);
    this.playerContainer.y = Math.round(this.playerContainer.y);
    
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
    this.player.setTexture(nextCharacter);
    this.player.play(`${nextCharacter}_idle_${this.lastDirection}`);
    
    // Show/hide drone based on character
    this.drone.setVisible(nextCharacter === 'adel');
    
    const nameTag = this.playerContainer.list[2] as Phaser.GameObjects.Text;
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
        const { position, direction } = getPatrolPosition(route, state.gameTime);
        enemySprite.setPosition(Math.round(position.x), Math.round(position.y));
        
        // Update enemy animation based on movement direction
        if (direction) {
          const animKey = `enemy_walk_${direction}`;
          if (enemySprite.anims.currentAnim?.key !== animKey) {
            enemySprite.play(animKey, true);
          }
        }
        
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
