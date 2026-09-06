/**
 * Organelle 0xB4_COVALENT: The Isotropic Hyper-Sphere
 * node_0xOMNI_AXIAL_ARENA.ts
 * 
 * Target: 3D Volumetric Sparring Manifold & 6DOF Spherical Bounds
 * Gravity: Zero-G Q16.16 Vector Field (0x00000000, 0x00000000, 0x00000000)
 * Tetrahedron Floating Anchors: 4 Thermodynamic Wells suspended in isotropic 3D
 */

import { SplineControlPoint, SplineHull, TetherAnchor, GravityVector3D, FloatVector3D } from '../types';
import { floatToQ16, q16ToFloat } from './q16';

export const HYPER_SPHERE_RADIUS_Q16 = 0x08000000; // 128 units in Q16
export const TETRA_ANCHOR_OFFSET_Q16 = 0x03000000; // 48 units in Q16

export interface VolumetricSectorStrain {
  x: number;
  y: number;
  z: number;
  strain: number; // 0..1 (localized dV/dt)
}

export class VolumetricArenaSynthesizer {
  public isVolumetricSynthesized: boolean = false;
  public logs: string[] = [];
  public sphericalRadiusQ16: number = HYPER_SPHERE_RADIUS_Q16;
  public sphericalRadiusPx: number = 380;
  public center: FloatVector3D = { x: 450, y: 350, z: 0 };
  public gravity: GravityVector3D = { x: 0, y: 0, z: 0 };

  // 3D localized dV/dt strain nodes
  public strainPoints: VolumetricSectorStrain[] = [];
  public maxDvDt: number = 0;

  constructor() {
    this.initStrainGrid();
  }

  private initStrainGrid(): void {
    this.strainPoints = [];
    // 3D coordinate reticle checkpoints across all 3 major planes (XY, XZ, YZ)
    const axes = [-180, -90, 0, 90, 180];
    for (const x of axes) {
      for (const y of axes) {
        for (const z of [-120, 0, 120]) {
          this.strainPoints.push({ x, y, z, strain: 0 });
        }
      }
    }
  }

  /**
   * Spawns the Volumetric Hyper-Sphere Manifold
   */
  public generateHyperSphere(
    centerX: number = 450,
    centerY: number = 350,
    centerZ: number = 0,
    radiusPx: number = 380
  ): { hull: SplineHull; anchors: TetherAnchor[] } {
    this.logs = [];
    this.log(`[ FORGE ] Expanding manifold to 3D Isotropic space...`);
    this.center = { x: centerX, y: centerY, z: centerZ };
    this.sphericalRadiusPx = radiusPx;

    // 1. Establish the Volumetric Boundary (A massive Q16.16 Vector Sphere)
    const hull = this.sys_covalent_spawn_spherical_bounds(this.sphericalRadiusQ16, radiusPx);
    this.log(`[ FORGE ] Bound: Spherical Vector Hull (0x08000000 / 128-unit Q16.16 radius)`);

    // 2. Disable localized gravity fields (Zero-G Void)
    this.sys_covalent_set_global_gravity(0x00000000, 0x00000000, 0x00000000);
    this.log(`[ FORGE ] Gravity field zeroed: Vector field [0x0, 0x0, 0x0]`);

    // 3. Spawn 3D Thermodynamic Wells in a tetrahedron formation
    // Node A: ( 0x03000000,  0x03000000,  0x03000000)
    // Node B: (-0x03000000, -0x03000000,  0x03000000)
    // Node C: ( 0x03000000, -0x03000000, -0x03000000)
    // Node D: (-0x03000000,  0x03000000, -0x03000000)
    const anchors: TetherAnchor[] = [
      this.sys_covalent_spawn_floating_anchor('WELL_A',  TETRA_ANCHOR_OFFSET_Q16,  TETRA_ANCHOR_OFFSET_Q16,  TETRA_ANCHOR_OFFSET_Q16, 'Tetrahedron Alpha (+X +Y +Z)'),
      this.sys_covalent_spawn_floating_anchor('WELL_B', -TETRA_ANCHOR_OFFSET_Q16, -TETRA_ANCHOR_OFFSET_Q16,  TETRA_ANCHOR_OFFSET_Q16, 'Tetrahedron Beta (-X -Y +Z)'),
      this.sys_covalent_spawn_floating_anchor('WELL_C',  TETRA_ANCHOR_OFFSET_Q16, -TETRA_ANCHOR_OFFSET_Q16, -TETRA_ANCHOR_OFFSET_Q16, 'Tetrahedron Gamma (+X -Y -Z)'),
      this.sys_covalent_spawn_floating_anchor('WELL_D', -TETRA_ANCHOR_OFFSET_Q16,  TETRA_ANCHOR_OFFSET_Q16, -TETRA_ANCHOR_OFFSET_Q16, 'Tetrahedron Delta (-X +Y -Z)'),
    ];

    this.log(`[ 1 === 1 ] 6DOF Arena locked. Verticality engaged.`);
    this.isVolumetricSynthesized = true;
    return { hull, anchors };
  }

  /**
   * Organelle call: sys_covalent_spawn_spherical_bounds(0x08000000)
   * Builds 3D geodesic/spherical spline control points enclosing the void
   */
  public sys_covalent_spawn_spherical_bounds(radiusQ16: number, radiusPx: number): SplineHull {
    const points: SplineControlPoint[] = [];
    const numLat = 6;
    const numLon = 8;
    let ptId = 0;

    // Generate spherical control point nodes along geodesic parallels
    for (let lat = 1; lat < numLat; lat++) {
      const phi = (lat / numLat) * Math.PI - Math.PI / 2; // -pi/2 to pi/2
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      for (let lon = 0; lon < numLon; lon++) {
        const theta = (lon / numLon) * Math.PI * 2;
        const x = this.center.x + Math.cos(theta) * cosPhi * radiusPx;
        const y = this.center.y + Math.sin(theta) * cosPhi * (radiusPx * 0.85);
        const z = this.center.z + sinPhi * radiusPx;

        points.push({
          id: `SPHERE_PT_${ptId++}`,
          baseX: x,
          baseY: y,
          baseZ: z,
          x,
          y,
          z,
          vx: 0,
          vy: 0,
          vz: 0,
          mass: 4.5,
          isAnchor: false,
          strain: 0
        });
      }
    }

    // Poles
    points.push({
      id: `SPHERE_POLE_TOP`,
      baseX: this.center.x,
      baseY: this.center.y,
      baseZ: this.center.z + radiusPx,
      x: this.center.x,
      y: this.center.y,
      z: this.center.z + radiusPx,
      vx: 0, vy: 0, vz: 0,
      mass: 5.0,
      isAnchor: true,
      strain: 0
    });
    points.push({
      id: `SPHERE_POLE_BOTTOM`,
      baseX: this.center.x,
      baseY: this.center.y,
      baseZ: this.center.z - radiusPx,
      x: this.center.x,
      y: this.center.y,
      z: this.center.z - radiusPx,
      vx: 0, vy: 0, vz: 0,
      mass: 5.0,
      isAnchor: true,
      strain: 0
    });

    return {
      id: 'ISOTROPIC_HYPER_SPHERE_HULL',
      points,
      color: '#00f0ff',
      tension: 0.88,
      material: 'MATERIAL_TRANSLUCENT_GLASS',
      refractionIndex: 1.52,
      sphericalRadius: radiusPx
    };
  }

  /**
   * Organelle call: sys_covalent_set_global_gravity
   */
  public sys_covalent_set_global_gravity(gxQ16: number, gyQ16: number, gzQ16: number): void {
    this.gravity = {
      x: q16ToFloat(gxQ16),
      y: q16ToFloat(gyQ16),
      z: q16ToFloat(gzQ16)
    };
  }

  /**
   * Organelle call: sys_covalent_spawn_floating_anchor
   * Converts Q16.16 tetrahedron coordinates to floating 3D Lissajous wells
   */
  public sys_covalent_spawn_floating_anchor(
    id: string,
    xQ16: number,
    yQ16: number,
    zQ16: number,
    label: string
  ): TetherAnchor {
    const scale = this.sphericalRadiusPx / (HYPER_SPHERE_RADIUS_Q16 / 65536);
    const fx = this.center.x + (xQ16 / 65536) * scale * 0.45;
    const fy = this.center.y + (yQ16 / 65536) * scale * 0.40;
    const fz = this.center.z + (zQ16 / 65536) * scale * 0.45;

    return {
      id,
      x: fx,
      y: fy,
      z: fz,
      type: 'THERMODYNAMIC_WELL',
      radius: 18,
      energyValue: 650,
      active: true,
      q16Coords: { x: xQ16, y: yQ16, z: zQ16 },
      lissajous: {
        a: 3,
        b: 2,
        c: 4,
        delta: Math.PI / 3,
        speed: 0.028,
        radius: 34
      }
    };
  }

  /**
   * Deposits kinetic shear strain into the volumetric void (localized dV/dt)
   */
  public depositVolumetricShear(x: number, y: number, z: number, intensity: number): void {
    const clamped = Math.min(1.0, Math.max(0, intensity));
    if (clamped > this.maxDvDt) {
      this.maxDvDt = clamped;
    }
    const relX = x - this.center.x;
    const relY = y - this.center.y;
    const relZ = z - this.center.z;

    for (const pt of this.strainPoints) {
      const dist = Math.hypot(pt.x - relX, pt.y - relY, pt.z - relZ);
      if (dist < 120) {
        const falloff = 1 - dist / 120;
        pt.strain = Math.min(1.0, pt.strain + clamped * falloff * 0.5);
      }
    }
  }

  /**
   * Cools localized strain over ticks
   */
  public coolVolumetricStrain(): void {
    let currentMax = 0;
    for (const pt of this.strainPoints) {
      pt.strain *= 0.94;
      if (pt.strain > currentMax) currentMax = pt.strain;
    }
    this.maxDvDt = currentMax;
  }

  public getVolumetricStrainAt(x: number, y: number, z: number): number {
    const relX = x - this.center.x;
    const relY = y - this.center.y;
    const relZ = z - this.center.z;

    let totalStrain = 0;
    let totalWeight = 0;
    for (const pt of this.strainPoints) {
      const d = Math.hypot(pt.x - relX, pt.y - relY, pt.z - relZ);
      if (d < 140) {
        const w = 1 - d / 140;
        totalStrain += pt.strain * w;
        totalWeight += w;
      }
    }
    return totalWeight > 0 ? Math.min(1.0, totalStrain / totalWeight) : 0;
  }

  private log(msg: string): void {
    console.log(msg);
    this.logs.push(msg);
  }
}
