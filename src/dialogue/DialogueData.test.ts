import { describe, it, expect } from 'vitest';
import { 
  getDialogueForTrigger, 
  getDialogueForMission,
  mission1Dialogue,
  mission2Dialogue,
  mission3Dialogue
} from './DialogueData';

describe('DialogueData', () => {
  describe('mission1Dialogue', () => {
    it('should have dialogue sequences', () => {
      expect(mission1Dialogue.length).toBeGreaterThan(0);
    });

    it('should have mission start dialogue', () => {
      const startDialogue = mission1Dialogue.find(d => d.triggerId === 'mission1_start');
      expect(startDialogue).toBeDefined();
      expect(startDialogue?.entries.length).toBeGreaterThan(0);
    });

    it('should have Arabic text for all entries', () => {
      mission1Dialogue.forEach(sequence => {
        sequence.entries.forEach(entry => {
          expect(entry.textAr).toBeDefined();
          expect(entry.textAr.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('mission2Dialogue', () => {
    it('should have dialogue sequences', () => {
      expect(mission2Dialogue.length).toBeGreaterThan(0);
    });

    it('should reference El-Ismaily (Brazil of Egypt)', () => {
      const hasIsmailyReference = mission2Dialogue.some(sequence =>
        sequence.entries.some(entry =>
          entry.textEn.includes('Brazil of Egypt') || entry.textAr.includes('برازيل')
        )
      );
      expect(hasIsmailyReference).toBe(true);
    });
  });

  describe('mission3Dialogue', () => {
    it('should have dialogue sequences', () => {
      expect(mission3Dialogue.length).toBeGreaterThan(0);
    });

    it('should mention the bridge repair', () => {
      const hasBridgeReference = mission3Dialogue.some(sequence =>
        sequence.entries.some(entry =>
          entry.textEn.toLowerCase().includes('bridge') || entry.textAr.includes('كوبري')
        )
      );
      expect(hasBridgeReference).toBe(true);
    });

    it('should mention mango (local Ismailia detail)', () => {
      const hasMangoReference = mission3Dialogue.some(sequence =>
        sequence.entries.some(entry =>
          entry.textEn.toLowerCase().includes('mango') || entry.textAr.includes('مانجا')
        )
      );
      expect(hasMangoReference).toBe(true);
    });
  });

  describe('getDialogueForTrigger', () => {
    it('should find dialogue by trigger ID', () => {
      const dialogue = getDialogueForTrigger('mission1_start');
      expect(dialogue).toBeDefined();
      expect(dialogue?.triggerId).toBe('mission1_start');
    });

    it('should return undefined for unknown trigger', () => {
      const dialogue = getDialogueForTrigger('unknown_trigger');
      expect(dialogue).toBeUndefined();
    });
  });

  describe('getDialogueForMission', () => {
    it('should return mission 1 dialogue', () => {
      const dialogue = getDialogueForMission(1);
      expect(dialogue).toEqual(mission1Dialogue);
    });

    it('should return mission 2 dialogue', () => {
      const dialogue = getDialogueForMission(2);
      expect(dialogue).toEqual(mission2Dialogue);
    });

    it('should return mission 3 dialogue', () => {
      const dialogue = getDialogueForMission(3);
      expect(dialogue).toEqual(mission3Dialogue);
    });

    it('should return empty array for unknown mission', () => {
      const dialogue = getDialogueForMission(99);
      expect(dialogue).toEqual([]);
    });
  });

  describe('character representation', () => {
    it('should have Nour as male (masculine grammar reference)', () => {
      const nourDialogue = mission1Dialogue[0].entries.find(e => e.speakerId === 'nour');
      expect(nourDialogue).toBeDefined();
    });

    it('should have all three crew members represented', () => {
      const allDialogue = [...mission1Dialogue, ...mission2Dialogue, ...mission3Dialogue];
      const speakers = new Set<string>();
      
      allDialogue.forEach(sequence => {
        sequence.entries.forEach(entry => {
          speakers.add(entry.speakerId);
        });
      });
      
      expect(speakers.has('nour')).toBe(true);
      expect(speakers.has('adel')).toBe(true);
      expect(speakers.has('laila')).toBe(true);
    });
  });

  describe('portrait dialogue markers', () => {
    it('should have portrait dialogue for NPC conversations', () => {
      const ummSayedDialogue = getDialogueForTrigger('umm_sayed_talk');
      expect(ummSayedDialogue?.isPortraitSequence).toBe(true);
    });

    it('should have bubble dialogue for crew banter', () => {
      const introDialogue = getDialogueForTrigger('mission1_start');
      expect(introDialogue?.isPortraitSequence).toBe(false);
    });
  });
});
