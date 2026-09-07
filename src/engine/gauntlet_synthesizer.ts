/**
 * Organelle 0xC0_COVALENT: The Continuous Tri-State Gauntlet
 * node_0xGAUNTLET_SYNTHESIZER.ts
 *
 * Synthesizes a towering 4D hyper-structure manifold spanning 3 distinct sectors.
 * Rather than selecting a mode from a menu, the bounding sphere crossing specific
 * Q16.16 volumetric thresholds triggers instantaneous, zero-latency parameter
 * hot-swapping without dropping a single Ring-0 tick.
 *
 * Sector I. The Ascent:   0x00 (Coach)   - Kinetic Calibration (The Pacer)
 * Sector II. The Breach:  0x01 (Co-Op)   - Constructive Resonance (The Multiplier)
 * Sector III. The Apex:   0xFF (Unbound) - Thermodynamic Duel (The Absolute)
 */

import {
  SplineControlPoint,
  SplineHull,
  TetherAnchor,
  MathematicalGate,
  GauntletSectorInfo,
  VectorQuadbitArchive
} from '../types';
import { floatToQ16 } from './q16';

// Q16.16 Volumetric Ceilings
export const SECTOR_ONE_CEILING_FLOAT = 40.0;
export const SECTOR_TWO_CEILING_FLOAT = 260.0;
export const SECTOR_APEX_CEILING_FLOAT = 440.0;

export const SECTOR_ONE_CEILING_Q16 = floatToQ16(SECTOR_ONE_CEILING_FLOAT);   // 0x00280000
export const SECTOR_TWO_CEILING_Q16 = floatToQ16(SECTOR_TWO_CEILING_FLOAT);   // 0x01040000
export const SECTOR_APEX_CEILING_Q16 = floatToQ16(SECTOR_APEX_CEILING_FLOAT); // 0x01B80000

export class AutopoieticGauntletGenerator {
  public latestArchive: VectorQuadbitArchive | null = null;
  public isCompiled: boolean = false;
  public logs: string[] = [];

  constructor() {
    this.compileSeamlessTrialSync();
  }

  /**
   * Compiles the continuous track spanning all 3 difficulty tiers
   */
  public async compileSeamlessTrial(): Promise<VectorQuadbitArchive> {
    this.log('[ FORGE ] Synthesizing Tri-State Gauntlet...');
    
    // 1. Generate continuous 4D vector splines spanning all 3 difficulty tiers
    const qbitAscent = this.sys_covalent_carve_coach_sector();
    const qbitBreach = this.sys_covalent_carve_coop_tesseract();
    const qbitApex = this.sys_covalent_carve_unbound_arena();

    // 2. Stitch the Q16.16 boundaries into a single continuous Quipu hash
    const gauntletArchive = this.sys_covalent_pack_vector_quadbit(qbitAscent, qbitBreach, qbitApex);

    this.sys_covalent_mount_qbit_to_engine(gauntletArchive);
    this.log('[ 1 === 1 ] Gauntlet locked. Ready for Ring-0 boot.');
    return gauntletArchive;
  }

  public compileSeamlessTrialSync(): VectorQuadbitArchive {
    this.log('[ FORGE ] Synthesizing Tri-State Gauntlet (Synchronous Kernel Boot)...');
    const qbitAscent = this.sys_covalent_carve_coach_sector();
    const qbitBreach = this.sys_covalent_carve_coop_tesseract();
    const qbitApex = this.sys_covalent_carve_unbound_arena();

    const gauntletArchive = this.sys_covalent_pack_vector_quadbit(qbitAscent, qbitBreach, qbitApex);
    this.sys_covalent_mount_qbit_to_engine(gauntletArchive);
    return gauntletArchive;
  }

  /**
   * Sector I: The Ascent (0x00 Coach) - Kinetic Calibration
   * A vertically collapsing 3D shaft with rhythmic mathematical gates.
   */
  public sys_covalent_carve_coach_sector(): { hull: SplineHull; anchors: TetherAnchor[]; gates: MathematicalGate[] } {
    const points: SplineControlPoint[] = [];
    const gates: MathematicalGate[] = [];
    const anchors: TetherAnchor[] = [];

    const centerX = 450;
    const centerY = 350;

    // 4 closing mathematical gates along the vertical shaft
    const gateDefs = [
      { z: -180, reqW: -12.0, outerR: 160, aptR: 62, label: 'GATE 0x01: KINETIC CALIBRATION' },
      { z: -110, reqW: 0.0,   outerR: 145, aptR: 54, label: 'GATE 0x02: PHASE-SLIP ALIGNMENT' },
      { z: -40,  reqW: 12.0,  outerR: 130, aptR: 48, label: 'GATE 0x03: HYPER-AXIS TRANSLATION' },
      { z: 20,   reqW: 0.0,   outerR: 115, aptR: 40, label: 'GATE 0x04: APERTURE PINCH' },
    ];

    gateDefs.forEach((gd, idx) => {
      gates.push({
        id: `gate_${idx + 1}`,
        z: gd.z,
        outerRadius: gd.outerR,
        apertureRadius: gd.aptR,
        requiredWPhase: gd.reqW,
        label: gd.label,
        cleared: false,
        pulsePhase: 0
      });

      // Shaft sling anchors around the gate perimeter for vertical slingshots
      const ringAnchors = 4;
      for (let k = 0; k < ringAnchors; k++) {
        const ang = (k / ringAnchors) * Math.PI * 2 + (idx * 0.4);
        anchors.push({
          id: `ascent_anchor_g${idx + 1}_${k}`,
          x: centerX + Math.cos(ang) * (gd.outerR * 0.95),
          y: centerY + Math.sin(ang) * (gd.outerR * 0.95),
          z: gd.z,
          type: 'THERMODYNAMIC_WELL',
          radius: 14,
          energyValue: 80,
          active: true
        });
      }
    });

    // Shaft vertical spine points
    const zSteps = [-240, -200, -160, -120, -80, -40, 0, 40];
    zSteps.forEach((z, i) => {
      // Taper radius upwards to emulate a collapsing shaft
      const t = i / (zSteps.length - 1);
      const rad = 175 - t * 65; // from 175 down to 110
      const ringPts = 8;
      for (let j = 0; j < ringPts; j++) {
        const ang = (j / ringPts) * Math.PI * 2;
        const px = centerX + Math.cos(ang) * rad;
        const py = centerY + Math.sin(ang) * rad;
        points.push({
          id: `ascent_pt_${i}_${j}`,
          baseX: px,
          baseY: py,
          baseZ: z,
          x: px,
          y: py,
          z: z,
          vx: 0,
          vy: 0,
          vz: 0,
          mass: 1.0
        });
      }
    });

    return {
      hull: {
        id: 'gauntlet_ascent_hull',
        points,
        color: '#06b6d4',
        tension: 0.5,
        friction: 0.008, // Baseline smooth friction for calibration
      },
      anchors,
      gates
    };
  }

  /**
   * Sector II: The Breach (0x01 Co-Op) - Constructive Resonance
   * The shaft explodes outward into a heavy-friction 4D Tesseract packed with 4D daemons.
   */
  public sys_covalent_carve_coop_tesseract(): { hull: SplineHull; anchors: TetherAnchor[] } {
    const points: SplineControlPoint[] = [];
    const anchors: TetherAnchor[] = [];
    const centerX = 450;
    const centerY = 350;

    // Expanded chamber radius (from 110 at breach up to 320 in the chamber)
    const chamberZ = [40, 100, 160, 210, 260];
    chamberZ.forEach((z, i) => {
      const isMiddle = i === 2;
      const rad = isMiddle ? 310 : 250;
      const count = 12;
      for (let j = 0; j < count; j++) {
        const ang = (j / count) * Math.PI * 2;
        const px = centerX + Math.cos(ang) * rad;
        const py = centerY + Math.sin(ang) * rad;
        points.push({
          id: `breach_pt_${i}_${j}`,
          baseX: px,
          baseY: py,
          baseZ: z,
          x: px,
          y: py,
          z: z,
          vx: 0,
          vy: 0,
          vz: 0,
          mass: 1.0
        });
      }
    });

    // 4 High-Stress Constructive Resonance Nodes inside the heavy-friction Tesseract
    const resoNodes = [
      { x: centerX - 140, y: centerY - 140, z: 120, label: 'RESONANCE NODE ALPHA' },
      { x: centerX + 140, y: centerY - 140, z: 180, label: 'RESONANCE NODE BETA' },
      { x: centerX + 140, y: centerY + 140, z: 120, label: 'RESONANCE NODE GAMMA' },
      { x: centerX - 140, y: centerY + 140, z: 180, label: 'RESONANCE NODE DELTA' },
    ];

    resoNodes.forEach((node, idx) => {
      anchors.push({
        id: `breach_reso_anchor_${idx + 1}`,
        x: node.x,
        y: node.y,
        z: node.z,
        type: 'THERMODYNAMIC_WELL',
        radius: 20,
        energyValue: 140,
        active: true
      });
    });

    return {
      hull: {
        id: 'gauntlet_breach_hull',
        points,
        color: '#10b981',
        tension: 0.72,
        friction: 0.024, // Heavy-friction Tesseract
      },
      anchors
    };
  }

  /**
   * Sector III: The Apex (0xFF Unbound) - Thermodynamic Duel
   * Towering apex hyper-arena platform. Latency buffer zeroed.
   */
  public sys_covalent_carve_unbound_arena(): { hull: SplineHull; anchors: TetherAnchor[] } {
    const points: SplineControlPoint[] = [];
    const anchors: TetherAnchor[] = [];
    const centerX = 450;
    const centerY = 350;

    // Apex Platform (Z = 260 to 440)
    const apexZ = [260, 310, 360, 420];
    apexZ.forEach((z, i) => {
      const rad = 280 - i * 25; // Octagonal crown platform
      const count = 8;
      for (let j = 0; j < count; j++) {
        const ang = (j / count) * Math.PI * 2;
        const px = centerX + Math.cos(ang) * rad;
        const py = centerY + Math.sin(ang) * rad;
        points.push({
          id: `apex_pt_${i}_${j}`,
          baseX: px,
          baseY: py,
          baseZ: z,
          x: px,
          y: py,
          z: z,
          vx: 0,
          vy: 0,
          vz: 0,
          mass: 1.0
        });
      }
    });

    // Apex Crown Thermodynamic Core & Dissipation Anchors
    anchors.push({
      id: 'apex_crown_core',
      x: centerX,
      y: centerY,
      z: 360,
      type: 'CORE',
      radius: 26,
      energyValue: 250,
      active: true
    });

    // 4 Symmetrical Dissipation Perimeter Pylons
    const pylonAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
    pylonAngles.forEach((ang, i) => {
      anchors.push({
        id: `apex_pylon_${i + 1}`,
        x: centerX + Math.cos(ang) * 210,
        y: centerY + Math.sin(ang) * 210,
        z: 320,
        type: 'THERMODYNAMIC_WELL',
        radius: 18,
        energyValue: 160,
        active: true
      });
    });

    return {
      hull: {
        id: 'gauntlet_apex_hull',
        points,
        color: '#f43f5e',
        tension: 0.85,
        friction: 0.012, // High-speed, unconstrained thermodynamic vacuum
      },
      anchors
    };
  }

  /**
   * Stitches the Q16.16 boundaries into a single continuous Quipu hash
   */
  public sys_covalent_pack_vector_quadbit(
    qbitAscent: { hull: SplineHull; anchors: TetherAnchor[]; gates: MathematicalGate[] },
    qbitBreach: { hull: SplineHull; anchors: TetherAnchor[] },
    qbitApex: { hull: SplineHull; anchors: TetherAnchor[] }
  ): VectorQuadbitArchive {
    const sectors: GauntletSectorInfo[] = [
      {
        id: 'SECTOR_I_ASCENT',
        name: 'The Ascent',
        romanNumeral: 'I',
        manifoldState: 'COACH',
        code: '0x00',
        ludicObjective: 'Kinetic Calibration: Navigate a vertically collapsing 3D shaft. Be <> leads as The Pacer, demonstrating exact tethering and W-axis phase-shifts required to slip through closing mathematical gates.',
        beRole: 'The Pacer',
        zMin: -240,
        zMax: SECTOR_ONE_CEILING_FLOAT,
        zCeilingQ16: SECTOR_ONE_CEILING_Q16,
        frictionBaseline: 0.008,
        activeObjectiveCleared: false
      },
      {
        id: 'SECTOR_II_BREACH',
        name: 'The Breach',
        romanNumeral: 'II',
        manifoldState: 'COOP_PEER',
        code: '0x01',
        ludicObjective: 'Constructive Resonance: The shaft opens into a heavy-friction Tesseract packed with 4D daemons. Synchronize kinetic shears with The Multiplier to rip the geometry apart and flush the swarm into the void.',
        beRole: 'The Multiplier',
        zMin: SECTOR_ONE_CEILING_FLOAT,
        zMax: SECTOR_TWO_CEILING_FLOAT,
        zCeilingQ16: SECTOR_TWO_CEILING_Q16,
        frictionBaseline: 0.024,
        activeObjectiveCleared: false
      },
      {
        id: 'SECTOR_III_APEX',
        name: 'The Apex',
        romanNumeral: 'III',
        manifoldState: 'ADVERSARY',
        code: '0xFF',
        ludicObjective: 'Thermodynamic Duel: Latency buffer zeroed. The Absolute immediately hyper-rotates into an aggressive W-axis flank. Bankrupt its ledger before you run out of floor grid.',
        beRole: 'The Absolute',
        zMin: SECTOR_TWO_CEILING_FLOAT,
        zMax: SECTOR_APEX_CEILING_FLOAT,
        zCeilingQ16: SECTOR_APEX_CEILING_Q16,
        frictionBaseline: 0.012,
        activeObjectiveCleared: false
      }
    ];

    const allAnchors = [
      ...qbitAscent.anchors,
      ...qbitBreach.anchors,
      ...qbitApex.anchors
    ];

    const hash = `0xCOVALENT_GAUNTLET_Q16_0x7F2A9B_1to1_PARITY`;

    return {
      hash,
      sectors,
      gates: qbitAscent.gates,
      qbitAscentSplines: qbitAscent.hull,
      qbitBreachTesseract: qbitBreach.hull,
      qbitApexArena: qbitApex.hull,
      anchors: allAnchors,
      timestamp: Date.now()
    };
  }

  public sys_covalent_mount_qbit_to_engine(gauntletArchive: VectorQuadbitArchive): void {
    this.latestArchive = gauntletArchive;
    this.isCompiled = true;
    this.log(`[ 1 === 1 ] Gauntlet archive mounted: ${gauntletArchive.hash}`);
  }

  public log(msg: string): void {
    this.logs.unshift(`[${new Date().toISOString().substring(11, 19)}] ${msg}`);
    if (this.logs.length > 50) this.logs.pop();
  }
}

export const autopoieticGauntlet = new AutopoieticGauntletGenerator();
