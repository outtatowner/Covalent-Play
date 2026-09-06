/**
 * Organelle 0xB2_COVALENT: Vector Material Initialization & Generative Material Sieve
 * node_0xARENA_SYNTHESIZER.ts / arena_synthesizer.ts
 * 
 * Target: Baseline Q16.16 Vector Grid Generation
 * Arena: "The Null-Friction Octagon"
 * Floor Plane: Perfectly reflective zero-roughness foundation with emissive lines shifting cyan -> crimson
 * Hulls: Translucent high-albedo glass continuous Bézier splines (8 control points)
 * Anchor Nodes: Suspended 3D Lissajous curves (4 Thermodynamic Wells)
 */

import { SplineControlPoint, SplineHull, TetherAnchor } from '../types';
import { floatToQ16, q16ToFloat, Q16_ONE } from './q16';

export const ARENA_BOUNDS_Q16 = 0x04000000; // 64 units in Q16.16 (64 * 65536 = 4,194,304)
export const WELL_OFFSET_Q16 = 0x02000000;  // 32 units in Q16.16 (32 * 65536 = 2,097,152)

export interface GridSectorStrain {
  col: number;
  row: number;
  worldX: number;
  worldY: number;
  strain: number; // 0.0 to 1.0 (localized dV/dt)
  peakDvDt: number;
}

export class CyberArenaSynthesizer {
  public isSynthesized: boolean = false;
  public synthesisLog: string[] = [];
  public globalAlbedo: number = 0x00000000; // Pure black
  public globalRoughness: number = 0x00000000; // Perfect mirror
  public radiusQ16: number = ARENA_BOUNDS_Q16;

  // Localized Thermodynamic Strain Map (Floor Plane Kinetic Grid)
  public gridCols: number = 24;
  public gridRows: number = 18;
  public strainMap: Float32Array;
  public sectorWidth: number = 40;
  public sectorHeight: number = 40;
  public maxDvDt: number = 0;

  constructor() {
    this.strainMap = new Float32Array(this.gridCols * this.gridRows);
  }

  /**
   * Generates the baseline sparring arena - "The Null-Friction Octagon"
   */
  public generateBaselineGrid(
    centerX: number = 450,
    centerY: number = 350,
    radiusPx: number = 320
  ): { hull: SplineHull; wells: TetherAnchor[] } {
    this.synthesisLog = [];
    this.log(`[ FORGE ] Synthesizing The Null-Friction Octagon...`);

    // 1. Establish the absolute thermodynamic boundary
    const hull = this.sys_covalent_spawn_tensile_bounds(this.radiusQ16, centerX, centerY, radiusPx);
    this.log(`[ FORGE ] Bound: 8 control points octagonal vector cage (0x04000000 Q16)`);

    // 2. Ignite the reactive kinetic floor
    this.sys_covalent_init_kinetic_grid();
    this.log(`[ FORGE ] Kinetic floor ignited: albedo 0x0, roughness 0x0, emissive vector lines`);

    // 3. Spawn 4 Thermodynamic Wells (Lissajous Anchors)
    const wells: TetherAnchor[] = [];
    const wellScale = radiusPx * 0.45;

    // (±0x02000000, ±0x02000000)
    wells.push(this.sys_covalent_spawn_energy_well(WELL_OFFSET_Q16, WELL_OFFSET_Q16, centerX + wellScale, centerY + wellScale, 0));
    wells.push(this.sys_covalent_spawn_energy_well(-WELL_OFFSET_Q16, WELL_OFFSET_Q16, centerX - wellScale, centerY + wellScale, 1));
    wells.push(this.sys_covalent_spawn_energy_well(WELL_OFFSET_Q16, -WELL_OFFSET_Q16, centerX + wellScale, centerY - wellScale, 2));
    wells.push(this.sys_covalent_spawn_energy_well(-WELL_OFFSET_Q16, -WELL_OFFSET_Q16, centerX - wellScale, centerY - wellScale, 3));

    this.log(`[ FORGE ] 4 Thermodynamic Wells (Lissajous Anchors) spawned at (±0x02000000, ±0x02000000)`);
    this.log(`[ 1 === 1 ] Arena topology locked. Ready for tether injection.`);

    this.isSynthesized = true;
    return { hull, wells };
  }

  /**
   * Spawns the deformable boundary splines (8 control points defining circular octagon cage)
   */
  public sys_covalent_spawn_tensile_bounds(
    radiusQ16: number,
    centerX: number,
    centerY: number,
    radiusPx: number
  ): SplineHull {
    const points: SplineControlPoint[] = [];
    const controlPointsQ16 = this.sys_covalent_calculate_octagon_splines(radiusQ16);

    for (let i = 0; i < 8; i++) {
      // 8 vertices of regular octagon offset by 22.5 deg (PI/8)
      const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const bx = centerX + Math.cos(angle) * radiusPx;
      const by = centerY + Math.sin(angle) * (radiusPx * 0.85);

      points.push({
        id: `oct_cp_${i}`,
        baseX: bx,
        baseY: by,
        x: bx,
        y: by,
        vx: 0,
        vy: 0,
        mass: 2.0,
        isAnchor: true,
        strain: 0
      });
    }

    return {
      id: 'hull_NULL_FRICTION_OCTAGON',
      points,
      color: '#00f0ff', // High-albedo Cold Cyan
      tension: 0.16,
      material: 'MATERIAL_TRANSLUCENT_GLASS',
      refractionIndex: 1.52
    };
  }

  /**
   * Generates the 8 Q16 control point pairs
   */
  public sys_covalent_calculate_octagon_splines(radiusQ16: number): [number, number][] {
    const coords: [number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const x = Math.round(Math.cos(angle) * radiusQ16);
      const y = Math.round(Math.sin(angle) * radiusQ16);
      coords.push([x, y]);
    }
    return coords;
  }

  /**
   * Initializes the reactive kinetic floor: pure black, perfect mirror
   */
  public sys_covalent_init_kinetic_grid(): void {
    this.globalAlbedo = 0x00000000;
    this.globalRoughness = 0x00000000;
    this.strainMap.fill(0);
  }

  /**
   * Spawns a Thermodynamic Well with suspended 3D Lissajous curve parameters
   */
  public sys_covalent_spawn_energy_well(
    xQ16: number,
    yQ16: number,
    pixelX: number,
    pixelY: number,
    index: number
  ): TetherAnchor {
    // Unique harmonious Lissajous frequency ratios for each node: 3:2, 5:4, 4:3, 5:3
    const ratios = [
      { a: 3, b: 2, c: 1, delta: Math.PI / 4, speed: 0.024 },
      { a: 5, b: 4, c: 2, delta: Math.PI / 2, speed: 0.020 },
      { a: 4, b: 3, c: 1, delta: Math.PI / 3, speed: 0.026 },
      { a: 5, b: 3, c: 2, delta: 0, speed: 0.022 }
    ];
    const r = ratios[index % ratios.length];

    return {
      id: `thermo_well_${index}`,
      x: pixelX,
      y: pixelY,
      type: 'THERMODYNAMIC_WELL',
      radius: 18,
      energyValue: 60,
      active: true,
      q16Coords: { x: xQ16, y: yQ16 },
      lissajous: {
        a: r.a,
        b: r.b,
        c: r.c,
        delta: r.delta,
        speed: r.speed,
        radius: 26
      }
    };
  }

  /**
   * Deposits localized thermodynamic strain (dV/dt or kinetic shear) into grid sectors
   */
  public depositShear(worldX: number, worldY: number, amount: number): void {
    const col = Math.floor(worldX / this.sectorWidth);
    const row = Math.floor(worldY / this.sectorHeight);

    if (col >= 0 && col < this.gridCols && row >= 0 && row < this.gridRows) {
      const idx = row * this.gridCols + col;
      this.strainMap[idx] = Math.min(1.0, this.strainMap[idx] + amount);

      // Splash to neighbors
      const neighbors = [
        { c: col - 1, r: row, w: 0.4 },
        { c: col + 1, r: row, w: 0.4 },
        { c: col, r: row - 1, w: 0.4 },
        { c: col, r: row + 1, w: 0.4 }
      ];

      for (const n of neighbors) {
        if (n.c >= 0 && n.c < this.gridCols && n.r >= 0 && n.r < this.gridRows) {
          const nIdx = n.r * this.gridCols + n.c;
          this.strainMap[nIdx] = Math.min(1.0, this.strainMap[nIdx] + amount * n.w);
        }
      }
    }

    if (amount > this.maxDvDt) {
      this.maxDvDt = amount;
    }
  }

  /**
   * Decays strain across all grid sectors (thermodynamic relaxation)
   */
  public tickStrain(decayRate: number = 0.94): void {
    let currentMax = 0;
    for (let i = 0; i < this.strainMap.length; i++) {
      this.strainMap[i] *= decayRate;
      if (this.strainMap[i] < 0.001) this.strainMap[i] = 0;
      if (this.strainMap[i] > currentMax) currentMax = this.strainMap[i];
    }
    this.maxDvDt = currentMax;
  }

  /**
   * Returns localized strain at world coordinate
   */
  public getStrainAt(worldX: number, worldY: number): number {
    const col = Math.floor(worldX / this.sectorWidth);
    const row = Math.floor(worldY / this.sectorHeight);
    if (col < 0 || col >= this.gridCols || row < 0 || row >= this.gridRows) return 0;
    return this.strainMap[row * this.gridCols + col];
  }

  private log(msg: string): void {
    this.synthesisLog.push(msg);
  }
}
