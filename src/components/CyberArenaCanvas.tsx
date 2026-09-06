/**
 * CyberArenaCanvas: Real-time Vector-Spline Arena Display & Direct Manipulator
 * Renders The Null-Friction Octagon, zero-roughness reflective floor, parametric emissive grid
 * with dynamic cyan->crimson dV/dt strain heatmapping, translucent high-albedo glass hulls with
 * ray-traced caustics/refraction fractures, and suspended 3D Lissajous Thermodynamic Wells.
 */

import React, { useRef, useEffect } from 'react';
import { Entity, ActiveTether, FloatVector } from '../types';
import { ArenaForge } from '../engine/arena_forge';
import { CyberAthleticTethering } from '../engine/vector_tether';
import { BeInstanceEngine } from '../engine/be_instance';
import { floatToQ16 } from '../engine/q16';
import { cyberAudio } from '../engine/audio';

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

// Helper to interpolate RGB colors between Cold Cyan and Warning Crimson based on strain
function getStrainColor(strain: number, alpha: number = 1.0): string {
  // Clamp strain 0..1
  const s = Math.max(0, Math.min(1, strain));
  if (s < 0.02) {
    return `rgba(0, 240, 255, ${0.18 * alpha})`; // Cold Cyan idle
  } else if (s < 0.35) {
    // Cyan to Electric Violet
    const t = s / 0.35;
    const r = Math.round(0 + t * 140);
    const g = Math.round(240 - t * 160);
    const b = 255;
    const a = 0.25 + t * 0.45;
    return `rgba(${r}, ${g}, ${b}, ${a * alpha})`;
  } else {
    // Electric Violet to Warning Crimson
    const t = (s - 0.35) / 0.65;
    const r = Math.round(140 + t * 115);
    const g = Math.round(80 - t * 80);
    const b = Math.round(255 - t * 195);
    const a = 0.7 + t * 0.3;
    return `rgba(${r}, ${g}, ${b}, ${a * alpha})`;
  }
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
      // Adjust arena center to canvas center
      arena.center = {
        x: rect.width * 0.5,
        y: rect.height * 0.5
      };
      // Keep radius proportional
      arena.radiusX = Math.min(360, rect.width * 0.38);
      arena.radiusY = Math.min(270, rect.height * 0.36);

      // Re-anchor if in Null-Friction Octagon mode
      if (arena.topologyType === 'NULL_FRICTION_OCTAGON') {
        arena.synthesizeNullFrictionOctagon();
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

      // Deposit localized strain into kinetic floor from player & Be velocities
      const hSpeed = Math.hypot(human.vx, human.vy);
      if (hSpeed > 0.4) {
        arena.synthesizer.depositShear(human.x, human.y, Math.min(0.8, hSpeed * 0.05));
      }
      const bSpeed = Math.hypot(beEngine.entity.vx, beEngine.entity.vy);
      if (bSpeed > 0.4) {
        arena.synthesizer.depositShear(beEngine.entity.x, beEngine.entity.y, Math.min(0.8, bSpeed * 0.05));
      }

      // 1. Floor Plane (Kinetic Grid): Base Reflective Manifold
      // sys_covalent_set_global_albedo(0x00000000) -> Pure Black
      // sys_covalent_set_global_roughness(0x00000000) -> Perfect Mirror
      ctx.fillStyle = '#010408';
      ctx.fillRect(0, 0, width, height);

      // 1b. Floor Mirror Reflections (Simulating zero-roughness floor)
      const mirrorY = arena.center.y;
      ctx.save();
      ctx.globalAlpha = 0.12;
      // Entity reflections
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

      // 1c. Emissive Parametric Vector Lines Driven by Localized Thermodynamic Shear (dV/dt)
      const gridSize = 40;
      const numCols = Math.ceil(width / gridSize);
      const numRows = Math.ceil(height / gridSize);

      // Vertical line segments with localized strain coloring
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

      // Horizontal line segments with localized strain coloring
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

          // Graph localized dV/dt strain vectors in high-stress sectors
          if (strain > 0.38) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 0, 60, 0.6)';
            ctx.lineWidth = 1;
            const midX = (x1 + x2) * 0.5;
            const strainLen = strain * 8;
            ctx.beginPath();
            ctx.moveTo(midX - strainLen, y - strainLen);
            ctx.lineTo(midX + strainLen, y + strainLen);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Q16.16 Tick Marks & Center Axis
      ctx.strokeStyle = '#0e2238';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(arena.center.x, 0);
      ctx.lineTo(arena.center.x, height);
      ctx.moveTo(0, arena.center.y);
      ctx.lineTo(width, arena.center.y);
      ctx.stroke();
      ctx.setLineDash([]);

      if (showCoordinates) {
        ctx.fillStyle = '#22d3ee';
        ctx.font = '10px monospace';
        ctx.fillText(`AXIS [0x00000000, 0x00000000] Q16`, arena.center.x + 8, arena.center.y - 8);
        ctx.fillStyle = '#64748b';
        ctx.fillText(`TICK: ${currentTick} (60Hz Parity Engine)`, 16, 24);
        ctx.fillText(`TOPOLOGY: ${arena.topologyType}`, 16, 38);
        ctx.fillText(`BOUNDS: Q16.16 [±0x04000000]`, 16, 52);
        ctx.fillText(`KINETIC SHEAR dV/dt: ${(arena.synthesizer.maxDvDt * 100).toFixed(1)}%`, 16, 66);
      }

      // 2. Render BVH bounding boxes if toggled
      if (showBVH) {
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
        ctx.lineWidth = 1;
        for (const b of arena.bvh) {
          ctx.strokeRect(b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);
        }
      }

      // 3. The Hulls (Hyper-Tensile Bounds): Continuous Bézier Splines Rendered as Translucent High-Albedo Glass
      const pts = arena.hull.points;
      if (pts.length > 2) {
        const isGlass = arena.hull.material === 'MATERIAL_TRANSLUCENT_GLASS' || arena.topologyType === 'NULL_FRICTION_OCTAGON';

        // 3a. Translucent High-Albedo Glass Body Interior
        ctx.save();
        ctx.beginPath();
        ctx.moveTo((pts[pts.length - 1].x + pts[0].x) / 2, (pts[pts.length - 1].y + pts[0].y) / 2);
        for (let i = 0; i < pts.length; i++) {
          const curr = pts[i];
          const next = pts[(i + 1) % pts.length];
          ctx.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
        }
        ctx.closePath();

        // High-albedo glass inner gradient
        if (isGlass) {
          const glassGrad = ctx.createRadialGradient(
            arena.center.x, arena.center.y, 10,
            arena.center.x, arena.center.y, arena.radiusX * 1.1
          );
          glassGrad.addColorStop(0, 'rgba(0, 240, 255, 0.02)');
          glassGrad.addColorStop(0.7, 'rgba(200, 245, 255, 0.05)');
          glassGrad.addColorStop(1, 'rgba(240, 255, 255, 0.14)');
          ctx.fillStyle = glassGrad;
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.03)';
          ctx.fill();
        }
        ctx.restore();

        // 3b. Glass Outer Specular Rim
        ctx.save();
        ctx.shadowColor = isGlass ? '#00f0ff' : arena.hull.color;
        ctx.shadowBlur = 18;
        ctx.strokeStyle = isGlass ? 'rgba(235, 254, 255, 0.95)' : arena.hull.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo((pts[pts.length - 1].x + pts[0].x) / 2, (pts[pts.length - 1].y + pts[0].y) / 2);
        for (let i = 0; i < pts.length; i++) {
          const curr = pts[i];
          const next = pts[(i + 1) % pts.length];
          ctx.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // 3c. Chromatic Refraction Caustic Boundary (Slightly offset cyan and crimson lines under stress)
        if (isGlass) {
          ctx.save();
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo((pts[pts.length - 1].x + pts[0].x) / 2, (pts[pts.length - 1].y + pts[0].y) / 2);
          for (let i = 0; i < pts.length; i++) {
            const curr = pts[i];
            const next = pts[(i + 1) % pts.length];
            const strainOffset = (curr.strain || 0) * 0.3;
            ctx.quadraticCurveTo(curr.x - strainOffset, curr.y - strainOffset, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }

        // 3d. Control Points & Ray-Traced Refraction Fractures under Topological Deformation
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          const disp = Math.hypot(p.x - p.baseX, p.y - p.baseY);
          const strain = p.strain || disp;

          // Ray-Traced Refraction Fracture Lighting when player/tether deforms the glass wall
          if (strain > 2) {
            ctx.save();
            // Inward normal vector
            const normAngle = Math.atan2(arena.center.y - p.y, arena.center.x - p.x);
            const fractureLen = Math.min(75, strain * 3.5);

            // Refractive caustic stress curve
            ctx.strokeStyle = strain > 12 ? 'rgba(255, 0, 60, 0.85)' : 'rgba(0, 240, 255, 0.75)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            const bentX = p.x + Math.cos(normAngle + 0.35) * (fractureLen * 0.6);
            const bentY = p.y + Math.sin(normAngle + 0.35) * (fractureLen * 0.6);
            const endX = p.x + Math.cos(normAngle - 0.2) * fractureLen;
            const endY = p.y + Math.sin(normAngle - 0.2) * fractureLen;
            ctx.quadraticCurveTo(bentX, bentY, endX, endY);
            ctx.stroke();

            // Prismatic chromatic dispersion fork
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bentX, bentY);
            ctx.lineTo(bentX + Math.cos(normAngle + 0.7) * (fractureLen * 0.5), bentY + Math.sin(normAngle + 0.7) * (fractureLen * 0.5));
            ctx.stroke();

            // Stress anchor highlight
            ctx.fillStyle = '#ff003c';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // Control Point Node
          ctx.save();
          ctx.fillStyle = strain > 4 ? '#ff003c' : isGlass ? '#00f0ff' : arena.hull.color;
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = strain > 4 ? 12 : 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.isAnchor ? 5 : 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Displacement vector if deformed
          if (disp > 3) {
            ctx.strokeStyle = 'rgba(255, 0, 60, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.baseX, p.baseY);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // 4. The Anchor Nodes (Thermodynamic Wells): Suspended 3D Lissajous Curves
      for (let aIdx = 0; aIdx < arena.anchors.length; aIdx++) {
        const a = arena.anchors[aIdx];
        if (!a.active) continue;

        ctx.save();
        if (a.type === 'THERMODYNAMIC_WELL') {
          // Render Suspended 3D Lissajous Curve
          const params = a.lissajous || { a: 3, b: 2, c: 1, delta: Math.PI / 4, speed: 0.024, radius: 26 };
          const numSamples = 72;
          const yaw = currentTick * params.speed + aIdx * 1.57;
          const pitch = 0.52 + 0.14 * Math.sin(currentTick * 0.016 + aIdx);

          const lissajousPoints: { x: number; y: number; z: number }[] = [];
          for (let i = 0; i <= numSamples; i++) {
            const theta = (i / numSamples) * Math.PI * 2;
            const x0 = params.radius * Math.sin(params.a * theta + params.delta);
            const y0 = params.radius * Math.sin(params.b * theta);
            const z0 = (params.radius * 0.85) * Math.cos(params.c * theta + currentTick * 0.03);

            // 3D rotation projection
            const rotX = x0 * Math.cos(yaw) - z0 * Math.sin(yaw);
            const rotZ = x0 * Math.sin(yaw) + z0 * Math.cos(yaw);
            const rotY = y0 * Math.cos(pitch) - rotZ * Math.sin(pitch);
            const depthZ = y0 * Math.sin(pitch) + rotZ * Math.cos(pitch);

            lissajousPoints.push({
              x: a.x + rotX,
              y: a.y + rotY,
              z: depthZ
            });
          }

          // Draw Suspended 3D Curve with depth-based brightness
          for (let i = 0; i < lissajousPoints.length - 1; i++) {
            const p1 = lissajousPoints[i];
            const p2 = lissajousPoints[i + 1];
            const avgZ = (p1.z + p2.z) * 0.5;
            const normZ = (avgZ + params.radius) / (params.radius * 2); // 0 (back) to 1 (front)

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            if (normZ > 0.5) {
              ctx.strokeStyle = `rgba(0, 240, 255, ${0.45 + normZ * 0.55})`;
              ctx.lineWidth = 1.5 + normZ * 1.5;
              ctx.shadowColor = '#00f0ff';
              ctx.shadowBlur = normZ > 0.7 ? 10 : 4;
            } else {
              ctx.strokeStyle = `rgba(2, 132, 199, ${0.25 + normZ * 0.35})`;
              ctx.lineWidth = 1.0;
              ctx.shadowBlur = 0;
            }
            ctx.stroke();
          }

          // Central Well Singularity Core
          const corePulse = 1 + 0.2 * Math.sin(currentTick * 0.1 + aIdx * 1.2);
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 18;
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(a.x, a.y, 6 * corePulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Q16 Label
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#67e8f9';
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`WELL ${aIdx + 1} [3D LISSAJOUS]`, a.x, a.y + params.radius + 14);

        } else if (a.type === 'CORE') {
          // Central Quipu Core
          const pulse = 1 + 0.15 * Math.sin(currentTick * 0.08);
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.radius * pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Rotating Core Geometry
          ctx.save();
          ctx.translate(a.x, a.y);
          ctx.rotate(currentTick * 0.02);
          ctx.strokeStyle = 'rgba(224, 242, 254, 0.6)';
          ctx.strokeRect(-10, -10, 20, 20);
          ctx.restore();
        } else {
          // Standard Resonance Orb
          const pulse = 1 + 0.15 * Math.sin(currentTick * 0.08 + a.x * 0.01);
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.radius * pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#a7f3d0';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 5. Render Active Tethers
      const renderTether = (ent: Entity, tether: ActiveTether) => {
        let tx = 0;
        let ty = 0;
        if (tether.targetAnchorId) {
          const anc = arena.anchors.find(a => a.id === tether.targetAnchorId);
          if (anc) { tx = anc.x; ty = anc.y; }
        } else if (tether.splinePointIndex !== undefined) {
          const pt = arena.hull.points[tether.splinePointIndex];
          if (pt) { tx = pt.x; ty = pt.y; }
        } else if (tether.targetPoint) {
          tx = tether.targetPoint.x;
          ty = tether.targetPoint.y;
        }

        if (tx !== 0 || ty !== 0) {
          const tension = tether.tension;
          const tetherColor = tension > 0.8 ? '#ef4444' : tension > 0.5 ? '#f59e0b' : tether.color;

          // Deposit localized kinetic strain along tether midpoint
          const midX = (ent.x + tx) * 0.5;
          const midY = (ent.y + ty) * 0.5;
          arena.synthesizer.depositShear(midX, midY, tension * 0.15);

          ctx.save();
          ctx.shadowColor = tetherColor;
          ctx.shadowBlur = 12;
          ctx.strokeStyle = tetherColor;
          ctx.lineWidth = 2 + tension * 2.8;

          // Catenary sag / dynamic spline curve for tether
          ctx.beginPath();
          ctx.moveTo(ent.x, ent.y);
          const sagY = midY + (1.0 - tension) * 18;
          ctx.quadraticCurveTo(midX, sagY, tx, ty);
          ctx.stroke();

          // Siphoning energy particle pulses
          const particleCount = 5;
          for (let p = 0; p < particleCount; p++) {
            const phase = ((currentTick * 0.05 + p / particleCount) % 1);
            const px = ent.x + (tx - ent.x) * phase;
            const py = ent.y + (ty - ent.y) * phase;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      };

      if (human.activeTether) renderTether(human, human.activeTether);
      if (beEngine.entity.activeTether) renderTether(beEngine.entity, beEngine.entity.activeTether);

      // 6. Render Co-Op Resonance Beam if active
      if (beEngine.mode === 'COOP_PEER' && beEngine.resonanceMeter > 10) {
        ctx.save();
        ctx.strokeStyle = `rgba(52, 211, 153, ${beEngine.resonanceMeter / 100})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(human.x, human.y);
        ctx.lineTo(beEngine.entity.x, beEngine.entity.y);
        ctx.stroke();
        ctx.restore();
      }

      // 7. Render Entities (Human Athlete and Be Instance)
      const renderEntity = (ent: Entity) => {
        // Motion Trail
        ctx.save();
        for (let i = 0; i < ent.trail.length; i++) {
          const t = ent.trail[i];
          const alpha = (1 - i / ent.trail.length) * 0.4;
          ctx.fillStyle = ent.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(t.x, t.y, ent.radius * (1 - (i / ent.trail.length) * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Main Entity Disc
        ctx.save();
        ctx.shadowColor = ent.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = ent.color;
        ctx.beginPath();
        ctx.arc(ent.x, ent.y, ent.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ent.x, ent.y, ent.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Velocity Heading Arrowhead
        const speed = Math.hypot(ent.vx, ent.vy);
        if (speed > 0.5) {
          const angle = Math.atan2(ent.vy, ent.vx);
          const headX = ent.x + Math.cos(angle) * (ent.radius + 12);
          const headY = ent.y + Math.sin(angle) * (ent.radius + 12);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ent.x, ent.y);
          ctx.lineTo(headX, headY);
          ctx.stroke();
        }

        // Stasis Penalty Cage if locked
        if (ent.isStasisLocked) {
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 14;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ent.x, ent.y, ent.radius + 10, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#ef4444';
          ctx.font = '9px monospace';
          ctx.fillText(`STASIS ${ent.stasisLockRemainingTicks}t`, ent.x - 24, ent.y - ent.radius - 12);
        }

        // Label
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ent.name, ent.x, ent.y + ent.radius + 14);

        ctx.restore();
      };

      renderEntity(human);
      renderEntity(beEngine.entity);

      // 8. Aiming Crosshair / Dynamic Tether Target Preview
      if (isMouseDownRef.current && !human.isStasisLocked) {
        const mx = mousePosRef.current.x;
        const my = mousePosRef.current.y;

        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(human.x, human.y);
        ctx.lineTo(mx, my);
        ctx.stroke();

        ctx.strokeStyle = '#00f0ff';
        ctx.setLineDash([]);
        ctx.strokeRect(mx - 8, my - 8, 16, 16);
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [arena, tetherEngine, beEngine, human, currentTick, showBVH, showCoordinates]);

  // Handle Mouse / Touch interaction for Tethering & Kinetic Shear
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || human.isStasisLocked) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;
    mousePosRef.current = { x, y };
    isMouseDownRef.current = true;

    // Check if clicked an anchor node (Thermodynamic Well or Core)
    const clickedAnchor = arena.anchors.find(a => Math.hypot(a.x - x, a.y - y) <= a.radius + 18);
    if (clickedAnchor) {
      // Attach tether to anchor (Thermodynamic Well siphons kinetic energy)
      human.activeTether = {
        sourceId: human.id,
        targetAnchorId: clickedAnchor.id,
        length: Math.hypot(human.x - clickedAnchor.x, human.y - clickedAnchor.y),
        maxLength: 360,
        tension: 0.35,
        siphoning: true,
        color: clickedAnchor.type === 'THERMODYNAMIC_WELL' ? '#00f0ff' : '#06b6d4'
      };
      cyberAudio.playTetherAttach();
      onTetherCreated();
      return;
    }

    // Check if clicked near a Spline Control Point -> Apply Kinetic Shear!
    const pts = arena.hull.points;
    let closestIndex = -1;
    let closestDist = Infinity;
    for (let i = 0; i < pts.length; i++) {
      const d = Math.hypot(pts[i].x - x, pts[i].y - y);
      if (d < closestDist) {
        closestDist = d;
        closestIndex = i;
      }
    }

    if (closestDist < 38 && closestIndex !== -1) {
      // Attach tether to spline control point and apply kinetic shear
      human.activeTether = {
        sourceId: human.id,
        targetSplineId: arena.hull.id,
        splinePointIndex: closestIndex,
        length: closestDist,
        maxLength: 320,
        tension: 0.55,
        siphoning: false,
        color: '#ff003c'
      };

      // Pull spline toward human
      const shearForce = {
        x: floatToQ16((human.x - pts[closestIndex].x) * 0.28),
        y: floatToQ16((human.y - pts[closestIndex].y) * 0.28)
      };

      const success = tetherEngine.applyKineticShear(
        human,
        arena.hull.id,
        closestIndex,
        shearForce,
        currentTick
      );

      if (success) {
        cyberAudio.playKineticShear();
        onShearApplied();
      } else {
        cyberAudio.playStasisLock();
      }
      return;
    }

    // Free tether to coordinates
    human.activeTether = {
      sourceId: human.id,
      targetPoint: { x, y },
      length: Math.hypot(human.x - x, human.y - y),
      maxLength: 300,
      tension: 0.4,
      siphoning: false,
      color: '#00f0ff'
    };
    cyberAudio.playTetherAttach();
    onTetherCreated();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.x,
      y: e.clientY - rect.y
    };
  };

  const handlePointerUp = () => {
    isMouseDownRef.current = false;
  };

  return (
    <div className="relative w-full h-full min-h-[480px] bg-[#010408] rounded-xl overflow-hidden border border-[#1e293b] select-none shadow-2xl">
      <canvas
        id="cyber_athletic_arena_canvas"
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full cursor-crosshair block touch-none"
      />

      {/* On-canvas Quick Legend & Helper */}
      <div className="absolute top-3 right-3 flex items-center gap-2 bg-[#090d16]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1e293b] text-[11px] text-slate-300 font-mono pointer-events-none">
        <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>THE NULL-FRICTION OCTAGON // 1 === 1</span>
      </div>

      <div className="absolute bottom-3 left-3 bg-[#090d16]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-[#1e293b] text-[11px] text-slate-400 font-mono pointer-events-none flex flex-wrap gap-3">
        <span><strong className="text-cyan-400">CLICK LISSAJOUS:</strong> Slingshot &amp; Siphon Energy</span>
        <span><strong className="text-rose-400">CLICK HULL:</strong> Deform Vector Glass</span>
        <span><strong className="text-slate-300">GRID:</strong> Cold Cyan &rarr; Warning Crimson (dV/dt)</span>
      </div>
    </div>
  );
};
