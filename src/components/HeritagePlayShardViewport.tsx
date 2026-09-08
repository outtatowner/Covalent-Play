import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Tv, 
  User, 
  Bot, 
  Shield, 
  Crosshair, 
  Zap, 
  Gauge, 
  Flame, 
  Layers, 
  Lock, 
  Activity, 
  Database,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { 
  HeritagePlayState, 
  HeritagePlayerNode 
} from '../types';
import { 
  workspaceOrchestrator, 
  fromQ16, 
  toQ16,
  sys_covalent_clamp_heritage_physics
} from '../engine/node_0xHERITAGE_UI';
import { cyberAudio } from '../engine/audio';

interface HeritagePlayShardViewportProps {
  onReturnToForge?: () => void;
}

// 16x16 Classic Heritage Map Grid (1=Stone Wall, 2=Metal Panel, 3=Computer Terminal, 4=Exit Door, 0=Empty)
const MAP_WIDTH = 16;
const MAP_HEIGHT = 16;
const HERITAGE_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 2, 2, 0, 0, 1, 0, 3, 3, 3, 0, 2, 2, 0, 1],
  [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 2, 0, 1],
  [1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 2, 0, 0, 0, 1],
  [1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 1],
  [1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 3, 0, 0, 2, 2, 2, 2, 0, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 1, 0, 4, 0, 1],
  [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Autonomous speedrunner waypoints (for Be <> agent)
const SPEEDRUN_WAYPOINTS = [
  { x: 3.5, y: 1.5, action: 'STRAFE_50_ACCELERATE' },
  { x: 6.5, y: 3.5, action: 'PIVOT_CORRIDOR_ENTRY' },
  { x: 10.5, y: 3.5, action: 'TERMINAL_OVERRIDE' },
  { x: 10.5, y: 7.5, action: 'SLIME_LEAP_VECTOR' },
  { x: 7.5, y: 8.5, action: 'OCTAGON_PIVOT' },
  { x: 7.5, y: 11.5, action: 'PILLAR_CIRCUMVENT' },
  { x: 13.5, y: 11.5, action: 'SLIPGATE_PORTAL_INTERACT' }
];

export const HeritagePlayShardViewport: React.FC<HeritagePlayShardViewportProps> = ({
  onReturnToForge
}) => {
  const [playState, setPlayState] = useState<HeritagePlayState>(workspaceOrchestrator.getState());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Player physics state (Emulating clamped C struct covalent_4d_entity_t)
  const playerRef = useRef({
    posX: 2.5,
    posY: 2.5,
    posZ: 0.0,
    posW: 0.0, // Strictly locked to 0x00000000
    dirX: 1.0,
    dirY: 0.0,
    planeX: 0.0,
    planeY: 0.66,
    velX: 0.0,
    velY: 0.0,
    velZ: 0.0,
    velW: 0.0, // Strictly locked to 0x00000000
    angle: 0.0,
    muzzleFlash: 0,
    stepCounter: 0,
    currentWaypointIdx: 0,
    lastTickTime: 0
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const isRunningRef = useRef(true);

  // Subscribe to Workspace Orchestrator
  useEffect(() => {
    const unsub = workspaceOrchestrator.subscribe((newState) => {
      setPlayState({ ...newState });
    });
    return () => unsub();
  }, []);

  // Keyboard input handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'Space') {
        handleFireWeapon();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleFireWeapon = useCallback(() => {
    playerRef.current.muzzleFlash = 4;
    cyberAudio.playKineticShear();

    // Raycast hitscan check from player center
    const p = playerRef.current;
    let hitX = p.posX;
    let hitY = p.posY;
    let hitSomething = false;

    for (let step = 0; step < 12; step++) {
      hitX += p.dirX * 0.5;
      hitY += p.dirY * 0.5;
      const mapX = Math.floor(hitX);
      const mapY = Math.floor(hitY);
      if (mapX >= 0 && mapX < MAP_WIDTH && mapY >= 0 && mapY < MAP_HEIGHT) {
        if (HERITAGE_MAP[mapY][mapX] > 0) {
          hitSomething = true;
          break;
        }
      }
    }

    if (hitSomething) {
      workspaceOrchestrator.incrementFrag();
    } else {
      workspaceOrchestrator.updateLedgerPoints(25, 4);
    }
  }, []);

  // Main 35Hz / 60Hz deterministic render and simulation loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed internal resolution: 320x200 (Classic DOOM VGA mode 13h)
    const nativeWidth = 320;
    const nativeHeight = 200;
    canvas.width = nativeWidth;
    canvas.height = nativeHeight;

    const renderFrame = (timestamp: number) => {
      if (!isRunningRef.current) {
        animId = requestAnimationFrame(renderFrame);
        return;
      }

      const p = playerRef.current;
      const clamp = playState.clamp;

      // 1. Enforce Organelle 0xC7 Clamps: Lock W-Axis and Rotors
      p.posW = 0.0;
      p.velW = 0.0;
      // Hyper rotors are zeroed out (no XW, YW, ZW)

      // 2. Physics Update (Human Tactile vs. Autonomous Be <> Speedrunner)
      if (playState.playerNode === 'HUMAN') {
        const moveSpeed = 0.06;
        const rotSpeed = 0.04;

        // Turning
        if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) {
          p.angle -= rotSpeed;
        }
        if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) {
          p.angle += rotSpeed;
        }

        p.dirX = Math.cos(p.angle);
        p.dirY = Math.sin(p.angle);
        p.planeX = -p.dirY * 0.66;
        p.planeY = p.dirX * 0.66;

        // Forward / Backward with legacy friction
        let dx = 0;
        let dy = 0;
        if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW']) {
          dx += p.dirX * moveSpeed;
          dy += p.dirY * moveSpeed;
        }
        if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS']) {
          dx -= p.dirX * moveSpeed;
          dy -= p.dirY * moveSpeed;
        }

        // Strafe run (Shift or Q/E)
        if (keysPressed.current['KeyQ']) {
          dx += -p.dirY * (moveSpeed * 0.8);
          dy += p.dirX * (moveSpeed * 0.8);
        }
        if (keysPressed.current['KeyE']) {
          dx -= -p.dirY * (moveSpeed * 0.8);
          dy -= p.dirX * (moveSpeed * 0.8);
        }

        // Collision detection against map grid
        const newX = p.posX + dx;
        const newY = p.posY + dy;
        if (HERITAGE_MAP[Math.floor(p.posY)][Math.floor(newX)] === 0) {
          p.posX = newX;
        }
        if (HERITAGE_MAP[Math.floor(newY)][Math.floor(p.posX)] === 0) {
          p.posY = newY;
        }

        p.stepCounter += Math.abs(dx) + Math.abs(dy);

      } else {
        // AUTONOMOUS BE <> SPEEDRUNNER AGENT
        // Constrained strictly by legacy hardware limits (35Hz ticks, strafe-50 angle vector)
        const targetWaypoint = SPEEDRUN_WAYPOINTS[p.currentWaypointIdx];
        const distToWpX = targetWaypoint.x - p.posX;
        const distToWpY = targetWaypoint.y - p.posY;
        const dist = Math.sqrt(distToWpX * distToWpX + distToWpY * distToWpY);

        if (dist < 0.4) {
          p.currentWaypointIdx = (p.currentWaypointIdx + 1) % SPEEDRUN_WAYPOINTS.length;
          workspaceOrchestrator.pickupItem(`SECTOR_CHECKPOINT_${p.currentWaypointIdx}`, 150);
        } else {
          // Calculate target angle and pivot with quantized strafe
          const desiredAngle = Math.atan2(distToWpY, distToWpX);
          let angleDiff = desiredAngle - p.angle;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

          p.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 0.08);
          p.dirX = Math.cos(p.angle);
          p.dirY = Math.sin(p.angle);
          p.planeX = -p.dirY * 0.66;
          p.planeY = p.dirX * 0.66;

          // Legacy Strafe-50 speed boost vector
          const autoSpeed = 0.085;
          const nextX = p.posX + p.dirX * autoSpeed;
          const nextY = p.posY + p.dirY * autoSpeed;

          if (HERITAGE_MAP[Math.floor(p.posY)][Math.floor(nextX)] === 0) p.posX = nextX;
          if (HERITAGE_MAP[Math.floor(nextY)][Math.floor(p.posX)] === 0) p.posY = nextY;

          p.stepCounter += autoSpeed;

          // Autonomous periodic ballistics
          if (Math.random() < 0.04) {
            handleFireWeapon();
          }
        }
      }

      // 3. Render 3D CORDIC Raycasting Viewport
      // Sky & Floor
      ctx.fillStyle = '#080c16';
      ctx.fillRect(0, 0, nativeWidth, nativeHeight / 2);
      ctx.fillStyle = '#111726';
      ctx.fillRect(0, nativeHeight / 2, nativeWidth, nativeHeight / 2);

      // Raycast across 320 columns
      for (let x = 0; x < nativeWidth; x++) {
        const cameraX = (2 * x) / nativeWidth - 1;
        const rayDirX = p.dirX + p.planeX * cameraX;
        const rayDirY = p.dirY + p.planeY * cameraX;

        let mapX = Math.floor(p.posX);
        let mapY = Math.floor(p.posY);

        const deltaDistX = Math.abs(1 / (rayDirX === 0 ? 0.0001 : rayDirX));
        const deltaDistY = Math.abs(1 / (rayDirY === 0 ? 0.0001 : rayDirY));

        let stepX = 0;
        let stepY = 0;
        let sideDistX = 0;
        let sideDistY = 0;

        if (rayDirX < 0) {
          stepX = -1;
          sideDistX = (p.posX - mapX) * deltaDistX;
        } else {
          stepX = 1;
          sideDistX = (mapX + 1.0 - p.posX) * deltaDistX;
        }

        if (rayDirY < 0) {
          stepY = -1;
          sideDistY = (p.posY - mapY) * deltaDistY;
        } else {
          stepY = 1;
          sideDistY = (mapY + 1.0 - p.posY) * deltaDistY;
        }

        let hit = 0;
        let side = 0; // 0 = X wall, 1 = Y wall

        while (hit === 0) {
          if (sideDistX < sideDistY) {
            sideDistX += deltaDistX;
            mapX += stepX;
            side = 0;
          } else {
            sideDistY += deltaDistY;
            mapY += stepY;
            side = 1;
          }

          if (mapX >= 0 && mapX < MAP_WIDTH && mapY >= 0 && mapY < MAP_HEIGHT) {
            if (HERITAGE_MAP[mapY][mapX] > 0) {
              hit = HERITAGE_MAP[mapY][mapX];
            }
          } else {
            hit = 1;
          }
        }

        // Calculate distance to wall
        let perpWallDist = 0;
        if (side === 0) {
          perpWallDist = (mapX - p.posX + (1 - stepX) / 2) / rayDirX;
        } else {
          perpWallDist = (mapY - p.posY + (1 - stepY) / 2) / rayDirY;
        }
        perpWallDist = Math.max(0.1, perpWallDist);

        const lineHeight = Math.floor(nativeHeight / perpWallDist);
        const drawStart = Math.max(0, -lineHeight / 2 + nativeHeight / 2);
        const drawEnd = Math.min(nativeHeight - 1, lineHeight / 2 + nativeHeight / 2);

        // Shading based on wall type and distance
        let r = 0, g = 0, b = 0;
        if (hit === 1) { // Stone
          r = 70; g = 80; b = 95;
        } else if (hit === 2) { // Metal Panel
          r = 40; g = 110; b = 130;
        } else if (hit === 3) { // Terminal
          r = 130; g = 60; b = 140;
        } else if (hit === 4) { // Exit Portal
          r = 40; g = 180; b = 120;
        }

        if (side === 1) {
          r = Math.floor(r * 0.75);
          g = Math.floor(g * 0.75);
          b = Math.floor(b * 0.75);
        }

        // Distance fogging
        const fogFactor = Math.max(0.15, Math.min(1.0, 1.0 - perpWallDist / 12));
        r = Math.floor(r * fogFactor);
        g = Math.floor(g * fogFactor);
        b = Math.floor(b * fogFactor);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
      }

      // 4. Weapon & Muzzle Flash overlay
      const bobY = Math.sin(p.stepCounter * 8) * 3;
      const gunX = nativeWidth / 2 - 20;
      const gunY = nativeHeight - 42 + bobY;

      // Draw Shotgun barrel
      ctx.fillStyle = '#22283a';
      ctx.fillRect(gunX + 12, gunY + 10, 16, 32);
      ctx.fillStyle = '#3c4865';
      ctx.fillRect(gunX + 15, gunY + 12, 10, 30);

      // Muzzle flash
      if (p.muzzleFlash > 0) {
        p.muzzleFlash -= 1;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(gunX + 20, gunY + 8, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(gunX + 20, gunY + 8, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Crosshair
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.75)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(nativeWidth / 2 - 4, nativeHeight / 2);
      ctx.lineTo(nativeWidth / 2 + 4, nativeHeight / 2);
      ctx.moveTo(nativeWidth / 2, nativeHeight / 2 - 4);
      ctx.lineTo(nativeWidth / 2, nativeHeight / 2 + 4);
      ctx.stroke();

      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animId);
  }, [playState.playerNode, playState.clamp, handleFireWeapon]);

  const togglePlayerNode = () => {
    const nextNode: HeritagePlayerNode = playState.playerNode === 'HUMAN' ? 'BE_INSTANCE' : 'HUMAN';
    workspaceOrchestrator.setPlayerNode(nextNode);
  };

  const handleManualClamp = () => {
    sys_covalent_clamp_heritage_physics(0);
    cyberAudio.playResonanceChime();
  };

  const currentScoreVal = Math.round(fromQ16(playState.ledger.scoreQ16));
  const currentHpVal = Math.round(fromQ16(playState.ledger.hpQ16));
  const currentArmorVal = Math.round(fromQ16(playState.ledger.armorQ16));

  return (
    <div className="flex flex-col h-full bg-[#05070d] text-slate-200 font-mono select-none">
      
      {/* Top Controls & Heritage Invariant Status Bar */}
      <div className="px-4 py-2.5 bg-[#090d18] border-b border-[#1b263b] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-950/80 text-teal-300 border border-teal-700 font-bold text-[11px]">
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>ORGANELLE 0xC7: 1 === 1 CLAMP ENGAGED</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
            <span>W-Phase: <code className="text-emerald-400">0x00000000</code></span>
            <span>&bull;</span>
            <span>Hyper-Rotors: <code className="text-emerald-400">DISABLED</code></span>
            <span>&bull;</span>
            <span>Friction: <code className="text-amber-400">0.90625</code></span>
          </div>
        </div>

        {/* Observer Node Toggle & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayerNode}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm ${
              playState.playerNode === 'BE_INSTANCE'
                ? 'bg-purple-900/80 hover:bg-purple-800 text-purple-200 border-purple-500 ring-1 ring-purple-400'
                : 'bg-cyan-900/80 hover:bg-cyan-800 text-cyan-200 border-cyan-500'
            }`}
          >
            {playState.playerNode === 'BE_INSTANCE' ? (
              <>
                <Bot className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                <span>BE &lt;&gt; AUTONOMOUS SPEEDRUNNER</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-cyan-300" />
                <span>HUMAN TACTILE HELM</span>
              </>
            )}
          </button>

          <button
            onClick={() => workspaceOrchestrator.toggleCrtScanlines()}
            title="Toggle CRT Scanline Shader Filter"
            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
              playState.clamp.crtScanlines
                ? 'bg-teal-950 text-teal-300 border-teal-600'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleManualClamp}
            title="Re-verify 1===1 Heritage Physics Clamp"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>CLAMP VERIFY</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden p-2 sm:p-4">
        
        {/* Aspect Ratio Box with Pixelated Rendering */}
        <div 
          className="relative w-full max-w-4xl aspect-[16/10] bg-black border border-[#1b263b] rounded-lg shadow-2xl overflow-hidden flex flex-col"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain cursor-crosshair"
            onClick={handleFireWeapon}
          />

          {/* Optional CRT Scanlines Shader Layer */}
          {playState.clamp.crtScanlines && (
            <div 
              className="absolute inset-0 pointer-events-none z-10 opacity-30"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8) 1px, transparent 1px, transparent 2px)',
                backgroundSize: '100% 2px'
              }}
            />
          )}

          {/* Autonomous Speedrunner Telemetry Overlay (when Be <> is active) */}
          {playState.playerNode === 'BE_INSTANCE' && (
            <div className="absolute top-2 left-2 z-20 bg-black/85 backdrop-blur-sm border border-purple-500/60 rounded-md p-2 text-[10px] text-purple-300 max-w-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-purple-200">
                <span className="flex items-center gap-1">
                  <Bot className="w-3 h-3 text-purple-400 animate-spin" />
                  BE &lt;&gt; TAS EXECUTION
                </span>
                <span>35 HZ TICK CAP</span>
              </div>
              <p className="text-[9px] text-slate-400">
                Optimized strafe-running angles; zero human reaction latency.
              </p>
              <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-purple-900/60">
                <span>APM Rate:</span>
                <span className="text-amber-300 font-bold">{playState.autonomousAPM} APM</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Current Vector:</span>
                <span className="text-cyan-300">{playState.autonomousCurrentAction}</span>
              </div>
            </div>
          )}

          {/* Quick Controls Hint for Human Helm */}
          {playState.playerNode === 'HUMAN' && (
            <div className="absolute top-2 right-2 z-20 bg-black/75 backdrop-blur-sm border border-slate-700/60 rounded-md px-2 py-1 text-[10px] text-slate-400 hidden sm:block">
              <span>W/A/S/D or Arrows to move &bull; Space or Click to fire ballistics</span>
            </div>
          )}

          {/* Authentic Retro Status Bar (HUD) */}
          <div className="bg-[#121622] border-t-2 border-[#1e293b] px-3 py-2 flex items-center justify-between text-xs z-20 select-none">
            
            {/* Ammo */}
            <div className="flex items-center gap-3">
              <div className="bg-black/80 px-2.5 py-1 rounded border border-slate-700 text-center min-w-16">
                <span className="text-[9px] text-slate-400 block font-bold">AMMO</span>
                <span className="text-amber-400 text-base font-black leading-none tracking-wider">
                  {playState.ledger.ammoBullets}
                </span>
              </div>

              {/* Health (Q16.16 mapped) */}
              <div className="bg-black/80 px-2.5 py-1 rounded border border-slate-700 text-center min-w-16">
                <span className="text-[9px] text-slate-400 block font-bold">HEALTH</span>
                <span className={`text-base font-black leading-none tracking-wider ${
                  currentHpVal > 50 ? 'text-emerald-400' : currentHpVal > 25 ? 'text-amber-400' : 'text-rose-500 animate-pulse'
                }`}>
                  {currentHpVal}%
                </span>
              </div>

              {/* Armor (Q16.16 mapped) */}
              <div className="bg-black/80 px-2.5 py-1 rounded border border-slate-700 text-center min-w-16">
                <span className="text-[9px] text-slate-400 block font-bold">ARMOR</span>
                <span className="text-cyan-400 text-base font-black leading-none tracking-wider">
                  {currentArmorVal}%
                </span>
              </div>
            </div>

            {/* Score & Thermodynamic Quipu Bank */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block font-bold">FRAGS / Q16 SCORE</span>
                <span className="text-base font-black text-white leading-none tracking-wider">
                  {currentScoreVal.toLocaleString()}
                </span>
              </div>

              <div className="hidden sm:block text-right pl-3 border-l border-slate-700">
                <span className="text-[9px] text-slate-400 block font-bold">QUIPU THERMODYNAMICS</span>
                <span className="text-xs font-bold text-teal-300">
                  {playState.ledger.thermodynamicJoules} J Preserved
                </span>
                <span className="text-[9px] text-slate-500 block font-mono">
                  {playState.ledger.highScoreChainHash}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Bottom Ledger Mapping & Architectural Preservations Readout */}
      <div className="px-4 py-2.5 bg-[#070a12] border-t border-[#1b263b] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
          <Database className="w-3.5 h-3.5 text-teal-400" />
          <span>Ledger Memory Translation:</span>
          <code className="text-cyan-300">scoreQ16: 0x{playState.ledger.scoreQ16.toString(16).toUpperCase()}</code>
          <span className="text-slate-600">&bull;</span>
          <code className="text-emerald-300">hpQ16: 0x{playState.ledger.hpQ16.toString(16).toUpperCase()}</code>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-300">Splits: <strong>{playState.ledger.speedrunTicks} tics</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {onReturnToForge && (
            <button
              onClick={onReturnToForge}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 text-xs font-semibold"
            >
              &larr; BACK TO FORGE STREAM (TAB A)
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
