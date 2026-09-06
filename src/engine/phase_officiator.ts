/**
 * Organelle 0xB6_COVALENT: The Phase Officiator
 * Target: W-Axis Thermodynamic Vacuum Bleed & Tesseract Echo Synchronization
 * Direct TypeScript implementation of node_0xPHASE_OFFICIATOR.ts
 * Core Invariant: 1 === 1 (Absolute Mathematical Parity)
 */

import { Entity, TesseractEcho, Rotor6Planes, FloatVector3D } from '../types';
import { tesseractEngine } from './tesseract_kinematics';

export class HyperDimensionalArbitrator {
  // W-Axis Vacuum friction rate: depletes energy proportional to distance from W = 0
  public static readonly W_BLEED_COEFFICIENT = 0.0085;
  public static readonly W_NATURAL_SPRING_PULL = 0.002; // Vacuum drags unpowered entities back toward W = 0
  public static readonly MAX_PHASE_DEPTH = 180;         // Maximum W travel before stasis dislocation

  /**
   * Inject a W-vector thrust to phase-shift an entity along the 4th spatial dimension
   */
  public applyPhaseShift(entity: Entity, wThrust: number): void {
    if (entity.isStasisLocked) return;

    // Check if entity has enough energy to phase-shift
    const cost = Math.abs(wThrust) * 20;
    if (entity.energy < cost) {
      // Insufficient kinetic reserve to enter higher phase
      return;
    }

    entity.energy = Math.max(0, entity.energy - cost);
    entity.vw += wThrust;

    // Clamp maximum phase velocity
    if (entity.vw > 4.5) entity.vw = 4.5;
    if (entity.vw < -4.5) entity.vw = -4.5;
  }

  /**
   * Apply Hyper-Rotation delta along one of the 6 4D planes
   * 0: XY, 1: YZ, 2: ZX, 3: XW, 4: YW, 5: ZW
   */
  public applyHyperRotation(entity: Entity, planeIndex: number, deltaAngle: number): void {
    if (planeIndex >= 0 && planeIndex < 6) {
      entity.rotor[planeIndex] = (entity.rotor[planeIndex] + deltaAngle) % (Math.PI * 2);

      // If rotating along hyper planes (XW or YW) while tethered, invert/reverse the tether!
      if ((planeIndex === 3 || planeIndex === 4) && entity.activeTether) {
        entity.activeTether.isReversed = !entity.activeTether.isReversed;
      }
    }
  }

  /**
   * Tick 4D Hyper-Kinematics and Thermodynamic Vacuum Bleed
   */
  public tickHyperPhysics(entity: Entity, observerSliceW: number = 0, currentTick: number): void {
    // 1. Advance W position
    entity.w += entity.vw;

    // 2. High-friction vacuum drag pulls back towards baseline W = 0
    const phaseDistance = Math.abs(entity.w);
    if (phaseDistance > 0.001) {
      const restoringForce = Math.sign(-entity.w) * phaseDistance * HyperDimensionalArbitrator.W_NATURAL_SPRING_PULL;
      entity.vw += restoringForce;
      entity.vw *= 0.96; // Vacuum damping
    } else {
      entity.w = 0;
      entity.vw *= 0.85;
    }

    // 3. 4D Thermodynamic Bleed: Being phased out of baseline W=0 continuously drains energy
    if (phaseDistance > 2.0) {
      const bleedRate = phaseDistance * HyperDimensionalArbitrator.W_BLEED_COEFFICIENT;
      entity.phaseBleed = bleedRate;
      entity.energy = Math.max(0, entity.energy - bleedRate);

      // If energy completely drains while phased out, entity enters emergency stasis and snaps back
      if (entity.energy <= 0) {
        entity.isStasisLocked = true;
        entity.stasisLockRemainingTicks = 90;
        entity.w = 0;
        entity.vw = 0;
      }
    } else {
      entity.phaseBleed = 0;
    }

    // 4. Update Apparent 3D Cross-Sectional Radius
    const crossSection = tesseractEngine.calculateCrossSectionRadius(
      entity.w,
      observerSliceW,
      entity.hyperRadius || entity.radius * 1.5
    );

    entity.apparentRadius3D = crossSection.apparentRadius;
    entity.isPhasedOut = crossSection.isPhasedOut;

    // 5. Naturally advance subtle 4D hyper-rotations
    entity.rotor[3] = (entity.rotor[3] + 0.004) % (Math.PI * 2); // Slow XW drift
    entity.rotor[4] = (entity.rotor[4] + 0.003) % (Math.PI * 2); // Slow YW drift
  }

  /**
   * Generate Tesseract Echo of a phased entity
   * Renders faint wireframe projection onto the observer's reality slice (W = 0)
   */
  public generateEcho(entity: Entity, observerSliceW: number = 0): TesseractEcho | null {
    const phaseDistance = Math.abs(entity.w - observerSliceW);
    
    // An echo is always visible if entity is non-zero phase, even if phased out of 3D cross section
    const reentryPoint = tesseractEngine.predictReentry(entity, observerSliceW);

    return {
      entityId: entity.id,
      name: entity.name,
      pos4D: { x: entity.x, y: entity.y, z: entity.z, w: entity.w },
      apparentRadius: entity.apparentRadius3D,
      phaseDistance,
      rotor: [...entity.rotor] as Rotor6Planes,
      predictedReentryPoint: reentryPoint,
      color: entity.color,
    };
  }

  /**
   * Check if a tether connects with an entity's predicted re-entry coordinates or cross-section.
   * If an athlete strikes an opponent's echo precisely at re-entry, it shatters their thermodynamic stasis!
   */
  public testReentryStrike(
    strikerPos: FloatVector3D,
    echo: TesseractEcho,
    strikeTolerance: number = 28
  ): boolean {
    const dx = strikerPos.x - echo.predictedReentryPoint.x;
    const dy = strikerPos.y - echo.predictedReentryPoint.y;
    const dz = strikerPos.z - echo.predictedReentryPoint.z;
    const dist = Math.hypot(dx, dy, dz);

    return dist < strikeTolerance;
  }
}

export const phaseOfficiator = new HyperDimensionalArbitrator();
