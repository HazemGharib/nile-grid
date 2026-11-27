import { describe, it, expect } from 'vitest';
import { 
  getPatrolPosition, 
  createPatrolEnemy, 
  isPlayerDetected,
  getPatrolsForMission,
  PatrolRoute
} from './PatrolSchedule';

describe('PatrolSchedule', () => {
  const testRoute: PatrolRoute = {
    id: 'test_patrol',
    waypoints: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 }
    ],
    cycleDurationMs: 4000,
    startTimeOffset: 0
  };

  describe('getPatrolPosition', () => {
    it('should return first waypoint at time 0', () => {
      const { position, waypointIndex } = getPatrolPosition(testRoute, 0);
      
      expect(position.x).toBeCloseTo(0);
      expect(position.y).toBeCloseTo(0);
      expect(waypointIndex).toBe(0);
    });

    it('should interpolate between waypoints', () => {
      const { position } = getPatrolPosition(testRoute, 500);
      
      expect(position.x).toBeCloseTo(50);
      expect(position.y).toBeCloseTo(0);
    });

    it('should be at second waypoint at quarter cycle', () => {
      const { position, waypointIndex } = getPatrolPosition(testRoute, 1000);
      
      expect(position.x).toBeCloseTo(100);
      expect(position.y).toBeCloseTo(0);
      expect(waypointIndex).toBe(1);
    });

    it('should cycle back to start after full duration', () => {
      const { position } = getPatrolPosition(testRoute, 4000);
      
      expect(position.x).toBeCloseTo(0);
      expect(position.y).toBeCloseTo(0);
    });

    it('should handle start time offset', () => {
      const offsetRoute: PatrolRoute = {
        ...testRoute,
        startTimeOffset: 1000
      };
      
      const { waypointIndex } = getPatrolPosition(offsetRoute, 0);
      
      expect(waypointIndex).toBe(1);
    });
  });

  describe('createPatrolEnemy', () => {
    it('should create an enemy at the first waypoint', () => {
      const enemy = createPatrolEnemy('test_enemy', testRoute);
      
      expect(enemy.id).toBe('test_enemy');
      expect(enemy.type).toBe('patrol');
      expect(enemy.position.x).toBe(0);
      expect(enemy.position.y).toBe(0);
      expect(enemy.patrolPath.length).toBe(4);
      expect(enemy.alertLevel).toBe('idle');
      expect(enemy.isActive).toBe(true);
    });

    it('should use custom start position when provided', () => {
      const enemy = createPatrolEnemy('test_enemy', testRoute, { x: 50, y: 50 });
      
      expect(enemy.position.x).toBe(50);
      expect(enemy.position.y).toBe(50);
    });
  });

  describe('isPlayerDetected', () => {
    it('should detect player within detection radius', () => {
      const playerPos = { x: 10, y: 10 };
      const enemyPos = { x: 20, y: 10 };
      const detectionRadius = 15;
      
      const detected = isPlayerDetected(playerPos, enemyPos, detectionRadius, 1);
      
      expect(detected).toBe(true);
    });

    it('should not detect player outside detection radius', () => {
      const playerPos = { x: 0, y: 0 };
      const enemyPos = { x: 100, y: 100 };
      const detectionRadius = 50;
      
      const detected = isPlayerDetected(playerPos, enemyPos, detectionRadius, 1);
      
      expect(detected).toBe(false);
    });

    it('should detect player at exact radius boundary', () => {
      const playerPos = { x: 0, y: 0 };
      const enemyPos = { x: 50, y: 0 };
      const detectionRadius = 50;
      
      const detected = isPlayerDetected(playerPos, enemyPos, detectionRadius, 1);
      
      expect(detected).toBe(false);
    });
  });

  describe('getPatrolsForMission', () => {
    it('should return patrols for mission 1', () => {
      const patrols = getPatrolsForMission(1);
      
      expect(patrols.length).toBeGreaterThan(0);
      expect(patrols[0].id).toContain('station');
    });

    it('should return patrols for mission 2', () => {
      const patrols = getPatrolsForMission(2);
      
      expect(patrols.length).toBeGreaterThan(0);
      expect(patrols[0].id).toContain('afrang');
    });

    it('should return patrols for mission 3', () => {
      const patrols = getPatrolsForMission(3);
      
      expect(patrols.length).toBeGreaterThan(0);
      expect(patrols[0].id).toContain('quay');
    });

    it('should return empty array for unknown mission', () => {
      const patrols = getPatrolsForMission(99);
      
      expect(patrols).toEqual([]);
    });
  });
});
