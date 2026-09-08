/**
 * Organelle 0xB1: Vector Tethering Mechanics
 * node_0xVECTOR_TETHER.ts
 * 
 * Physical rules of Cyber-Athletics.
 * Entities project mathematical splines to deform arena geometry or siphon kinetic energy,
 * bound strictly by the dV/dt <= 0 thermodynamic limit.
 */

import { Q16Vector, Entity, FloatVector, FloatVector4D } from '../types';
import { floatToQ16, q16ToFloat } from './q16';
import { ArenaForge } from './arena_forge';
import { covalentBHMechanics } from './covalent_bh_mechanics';
import { heritageSieveEngine } from './node_0xHERITAGE_OFFICIATOR';

export interface ShearEvent {
  sourceId: string;
  targetSplineId: string;
  force: FloatVector;
  energyCost: number;
  success: boolean;
  tick: number;
}

export class CyberAthleticTethering {
  private arena: ArenaForge;
  public shearLog: ShearEvent[] = [];
  public currentDvDt: number = 0; // Current rate of thermodynamic dissipation

  constructor(arena: ArenaForge) {
    this.arena = arena;
  }

  /**
   * Calculates the thermodynamic mass resistance of deforming a spline section
   */
  public calculateDeformationMass(targetSplineId: string, pointIndex: number, forceMagnitude: number): number {
    const pts = this.arena.hull.points;
    if (pointIndex < 0 || pointIndex >= pts.length) return 10;

    const pt = pts[pointIndex];
    // Base mass + distance from rest equilibrium
    const displacement = Math.hypot(pt.x - pt.baseX, pt.y - pt.baseY);
    const elasticityPenalty = displacement * 0.08;
    const cost = (pt.mass * 4.2) + (forceMagnitude * 2.8) + elasticityPenalty;

    return Math.round(cost);
  }

  /**
   * Applies kinetic shear from an entity onto a target spline control point
   */
  public applyKineticShear(
    entity: Entity,
    targetSplineId: string,
    pointIndex: number,
    forceVector: Q16Vector,
    currentTick: number
  ): boolean {
    if (entity.isStasisLocked) {
      return false;
    }

    const fxFloat = q16ToFloat(forceVector.x);
    const fyFloat = q16ToFloat(forceVector.y);
    const forceMag = Math.hypot(fxFloat, fyFloat);

    // Calculate thermodynamic friction cost
    const frictionCost = this.calculateDeformationMass(targetSplineId, pointIndex, forceMag);

    // Track dV/dt (thermodynamic rate of dissipation: dV/dt <= 0)
    this.currentDvDt = -frictionCost / 10.0;

    if (this.deductEnergy(entity, frictionCost)) {
      // Morph the arena geometry in real-time
      this.arena.deformBezierHull(pointIndex, fxFloat * 1.8, fyFloat * 1.8);

      this.shearLog.unshift({
        sourceId: entity.id,
        targetSplineId,
        force: { x: fxFloat, y: fyFloat },
        energyCost: frictionCost,
        success: true,
        tick: currentTick
      });

      if (this.shearLog.length > 20) this.shearLog.pop();
      return true;
    } else {
      // Thermodynamic Bankruptcy!
      this.applyStasisLock(entity, 180); // 180 ticks = 3 second penalty stasis

      this.shearLog.unshift({
        sourceId: entity.id,
        targetSplineId,
        force: { x: fxFloat, y: fyFloat },
        energyCost: frictionCost,
        success: false,
        tick: currentTick
      });

      if (this.shearLog.length > 20) this.shearLog.pop();
      return false;
    }
  }

  /**
   * Deducts thermodynamic energy from an entity.
   * Invariant dV/dt <= 0: entities cannot exceed available energy bank.
   */
  public deductEnergy(entity: Entity, amount: number): boolean {
    if (entity.energy >= amount) {
      entity.energy -= amount;
      return true;
    }
    return false;
  }

  /**
   * Siphon kinetic energy from an anchor or resonant field into an entity
   */
  public siphonEnergy(entity: Entity, amount: number): void {
    if (entity.isStasisLocked) return;
    entity.energy = Math.min(entity.maxEnergy, entity.energy + amount);
  }

  /**
   * Penalty stasis lock (3 seconds at 60Hz = 180 ticks)
   */
  public applyStasisLock(entity: Entity, ticks: number = 180): void {
    entity.isStasisLocked = true;
    entity.stasisLockRemainingTicks = ticks;
    entity.vx *= 0.1;
    entity.vy *= 0.1;
    entity.activeTether = null;
  }

  /**
   * Thermodynamic Brakes: Instant mid-air kinetic halt burning dV/dt
   * Risks thermodynamic bankruptcy (stasis penalty) if energy insufficient
   */
  public applyThermodynamicBrake(entity: Entity, currentTick: number): boolean {
    if (entity.isStasisLocked) return false;
    const speed3D = Math.hypot(entity.vx, entity.vy, entity.vz || 0);
    if (speed3D < 0.05) return true; // Already halted

    // Brake cost proportional to kinetic energy: E_k = 0.5 * m * v^2
    const brakeCost = Math.round(speed3D * 18 + speed3D * speed3D * 1.5);

    entity.isBraking = true;
    setTimeout(() => { entity.isBraking = false; }, 220);

    if (this.deductEnergy(entity, brakeCost)) {
      // Instantly damp kinetic vector down to zero
      entity.vx *= 0.08;
      entity.vy *= 0.08;
      entity.vz = (entity.vz || 0) * 0.08;

      // Deposit massive localized strain into thermodynamic void (negative dV/dt)
      this.currentDvDt = -brakeCost / 5.0;
      if (this.arena.volumetricSynthesizer) {
        this.arena.volumetricSynthesizer.depositVolumetricShear(
          entity.x, entity.y, entity.z || 0,
          Math.min(1.0, speed3D * 0.18)
        );
      }
      this.arena.synthesizer.depositShear(entity.x, entity.y, Math.min(1.0, speed3D * 0.18));

      this.shearLog.unshift({
        sourceId: entity.id,
        targetSplineId: 'THERMODYNAMIC_BRAKE',
        force: { x: entity.vx, y: entity.vy },
        energyCost: brakeCost,
        success: true,
        tick: currentTick
      });
      if (this.shearLog.length > 20) this.shearLog.pop();
      return true;
    } else {
      // Thermodynamic Bankruptcy! Penalty stasis
      this.applyStasisLock(entity, 180);
      this.shearLog.unshift({
        sourceId: entity.id,
        targetSplineId: 'THERMODYNAMIC_BRAKE',
        force: { x: entity.vx, y: entity.vy },
        energyCost: brakeCost,
        success: false,
        tick: currentTick
      });
      if (this.shearLog.length > 20) this.shearLog.pop();
      return false;
    }
  }

  /**
   * Ticks entity physics, stasis countdown, 3D 6DOF drift, and active tethers
   */
  public tickEntity(
    entity: Entity,
    friction: number = 0.992,
    maxSpeed: number = 16,
    currentTick: number = 0,
    opponent?: Entity
  ): void {
    const is3D = this.arena.topologyType === 'ISOTROPIC_HYPER_SPHERE';
    const effectiveFriction = is3D ? 0.998 : friction; // Vector inertia drift in Zero-G isotropic void

    // Handle stasis lock countdown
    if (entity.isStasisLocked) {
      entity.stasisLockRemainingTicks--;
      entity.vx *= 0.85;
      entity.vy *= 0.85;
      entity.vz = (entity.vz || 0) * 0.85;
      if (entity.stasisLockRemainingTicks <= 0) {
        entity.isStasisLocked = false;
        entity.energy = 250; // Re-energize with minimal reserve after stasis release
      }
    } else {
      // Natural low baseline passive energy recharge up to 600
      if (entity.energy < 600) {
        entity.energy += 0.35;
      }
    }

    // Apply global gravity field vector if set
    if (this.arena.volumetricSynthesizer && this.arena.volumetricSynthesizer.gravity) {
      const g = this.arena.volumetricSynthesizer.gravity;
      entity.vx += g.x * 0.1;
      entity.vy += g.y * 0.1;
      entity.vz = (entity.vz || 0) + g.z * 0.1;
    }

    // Organelle 0xC1_COVALENT: Apply Black Hole Star (The Singularity) Gravitational Shear & Time Dilation
    if (this.arena.singularity && this.arena.singularity.active) {
      covalentBHMechanics.sys_covalent_apply_bh_singularity(entity, this.arena.singularity, currentTick);
    } else {
      entity.timeDilationFactor = 1.0;
    }

    // Apply tether pulling physics
    if (entity.activeTether && !entity.isStasisLocked) {
      let tx = 0;
      let ty = 0;
      let tz = 0;
      let tw = 0;

      // Offensive Tethering to Opponent Hypersphere or Heritage Entity
      if (entity.activeTether.targetEntityId && opponent && opponent.id === entity.activeTether.targetEntityId) {
        // Defensive Phase-Shift: If opponent steps into W-space (|w| > 14), avatar collapses into point and sever tether!
        if (Math.abs(opponent.w) > 14) {
          entity.activeTether = null;
        } else {
          tx = opponent.x;
          ty = opponent.y;
          tz = opponent.z || 0;
          tw = opponent.w || 0;
          // Kinetic Shear burns opponent's ledger
          if (opponent.energy > 0) {
            opponent.energy = Math.max(0, opponent.energy - 0.45);
          }
        }
      } else if (entity.activeTether.targetEntityId) {
        // Check if tethered to a transpiled Heritage Entity
        const heritageEnt = heritageSieveEngine.entities.find(e => e.id === entity.activeTether!.targetEntityId);
        if (heritageEnt) {
          if (Math.abs(heritageEnt.w) > 14) {
            entity.activeTether = null;
          } else {
            tx = heritageEnt.x;
            ty = heritageEnt.y;
            tz = heritageEnt.z;
            tw = heritageEnt.w;
            // Drain heritage entity's thermodynamic ledger
            heritageEnt.energy = Math.max(0, heritageEnt.energy - 1.2);
            if (heritageEnt.energy <= 0 && !heritageEnt.isStasisLocked) {
              heritageEnt.isStasisLocked = true;
              heritageEnt.stasisLockRemainingTicks = 180;
            }
          }
        }
      } else if (entity.activeTether.targetAnchorId) {
        const anchor = this.arena.anchors.find(a => a.id === entity.activeTether!.targetAnchorId);
        if (anchor && anchor.active) {
          tx = anchor.x;
          ty = anchor.y;
          tz = anchor.z || 0;

          // Siphon energy if anchored to orb, well, or core
          if (anchor.type === 'THERMODYNAMIC_WELL') {
            this.siphonEnergy(entity, 1.6); // High-rate siphon
          } else if (anchor.type === 'RESONANCE_ORB') {
            this.siphonEnergy(entity, 1.2);
          } else if (anchor.type === 'CORE') {
            this.siphonEnergy(entity, 0.8);
          }
        }
      } else if (entity.activeTether.targetSplineId && entity.activeTether.splinePointIndex !== undefined) {
        const pt = this.arena.hull.points[entity.activeTether.splinePointIndex];
        if (pt) {
          tx = pt.x;
          ty = pt.y;
          tz = pt.z || 0;
        }
      } else if (entity.activeTether.targetPoint3D) {
        tx = entity.activeTether.targetPoint3D.x;
        ty = entity.activeTether.targetPoint3D.y;
        tz = entity.activeTether.targetPoint3D.z;
      } else if (entity.activeTether.targetPoint) {
        tx = entity.activeTether.targetPoint.x;
        ty = entity.activeTether.targetPoint.y;
        tz = 0;
      }

      if (tx !== 0 || ty !== 0 || tz !== 0) {
        // Check BH* Gravitational Lensing & Event Horizon severing
        if (this.arena.singularity && this.arena.singularity.active) {
          const lensCheck = covalentBHMechanics.sys_covalent_lens_tether_trajectory(
            { x: entity.x, y: entity.y, z: entity.z || 0, w: entity.w || 0 },
            { x: tx, y: ty, z: tz, w: tw },
            this.arena.singularity,
            6
          );

          if (lensCheck.isSevered) {
            // Tether crosses event horizon -> infinite shear tears tether!
            entity.activeTether = null;
          }
        }

        if (entity.activeTether) {
          const dx = tx - entity.x;
          const dy = ty - entity.y;
          const dz = tz - (entity.z || 0);
          const dist3D = Math.hypot(dx, dy, dz);

          if (dist3D > entity.activeTether.maxLength) {
            // Snap tether if pulled past max length
            entity.activeTether = null;
          } else {
            // 3D Spring pull
            const pullForce = 0.58;
            const nx = dx / (dist3D || 1);
            const ny = dy / (dist3D || 1);
            const nz = dz / (dist3D || 1);

            // Hyper-Rotation Parry Check: Inverted trajectory pulls backward
            if (entity.activeTether.isReversed) {
              entity.vx -= nx * pullForce * 1.4;
              entity.vy -= ny * pullForce * 1.4;
              entity.vz = (entity.vz || 0) - nz * pullForce * 1.4;
            } else {
              entity.vx += nx * pullForce;
              entity.vy += ny * pullForce;
              entity.vz = (entity.vz || 0) + nz * pullForce;
            }

            // Slingshot orbital cross-velocity
            const crossX = -ny * 0.18;
            const crossY = nx * 0.18;
            entity.vx += crossX;
            entity.vy += crossY;

            entity.activeTether.tension = Math.min(1.0, dist3D / entity.activeTether.maxLength);

            // Offensive Tethering Kinetic Shear: forces opponent engine to expend energy and get dragged
            if (entity.activeTether.targetEntityId && opponent && opponent.id === entity.activeTether.targetEntityId) {
              opponent.vx -= nx * pullForce * 0.72;
              opponent.vy -= ny * pullForce * 0.72;
              opponent.vz = (opponent.vz || 0) - nz * pullForce * 0.72;
              opponent.energy = Math.max(0, opponent.energy - 0.42);
            }

            // Small energy consumption for maintaining high-tension tether
            entity.energy = Math.max(0, entity.energy - 0.2);
          }
        }
      }
    }

    // Time Dilation Scaling: Local engine ticks are exponentially decelerated relative to distant entities
    const timeDilationScale = entity.timeDilationFactor ?? 1.0;

    // 3D Velocity clamp and integration (Vector Inertia Drift)
    const speed3D = Math.hypot(entity.vx, entity.vy, entity.vz || 0);
    if (speed3D > maxSpeed) {
      const scale = maxSpeed / speed3D;
      entity.vx *= scale;
      entity.vy *= scale;
      entity.vz = (entity.vz || 0) * scale;
    }

    entity.vx *= effectiveFriction;
    entity.vy *= effectiveFriction;
    entity.vz = (entity.vz || 0) * effectiveFriction;

    // Position integration scaled by local timeline dilation
    entity.x += entity.vx * timeDilationScale;
    entity.y += entity.vy * timeDilationScale;
    entity.z = (entity.z || 0) + (entity.vz || 0) * timeDilationScale;
    if (entity.vw) {
      entity.w = (entity.w || 0) + entity.vw * timeDilationScale;
    }

    // Arena hull / Bounding Sphere collision deflection
    if (this.arena.topologyType === 'HERITAGE_E1M1_HANGAR') {
      // 4D W-Axis Phase Bypass:
      // If |w| > 14, avatar steps into 4D and passes through legacy 3D walls!
      if (Math.abs(entity.w || 0) <= 14) {
        this.handleHeritageArenaCollisions(entity);
      }
    } else if (is3D) {
      this.handleSphericalArenaCollisions(entity);
    } else {
      this.handleArenaCollisions(entity);
    }

    // Append to movement trails
    entity.trail.unshift({ x: entity.x, y: entity.y });
    if (entity.trail.length > 20) entity.trail.pop();

    if (!entity.trail3D) entity.trail3D = [];
    entity.trail3D.unshift({ x: entity.x, y: entity.y, z: entity.z || 0 });
    if (entity.trail3D.length > 24) entity.trail3D.pop();
  }

  /**
   * True 3D Spherical Hull Collision (Bounding Sphere Intersect)
   */
  private handleSphericalArenaCollisions(entity: Entity): void {
    const cx = this.arena.center.x;
    const cy = this.arena.center.y;
    const cz = 0;
    const sphereRadius = this.arena.volumetricSynthesizer?.sphericalRadiusPx || this.arena.radiusX;

    const dx = entity.x - cx;
    const dy = entity.y - cy;
    const dz = (entity.z || 0) - cz;
    const distFromCenter = Math.hypot(dx, dy, dz);
    const maxAllowedDist = sphereRadius - (entity.boundingRadius || entity.radius);

    if (distFromCenter > maxAllowedDist) {
      // Normal pointing inward toward sphere center
      const nx = -dx / (distFromCenter || 1);
      const ny = -dy / (distFromCenter || 1);
      const nz = -dz / (distFromCenter || 1);

      // Clamp position inside sphere
      entity.x = cx - nx * maxAllowedDist;
      entity.y = cy - ny * maxAllowedDist;
      entity.z = cz - nz * maxAllowedDist;

      // Reflect 3D velocity vector
      const dot = entity.vx * nx + entity.vy * ny + (entity.vz || 0) * nz;
      if (dot < 0) {
        entity.vx = (entity.vx - 1.85 * dot * nx) * 0.92;
        entity.vy = (entity.vy - 1.85 * dot * ny) * 0.92;
        entity.vz = ((entity.vz || 0) - 1.85 * dot * nz) * 0.92;
      }
    }
  }

  /**
   * Organelle 0xC3_COVALENT: Heritage E1M1 Collision
   * Collides against lofted linedefs when anchored at baseline W (|w| <= 14).
   */
  private handleHeritageArenaCollisions(entity: Entity): void {
    const archive = heritageSieveEngine.latestArchive;
    if (!archive) {
      this.handleArenaCollisions(entity);
      return;
    }

    const radius = entity.boundingRadius || entity.radius || 16;
    const linedefs = archive.linedefs;

    for (const line of linedefs) {
      const v1 = line.v1;
      const v2 = line.v2;
      const dx = v2.x - v1.x;
      const dy = v2.y - v1.y;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) continue;

      // Project entity position onto linedef segment
      const t = Math.max(0, Math.min(1, ((entity.x - v1.x) * dx + (entity.y - v1.y) * dy) / lenSq));
      const projX = v1.x + t * dx;
      const projY = v1.y + t * dy;
      const dist = Math.hypot(entity.x - projX, entity.y - projY);

      if (dist < radius) {
        const overlap = radius - dist;
        const nx = (entity.x - projX) / (dist || 1);
        const ny = (entity.y - projY) / (dist || 1);

        entity.x += nx * overlap;
        entity.y += ny * overlap;

        // Bounce velocity
        const dot = entity.vx * nx + entity.vy * ny;
        if (dot < 0) {
          entity.vx = (entity.vx - 1.8 * dot * nx) * 0.85;
          entity.vy = (entity.vy - 1.8 * dot * ny) * 0.85;
        }
      }
    }
  }

  /**
   * Elastic collision against the Bézier hull perimeter
   */
  private handleArenaCollisions(entity: Entity): void {
    const pts = this.arena.hull.points;
    const n = pts.length;

    for (let i = 0; i < n; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];

      // Distance from point to line segment
      const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
      if (l2 === 0) continue;

      let t = ((entity.x - p1.x) * (p2.x - p1.x) + (entity.y - p1.y) * (p2.y - p1.y)) / l2;
      t = Math.max(0, Math.min(1, t));

      const projX = p1.x + t * (p2.x - p1.x);
      const projY = p1.y + t * (p2.y - p1.y);
      const dist = Math.hypot(entity.x - projX, entity.y - projY);

      if (dist < entity.radius + 6) {
        // Collision response
        const nx = (entity.x - projX) / (dist || 1);
        const ny = (entity.y - projY) / (dist || 1);

        // Repel entity
        entity.x = projX + nx * (entity.radius + 6);
        entity.y = projY + ny * (entity.radius + 6);

        // Reflect velocity with coefficient of restitution
        const dot = entity.vx * nx + entity.vy * ny;
        if (dot < 0) {
          entity.vx = (entity.vx - 1.8 * dot * nx) * 0.9;
          entity.vy = (entity.vy - 1.8 * dot * ny) * 0.9;

          // Also deflect spline hull points slightly
          p1.vx -= nx * 1.5;
          p1.vy -= ny * 1.5;
          p2.vx -= nx * 1.5;
          p2.vy -= ny * 1.5;
        }
      }
    }
  }
}
