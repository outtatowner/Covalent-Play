/**
 * Organelle 0xB5_COVALENT: 4D Hyper-Kinematics
 * Target: 4D Phase-Shifting, Hyperspheres & 6-Plane Hyper-Rotations
 * Direct TypeScript translation of kernel/covalent_tesseract_kinematics.c
 * Core Invariant: 1 === 1 (Absolute Mathematical Parity)
 */

import { FloatVector3D, FloatVector4D, Rotor6Planes, Entity } from '../types';
import { floatToQ16, q16ToFloat } from './q16';

export interface Covalent4DEntity {
  pos: [number, number, number, number];       // X, Y, Z, W (Q16)
  velocity: [number, number, number, number];  // dX, dY, dZ, dW (Q16)
  rotor: Rotor6Planes;                         // 6 Planes of 4D Rotation (XY, YZ, ZX, XW, YW, ZW)
  hyper_radius: number;                        // Bounding Hypersphere in Q16
}

export interface TesseractWireframeVertex {
  id: number;
  x: number;
  y: number;
  z: number;
  w: number;
}

export class TesseractKinematicsEngine {
  // 16 vertices of a normalized 4D Hypercube (Tesseract)
  public static readonly TESSERACT_BASE_VERTICES: [number, number, number, number][] = [
    [-1, -1, -1, -1], [ 1, -1, -1, -1], [-1,  1, -1, -1], [ 1,  1, -1, -1],
    [-1, -1,  1, -1], [ 1, -1,  1, -1], [-1,  1,  1, -1], [ 1,  1,  1, -1],
    [-1, -1, -1,  1], [ 1, -1, -1,  1], [-1,  1, -1,  1], [ 1,  1, -1,  1],
    [-1, -1,  1,  1], [ 1, -1,  1,  1], [-1,  1,  1,  1], [ 1,  1,  1,  1],
  ];

  // 32 edges of a 4D Hypercube (pairs of vertex indices differing by exactly 1 bit)
  public static readonly TESSERACT_EDGES: [number, number][] = (() => {
    const edges: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        // Differ by exactly 1 bit in 4-bit binary representation
        const diff = i ^ j;
        if ((diff & (diff - 1)) === 0) {
          edges.push([i, j]);
        }
      }
    }
    return edges;
  })();

  /**
   * Hypersphere Ray-Intersection (The 3D Cross-Section)
   * Calculates the apparent 3D radius at an observer's specific W-slice.
   * r_3D^2 = r_4D^2 - w_dist^2
   */
  public calculateCrossSectionRadius(
    targetW: number,
    observerSliceW: number,
    hyperRadius: number
  ): { apparentRadius: number; isPhasedOut: boolean; wDist: number } {
    const wDist = targetW - observerSliceW;
    const apparentRadiusSq = (hyperRadius * hyperRadius) - (wDist * wDist);

    if (apparentRadiusSq <= 0) {
      return { apparentRadius: 0, isPhasedOut: true, wDist };
    }

    return {
      apparentRadius: Math.sqrt(apparentRadiusSq),
      isPhasedOut: false,
      wDist
    };
  }

  /**
   * Rotate a 4D point through the 6 planes of 4D space
   * Planes:
   * 0: XY (axial spin)
   * 1: YZ (pitch)
   * 2: ZX (roll)
   * 3: XW (Hyper-rotation 1: turns X into W)
   * 4: YW (Hyper-rotation 2: turns Y into W)
   * 5: ZW (Hyper-rotation 3: turns Z into W)
   */
  public rotate4DPoint(
    point: [number, number, number, number],
    rotor: Rotor6Planes
  ): [number, number, number, number] {
    let [x, y, z, w] = point;

    // 1. Plane XY
    if (rotor[0] !== 0) {
      const c = Math.cos(rotor[0]);
      const s = Math.sin(rotor[0]);
      const nx = x * c - y * s;
      const ny = x * s + y * c;
      x = nx;
      y = ny;
    }

    // 2. Plane YZ
    if (rotor[1] !== 0) {
      const c = Math.cos(rotor[1]);
      const s = Math.sin(rotor[1]);
      const ny = y * c - z * s;
      const nz = y * s + z * c;
      y = ny;
      z = nz;
    }

    // 3. Plane ZX
    if (rotor[2] !== 0) {
      const c = Math.cos(rotor[2]);
      const s = Math.sin(rotor[2]);
      const nz = z * c - x * s;
      const nx = z * s + x * c;
      z = nz;
      x = nx;
    }

    // 4. Plane XW (Hyper-Rotation 1: Inverts lateral aspect through 4th dimension)
    if (rotor[3] !== 0) {
      const c = Math.cos(rotor[3]);
      const s = Math.sin(rotor[3]);
      const nx = x * c - w * s;
      const nw = x * s + w * c;
      x = nx;
      w = nw;
    }

    // 5. Plane YW (Hyper-Rotation 2: Inverts sagittal aspect through 4th dimension)
    if (rotor[4] !== 0) {
      const c = Math.cos(rotor[4]);
      const s = Math.sin(rotor[4]);
      const ny = y * c - w * s;
      const nw = y * s + w * c;
      y = ny;
      w = nw;
    }

    // 6. Plane ZW (Hyper-Rotation 3: Inverts vertical aspect through 4th dimension)
    if (rotor[5] !== 0) {
      const c = Math.cos(rotor[5]);
      const s = Math.sin(rotor[5]);
      const nz = z * c - w * s;
      const nw = z * s + w * c;
      z = nz;
      w = nw;
    }

    return [x, y, z, w];
  }

  /**
   * Project a 4D point (X, Y, Z, W) to 3D via 4D perspective projection
   * sliceW: The observer's focal W-plane
   * focal4D: Distance of 4D camera to projection hyperplane (usually ~2.5 to 3.5)
   */
  public project4Dto3D(
    p4: [number, number, number, number],
    focal4D: number = 2.8,
    observerSliceW: number = 0
  ): FloatVector3D & { wScale: number } {
    const [x, y, z, w] = p4;
    const relW = w - observerSliceW;
    
    // Perspective division along W-axis
    // Avoid singularity when relW approaches focal4D
    const denom = focal4D - relW;
    const scale = denom !== 0 ? focal4D / Math.max(0.1, denom) : 1;

    return {
      x: x * scale,
      y: y * scale,
      z: z * scale,
      wScale: scale
    };
  }

  /**
   * Generate rotated & scaled 4D vertices of The Null-Friction Tesseract
   */
  public getTesseractProjectedVertices(
    scale: number,
    rotor: Rotor6Planes,
    observerSliceW: number = 0
  ): { p3: FloatVector3D; p4: FloatVector4D; wScale: number }[] {
    return TesseractKinematicsEngine.TESSERACT_BASE_VERTICES.map((baseVert) => {
      const scaled: [number, number, number, number] = [
        baseVert[0] * scale,
        baseVert[1] * scale,
        baseVert[2] * scale,
        baseVert[3] * scale,
      ];

      const rot = this.rotate4DPoint(scaled, rotor);
      const proj = this.project4Dto3D(rot, 3.2, observerSliceW);

      return {
        p3: { x: proj.x, y: proj.y, z: proj.z },
        p4: { x: rot[0], y: rot[1], z: rot[2], w: rot[3] },
        wScale: proj.wScale
      };
    });
  }

  /**
   * Predict where an entity phased into W != 0 will re-enter the observer's 3D slice (W = 0).
   * Uses 4D velocity vector (vx, vy, vz, vw) to extrapolate time-to-reentry:
   * delta_ticks = -w / vw
   */
  public predictReentry(entity: Entity, observerSliceW: number = 0): FloatVector3D {
    const wDist = entity.w - observerSliceW;

    if (Math.abs(entity.vw) < 0.0001) {
      // Not moving along W, returns current XYZ
      return { x: entity.x, y: entity.y, z: entity.z };
    }

    const ticksToReentry = -wDist / entity.vw;
    if (ticksToReentry < 0 || ticksToReentry > 300) {
      // Moving away from or far from slice
      return { x: entity.x, y: entity.y, z: entity.z };
    }

    return {
      x: entity.x + entity.vx * ticksToReentry,
      y: entity.y + entity.vy * ticksToReentry,
      z: entity.z + entity.vz * ticksToReentry,
    };
  }
}

export const tesseractEngine = new TesseractKinematicsEngine();
