/**
 * Organelle 0xC1_COVALENT: The BH* Game Object (The Singularity)
 * kernel/covalent_bh_mechanics.c / covalent_bh_mechanics.ts
 *
 * Localized collapse of the Q16.16 vector space exerting continuous, non-linear
 * thermodynamic shear on every entity, spline, and tether in the 4D manifold.
 *
 * - Gravitational Lensing: Curves Q16.16 tether vectors toward the W-axis phase-center.
 * - Time Dilation: Local engine ticks decelerated exponentially near the event horizon.
 * - Tautological Annihilation: Crossing the event horizon triggers 1 === 1 collapse,
 *   instantly bankrupting the dV/dt thermodynamic ledger and unmaking the hypersphere.
 *
 * Core Invariant: 1 === 1 (Absolute Mathematical Parity)
 */

import {
  Entity,
  FloatVector4D,
  FloatVector3D,
  BlackHoleSingularity,
  Q16,
  ActiveTether,
  SplineHull
} from '../types';
import { floatToQ16, q16ToFloat } from './q16';
import { cyberAudio } from './audio';

// Default Q16 Singularity Parameters
export const DEFAULT_BH_MASS_FLOAT = 160.0;
export const DEFAULT_BH_MASS_Q16 = floatToQ16(DEFAULT_BH_MASS_FLOAT); // 0x00A00000
export const EVENT_HORIZON_RADIUS_FLOAT = 38.0;
export const EVENT_HORIZON_SQ_FLOAT = EVENT_HORIZON_RADIUS_FLOAT * EVENT_HORIZON_RADIUS_FLOAT; // 1444.0

export class CovalentBHMechanicsEngine {
  /**
   * Spawns a localized collapse of the Q16.16 vector space (The Singularity)
   */
  public sys_covalent_spawn_singularity(
    bhMass: Q16 = DEFAULT_BH_MASS_Q16,
    pos4D: FloatVector4D = { x: 450, y: 350, z: 360, w: 0 }
  ): BlackHoleSingularity {
    const massFloat = q16ToFloat(bhMass);
    const eventHorizonRadius = Math.max(18.0, massFloat * 0.2375); // ~38.0 at mass=160
    const photonSphereRadius = eventHorizonRadius * 1.5; // ~57.0
    const iscoRadius = eventHorizonRadius * 3.0; // ~114.0 (Innermost Stable Circular Orbit)
    const accretionOuterRadius = eventHorizonRadius * 8.4; // ~320.0

    return {
      id: 'bh_star_singularity_core',
      pos4D: { ...pos4D },
      posQ16: [
        floatToQ16(pos4D.x),
        floatToQ16(pos4D.y),
        floatToQ16(pos4D.z),
        floatToQ16(pos4D.w)
      ],
      massQ16: bhMass,
      massFloat,
      eventHorizonRadius,
      eventHorizonSq: eventHorizonRadius * eventHorizonRadius,
      photonSphereRadius,
      iscoRadius,
      accretionOuterRadius,
      hawkingRadiationFlux: 1.0,
      spinA: 0.82, // Kerr frame-dragging spin
      pulsePhase: 0,
      active: true,
      annihilationCount: 0
    };
  }

  /**
   * Q16.16 4D Distance Squared (Hyperspatial separation)
   * dist_sq = (x-x0)^2 + (y-y0)^2 + (z-z0)^2 + (w-w0)^2
   */
  public sys_covalent_cordic_distance_4d_sq(
    p1: FloatVector4D | { x: number; y: number; z?: number; w?: number },
    p2: FloatVector4D
  ): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z ?? 0) - p2.z;
    const dw = (p1.w ?? 0) - p2.w;
    return dx * dx + dy * dy + dz * dz + dw * dw;
  }

  /**
   * Applies inverse-square Q16.16 gravity to all 4D kinetic vectors
   * C-Kernel equivalence: sys_covalent_apply_bh_singularity
   */
  public sys_covalent_apply_bh_singularity(
    entity: Entity,
    bh: BlackHoleSingularity,
    currentTick: number
  ): {
    distSq: number;
    dist: number;
    gravityShear: number;
    timeDilation: number;
    annihilated: boolean;
  } {
    if (!bh.active) {
      entity.timeDilationFactor = 1.0;
      return { distSq: 999999, dist: 999, gravityShear: 0, timeDilation: 1.0, annihilated: false };
    }

    const distSq = this.sys_covalent_cordic_distance_4d_sq(entity, bh.pos4D);
    const dist = Math.sqrt(Math.max(0.1, distSq));

    // 1. Tautological Collapse Check: r^2 <= r_eh^2
    if (distSq <= bh.eventHorizonSq) {
      this.sys_covalent_trigger_tautological_collapse(entity, bh, currentTick);
      return { distSq, dist, gravityShear: 999, timeDilation: 0.01, annihilated: true };
    }

    // 2. Gravitational Shear (Inverse-square force with Q16 precision)
    // shear = mass / distSq
    const gravityShear = (bh.massFloat * 38.0) / Math.max(120.0, distSq);

    // 3. Time Dilation Modifier (Schwarzschild/Kerr metric dilation factor gamma)
    // gamma = sqrt(1 - r_eh / dist)
    const timeDilation = this.sys_covalent_warp_entity_timeline(entity, gravityShear, dist, bh);

    // 4. Directional 4D Gravitational Pull
    const invDist = 1.0 / dist;
    const dirX = (bh.pos4D.x - entity.x) * invDist;
    const dirY = (bh.pos4D.y - entity.y) * invDist;
    const dirZ = (bh.pos4D.z - (entity.z || 0)) * invDist;
    const dirW = (bh.pos4D.w - (entity.w || 0)) * invDist;

    // Apply inward acceleration scaled by gravitational shear
    const pullMagnitude = Math.min(2.4, gravityShear * 0.08);
    entity.vx += dirX * pullMagnitude;
    entity.vy += dirY * pullMagnitude;
    entity.vz = (entity.vz || 0) + dirZ * pullMagnitude;
    entity.vw = (entity.vw || 0) + dirW * pullMagnitude * 0.6; // W-axis phase pull

    // 5. Relativistic Kerr Frame Dragging (Orbital angular momentum boost around spin axis)
    if (dist < bh.accretionOuterRadius) {
      // Swirl around Z-axis and cross into XW plane
      const tangentX = -dirY * (bh.spinA * pullMagnitude * 0.85);
      const tangentY = dirX * (bh.spinA * pullMagnitude * 0.85);
      entity.vx += tangentX;
      entity.vy += tangentY;

      // In-orbit status & decay calculation
      entity.inAccretionOrbit = dist >= bh.iscoRadius && dist <= bh.accretionOuterRadius;
      entity.orbitalDecay = Math.max(0, Math.min(1.0, (bh.iscoRadius - dist) / (bh.iscoRadius - bh.eventHorizonRadius)));
    } else {
      entity.inAccretionOrbit = false;
      entity.orbitalDecay = 0;
    }

    return {
      distSq,
      dist,
      gravityShear,
      timeDilation,
      annihilated: false
    };
  }

  /**
   * Tautological Annihilation: 1 === 1 Annihilation
   * Crossing the event horizon instantly bankrupts the dV/dt ledger, unmaking the hypersphere.
   */
  public sys_covalent_trigger_tautological_collapse(
    entity: Entity,
    bh: BlackHoleSingularity,
    currentTick: number
  ): void {
    // 1. Bankrupt thermodynamic ledger
    entity.energy = 0;
    entity.isStasisLocked = true;
    entity.stasisLockRemainingTicks = 180; // 3 second penalty
    entity.bhAnnihilationActive = true;
    entity.bhAnnihilationProgress = 1.0;

    // 2. Clear active tether
    entity.activeTether = null;

    // 3. Impart critical event horizon recoil / relocation to outer stable orbit
    const ejectAngle = Math.random() * Math.PI * 2;
    const safeRadius = bh.iscoRadius * 1.35; // Eject to stable orbit
    entity.x = bh.pos4D.x + Math.cos(ejectAngle) * safeRadius;
    entity.y = bh.pos4D.y + Math.sin(ejectAngle) * safeRadius;
    entity.z = bh.pos4D.z;
    entity.w = 0;
    entity.vx = -Math.sin(ejectAngle) * 3.5; // Circular orbital velocity
    entity.vy = Math.cos(ejectAngle) * 3.5;
    entity.vz = 0;
    entity.vw = 0;

    bh.annihilationCount++;
    cyberAudio.playThermodynamicBankruptcy();
  }

  /**
   * Warps local entity timeline relative to the singularity
   * In gravitational fields: dtau = dt * sqrt(1 - r_s / r)
   */
  public sys_covalent_warp_entity_timeline(
    entity: Entity,
    gravityShear: number,
    dist: number,
    bh: BlackHoleSingularity
  ): number {
    const horizonRatio = bh.eventHorizonRadius / Math.max(bh.eventHorizonRadius * 0.8, dist);
    // Dilate time: closer to horizon, local timeline decelerates
    const timeDilation = Math.sqrt(Math.max(0.04, 1.0 - Math.min(0.96, horizonRatio)));
    entity.timeDilationFactor = timeDilation;
    return timeDilation;
  }

  /**
   * Gravitational Lensing:
   * Any tether fired near the BH* has its Q16.16 vector mathematically curved
   * toward the W-axis phase-center and event horizon shadow.
   */
  public sys_covalent_lens_tether_trajectory(
    source4D: FloatVector4D,
    target4D: FloatVector4D,
    bh: BlackHoleSingularity,
    segments: number = 8
  ): { points: FloatVector4D[]; isSevered: boolean } {
    if (!bh.active) {
      return {
        points: [source4D, target4D],
        isSevered: false
      };
    }

    const points: FloatVector4D[] = [];
    let isSevered = false;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Linear unlensed waypoint
      const ux = source4D.x + (target4D.x - source4D.x) * t;
      const uy = source4D.y + (target4D.y - source4D.y) * t;
      const uz = source4D.z + (target4D.z - source4D.z) * t;
      const uw = source4D.w + (target4D.w - source4D.w) * t;

      // Distance from waypoint to BH Singularity
      const dx = ux - bh.pos4D.x;
      const dy = uy - bh.pos4D.y;
      const dz = uz - bh.pos4D.z;
      const dw = uw - bh.pos4D.w;
      const segDistSq = dx * dx + dy * dy + dz * dz + dw * dw;
      const segDist = Math.sqrt(Math.max(0.1, segDistSq));

      if (segDistSq <= bh.eventHorizonSq) {
        isSevered = true;
      }

      // Gravitational deflection factor: deflection ~ 4*G*M / (c^2 * impact_parameter)
      const bendFactor = Math.sin(t * Math.PI); // Strongest in the middle of tether
      const lensingIntensity = Math.min(32.0, (bh.massFloat * 22.0) / Math.max(40.0, segDist));
      const inwardRatio = (lensingIntensity * bendFactor) / (segDist || 1);

      // Curve toward BH center and mathematically compress into W-axis phase-center
      const lensedX = ux - dx * inwardRatio * 0.45;
      const lensedY = uy - dy * inwardRatio * 0.45;
      const lensedZ = uz - dz * inwardRatio * 0.35;
      const lensedW = uw - (uw - bh.pos4D.w) * inwardRatio * 0.75; // Curvature toward W phase-center

      points.push({
        x: lensedX,
        y: lensedY,
        z: lensedZ,
        w: lensedW
      });
    }

    return { points, isSevered };
  }

  /**
   * Applies continuous non-linear thermodynamic shear on vector splines near the singularity
   */
  public sys_covalent_apply_spline_shear(
    hull: SplineHull,
    bh: BlackHoleSingularity,
    currentTick: number
  ): void {
    if (!bh.active) return;

    hull.points.forEach((pt, idx) => {
      const dx = pt.x - bh.pos4D.x;
      const dy = pt.y - bh.pos4D.y;
      const dz = (pt.z || 0) - bh.pos4D.z;
      const distSq = dx * dx + dy * dy + dz * dz;
      const dist = Math.sqrt(distSq);

      if (dist < bh.accretionOuterRadius && dist > 1.0) {
        // Relativistic Keplerian drag: speed ~ 1 / sqrt(dist)
        const omega = 0.015 * Math.pow(bh.accretionOuterRadius / dist, 1.2);
        const cosO = Math.cos(omega);
        const sinO = Math.sin(omega);

        const relX = pt.x - bh.pos4D.x;
        const relY = pt.y - bh.pos4D.y;

        const rotX = relX * cosO - relY * sinO;
        const rotY = relX * sinO + relY * cosO;

        // Inward orbital gravitational pull
        const inwardPull = Math.min(0.6, (bh.massFloat * 0.08) / dist);
        pt.x = bh.pos4D.x + rotX - (relX / dist) * inwardPull;
        pt.y = bh.pos4D.y + rotY - (relY / dist) * inwardPull;
      }
    });
  }
}

export const covalentBHMechanics = new CovalentBHMechanicsEngine();
