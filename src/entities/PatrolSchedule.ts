import { Position, EnemyState } from '../state/GameState';
import { GameConfig } from '../config/GameConfig';

export interface PatrolRoute {
  id: string;
  waypoints: Position[];
  cycleDurationMs: number;
  startTimeOffset: number;
}

export function createPatrolEnemy(
  id: string,
  route: PatrolRoute,
  startPosition?: Position
): EnemyState {
  const position = startPosition || route.waypoints[0];
  return {
    id,
    type: 'patrol',
    position: { ...position },
    patrolPath: route.waypoints,
    patrolIndex: 0,
    alertLevel: 'idle',
    detectionRadius: 48,
    facing: 'down',
    isActive: true
  };
}

export function getPatrolPosition(
  route: PatrolRoute,
  gameTimeMs: number
): { position: Position; waypointIndex: number; direction: 'up' | 'down' | 'left' | 'right' } {
  const cycleTime = (gameTimeMs + route.startTimeOffset) % route.cycleDurationMs;
  const segmentCount = route.waypoints.length;
  const segmentDuration = route.cycleDurationMs / segmentCount;
  
  const currentSegmentIndex = Math.floor(cycleTime / segmentDuration);
  const segmentProgress = (cycleTime % segmentDuration) / segmentDuration;
  
  const startWaypoint = route.waypoints[currentSegmentIndex];
  const endWaypoint = route.waypoints[(currentSegmentIndex + 1) % segmentCount];
  
  const x = startWaypoint.x + (endWaypoint.x - startWaypoint.x) * segmentProgress;
  const y = startWaypoint.y + (endWaypoint.y - startWaypoint.y) * segmentProgress;
  
  // Determine movement direction
  const dx = endWaypoint.x - startWaypoint.x;
  const dy = endWaypoint.y - startWaypoint.y;
  let direction: 'up' | 'down' | 'left' | 'right' = 'down';
  
  if (Math.abs(dx) > Math.abs(dy)) {
    direction = dx > 0 ? 'right' : 'left';
  } else {
    direction = dy > 0 ? 'down' : 'up';
  }
  
  return {
    position: { x, y },
    waypointIndex: currentSegmentIndex,
    direction
  };
}

export function isPlayerDetected(
  playerPosition: Position,
  enemyPosition: Position,
  detectionRadius: number,
  _playerStealth: number
): boolean {
  const dx = playerPosition.x - enemyPosition.x;
  const dy = playerPosition.y - enemyPosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance < detectionRadius;
}

export const mission1Patrols: PatrolRoute[] = [
  {
    id: 'station_patrol_1',
    waypoints: [
      { x: 100, y: 80 },
      { x: 200, y: 80 },
      { x: 200, y: 160 },
      { x: 100, y: 160 }
    ],
    cycleDurationMs: GameConfig.PATROL_CYCLE_MS,
    startTimeOffset: 0
  },
  {
    id: 'station_patrol_2',
    waypoints: [
      { x: 150, y: 120 },
      { x: 250, y: 120 },
      { x: 250, y: 200 },
      { x: 150, y: 200 }
    ],
    cycleDurationMs: GameConfig.PATROL_CYCLE_MS,
    startTimeOffset: GameConfig.PATROL_CYCLE_MS / 2
  }
];

export const mission2Patrols: PatrolRoute[] = [
  {
    id: 'afrang_patrol_1',
    waypoints: [
      { x: 400, y: 100 },
      { x: 500, y: 100 },
      { x: 500, y: 200 },
      { x: 400, y: 200 }
    ],
    cycleDurationMs: GameConfig.PATROL_CYCLE_MS,
    startTimeOffset: 0
  },
  {
    id: 'afrang_patrol_2',
    waypoints: [
      { x: 450, y: 150 },
      { x: 550, y: 150 },
      { x: 550, y: 250 },
      { x: 450, y: 250 }
    ],
    cycleDurationMs: GameConfig.PATROL_CYCLE_MS,
    startTimeOffset: 3000
  }
];

export const mission3Patrols: PatrolRoute[] = [
  {
    id: 'quay_patrol_1',
    waypoints: [
      { x: 600, y: 200 },
      { x: 700, y: 200 },
      { x: 700, y: 300 },
      { x: 600, y: 300 }
    ],
    cycleDurationMs: GameConfig.PATROL_CYCLE_MS,
    startTimeOffset: 0
  }
];

export function getPatrolsForMission(missionId: number): PatrolRoute[] {
  switch (missionId) {
    case 1: return mission1Patrols;
    case 2: return mission2Patrols;
    case 3: return mission3Patrols;
    default: return [];
  }
}
