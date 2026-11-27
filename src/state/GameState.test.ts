import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from './GameState';

describe('GameState', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = GameState.getInstance();
    gameState.reset();
  });

  describe('initialization', () => {
    it('should start with mission 1', () => {
      const state = gameState.getState();
      expect(state.currentMission).toBe(1);
    });

    it('should have 3 missions defined', () => {
      const state = gameState.getState();
      expect(state.missions.length).toBe(3);
    });

    it('should start with Nour as the default character', () => {
      const state = gameState.getState();
      expect(state.player.characterId).toBe('nour');
    });

    it('should start with player at origin', () => {
      const state = gameState.getState();
      expect(state.player.position.x).toBe(0);
      expect(state.player.position.y).toBe(0);
    });
  });

  describe('mission management', () => {
    it('should unlock mission 1 by default', () => {
      const mission = gameState.getCurrentMission();
      expect(mission?.isUnlocked).toBe(true);
    });

    it('should have first objective active', () => {
      const objective = gameState.getCurrentObjective();
      expect(objective).toBeDefined();
      expect(objective?.isActive).toBe(true);
    });

    it('should complete objective and activate next', () => {
      const firstObjective = gameState.getCurrentObjective();
      expect(firstObjective?.id).toBe('m1_reach_station');

      gameState.completeObjective('m1_reach_station');

      const nextObjective = gameState.getCurrentObjective();
      expect(nextObjective?.id).toBe('m1_blind_cameras');
      expect(nextObjective?.isActive).toBe(true);
    });

    it('should mark mission complete when all objectives done', () => {
      gameState.completeObjective('m1_reach_station');
      gameState.completeObjective('m1_blind_cameras');
      gameState.completeObjective('m1_cross_checkpoint');

      const mission = gameState.getState().missions.find(m => m.id === 1);
      expect(mission?.isCompleted).toBe(true);
    });

    it('should unlock next mission when current is completed', () => {
      gameState.completeObjective('m1_reach_station');
      gameState.completeObjective('m1_blind_cameras');
      gameState.completeObjective('m1_cross_checkpoint');

      const mission2 = gameState.getState().missions.find(m => m.id === 2);
      expect(mission2?.isUnlocked).toBe(true);
      expect(gameState.getState().currentMission).toBe(2);
    });
  });

  describe('character switching', () => {
    it('should switch to Adel', () => {
      gameState.switchCharacter('adel');
      
      const state = gameState.getState();
      expect(state.player.characterId).toBe('adel');
      expect(state.player.maxHealth).toBe(5);
    });

    it('should switch to Laila', () => {
      gameState.switchCharacter('laila');
      
      const state = gameState.getState();
      expect(state.player.characterId).toBe('laila');
      expect(state.player.maxHealth).toBe(2);
    });

    it('should preserve health when switching (capped to new max)', () => {
      gameState.switchCharacter('adel');
      
      const state = gameState.getState();
      expect(state.player.health).toBe(2);
      expect(state.player.maxHealth).toBe(5);
    });
  });

  describe('player state', () => {
    it('should update player position', () => {
      gameState.updatePlayerPosition({ x: 100, y: 200 });
      
      const state = gameState.getState();
      expect(state.player.position.x).toBe(100);
      expect(state.player.position.y).toBe(200);
    });

    it('should update player facing', () => {
      gameState.setPlayerFacing('left');
      
      const state = gameState.getState();
      expect(state.player.facing).toBe('left');
    });

    it('should update sprinting state', () => {
      gameState.setPlayerSprinting(true);
      
      const state = gameState.getState();
      expect(state.player.isSprinting).toBe(true);
    });
  });

  describe('dialogue queue', () => {
    it('should queue dialogue entries', () => {
      gameState.queueDialogue({
        speakerId: 'nour',
        speakerName: 'Nour',
        speakerNameAr: 'نور',
        textEn: 'Test dialogue',
        textAr: 'نص تجريبي',
        isPortraitDialogue: false
      });
      
      const state = gameState.getState();
      expect(state.dialogueQueue.length).toBe(1);
    });

    it('should dequeue dialogue entries', () => {
      gameState.queueDialogue({
        speakerId: 'nour',
        speakerName: 'Nour',
        speakerNameAr: 'نور',
        textEn: 'Test dialogue',
        textAr: 'نص تجريبي',
        isPortraitDialogue: false
      });

      const entry = gameState.dequeueDialogue();
      
      expect(entry?.textEn).toBe('Test dialogue');
      expect(gameState.getState().dialogueQueue.length).toBe(0);
    });
  });

  describe('state subscription', () => {
    it('should notify subscribers on state change', () => {
      let notified = false;
      
      gameState.subscribe(() => {
        notified = true;
      });
      
      gameState.updatePlayerPosition({ x: 50, y: 50 });
      
      expect(notified).toBe(true);
    });

    it('should allow unsubscribing', () => {
      let notifyCount = 0;
      
      const unsubscribe = gameState.subscribe(() => {
        notifyCount++;
      });
      
      gameState.updatePlayerPosition({ x: 50, y: 50 });
      expect(notifyCount).toBe(1);
      
      unsubscribe();
      
      gameState.updatePlayerPosition({ x: 100, y: 100 });
      expect(notifyCount).toBe(1);
    });
  });

  describe('all missions complete check', () => {
    it('should return false when missions are incomplete', () => {
      expect(gameState.isAllMissionsComplete()).toBe(false);
    });

    it('should return true when all missions are complete', () => {
      gameState.completeObjective('m1_reach_station');
      gameState.completeObjective('m1_blind_cameras');
      gameState.completeObjective('m1_cross_checkpoint');
      
      gameState.completeObjective('m2_reach_gumhuriya');
      gameState.completeObjective('m2_copy_patrol_mesh');
      gameState.completeObjective('m2_cross_quarter');
      
      gameState.completeObjective('m3_retrieve_key');
      gameState.completeObjective('m3_decrypt_token');
      gameState.completeObjective('m3_repair_bridge');
      gameState.completeObjective('m3_cross_canal');
      
      expect(gameState.isAllMissionsComplete()).toBe(true);
    });
  });
});
