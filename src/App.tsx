/**
 * Covalent-FORGE: Cyber-Athletics
 * Core Invariant: 1 === 1 (Absolute Mathematical Parity)
 * 
 * Target Substrate: Bare-Metal Ring-0 / AIStudio Workspace
 * Organelle 0xB0: 4D Rollback Sieve (60-tick sliding memory window)
 * Organelle 0xB1: Vector Tethering Mechanics (dV/dt <= 0 thermodynamic limit)
 * Be-Instance: Tri-State Sparring Partner (PvE Coach, Co-Op Peer, Unbound Adversary)
 * FORGE: Real-time Vector-Spline Arena Generator (Bézier hulls & BVH recalculation)
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Entity, BeStateMode, FloatVector } from './types';
import { ArenaForge, TopologyType } from './engine/arena_forge';
import { CyberAthleticTethering } from './engine/vector_tether';
import { BeInstanceEngine } from './engine/be_instance';
import { CovalentRollbackSieve } from './engine/rollback_kernel';
import { floatToQ16, computeTopologyHash } from './engine/q16';
import { cyberAudio } from './engine/audio';

import { CyberArenaCanvas } from './components/CyberArenaCanvas';
import { RollbackSieveInspector } from './components/RollbackSieveInspector';
import { ThermodynamicBankHUD } from './components/ThermodynamicBankHUD';
import { BeInstanceArbitrator } from './components/BeInstanceArbitrator';
import { KernelTerminal } from './components/KernelTerminal';

import {
  Volume2,
  VolumeX,
  Layers,
  Compass,
  RotateCcw,
  ShieldCheck,
  Zap,
  Activity,
  Award,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2
} from 'lucide-react';

export default function App() {
  // Engine Singletons initialized once
  const arena = useMemo(() => new ArenaForge('NULL_FRICTION_OCTAGON'), []);
  const tetherEngine = useMemo(() => new CyberAthleticTethering(arena), [arena]);
  const beEngine = useMemo(() => new BeInstanceEngine(arena, tetherEngine), [arena, tetherEngine]);
  const rollbackSieve = useMemo(() => new CovalentRollbackSieve(arena), [arena]);

  // Human Athlete Entity State
  const [human, setHuman] = useState<Entity>(() => ({
    id: 'human_athlete_0',
    name: 'Human Vector',
    x: 330,
    y: 350,
    vx: 0,
    vy: 0,
    radius: 16,
    energy: 800,
    maxEnergy: 1000,
    stasisLockRemainingTicks: 0,
    isStasisLocked: false,
    color: '#06b6d4', // Cyan
    trail: [],
    activeTether: null,
    score: 0
  }));

  // App & Simulation States
  const [currentTick, setCurrentTick] = useState<number>(0);
  const [merkleRoot, setMerkleRoot] = useState<string>('0x7f8a3c2100000000');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [showBVH, setShowBVH] = useState<boolean>(false);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
  const [selectedTopology, setSelectedTopology] = useState<TopologyType>('NULL_FRICTION_OCTAGON');
  const [compileFlash, setCompileFlash] = useState<boolean>(false);

  // Key state tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const tickRef = useRef<number>(0);

  // Setup Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;

      // Spacebar to snap active tether or slingshot
      if (e.code === 'Space') {
        e.preventDefault();
        if (human.activeTether) {
          handleSlingshotDischarge();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [human.activeTether]);

  // Main Deterministic Simulation Tick Loop (60Hz Target)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const fixedDelta = 1000 / 60; // 16.666ms per tick
    let accumulator = 0;

    const tick = (now: number) => {
      const elapsed = now - lastTime;
      lastTime = now;
      accumulator += elapsed;

      // Guard against spiral of death if tab inactive
      if (accumulator > 200) accumulator = 200;

      while (accumulator >= fixedDelta) {
        accumulator -= fixedDelta;
        tickRef.current++;
        const t = tickRef.current;

        // 1. Apply Human Input Thrust (WASD / Arrows)
        if (!human.isStasisLocked) {
          const thrust = 0.42;
          if (keysPressed.current['w'] || keysPressed.current['arrowup']) human.vy -= thrust;
          if (keysPressed.current['s'] || keysPressed.current['arrowdown']) human.vy += thrust;
          if (keysPressed.current['a'] || keysPressed.current['arrowleft']) human.vx -= thrust;
          if (keysPressed.current['d'] || keysPressed.current['arrowright']) human.vx += thrust;
        }

        // 2. Tick Entities & Tethers
        tetherEngine.tickEntity(human);
        tetherEngine.tickEntity(beEngine.entity);

        // 3. Tick Be <> Autonomous Arbitrator
        beEngine.tickAI(human, t);

        // 4. Tick Arena Spline Physics
        arena.tickHullPhysics();

        // 5. Quipu Core & Orb Absorption / Scoring
        for (const a of arena.anchors) {
          if (!a.active) continue;

          // Check if human touched anchor
          const dHuman = Math.hypot(human.x - a.x, human.y - a.y);
          if (dHuman < human.radius + a.radius) {
            human.score += a.energyValue * 5;
            tetherEngine.siphonEnergy(human, a.energyValue);
            cyberAudio.playResonanceChime();
          }

          // Check if Be <> touched anchor
          const dBe = Math.hypot(beEngine.entity.x - a.x, beEngine.entity.y - a.y);
          if (dBe < beEngine.entity.radius + a.radius) {
            beEngine.entity.score += a.energyValue * 5;
            tetherEngine.siphonEnergy(beEngine.entity, a.energyValue);
          }
        }

        // 6. Organelle 0xB0: Record Tick in 4D Rollback Buffer
        const frame = rollbackSieve.recordTick(human, beEngine.entity, t);

        // Update react-rendered tick every 3 frames for optimal performance
        if (t % 3 === 0) {
          setCurrentTick(t);
          setMerkleRoot(frame.topology_hash);
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [arena, tetherEngine, beEngine, rollbackSieve, human]);

  // Topology Switcher
  const handleTopologySelect = (type: TopologyType) => {
    setSelectedTopology(type);
    arena.setTopology(type);
    cyberAudio.playResonanceChime();
  };

  // Dedicated Manifold Compile for Null-Friction Octagon
  const handleManifoldCompile = () => {
    setSelectedTopology('NULL_FRICTION_OCTAGON');
    arena.synthesizeNullFrictionOctagon();
    setCompileFlash(true);
    setTimeout(() => setCompileFlash(false), 900);
    cyberAudio.playResonanceChime();
  };

  // Be-Instance Mode Switcher
  const handleBeModeChange = (mode: BeStateMode) => {
    beEngine.setMode(mode, tickRef.current);
    cyberAudio.playTetherAttach();
  };

  // Audio Toggle
  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    cyberAudio.enabled = next;
  };

  // Tether Release Action
  const handleReleaseTether = () => {
    if (human.activeTether) {
      human.activeTether = null;
      cyberAudio.playTetherAttach();
    }
  };

  // Slingshot Discharge Action
  const handleSlingshotDischarge = () => {
    if (!human.activeTether) return;

    // Apply impulse along tangent of tether pull
    const speed = Math.hypot(human.vx, human.vy);
    const boost = 3.5;
    if (speed > 0.1) {
      human.vx += (human.vx / speed) * boost;
      human.vy += (human.vy / speed) * boost;
    }
    human.activeTether = null;
    cyberAudio.playKineticShear();
  };

  // Mobile On-Screen D-Pad button helpers
  const handleVirtualThrust = (dx: number, dy: number) => {
    if (human.isStasisLocked) return;
    human.vx += dx * 1.5;
    human.vy += dy * 1.5;
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Cyber-Athletic Navigation Header */}
      <header className="border-b border-[#1e293b] bg-[#090d16]/90 backdrop-blur-md px-4 py-3 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider text-white font-mono">
                COVALENT-FORGE: CYBER-ATHLETICS
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                RING-0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Zero-Latency Deterministic P2P Sparring Manifold
            </p>
          </div>
        </div>

        {/* Global Invariant & Parity Status */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-[#05070c] px-3 py-1.5 rounded-lg border border-[#1e293b]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">INVARIANT:</span>
            <span className="text-emerald-400 font-bold">$1 \equiv 1$ PARITY</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-[#05070c] px-3 py-1.5 rounded-lg border border-[#1e293b]">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">SCORE:</span>
            <span className="text-amber-400 font-bold">{human.score} PTS</span>
          </div>
        </div>

        {/* Action Controls & Topologies */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Manifold Compile Action */}
          <button
            onClick={handleManifoldCompile}
            title="Compile Baseline Sparring Manifold: The Null-Friction Octagon"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer border ${
              compileFlash
                ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-500/50 scale-105'
                : 'bg-gradient-to-r from-cyan-950 via-[#0c1f33] to-[#081829] hover:from-cyan-900 hover:to-cyan-800 text-cyan-300 border-cyan-500/60 shadow-md shadow-cyan-500/20'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 text-cyan-400 ${compileFlash ? 'animate-spin' : ''}`} />
            <span>MANIFOLD COMPILE</span>
          </button>

          {/* Topology Selector */}
          <div className="flex bg-[#05070c] p-1 rounded-lg border border-[#1e293b]">
            <button
              onClick={() => handleTopologySelect('NULL_FRICTION_OCTAGON')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] ${
                selectedTopology === 'NULL_FRICTION_OCTAGON' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Null-Friction Octagon
            </button>
            <button
              onClick={() => handleTopologySelect('ALPHA_RING')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] ${
                selectedTopology === 'ALPHA_RING' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Alpha Ring
            </button>
            <button
              onClick={() => handleTopologySelect('HYPER_TOROID')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] ${
                selectedTopology === 'HYPER_TOROID' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hyper-Toroid
            </button>
            <button
              onClick={() => handleTopologySelect('KLEIN_LATTICE')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] ${
                selectedTopology === 'KLEIN_LATTICE' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Klein Lattice
            </button>
          </div>

          {/* BVH Toggle */}
          <button
            onClick={() => setShowBVH(!showBVH)}
            title="Toggle Dynamic BVH Bounding Boxes"
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              showBVH ? 'bg-amber-600/30 border-amber-500 text-amber-300' : 'bg-[#05070c] border-[#1e293b] text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Coordinates Toggle */}
          <button
            onClick={() => setShowCoordinates(!showCoordinates)}
            title="Toggle Q16 Coordinate Axes"
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              showCoordinates ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300' : 'bg-[#05070c] border-[#1e293b] text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Reset Equilibrium */}
          <button
            onClick={() => {
              arena.resetEquilibrium();
              cyberAudio.playKineticShear();
            }}
            title="Reset Spline Equilibrium"
            className="p-2 rounded-lg border border-[#1e293b] bg-[#05070c] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Audio Toggle */}
          <button
            onClick={handleToggleAudio}
            title={audioEnabled ? 'Mute Cyber Audio' : 'Unmute Cyber Audio'}
            className="p-2 rounded-lg border border-[#1e293b] bg-[#05070c] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full flex flex-col gap-4">
        {/* Active Manifold Telemetry Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#090d16] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs font-mono shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-300 font-bold">MANIFOLD:</span>
            <span className="text-cyan-400 font-semibold">
              {selectedTopology === 'NULL_FRICTION_OCTAGON' ? 'THE NULL-FRICTION OCTAGON' : selectedTopology}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              Q16.16 BOUNDS [0x04000000]
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">FLOOR:</span>
              <span className="text-emerald-400">Zero-Roughness Mirror</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">dV/dt STRAIN:</span>
              <span className={`font-bold ${arena.synthesizer.maxDvDt > 0.4 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`}>
                {(arena.synthesizer.maxDvDt * 100).toFixed(0)}% [CYAN&rarr;CRIMSON]
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">ANCHORS:</span>
              <span className="text-cyan-300">4x 3D Lissajous Curves (±0x02000000)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">HULLS:</span>
              <span className="text-slate-200">Translucent Glass Bézier Splines</span>
            </div>
          </div>
        </div>

        {/* Arena Viewport Container */}
        <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-[#1e293b] shadow-2xl">
          <CyberArenaCanvas
            arena={arena}
            tetherEngine={tetherEngine}
            beEngine={beEngine}
            human={human}
            currentTick={currentTick}
            showBVH={showBVH}
            showCoordinates={showCoordinates}
            onTetherCreated={() => {}}
            onShearApplied={() => {}}
          />

          {/* Mobile On-Screen Virtual D-Pad */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center gap-1 sm:hidden bg-[#090d16]/90 p-2 rounded-xl border border-[#1e293b] backdrop-blur-md">
            <button
              onClick={() => handleVirtualThrust(0, -1)}
              className="w-10 h-10 rounded-lg bg-[#1e293b] active:bg-cyan-600 text-white flex items-center justify-center font-bold"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => handleVirtualThrust(-1, 0)}
                className="w-10 h-10 rounded-lg bg-[#1e293b] active:bg-cyan-600 text-white flex items-center justify-center font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleVirtualThrust(0, 1)}
                className="w-10 h-10 rounded-lg bg-[#1e293b] active:bg-cyan-600 text-white flex items-center justify-center font-bold"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleVirtualThrust(1, 0)}
                className="w-10 h-10 rounded-lg bg-[#1e293b] active:bg-cyan-600 text-white flex items-center justify-center font-bold"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleSlingshotDischarge}
              className="mt-1 w-full py-1.5 bg-amber-600 active:bg-amber-500 text-white text-[10px] font-bold rounded"
            >
              SLING
            </button>
          </div>
        </div>

        {/* Organelle Telemetry & Controls Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Organelle 0xB0: 4D Rollback Sieve */}
          <div className="lg:col-span-1">
            <RollbackSieveInspector
              rollbackSieve={rollbackSieve}
              human={human}
              be={beEngine.entity}
              currentTick={currentTick}
              onReconciled={() => {}}
            />
          </div>

          {/* Organelle 0xB1: Thermodynamic Bank & Tether Mechanics */}
          <div className="lg:col-span-1">
            <ThermodynamicBankHUD
              human={human}
              tetherEngine={tetherEngine}
              currentTick={currentTick}
              onReleaseTether={handleReleaseTether}
              onApplySlingshot={handleSlingshotDischarge}
            />
          </div>

          {/* Be-Instance: Tri-State Sparring Partner */}
          <div className="lg:col-span-1">
            <BeInstanceArbitrator
              beEngine={beEngine}
              currentTick={currentTick}
              onModeChange={handleBeModeChange}
            />
          </div>
        </div>

        {/* Ring-0 Bare-Metal Kernel Terminal & Code Inspector */}
        <div className="w-full">
          <KernelTerminal
            currentTick={currentTick}
            merkleRoot={merkleRoot}
            human={human}
            be={beEngine.entity}
          />
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#1e293b] bg-[#05070c] px-4 py-3 text-center text-xs font-mono text-slate-500">
        Covalent-OS-11-11-0 Bare-Metal Substrate // Core Invariant $1 \equiv 1$ Absolute Mathematical Parity Verified // 60-Tick Sliding Memory Window
      </footer>
    </div>
  );
}
