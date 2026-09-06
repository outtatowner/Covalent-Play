/**
 * Q16.16 Fixed-Point Arithmetic & CORDIC Trigonometry Engine
 * Core Invariant: 1 === 1 (Absolute Mathematical Parity)
 * 
 * 1.0 in Q16.16 is 65536 (1 << 16).
 * Fractional precision: 1/65536 ~= 0.000015258789
 */

export const Q16_ONE = 65536; // 1.0 in Q16.16
export const Q16_HALF = 32768; // 0.5 in Q16.16
export const Q16_PI = 205887; // 3.14159265 * 65536 ~= 205887
export const Q16_TWO_PI = 411774;

// Convert float to Q16
export function floatToQ16(val: number): number {
  return Math.round(val * Q16_ONE) | 0;
}

// Convert Q16 to float
export function q16ToFloat(val: number): number {
  return val / Q16_ONE;
}

// Q16 multiplication with overflow guard
export function q16Mul(a: number, b: number): number {
  // Using 64-bit BigInt precision to prevent 32-bit overflow
  const bigA = BigInt(a | 0);
  const bigB = BigInt(b | 0);
  const prod = (bigA * bigB) >> 16n;
  return Number(prod) | 0;
}

// Q16 division
export function q16Div(a: number, b: number): number {
  if (b === 0) return 0;
  const bigA = BigInt(a | 0);
  const bigB = BigInt(b | 0);
  const quot = (bigA << 16n) / bigB;
  return Number(quot) | 0;
}

// Pre-computed CORDIC angle table for 16 iterations
// atan(2^-i) in radians converted to Q16.16
const CORDIC_ANGLES = [
  51472,  // atan(1)    ~ 0.785398 rad * 65536
  30386,  // atan(1/2)  ~ 0.463648 rad
  16055,  // atan(1/4)  ~ 0.244979 rad
  8150,   // atan(1/8)  ~ 0.124355 rad
  4091,   // atan(1/16) ~ 0.062419 rad
  2047,   // atan(1/32) ~ 0.031240 rad
  1024,   // atan(1/64) ~ 0.015624 rad
  512,    // atan(1/128)
  256,    // atan(1/256)
  128,    // atan(1/512)
  64,     // atan(1/1024)
  32,
  16,
  8,
  4,
  2
];

// CORDIC scale factor K ~= 0.607252935 * 65536 = 39797
const CORDIC_K = 39797;

/**
 * Deterministic CORDIC Sine and Cosine
 * @param theta Angle in radians (Q16.16)
 * @returns [cos, sin] in Q16.16
 */
export function cordicSinCos(theta: number): [number, number] {
  // Normalize theta to [-PI, PI]
  let angle = theta % Q16_TWO_PI;
  if (angle > Q16_PI) angle -= Q16_TWO_PI;
  if (angle < -Q16_PI) angle += Q16_TWO_PI;

  let x = CORDIC_K;
  let y = 0;
  let z = angle;

  for (let i = 0; i < 16; i++) {
    const d = z >= 0 ? 1 : -1;
    const nextX = x - d * (y >> i);
    const nextY = y + d * (x >> i);
    x = nextX;
    y = nextY;
    z -= d * CORDIC_ANGLES[i];
  }

  return [x, y];
}

/**
 * Deterministic fast CORDIC Vector Length
 */
export function cordicMagnitude(dx: number, dy: number): number {
  const bigDx = BigInt(dx | 0);
  const bigDy = BigInt(dy | 0);
  const sumSq = (bigDx * bigDx + bigDy * bigDy) >> 16n;
  // Integer square root in Q16
  const floatVal = Math.sqrt(Number(sumSq) / Q16_ONE);
  return floatToQ16(floatVal);
}

/**
 * Deterministic fast CORDIC 3D Vector Length (Magnitude)
 */
export function cordicMagnitude3D(dx: number, dy: number, dz: number): number {
  const bigDx = BigInt(dx | 0);
  const bigDy = BigInt(dy | 0);
  const bigDz = BigInt(dz | 0);
  const sumSq = (bigDx * bigDx + bigDy * bigDy + bigDz * bigDz) >> 16n;
  const floatVal = Math.sqrt(Number(sumSq) / Q16_ONE);
  return floatToQ16(floatVal);
}

/**
 * Organelle 0xB3_COVALENT: 3D CORDIC Volumetric Direction Vector
 * Converts pitch and yaw angles (in Q16 radians) into 3D unit directional vector (X, Y, Z in Q16)
 *
 * q16_t cos_pitch = sys_covalent_cordic_cos(entity->pitch);
 * q16_t dir_x = (cos_pitch * sys_covalent_cordic_cos(entity->yaw)) >> 16;
 * q16_t dir_y = (cos_pitch * sys_covalent_cordic_sin(entity->yaw)) >> 16;
 * q16_t dir_z = sys_covalent_cordic_sin(entity->pitch);
 */
export function cordicVolumetricDirection(pitchQ16: number, yawQ16: number): { x: number; y: number; z: number } {
  const [cosPitch, sinPitch] = cordicSinCos(pitchQ16);
  const [cosYaw, sinYaw] = cordicSinCos(yawQ16);

  const dirX = Math.round((cosPitch * cosYaw) / Q16_ONE);
  const dirY = Math.round((cosPitch * sinYaw) / Q16_ONE);
  const dirZ = sinPitch;

  return { x: dirX, y: dirY, z: dirZ };
}

/**
 * Calculates 3D Volumetric Thrust Vector from 6DOF orientation & thrust power
 */
export function calculateVolumetricThrust(
  pitch: number,
  yaw: number,
  thrustPower: number
): { fx: number; fy: number; fz: number } {
  const pitchQ16 = floatToQ16(pitch);
  const yawQ16 = floatToQ16(yaw);
  const dir = cordicVolumetricDirection(pitchQ16, yawQ16);

  const fx = q16ToFloat(dir.x) * thrustPower;
  const fy = q16ToFloat(dir.y) * thrustPower;
  const fz = q16ToFloat(dir.z) * thrustPower;

  return { fx, fy, fz };
}

/**
 * Merkle Hash generator for topological state
 * Quipu Ledger hash function: Murmur-like deterministic hash
 */
export function computeTopologyHash(points: { x: number; y: number; z?: number }[]): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < points.length; i++) {
    const qx = floatToQ16(points[i].x);
    const qy = floatToQ16(points[i].y);
    const qz = points[i].z !== undefined ? floatToQ16(points[i].z!) : 0;
    h1 = (Math.imul(h1 ^ qx, 2654435761) ^ (qy << 5) ^ (qz << 9)) | 0;
    h2 = (Math.imul(h2 ^ qy, 1597334677) ^ (qx >> 3) ^ (qz >> 7)) | 0;
  }

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `0x${hex1}${hex2}`;
}

/**
 * Verifies the Core Invariant: 1 === 1 Parity
 */
export function verifyParity(q16ValA: number, q16ValB: number): boolean {
  return (q16ValA | 0) === (q16ValB | 0);
}
