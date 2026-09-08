/**
 * FORGE: Quadbit Asset Studio -> Real-Time Vector-Spline Arena Generator
 * Handles dynamic geometric deformation inputs, Bézier hulls, and BVH recalculation.
 */

import { SplineHull, SplineControlPoint, TetherAnchor, BoundingBox, TopologyType, BlackHoleSingularity } from '../types';
import { CyberArenaSynthesizer, WELL_OFFSET_Q16 } from './arena_synthesizer';
import { VolumetricArenaSynthesizer } from './omni_axial_arena';
import { autopoieticGauntlet } from './gauntlet_synthesizer';
import { covalentBHMechanics, DEFAULT_BH_MASS_Q16 } from './covalent_bh_mechanics';
import { bhLevelGenerator } from './node_0xBH_ACCRETION_SYNTHESIZER';
import { heritageSieveEngine } from './node_0xHERITAGE_OFFICIATOR';

export type { TopologyType };

export class ArenaForge {
  public hull: SplineHull;
  public anchors: TetherAnchor[] = [];
  public bvh: BoundingBox[] = [];
  public topologyType: TopologyType = 'CONTINUOUS_TRI_STATE_GAUNTLET';
  public singularity: BlackHoleSingularity | null = null;
  public center: { x: number; y: number } = { x: 450, y: 350 };
  public radiusX: number = 320;
  public radiusY: number = 240;
  public synthesizer: CyberArenaSynthesizer = new CyberArenaSynthesizer();
  public volumetricSynthesizer: VolumetricArenaSynthesizer = new VolumetricArenaSynthesizer();

  public tesseractRotor: [number, number, number, number, number, number] = [0, 0, 0, 0.05, 0.03, 0];

  constructor(topology: TopologyType = 'CONTINUOUS_TRI_STATE_GAUNTLET') {
    this.topologyType = topology;
    if (topology === 'CONTINUOUS_TRI_STATE_GAUNTLET') {
      const archive = autopoieticGauntlet.latestArchive || autopoieticGauntlet.compileSeamlessTrialSync();
      this.hull = {
        id: 'continuous_gauntlet_hull',
        color: '#38bdf8',
        points: [
          ...archive.qbitAscentSplines.points,
          ...archive.qbitBreachTesseract.points,
          ...archive.qbitApexArena.points
        ],
        tension: 0.65,
        friction: 0.012
      };
      this.synthesizeContinuousTriStateGauntlet();
    } else if (topology === 'BH_STAR_ACCRETION_DISK') {
      this.hull = {
        id: 'bh_accretion_disk_hull',
        points: [],
        color: '#38bdf8',
        tension: 0.78,
        friction: 0.006
      };
      this.synthesizeBHStarAccretionDisk();
    } else if (topology === 'HERITAGE_E1M1_HANGAR') {
      const archive = heritageSieveEngine.latestArchive || heritageSieveEngine.compileE1M1LoftSync(this.center.x, this.center.y);
      this.hull = archive.hull;
      this.synthesizeHeritageE1M1Hangar();
    } else if (topology === 'THE_NULL_FRICTION_TESSERACT') {
      this.hull = this.volumetricSynthesizer.generateHyperSphere(this.center.x, this.center.y, 0, this.radiusX * 1.1).hull;
      this.synthesizeNullFrictionTesseract();
    } else if (topology === 'ISOTROPIC_HYPER_SPHERE') {
      this.hull = this.volumetricSynthesizer.generateHyperSphere(this.center.x, this.center.y, 0, this.radiusX * 1.1).hull;
      this.synthesizeIsotropicHyperSphere();
    } else {
      this.hull = this.generateHull(topology);
      this.generateAnchors();
      this.recalculateBVH();
    }
  }

  public setTopology(type: TopologyType): void {
    this.topologyType = type;
    if (type === 'CONTINUOUS_TRI_STATE_GAUNTLET') {
      this.synthesizeContinuousTriStateGauntlet();
    } else if (type === 'BH_STAR_ACCRETION_DISK') {
      this.synthesizeBHStarAccretionDisk();
    } else if (type === 'HERITAGE_E1M1_HANGAR') {
      this.synthesizeHeritageE1M1Hangar();
    } else if (type === 'QUAKE_HYPER_ROTATIONAL') {
      this.synthesizeQuakeHyperRotational();
    } else if (type === 'TESSERACT_KINETIC_SHEAR') {
      this.synthesizeTesseractKineticShear();
    } else if (type === 'MARBLE_MARCHER_FRACTAL') {
      this.synthesizeMarbleMarcherFractal();
    } else if (type === 'THE_NULL_FRICTION_TESSERACT') {
      this.synthesizeNullFrictionTesseract();
    } else if (type === 'ISOTROPIC_HYPER_SPHERE') {
      this.synthesizeIsotropicHyperSphere();
    } else if (type === 'NULL_FRICTION_OCTAGON') {
      this.synthesizeNullFrictionOctagon();
    } else {
      this.singularity = null;
      this.hull = this.generateHull(type);
      this.generateAnchors();
      this.recalculateBVH();
    }
  }

  public synthesizeContinuousTriStateGauntlet(): void {
    this.topologyType = 'CONTINUOUS_TRI_STATE_GAUNTLET';
    const archive = autopoieticGauntlet.latestArchive || autopoieticGauntlet.compileSeamlessTrialSync();
    const allPts = [
      ...archive.qbitAscentSplines.points,
      ...archive.qbitBreachTesseract.points,
      ...archive.qbitApexArena.points
    ];
    this.hull = {
      id: 'continuous_gauntlet_hull',
      color: '#38bdf8',
      points: allPts,
      tension: 0.65,
      friction: 0.012
    };
    this.anchors = archive.anchors;

    // Organelle 0xC1 / 0xC2: Mount the BH* Singularity in Sector III (The Apex: Z = 360)
    // The Tri-State Gauntlet now seamlessly culminates in the Singularity!
    this.singularity = covalentBHMechanics.sys_covalent_spawn_singularity(DEFAULT_BH_MASS_Q16, {
      x: this.center.x,
      y: this.center.y,
      z: 360,
      w: 0
    });

    this.recalculateBVH();
  }

  /**
   * Organelle 0xC2_COVALENT: The BH* Accretion Generator
   * Synthesizes the full orbital accretion manifold around the singularity.
   */
  public synthesizeBHStarAccretionDisk(): void {
    this.topologyType = 'BH_STAR_ACCRETION_DISK';
    const archive = bhLevelGenerator.latestArchive || bhLevelGenerator.synthesizeOrbitalManifold(DEFAULT_BH_MASS_Q16, 3);
    this.hull = archive.hull;
    this.anchors = archive.anchors;
    this.singularity = archive.singularity;
    this.recalculateBVH();
  }

  /**
   * Organelle 0xC3_COVALENT: The Heritage Sieve Transpilation
   * Synthesizes 4D lofted E1M1 Hangar geometry from legacy BSP data.
   */
  public synthesizeHeritageE1M1Hangar(): void {
    this.topologyType = 'HERITAGE_E1M1_HANGAR';
    this.singularity = null;
    const archive = heritageSieveEngine.latestArchive || heritageSieveEngine.compileE1M1LoftSync(this.center.x, this.center.y);
    this.hull = archive.hull;
    this.anchors = archive.anchors;
    this.recalculateBVH();
  }

  /**
   * Organelle 0xC5 Transpilation Catalyst 2: id-Software/Quake.git
   * Hyper-Rotational: True 3D BSP with VIS discarded for CORDIC path-tracing.
   * Teleporters converted into W-axis phase doors.
   */
  public synthesizeQuakeHyperRotational(): void {
    this.topologyType = 'QUAKE_HYPER_ROTATIONAL';
    this.singularity = null;
    const pts: SplineControlPoint[] = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      // Gothic polygonal octagonal fortress layout with gothic arched alcoves
      const isAlcove = i % 4 === 1;
      const r = isAlcove ? this.radiusX * 1.25 : this.radiusX * 0.95;
      const zOffset = isAlcove ? 80 : -20;
      const bx = this.center.x + Math.cos(angle) * r;
      const by = this.center.y + Math.sin(angle) * r;
      pts.push({
        id: `quake_bsp_cp_${i}`,
        baseX: bx,
        baseY: by,
        x: bx,
        y: by,
        z: zOffset,
        vx: 0,
        vy: 0,
        mass: 1.8,
        isAnchor: i % 2 === 0,
        strain: 0
      });
    }

    this.hull = {
      id: 'quake_hyper_rotational_hull',
      points: pts,
      color: '#f59e0b', // Amber Slipgate aesthetic
      tension: 0.22,
      material: 'GOTHIC_SLIPGATE_OBSIDIAN'
    };

    // Teleporters converted to W-Axis Phase Doors!
    this.anchors = [
      {
        id: 'anchor_slipgate_w_alpha',
        x: this.center.x - 140,
        y: this.center.y,
        z: 40,
        w: 50,
        type: 'SLIPGATE_PHASE_DOOR',
        radius: 24,
        energyValue: 200,
        active: true
      },
      {
        id: 'anchor_slipgate_w_beta',
        x: this.center.x + 140,
        y: this.center.y,
        z: 40,
        w: -50,
        type: 'SLIPGATE_PHASE_DOOR',
        radius: 24,
        energyValue: 200,
        active: true
      },
      {
        id: 'anchor_vis_chamber_core',
        x: this.center.x,
        y: this.center.y,
        z: 0,
        w: 0,
        type: 'CORE',
        radius: 20,
        energyValue: 150,
        active: true
      }
    ];

    this.recalculateBVH();
  }

  /**
   * Organelle 0xC5 Transpilation Catalyst 3: tesseract-fps/tesseract.git
   * Kinetic Shear: Dynamic Octree Grid smoothed into continuous Bézier curves.
   * Cooperative map editing natively translates to kinetic tethering.
   */
  public synthesizeTesseractKineticShear(): void {
    this.topologyType = 'TESSERACT_KINETIC_SHEAR';
    this.singularity = null;
    const pts: SplineControlPoint[] = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      // Octree cube smoothed into cubic Bézier curvature
      const cubeWave = 1.0 + 0.22 * Math.cos(4 * angle);
      const bx = this.center.x + Math.cos(angle) * this.radiusX * cubeWave;
      const by = this.center.y + Math.sin(angle) * this.radiusY * cubeWave;
      pts.push({
        id: `tesseract_octree_cp_${i}`,
        baseX: bx,
        baseY: by,
        x: bx,
        y: by,
        z: (i % 2 === 0 ? 30 : -30),
        vx: 0,
        vy: 0,
        mass: 1.4,
        isAnchor: i % 4 === 0,
        strain: 0
      });
    }

    this.hull = {
      id: 'tesseract_kinetic_shear_hull',
      points: pts,
      color: '#10b981', // Emerald Kinetic Shear
      tension: 0.45,
      material: 'OCTREE_SMOOTHED_BEZIER'
    };

    // Cooperative Map Editing Kinetic Tether Anchors
    this.anchors = [
      {
        id: 'anchor_octree_coop_nw',
        x: this.center.x - 110,
        y: this.center.y - 110,
        z: 20,
        w: 0,
        type: 'KINETIC_TETHER_NODE',
        radius: 18,
        energyValue: 100,
        active: true
      },
      {
        id: 'anchor_octree_coop_ne',
        x: this.center.x + 110,
        y: this.center.y - 110,
        z: 20,
        w: 0,
        type: 'KINETIC_TETHER_NODE',
        radius: 18,
        energyValue: 100,
        active: true
      },
      {
        id: 'anchor_octree_coop_se',
        x: this.center.x + 110,
        y: this.center.y + 110,
        z: 20,
        w: 0,
        type: 'KINETIC_TETHER_NODE',
        radius: 18,
        energyValue: 100,
        active: true
      },
      {
        id: 'anchor_octree_coop_sw',
        x: this.center.x - 110,
        y: this.center.y + 110,
        z: 20,
        w: 0,
        type: 'KINETIC_TETHER_NODE',
        radius: 18,
        energyValue: 100,
        active: true
      }
    ];

    this.recalculateBVH();
  }

  /**
   * Organelle 0xC5 Transpilation Catalyst 4: CodeParade/MarbleMarcher.git
   * Bare-Metal Fractal: GPU SDF ported to Q16.16 integer CORDIC.
   * Infinite terrain manipulated by gravitational BH* singularities.
   */
  public synthesizeMarbleMarcherFractal(): void {
    this.topologyType = 'MARBLE_MARCHER_FRACTAL';
    const pts: SplineControlPoint[] = [];
    const count = 20;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      // Mandelbulb/Raymarched SDF harmonic modulation
      const sdfHarmonic = 1.0 + 0.28 * Math.sin(5 * angle) * Math.cos(2 * angle);
      const bx = this.center.x + Math.cos(angle) * this.radiusX * 1.12 * sdfHarmonic;
      const by = this.center.y + Math.sin(angle) * this.radiusY * 1.12 * sdfHarmonic;
      pts.push({
        id: `sdf_fractal_cp_${i}`,
        baseX: bx,
        baseY: by,
        x: bx,
        y: by,
        z: 35 * Math.sin(3 * angle),
        vx: 0,
        vy: 0,
        mass: 2.0,
        isAnchor: i % 5 === 0,
        strain: 0
      });
    }

    this.hull = {
      id: 'marble_marcher_sdf_hull',
      points: pts,
      color: '#ec4899', // Hot Pink / Fractal Neon
      tension: 0.35,
      material: 'Q16_RAYMARCHED_FRACTAL'
    };

    // Gravitational BH* Singularity in the heart of the fractal!
    this.singularity = covalentBHMechanics.sys_covalent_spawn_singularity(0x00A00000, {
      x: this.center.x,
      y: this.center.y,
      z: 0,
      w: 0
    });

    this.anchors = [
      {
        id: 'anchor_sdf_singularity_core',
        x: this.center.x,
        y: this.center.y,
        z: 0,
        w: 0,
        type: 'CORE',
        radius: 26,
        energyValue: 250,
        active: true
      },
      {
        id: 'anchor_sdf_fractal_crest_1',
        x: this.center.x - 130,
        y: this.center.y + 130,
        z: 30,
        w: 0,
        type: 'THERMODYNAMIC_WELL',
        radius: 16,
        energyValue: 120,
        active: true
      },
      {
        id: 'anchor_sdf_fractal_crest_2',
        x: this.center.x + 130,
        y: this.center.y - 130,
        z: -30,
        w: 0,
        type: 'THERMODYNAMIC_WELL',
        radius: 16,
        energyValue: 120,
        active: true
      }
    ];

    this.recalculateBVH();
  }

  public synthesizeNullFrictionTesseract(): void {
    this.topologyType = 'THE_NULL_FRICTION_TESSERACT';
    const res = this.volumetricSynthesizer.generateHyperSphere(
      this.center.x,
      this.center.y,
      0,
      this.radiusX * 1.2
    );
    this.hull = res.hull;
    this.anchors = [
      ...res.anchors,
      {
        id: 'anchor_hyper_w_plus',
        x: this.center.x,
        y: this.center.y,
        z: 60,
        type: 'THERMODYNAMIC_WELL',
        radius: 18,
        energyValue: 120,
        active: true,
      },
      {
        id: 'anchor_hyper_w_minus',
        x: this.center.x,
        y: this.center.y,
        z: -60,
        type: 'THERMODYNAMIC_WELL',
        radius: 18,
        energyValue: 120,
        active: true,
      }
    ];
    this.recalculateBVH();
  }

  public synthesizeIsotropicHyperSphere(): void {
    this.topologyType = 'ISOTROPIC_HYPER_SPHERE';
    const res = this.volumetricSynthesizer.generateHyperSphere(
      this.center.x,
      this.center.y,
      0,
      this.radiusX * 1.15
    );
    this.hull = res.hull;
    this.anchors = res.anchors;
    this.recalculateBVH();
  }

  public synthesizeNullFrictionOctagon(): void {
    this.topologyType = 'NULL_FRICTION_OCTAGON';
    const res = this.synthesizer.generateBaselineGrid(this.center.x, this.center.y, this.radiusX);
    this.hull = res.hull;
    this.anchors = [
      {
        id: 'core_quipu_center',
        x: this.center.x,
        y: this.center.y,
        type: 'CORE',
        radius: 20,
        energyValue: 100,
        active: true
      },
      ...res.wells
    ];
    this.recalculateBVH();
  }

  private generateHull(type: TopologyType): SplineHull {
    if (type === 'ISOTROPIC_HYPER_SPHERE') {
      const res = this.volumetricSynthesizer.generateHyperSphere(this.center.x, this.center.y, 0, this.radiusX * 1.15);
      return res.hull;
    }

    if (type === 'NULL_FRICTION_OCTAGON') {
      const res = this.synthesizer.generateBaselineGrid(this.center.x, this.center.y, this.radiusX);
      return res.hull;
    }

    const points: SplineControlPoint[] = [];
    const count = type === 'HYPER_TOROID' ? 16 : type === 'KLEIN_LATTICE' ? 14 : 12;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      let rX = this.radiusX;
      let rY = this.radiusY;

      if (type === 'HYPER_TOROID') {
        // Double-lobed figure-eight / hourglass curve
        const modulation = 1 + 0.35 * Math.cos(2 * angle);
        rX *= modulation;
        rY *= 0.85 * (1 - 0.25 * Math.sin(2 * angle));
      } else if (type === 'KLEIN_LATTICE') {
        // Multi-faceted geometric polygonal chamber
        const wave = 1 + 0.2 * Math.sin(3 * angle);
        rX *= wave;
        rY *= wave;
      }

      const bx = this.center.x + Math.cos(angle) * rX;
      const by = this.center.y + Math.sin(angle) * rY;

      points.push({
        id: `cp_${i}`,
        baseX: bx,
        baseY: by,
        x: bx,
        y: by,
        vx: 0,
        vy: 0,
        mass: 1.5 + (i % 3) * 0.5,
        isAnchor: i % 3 === 0,
        strain: 0
      });
    }

    return {
      id: `hull_${type}`,
      points,
      color: type === 'HYPER_TOROID' ? '#00e5ff' : type === 'KLEIN_LATTICE' ? '#a855f7' : '#06b6d4',
      tension: 0.12,
      material: 'DEFAULT'
    };
  }

  public generateAnchors(): void {
    this.anchors = [];

    // Center quipu core anchor
    this.anchors.push({
      id: 'core_quipu_center',
      x: this.center.x,
      y: this.center.y,
      type: 'CORE',
      radius: 20,
      energyValue: 100,
      active: true
    });

    if (this.topologyType === 'NULL_FRICTION_OCTAGON') {
      const wellScale = this.radiusX * 0.45;
      this.anchors.push(
        this.synthesizer.sys_covalent_spawn_energy_well(WELL_OFFSET_Q16, WELL_OFFSET_Q16, this.center.x + wellScale, this.center.y + wellScale, 0),
        this.synthesizer.sys_covalent_spawn_energy_well(-WELL_OFFSET_Q16, WELL_OFFSET_Q16, this.center.x - wellScale, this.center.y + wellScale, 1),
        this.synthesizer.sys_covalent_spawn_energy_well(WELL_OFFSET_Q16, -WELL_OFFSET_Q16, this.center.x + wellScale, this.center.y - wellScale, 2),
        this.synthesizer.sys_covalent_spawn_energy_well(-WELL_OFFSET_Q16, -WELL_OFFSET_Q16, this.center.x - wellScale, this.center.y - wellScale, 3)
      );
    } else if (this.topologyType === 'HYPER_TOROID') {
      this.anchors.push(
        { id: 'focus_left', x: this.center.x - 160, y: this.center.y, type: 'RESONANCE_ORB', radius: 14, energyValue: 40, active: true },
        { id: 'focus_right', x: this.center.x + 160, y: this.center.y, type: 'RESONANCE_ORB', radius: 14, energyValue: 40, active: true },
        { id: 'gate_top', x: this.center.x, y: this.center.y - 140, type: 'SPLINE_NODE', radius: 10, energyValue: 25, active: true },
        { id: 'gate_bottom', x: this.center.x, y: this.center.y + 140, type: 'SPLINE_NODE', radius: 10, energyValue: 25, active: true }
      );
    } else if (this.topologyType === 'KLEIN_LATTICE') {
      const orbCount = 5;
      for (let i = 0; i < orbCount; i++) {
        const theta = (i / orbCount) * Math.PI * 2;
        const rad = 130;
        this.anchors.push({
          id: `orb_klein_${i}`,
          x: this.center.x + Math.cos(theta) * rad,
          y: this.center.y + Math.sin(theta) * rad,
          type: 'RESONANCE_ORB',
          radius: 12,
          energyValue: 30,
          active: true
        });
      }
    } else {
      // ALPHA_RING: 4 cardinal orbital nodes
      const offsets = [
        { dx: -150, dy: -60 },
        { dx: 150, dy: -60 },
        { dx: -150, dy: 60 },
        { dx: 150, dy: 60 }
      ];
      offsets.forEach((off, idx) => {
        this.anchors.push({
          id: `alpha_node_${idx}`,
          x: this.center.x + off.dx,
          y: this.center.y + off.dy,
          type: 'RESONANCE_ORB',
          radius: 12,
          energyValue: 35,
          active: true
        });
      });
    }
  }

  /**
   * Recalculates the Bounding Volume Hierarchy (BVH) for all spline segments
   */
  public recalculateBVH(): void {
    const boxes: BoundingBox[] = [];
    const pts = this.hull.points;
    const n = pts.length;

    for (let i = 0; i < n; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];

      const minX = Math.min(p1.x, p2.x) - 10;
      const minY = Math.min(p1.y, p2.y) - 10;
      const maxX = Math.max(p1.x, p2.x) + 10;
      const maxY = Math.max(p1.y, p2.y) + 10;

      boxes.push({ minX, minY, maxX, maxY });
    }

    this.bvh = boxes;
  }

  /**
   * Ticks the elastic spring physics of the hull spline control points
   * Returns control points toward base equilibrium
   */
  public tickHullPhysics(damping: number = 0.88): void {
    const pts = this.hull.points;
    const n = pts.length;

    for (let i = 0; i < n; i++) {
      const p = pts[i];
      // Spring force toward base anchor
      const k = this.hull.tension;
      const fx = (p.baseX - p.x) * k;
      const fy = (p.baseY - p.y) * k;
      const fz = p.baseZ !== undefined && p.z !== undefined ? (p.baseZ - p.z) * k : 0;

      // Neighboring spline tension
      const prev = pts[(i - 1 + n) % n];
      const next = pts[(i + 1) % n];
      const midNeighborX = (prev.x + next.x) * 0.5;
      const midNeighborY = (prev.y + next.y) * 0.5;
      const midNeighborZ = ((prev.z || 0) + (next.z || 0)) * 0.5;
      const smoothingK = 0.05;
      const smoothFx = (midNeighborX - p.x) * smoothingK;
      const smoothFy = (midNeighborY - p.y) * smoothingK;
      const smoothFz = p.z !== undefined ? (midNeighborZ - p.z) * smoothingK : 0;

      p.vx = (p.vx + (fx + smoothFx) / p.mass) * damping;
      p.vy = (p.vy + (fy + smoothFy) / p.mass) * damping;
      if (p.vz !== undefined) {
        p.vz = (p.vz + (fz + smoothFz) / p.mass) * damping;
      }

      p.x += p.vx;
      p.y += p.vy;
      if (p.z !== undefined && p.vz !== undefined) {
        p.z += p.vz;
      }

      // Track strain
      const disp = Math.hypot(p.x - p.baseX, p.y - p.baseY, (p.z || 0) - (p.baseZ || 0));
      p.strain = disp;
      if (disp > 2) {
        this.synthesizer.depositShear(p.x, p.y, disp * 0.02);
        this.volumetricSynthesizer.depositVolumetricShear(p.x, p.y, p.z || 0, disp * 0.02);
      }
    }

    this.synthesizer.tickStrain();
    this.volumetricSynthesizer.coolVolumetricStrain();
    this.recalculateBVH();
  }

  /**
   * Applies deformation force to a specific spline segment / point
   */
  public deformBezierHull(pointIndex: number, forceX: number, forceY: number): void {
    const pts = this.hull.points;
    if (pointIndex < 0 || pointIndex >= pts.length) return;

    const target = pts[pointIndex];
    target.vx += forceX / target.mass;
    target.vy += forceY / target.mass;

    // Disperse force to neighbors (harmonic ripple)
    const prev = pts[(pointIndex - 1 + pts.length) % pts.length];
    const next = pts[(pointIndex + 1) % pts.length];
    prev.vx += (forceX * 0.35) / prev.mass;
    prev.vy += (forceY * 0.35) / prev.mass;
    next.vx += (forceX * 0.35) / next.mass;
    next.vy += (forceY * 0.35) / next.mass;

    // Deposit localized thermodynamic strain on the kinetic floor
    const forceMag = Math.hypot(forceX, forceY);
    this.synthesizer.depositShear(target.x, target.y, Math.min(1.0, forceMag * 0.08));

    this.recalculateBVH();
  }

  /**
   * Reset all control points to baseline
   */
  public resetEquilibrium(): void {
    for (const p of this.hull.points) {
      p.x = p.baseX;
      p.y = p.baseY;
      p.vx = 0;
      p.vy = 0;
    }
    this.recalculateBVH();
  }
}
