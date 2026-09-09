/**
 * QCML: Quantum-Congruent Quadbit Machine Language & State Engine
 * Part of Organelle 0xC8_COVALENT: QCNL Transpiler & Arbiter Bridge
 * 
 * 4-pole F_2^4 quadbit opcodes:
 * STAS (0x0), SMUL (0x1), LYAP (0x2), BAN3 (0x3), ROTR (0x4), CORD (0x5),
 * DAMP (0x6), CLMP (0x7), INVT (0x8), PROJ (0x9), DIFF (0xA), TETH (0xB),
 * MERK (0xC), Q16F (0xD), ZERO (0xE), HALT (0xF)
 */

import { QCML_OP } from '../types';

export { QCML_OP };

// 16-color authentic Amber Phosphor CRT Palette for /dev/fb0 software driver
export const AMBER_PHOSPHOR_PALETTE_16 = [
  '#050300', // 0: Deep Obsidian Void
  '#1a0c00', // 1: Ultra-dim Phosphor Decay
  '#2d1600', // 2: Low-State Base
  '#432100', // 3: Dim Amber Glow
  '#5a2d00', // 4: Dark Amber Beam
  '#723900', // 5: Medium-Dark Filament
  '#8b4600', // 6: Steady Amber Trace
  '#a55400', // 7: Mid-Tone Scanline
  '#c06300', // 8: Standard Text Glow
  '#d77000', // 9: Bright Amber Phosphor
  '#ea7e00', // 10: High-Intensity Trace
  '#f58e0a', // 11: Vibrant Beam Pulse
  '#f99f1b', // 12: Super-Heated Cathode
  '#fbb332', // 13: Saturated Phosphor Peak
  '#fdca55', // 14: White-Amber Highlight
  '#ffea88'  // 15: Pure Cathode Core
];

export interface QcmlExecutionEngine {
  energy: number;
  maxEnergy: number;
  lyapunovV: number;
  prevLyapunovV: number;
  deltaV: number; // dV/dt (must be <= 0 for contractive stability)
  theta: number;  // Congruence metric (> 0.95 required)
  thetaQ16: number;
  arbiterGranted: boolean;
  executedOpcodes: QCML_OP[];
  cycles: number;
  stasisLock: boolean;
}

export function createEngine(initialEnergy = 1000): QcmlExecutionEngine {
  return {
    energy: initialEnergy,
    maxEnergy: initialEnergy,
    lyapunovV: 1.0,
    prevLyapunovV: 1.0,
    deltaV: 0.0,
    theta: 0.99,
    thetaQ16: 0x0000FD70, // Fixed point ~0.99
    arbiterGranted: true,
    executedOpcodes: [],
    cycles: 0,
    stasisLock: false
  };
}

export function step(engine: QcmlExecutionEngine, op: QCML_OP, param = 0): void {
  engine.cycles++;
  engine.executedOpcodes.push(op);
  engine.prevLyapunovV = engine.lyapunovV;

  switch (op) {
    case QCML_OP.STAS: // Stasis contractive hold (dV/dt = 0)
      engine.deltaV = 0.0;
      engine.theta = 0.999;
      engine.stasisLock = true;
      break;

    case QCML_OP.SMUL: // Scalar multiplication contractive damping
      const scale = param !== 0 ? (param & 0xFFFF) / 65536.0 : 0.90625;
      engine.energy *= scale;
      engine.lyapunovV *= scale * scale;
      engine.deltaV = engine.lyapunovV - engine.prevLyapunovV;
      engine.theta = Math.min(0.999, Math.max(0.0, 1.0 - (1.0 - scale) * 0.2));
      break;

    case QCML_OP.LYAP: // Lyapunov gradient descent check
      const lyapStep = param !== 0 ? (param & 0xFFFF) / 65536.0 : 0.05;
      engine.lyapunovV = Math.max(0.001, engine.lyapunovV - lyapStep);
      engine.deltaV = engine.lyapunovV - engine.prevLyapunovV;
      engine.theta = engine.deltaV <= 0 ? 0.985 : 0.45;
      break;

    case QCML_OP.BAN3: // 3-Band energy dissipation limiter
      if (engine.energy > engine.maxEnergy * 0.8) {
        engine.energy *= 0.85;
      } else if (engine.energy > engine.maxEnergy * 0.5) {
        engine.energy *= 0.95;
      } else {
        engine.energy *= 0.98;
      }
      engine.deltaV = -0.04;
      engine.theta = 0.975;
      break;

    case QCML_OP.ROTR: // 2D planar rotation step
      engine.theta = 0.965;
      engine.deltaV = -0.005;
      break;

    case QCML_OP.CORD: // CORDIC vector projection
      engine.theta = 0.982;
      engine.deltaV = -0.01;
      break;

    case QCML_OP.DAMP: // Kinetic momentum damping
      engine.energy *= 0.92;
      engine.deltaV = -0.08;
      engine.theta = 0.978;
      break;

    case QCML_OP.CLMP: // Discrete limit clamp
      engine.energy = Math.min(engine.energy, 800);
      engine.deltaV = -0.02;
      engine.theta = 0.99;
      break;

    case QCML_OP.INVT: // Invariant parity assertion (1 === 1)
      engine.theta = 1.0;
      engine.deltaV = 0.0;
      break;

    case QCML_OP.PROJ: // Projection to contractive manifold
      engine.deltaV = -0.035;
      engine.theta = 0.968;
      break;

    case QCML_OP.DIFF: // Differential decay
      engine.energy *= 0.94;
      engine.deltaV = -0.06;
      engine.theta = 0.972;
      break;

    case QCML_OP.TETH: // Vector tether energy dissipation
      engine.energy *= 0.88;
      engine.deltaV = -0.12;
      engine.theta = 0.988;
      break;

    case QCML_OP.MERK: // Merkle tree verification
      engine.theta = 0.995;
      engine.deltaV = 0.0;
      break;

    case QCML_OP.Q16F: // Q16.16 fixed-point operation
      engine.theta = 0.975;
      engine.deltaV = -0.015;
      break;

    case QCML_OP.ZERO: // Zero-phase W-axis clamp
      engine.theta = 0.999;
      engine.deltaV = 0.0;
      break;

    case QCML_OP.HALT: // Contractive barrier halt
      engine.energy = 0;
      engine.deltaV = -engine.lyapunovV;
      engine.lyapunovV = 0;
      engine.theta = 1.0;
      break;
  }

  // Ring0 Congruence Gate check: theta > 0.95 (0x0000F333) and dV/dt <= 0
  engine.thetaQ16 = Math.floor(engine.theta * 65536);
  engine.arbiterGranted = engine.theta > 0.95 && engine.deltaV <= 0.0001;
}

/**
 * Pack up to 16 4-bit nibble opcodes into a 64-bit Quadbit register (covalent_quadbit_word_t)
 */
export function packOpcodes(opcodes: QCML_OP[]): bigint {
  let packed = 0n;
  for (let i = 0; i < 16; i++) {
    const op = i < opcodes.length ? (BigInt(opcodes[i]) & 0xFn) : 0x0n;
    packed |= (op << BigInt(i * 4));
  }
  return packed;
}

/**
 * Unpack 64-bit Quadbit register into 16 4-bit nibbles
 */
export function unpackOpcodes(word: bigint): QCML_OP[] {
  const result: QCML_OP[] = [];
  for (let i = 0; i < 16; i++) {
    const nibble = Number((word >> BigInt(i * 4)) & 0xFn);
    result.push(nibble as QCML_OP);
  }
  return result;
}

export const QCML_OP_INFO: Record<QCML_OP, { name: string; desc: string; contractive: boolean }> = {
  [QCML_OP.STAS]: { name: 'STAS', desc: 'Stasis Contractive Hold (dV/dt = 0)', contractive: true },
  [QCML_OP.SMUL]: { name: 'SMUL', desc: 'Scalar Damping Multiplication (q16)', contractive: true },
  [QCML_OP.LYAP]: { name: 'LYAP', desc: 'Lyapunov Gradient Descent Check', contractive: true },
  [QCML_OP.BAN3]: { name: 'BAN3', desc: '3-Band Dissipative Energy Limiter', contractive: true },
  [QCML_OP.ROTR]: { name: 'ROTR', desc: '2D Planar Orthogonal Rotor Step', contractive: true },
  [QCML_OP.CORD]: { name: 'CORD', desc: 'CORDIC Fixed-Point Projection', contractive: true },
  [QCML_OP.DAMP]: { name: 'DAMP', desc: 'Kinetic Momentum Damping Step', contractive: true },
  [QCML_OP.CLMP]: { name: 'CLMP', desc: 'Discrete Bound Limit Clamp', contractive: true },
  [QCML_OP.INVT]: { name: 'INVT', desc: 'Invariant Assertion (1 === 1)', contractive: true },
  [QCML_OP.PROJ]: { name: 'PROJ', desc: 'Contractive Manifold Projection', contractive: true },
  [QCML_OP.DIFF]: { name: 'DIFF', desc: 'Differential Dynamic Heat Decay', contractive: true },
  [QCML_OP.TETH]: { name: 'TETH', desc: 'Vector Tether Tension Dissipation', contractive: true },
  [QCML_OP.MERK]: { name: 'MERK', desc: 'Quipu Merkle Tree Parity Check', contractive: true },
  [QCML_OP.Q16F]: { name: 'Q16F', desc: 'Q16.16 Fixed Point Math Pipeline', contractive: true },
  [QCML_OP.ZERO]: { name: 'ZERO', desc: 'Zero-Phase W-Axis Dimension Clamp', contractive: true },
  [QCML_OP.HALT]: { name: 'HALT', desc: 'Contractive Barrier Stasis Halt', contractive: true }
};
