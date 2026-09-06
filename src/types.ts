/**
 * Covalent-FORGE: Cyber-Athletics Type Definitions
 * Core Invariant: 1 === 1 (Absolute Mathematical Parity)
 */

export type Q16 = number; // Fixed-point 16.16 represented as integers

export interface Q16Vector {
  x: Q16;
  y: Q16;
  z?: Q16;
}

export interface FloatVector {
  x: number;
  y: number;
}

export type TopologyType = 'NULL_FRICTION_OCTAGON' | 'ALPHA_RING' | 'HYPER_TOROID' | 'KLEIN_LATTICE';

export type BeStateMode = 'COACH' | 'COOP_PEER' | 'ADVERSARY';

export interface SplineControlPoint {
  id: string;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  isAnchor?: boolean;
  strain?: number;
}

export interface SplineHull {
  id: string;
  points: SplineControlPoint[];
  color: string;
  tension: number;
  material?: 'MATERIAL_TRANSLUCENT_GLASS' | 'DEFAULT';
  refractionIndex?: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface LissajousParams {
  a: number; // Frequency X
  b: number; // Frequency Y
  c: number; // Frequency Z
  delta: number; // Phase shift
  speed: number;
  radius: number;
}

export interface TetherAnchor {
  id: string;
  x: number;
  y: number;
  type: 'CORE' | 'SPLINE_NODE' | 'RESONANCE_ORB' | 'THERMODYNAMIC_WELL';
  radius: number;
  energyValue: number;
  active: boolean;
  lissajous?: LissajousParams;
  q16Coords?: { x: number; y: number };
}

export interface ActiveTether {
  sourceId: string;
  targetAnchorId?: string;
  targetPoint?: FloatVector;
  targetSplineId?: string;
  splinePointIndex?: number;
  length: number;
  maxLength: number;
  tension: number; // 0 to 1
  siphoning: boolean;
  color: string;
}

export interface Entity {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  energy: number; // 0 to 1000 Q16/normalized
  maxEnergy: number;
  stasisLockRemainingTicks: number; // 180 ticks = 3 sec penalty
  isStasisLocked: boolean;
  color: string;
  trail: FloatVector[];
  activeTether: ActiveTether | null;
  score: number;
}

export interface RollbackFrame {
  tick: number;
  timestamp: number;
  human_vector: [number, number, number]; // [x, y, vx] in Q16
  be_vector: [number, number, number];    // [x, y, vx] in Q16
  topology_hash: string;                  // Merkle root hash of arena hull at this tick
  human_energy: number;
  be_energy: number;
  human_stasis: number;
  be_stasis: number;
  arena_points_state: FloatVector[];
  parity_valid: boolean;
}

export interface TelemetryStats {
  tick: number;
  tps: number;
  rollbackCount: number;
  lastReconcileTick: number;
  reconcileFrameCount: number;
  cordicParityOk: boolean;
  merkleRoot: string;
  simulatedLatencyMs: number;
  packetLossPercent: number;
  currentDvDt: number; // Rate of thermodynamic change
}
