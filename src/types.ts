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

export interface FloatVector3D {
  x: number;
  y: number;
  z: number;
}

export interface FloatVector4D {
  x: number;
  y: number;
  z: number;
  w: number;
}

export type Rotor6Planes = [number, number, number, number, number, number]; // [XY, YZ, ZX, XW, YW, ZW]

export interface BoundingHypersphere {
  x: number;
  y: number;
  z: number;
  w: number;
  hyperRadius: number;
}

export interface TesseractEcho {
  entityId: string;
  name: string;
  pos4D: FloatVector4D;
  apparentRadius: number;
  phaseDistance: number;
  rotor: Rotor6Planes;
  predictedReentryPoint: FloatVector3D;
  color: string;
}

export interface GravityVector3D {
  x: number; // Q16 or normalized
  y: number;
  z: number;
}

export type TopologyType =
  | 'THE_NULL_FRICTION_TESSERACT'
  | 'ISOTROPIC_HYPER_SPHERE'
  | 'NULL_FRICTION_OCTAGON'
  | 'ALPHA_RING'
  | 'HYPER_TOROID'
  | 'KLEIN_LATTICE';

export type BeStateMode = 'COACH' | 'COOP_PEER' | 'ADVERSARY';

export interface SplineControlPoint {
  id: string;
  baseX: number;
  baseY: number;
  baseZ?: number;
  x: number;
  y: number;
  z?: number;
  vx: number;
  vy: number;
  vz?: number;
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
  sphericalRadius?: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  minZ?: number;
  maxX: number;
  maxY: number;
  maxZ?: number;
}

export interface BoundingSphere {
  x: number;
  y: number;
  z: number;
  radius: number;
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
  z?: number;
  type: 'CORE' | 'SPLINE_NODE' | 'RESONANCE_ORB' | 'THERMODYNAMIC_WELL';
  radius: number;
  energyValue: number;
  active: boolean;
  lissajous?: LissajousParams;
  q16Coords?: { x: number; y: number; z?: number };
}

export interface ActiveTether {
  sourceId: string;
  targetAnchorId?: string;
  targetPoint?: FloatVector;
  targetPoint3D?: FloatVector3D;
  targetPoint4D?: FloatVector4D;
  targetSplineId?: string;
  splinePointIndex?: number;
  length: number;
  maxLength: number;
  tension: number; // 0 to 1
  siphoning: boolean;
  isReversed?: boolean; // Inverted along XW/YW hyper-rotation
  color: string;
}

export interface Entity {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  w: number; // 4th Spatial Dimension (Phase / Depth)
  vx: number;
  vy: number;
  vz: number;
  vw: number; // Phase velocity dW
  pitch: number; // 6DOF rotation (radians)
  yaw: number;
  roll: number;
  rotor: Rotor6Planes; // 6 Planes of 4D Rotation (XY, YZ, ZX, XW, YW, ZW)
  radius: number;
  boundingRadius: number; // Q16.16 Bounding Sphere
  hyperRadius: number; // Bounding Hypersphere radius in 4D
  apparentRadius3D: number; // Cross-sectional radius at current W-slice
  isPhasedOut: boolean; // True when |W - sliceW| >= hyperRadius
  phaseBleed: number; // Thermodynamic friction bleed from W != 0
  energy: number; // 0 to 1000 Q16/normalized
  maxEnergy: number;
  stasisLockRemainingTicks: number; // 180 ticks = 3 sec penalty
  isStasisLocked: boolean;
  isBraking?: boolean; // Thermodynamic brake engaged
  color: string;
  trail: FloatVector[];
  trail3D: FloatVector3D[];
  trail4D?: FloatVector4D[];
  activeTether: ActiveTether | null;
  score: number;
}

export interface RollbackFrame {
  tick: number;
  timestamp: number;
  human_vector: [number, number, number]; // [x, y, vx] in Q16
  be_vector: [number, number, number];    // [x, y, vx] in Q16
  human_pos_3d?: [number, number, number]; // [x, y, z] in Q16
  be_pos_3d?: [number, number, number];
  human_pos_4d?: [number, number, number, number]; // [x, y, z, w] in Q16
  be_pos_4d?: [number, number, number, number];
  human_rot_3d?: [number, number, number]; // [pitch, yaw, roll]
  human_rotor_4d?: Rotor6Planes; // 6 planes of 4D rotation
  topology_hash: string;                  // Merkle root hash of arena hull at this tick
  human_energy: number;
  be_energy: number;
  human_stasis: number;
  be_stasis: number;
  human_w?: number;
  be_w?: number;
  arena_points_state: FloatVector[];
  arena_points_state_3d?: FloatVector3D[];
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
