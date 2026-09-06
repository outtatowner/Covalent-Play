/**
 * FORGE: Quadbit Asset Studio -> Real-Time Vector-Spline Arena Generator
 * Handles dynamic geometric deformation inputs, Bézier hulls, and BVH recalculation.
 */

import { SplineHull, SplineControlPoint, TetherAnchor, BoundingBox, TopologyType } from '../types';
import { CyberArenaSynthesizer, WELL_OFFSET_Q16 } from './arena_synthesizer';
import { VolumetricArenaSynthesizer } from './omni_axial_arena';

export type { TopologyType };

export class ArenaForge {
  public hull: SplineHull;
  public anchors: TetherAnchor[] = [];
  public bvh: BoundingBox[] = [];
  public topologyType: TopologyType = 'ISOTROPIC_HYPER_SPHERE';
  public center: { x: number; y: number } = { x: 450, y: 350 };
  public radiusX: number = 320;
  public radiusY: number = 240;
  public synthesizer: CyberArenaSynthesizer = new CyberArenaSynthesizer();
  public volumetricSynthesizer: VolumetricArenaSynthesizer = new VolumetricArenaSynthesizer();

  public tesseractRotor: [number, number, number, number, number, number] = [0, 0, 0, 0.05, 0.03, 0];

  constructor(topology: TopologyType = 'THE_NULL_FRICTION_TESSERACT') {
    this.topologyType = topology;
    if (topology === 'THE_NULL_FRICTION_TESSERACT') {
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
    if (type === 'THE_NULL_FRICTION_TESSERACT') {
      this.synthesizeNullFrictionTesseract();
    } else if (type === 'ISOTROPIC_HYPER_SPHERE') {
      this.synthesizeIsotropicHyperSphere();
    } else if (type === 'NULL_FRICTION_OCTAGON') {
      this.synthesizeNullFrictionOctagon();
    } else {
      this.hull = this.generateHull(type);
      this.generateAnchors();
      this.recalculateBVH();
    }
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
