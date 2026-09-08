/**
 * Organelle 0xC5_COVALENT: Exogenous Git Ingestion & Transpilation Pipeline
 * 
 * Target: Evaluates incoming repository file structures, fetches raw git buffers into
 * the Quipu Ledger's memory buffer, and pipes data through mathematical filters:
 * (Legacy Parsing -> Z-Lofting -> W-Axis Injection -> Qbit Masking)
 * 
 * Core Invariant: 1 === 1 (Absolute Mathematical Parity)
 * Substrate: Bare-Metal Ring-0 /dev/fb Vector Framebuffer (<16MB RAM)
 */

import { 
  GitBufferData, 
  TranspilationMatrixState, 
  PreLoadedRepositoryCatalyst, 
  LegacyArchitectureType, 
  TopologyType 
} from '../types';
import { floatToQ16 } from './q16';

export const PRELOADED_REPOSITORY_CATALYSTS: PreLoadedRepositoryCatalyst[] = [
  {
    id: 'freedoom',
    gitUrl: 'chocolate-doom/freedoom.git',
    title: 'Freedoom Phase 1 & 2',
    originalArchitecture: '2.5D Binary Space Partition (BSP)',
    covalentResult: 'Volumetric Spline: Legacy Z-heights mathematically lofted. Sprites converted to 4D hyperspheres bound to dV/dt friction.',
    architectureType: 'BSP_2_5D',
    badgeColor: 'cyan',
    summary: 'Lofts 2.5D Doom/Freedoom sectors and flat linedefs into continuous 4D vector splines.',
    mathematicalDetail: 'Z-Lofting: Floor/ceiling Z-planes mapped to Q16.16 vector hull. Sprites bound to bounding hyperspheres (r_h = 24.0) with dV/dt <= 0.',
    suggestedTopology: 'HERITAGE_E1M1_HANGAR',
    byteSize: 18432000
  },
  {
    id: 'quake',
    gitUrl: 'id-Software/Quake.git',
    title: 'Quake I (Slipgate Complex)',
    originalArchitecture: 'True 3D BSP with pre-computed VIS/Lightmaps',
    covalentResult: 'Hyper-Rotational: Lightmaps discarded for real-time CORDIC path-tracing. Legacy teleporters converted into W-axis phase doors.',
    architectureType: 'BSP_3D_VIS',
    badgeColor: 'amber',
    summary: 'Discards static lightmaps; computes dynamic CORDIC caustics and rewires teleporters to 4D phase doors.',
    mathematicalDetail: 'VIS Discarded: Real-time CORDIC path-tracing caustics. Teleporters converted to W-axis phase portals with ΔW = ±50.0 units.',
    suggestedTopology: 'QUAKE_HYPER_ROTATIONAL',
    byteSize: 42106880
  },
  {
    id: 'tesseract',
    gitUrl: 'tesseract-fps/tesseract.git',
    title: 'Tesseract Engine',
    originalArchitecture: 'Dynamic Octree Grid',
    covalentResult: 'Kinetic Shear: Voxel/Octree cubes smoothed into continuous Bézier curves. Cooperative map editing natively translates to kinetic tethering.',
    architectureType: 'DYNAMIC_OCTREE',
    badgeColor: 'emerald',
    summary: 'Transforms discrete octree voxels into continuous smooth Bézier curves bound to cooperative kinetic shear anchors.',
    mathematicalDetail: 'Octree Smoothing: 3D cubic voxel nodes smoothed to parametric Bézier splines (tension 0.45). Cooperative edits map to kinetic shear tethers.',
    suggestedTopology: 'TESSERACT_KINETIC_SHEAR',
    byteSize: 26214400
  },
  {
    id: 'marble_marcher',
    gitUrl: 'CodeParade/MarbleMarcher.git',
    title: 'Marble Marcher (Fractal Physics)',
    originalArchitecture: 'GPU-Accelerated Signed Distance Fields (SDF)',
    covalentResult: 'Bare-Metal Fractal: Float math ported to Q16.16 integer CORDIC. Infinite terrain manipulated by gravitational BH* singularities.',
    architectureType: 'SDF_RAYMARCH',
    badgeColor: 'fuchsia',
    summary: 'Ports GPU floating-point distance estimators to integer Q16.16 CORDIC, warped by central BH* singularity.',
    mathematicalDetail: 'SDF Integer Port: Raymarched distance estimation evaluated via Q16.16 lookup table. Warped by Kerr metric singularity with mass 0x00A00000.',
    suggestedTopology: 'MARBLE_MARCHER_FRACTAL',
    byteSize: 15728640
  }
];

/**
 * Simulates low-level Git-Pipe cloning directly into Quipu Ledger's memory buffer
 */
export async function sys_covalent_fetch_git_buffer(gitUrl: string): Promise<GitBufferData> {
  const cleanUrl = gitUrl.trim().toLowerCase();
  
  // Extract repository name
  const segments = cleanUrl.replace('.git', '').split('/');
  const repoName = segments[segments.length - 1] || 'exogenous_target';

  // Generate deterministic commit hash from URL
  let hashVal = 0x811c9dc5;
  for (let i = 0; i < cleanUrl.length; i++) {
    hashVal ^= cleanUrl.charCodeAt(i);
    hashVal = (hashVal * 0x01000193) >>> 0;
  }
  const commitHash = `0x${hashVal.toString(16).padStart(8, '0').toUpperCase()}`;

  // Check catalyst matches or infer architecture
  let arch: LegacyArchitectureType = 'UNKNOWN';
  let byteLen = 12582912; // ~12 MB
  let lumpSigs: string[] = ['HEAD', 'objects/pack', 'quipu/manifest'];

  if (cleanUrl.includes('freedoom') || cleanUrl.includes('doom') || cleanUrl.includes('wad')) {
    arch = 'BSP_2_5D';
    byteLen = 18432000;
    lumpSigs = ['IWAD', 'THINGS', 'LINEDEFS', 'SIDEDEFS', 'VERTEXES', 'SEGS', 'SSECTORS', 'NODES', 'SECTORS', 'REJECT', 'BLOCKMAP'];
  } else if (cleanUrl.includes('quake') || cleanUrl.includes('vis') || cleanUrl.includes('bsp29')) {
    arch = 'BSP_3D_VIS';
    byteLen = 42106880;
    lumpSigs = ['IBSP_0x1D', 'ENTITIES', 'PLANES', 'MIPTEXT', 'VERTICES', 'VISIBILITY', 'NODES', 'TEXINFO', 'FACES', 'LIGHTING', 'CLIPNODES', 'LEAVES'];
  } else if (cleanUrl.includes('tesseract') || cleanUrl.includes('sauerbraten') || cleanUrl.includes('octree')) {
    arch = 'DYNAMIC_OCTREE';
    byteLen = 26214400;
    lumpSigs = ['OCTREE_V1', 'CUBE_ROOT', 'MAPMODELS', 'ENTITIES', 'TEXTURE_SLOTS', 'LIGHTMAP_OCTANTS', 'WAYPOINTS'];
  } else if (cleanUrl.includes('marble') || cleanUrl.includes('sdf') || cleanUrl.includes('marching') || cleanUrl.includes('fractal')) {
    arch = 'SDF_RAYMARCH';
    byteLen = 15728640;
    lumpSigs = ['SDF_SCENE_MAP', 'DISTANCE_ESTIMATOR_HLSL', 'FRACTAL_PARAMS', 'COLLISION_SDF', 'CORDIC_Q16_LUT'];
  } else {
    // Arbitrary git repo: attempt pattern matching or default to BSP_2_5D
    if (cleanUrl.includes('bsp') || cleanUrl.includes('2d')) {
      arch = 'BSP_2_5D';
    } else if (cleanUrl.includes('3d') || cleanUrl.includes('mesh')) {
      arch = 'BSP_3D_VIS';
    } else if (cleanUrl.includes('voxel') || cleanUrl.includes('grid')) {
      arch = 'DYNAMIC_OCTREE';
    } else {
      arch = 'BSP_2_5D'; // Default fallback analog
    }
  }

  return {
    gitUrl,
    repoName,
    commitHash,
    byteLength: byteLen,
    treeNodesCount: Math.floor(byteLen / 4096),
    lumpSignatures: lumpSigs,
    inferredArchitecture: arch,
    rawPayloadSample: `GIT_PACK_0x${commitHash}_${lumpSigs.slice(0, 3).join('_')}`
  };
}

export function sys_covalent_detect_legacy_wad(rawData: GitBufferData): boolean {
  return rawData.inferredArchitecture === 'BSP_2_5D' ||
    rawData.lumpSignatures.includes('LINEDEFS') ||
    rawData.lumpSignatures.includes('SECTORS');
}

export function sys_covalent_detect_quake_bsp(rawData: GitBufferData): boolean {
  return rawData.inferredArchitecture === 'BSP_3D_VIS' ||
    rawData.lumpSignatures.includes('IBSP_0x1D') ||
    rawData.lumpSignatures.includes('VISIBILITY');
}

export function sys_covalent_detect_octree(rawData: GitBufferData): boolean {
  return rawData.inferredArchitecture === 'DYNAMIC_OCTREE' ||
    rawData.lumpSignatures.includes('OCTREE_V1') ||
    rawData.lumpSignatures.includes('CUBE_ROOT');
}

export function sys_covalent_detect_sdf(rawData: GitBufferData): boolean {
  return rawData.inferredArchitecture === 'SDF_RAYMARCH' ||
    rawData.lumpSignatures.includes('SDF_SCENE_MAP') ||
    rawData.lumpSignatures.includes('CORDIC_Q16_LUT');
}

export function sys_covalent_transpile_wad_to_4d(rawData: GitBufferData) {
  const sectorsCount = 28;
  const linedefsCount = 142;
  const thingsCount = 18;
  return {
    success: true,
    transpilationType: 'VOLUMETRIC_SPLINE',
    sectorsLofted: sectorsCount,
    linedefsConverted: linedefsCount,
    hyperspheresBound: thingsCount,
    quipuLedgerHash: `0xWAD_${floatToQ16(thingsCount).toString(16).toUpperCase()}`,
    qbitMask: 'QBIT_HEX_TECH_ALBEDO',
    suggestedTopology: 'HERITAGE_E1M1_HANGAR' as TopologyType
  };
}

export function sys_covalent_transpile_quake_bsp_to_4d(rawData: GitBufferData) {
  const facesCount = 64;
  const portalsCount = 2; // W-Axis Phase Doors
  return {
    success: true,
    transpilationType: 'HYPER_ROTATIONAL_VIS_DISCARDED',
    facesTranspiled: facesCount,
    phaseDoorsBound: portalsCount,
    causticsFlux: 0.88,
    quipuLedgerHash: `0xQ1_${floatToQ16(facesCount).toString(16).toUpperCase()}`,
    qbitMask: 'GOTHIC_SLIPGATE_OBSIDIAN',
    suggestedTopology: 'QUAKE_HYPER_ROTATIONAL' as TopologyType
  };
}

export function sys_covalent_transpile_octree_to_spline(rawData: GitBufferData) {
  const voxelNodesSmoothed = 128;
  const kineticTethers = 4;
  return {
    success: true,
    transpilationType: 'KINETIC_SHEAR_BEZIER_SMOOTHED',
    voxelsSmoothed: voxelNodesSmoothed,
    kineticTethersBound: kineticTethers,
    quipuLedgerHash: `0xOCT_${floatToQ16(voxelNodesSmoothed).toString(16).toUpperCase()}`,
    qbitMask: 'OCTREE_SMOOTHED_BEZIER',
    suggestedTopology: 'TESSERACT_KINETIC_SHEAR' as TopologyType
  };
}

export function sys_covalent_port_float_to_q16(rawData: GitBufferData) {
  const lutPoints = 512;
  const singularityMass = 0x00A00000;
  return {
    success: true,
    transpilationType: 'BARE_METAL_FRACTAL_CORDIC_Q16',
    cordicLutPoints: lutPoints,
    singularityBound: true,
    singularityMass,
    quipuLedgerHash: `0xSDF_${singularityMass.toString(16).toUpperCase()}`,
    qbitMask: 'Q16_RAYMARCHED_FRACTAL',
    suggestedTopology: 'MARBLE_MARCHER_FRACTAL' as TopologyType
  };
}

export type TranspilationCallback = (state: TranspilationMatrixState, targetTopology?: TopologyType) => void;

/**
 * Organelle 0xC5: HeritageTerminal (Exogenous Git Ingestion Router)
 */
export class HeritageTerminal {
  public state: TranspilationMatrixState = {
    activePhase: 'IDLE',
    phaseProgress: {
      LEGACY_PARSING: 0,
      Z_LOFTING: 0,
      W_AXIS_INJECTION: 0,
      QBIT_MASKING: 0
    },
    currentLog: [
      '[ FORGE ] Heritage Terminal ready for raw .git pipe ingestion.',
      '[ SIEVE ] Memory buffer allocated: 64MB Direct DMA ring-0.',
      '[ 1 === 1 ] Absolute mathematical parity invariant locked.'
    ],
    gitBufferBytes: 0,
    quipuLedgerHash: '0x811C9DC5',
    detectedArchitecture: 'STANDBY',
    activeRepoUrl: '',
    nodesTranspiled: 0,
    hyperspheresBound: 0,
    invariantStatus: '1 === 1',
    isStreaming: false
  };

  private listeners: TranspilationCallback[] = [];

  public subscribe(cb: TranspilationCallback): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify(targetTopology?: TopologyType): void {
    this.listeners.forEach(cb => cb({ ...this.state }, targetTopology));
  }

  private addLog(msg: string): void {
    this.state.currentLog = [...this.state.currentLog.slice(-14), msg];
  }

  /**
   * Main Directive Method: ingestRepository
   * Evaluates incoming repository file structure and pipes raw data through mathematical filters.
   */
  public async ingestRepository(gitUrl: string): Promise<TopologyType | null> {
    if (!gitUrl || gitUrl.trim() === '') {
      this.addLog('[ ERROR ] Empty git repository URL supplied.');
      this.notify();
      return null;
    }

    const cleanUrl = gitUrl.trim();
    this.state.isStreaming = true;
    this.state.activeRepoUrl = cleanUrl;
    this.state.activePhase = 'LEGACY_PARSING';
    this.state.phaseProgress = {
      LEGACY_PARSING: 15,
      Z_LOFTING: 0,
      W_AXIS_INJECTION: 0,
      QBIT_MASKING: 0
    };

    console.log(`[ FORGE ] Cloning exogenous geometry: ${cleanUrl}`);
    this.addLog(`[ FORGE ] Cloning exogenous geometry: ${cleanUrl}`);
    this.notify();

    await new Promise(r => setTimeout(r, 220));

    // 1. Fetch raw git buffer into Quipu Ledger memory
    const rawData = await sys_covalent_fetch_git_buffer(cleanUrl);
    this.state.gitBufferBytes = rawData.byteLength;
    this.state.quipuLedgerHash = rawData.commitHash;
    this.state.detectedArchitecture = rawData.inferredArchitecture;
    this.state.phaseProgress.LEGACY_PARSING = 100;
    this.addLog(`[ QUIPU ] Raw git buffer ingested: ${(rawData.byteLength / (1024 * 1024)).toFixed(1)}MB (${rawData.treeNodesCount} tree objects)`);
    this.notify();

    await new Promise(r => setTimeout(r, 200));

    let resultTopology: TopologyType = 'HERITAGE_E1M1_HANGAR';

    // Route to specific mathematical transpiler based on architecture
    if (sys_covalent_detect_legacy_wad(rawData)) {
      console.log(`[ SIEVE ] 2.5D BSP detected. Initiating Z-Loft...`);
      this.addLog(`[ SIEVE ] 2.5D BSP detected. Initiating Z-Loft...`);
      this.state.activePhase = 'Z_LOFTING';
      this.state.phaseProgress.Z_LOFTING = 50;
      this.notify();

      await new Promise(r => setTimeout(r, 200));
      this.state.phaseProgress.Z_LOFTING = 100;
      this.state.activePhase = 'W_AXIS_INJECTION';
      this.state.phaseProgress.W_AXIS_INJECTION = 60;
      this.addLog(`[ W-INJECT ] Anchoring legacy floor/ceiling vertices to Phase W=0.`);
      this.notify();

      await new Promise(r => setTimeout(r, 200));
      const wadRes = sys_covalent_transpile_wad_to_4d(rawData);
      this.state.nodesTranspiled = wadRes.linedefsConverted;
      this.state.hyperspheresBound = wadRes.hyperspheresBound;
      this.state.phaseProgress.W_AXIS_INJECTION = 100;
      this.state.activePhase = 'QBIT_MASKING';
      this.state.phaseProgress.QBIT_MASKING = 70;
      this.addLog(`[ QBIT ] Binding ${wadRes.hyperspheresBound} monster/prop sprites to 4D hyperspheres (dV/dt <= 0 friction).`);
      this.notify();

      await new Promise(r => setTimeout(r, 200));
      this.state.phaseProgress.QBIT_MASKING = 100;
      resultTopology = wadRes.suggestedTopology;

    } else if (sys_covalent_detect_quake_bsp(rawData)) {
      console.log(`[ SIEVE ] True 3D BSP detected. Initiating Hyper-Rotational transpile...`);
      this.addLog(`[ SIEVE ] True 3D BSP with pre-computed VIS detected.`);
      this.state.activePhase = 'Z_LOFTING';
      this.state.phaseProgress.Z_LOFTING = 100;
      this.notify();

      await new Promise(r => setTimeout(r, 200));
      this.state.activePhase = 'W_AXIS_INJECTION';
      this.state.phaseProgress.W_AXIS_INJECTION = 50;
      this.addLog(`[ SIEVE ] Converting static VIS teleporters into W-axis phase doors (ΔW = ±50).`);
      this.notify();

      await new Promise(r => setTimeout(r, 200));
      this.state.phaseProgress.W_AXIS_INJECTION = 100;
      this.state.activePhase = 'QBIT_MASKING';
      this.state.phaseProgress.QBIT_MASKING = 60;
      this.addLog(`[ CORDIC ] Discarding static lightmaps -> real-time CORDIC path-tracing caustics active.`);
      this.notify();

      await new Promise(r => setTimeout(r, 200));
      const qRes = sys_covalent_transpile_quake_bsp_to_4d(rawData);
      this.state.nodesTranspiled = qRes.facesTranspiled;
      this.state.hyperspheresBound = qRes.phaseDoorsBound;
      this.state.phaseProgress.QBIT_MASKING = 100;
      resultTopology = qRes.suggestedTopology;

    } else if (sys_covalent_detect_octree(rawData)) {
      console.log(`[ SIEVE ] Octree detected. Smoothing to Vector Splines...`);
      this.addLog(`[ SIEVE ] Dynamic Octree Grid detected. Smoothing to Vector Splines...`);
      this.state.activePhase = 'Z_LOFTING';
      this.state.phaseProgress.Z_LOFTING = 70;
      this.notify();

      await new Promise(r => setTimeout(r, 200));
      this.state.phaseProgress.Z_LOFTING = 100;
      this.state.activePhase = 'W_AXIS_INJECTION';
      this.state.phaseProgress.W_AXIS_INJECTION = 80;
      this.addLog(`[ KINETIC SHEAR ] Cooperative map editing natively translates to kinetic tethering.`);
      this.notify();

      await new Promise(r => setTimeout(r, 200));
      const octRes = sys_covalent_transpile_octree_to_spline(rawData);
      this.state.nodesTranspiled = octRes.voxelsSmoothed;
      this.state.hyperspheresBound = octRes.kineticTethersBound;
      this.state.phaseProgress.W_AXIS_INJECTION = 100;
      this.state.activePhase = 'QBIT_MASKING';
      this.state.phaseProgress.QBIT_MASKING = 100;
      resultTopology = octRes.suggestedTopology;

    } else if (sys_covalent_detect_sdf(rawData)) {
      console.log(`[ SIEVE ] SDF detected. Porting float to Q16.16 CORDIC...`);
      this.addLog(`[ SIEVE ] GPU SDF detected. Porting float math to Q16.16 integer CORDIC...`);
      this.state.activePhase = 'Z_LOFTING';
      this.state.phaseProgress.Z_LOFTING = 100;
      this.notify();

      await new Promise(r => setTimeout(r, 200));
      this.state.activePhase = 'W_AXIS_INJECTION';
      this.state.phaseProgress.W_AXIS_INJECTION = 90;
      this.addLog(`[ BH* SINGULARITY ] Infinite terrain warped by central BH* singularity.`);
      this.notify();

      await new Promise(r => setTimeout(r, 200));
      const sdfRes = sys_covalent_port_float_to_q16(rawData);
      this.state.nodesTranspiled = sdfRes.cordicLutPoints;
      this.state.hyperspheresBound = 1;
      this.state.phaseProgress.W_AXIS_INJECTION = 100;
      this.state.activePhase = 'QBIT_MASKING';
      this.state.phaseProgress.QBIT_MASKING = 100;
      resultTopology = sdfRes.suggestedTopology;

    } else {
      console.warn(`[ 1 !== 1 ] Mathematical anomaly. Topological collapse.`);
      this.addLog(`[ 1 !== 1 ] Mathematical anomaly. Topological collapse.`);
      this.state.activePhase = 'COLLAPSE';
      this.state.invariantStatus = '1 !== 1 (COLLAPSED)';
      this.state.isStreaming = false;
      this.notify();
      return null;
    }

    console.log(`[ 1 === 1 ] Repository assimilated. Ready for W-Axis injection.`);
    this.addLog(`[ 1 === 1 ] Repository assimilated into Quipu Ledger. Topology: ${resultTopology}`);
    this.state.activePhase = 'ASSIMILATED';
    this.state.invariantStatus = '1 === 1 (VALIDATED)';
    this.state.isStreaming = false;
    this.notify(resultTopology);

    return resultTopology;
  }
}

export const heritageTerminal = new HeritageTerminal();
