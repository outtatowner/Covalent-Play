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
  | 'CONTINUOUS_TRI_STATE_GAUNTLET'
  | 'BH_STAR_ACCRETION_DISK'
  | 'HERITAGE_E1M1_HANGAR'
  | 'QUAKE_HYPER_ROTATIONAL'
  | 'TESSERACT_KINETIC_SHEAR'
  | 'MARBLE_MARCHER_FRACTAL'
  | 'THE_NULL_FRICTION_TESSERACT'
  | 'ISOTROPIC_HYPER_SPHERE'
  | 'NULL_FRICTION_OCTAGON'
  | 'ALPHA_RING'
  | 'HYPER_TOROID'
  | 'KLEIN_LATTICE';

export interface BlackHoleSingularity {
  id: string;
  pos4D: FloatVector4D;
  posQ16: [Q16, Q16, Q16, Q16];
  massQ16: Q16; // 0x00A00000 = 160.0 in Q16
  massFloat: number;
  eventHorizonRadius: number; // Schwarzschild radius in 4D space (~38.0)
  eventHorizonSq: number;
  photonSphereRadius: number; // 1.5 * r_s (~57.0)
  iscoRadius: number; // Innermost Stable Circular Orbit: 3.0 * r_s (~114.0)
  accretionOuterRadius: number; // ~320.0
  hawkingRadiationFlux: number; // Thermodynamic radiation parameter
  spinA: number; // Kerr spin parameter (0.0 to 0.98)
  pulsePhase: number;
  active: boolean;
  annihilationCount: number;
}

export interface BHAccretionOrbitalRing {
  id: string;
  radius: number;
  radiusQ16: Q16;
  orbitalVelocity: number;
  wPhaseOffset: number;
  resonanceHarmonic: string;
  color: string;
}

export interface BHAccretionArchive {
  hash: string;
  singularity: BlackHoleSingularity;
  hull: SplineHull;
  anchors: TetherAnchor[];
  orbitalRings: BHAccretionOrbitalRing[];
  timestamp: number;
}

export type GauntletSectorId = 'SECTOR_I_ASCENT' | 'SECTOR_II_BREACH' | 'SECTOR_III_APEX';

export interface MathematicalGate {
  id: string;
  z: number;
  outerRadius: number;
  apertureRadius: number;
  requiredWPhase: number;
  label: string;
  cleared: boolean;
  pulsePhase: number;
}

export interface GauntletSectorInfo {
  id: GauntletSectorId;
  name: string;
  romanNumeral: string;
  manifoldState: BeStateMode;
  code: string;
  ludicObjective: string;
  beRole: string;
  zMin: number;
  zMax: number;
  zCeilingQ16: number;
  frictionBaseline: number;
  activeObjectiveCleared: boolean;
}

export interface VectorQuadbitArchive {
  hash: string;
  sectors: GauntletSectorInfo[];
  gates: MathematicalGate[];
  qbitAscentSplines: SplineHull;
  qbitBreachTesseract: SplineHull;
  qbitApexArena: SplineHull;
  anchors: TetherAnchor[];
  timestamp: number;
}

export type BeStateMode = 'COACH' | 'COOP_PEER' | 'ADVERSARY';

export interface PhasedDaemon {
  id: string;
  x: number;
  y: number;
  z: number;
  w: number;
  vx: number;
  vy: number;
  vz: number;
  vw: number;
  radius: number;
  apparentRadius3D: number;
  health: number;
  maxHealth: number;
  color: string;
}

export interface KineticTrap {
  id: string;
  x: number;
  y: number;
  z: number;
  w?: number;
  radius: number;
  durationTicks: number;
  maxDurationTicks: number;
  color: string;
  triggered: boolean;
  armedTick: number;
}

export interface SplineControlPoint {
  id: string;
  baseX: number;
  baseY: number;
  baseZ?: number;
  baseW?: number;
  x: number;
  y: number;
  z?: number;
  w?: number;
  vx: number;
  vy: number;
  vz?: number;
  vw?: number;
  mass: number;
  isAnchor?: boolean;
  strain?: number;
}

export interface SplineHull {
  id: string;
  points: SplineControlPoint[];
  color: string;
  tension: number;
  material?: 'MATERIAL_TRANSLUCENT_GLASS' | 'DEFAULT' | 'GOTHIC_SLIPGATE_OBSIDIAN' | 'OCTREE_SMOOTHED_BEZIER' | 'Q16_RAYMARCHED_FRACTAL';
  refractionIndex?: number;
  sphericalRadius?: number;
  friction?: number;
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
  w?: number;
  phaseOffset?: number;
  type: 'CORE' | 'SPLINE_NODE' | 'RESONANCE_ORB' | 'THERMODYNAMIC_WELL' | 'SLIPGATE_PHASE_DOOR' | 'KINETIC_TETHER_NODE';
  radius: number;
  energyValue: number;
  active: boolean;
  lissajous?: LissajousParams;
  q16Coords?: { x: number; y: number; z?: number; w?: number };
}

export interface ActiveTether {
  sourceId: string;
  targetAnchorId?: string;
  targetEntityId?: string;
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
  ledgerForgivenessActive?: boolean; // State 0x00: Grazing thermodynamic bankruptcy grace buffer
  forgivenessGraceTicks?: number;
  floorStrainLevel?: number; // 0 to 1 floor grid strain warning
  consecutiveHyperRotations?: number; // State 0xFF: Tracking rapid hyper-rotations for thermodynamic exhaustion
  tetherResonanceActive?: boolean; // State 0x01: Tether phase alignment (dV/dt cost halved)
  macroDeformationActive?: boolean; // State 0x01: Wall plane ripped into W-axis to crush swarm
  macroDeformationWaveZ?: number;
  color: string;
  trail: FloatVector[];
  trail3D: FloatVector3D[];
  trail4D?: FloatVector4D[];
  activeTether: ActiveTether | null;
  score: number;
  timeDilationFactor?: number; // Schwarzschild / Kerr time dilation factor gamma (1.0 = normal, 0.05 = near event horizon)
  inAccretionOrbit?: boolean; // True if within stable accretion orbital limits
  orbitalDecay?: number; // 0 to 1 decay index toward singularity collapse
  bhAnnihilationActive?: boolean; // Tautological collapse triggered
  bhAnnihilationProgress?: number; // 0 to 1 collapse animation
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
  time_dilation_factor?: number; // BH* time dilation at current tick
  bh_dist_sq?: number; // Hyperspatial separation distance squared
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

// Organelle 0xC3_COVALENT: The Heritage Sieve & Qbit Mask Types
export type QbitShaderMask =
  | 'QBIT_HEX_TECH'
  | 'FRACTAL_NOISE_SLIME'
  | 'CORDIC_OBSIDIAN'
  | 'QBIT_HAZARD_STRIP'
  | 'ALGORITHMIC_COMPUTER_PANEL'
  | 'VORONOI_FRACTAL_DEPTH';

export type HeritageEntityType =
  | 'IMP_HERITAGE'
  | 'BARON_HERITAGE'
  | 'ZOMBIEMAN_HERITAGE'
  | 'DEMON_HERITAGE';

export interface HeritageEntity {
  id: string;
  name: string;
  type: HeritageEntityType;
  x: number;
  y: number;
  z: number;
  w: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  energy: number; // Bound to Thermodynamic Ledger (E <= 600J)
  maxEnergy: number;
  isStasisLocked: boolean;
  stasisLockRemainingTicks: number;
  qbitMask: QbitShaderMask;
  color: string;
  tetherAttached: boolean;
}

export interface HeritageSector {
  id: number;
  name: string;
  floorZ: number;
  ceilZ: number;
  lightLevel: number;
  floorQbitMask: QbitShaderMask;
  ceilQbitMask: QbitShaderMask;
  wallQbitMask: QbitShaderMask;
  polygon: FloatVector[];
}

export interface HeritageLinedef {
  id: number;
  v1: FloatVector;
  v2: FloatVector;
  frontSectorId: number;
  backSectorId?: number;
  isTwoSided: boolean;
  wallQbitMask: QbitShaderMask;
}

export interface HeritageE1M1Archive {
  hash: string;
  sectors: HeritageSector[];
  linedefs: HeritageLinedef[];
  entities: HeritageEntity[];
  hull: SplineHull;
  anchors: TetherAnchor[];
  timestamp: number;
}

// Organelle 0xC4_COVALENT: Bare-Metal Scaling Matrix & Unified Boot Types
export type ScalingSubstrateMode = 'MINIMUM_SUBSTRATE' | 'INFINITE_SCALING_PARITY';

export interface ScalingMatrixRow {
  parameter: 'Silicon Requirements' | 'Memory / Storage' | 'Render Engine';
  minimumSubstrate: string;
  infiniteScalingParity: string;
  activeStatus: string;
}

export interface GAME_DATA_lump_t {
  name: string;
  byteLength: number;
  recordsCount: number;
  checksumQ16: number;
  rawBytes?: Uint8Array;
}

export interface BVHNode4D {
  id: string;
  min: FloatVector4D;
  max: FloatVector4D;
  isLeaf: boolean;
  entityId?: string;
  children?: [BVHNode4D, BVHNode4D];
}

export interface C4BootSequenceState {
  isBooting: boolean;
  currentStep: number; // 0: Idle, 1: Substrate Init, 2: BSP Transpilation, 3: Entity Ledger, 4: BVH Recalculation, 5: Complete
  stepLabels: [string, string, string, string];
  stepDetails: [string, string, string, string];
  completedSteps: boolean[];
  bootTimestamp: number;
  invariantParity: boolean; // 1 === 1 validated
  substrateMode: ScalingSubstrateMode;
  ramUsageMB: number;
  storageUsageMB: number;
  bvhNodesCount: number;
  causticsFlux: number;
  voronoiCellCount: number;
}

// Organelle 0xC5_COVALENT: Exogenous Git Ingestion & Heritage Sieve Dashboard
export type TranspilationPhase = 
  | 'IDLE' 
  | 'LEGACY_PARSING' 
  | 'Z_LOFTING' 
  | 'W_AXIS_INJECTION' 
  | 'QBIT_MASKING' 
  | 'ASSIMILATED' 
  | 'COLLAPSE';

export type LegacyArchitectureType = 
  | 'BSP_2_5D' 
  | 'BSP_3D_VIS' 
  | 'DYNAMIC_OCTREE' 
  | 'SDF_RAYMARCH' 
  | 'UNKNOWN';

export interface PreLoadedRepositoryCatalyst {
  id: string;
  gitUrl: string;
  title: string;
  originalArchitecture: string;
  covalentResult: string;
  architectureType: LegacyArchitectureType;
  badgeColor: string;
  summary: string;
  mathematicalDetail: string;
  suggestedTopology: TopologyType;
  byteSize: number;
}

export interface GitBufferData {
  gitUrl: string;
  repoName: string;
  commitHash: string;
  byteLength: number;
  treeNodesCount: number;
  lumpSignatures: string[];
  inferredArchitecture: LegacyArchitectureType;
  rawPayloadSample: string;
}

export interface TranspilationMatrixState {
  activePhase: TranspilationPhase;
  phaseProgress: {
    LEGACY_PARSING: number;
    Z_LOFTING: number;
    W_AXIS_INJECTION: number;
    QBIT_MASKING: number;
  };
  currentLog: string[];
  gitBufferBytes: number;
  quipuLedgerHash: string;
  detectedArchitecture: string;
  activeRepoUrl: string;
  nodesTranspiled: number;
  hyperspheresBound: number;
  invariantStatus: string;
  isStreaming: boolean;
  activeCatalystId?: string;
}

export interface ExogenousIngestEvent {
  timestamp: number;
  stage: TranspilationPhase;
  message: string;
  gitUrl: string;
  architecture: string;
}


