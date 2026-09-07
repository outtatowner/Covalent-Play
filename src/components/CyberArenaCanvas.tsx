/**
 * CyberArenaCanvas: Real-time Vector-Spline Arena Display & Direct Manipulator
 * Supports both:
 * 1. VOLUMETRIC 6DOF HYPER-SPHERE (Omni-Directional 3D Zero-G Space)
 *    - 3D perspective projection with orbital camera
 *    - 6DOF gyroscopic gimbal rings (Pitch, Yaw, Roll) without gimbal lock
 *    - Tetrahedral suspended 3D Lissajous Thermodynamic Wells
 *    - Isotropic hyper-spherical boundary with parametric vector meridians
 *    - 3D Bounding Spheres and Thermodynamic Brake shockwave dissipation
 *    - Full 6DOF Flight Telemetry HUD (Artificial Horizon, Velocity Vector, dV/dt)
 * 2. THE NULL-FRICTION OCTAGON (2.5D Baseline Sparring Manifold)
 *    - Zero-roughness reflective floor, parametric emissive grid with dV/dt heatmapping
 *    - Translucent high-albedo glass hulls with ray-traced caustics/refraction fractures
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Entity, ActiveTether, FloatVector, FloatVector3D, TesseractEcho } from '../types';
import { ArenaForge } from '../engine/arena_forge';
import { CyberAthleticTethering } from '../engine/vector_tether';
import { BeInstanceEngine } from '../engine/be_instance';
import { floatToQ16 } from '../engine/q16';
import { cyberAudio } from '../engine/audio';
import { tesseractEngine, TesseractKinematicsEngine } from '../engine/tesseract_kinematics';
import { phaseOfficiator } from '../engine/phase_officiator';
import {
  autopoieticGauntlet,
  SECTOR_ONE_CEILING_FLOAT,
  SECTOR_TWO_CEILING_FLOAT,
  SECTOR_APEX_CEILING_FLOAT
} from '../engine/gauntlet_synthesizer';
import { Orbit, Compass, Eye, Shield, Zap, Sparkles, Layers, Disc } from 'lucide-react';

interface CyberArenaCanvasProps {
  arena: ArenaForge;
  tetherEngine: CyberAthleticTethering;
  beEngine: BeInstanceEngine;
  human: Entity;
  currentTick: number;
  showBVH: boolean;
  showCoordinates: boolean;
  onTetherCreated: () => void;
  onShearApplied: () => void;
}

// Color interpolation for thermodynamic dV/dt strain: Cold Cyan -> Electric Violet -> Warning Crimson
function getStrainColor(strain: number, alpha: number = 1.0): string {
  const s = Math.max(0, Math.min(1, strain));
  if (s < 0.02) {
    return `rgba(0, 240, 255, ${0.18 * alpha})`;
  } else if (s < 0.35) {
    const t = s / 0.35;
    const r = Math.round(0 + t * 140);
    const g = Math.round(240 - t * 160);
    const b = 255;
    const a = 0.25 + t * 0.45;
    return `rgba(${r}, ${g}, ${b}, ${a * alpha})`;
  } else {
    const t = (s - 0.35) / 0.65;
    const r = Math.round(140 + t * 115);
    const g = Math.round(80 - t * 80);
    const b = Math.round(255 - t * 195);
    const a = 0.7 + t * 0.3;
    return `rgba(${r}, ${g}, ${b}, ${a * alpha})`;
  }
}

// 3D Perspective Projection Function
interface Project3DResult {
  sx: number;
  sy: number;
  scale: number;
  depth: number;
  visible: boolean;
}

function project3D(
  x: number,
  y: number,
  z: number,
  originX: number,
  originY: number,
  originZ: number,
  camYaw: number,
  camPitch: number,
  camDist: number,
  fov: number,
  screenW: number,
  screenH: number
): Project3DResult {
  const dx = x - originX;
  const dy = y - originY;
  const dz = z - originZ;

  // Yaw rotation around Y
  const cosY = Math.cos(camYaw);
  const sinY = Math.sin(camYaw);
  const x1 = dx * cosY - dz * sinY;
  const z1 = dx * sinY + dz * cosY;

  // Pitch rotation around X
  const cosP = Math.cos(camPitch);
  const sinP = Math.sin(camPitch);
  const y1 = dy * cosP - z1 * sinP;
  const z2 = dy * sinP + z1 * cosP + camDist;

  if (z2 <= 20) {
    return { sx: 0, sy: 0, scale: 0, depth: z2, visible: false };
  }

  const scale = fov / z2;
  const sx = screenW * 0.5 + x1 * scale;
  const sy = screenH * 0.5 + y1 * scale;

  return { sx, sy, scale, depth: z2, visible: true };
}

export const CyberArenaCanvas: React.FC<CyberArenaCanvasProps> = ({
  arena,
  tetherEngine,
  beEngine,
  human,
  currentTick,
  showBVH,
  showCoordinates,
  onTetherCreated,
  onShearApplied
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Camera Controls State
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [followHuman, setFollowHuman] = useState<boolean>(false);
  const [observerSliceW, setObserverSliceW] = useState<number>(0);
  const activeEchoRef = useRef<TesseractEcho | null>(null);
  const cameraRef = useRef({
    yaw: 0.55,
    pitch: 0.42,
    dist: 520,
    fov: 460
  });

  // Mouse & Pointer interaction state
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number }>({ x: 0, y: 0, yaw: 0, pitch: 0 });
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isMouseDownRef = useRef<boolean>(false);

  // Resize canvas to match display size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;

      arena.center = {
        x: rect.width * 0.5,
        y: rect.height * 0.5
      };
      arena.radiusX = Math.min(360, rect.width * 0.38);
      arena.radiusY = Math.min(270, rect.height * 0.36);

      if (arena.topologyType === 'NULL_FRICTION_OCTAGON') {
        arena.synthesizeNullFrictionOctagon();
      } else if (arena.topologyType === 'ISOTROPIC_HYPER_SPHERE') {
        arena.synthesizeIsotropicHyperSphere();
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [arena]);

  // Main Canvas Render Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const isHyperSphere = arena.topologyType === 'ISOTROPIC_HYPER_SPHERE';
      const use3D = is3DMode || isHyperSphere;

      // Base background: Void Black with sub-5% cool tint
      ctx.fillStyle = '#010409';
      ctx.fillRect(0, 0, width, height);

      if (use3D) {
        // ==========================================
        // 3D VOLUMETRIC ISOTROPIC HYPER-SPHERE MODE
        // ==========================================
        const cam = cameraRef.current;
        const targetX = followHuman ? human.x : arena.center.x;
        const targetY = followHuman ? human.y : arena.center.y;
        const targetZ = followHuman ? (human.z || 0) : 0;

        const proj = (x: number, y: number, z: number = 0) =>
          project3D(x, y, z, targetX, targetY, targetZ, cam.yaw, cam.pitch, cam.dist, cam.fov, width, height);

        // 1. Equatorial Reference Grid Plane (Z = 0)
        const gridSize = 60;
        const gridRadius = 240;
        const numLines = Math.floor(gridRadius / gridSize);

        ctx.save();
        for (let i = -numLines; i <= numLines; i++) {
          const offset = i * gridSize;
          // Line along X
          const p1 = proj(arena.center.x - gridRadius, arena.center.y + offset, 0);
          const p2 = proj(arena.center.x + gridRadius, arena.center.y + offset, 0);
          if (p1.visible && p2.visible) {
            const strain = arena.synthesizer.getStrainAt(arena.center.x, arena.center.y + offset);
            ctx.strokeStyle = getStrainColor(strain, 0.4);
            ctx.lineWidth = strain > 0.3 ? 1.5 : 0.7;
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.stroke();
          }

          // Line along Y
          const q1 = proj(arena.center.x + offset, arena.center.y - gridRadius, 0);
          const q2 = proj(arena.center.x + offset, arena.center.y + gridRadius, 0);
          if (q1.visible && q2.visible) {
            const strain = arena.synthesizer.getStrainAt(arena.center.x + offset, arena.center.y);
            ctx.strokeStyle = getStrainColor(strain, 0.4);
            ctx.lineWidth = strain > 0.3 ? 1.5 : 0.7;
            ctx.beginPath();
            ctx.moveTo(q1.sx, q1.sy);
            ctx.lineTo(q2.sx, q2.sy);
            ctx.stroke();
          }
        }
        ctx.restore();

        // 2. 3D Coordinate Gimbal Axes
        if (showCoordinates) {
          const axisLen = 140;
          const o = proj(arena.center.x, arena.center.y, 0);
          const axX = proj(arena.center.x + axisLen, arena.center.y, 0);
          const axY = proj(arena.center.x, arena.center.y + axisLen, 0);
          const axZ = proj(arena.center.x, arena.center.y, axisLen);

          ctx.save();
          if (o.visible && axX.visible) {
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(o.sx, o.sy);
            ctx.lineTo(axX.sx, axX.sy);
            ctx.stroke();
            ctx.fillStyle = '#00f0ff';
            ctx.font = '10px monospace';
            ctx.fillText('+X (Q16)', axX.sx + 4, axX.sy);
          }
          if (o.visible && axY.visible) {
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(o.sx, o.sy);
            ctx.lineTo(axY.sx, axY.sy);
            ctx.stroke();
            ctx.fillStyle = '#34d399';
            ctx.font = '10px monospace';
            ctx.fillText('+Y (Q16)', axY.sx + 4, axY.sy);
          }
          if (o.visible && axZ.visible) {
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(o.sx, o.sy);
            ctx.lineTo(axZ.sx, axZ.sy);
            ctx.stroke();
            ctx.fillStyle = '#f43f5e';
            ctx.font = '10px monospace';
            ctx.fillText('+Z (ALTITUDE)', axZ.sx + 4, axZ.sy);
          }
          ctx.restore();
        }

        // 3. Volumetric Manifold Bounds: CONTINUOUS TRI-STATE GAUNTLET, NULL-FRICTION TESSERACT, or HYPER-SPHERE
        if (arena.topologyType === 'CONTINUOUS_TRI_STATE_GAUNTLET') {
          ctx.save();

          // 1. Sector I: The Ascent (Z: -240 to 40) - Vertically Collapsing 3D Shaft
          const shaftRings = [-220, -180, -140, -100, -60, -20, 20];
          for (let i = 0; i < shaftRings.length; i++) {
            const rZ = shaftRings[i];
            const t = (rZ - (-240)) / (40 - (-240));
            const ringRadius = 175 - t * 65; // Tapers from 175 down to 110
            const segments = 32;

            ctx.beginPath();
            let started = false;
            for (let s = 0; s <= segments; s++) {
              const ang = (s / segments) * Math.PI * 2;
              const px = arena.center.x + Math.cos(ang) * ringRadius;
              const py = arena.center.y + Math.sin(ang) * ringRadius;
              const p = proj(px, py, rZ);
              if (p.visible) {
                if (!started) {
                  ctx.moveTo(p.sx, p.sy);
                  started = true;
                } else {
                  ctx.lineTo(p.sx, p.sy);
                }
              }
            }
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)'; // Sky cyan
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }

          // 2. Mathematical Gates in Sector I
          const gauntletArchive = autopoieticGauntlet.latestArchive;
          if (gauntletArchive && gauntletArchive.gates) {
            for (const gate of gauntletArchive.gates) {
              const gateCenter = proj(arena.center.x, arena.center.y, gate.z);
              if (gateCenter.visible) {
                const isCleared = gate.cleared;
                const gateColor = isCleared ? '#34d399' : '#38bdf8';

                // Outer Gate Ring
                ctx.save();
                ctx.beginPath();
                const segs = 36;
                for (let s = 0; s <= segs; s++) {
                  const ang = (s / segs) * Math.PI * 2 + gate.pulsePhase;
                  // Add periodic phase notch teeth
                  const tooth = Math.sin(ang * 8) * 4;
                  const rad = gate.outerRadius + tooth;
                  const p = proj(arena.center.x + Math.cos(ang) * rad, arena.center.y + Math.sin(ang) * rad, gate.z);
                  if (p.visible) {
                    if (s === 0) ctx.moveTo(p.sx, p.sy);
                    else ctx.lineTo(p.sx, p.sy);
                  }
                }
                ctx.strokeStyle = isCleared ? 'rgba(52, 211, 153, 0.8)' : 'rgba(56, 189, 248, 0.7)';
                ctx.lineWidth = 2.0;
                ctx.shadowColor = gateColor;
                ctx.shadowBlur = 12;
                ctx.stroke();
                ctx.restore();

                // Inner Safe Aperture Circle
                ctx.save();
                ctx.beginPath();
                for (let s = 0; s <= segs; s++) {
                  const ang = (s / segs) * Math.PI * 2;
                  const p = proj(arena.center.x + Math.cos(ang) * gate.apertureRadius, arena.center.y + Math.sin(ang) * gate.apertureRadius, gate.z);
                  if (p.visible) {
                    if (s === 0) ctx.moveTo(p.sx, p.sy);
                    else ctx.lineTo(p.sx, p.sy);
                  }
                }
                ctx.strokeStyle = isCleared ? 'rgba(52, 211, 153, 0.9)' : 'rgba(245, 158, 11, 0.75)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([3, 3]);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();

                // Gate Label & HUD Tag in 3D
                const labelPos = proj(arena.center.x + gate.outerRadius + 8, arena.center.y, gate.z);
                if (labelPos.visible) {
                  ctx.fillStyle = gateColor;
                  ctx.font = '9px monospace';
                  ctx.fillText(`${gate.label}`, labelPos.sx, labelPos.sy);
                  ctx.fillStyle = isCleared ? '#34d399' : '#f59e0b';
                  ctx.font = '8px monospace';
                  ctx.fillText(`REQ W: ${gate.requiredWPhase.toFixed(1)} // ${isCleared ? '[CLEARED]' : '[SLIP REQ]'}`, labelPos.sx, labelPos.sy + 11);
                }
              }
            }
          }

          // 3. Phase Horizon 1: Z = 40 (Ascent ➔ Breach Membrane)
          const h1Center = proj(arena.center.x, arena.center.y, SECTOR_ONE_CEILING_FLOAT);
          if (h1Center.visible) {
            ctx.save();
            ctx.beginPath();
            const h1Radius = 240;
            const h1Segs = 6;
            for (let s = 0; s <= h1Segs; s++) {
              const ang = (s / h1Segs) * Math.PI * 2;
              const p = proj(arena.center.x + Math.cos(ang) * h1Radius, arena.center.y + Math.sin(ang) * h1Radius, SECTOR_ONE_CEILING_FLOAT);
              if (p.visible) {
                if (s === 0) ctx.moveTo(p.sx, p.sy);
                else ctx.lineTo(p.sx, p.sy);
              }
            }
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
            ctx.lineWidth = 2.2;
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 14;
            ctx.stroke();
            ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
            ctx.fill();

            ctx.fillStyle = '#6ee7b7';
            ctx.font = '10px monospace';
            ctx.fillText(`▲ HORIZON 1: THE BREACH [Z: +${SECTOR_ONE_CEILING_FLOAT.toFixed(0)}] // 0x00 ➔ 0x01 CO-OP RESURGENCE`, h1Center.sx - 150, h1Center.sy);
            ctx.restore();
          }

          // 4. Sector II: The Breach (Z: 40 to 260) - Heavy-Friction 4D Tesseract Chamber
          const breachRings = [100, 160, 220];
          for (const bZ of breachRings) {
            ctx.beginPath();
            const segs = 12;
            const rad = 280;
            for (let s = 0; s <= segs; s++) {
              const ang = (s / segs) * Math.PI * 2;
              const p = proj(arena.center.x + Math.cos(ang) * rad, arena.center.y + Math.sin(ang) * rad, bZ);
              if (p.visible) {
                if (s === 0) ctx.moveTo(p.sx, p.sy);
                else ctx.lineTo(p.sx, p.sy);
              }
            }
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.22)';
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }

          // 5. Phase Horizon 2: Z = 260 (Breach ➔ Apex Zero-Latency Threshold)
          const h2Center = proj(arena.center.x, arena.center.y, SECTOR_TWO_CEILING_FLOAT);
          if (h2Center.visible) {
            ctx.save();
            ctx.beginPath();
            const h2Radius = 260;
            const h2Segs = 8;
            for (let s = 0; s <= h2Segs; s++) {
              const ang = (s / h2Segs) * Math.PI * 2;
              const p = proj(arena.center.x + Math.cos(ang) * h2Radius, arena.center.y + Math.sin(ang) * h2Radius, SECTOR_TWO_CEILING_FLOAT);
              if (p.visible) {
                if (s === 0) ctx.moveTo(p.sx, p.sy);
                else ctx.lineTo(p.sx, p.sy);
              }
            }
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
            ctx.lineWidth = 2.4;
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 16;
            ctx.stroke();
            ctx.fillStyle = 'rgba(244, 63, 94, 0.06)';
            ctx.fill();

            ctx.fillStyle = '#fda4af';
            ctx.font = '10px monospace';
            ctx.fillText(`▲ HORIZON 2: THE APEX [Z: +${SECTOR_TWO_CEILING_FLOAT.toFixed(0)}] // 0x01 ➔ 0xFF ZERO-LATENCY DUEL`, h2Center.sx - 150, h2Center.sy);
            ctx.restore();
          }

          // 6. Sector III: The Apex (Z: 260 to 440) - Crown Arena Platform
          const apexLevels = [300, 360, 420];
          for (let i = 0; i < apexLevels.length; i++) {
            const aZ = apexLevels[i];
            const rad = 250 - i * 30;
            ctx.beginPath();
            const segs = 8;
            for (let s = 0; s <= segs; s++) {
              const ang = (s / segs) * Math.PI * 2;
              const p = proj(arena.center.x + Math.cos(ang) * rad, arena.center.y + Math.sin(ang) * rad, aZ);
              if (p.visible) {
                if (s === 0) ctx.moveTo(p.sx, p.sy);
                else ctx.lineTo(p.sx, p.sy);
              }
            }
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }

          ctx.restore();
        } else if (arena.topologyType === 'THE_NULL_FRICTION_TESSERACT') {
          // Organelle 0xB5: Project 4D Tesseract to 3D via 4D Perspective Division
          arena.tesseractRotor[3] = (arena.tesseractRotor[3] + 0.003) % (Math.PI * 2); // XW plane
          arena.tesseractRotor[4] = (arena.tesseractRotor[4] + 0.002) % (Math.PI * 2); // YW plane
          arena.tesseractRotor[0] = (arena.tesseractRotor[0] + 0.001) % (Math.PI * 2); // XY plane

          const tesseractScale = Math.min(arena.radiusX, 220);
          const projected4D = tesseractEngine.getTesseractProjectedVertices(
            tesseractScale,
            arena.tesseractRotor,
            observerSliceW
          );

          ctx.save();
          // Draw the 32 edges connecting the 16 hyper-nodes of the 4D Hypercube
          for (let e = 0; e < TesseractKinematicsEngine.TESSERACT_EDGES.length; e++) {
            const [v1, v2] = TesseractKinematicsEngine.TESSERACT_EDGES[e];
            const p1_4d = projected4D[v1];
            const p2_4d = projected4D[v2];

            const s1 = proj(arena.center.x + p1_4d.p3.x, arena.center.y + p1_4d.p3.y, p1_4d.p3.z);
            const s2 = proj(arena.center.x + p2_4d.p3.x, arena.center.y + p2_4d.p3.y, p2_4d.p3.z);

            if (s1.visible && s2.visible) {
              const avgW = (p1_4d.p4.w + p2_4d.p4.w) * 0.5;
              const wDiff = Math.abs(avgW - observerSliceW);
              const alpha = Math.max(0.12, Math.min(0.9, 1 - wDiff / (tesseractScale * 1.5)));

              // Hypercube edges shift between cyan (in-phase) to fuchsia (hyper-plane phase)
              ctx.strokeStyle = wDiff < 30 ? `rgba(0, 240, 255, ${alpha})` : `rgba(217, 70, 239, ${alpha})`;
              ctx.lineWidth = wDiff < 30 ? 1.6 : 0.9;
              ctx.beginPath();
              ctx.moveTo(s1.sx, s1.sy);
              ctx.lineTo(s2.sx, s2.sy);
              ctx.stroke();
            }
          }

          // Draw the 16 4D Hyper-Vertices
          for (let i = 0; i < projected4D.length; i++) {
            const vert = projected4D[i];
            const sp = proj(arena.center.x + vert.p3.x, arena.center.y + vert.p3.y, vert.p3.z);
            if (sp.visible) {
              const wDiff = Math.abs(vert.p4.w - observerSliceW);
              ctx.fillStyle = wDiff < 25 ? '#00f0ff' : '#ec4899';
              ctx.beginPath();
              ctx.arc(sp.sx, sp.sy, Math.max(2, 3.8 * sp.scale * vert.wScale), 0, Math.PI * 2);
              ctx.fill();

              if (showCoordinates && sp.scale > 0.8) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.font = '8px monospace';
                ctx.fillText(`v${i}[w:${Math.round(vert.p4.w)}]`, sp.sx + 5, sp.sy - 3);
              }
            }
          }
          ctx.restore();
        } else {
          // 3. Volumetric Isotropic Hyper-Sphere Bounds
          const sphereRadius = Math.min(arena.radiusX, 220);
          const latRings = [-0.65, -0.35, 0, 0.35, 0.65];
          const numMeridians = 8;

          ctx.save();
          // Latitude rings in 3D
          for (const lat of latRings) {
            const ringZ = Math.sin(lat * Math.PI) * sphereRadius;
            const ringRad = Math.cos(lat * Math.PI) * sphereRadius;
            const segments = 48;
            ctx.beginPath();
            let started = false;
            for (let s = 0; s <= segments; s++) {
              const theta = (s / segments) * Math.PI * 2;
              const px = arena.center.x + Math.cos(theta) * ringRad;
              const py = arena.center.y + Math.sin(theta) * ringRad;
              const p = proj(px, py, ringZ);
              if (p.visible) {
                if (!started) {
                  ctx.moveTo(p.sx, p.sy);
                  started = true;
                } else {
                  ctx.lineTo(p.sx, p.sy);
                }
              }
            }
            ctx.strokeStyle = lat === 0 ? 'rgba(0, 240, 255, 0.35)' : 'rgba(14, 116, 144, 0.22)';
            ctx.lineWidth = lat === 0 ? 1.5 : 0.8;
            ctx.stroke();
          }

          // Longitude meridians in 3D
          for (let m = 0; m < numMeridians; m++) {
            const mAngle = (m / numMeridians) * Math.PI;
            const segments = 36;
            ctx.beginPath();
            let started = false;
            for (let s = 0; s <= segments; s++) {
              const phi = (s / segments) * Math.PI * 2;
              const px = arena.center.x + Math.sin(phi) * Math.cos(mAngle) * sphereRadius;
              const py = arena.center.y + Math.sin(phi) * Math.sin(mAngle) * sphereRadius;
              const pz = Math.cos(phi) * sphereRadius;
              const p = proj(px, py, pz);
              if (p.visible) {
                if (!started) {
                  ctx.moveTo(p.sx, p.sy);
                  started = true;
                } else {
                  ctx.lineTo(p.sx, p.sy);
                }
              }
            }
            ctx.strokeStyle = 'rgba(2, 132, 199, 0.18)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
          ctx.restore();
        }

        // 4. Spline Hull Points Projected in 3D
        const hullPoints = arena.hull.points;
        if (hullPoints.length > 2) {
          ctx.save();
          ctx.beginPath();
          let started = false;
          for (let i = 0; i <= hullPoints.length; i++) {
            const pt = hullPoints[i % hullPoints.length];
            const p = proj(pt.x, pt.y, pt.z || 0);
            if (p.visible) {
              if (!started) {
                ctx.moveTo(p.sx, p.sy);
                started = true;
              } else {
                ctx.lineTo(p.sx, p.sy);
              }
            }
          }
          ctx.strokeStyle = 'rgba(235, 254, 255, 0.75)';
          ctx.lineWidth = 2.0;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 10;
          ctx.stroke();

          // Spline nodes
          for (let i = 0; i < hullPoints.length; i++) {
            const pt = hullPoints[i];
            const p = proj(pt.x, pt.y, pt.z || 0);
            if (p.visible) {
              ctx.fillStyle = pt.strain && pt.strain > 2 ? '#f43f5e' : '#00f0ff';
              ctx.beginPath();
              ctx.arc(p.sx, p.sy, 4 * p.scale, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.restore();
        }

        // 5. 4 Tetrahedral Suspended 3D Lissajous Thermodynamic Wells
        const wells = arena.anchors.filter(a => a.active);

        // Draw Tetrahedral Structural Connectors between the 4 wells
        if (wells.length >= 4) {
          ctx.save();
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
          ctx.lineWidth = 1.0;
          ctx.setLineDash([4, 6]);
          for (let i = 0; i < wells.length; i++) {
            for (let j = i + 1; j < wells.length; j++) {
              const p1 = proj(wells[i].x, wells[i].y, wells[i].z || 0);
              const p2 = proj(wells[j].x, wells[j].y, wells[j].z || 0);
              if (p1.visible && p2.visible) {
                ctx.beginPath();
                ctx.moveTo(p1.sx, p1.sy);
                ctx.lineTo(p2.sx, p2.sy);
                ctx.stroke();
              }
            }
          }
          ctx.setLineDash([]);
          ctx.restore();
        }

        // Render each 3D Lissajous Anchor
        for (let idx = 0; idx < wells.length; idx++) {
          const w = wells[idx];
          const wCenter = proj(w.x, w.y, w.z || 0);
          if (!wCenter.visible) continue;

          ctx.save();
          // Draw Suspended 3D Lissajous Loop
          const params = w.lissajous || { a: 3, b: 2, c: 1, delta: Math.PI / 4, speed: 0.024, radius: 26 };
          const samples = 56;
          const curveYaw = currentTick * params.speed + idx * 1.57;

          ctx.beginPath();
          let curveStarted = false;
          for (let s = 0; s <= samples; s++) {
            const theta = (s / samples) * Math.PI * 2;
            const lx = params.radius * Math.sin(params.a * theta + params.delta);
            const ly = params.radius * Math.sin(params.b * theta);
            const lz = (params.radius * 0.85) * Math.cos(params.c * theta + currentTick * 0.03);

            // Rotate around well center
            const rx = lx * Math.cos(curveYaw) - lz * Math.sin(curveYaw);
            const rz = lx * Math.sin(curveYaw) + lz * Math.cos(curveYaw);

            const lp = proj(w.x + rx, w.y + ly, (w.z || 0) + rz);
            if (lp.visible) {
              if (!curveStarted) {
                ctx.moveTo(lp.sx, lp.sy);
                curveStarted = true;
              } else {
                ctx.lineTo(lp.sx, lp.sy);
              }
            }
          }
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.5 + 0.5 * Math.sin(currentTick * 0.05 + idx)})`;
          ctx.lineWidth = 1.8 * wCenter.scale;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 12;
          ctx.stroke();

          // Singularity Core Sphere
          const pulse = 1 + 0.2 * Math.sin(currentTick * 0.1 + idx);
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(wCenter.sx, wCenter.sy, 6 * wCenter.scale * pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Well Identifier & 3D Coordinates
          ctx.fillStyle = '#67e8f9';
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`WELL ${idx + 1} [Z: ${(w.z || 0).toFixed(0)}]`, wCenter.sx, wCenter.sy + 22 * wCenter.scale);
          ctx.restore();
        }

        // 6. Render 3D Tethers
        const render3DTether = (ent: Entity, tether: ActiveTether) => {
          let targetPoint: FloatVector3D = { x: 0, y: 0, z: 0 };
          if (tether.targetAnchorId) {
            const anc = arena.anchors.find(a => a.id === tether.targetAnchorId);
            if (anc) targetPoint = { x: anc.x, y: anc.y, z: anc.z || 0 };
          } else if (tether.splinePointIndex !== undefined) {
            const pt = arena.hull.points[tether.splinePointIndex];
            if (pt) targetPoint = { x: pt.x, y: pt.y, z: pt.z || 0 };
          } else if (tether.targetPoint3D) {
            targetPoint = tether.targetPoint3D;
          } else if (tether.targetPoint) {
            targetPoint = { x: tether.targetPoint.x, y: tether.targetPoint.y, z: 0 };
          }

          const ep = proj(ent.x, ent.y, ent.z || 0);
          const tp = proj(targetPoint.x, targetPoint.y, targetPoint.z);

          if (ep.visible && tp.visible) {
            const tension = tether.tension;
            const tetherColor = tension > 0.8 ? '#ef4444' : tension > 0.5 ? '#f59e0b' : tether.color;

            ctx.save();
            ctx.strokeStyle = tetherColor;
            ctx.shadowColor = tetherColor;
            ctx.shadowBlur = 12;
            ctx.lineWidth = (2 + tension * 2.5) * ep.scale;

            // 3D dynamic sag midpoint
            const midX = (ent.x + targetPoint.x) * 0.5;
            const midY = (ent.y + targetPoint.y) * 0.5;
            const midZ = (ent.z || 0 + targetPoint.z) * 0.5 - (1.0 - tension) * 20;
            const mp = proj(midX, midY, midZ);

            ctx.beginPath();
            ctx.moveTo(ep.sx, ep.sy);
            ctx.quadraticCurveTo(mp.sx, mp.sy, tp.sx, tp.sy);
            ctx.stroke();

            // Energy siphon pulses along tether
            const pulseCount = 4;
            for (let i = 0; i < pulseCount; i++) {
              const phase = ((currentTick * 0.06 + i / pulseCount) % 1);
              const px = ent.x + (targetPoint.x - ent.x) * phase;
              const py = ent.y + (targetPoint.y - ent.y) * phase;
              const pz = (ent.z || 0) + (targetPoint.z - (ent.z || 0)) * phase;
              const pp = proj(px, py, pz);
              if (pp.visible) {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(pp.sx, pp.sy, 2.5 * pp.scale, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            ctx.restore();
          }
        };

        if (human.activeTether) render3DTether(human, human.activeTether);
        if (beEngine.entity.activeTether) render3DTether(beEngine.entity, beEngine.entity.activeTether);

        // 6b. Tri-State Sparring Matrix Visual Layers:
        // [State 0x00: PvE (The Mirror)] Telegraphed W-Lissajous phase trajectory
        if (beEngine.mode === 'COACH' && beEngine.telegraphedLissajousPoints.length > 1) {
          ctx.save();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 1.8;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          let started = false;
          for (let i = 0; i < beEngine.telegraphedLissajousPoints.length; i++) {
            const lp = beEngine.telegraphedLissajousPoints[i];
            const p = proj(lp.x, lp.y, lp.z);
            if (p.visible) {
              if (!started) {
                ctx.moveTo(p.sx, p.sy);
                started = true;
              } else {
                ctx.lineTo(p.sx, p.sy);
              }
              // Small waypoint node every 5 points
              if (i % 5 === 0) {
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(p.sx - 2, p.sy - 2, 4, 4);
              }
            }
          }
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }

        // [State 0x01: Co-Op (The Multiplier)] 4D Procedural Swarm Daemons
        if (beEngine.mode === 'COOP_PEER' && beEngine.daemons.length > 0) {
          for (const d of beEngine.daemons) {
            const dp = proj(d.x, d.y, d.z || 0);
            if (!dp.visible) continue;
            const cross = tesseractEngine.calculateCrossSectionRadius(d.w, observerSliceW, d.radius * 1.8);
            const r3D = Math.max(3, cross.apparentRadius * dp.scale);

            ctx.save();
            ctx.fillStyle = cross.isPhasedOut ? 'rgba(168, 85, 247, 0.25)' : 'rgba(192, 132, 252, 0.85)';
            ctx.strokeStyle = '#c084fc';
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 8;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(dp.sx, dp.sy, r3D, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Daemon label & phase depth
            ctx.fillStyle = '#e9d5ff';
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`4D DAEMON [W: ${d.w.toFixed(1)}]`, dp.sx, dp.sy - r3D - 4);
            ctx.restore();
          }
        }

        // [State 0x01: Co-Op] Macro-Deformation Dimensional Shockwave
        if (beEngine.macroDeformationActive) {
          ctx.save();
          const waveRadius = (60 - beEngine.macroDeformationTicks) * 14;
          const centerP = proj(arena.center.x, arena.center.y, 0);
          if (centerP.visible) {
            ctx.strokeStyle = '#34d399';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 24;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(centerP.sx, centerP.sy, waveRadius * centerP.scale, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(52, 211, 153, 0.12)';
            ctx.fill();

            ctx.fillStyle = '#a7f3d0';
            ctx.font = '11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('4D MACRO-DEFORMATION: WALL PLANE RIPPED INTO W-AXIS // SWARM CRUSHED', centerP.sx, centerP.sy - waveRadius * centerP.scale - 8);
          }
          ctx.restore();
        }

        // [State 0xFF: True Unbound] Kinetic Intercept Traps
        if (beEngine.mode === 'ADVERSARY' && beEngine.kineticTraps.length > 0) {
          for (const trap of beEngine.kineticTraps) {
            const tp = proj(trap.x, trap.y, trap.z || 0);
            if (!tp.visible) continue;
            ctx.save();
            const rad = trap.radius * tp.scale;
            ctx.strokeStyle = trap.triggered ? '#ef4444' : '#06b6d4';
            ctx.shadowColor = trap.triggered ? '#dc2626' : '#0891b2';
            ctx.shadowBlur = 14;
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(tp.sx, tp.sy, rad, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Crosshair
            ctx.beginPath();
            ctx.moveTo(tp.sx - rad, tp.sy);
            ctx.lineTo(tp.sx + rad, tp.sy);
            ctx.moveTo(tp.sx, tp.sy - rad);
            ctx.lineTo(tp.sx, tp.sy + rad);
            ctx.stroke();

            ctx.fillStyle = trap.triggered ? '#fca5a5' : '#67e8f9';
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(trap.triggered ? 'TRAP DETONATED' : `KINETIC TRAP [${trap.durationTicks}t]`, tp.sx, tp.sy + rad + 12);
            ctx.restore();
          }
        }

        // Floor Strain warning when Ledger Forgiveness is active
        if (human.ledgerForgivenessActive) {
          ctx.save();
          const pulse = Math.sin(currentTick * 0.3);
          ctx.strokeStyle = `rgba(245, 158, 11, ${0.6 + 0.4 * pulse})`;
          ctx.lineWidth = 3;
          ctx.strokeRect(6, 6, width - 12, height - 12);

          ctx.fillStyle = '#fef08a';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('[EMISSIVE FLOOR STRAIN // LEDGER FORGIVENESS ACTIVE // GRAZING BANKRUPTCY]', width * 0.5, height - 20);
          ctx.restore();
        }

        // Tri-State Banner at top
        ctx.save();
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        if (beEngine.mode === 'COACH') {
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('SPARRING STATE 0x00: PvE (THE MIRROR) // 250ms COGNITIVE DELAY // TELEGRAPHED W-LISSAJOUS // LEDGER FORGIVENESS', width * 0.5, 20);
        } else if (beEngine.mode === 'COOP_PEER') {
          ctx.fillStyle = '#34d399';
          ctx.fillText('SPARRING STATE 0x01: CO-OP (THE MULTIPLIER) // CONSTRUCTIVE INTERFERENCE: dV/dt HALVED // 4D SWARM ACTIVE', width * 0.5, 20);
        } else {
          ctx.fillStyle = '#f43f5e';
          ctx.fillText('SPARRING STATE 0xFF: TRUE UNBOUND (THE ABSOLUTE) // ZERO-LATENCY CORDIC // WEAPONIZED THERMODYNAMIC EXHAUSTION', width * 0.5, 20);
        }
        ctx.restore();

        // 7. Render 6DOF Entities with 4D Cross-Sectional Projection & Tesseract Echoes
        const render6DOFEntity = (ent: Entity) => {
          const ep = proj(ent.x, ent.y, ent.z || 0);
          if (!ep.visible) return;

          // Organelle 0xB5: 4D Cross-Sectional slice projection: r_3D^2 = r_4D^2 - (w - observerSliceW)^2
          const cross = tesseractEngine.calculateCrossSectionRadius(
            ent.w || 0,
            observerSliceW,
            ent.hyperRadius || (ent.boundingRadius || ent.radius || 18) * 1.5
          );

          // If entity has stepped out of this 3D reality slice:
          if (cross.isPhasedOut) {
            // Render Organelle 0xB6: Tesseract Echo (Faint Wireframe Projection)
            const echo = phaseOfficiator.generateEcho(ent, observerSliceW);
            if (echo) {
              if (ent.id === beEngine.entity.id) {
                activeEchoRef.current = echo;
              }

              ctx.save();
              const pulse = 0.5 + 0.5 * Math.sin(currentTick * 0.18);
              const ghostRad = (ent.radius * 1.4) * ep.scale;

              ctx.strokeStyle = ent.id === beEngine.entity.id ? 'rgba(236, 72, 153, 0.45)' : 'rgba(0, 240, 255, 0.45)';
              ctx.lineWidth = 1.4;
              ctx.setLineDash([4, 4]);

              // Concentric 4D phase ghost rings
              ctx.beginPath();
              ctx.arc(ep.sx, ep.sy, ghostRad, 0, Math.PI * 2);
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(ep.sx, ep.sy, ghostRad * (0.6 + 0.3 * pulse), 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);

              // 4D Echo Status Label
              ctx.fillStyle = ent.color;
              ctx.font = '9px monospace';
              ctx.textAlign = 'center';
              ctx.fillText(`[TESSERACT ECHO: W=${(ent.w || 0).toFixed(1)}]`, ep.sx, ep.sy - ghostRad - 12);
              ctx.fillText(`PHASE VACUUM BLEED: ${(ent.phaseBleed || 0).toFixed(2)}J/t`, ep.sx, ep.sy - ghostRad - 2);

              // Draw forecast vector to PREDICTED RE-ENTRY POINT
              const rp = proj(echo.predictedReentryPoint.x, echo.predictedReentryPoint.y, echo.predictedReentryPoint.z);
              if (rp.visible) {
                ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)'; // Amber forecast vector
                ctx.lineWidth = 1.8;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(ep.sx, ep.sy);
                ctx.lineTo(rp.sx, rp.sy);
                ctx.stroke();
                ctx.setLineDash([]);

                // Holographic Re-entry Target Reticle
                const reticleRad = 16 * rp.scale;
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(rp.sx, rp.sy, reticleRad, 0, Math.PI * 2);
                ctx.stroke();

                // Target crosshair
                ctx.beginPath();
                ctx.moveTo(rp.sx - reticleRad - 4, rp.sy);
                ctx.lineTo(rp.sx + reticleRad + 4, rp.sy);
                ctx.moveTo(rp.sx, rp.sy - reticleRad - 4);
                ctx.lineTo(rp.sx, rp.sy + reticleRad + 4);
                ctx.stroke();

                ctx.fillStyle = '#fbbf24';
                ctx.font = '9px monospace';
                ctx.fillText(`PREDICTED 3D RE-ENTRY`, rp.sx, rp.sy + reticleRad + 12);
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`[CLICK TARGET TO SHATTER STASIS]`, rp.sx, rp.sy + reticleRad + 22);
              }

              ctx.restore();
            }
            return;
          }

          // Entity is in 3D cross-sectional slice!
          // Apparent radius scales dynamically with slice intersection
          const baseRadius = Math.max(3, cross.apparentRadius * ep.scale);

          ctx.save();

          // 7a. 3D Motion Ribbon Trail
          if (ent.trail3D && ent.trail3D.length > 1) {
            ctx.beginPath();
            let trailStarted = false;
            for (let i = 0; i < ent.trail3D.length; i++) {
              const tp = proj(ent.trail3D[i].x, ent.trail3D[i].y, ent.trail3D[i].z);
              if (tp.visible) {
                if (!trailStarted) {
                  ctx.moveTo(tp.sx, tp.sy);
                  trailStarted = true;
                } else {
                  ctx.lineTo(tp.sx, tp.sy);
                }
              }
            }
            ctx.strokeStyle = ent.color;
            ctx.globalAlpha = 0.35;
            ctx.lineWidth = 2.5 * ep.scale;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }

          // 7b. Thermodynamic Brake Shockwave
          if (ent.isBraking) {
            const shockRadius = baseRadius * (1.8 + 0.4 * Math.sin(currentTick * 0.4));
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(ep.sx, ep.sy, shockRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
            ctx.fill();

            // Siphon dissipation spark particles
            for (let k = 0; k < 6; k++) {
              const angle = currentTick * 0.2 + (k / 6) * Math.PI * 2;
              const spX = ep.sx + Math.cos(angle) * (shockRadius + 8);
              const spY = ep.sy + Math.sin(angle) * (shockRadius + 8);
              ctx.fillStyle = '#ff003c';
              ctx.beginPath();
              ctx.arc(spX, spY, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // 7c. Volumetric Illuminated Bounding Sphere
          const sphereGrad = ctx.createRadialGradient(
            ep.sx - baseRadius * 0.3, ep.sy - baseRadius * 0.3, baseRadius * 0.1,
            ep.sx, ep.sy, baseRadius
          );
          sphereGrad.addColorStop(0, '#ffffff');
          sphereGrad.addColorStop(0.4, ent.color);
          sphereGrad.addColorStop(1, '#02182b');

          ctx.fillStyle = sphereGrad;
          ctx.beginPath();
          ctx.arc(ep.sx, ep.sy, baseRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // 7d. 6DOF Orthogonal Gyroscopic Gimbal Rings (Pitch, Yaw, Roll)
          // Visualizes orientation in space without gimbal lock
          const numRingPts = 28;
          const drawGimbalRing = (ringPlane: 'YAW' | 'PITCH' | 'ROLL', color: string) => {
            ctx.beginPath();
            let ringStarted = false;
            for (let i = 0; i <= numRingPts; i++) {
              const theta = (i / numRingPts) * Math.PI * 2;
              let lx = 0, ly = 0, lz = 0;
              const r = ent.radius * 1.35;

              if (ringPlane === 'YAW') {
                lx = Math.cos(theta) * r;
                ly = Math.sin(theta) * r;
                lz = 0;
              } else if (ringPlane === 'PITCH') {
                lx = Math.cos(theta) * r;
                ly = 0;
                lz = Math.sin(theta) * r;
              } else {
                lx = 0;
                ly = Math.cos(theta) * r;
                lz = Math.sin(theta) * r;
              }

              // Apply 6DOF entity rotation (pitch, yaw, roll)
              const cosY = Math.cos(ent.yaw);
              const sinY = Math.sin(ent.yaw);
              const cosP = Math.cos(ent.pitch);
              const sinP = Math.sin(ent.pitch);
              const cosR = Math.cos(ent.roll);
              const sinR = Math.sin(ent.roll);

              // 3D rotation matrix multiplication
              const rx1 = lx * cosR - ly * sinR;
              const ry1 = lx * sinR + ly * cosR;
              const rx2 = rx1 * cosP + lz * sinP;
              const rz2 = -rx1 * sinP + lz * cosP;
              const finalX = rx2 * cosY - ry1 * sinY;
              const finalY = rx2 * sinY + ry1 * cosY;
              const finalZ = rz2;

              const rp = proj(ent.x + finalX, ent.y + finalY, (ent.z || 0) + finalZ);
              if (rp.visible) {
                if (!ringStarted) {
                  ctx.moveTo(rp.sx, rp.sy);
                  ringStarted = true;
                } else {
                  ctx.lineTo(rp.sx, rp.sy);
                }
              }
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          };

          drawGimbalRing('YAW', 'rgba(0, 240, 255, 0.7)');   // Cyan Yaw Ring
          drawGimbalRing('PITCH', 'rgba(251, 191, 36, 0.7)'); // Amber Pitch Ring
          drawGimbalRing('ROLL', 'rgba(236, 72, 153, 0.7)');  // Pink Roll Ring

          // 7e. 3D Velocity Vector Heading
          const speed3D = Math.hypot(ent.vx, ent.vy, ent.vz || 0);
          if (speed3D > 0.3) {
            const headP = proj(
              ent.x + (ent.vx / speed3D) * (ent.radius + 18),
              ent.y + (ent.vy / speed3D) * (ent.radius + 18),
              (ent.z || 0) + ((ent.vz || 0) / speed3D) * (ent.radius + 18)
            );
            if (headP.visible) {
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(ep.sx, ep.sy);
              ctx.lineTo(headP.sx, headP.sy);
              ctx.stroke();
            }
          }

          // 7f. Stasis Lock Cage
          if (ent.isStasisLocked) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(ep.sx, ep.sy, baseRadius * 1.4, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#ef4444';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`STASIS ${ent.stasisLockRemainingTicks}t`, ep.sx, ep.sy - baseRadius - 8);
          }

          // Label
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(ent.name, ep.sx, ep.sy + baseRadius + 14);

          ctx.restore();
        };

        render6DOFEntity(human);
        render6DOFEntity(beEngine.entity);

        // 8. 6DOF Flight Telemetry HUD Overlay
        ctx.save();
        ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;

        // HUD Top-Left: Kinematic Vector Registers
        ctx.strokeRect(16, 16, 210, 84);
        ctx.fillRect(16, 16, 210, 84);

        ctx.fillStyle = '#00f0ff';
        ctx.font = '10px monospace';
        ctx.fillText(`6DOF KINEMATICS // Q16.16 PARITY`, 24, 32);

        const hSpeed3D = Math.hypot(human.vx, human.vy, human.vz || 0);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        ctx.fillText(`POS [X,Y,Z]: [${human.x.toFixed(0)}, ${human.y.toFixed(0)}, ${(human.z || 0).toFixed(0)}]`, 24, 48);
        ctx.fillText(`VEL [Vx,Vy,Vz]: [${human.vx.toFixed(2)}, ${human.vy.toFixed(2)}, ${(human.vz || 0).toFixed(2)}]`, 24, 62);
        ctx.fillText(`ISOTROPIC SPEED: ${hSpeed3D.toFixed(2)} u/t`, 24, 76);
        ctx.fillText(`BOUNDING SPHERE: r=${human.boundingRadius || 18}u (3D)`, 24, 90);

        // HUD Top-Right: Attitude & Brake Status
        ctx.strokeRect(width - 226, 16, 210, 84);
        ctx.fillRect(width - 226, 16, 210, 84);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px monospace';
        ctx.fillText(`GYRO ATTITUDE & BRAKES`, width - 216, 32);

        const pitchDeg = ((human.pitch * 180) / Math.PI).toFixed(1);
        const yawDeg = ((human.yaw * 180) / Math.PI).toFixed(1);
        const rollDeg = ((human.roll * 180) / Math.PI).toFixed(1);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        ctx.fillText(`PITCH: ${pitchDeg}°  YAW: ${yawDeg}°  ROLL: ${rollDeg}°`, width - 216, 48);
        ctx.fillText(`GRAVITY FIELD: [0, 0, 0] (Zero-G Void)`, width - 216, 62);

        if (human.isBraking) {
          ctx.fillStyle = '#f43f5e';
          ctx.font = '10px monospace';
          ctx.fillText(`THERMODYNAMIC BRAKE: ENGAGED (-dV/dt)`, width - 216, 80);
        } else {
          ctx.fillStyle = '#10b981';
          ctx.font = '10px monospace';
          ctx.fillText(`BRAKES: ARMED [SHIFT / B]`, width - 216, 80);
        }

        // Center Crosshair Reticle
        const cx = width * 0.5;
        const cy = height * 0.5;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy);
        ctx.lineTo(cx - 4, cy);
        ctx.moveTo(cx + 4, cy);
        ctx.lineTo(cx + 14, cy);
        ctx.moveTo(cx, cy - 14);
        ctx.lineTo(cx, cy - 4);
        ctx.moveTo(cx, cy + 4);
        ctx.lineTo(cx, cy + 14);
        ctx.stroke();

        // Gauntlet Sector Elevation HUD & Ludic Objective Banner
        if (arena.topologyType === 'CONTINUOUS_TRI_STATE_GAUNTLET') {
          const pZ = human.z || 0;
          let sectorName = 'SECTOR I: THE ASCENT';
          let sectorState = '0x00 (COACH)';
          let beRole = 'THE PACER';
          let sectorColor = '#38bdf8';
          let objectiveText = 'Kinetic Calibration: Navigate collapsing shaft. Be <> leads, demonstrating exact tethering & W-phase shifts.';

          if (pZ >= SECTOR_TWO_CEILING_FLOAT) {
            sectorName = 'SECTOR III: THE APEX';
            sectorState = '0xFF (UNBOUND)';
            beRole = 'THE ABSOLUTE';
            sectorColor = '#f43f5e';
            objectiveText = 'Thermodynamic Duel: Latency buffer stripped! Be <> hyper-rotates into aggressive W-axis flank. Bankrupt its ledger!';
          } else if (pZ >= SECTOR_ONE_CEILING_FLOAT) {
            sectorName = 'SECTOR II: THE BREACH';
            sectorState = '0x01 (CO-OP)';
            beRole = 'THE MULTIPLIER';
            sectorColor = '#34d399';
            objectiveText = 'Constructive Resonance: Heavy-friction Tesseract packed with 4D daemons. Synchronize kinetic shears to rip geometry!';
          }

          // Top Center Gauntlet Banner
          const bannerW = Math.min(width - 480, 560);
          if (bannerW > 260) {
            const bx = (width - bannerW) * 0.5;
            ctx.fillStyle = 'rgba(6, 10, 19, 0.9)';
            ctx.strokeStyle = sectorColor;
            ctx.lineWidth = 1.5;
            ctx.fillRect(bx, 16, bannerW, 64);
            ctx.strokeRect(bx, 16, bannerW, 64);

            ctx.fillStyle = sectorColor;
            ctx.font = 'bold 11px monospace';
            ctx.fillText(`ORGANELLE 0xC0 // ${sectorName} [${sectorState}]`, bx + 12, 32);

            ctx.fillStyle = '#f8fafc';
            ctx.font = '10px monospace';
            ctx.fillText(`BE <> ROLE: ${beRole}  |  ALTITUDE Z: ${pZ.toFixed(1)}u (Q16: 0x${floatToQ16(pZ).toString(16)})`, bx + 12, 47);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '9px monospace';
            ctx.fillText(objectiveText.length > 70 ? objectiveText.slice(0, 68) + '...' : objectiveText, bx + 12, 63);
          }
        }

        ctx.restore();

      } else {
        // ==========================================
        // 2.5D NULL-FRICTION OCTAGON MODE
        // ==========================================
        const mirrorY = arena.center.y;
        ctx.save();
        ctx.globalAlpha = 0.12;
        const reflectEntities = [human, beEngine.entity];
        for (const ent of reflectEntities) {
          const distFromMirror = ent.y - mirrorY;
          const refY = mirrorY - distFromMirror;
          ctx.fillStyle = ent.color;
          ctx.beginPath();
          ctx.ellipse(ent.x, refY, ent.radius * 0.9, ent.radius * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Emissive Parametric Vector Grid
        const gridSize = 40;
        const numCols = Math.ceil(width / gridSize);
        const numRows = Math.ceil(height / gridSize);

        for (let c = 0; c <= numCols; c++) {
          const x = c * gridSize;
          for (let r = 0; r < numRows; r++) {
            const y1 = r * gridSize;
            const y2 = (r + 1) * gridSize;
            const strain = arena.synthesizer.getStrainAt(x, (y1 + y2) * 0.5);

            ctx.beginPath();
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y2);
            ctx.strokeStyle = getStrainColor(strain);
            ctx.lineWidth = strain > 0.3 ? 1.8 + strain * 1.2 : 0.8;
            ctx.stroke();
          }
        }

        for (let r = 0; r <= numRows; r++) {
          const y = r * gridSize;
          for (let c = 0; c < numCols; c++) {
            const x1 = c * gridSize;
            const x2 = (c + 1) * gridSize;
            const strain = arena.synthesizer.getStrainAt((x1 + x2) * 0.5, y);

            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.strokeStyle = getStrainColor(strain);
            ctx.lineWidth = strain > 0.3 ? 1.8 + strain * 1.2 : 0.8;
            ctx.stroke();
          }
        }

        // Hulls (Bézier Splines)
        const pts = arena.hull.points;
        if (pts.length > 2) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo((pts[pts.length - 1].x + pts[0].x) / 2, (pts[pts.length - 1].y + pts[0].y) / 2);
          for (let i = 0; i < pts.length; i++) {
            const curr = pts[i];
            const next = pts[(i + 1) % pts.length];
            ctx.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
          }
          ctx.closePath();
          ctx.strokeStyle = 'rgba(235, 254, 255, 0.95)';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 16;
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();
        }

        // Anchors
        for (const a of arena.anchors) {
          if (!a.active) continue;
          ctx.save();
          ctx.fillStyle = '#0284c7';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }

        // Entities
        const render2DEntity = (ent: Entity) => {
          ctx.save();
          ctx.fillStyle = ent.color;
          ctx.shadowColor = ent.color;
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(ent.x, ent.y, ent.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        };
        render2DEntity(human);
        render2DEntity(beEngine.entity);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [arena, tetherEngine, beEngine, human, currentTick, showBVH, showCoordinates, is3DMode, followHuman]);

  // Pointer Handlers: Orbit Camera in 3D, Grapple Anchors/Splines
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || human.isStasisLocked) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;
    mousePosRef.current = { x, y };
    isMouseDownRef.current = true;

    // Right-click or Alt-click or Empty drag -> Camera Orbit
    if (e.button === 2 || e.altKey) {
      isDraggingRef.current = true;
      dragStartRef.current = {
        x,
        y,
        yaw: cameraRef.current.yaw,
        pitch: cameraRef.current.pitch
      };
      return;
    }

    // 1. Check if clicked near active Tesseract Echo predicted re-entry point
    if (activeEchoRef.current) {
      const echo = activeEchoRef.current;
      const cam = cameraRef.current;
      const targetX = followHuman ? human.x : arena.center.x;
      const targetY = followHuman ? human.y : arena.center.y;
      const targetZ = followHuman ? (human.z || 0) : 0;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      const rp = project3D(
        echo.predictedReentryPoint.x,
        echo.predictedReentryPoint.y,
        echo.predictedReentryPoint.z,
        targetX, targetY, targetZ,
        cam.yaw, cam.pitch, cam.dist, cam.fov,
        width, height
      );

      if (rp.visible) {
        const dClick = Math.hypot(x - rp.sx, y - rp.sy);
        if (dClick < 32) {
          // SHATTER THERMODYNAMIC STASIS!
          cyberAudio.playReentryShatter();
          beEngine.entity.w = 0;
          beEngine.entity.vw = 0;
          beEngine.entity.isStasisLocked = true;
          beEngine.entity.stasisLockRemainingTicks = 120;
          human.score += 250;
          beEngine.addLog('CRITICAL PARITY INTERCEPT: Athlete shattered Be <> 4D Re-Entry stasis!', 'RULING', currentTick);
          activeEchoRef.current = null;
          onShearApplied();
          return;
        }
      }
    }

    // Check if clicked an anchor node (Thermodynamic Well) in 3D projection or 2D
    const cam = cameraRef.current;
    const targetX = followHuman ? human.x : arena.center.x;
    const targetY = followHuman ? human.y : arena.center.y;
    const targetZ = followHuman ? (human.z || 0) : 0;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    const isHyperSphere = arena.topologyType === 'ISOTROPIC_HYPER_SPHERE';
    let clickedAnchor = null;

    if (isHyperSphere || is3DMode) {
      clickedAnchor = arena.anchors.find(a => {
        const p = project3D(a.x, a.y, a.z || 0, targetX, targetY, targetZ, cam.yaw, cam.pitch, cam.dist, cam.fov, width, height);
        if (!p.visible) return false;
        return Math.hypot(p.sx - x, p.sy - y) <= (a.radius * p.scale + 22);
      });
    } else {
      clickedAnchor = arena.anchors.find(a => Math.hypot(a.x - x, a.y - y) <= a.radius + 18);
    }

    if (clickedAnchor) {
      human.activeTether = {
        sourceId: human.id,
        targetAnchorId: clickedAnchor.id,
        targetPoint3D: { x: clickedAnchor.x, y: clickedAnchor.y, z: clickedAnchor.z || 0 },
        length: Math.hypot(human.x - clickedAnchor.x, human.y - clickedAnchor.y, (human.z || 0) - (clickedAnchor.z || 0)),
        maxLength: 380,
        tension: 0.4,
        siphoning: true,
        color: '#00f0ff'
      };
      cyberAudio.playTetherAttach();
      onTetherCreated();
      return;
    }

    // In State 0xFF (ADVERSARY): Shift+Click or Alt+Click deploys a Kinetic Trap
    if (beEngine.mode === 'ADVERSARY' && (e.shiftKey || e.altKey)) {
      const worldX = followHuman ? human.x + (x - width * 0.5) * (cam.dist / 400) : arena.center.x + (x - width * 0.5) * (cam.dist / 400);
      const worldY = followHuman ? human.y + (y - height * 0.5) * (cam.dist / 400) : arena.center.y + (y - height * 0.5) * (cam.dist / 400);
      beEngine.dropKineticTrap(worldX, worldY, 0, currentTick);
      return;
    }

    // Otherwise, start camera orbit drag if on empty canvas
    isDraggingRef.current = true;
    dragStartRef.current = {
      x,
      y,
      yaw: cameraRef.current.yaw,
      pitch: cameraRef.current.pitch
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;
    mousePosRef.current = { x, y };

    if (isDraggingRef.current) {
      const dx = x - dragStartRef.current.x;
      const dy = y - dragStartRef.current.y;
      cameraRef.current.yaw = dragStartRef.current.yaw + dx * 0.008;
      cameraRef.current.pitch = Math.max(-1.4, Math.min(1.4, dragStartRef.current.pitch + dy * 0.008));
    }
  };

  const handlePointerUp = () => {
    isMouseDownRef.current = false;
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    cameraRef.current.dist = Math.max(220, Math.min(950, cameraRef.current.dist + e.deltaY * 0.5));
  };

  return (
    <div className="relative w-full h-full min-h-[480px] bg-[#010409] rounded-xl overflow-hidden border border-[#1e293b] select-none shadow-2xl">
      <canvas
        id="cyber_athletic_arena_canvas"
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onContextMenu={e => e.preventDefault()}
        className="w-full h-full cursor-crosshair block touch-none"
      />

      {/* 3D Mode & View Controls Overlay */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#090d16]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1e293b] text-[11px] text-slate-300 font-mono z-20">
        <button
          onClick={() => setIs3DMode(!is3DMode)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer ${
            is3DMode ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle 3D Perspective Volumetric View"
        >
          <Orbit className="w-3.5 h-3.5" />
          <span>3D/4D 6DOF</span>
        </button>

        <button
          onClick={() => setFollowHuman(!followHuman)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer ${
            followHuman ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Follow Athlete with Camera"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>CAM FOLLOW</span>
        </button>

        {/* 4D Observer W-Slice Stepper */}
        <div className="flex items-center gap-1 border-l border-slate-700 pl-2 ml-1">
          <Layers className="w-3.5 h-3.5 text-fuchsia-400" />
          <span className="text-[10px] text-slate-400">W-SLICE:</span>
          <button
            onClick={() => setObserverSliceW(prev => Math.max(-80, prev - 10))}
            className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[10px] cursor-pointer"
            title="Step backward along W-axis (Phase slice)"
          >
            -10
          </button>
          <span className="text-[10px] text-fuchsia-300 font-bold px-1 min-w-[32px] text-center">
            {observerSliceW}
          </span>
          <button
            onClick={() => setObserverSliceW(prev => Math.min(80, prev + 10))}
            className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[10px] cursor-pointer"
            title="Step forward along W-axis (Phase slice)"
          >
            +10
          </button>
          {observerSliceW !== 0 && (
            <button
              onClick={() => setObserverSliceW(0)}
              className="px-1 py-0.5 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded text-[9px] cursor-pointer"
              title="Reset to reality plane (W = 0)"
            >
              W=0
            </button>
          )}
        </div>

        <button
          onClick={() => {
            cameraRef.current.yaw = 0.55;
            cameraRef.current.pitch = 0.42;
            cameraRef.current.dist = 520;
          }}
          className="text-slate-400 hover:text-white px-1.5 py-1 text-[10px] cursor-pointer"
          title="Reset Orbit Angle"
        >
          RESET CAM
        </button>
      </div>

      {/* Top-Right Invariant Status */}
      <div className="absolute top-3 right-3 flex items-center gap-2 bg-[#090d16]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1e293b] text-[11px] text-slate-300 font-mono pointer-events-none z-20">
        <span className={`inline-block w-2 h-2 rounded-full animate-pulse ${
          arena.topologyType === 'THE_NULL_FRICTION_TESSERACT' ? 'bg-fuchsia-400' : 'bg-cyan-400'
        }`} />
        <span>
          {arena.topologyType === 'THE_NULL_FRICTION_TESSERACT'
            ? 'NULL-FRICTION TESSERACT // 4D HYPER-VOLUME'
            : arena.topologyType === 'ISOTROPIC_HYPER_SPHERE'
            ? 'ISOTROPIC HYPER-SPHERE // 6DOF'
            : 'NULL-FRICTION OCTAGON // 1 === 1'}
        </span>
      </div>

      {/* Bottom Instructions / Keyboard Hints */}
      <div className="absolute bottom-3 left-3 bg-[#090d16]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-[#1e293b] text-[11px] text-slate-400 font-mono pointer-events-none flex flex-wrap items-center gap-3 z-20">
        <span><strong className="text-cyan-400">WASD:</strong> 3D Thrust</span>
        <span><strong className="text-pink-400">SPACE / C:</strong> Altitude (±Z)</span>
        <span><strong className="text-fuchsia-400">[ / ]:</strong> Phase Shift (±W)</span>
        <span><strong className="text-amber-400">Q / E:</strong> Roll 6DOF</span>
        <span><strong className="text-rose-400">SHIFT / B:</strong> Thermodynamic Brake</span>
        <span><strong className="text-yellow-400">CLICK RETICLE:</strong> Shatter Stasis</span>
      </div>
    </div>
  );
};
