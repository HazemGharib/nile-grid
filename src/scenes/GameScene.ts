import Phaser from 'phaser';
import { GameConfig, Colors, CharacterStats, CharacterId } from '../config/GameConfig';
import { GameState, Position, DialogueEntry } from '../state/GameState';
import { InputManager } from '../input/InputManager';
import { mapCharacterIdToSpriteKey, PLAYABLE_CHARACTERS } from '../assets/AssetLoader';

interface MapObject {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, unknown>;
}

interface PatrolRoute {
  name: string;
  points: Position[];
  character: string;
  mission: string;
}

interface MissionPoint {
  name: string;
  x: number;
  y: number;
  mission: string;
  role?: string;
  character?: string;
}

interface MapSprite {
  sprite: Phaser.GameObjects.Image;
  depthY: number;
  x: number;
  y: number;
  visible: boolean;
}

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private drone!: Phaser.GameObjects.Sprite;
  private inputManager!: InputManager;
  private gameState!: GameState;
  
  private map!: Phaser.Tilemaps.Tilemap;
  private collisionLayer!: Phaser.Tilemaps.TilemapLayer;
  
  private mapSprites: MapSprite[] = [];
  private visibleSprites: Set<Phaser.GameObjects.Image> = new Set();
  
  private enemies: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private npcs: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private objectives: Map<string, Phaser.GameObjects.Arc> = new Map();
  
  private patrolRoutes: PatrolRoute[] = [];
  private missionPoints: MissionPoint[] = [];
  
  private playerContainer!: Phaser.GameObjects.Container;
  private interactableTarget: string | null = null;
  private lastDirection: string = 'down';
  
  private cullBounds = { x: 0, y: 0, width: 0, height: 0 };
  private cullMargin = 200; // pixels outside camera to keep loaded

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.gameState = GameState.getInstance();
    
    // Pixel-perfect rendering
    this.cameras.main.setRoundPixels(true);
    
    this.loadTiledMap();
    this.loadMissionData();
    this.loadPatrolRoutes();
    this.setupPlayer();
    this.setupCamera();
    this.setupNPCs();
    this.setupEnemies();
    this.setupObjectives();
    
    this.inputManager = new InputManager(this);
    
    this.scene.launch('UIScene');
    this.scene.launch('DialogueScene');
    
    this.triggerMissionStart();
  }

  private loadTiledMap(): void {
    this.map = this.make.tilemap({ key: 'ismailia' });
    
    // Add tilesets
    const groundTileset = this.map.addTilesetImage('ismailia-m1-3-ground', 'ground');
    const collisionTileset = this.map.addTilesetImage('collision', 'collision');
    
    if (!groundTileset || !collisionTileset) {
      console.error('Failed to load tilesets');
      return;
    }
    
    // Create layers
    const groundLayerResult = this.map.createLayer('ground', groundTileset);
    const collisionLayerResult = this.map.createLayer('collision', collisionTileset);
    
    if (!groundLayerResult || !collisionLayerResult) {
      console.error('Failed to create map layers');
      return;
    }
    
    this.collisionLayer = collisionLayerResult;
    this.collisionLayer.setVisible(false);
    this.collisionLayer.setCollisionByExclusion([-1]);
    
    // Load sprite objects from the map
    const spritesLayer = this.map.getObjectLayer('sprites');
    if (spritesLayer) {
      this.loadMapSprites(spritesLayer.objects as unknown as MapObject[]);
    }
    
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  }

  private loadMapSprites(objects: MapObject[]): void {
    objects.forEach(obj => {
      const props = this.parseObjectProperties(obj);
      const spriteKey = props.sprite as string;
      
      if (!spriteKey || !this.textures.exists(spriteKey)) {
        return;
      }
      
      // Create sprite at position (x + width/2, y + height) with bottom-center origin
      const sprite = this.add.image(
        obj.x + obj.width / 2,
        obj.y + obj.height,
        spriteKey
      );
      sprite.setOrigin(0.5, 1);
      
      const depthY = (props.depthY as number) || (obj.y + obj.height);
      sprite.setDepth(depthY);
      
      // Initially hide all sprites (will be shown by culling system)
      sprite.setVisible(false);
      
      this.mapSprites.push({
        sprite,
        depthY,
        x: obj.x + obj.width / 2,
        y: obj.y + obj.height,
        visible: false
      });
    });
    
    // Sort by depthY for proper rendering order
    this.mapSprites.sort((a, b) => a.depthY - b.depthY);
  }

  private parseObjectProperties(obj: MapObject): Record<string, unknown> {
    const props: Record<string, unknown> = {};
    if (Array.isArray((obj as unknown as { properties: Array<{name: string, value: unknown}> }).properties)) {
      (obj as unknown as { properties: Array<{name: string, value: unknown}> }).properties.forEach(
        (p: {name: string, value: unknown}) => {
          props[p.name] = p.value;
        }
      );
    }
    return props;
  }

  private loadMissionData(): void {
    const missionsLayer = this.map.getObjectLayer('missions');
    if (!missionsLayer) return;
    
    (missionsLayer.objects as unknown as MapObject[]).forEach(obj => {
      const props = this.parseObjectProperties(obj);
      this.missionPoints.push({
        name: obj.name,
        x: obj.x,
        y: obj.y,
        mission: (props.mission as string) || '',
        role: props.role as string | undefined,
        character: props.character as string | undefined
      });
    });
  }

  private loadPatrolRoutes(): void {
    const patrolsLayer = this.map.getObjectLayer('patrols');
    if (!patrolsLayer) return;
    
    (patrolsLayer.objects as unknown as Array<MapObject & { polyline?: Array<{x: number, y: number}> }>).forEach(obj => {
      const props = this.parseObjectProperties(obj);
      const polyline = obj.polyline || [];
      
      const points: Position[] = polyline.map(p => ({
        x: p.x + obj.x,
        y: p.y + obj.y
      }));
      
      this.patrolRoutes.push({
        name: obj.name,
        points,
        character: (props.character as string) || 'guard',
        mission: (props.mission as string) || ''
      });
    });
  }

  private setupPlayer(): void {
    // Find player spawn point from map
    const spawnPoint = this.missionPoints.find(p => p.name === 'player_spawn');
    const startX = spawnPoint ? spawnPoint.x : 741;
    const startY = spawnPoint ? spawnPoint.y : 786;
    
    this.playerContainer = this.add.container(startX, startY);
    
    const characterId = this.gameState.getState().player.characterId;
    const spriteKey = mapCharacterIdToSpriteKey(characterId);
    
    this.player = this.add.sprite(0, 0, spriteKey);
    this.player.setOrigin(0.5, 1);
    this.player.play(`${spriteKey}-idle-down`);
    
    this.playerContainer.add(this.player);
    
    // Add Bolbol drone for Adel
    this.drone = this.add.sprite(-14, -30, 'bolbol');
    this.drone.setOrigin(0.5, 0.5);
    this.drone.play('bolbol-hover');
    this.drone.setVisible(characterId === 'adel');
    this.playerContainer.add(this.drone);
    
    // Name tag
    const nameTag = this.add.text(0, -40, CharacterStats[characterId].name, {
      fontSize: '8px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 2, y: 1 }
    }).setOrigin(0.5);
    this.playerContainer.add(nameTag);
    
    // Physics
    this.physics.world.enable(this.playerContainer);
    const body = this.playerContainer.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(16, 16);
    body.setOffset(-8, -16);
    
    // Collision with map
    this.physics.add.collider(this.playerContainer, this.collisionLayer);
    
    this.gameState.updatePlayerPosition({ x: startX, y: startY });
  }

  private setupCamera(): void {
    const cam = this.cameras.main;
    cam.setRoundPixels(true);
    cam.setZoom(3); // Integer zoom for pixel-perfect
    cam.startFollow(this.playerContainer, true, 0.1, 0.1);
    cam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    cam.setDeadzone(32, 32);
  }

  private setupNPCs(): void {
    // Find NPC positions from mission points
    const npcPoints = this.missionPoints.filter(p => p.name.startsWith('npc_'));
    
    npcPoints.forEach(point => {
      const characterId = point.character || point.name.replace('npc_', '');
      const spriteKey = mapCharacterIdToSpriteKey(characterId);
      
      if (!this.textures.exists(spriteKey)) {
        console.warn(`NPC sprite not found: ${spriteKey}`);
        return;
      }
      
      const npc = this.add.sprite(point.x, point.y, spriteKey);
      npc.setOrigin(0.5, 1);
      npc.play(`${spriteKey}-idle-down`);
      npc.setDepth(point.y);
      
      this.npcs.set(characterId, npc);
    });
  }

  private setupEnemies(): void {
    const currentMission = this.gameState.getState().currentMission;
    const missionKey = `ismailia-${currentMission}`;
    
    // Find patrols for current mission
    const relevantPatrols = this.patrolRoutes.filter(p => p.mission === missionKey);
    
    relevantPatrols.forEach((route, index) => {
      const startPos = route.points[0] || { x: 500, y: 500 };
      const spriteKey = mapCharacterIdToSpriteKey(route.character);
      
      const enemy = this.add.sprite(startPos.x, startPos.y, spriteKey);
      enemy.setOrigin(0.5, 1);
      enemy.play(`${spriteKey}-walk-down`);
      
      const enemyId = `${route.name}_${index}`;
      this.enemies.set(enemyId, enemy);
      
      // Store patrol data in enemy
      (enemy as unknown as { patrolRoute: PatrolRoute, patrolIndex: number, patrolProgress: number }).patrolRoute = route;
      (enemy as unknown as { patrolRoute: PatrolRoute, patrolIndex: number, patrolProgress: number }).patrolIndex = 0;
      (enemy as unknown as { patrolRoute: PatrolRoute, patrolIndex: number, patrolProgress: number }).patrolProgress = 0;
      
      // Add to game state
      this.gameState.addEnemy({
        id: enemyId,
        type: 'patrol',
        position: { ...startPos },
        patrolPath: route.points,
        patrolIndex: 0,
        alertLevel: 'idle',
        detectionRadius: 48,
        facing: 'down',
        isActive: true
      });
    });
  }

  private setupObjectives(): void {
    const mission = this.gameState.getCurrentMission();
    if (!mission) return;
    
    // Map objective IDs to mission point names
    const objectiveToPoint: Record<string, string> = {
      'm1_reach_station': 'm1_station_cameras_hack',
      'm1_blind_cameras': 'm1_station_cameras_hack',
      'm1_cross_checkpoint': 'm1_checkpoint',
      'm2_reach_gumhuriya': 'm2_patrol_mesh_box',
      'm2_copy_patrol_mesh': 'm2_patrol_mesh_box',
      'm2_cross_quarter': 'm1_old_town_alley',
      'm3_retrieve_key': 'm3_override_token',
      'm3_decrypt_token': 'm3_canal_records',
      'm3_repair_bridge': 'm3_bridge3_crank',
      'm3_cross_canal': 'm3_win_lake_side'
    };
    
    mission.objectives.forEach(objective => {
      const pointName = objectiveToPoint[objective.id];
      const point = this.missionPoints.find(p => p.name === pointName);
      
      let targetPos: Position;
      if (point) {
        targetPos = { x: point.x, y: point.y };
      } else {
        // Fallback positions
        targetPos = { x: 800, y: 1000 };
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
      marker.setDepth(targetPos.y);
      
      this.objectives.set(objective.id, marker);
    });
  }

  private triggerMissionStart(): void {
    const mission = this.gameState.getCurrentMission();
    if (!mission) return;
    
    // Queue mission start dialogue
    const missionDialogues: Record<number, DialogueEntry[]> = {
      1: [{
        speakerId: 'nour',
        speakerName: 'Nour Hassan',
        speakerNameAr: 'نور حسن',
        textEn: "The railway station checkpoint. We need to loop the cameras first.",
        textAr: "نقطة تفتيش محطة السكة الحديد. لازم نعمي الكاميرات الأول.",
        isPortraitDialogue: true,
        emotion: 'neutral'
      }],
      2: [{
        speakerId: 'laila',
        speakerName: 'Laila Farouk',
        speakerNameAr: 'ليلى فاروق',
        textEn: "Hay el-Afrang. Karim knows the patrol schedule here.",
        textAr: "حي الأفرنج. كريم يعرف جدول الدوريات هنا.",
        isPortraitDialogue: true,
        emotion: 'neutral'
      }],
      3: [{
        speakerId: 'adel',
        speakerName: 'Adel Mansour',
        speakerNameAr: 'عادل منصور',
        textEn: "The quay and Bridge 3. Hajj Rashid has the routing token.",
        textAr: "الرصيف وكوبري ٣. الحاج رشيد عنده توكن الإرشاد.",
        isPortraitDialogue: true,
        emotion: 'neutral'
      }]
    };
    
    const dialogues = missionDialogues[mission.id];
    if (dialogues) {
      dialogues.forEach(entry => this.gameState.queueDialogue(entry));
    }
  }

  update(time: number, delta: number): void {
    this.gameState.tick(delta);
    
    const input = this.inputManager.getInput();
    this.handlePlayerMovement(input);
    this.handlePlayerActions(input);
    
    this.updateEnemies(time);
    this.updateSpriteCulling();
    this.checkObjectives();
    this.updatePlayerDepth();
    
    // Update drone hover bob
    if (this.drone.visible) {
      const bobOffset = Math.sin(time * 0.004) * 2;
      this.drone.setPosition(-14, -30 + bobOffset);
    }
  }

  private updateSpriteCulling(): void {
    const cam = this.cameras.main;
    const scrollX = cam.scrollX;
    const scrollY = cam.scrollY;
    const viewWidth = cam.width / cam.zoom;
    const viewHeight = cam.height / cam.zoom;
    
    this.cullBounds = {
      x: scrollX - this.cullMargin,
      y: scrollY - this.cullMargin,
      width: viewWidth + this.cullMargin * 2,
      height: viewHeight + this.cullMargin * 2
    };
    
    // Cull sprites based on camera view
    this.mapSprites.forEach(ms => {
      const inView = 
        ms.x >= this.cullBounds.x &&
        ms.x <= this.cullBounds.x + this.cullBounds.width &&
        ms.y >= this.cullBounds.y &&
        ms.y <= this.cullBounds.y + this.cullBounds.height;
      
      if (inView !== ms.visible) {
        ms.sprite.setVisible(inView);
        ms.visible = inView;
      }
    });
  }

  private updatePlayerDepth(): void {
    // Set player depth based on Y position for proper z-sorting
    this.playerContainer.setDepth(this.playerContainer.y);
    
    // Update NPC depths
    this.npcs.forEach(npc => {
      npc.setDepth(npc.y);
    });
    
    // Update enemy depths
    this.enemies.forEach(enemy => {
      enemy.setDepth(enemy.y);
    });
  }

  private handlePlayerMovement(input: { moveX: number; moveY: number; sprint: boolean }): void {
    const state = this.gameState.getState();
    if (state.player.inDialogue) {
      const body = this.playerContainer.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      return;
    }
    
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
    
    const spriteKey = mapCharacterIdToSpriteKey(state.player.characterId);
    
    if (input.moveX !== 0 || input.moveY !== 0) {
      this.gameState.updatePlayerVelocity({ x: input.moveX, y: input.moveY });
      
      // Determine direction
      let direction = this.lastDirection;
      if (Math.abs(input.moveX) > Math.abs(input.moveY)) {
        direction = input.moveX > 0 ? 'right' : 'left';
      } else {
        direction = input.moveY > 0 ? 'down' : 'up';
      }
      this.lastDirection = direction;
      this.gameState.setPlayerFacing(direction as 'up' | 'down' | 'left' | 'right');
      
      // Play directional walk animation
      const animKey = `${spriteKey}-walk-${direction}`;
      if (this.player.anims.currentAnim?.key !== animKey) {
        this.player.play(animKey, true);
      }
      
      // Update drone direction if visible
      if (this.drone.visible) {
        const droneAnimKey = `bolbol-hover-${direction}`;
        if (this.drone.anims.currentAnim?.key !== droneAnimKey) {
          this.drone.play(droneAnimKey, true);
        }
      }
    } else {
      // Idle animation
      const animKey = `${spriteKey}-idle-${this.lastDirection}`;
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
    const currentIndex = PLAYABLE_CHARACTERS.indexOf(
      this.gameState.getState().player.characterId as typeof PLAYABLE_CHARACTERS[number]
    );
    const nextIndex = (currentIndex + 1) % PLAYABLE_CHARACTERS.length;
    const nextCharacter = PLAYABLE_CHARACTERS[nextIndex] as CharacterId;
    
    this.gameState.switchCharacter(nextCharacter);
    
    const spriteKey = mapCharacterIdToSpriteKey(nextCharacter);
    this.player.setTexture(spriteKey);
    this.player.play(`${spriteKey}-idle-${this.lastDirection}`);
    
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
      // Clear old markers
      this.objectives.forEach(marker => marker.destroy());
      this.objectives.clear();
      
      this.setupObjectives();
      this.triggerMissionStart();
    }
  }

  private updateEnemies(_time: number): void {
    this.enemies.forEach((enemy, enemyId) => {
      const data = enemy as unknown as { patrolRoute: PatrolRoute, patrolIndex: number, patrolProgress: number };
      const route = data.patrolRoute;
      
      if (!route || route.points.length < 2) return;
      
      // Update patrol progress
      data.patrolProgress += 0.001;
      if (data.patrolProgress >= 1) {
        data.patrolProgress = 0;
        data.patrolIndex = (data.patrolIndex + 1) % route.points.length;
      }
      
      const currentPoint = route.points[data.patrolIndex];
      const nextPoint = route.points[(data.patrolIndex + 1) % route.points.length];
      
      // Interpolate position
      const x = currentPoint.x + (nextPoint.x - currentPoint.x) * data.patrolProgress;
      const y = currentPoint.y + (nextPoint.y - currentPoint.y) * data.patrolProgress;
      
      enemy.setPosition(Math.round(x), Math.round(y));
      
      // Determine direction
      const dx = nextPoint.x - currentPoint.x;
      const dy = nextPoint.y - currentPoint.y;
      let direction = 'down';
      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? 'right' : 'left';
      } else {
        direction = dy > 0 ? 'down' : 'up';
      }
      
      const spriteKey = mapCharacterIdToSpriteKey(route.character);
      const animKey = `${spriteKey}-walk-${direction}`;
      if (enemy.anims.currentAnim?.key !== animKey) {
        enemy.play(animKey, true);
      }
      
      this.gameState.updateEnemy(enemyId, { position: { x, y } });
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

  shutdown(): void {
    this.inputManager?.destroy();
    this.mapSprites = [];
    this.visibleSprites.clear();
    this.enemies.clear();
    this.npcs.clear();
    this.objectives.clear();
    this.patrolRoutes = [];
    this.missionPoints = [];
  }
}
