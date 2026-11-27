import { CharacterId, CharacterStats } from '../config/GameConfig';

export interface Position {
  x: number;
  y: number;
}

export interface PlayerState {
  id: string;
  characterId: CharacterId;
  position: Position;
  velocity: Position;
  facing: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  isSprinting: boolean;
  health: number;
  maxHealth: number;
  isVisible: boolean;
  inDialogue: boolean;
}

export interface EnemyState {
  id: string;
  type: 'patrol' | 'stationary' | 'warden';
  position: Position;
  patrolPath: Position[];
  patrolIndex: number;
  alertLevel: 'idle' | 'suspicious' | 'alert';
  detectionRadius: number;
  facing: 'up' | 'down' | 'left' | 'right';
  isActive: boolean;
}

export interface ObjectiveState {
  id: string;
  missionId: number;
  type: 'reach' | 'interact' | 'hack' | 'repair' | 'deliver' | 'stealth';
  targetPosition: Position;
  targetRadius: number;
  isCompleted: boolean;
  isActive: boolean;
  requiredCharacter?: CharacterId;
  timeLimit?: number;
  description: string;
  descriptionAr: string;
}

export interface MissionState {
  id: number;
  name: string;
  nameAr: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  currentObjectiveIndex: number;
  objectives: ObjectiveState[];
}

export interface DialogueEntry {
  speakerId: string;
  speakerName: string;
  speakerNameAr: string;
  textEn: string;
  textAr: string;
  isPortraitDialogue: boolean;
  emotion?: 'neutral' | 'happy' | 'concerned' | 'alert';
}

export interface GameStateData {
  currentMission: number;
  missions: MissionState[];
  player: PlayerState;
  enemies: EnemyState[];
  cameraPosition: Position;
  gameTime: number;
  isPaused: boolean;
  dialogueQueue: DialogueEntry[];
}

const createInitialPlayerState = (): PlayerState => ({
  id: 'player1',
  characterId: 'nour',
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  facing: 'down',
  isMoving: false,
  isSprinting: false,
  health: CharacterStats.nour.health,
  maxHealth: CharacterStats.nour.health,
  isVisible: true,
  inDialogue: false
});

export class GameState {
  private static instance: GameState;
  private state: GameStateData;
  private listeners: Set<(state: GameStateData) => void> = new Set();
  private tickRate = 60;
  private lastTick = 0;
  
  private constructor() {
    this.state = this.createInitialState();
  }
  
  static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }
  
  private createInitialState(): GameStateData {
    return {
      currentMission: 1,
      missions: this.createMissions(),
      player: createInitialPlayerState(),
      enemies: [],
      cameraPosition: { x: 0, y: 0 },
      gameTime: 0,
      isPaused: false,
      dialogueQueue: []
    };
  }
  
  private createMissions(): MissionState[] {
    return [
      {
        id: 1,
        name: 'Railway Station & Orabi Square',
        nameAr: 'محطة القطار وميدان عرابي',
        isUnlocked: true,
        isCompleted: false,
        currentObjectiveIndex: 0,
        objectives: [
          {
            id: 'm1_reach_station',
            missionId: 1,
            type: 'reach',
            targetPosition: { x: 0, y: 0 },
            targetRadius: 32,
            isCompleted: false,
            isActive: true,
            description: 'Enter the railway station forecourt',
            descriptionAr: 'ادخل ساحة المحطة'
          },
          {
            id: 'm1_blind_cameras',
            missionId: 1,
            type: 'hack',
            targetPosition: { x: 0, y: 0 },
            targetRadius: 24,
            isCompleted: false,
            isActive: false,
            requiredCharacter: 'laila',
            description: 'Loop the station cameras',
            descriptionAr: 'اعمل لوب للكاميرات'
          },
          {
            id: 'm1_cross_checkpoint',
            missionId: 1,
            type: 'stealth',
            targetPosition: { x: 0, y: 0 },
            targetRadius: 48,
            isCompleted: false,
            isActive: false,
            description: 'Cross to the south alley undetected',
            descriptionAr: 'اعدي للحارة الجنوبية من غير ما يشوفوك'
          }
        ]
      },
      {
        id: 2,
        name: 'Hay el-Afrang',
        nameAr: 'حي الأفرنج',
        isUnlocked: false,
        isCompleted: false,
        currentObjectiveIndex: 0,
        objectives: [
          {
            id: 'm2_reach_gumhuriya',
            missionId: 2,
            type: 'reach',
            targetPosition: { x: 0, y: 0 },
            targetRadius: 32,
            isCompleted: false,
            isActive: true,
            description: 'Reach Gumhuriya Square',
            descriptionAr: 'اوصل ميدان الجمهورية'
          },
          {
            id: 'm2_copy_patrol_mesh',
            missionId: 2,
            type: 'hack',
            targetPosition: { x: 0, y: 0 },
            targetRadius: 24,
            isCompleted: false,
            isActive: false,
            requiredCharacter: 'laila',
            description: 'Copy the patrol schedule from the kiosk',
            descriptionAr: 'انسخ جدول الدوريات من الكشك'
          },
          {
            id: 'm2_cross_quarter',
            missionId: 2,
            type: 'stealth',
            targetPosition: { x: 0, y: 0 },
            targetRadius: 64,
            isCompleted: false,
            isActive: false,
            description: 'Cross the quarter without raising an alarm',
            descriptionAr: 'اعدي الحي من غير ما ترفع إنذار'
          }
        ]
      },
      {
        id: 3,
        name: 'The Quay & Bridge 3',
        nameAr: 'الرصيف وكوبري تلاتة',
        isUnlocked: false,
        isCompleted: false,
        currentObjectiveIndex: 0,
        objectives: [
          {
            id: 'm3_retrieve_key',
            missionId: 3,
            type: 'deliver',
            targetPosition: { x: 0, y: 0 },
            targetRadius: 24,
            isCompleted: false,
            isActive: true,
            requiredCharacter: 'nour',
            description: 'Retrieve the override token from de Lesseps House',
            descriptionAr: 'جيب مفتاح التجاوز من بيت ديليسبس'
          },
          {
            id: 'm3_decrypt_token',
            missionId: 3,
            type: 'hack',
            targetPosition: { x: 0, y: 0 },
            targetRadius: 24,
            isCompleted: false,
            isActive: false,
            requiredCharacter: 'laila',
            description: 'Decrypt the token at the Canal Museum',
            descriptionAr: 'فك شفرة المفتاح في متحف القناة'
          },
          {
            id: 'm3_repair_bridge',
            missionId: 3,
            type: 'repair',
            targetPosition: { x: 0, y: 0 },
            targetRadius: 32,
            isCompleted: false,
            isActive: false,
            requiredCharacter: 'adel',
            description: 'Repair Bridge 3 to cross the Sweet-Water Canal',
            descriptionAr: 'صلح كوبري تلاتة عشان تعدي الترعة'
          },
          {
            id: 'm3_cross_canal',
            missionId: 3,
            type: 'reach',
            targetPosition: { x: 0, y: 0 },
            targetRadius: 32,
            isCompleted: false,
            isActive: false,
            description: 'Cross the Sweet-Water Canal',
            descriptionAr: 'اعدي ترعة الإسماعيلية'
          }
        ]
      }
    ];
  }
  
  getState(): Readonly<GameStateData> {
    return this.state;
  }
  
  subscribe(listener: (state: GameStateData) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
  
  updatePlayerPosition(position: Position): void {
    this.state.player.position = position;
    this.notify();
  }
  
  updatePlayerVelocity(velocity: Position): void {
    this.state.player.velocity = velocity;
    this.state.player.isMoving = velocity.x !== 0 || velocity.y !== 0;
    this.notify();
  }
  
  setPlayerFacing(facing: 'up' | 'down' | 'left' | 'right'): void {
    this.state.player.facing = facing;
    this.notify();
  }
  
  setPlayerSprinting(isSprinting: boolean): void {
    this.state.player.isSprinting = isSprinting;
    this.notify();
  }
  
  switchCharacter(characterId: CharacterId): void {
    const stats = CharacterStats[characterId];
    this.state.player.characterId = characterId;
    this.state.player.maxHealth = stats.health;
    this.state.player.health = Math.min(this.state.player.health, stats.health);
    this.notify();
  }
  
  completeObjective(objectiveId: string): void {
    for (const mission of this.state.missions) {
      const objective = mission.objectives.find(o => o.id === objectiveId);
      if (objective) {
        objective.isCompleted = true;
        objective.isActive = false;
        
        const nextIndex = mission.currentObjectiveIndex + 1;
        if (nextIndex < mission.objectives.length) {
          mission.currentObjectiveIndex = nextIndex;
          mission.objectives[nextIndex].isActive = true;
        } else {
          mission.isCompleted = true;
          const nextMission = this.state.missions.find(m => m.id === mission.id + 1);
          if (nextMission) {
            nextMission.isUnlocked = true;
            this.state.currentMission = nextMission.id;
          }
        }
        this.notify();
        return;
      }
    }
  }
  
  getCurrentMission(): MissionState | undefined {
    return this.state.missions.find(m => m.id === this.state.currentMission);
  }
  
  getCurrentObjective(): ObjectiveState | undefined {
    const mission = this.getCurrentMission();
    if (!mission) return undefined;
    return mission.objectives.find(o => o.isActive);
  }
  
  addEnemy(enemy: EnemyState): void {
    this.state.enemies.push(enemy);
    this.notify();
  }
  
  updateEnemy(id: string, updates: Partial<EnemyState>): void {
    const enemy = this.state.enemies.find(e => e.id === id);
    if (enemy) {
      Object.assign(enemy, updates);
      this.notify();
    }
  }
  
  queueDialogue(entry: DialogueEntry): void {
    this.state.dialogueQueue.push(entry);
    this.notify();
  }
  
  dequeueDialogue(): DialogueEntry | undefined {
    const entry = this.state.dialogueQueue.shift();
    this.notify();
    return entry;
  }
  
  setInDialogue(inDialogue: boolean): void {
    this.state.player.inDialogue = inDialogue;
    this.notify();
  }
  
  tick(_deltaMs: number): void {
    const now = performance.now();
    const tickDuration = 1000 / this.tickRate;
    
    if (now - this.lastTick >= tickDuration) {
      this.state.gameTime += tickDuration;
      this.lastTick = now;
      this.updateEnemyPatrols();
    }
  }
  
  private updateEnemyPatrols(): void {
    for (const enemy of this.state.enemies) {
      if (enemy.type === 'patrol' && enemy.patrolPath.length > 0 && enemy.isActive) {
        const target = enemy.patrolPath[enemy.patrolIndex];
        const dx = target.x - enemy.position.x;
        const dy = target.y - enemy.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 2) {
          enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolPath.length;
        }
      }
    }
  }
  
  reset(): void {
    this.state = this.createInitialState();
    this.notify();
  }
  
  setMission(missionId: number): void {
    this.state.currentMission = missionId;
    const mission = this.getCurrentMission();
    if (mission) {
      mission.isUnlocked = true;
    }
    this.notify();
  }
  
  isAllMissionsComplete(): boolean {
    return this.state.missions.every(m => m.isCompleted);
  }
}
