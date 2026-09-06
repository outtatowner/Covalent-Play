/**
 * CyberArenaCanvas: Real-time Vector-Spline Arena Display & Direct Manipulator
 * Renders Bézier hulls, dynamic BVH, Q16.16 coordinate manifold, tethers, and entities.
 */

import React, { useRef, useEffect, useCallback } from 'react';
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

      // 1. Background Grid & Coordinates
      ctx.fillStyle = '#05070c';
      ctx.fillRect(0, 0, width, height);

      // Fine vector grid
      ctx.strokeStyle = '#0d1929';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Q16.16 Tick Marks & Center Axis
      ctx.strokeStyle = '#142844';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(arena.center.x, 0);
      ctx.lineTo(arena.center.x, height);
      ctx.moveTo(0, arena.center.y);
      ctx.lineTo(width, arena.center.y);
      ctx.stroke();
      ctx.setLineDash([]);

      if (showCoordinates) {
        ctx.fillStyle = '#33527a';
        ctx.font = '10px monospace';
        ctx.fillText(`AXIS [0x0, 0x0] Q16`, arena.center.x + 8, arena.center.y - 8);
        ctx.fillText(`TICK: ${currentTick} (60Hz)`, 16, 24);
        ctx.fillText(`TOPOLOGY: ${arena.topologyType}`, 16, 40);
      }

      // 2. Render BVH bounding boxes if toggled
      if (showBVH) {
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.25)';
        ctx.lineWidth = 1;
        for (const b of arena.bvh) {
          ctx.strokeRect(b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);
        }
      }

      // 3. Render Bézier Hull Splines
      const pts = arena.hull.points;
      if (pts.length > 2) {
        // Outer glow
        ctx.shadowColor = arena.hull.color;
        ctx.shadowBlur = 16;
        ctx.strokeStyle = arena.hull.color;
        ctx.lineWidth = 3;
        ctx.beginPath();

        // Closed Catmull-Rom or Cubic Bézier through points
        ctx.moveTo(
          (pts[pts.length - 1].x + pts[0].x) / 2,
          (pts[pts.length - 1].y + pts[0].y) / 2
        );

        for (let i = 0; i < pts.length; i++) {
          const curr = pts[i];
          const next = pts[(i + 1) % pts.length];
          const midX = (curr.x + next.x) / 2;
          const midY = (curr.y + next.y) / 2;
          ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
        }
        ctx.closePath();
        ctx.stroke();

        // Inner hull fill gradient
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(6, 182, 212, 0.03)';
        ctx.fill();

        // Spline control points & anchor nodes
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          const disp = Math.hypot(p.x - p.baseX, p.y - p.baseY);

          ctx.fillStyle = disp > 5 ? '#f59e0b' : arena.hull.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.isAnchor ? 5 : 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Displacement vector if deformed
          if (disp > 4) {
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.baseX, p.baseY);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
      }

      // 4. Render Topological Anchors / Resonance Orbs
      for (const a of arena.anchors) {
        if (!a.active) continue;

        const pulse = 1 + 0.15 * Math.sin(currentTick * 0.08 + a.x * 0.01);
        ctx.save();
        if (a.type === 'CORE') {
          // Quipu Central Core
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
          // Resonance Orb
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

          ctx.save();
          ctx.shadowColor = tetherColor;
          ctx.shadowBlur = 10;
          ctx.strokeStyle = tetherColor;
          ctx.lineWidth = 2 + tension * 2.5;

          // Catenary sag / dynamic spline curve for tether
          ctx.beginPath();
          ctx.moveTo(ent.x, ent.y);
          const midX = (ent.x + tx) / 2;
          const midY = (ent.y + ty) / 2 + (1.0 - tension) * 18;
          ctx.quadraticCurveTo(midX, midY, tx, ty);
          ctx.stroke();

          // Siphoning energy particle pulses
          const particleCount = 4;
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

      // 7. Render Entities
      const renderEntity = (ent: Entity, isHuman: boolean) => {
        // Motion Trail
        ctx.save();
        for (let i = 0; i < ent.trail.length; i++) {
          const t = ent.trail[i];
          const alpha = (1 - i / ent.trail.length) * 0.4;
          ctx.fillStyle = ent.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(t.x, t.y, ent.radius * (1 - i / ent.trail.length * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Main Entity Disc
        ctx.save();
        ctx.shadowColor = ent.color;
        ctx.shadowBlur = 18;
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
          const headX = ent.x + Math.cos(angle) * (ent.radius + 10);
          const headY = ent.y + Math.sin(angle) * (ent.radius + 10);
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

          // Digital hash pattern
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

      renderEntity(human, true);
      renderEntity(beEngine.entity, false);

      // 8. Aiming Crosshair / Dynamic Tether Target Preview
      if (isMouseDownRef.current && !human.isStasisLocked) {
        const mx = mousePosRef.current.x;
        const my = mousePosRef.current.y;

        ctx.save();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(human.x, human.y);
        ctx.lineTo(mx, my);
        ctx.stroke();

        ctx.strokeStyle = '#06b6d4';
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

    // Check if clicked an anchor node
    const clickedAnchor = arena.anchors.find(a => Math.hypot(a.x - x, a.y - y) <= a.radius + 14);
    if (clickedAnchor) {
      // Attach tether to anchor
      human.activeTether = {
        sourceId: human.id,
        targetAnchorId: clickedAnchor.id,
        length: Math.hypot(human.x - clickedAnchor.x, human.y - clickedAnchor.y),
        maxLength: 340,
        tension: 0.3,
        siphoning: true,
        color: '#06b6d4'
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

    if (closestDist < 35 && closestIndex !== -1) {
      // Attach tether to spline control point and apply kinetic shear
      human.activeTether = {
        sourceId: human.id,
        targetSplineId: arena.hull.id,
        splinePointIndex: closestIndex,
        length: closestDist,
        maxLength: 320,
        tension: 0.5,
        siphoning: false,
        color: '#f59e0b'
      };

      // Pull spline toward human
      const shearForce = {
        x: floatToQ16((human.x - pts[closestIndex].x) * 0.25),
        y: floatToQ16((human.y - pts[closestIndex].y) * 0.25)
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
      color: '#06b6d4'
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
    <div className="relative w-full h-full min-h-[480px] bg-[#05070c] rounded-xl overflow-hidden border border-[#1e293b] select-none shadow-2xl">
      <canvas
        id="cyber_athletic_arena_canvas"
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full cursor-crosshair block touch-none"
      />

      {/* On-canvas Quick Legend & Helper */}
      <div className="absolute top-3 right-3 flex items-center gap-2 bg-[#090d16]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1e293b] text-[11px] text-slate-300 font-mono pointer-events-none">
        <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>$1 \equiv 1$ PARITY VERIFIED</span>
      </div>

      <div className="absolute bottom-3 left-3 bg-[#090d16]/85 backdrop-blur-md px-3 py-2 rounded-lg border border-[#1e293b] text-[11px] text-slate-400 font-mono pointer-events-none flex flex-wrap gap-3">
        <span><strong className="text-cyan-400">CLICK / TAP:</strong> Cast Vector Tether</span>
        <span><strong className="text-amber-400">CLICK HULL:</strong> Apply Kinetic Shear</span>
        <span><strong className="text-emerald-400">KEYBOARD:</strong> W,A,S,D / Arrows to Maneuver</span>
      </div>
    </div>
  );
};
