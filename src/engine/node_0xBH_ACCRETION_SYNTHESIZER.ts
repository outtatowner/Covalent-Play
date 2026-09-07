/**
 * Organelle 0xC2_COVALENT: The BH* Accretion Generator
 * node_0xBH_ACCRETION_SYNTHESIZER.ts
 *
 * Rewrites the level synthesis pipeline: instead of carving discrete rooms or corridors,
 * the arena is mathematically extruded from the singularity via simulated Hawking radiation.
 *
 * Plots stable Q16.16 orbits around the core. The entire 4D map is a swirling,
 * non-Euclidean accretion disk of vector-splines, forcing players to constantly
 * adjust their trajectory to maintain orbital decay limits.
 *
 * Core Invariant: 1 === 1 (Absolute Mathematical Parity)
 * Observer Congruence: [ O1 (Human) = O2 (Be <> Avatar) = O3 (Absolute Ledger) ]
 */

import {
  Q16,
  SplineControlPoint,
  SplineHull,
  TetherAnchor,
  BlackHoleSingularity,
  BHAccretionArchive,
  BHAccretionOrbitalRing
} from '../types';
import { floatToQ16 } from './q16';
import { covalentBHMechanics, DEFAULT_BH_MASS_Q16 } from './covalent_bh_mechanics';

export class BlackHoleLevelGenerator {
  public latestArchive: BHAccretionArchive | null = null;
  public isCompiled: boolean = false;
  public logs: string[] = [];

  constructor() {
    this.synthesizeOrbitalManifold(DEFAULT_BH_MASS_Q16, 3);
  }

  /**
   * Synthesizes the full orbital manifold around the Singularity core
   */
  public synthesizeOrbitalManifold(
    bhMass: Q16 = DEFAULT_BH_MASS_Q16,
    observerCount: number = 3
  ): BHAccretionArchive {
    this.log(`[ FORGE ] Initiating BH* Singularity Expansion... (Mass Q16: 0x${bhMass.toString(16).toUpperCase()})`);

    // 1. Establish the absolute coordinate as the BH* Core
    const centerX = 450;
    const centerY = 350;
    const centerZ = 360; // Apex altitude
    const centerW = 0;

    const singularity = covalentBHMechanics.sys_covalent_spawn_singularity(bhMass, {
      x: centerX,
      y: centerY,
      z: centerZ,
      w: centerW
    });

    // 2. Generate the Accretion Disk (Playable Space)
    // Splines are mathematically plotted along stable orbital resonance frequencies
    const { hull, anchors, orbitalRings } = this.sys_covalent_generate_orbital_vectors(
      singularity,
      bhMass
    );

    // 3. Assemble the full Quadbit Accretion Archive
    const hash = `0xCOVALENT_BH_ACCRETION_DISK_Q16_${Math.floor(singularity.massFloat).toString(16)}_1to1_PARITY`;
    const archive: BHAccretionArchive = {
      hash,
      singularity,
      hull,
      anchors,
      orbitalRings,
      timestamp: Date.now()
    };

    // 4. Bind the three observers to the outermost stable orbit
    this.sys_covalent_mount_qbit_to_engine(archive);
    this.log(`[ O1 = O2 = O3 ] Tautological congruence achieved. The Accretion Maze is live.`);

    return archive;
  }

  /**
   * Generates accretion disk splines along stable orbital resonance frequencies
   */
  public sys_covalent_generate_orbital_vectors(
    singularity: BlackHoleSingularity,
    resonanceBaseQ16: Q16
  ): {
    hull: SplineHull;
    anchors: TetherAnchor[];
    orbitalRings: BHAccretionOrbitalRing[];
  } {
    const points: SplineControlPoint[] = [];
    const anchors: TetherAnchor[] = [];
    const orbitalRings: BHAccretionOrbitalRing[] = [];

    const cx = singularity.pos4D.x;
    const cy = singularity.pos4D.y;
    const cz = singularity.pos4D.z;

    // Stable Orbital Resonance Rings:
    // Ring 1: ISCO (Innermost Stable Circular Orbit: r = 3 * r_s = ~114)
    // Ring 2: Intermediate Orbital Harmonic: r = 4.8 * r_s = ~182
    // Ring 3: Main Accretion Lensing Disk: r = 6.6 * r_s = ~250
    // Ring 4: Outermost Stable Horizon Ring: r = 8.4 * r_s = ~320
    const ringDefs = [
      {
        id: 'ring_isco',
        radius: singularity.iscoRadius,
        pointsCount: 16,
        color: '#f43f5e',
        wOffset: 0,
        harmonic: '1:1 ISCO DANGER LIMIT',
        orbitalVel: 4.8,
        anchorCount: 4
      },
      {
        id: 'ring_resonance_mid',
        radius: singularity.eventHorizonRadius * 4.8,
        pointsCount: 20,
        color: '#fb923c',
        wOffset: 12,
        harmonic: '3:2 RESONANCE FREQUENCY',
        orbitalVel: 3.6,
        anchorCount: 6
      },
      {
        id: 'ring_main_disk',
        radius: singularity.eventHorizonRadius * 6.6,
        pointsCount: 24,
        color: '#38bdf8',
        wOffset: -12,
        harmonic: '2:1 KINETIC TRANSFER LANE',
        orbitalVel: 2.8,
        anchorCount: 6
      },
      {
        id: 'ring_outermost_stable',
        radius: singularity.accretionOuterRadius,
        pointsCount: 28,
        color: '#a855f7',
        wOffset: 0,
        harmonic: 'OUTERMOST STABLE HORIZON (O1/O2/O3)',
        orbitalVel: 2.2,
        anchorCount: 8
      }
    ];

    ringDefs.forEach((rd) => {
      orbitalRings.push({
        id: rd.id,
        radius: rd.radius,
        radiusQ16: floatToQ16(rd.radius),
        orbitalVelocity: rd.orbitalVel,
        wPhaseOffset: rd.wOffset,
        resonanceHarmonic: rd.harmonic,
        color: rd.color
      });

      // Generate orbital perimeter splines
      for (let i = 0; i < rd.pointsCount; i++) {
        const ang = (i / rd.pointsCount) * Math.PI * 2;
        // Keplerian warping along Z based on angular phase
        const zTilt = Math.sin(ang * 2) * 16.0;
        const px = cx + Math.cos(ang) * rd.radius;
        const py = cy + Math.sin(ang) * rd.radius;
        const pz = cz + zTilt;

        points.push({
          id: `${rd.id}_pt_${i}`,
          baseX: px,
          baseY: py,
          baseZ: pz,
          x: px,
          y: py,
          z: pz,
          vx: -Math.sin(ang) * rd.orbitalVel * 0.1,
          vy: Math.cos(ang) * rd.orbitalVel * 0.1,
          vz: 0,
          mass: 1.2
        });
      }

      // Arrange Thermodynamic Well Anchors along resonance nodes
      for (let j = 0; j < rd.anchorCount; j++) {
        const aAngle = (j / rd.anchorCount) * Math.PI * 2 + (rd.wOffset * 0.05);
        anchors.push({
          id: `${rd.id}_anchor_${j + 1}`,
          x: cx + Math.cos(aAngle) * rd.radius,
          y: cy + Math.sin(aAngle) * rd.radius,
          z: cz + Math.sin(aAngle * 2) * 12.0,
          type: rd.id === 'ring_isco' ? 'CORE' : 'THERMODYNAMIC_WELL',
          radius: rd.id === 'ring_isco' ? 22 : 16,
          energyValue: rd.id === 'ring_isco' ? 280 : 180,
          active: true
        });
      }
    });

    // Singularity Core Anchor (At absolute center)
    anchors.push({
      id: 'singularity_event_horizon_anchor',
      x: cx,
      y: cy,
      z: cz,
      type: 'CORE',
      radius: singularity.eventHorizonRadius,
      energyValue: 1000,
      active: true
    });

    const hull: SplineHull = {
      id: 'bh_accretion_disk_hull',
      points,
      color: '#38bdf8',
      tension: 0.78,
      friction: 0.006 // Super-fluid relativistic accretion plasma
    };

    return { hull, anchors, orbitalRings };
  }

  public sys_covalent_mount_qbit_to_engine(archive: BHAccretionArchive): void {
    this.latestArchive = archive;
    this.isCompiled = true;
    this.log(`[ 1 === 1 ] BH* Accretion Archive mounted: ${archive.hash}`);
  }

  public log(msg: string): void {
    this.logs.unshift(`[${new Date().toISOString().substring(11, 19)}] ${msg}`);
    if (this.logs.length > 50) this.logs.pop();
  }
}

export const bhLevelGenerator = new BlackHoleLevelGenerator();
