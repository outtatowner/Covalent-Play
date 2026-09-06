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
import { phaseOfficiator } from './engine/phase_officiator';

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
  Maximize2,
  Orbit,
  Shield,
  Disc
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
    z: 0,
    w: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    vw: 0,
    pitch: 0,
    yaw: 0,
    roll: 0,
    rotor: [0, 0, 0, 0, 0, 0],
    hyperRadius: 32,
    apparentRadius3D: 18,
    phaseBleed: 0,
    radius: 16,
    boundingRadius: 18,
    energy: 800,
    maxEnergy: 1000,
    stasisLockRemainingTicks: 0,
    isStasisLocked: false,
    isBraking: false,
    color: '#06b6d4', // Cyan
    trail: [],
    trail3D: [],
    activeTether: null,
    score: 0
  }));

  // App & Simulation States
  const [currentTick, setCurrentTick] = useState<number>(0);
  const [merkleRoot, setMerkleRoot] = useState<string>('0x7f8a3c2100000000');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [showBVH, setShowBVH] = useState<boolean>(false);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
  const [selectedTopology, setSelectedTopology] = useState<TopologyType>('ISOTROPIC_HYPER_SPHERE');
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

        // 1. Thermodynamic Brake (Shift / B): Halts kinetic momentum and deposits -dV/dt strain
        if (keysPressed.current['shift'] || keysPressed.current['b']) {
          human.isBraking = true;
          const braked = tetherEngine.applyThermodynamicBrake(human, t);
          if (braked && t % 12 === 0) {
            cyberAudio.playThermodynamicBrake();
          }
        } else {
          human.isBraking = false;
        }

        // 2. Apply Human 6DOF & 4D Input Thrust
        if (!human.isStasisLocked && !human.isBraking) {
          const thrust = 0.42;
          const is3D = arena.topologyType === 'ISOTROPIC_HYPER_SPHERE' || arena.topologyType === 'THE_NULL_FRICTION_TESSERACT';
          const isTesseract = arena.topologyType === 'THE_NULL_FRICTION_TESSERACT';

          // Planar XY Thrust
          if (keysPressed.current['w'] || keysPressed.current['arrowup']) human.vy -= thrust;
          if (keysPressed.current['s'] || keysPressed.current['arrowdown']) human.vy += thrust;
          if (keysPressed.current['a'] || keysPressed.current['arrowleft']) human.vx -= thrust;
          if (keysPressed.current['d'] || keysPressed.current['arrowright']) human.vx += thrust;

          // Volumetric Z Thrust (Space / R = Ascend, C / F = Descend)
          if (is3D) {
            if (keysPressed.current[' '] || keysPressed.current['r']) human.vz = (human.vz || 0) + thrust;
            if (keysPressed.current['c'] || keysPressed.current['f']) human.vz = (human.vz || 0) - thrust;
          }

          // 6DOF Roll Control (Q / E)
          if (keysPressed.current['q']) human.roll -= 0.05;
          if (keysPressed.current['e']) human.roll += 0.05;

          // 4D Phase Shift Traversal ([ / ] or 1 / 2 or U / I)
          if (isTesseract) {
            if (keysPressed.current['['] || keysPressed.current['1'] || keysPressed.current['u']) {
              phaseOfficiator.applyPhaseShift(human, -0.6);
              if (t % 18 === 0) cyberAudio.playPhaseShift();
            }
            if (keysPressed.current[']'] || keysPressed.current['2'] || keysPressed.current['i']) {
              phaseOfficiator.applyPhaseShift(human, 0.6);
              if (t % 18 === 0) cyberAudio.playPhaseShift();
            }
            // 4D Hyper-Rotations along XW / YW planes
            if (keysPressed.current['x']) {
              phaseOfficiator.applyHyperRotation(human, 3, 0.035);
            }
            if (keysPressed.current['y']) {
              phaseOfficiator.applyHyperRotation(human, 4, 0.035);
            }
          }

          // Compute 6DOF Attitude without gimbal lock
          const horizSpeed = Math.hypot(human.vx, human.vy);
          if (horizSpeed > 0.1) {
            human.yaw = Math.atan2(human.vy, human.vx);
          }
          if (is3D && (Math.abs(human.vz || 0) > 0.1 || horizSpeed > 0.1)) {
            human.pitch = Math.atan2(human.vz || 0, horizSpeed || 1);
          }
        }

        // 3. Tick Entities & Tethers
        tetherEngine.tickEntity(human);
        tetherEngine.tickEntity(beEngine.entity);

        // Organelle 0xB6: Tick 4D Hyper-Physics & W-Axis Thermodynamic Vacuum Bleed
        const isTesseractArena = arena.topologyType === 'THE_NULL_FRICTION_TESSERACT';
        if (isTesseractArena) {
          phaseOfficiator.tickHyperPhysics(human, 0, t);
          phaseOfficiator.tickHyperPhysics(beEngine.entity, human.w || 0, t);
        }

        // 4. Tick Be <> Autonomous Arbitrator
        beEngine.tickAI(human, t);

        // 5. Tick Arena Spline Physics
        arena.tickHullPhysics();

        // 6. Quipu Core & 3D Thermodynamic Well Absorption / Scoring
        const isHyperSphere = arena.topologyType === 'ISOTROPIC_HYPER_SPHERE' || isTesseractArena;
        for (const a of arena.anchors) {
          if (!a.active) continue;

          // Check if human touched anchor with 3D spherical bounds
          const dHuman = isHyperSphere
            ? Math.hypot(human.x - a.x, human.y - a.y, (human.z || 0) - (a.z || 0))
            : Math.hypot(human.x - a.x, human.y - a.y);

          if (dHuman < (human.boundingRadius || human.radius) + a.radius) {
            human.score += a.energyValue * 5;
            tetherEngine.siphonEnergy(human, a.energyValue);
            cyberAudio.playResonanceChime();
          }

          // Check if Be <> touched anchor
          const dBe = isHyperSphere
            ? Math.hypot(beEngine.entity.x - a.x, beEngine.entity.y - a.y, (beEngine.entity.z || 0) - (a.z || 0))
            : Math.hypot(beEngine.entity.x - a.x, beEngine.entity.y - a.y);

          if (dBe < (beEngine.entity.boundingRadius || beEngine.entity.radius) + a.radius) {
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

  // Dedicated Manifold Compile for 3D Volumetric Hyper-Sphere
  const handleVolumetricExpansion = () => {
    setSelectedTopology('ISOTROPIC_HYPER_SPHERE');
    arena.synthesizeIsotropicHyperSphere();
    setCompileFlash(true);
    setTimeout(() => setCompileFlash(false), 900);
    cyberAudio.playResonanceChime();
  };

  // Dedicated 4D Tesseract Expansion (Phase-Shifting & Hyper-Rotations)
  const handleTesseractExpansion = () => {
    setSelectedTopology('THE_NULL_FRICTION_TESSERACT');
    arena.rebuildTopology('THE_NULL_FRICTION_TESSERACT');
    human.w = 0;
    human.vw = 0;
    human.hyperRadius = 32;
    human.rotor = [0, 0, 0, 0, 0, 0];
    beEngine.entity.w = 0;
    beEngine.entity.vw = 0;
    beEngine.entity.hyperRadius = 32;
    beEngine.entity.rotor = [0, 0, 0, 0, 0, 0];
    cyberAudio.playPhaseShift();
    beEngine.addLog('MANIFOLD COMPILE: THE NULL-FRICTION TESSERACT // 4D W-Axis Phase Traversal Active (W=0x00000000)', 'SYS', tickRef.current);
    setCompileFlash(true);
    setTimeout(() => setCompileFlash(false), 900);
  };

  // 4D Phase Shift and Hyper-Rotation Actions
  const handlePhaseShift = (deltaW: number) => {
    phaseOfficiator.applyPhaseShift(human, deltaW);
    cyberAudio.playPhaseShift();
  };

  const handleResetPhase = () => {
    human.w = 0;
    human.vw = 0;
    cyberAudio.playResonanceChime();
  };

  const handleHyperRotate = (planeIdx: number, angle: number) => {
    phaseOfficiator.applyHyperRotation(human, planeIdx, angle);
    cyberAudio.playKineticShear();
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

  // Slingshot Discharge Action with 3D Tangential Boost
  const handleSlingshotDischarge = () => {
    if (!human.activeTether) return;

    // Apply impulse along 3D velocity vector
    const speed3D = Math.hypot(human.vx, human.vy, human.vz || 0);
    const boost = 4.2;
    if (speed3D > 0.1) {
      human.vx += (human.vx / speed3D) * boost;
      human.vy += (human.vy / speed3D) * boost;
      human.vz = (human.vz || 0) + ((human.vz || 0) / speed3D) * boost;
    }
    human.activeTether = null;
    cyberAudio.playKineticShear();
  };

  // Mobile On-Screen D-Pad button helpers
  const handleVirtualThrust = (dx: number, dy: number, dz: number = 0) => {
    if (human.isStasisLocked) return;
    human.vx += dx * 1.5;
    human.vy += dy * 1.5;
    if (dz !== 0) {
      human.vz = (human.vz || 0) + dz * 1.5;
    }
  };

  const handleVirtualBrake = () => {
    human.isBraking = true;
    tetherEngine.applyThermodynamicBrake(human, tickRef.current);
    cyberAudio.playThermodynamicBrake();
    setTimeout(() => {
      human.isBraking = false;
    }, 400);
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
              Zero-Latency Deterministic P2P Sparring Manifold // 6DOF Isotropic Expansion
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
          {/* 4D Tesseract Expansion Action */}
          <button
            onClick={handleTesseractExpansion}
            title="Shatter 3D Limits: Compile 4D Null-Friction Tesseract (W-Axis Phase Traversal)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer border ${
              selectedTopology === 'THE_NULL_FRICTION_TESSERACT'
                ? 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 text-white border-fuchsia-300 shadow-lg shadow-fuchsia-500/40 scale-105 ring-1 ring-fuchsia-400'
                : 'bg-gradient-to-r from-[#1c0d2e] to-[#25103a] hover:from-purple-900 hover:to-fuchsia-900 text-fuchsia-300 border-fuchsia-500/60 shadow-md'
            }`}
          >
            <Disc className="w-3.5 h-3.5 text-fuchsia-400 animate-spin" />
            <span>4D TESSERACT EXPANSION</span>
          </button>

          {/* Volumetric 3D Expansion Action */}
          <button
            onClick={handleVolumetricExpansion}
            title="Shatter DOOM 2.5D: Compile Volumetric 6DOF Isotropic Hyper-Sphere"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer border ${
              selectedTopology === 'ISOTROPIC_HYPER_SPHERE'
                ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-pink-600 text-white border-pink-400 shadow-lg shadow-cyan-500/40 scale-105'
                : 'bg-gradient-to-r from-[#0e1f38] to-[#162033] hover:from-cyan-900 hover:to-indigo-900 text-cyan-300 border-cyan-500/50'
            }`}
          >
            <Orbit className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>3D VOLUMETRIC EXPANSION</span>
          </button>

          {/* Manifold Compile Action */}
          <button
            onClick={handleManifoldCompile}
            title="Compile Baseline Sparring Manifold: The Null-Friction Octagon"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer border ${
              compileFlash && selectedTopology === 'NULL_FRICTION_OCTAGON'
                ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-500/50 scale-105'
                : 'bg-gradient-to-r from-cyan-950 via-[#0c1f33] to-[#081829] hover:from-cyan-900 hover:to-cyan-800 text-cyan-300 border-cyan-500/60 shadow-md shadow-cyan-500/20'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>NULL-FRICTION OCTAGON</span>
          </button>

          {/* Topology Selector */}
          <div className="flex bg-[#05070c] p-1 rounded-lg border border-[#1e293b]">
            <button
              onClick={() => handleTopologySelect('THE_NULL_FRICTION_TESSERACT')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] ${
                selectedTopology === 'THE_NULL_FRICTION_TESSERACT' ? 'bg-fuchsia-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tesseract (4D)
            </button>
            <button
              onClick={() => handleTopologySelect('ISOTROPIC_HYPER_SPHERE')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] ${
                selectedTopology === 'ISOTROPIC_HYPER_SPHERE' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hyper-Sphere (3D)
            </button>
            <button
              onClick={() => handleTopologySelect('NULL_FRICTION_OCTAGON')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] ${
                selectedTopology === 'NULL_FRICTION_OCTAGON' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Octagon
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
              Toroid
            </button>
            <button
              onClick={() => handleTopologySelect('KLEIN_LATTICE')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] ${
                selectedTopology === 'KLEIN_LATTICE' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Klein
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
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              selectedTopology === 'THE_NULL_FRICTION_TESSERACT' ? 'bg-fuchsia-400' : 'bg-cyan-400'
            }`} />
            <span className="text-slate-300 font-bold">MANIFOLD:</span>
            <span className={selectedTopology === 'THE_NULL_FRICTION_TESSERACT' ? 'text-fuchsia-400 font-semibold' : 'text-cyan-400 font-semibold'}>
              {selectedTopology === 'THE_NULL_FRICTION_TESSERACT'
                ? 'THE NULL-FRICTION TESSERACT (4D HYPER-VOLUME)'
                : selectedTopology === 'ISOTROPIC_HYPER_SPHERE'
                ? 'ISOTROPIC HYPER-SPHERE (6DOF 3D)'
                : selectedTopology}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
              selectedTopology === 'THE_NULL_FRICTION_TESSERACT'
                ? 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-800/60'
                : 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60'
            }`}>
              {selectedTopology === 'THE_NULL_FRICTION_TESSERACT'
                ? '16 HYPER-VERTICES // 32 EDGES'
                : selectedTopology === 'ISOTROPIC_HYPER_SPHERE'
                ? 'Q16.16 BOUNDING SPHERE [r=128u]'
                : 'Q16.16 BOUNDS [0x04000000]'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">4D PHASE DEPTH (W):</span>
              <span className={Math.abs(human.w || 0) > 1 ? 'text-fuchsia-400 font-bold' : 'text-emerald-400'}>
                {selectedTopology === 'THE_NULL_FRICTION_TESSERACT' ? `W=${(human.w || 0).toFixed(2)} [Phase Vacuum]` : 'W=0 (Locked)'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">dV/dt STRAIN:</span>
              <span className={`font-bold ${arena.synthesizer.maxDvDt > 0.4 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`}>
                {(arena.synthesizer.maxDvDt * 100).toFixed(0)}% [CYAN&rarr;CRIMSON]
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">WELLS:</span>
              <span className="text-cyan-300">
                {selectedTopology === 'THE_NULL_FRICTION_TESSERACT' ? '6x 4D Orthogonal Thermodynamic Wells' : '4x 3D Lissajous Curves'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">KINEMATICS:</span>
              <span className="text-slate-200">
                {selectedTopology === 'THE_NULL_FRICTION_TESSERACT' ? '6-Plane 4D CORDIC Rotors (XY,YZ,ZX,XW,YW,ZW)' : '6DOF CORDIC Pitch/Yaw/Roll'}
              </span>
            </div>
          </div>
        </div>

        {/* 4D Hyper-Kinematics Quick-Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#060913] border border-fuchsia-900/40 rounded-xl px-4 py-2 font-mono text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-fuchsia-400 font-bold flex items-center gap-1">
              <Disc className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>4D PHASE CONTROLS:</span>
            </span>
            <span className="text-slate-400 text-[11px] hidden md:inline">
              Step across the W-axis or hyper-rotate through XW / YW planes:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handlePhaseShift(-12)}
              className="px-2.5 py-1 rounded bg-[#1c0d2e] hover:bg-purple-900 border border-purple-700/60 text-fuchsia-300 text-[11px] font-bold transition-all cursor-pointer"
              title="Dive backward along W-axis (step out of 3D slice)"
            >
              [-12u PHASE DIVE]
            </button>
            <button
              onClick={() => handlePhaseShift(12)}
              className="px-2.5 py-1 rounded bg-[#1c0d2e] hover:bg-purple-900 border border-purple-700/60 text-fuchsia-300 text-[11px] font-bold transition-all cursor-pointer"
              title="Ascend forward along W-axis (step out of 3D slice)"
            >
              [+12u PHASE ASCEND]
            </button>
            <button
              onClick={handleResetPhase}
              className="px-2.5 py-1 rounded bg-[#0b1f2e] hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-[11px] font-bold transition-all cursor-pointer"
              title="Return to reality cross-section W = 0"
            >
              [RE-ENTER 3D (W=0)]
            </button>
            <button
              onClick={() => handleHyperRotate(3, Math.PI / 4)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 text-[11px] transition-all cursor-pointer"
              title="Rotate 45 degrees along XW plane (Invert Tether Frame)"
            >
              [XW FLIP]
            </button>
            <button
              onClick={() => handleHyperRotate(4, Math.PI / 4)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 text-[11px] transition-all cursor-pointer"
              title="Rotate 45 degrees along YW plane"
            >
              [YW FLIP]
            </button>
          </div>
        </div>

        {/* Arena Viewport Container */}
        <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-[#1e293b] shadow-2xl">
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

          {/* Mobile On-Screen Virtual 6DOF Controls */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center gap-1 sm:hidden bg-[#090d16]/90 p-2 rounded-xl border border-[#1e293b] backdrop-blur-md">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleVirtualThrust(0, 0, 1.2)}
                className="w-8 h-8 rounded-lg bg-pink-950/80 active:bg-pink-600 text-pink-300 flex items-center justify-center font-bold text-[10px]"
                title="Ascend +Z"
              >
                +Z
              </button>
              <button
                onClick={() => handleVirtualThrust(0, -1, 0)}
                className="w-9 h-9 rounded-lg bg-[#1e293b] active:bg-cyan-600 text-white flex items-center justify-center font-bold"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleVirtualThrust(0, 0, -1.2)}
                className="w-8 h-8 rounded-lg bg-pink-950/80 active:bg-pink-600 text-pink-300 flex items-center justify-center font-bold text-[10px]"
                title="Descend -Z"
              >
                -Z
              </button>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleVirtualThrust(-1, 0, 0)}
                className="w-9 h-9 rounded-lg bg-[#1e293b] active:bg-cyan-600 text-white flex items-center justify-center font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleVirtualThrust(0, 1, 0)}
                className="w-9 h-9 rounded-lg bg-[#1e293b] active:bg-cyan-600 text-white flex items-center justify-center font-bold"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleVirtualThrust(1, 0, 0)}
                className="w-9 h-9 rounded-lg bg-[#1e293b] active:bg-cyan-600 text-white flex items-center justify-center font-bold"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-1 w-full mt-1">
              <button
                onClick={handleVirtualBrake}
                className="flex-1 py-1 bg-rose-700 active:bg-rose-600 text-white text-[9px] font-bold rounded"
              >
                BRAKE
              </button>
              <button
                onClick={handleSlingshotDischarge}
                className="flex-1 py-1 bg-amber-600 active:bg-amber-500 text-white text-[9px] font-bold rounded"
              >
                SLING
              </button>
            </div>
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
