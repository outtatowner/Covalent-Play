/**
 * Organelle 0xB1: Vector Tethering Mechanics
 * node_0xVECTOR_TETHER.ts
 * 
 * Physical rules of Cyber-Athletics.
 * Entities project mathematical splines to deform arena geometry or siphon kinetic energy,
 * bound strictly by the dV/dt <= 0 thermodynamic limit.
 */

import { Q16Vector, Entity, FloatVector } from '../types';
import { floatToQ16, q16ToFloat } from './q16';
import { ArenaForge } from './arena_forge';

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
   * Ticks entity physics, stasis countdown, and active tethers
   */
  public tickEntity(
    entity: Entity,
    friction: number = 0.985,
    maxSpeed: number = 12
  ): void {
    // Handle stasis lock countdown
    if (entity.isStasisLocked) {
      entity.stasisLockRemainingTicks--;
      entity.vx *= 0.85;
      entity.vy *= 0.85;
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

    // Apply tether pulling physics
    if (entity.activeTether && !entity.isStasisLocked) {
      let tx = 0;
      let ty = 0;

      if (entity.activeTether.targetAnchorId) {
        const anchor = this.arena.anchors.find(a => a.id === entity.activeTether!.targetAnchorId);
        if (anchor && anchor.active) {
          tx = anchor.x;
          ty = anchor.y;

          // Siphon energy if anchored to orb or core
          if (anchor.type === 'RESONANCE_ORB') {
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
        }
      } else if (entity.activeTether.targetPoint) {
        tx = entity.activeTether.targetPoint.x;
        ty = entity.activeTether.targetPoint.y;
      }

      if (tx !== 0 || ty !== 0) {
        const dx = tx - entity.x;
        const dy = ty - entity.y;
        const dist = Math.hypot(dx, dy);

        if (dist > entity.activeTether.maxLength) {
          // Snap tether if pulled past max length
          entity.activeTether = null;
        } else {
          // Spring pull
          const pullForce = 0.55;
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          entity.vx += nx * pullForce;
          entity.vy += ny * pullForce;
          entity.activeTether.tension = Math.min(1.0, dist / entity.activeTether.maxLength);

          // Small energy consumption for maintaining high-tension tether
          entity.energy = Math.max(0, entity.energy - 0.2);
        }
      }
    }

    // Velocity clamp and integration
    const speed = Math.hypot(entity.vx, entity.vy);
    if (speed > maxSpeed) {
      entity.vx = (entity.vx / speed) * maxSpeed;
      entity.vy = (entity.vy / speed) * maxSpeed;
    }

    entity.vx *= friction;
    entity.vy *= friction;
    entity.x += entity.vx;
    entity.y += entity.vy;

    // Arena hull collision deflection
    this.handleArenaCollisions(entity);

    // Append to movement trail
    entity.trail.unshift({ x: entity.x, y: entity.y });
    if (entity.trail.length > 18) {
      entity.trail.pop();
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
