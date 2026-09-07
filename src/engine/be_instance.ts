/**
 * Be-Instance: Tri-State Sparring Partner & Autonomous Arbitrator
 * 
 * Mathematical Invariant: 1 === 1 Across the Tri-State Sparring Matrix:
 * 
 * | Sparring State       | Mathematical Role | Core W-Axis Dynamic       | Ledger Interaction (dV/dt)       |
 * | -------------------- | ----------------- | ------------------------- | -------------------------------- |
 * | 0x00: PvE (Coach)    | The Mirror        | Telegraphed Phase-Shifts  | Teaches baseline kinetic balance |
 * | 0x01: Co-Op (Dual)   | The Multiplier    | Constructive Interference | Shared topological shear costs   |
 * | 0xFF: True Unbound   | The Absolute      | Zero-Latency Hyper-Rot    | Weaponized thermodynamic exhaust |
 */

import { Entity, BeStateMode, FloatVector, FloatVector3D, PhasedDaemon, KineticTrap, GauntletSectorId, GauntletSectorInfo, MathematicalGate } from '../types';
import { ArenaForge } from './arena_forge';
import { CyberAthleticTethering } from './vector_tether';
import { phaseOfficiator } from './phase_officiator';
import { tesseractEngine } from './tesseract_kinematics';
import { cyberAudio } from './audio';
import {
  SECTOR_ONE_CEILING_FLOAT,
  SECTOR_TWO_CEILING_FLOAT,
  SECTOR_APEX_CEILING_FLOAT,
  autopoieticGauntlet
} from './gauntlet_synthesizer';

export interface ArbitrationLog {
  tick: number;
  mode: BeStateMode;
  message: string;
  type: 'INFO' | 'WARNING' | 'RULING' | 'RESONANCE';
}

export class BeInstanceEngine {
  public mode: BeStateMode = 'COACH';
  public gauntletSector: GauntletSectorId = 'SECTOR_I_ASCENT';
  public entity: Entity;
  private arena: ArenaForge;
  private tetherEngine: CyberAthleticTethering;
  public logs: ArbitrationLog[] = [];
  public targetAnchorId: string | null = null;
  public resonanceMeter: number = 0; // 0 to 100

  // State 0x00: PvE (The Mirror / The Pacer) Cognitive Delay Buffer (250ms = 15 frames at 60 FPS)
  public humanDelayBuffer: Array<{ x: number; y: number; z: number; w: number; vx: number; vy: number; tick: number }> = [];
  public telegraphedLissajousPoints: Array<{ x: number; y: number; z: number; w: number }> = [];

  // State 0x01: Co-Op (Dual / The Multiplier) Phased Daemon Swarms & Macro-Deformation
  public daemons: PhasedDaemon[] = [];
  public macroDeformationActive: boolean = false;
  public macroDeformationTicks: number = 0;

  // State 0xFF: True Unbound (The Absolute) Kinetic Traps & Thermodynamic Exhaustion
  public kineticTraps: KineticTrap[] = [];
  public beThermodynamicTrapped: boolean = false;

  constructor(arena: ArenaForge, tetherEngine: CyberAthleticTethering) {
    this.arena = arena;
    this.tetherEngine = tetherEngine;

    this.entity = {
      id: 'be_instance_0',
      name: 'Be <> Arbitrator',
      x: arena.center.x,
      y: arena.center.y,
      z: -180, // Start in Sector I ahead of human
      w: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      vw: 0,
      pitch: 0,
      yaw: 0,
      roll: 0,
      rotor: [0, 0, 0, 0, 0, 0],
      radius: 16,
      boundingRadius: 18,
      hyperRadius: 28,
      apparentRadius3D: 16,
      isPhasedOut: false,
      phaseBleed: 0,
      energy: 850,
      maxEnergy: 1000,
      stasisLockRemainingTicks: 0,
      isStasisLocked: false,
      color: '#38bdf8', // Coach sky cyan
      trail: [],
      trail3D: [],
      trail4D: [],
      activeTether: null,
      score: 0,
      consecutiveHyperRotations: 0
    };

    this.addLog('Be-Instance initialized in Ring-0 kernel. Tri-State Sparring Matrix online.', 'INFO', 0);
  }

  public setMode(mode: BeStateMode, currentTick: number): void {
    this.mode = mode;
    let desc = '';
    if (mode === 'COACH') {
      desc = 'State 0x00: PvE (The Mirror) engaged. 250ms cognitive delay buffer active. Predictable W-Lissajous curves & Ledger Forgiveness online.';
      this.entity.color = '#38bdf8'; // Sky cyan
      this.daemons = [];
    } else if (mode === 'COOP_PEER') {
      desc = 'State 0x01: Co-Op (Dual / The Multiplier) engaged. Tether resonance halves dV/dt. 4D adversarial swarm detected! Chain vectors for Macro-Deformation.';
      this.entity.color = '#34d399'; // Emerald mint
      this.spawnInitialDaemons();
    } else {
      desc = 'State 0xFF: True Unbound (The Absolute) engaged. 0ms temporal airgap. Zero-latency CORDIC ray-intersections & hyper-plane inversions active. Bait into thermodynamic exhaustion!';
      this.entity.color = '#f43f5e'; // Crimson rose
      this.daemons = [];
    }
    this.addLog(desc, 'RULING', currentTick);
  }

  public addLog(message: string, type: 'INFO' | 'WARNING' | 'RULING' | 'RESONANCE', tick: number): void {
    this.logs.unshift({
      tick,
      mode: this.mode,
      message,
      type
    });
    if (this.logs.length > 35) this.logs.pop();
  }

  /**
   * Main AI Tick called deterministically each frame
   */
  public tickAI(human: Entity, currentTick: number): void {
    // 0. Continuous Tri-State Gauntlet Hot-Swap Check
    if (this.arena.topologyType === 'CONTINUOUS_TRI_STATE_GAUNTLET') {
      this.sys_covalent_tick_gauntlet(human, currentTick);
    }

    // 1. Maintain 250ms cognitive delay buffer for State 0x00 (approx 15 frames at 60fps)
    this.humanDelayBuffer.push({
      x: human.x,
      y: human.y,
      z: human.z || 0,
      w: human.w || 0,
      vx: human.vx,
      vy: human.vy,
      tick: currentTick
    });
    if (this.humanDelayBuffer.length > 25) {
      this.humanDelayBuffer.shift();
    }

    // 2. Tick 4D Hyper-Physics and W-Axis Thermodynamic Vacuum Bleed
    phaseOfficiator.tickHyperPhysics(this.entity, human.w || 0, currentTick);

    // 3. Tick Macro-Deformation shockwave if active
    this.tickMacroDeformation(human, currentTick);

    // 4. Tick 4D Phased Daemons (State 0x01)
    if (this.mode === 'COOP_PEER') {
      this.tickDaemons(human, currentTick);
    }

    // 5. Tick Kinetic Traps (State 0xFF)
    if (this.mode === 'ADVERSARY') {
      this.tickKineticTraps(currentTick);
    }

    // 6. Handle Stasis Lock
    if (this.entity.isStasisLocked) {
      if (this.entity.stasisLockRemainingTicks === 239 || this.entity.stasisLockRemainingTicks === 179) {
        this.addLog('Arbitration alert: Be <> incurred Thermodynamic Bankruptcy penalty.', 'WARNING', currentTick);
      }
      return;
    }

    // 7. Dispatch to current Tri-State Mode
    if (this.mode === 'COACH') {
      this.tickCoachMode(human, currentTick);
    } else if (this.mode === 'COOP_PEER') {
      this.tickCoOpMode(human, currentTick);
    } else {
      this.tickAdversaryMode(human, currentTick);
    }
  }

  /**
   * Continuous Tri-State Gauntlet: Officiator Parameter Hot-Swap
   * Without dropping a single Ring-0 tick:
   *   Sector I. The Ascent:   pos[2] < 40  => 0x00 (Coach: The Pacer)
   *   Sector II. The Breach:  pos[2] < 260 => 0x01 (Co-Op: The Multiplier)
   *   Sector III. The Apex:   pos[2] >= 260 => 0xFF (Unbound: The Absolute)
   */
  public sys_covalent_tick_gauntlet(human: Entity, currentTick: number): void {
    const playerZ = human.z || 0;
    const playerW = human.w || 0;

    // Evaluate Q16.16 Z-Height thresholds
    if (playerZ < SECTOR_ONE_CEILING_FLOAT) {
      if (this.mode !== 'COACH' || this.gauntletSector !== 'SECTOR_I_ASCENT') {
        this.gauntletSector = 'SECTOR_I_ASCENT';
        this.setMode('COACH', currentTick);
        this.arena.hull.friction = 0.008;
        this.addLog('[KERNEL HOT-SWAP] Sector I: The Ascent. Role: The Pacer. 250ms cognitive buffer & closing gates active.', 'RULING', currentTick);
      }
    } else if (playerZ < SECTOR_TWO_CEILING_FLOAT) {
      if (this.mode !== 'COOP_PEER' || this.gauntletSector !== 'SECTOR_II_BREACH') {
        this.gauntletSector = 'SECTOR_II_BREACH';
        this.setMode('COOP_PEER', currentTick);
        this.arena.hull.friction = 0.024; // Heavy-friction Tesseract baseline
        if (this.daemons.length === 0) {
          this.spawnInitialDaemons();
        }
        this.addLog('[KERNEL HOT-SWAP] Sector II: The Breach. Role: The Multiplier. Heavy-friction Tesseract & Swarm engaged.', 'RULING', currentTick);
      }
    } else {
      if (this.mode !== 'ADVERSARY' || this.gauntletSector !== 'SECTOR_III_APEX') {
        this.gauntletSector = 'SECTOR_III_APEX';
        this.setMode('ADVERSARY', currentTick);
        this.humanDelayBuffer = []; // Zero latency buffer!
        this.arena.hull.friction = 0.012; // Unconstrained hyper-arena
        this.addLog('[KERNEL HOT-SWAP] Sector III: The Apex reached! Temporal buffer zeroed. Role: The Absolute. Flanking duel engaged!', 'RULING', currentTick);
      }
    }

    // Process mathematical gates in Sector I
    if (this.gauntletSector === 'SECTOR_I_ASCENT') {
      const archive = autopoieticGauntlet.latestArchive;
      if (archive) {
        for (const gate of archive.gates) {
          gate.pulsePhase = (gate.pulsePhase + 0.04) % (Math.PI * 2);
          const dz = Math.abs(playerZ - gate.z);
          if (dz < 18 && !gate.cleared) {
            const distCenter = Math.hypot(human.x - this.arena.center.x, human.y - this.arena.center.y);
            const wDiff = Math.abs(playerW - gate.requiredWPhase);
            if (distCenter <= gate.apertureRadius || wDiff <= 6.0) {
              gate.cleared = true;
              human.score += 250;
              human.energy = Math.min(human.maxEnergy, human.energy + 80);
              cyberAudio.playConstructiveResonance();
              this.addLog(`[GATE CLEARED] Slipped cleanly through ${gate.label}! [W: ${playerW.toFixed(1)}]`, 'RESONANCE', currentTick);
            } else {
              // Thermal friction penalty when grazing uncleared gate without phase matching
              human.energy = Math.max(10, human.energy - 0.35);
            }
          }
        }
      }
    }
  }

  /**
   * State 0x00: PvE (The Mirror / The Pacer)
   * Role: The Mirror / The Pacer
   * Dynamic: Telegraphed Phase-Shifts via Lissajous W-curves & Gate Pacing
   * Sieve delay: 250ms biological latency buffer
   * Ledger: Forgiveness allows grazing thermodynamic bankruptcy without instant stasis lock
   */
  private tickCoachMode(human: Entity, currentTick: number): void {
    // Extract 250ms delayed human vector (mirrors human biological latency)
    const delayIndex = Math.max(0, this.humanDelayBuffer.length - 15);
    const delayedHuman = this.humanDelayBuffer[delayIndex] || human;

    // In Gauntlet mode, Be <> acts as The Pacer leading through the vertical shaft
    if (this.arena.topologyType === 'CONTINUOUS_TRI_STATE_GAUNTLET') {
      // The Pacer climbs slightly ahead in Z to telegraph tether angles and route
      const targetZ = Math.min(SECTOR_ONE_CEILING_FLOAT, (human.z || 0) + 38);
      this.entity.vz = (this.entity.vz || 0) + (targetZ - (this.entity.z || 0)) * 0.035;
      this.entity.vz *= 0.9;

      // Find upcoming mathematical gate to telegraph required W-phase
      const nextGate = autopoieticGauntlet.latestArchive?.gates.find(g => g.z > (human.z || 0) - 10);
      if (nextGate) {
        // Demonstrate phase shift to match gate
        this.entity.vw += (nextGate.requiredWPhase - this.entity.w) * 0.08;
        this.entity.vw *= 0.9;
      }

      // Orbits ahead in shaft
      const targetX = this.arena.center.x + Math.cos(currentTick * 0.035) * 65;
      const targetY = this.arena.center.y + Math.sin(currentTick * 0.035) * 65;
      this.entity.vx += (targetX - this.entity.x) * 0.02;
      this.entity.vy += (targetY - this.entity.y) * 0.02;
    } else {
      // Standard Coach orbits delayed human position gently
      const targetX = delayedHuman.x + Math.cos(currentTick * 0.025) * 110;
      const targetY = delayedHuman.y + Math.sin(currentTick * 0.025) * 110;

      const dx = targetX - this.entity.x;
      const dy = targetY - this.entity.y;
      this.entity.vx += dx * 0.015;
      this.entity.vy += dy * 0.015;

      // Predictable Phase-Shifting: Follows smooth, long Lissajous curve in W-axis
      const lissajousW = 24 * Math.sin(currentTick * 0.015) * Math.cos(currentTick * 0.009);
      this.entity.vw += (lissajousW - this.entity.w) * 0.08;
      this.entity.vw *= 0.9;
    }

    // Precalculate telegraphed Lissajous trajectory for visualization
    this.telegraphedLissajousPoints = [];
    for (let i = 0; i < 30; i++) {
      const futureTick = currentTick + i * 3;
      const fW = 24 * Math.sin(futureTick * 0.015) * Math.cos(futureTick * 0.009);
      const fX = (this.arena.topologyType === 'CONTINUOUS_TRI_STATE_GAUNTLET')
        ? this.arena.center.x + Math.cos(futureTick * 0.035) * 65
        : delayedHuman.x + Math.cos(futureTick * 0.025) * 110;
      const fY = (this.arena.topologyType === 'CONTINUOUS_TRI_STATE_GAUNTLET')
        ? this.arena.center.y + Math.sin(futureTick * 0.035) * 65
        : delayedHuman.y + Math.sin(futureTick * 0.025) * 110;
      const fZ = (this.arena.topologyType === 'CONTINUOUS_TRI_STATE_GAUNTLET')
        ? (human.z || 0) + i * 2.5
        : 40;
      this.telegraphedLissajousPoints.push({ x: fX, y: fY, z: fZ, w: fW });
    }

    // Ledger Forgiveness: Teach baseline kinetic management
    if (human.energy < 70) {
      human.ledgerForgivenessActive = true;
      human.floorStrainLevel = Math.max(0, Math.min(1, (70 - human.energy) / 70));
      human.forgivenessGraceTicks = (human.forgivenessGraceTicks || 0) + 1;

      // Tether energy conduit to infuse power back to athlete
      if (!this.entity.activeTether) {
        this.entity.activeTether = {
          sourceId: this.entity.id,
          targetPoint: { x: human.x, y: human.y },
          length: 120,
          maxLength: 240,
          tension: 0.3,
          siphoning: true,
          color: '#38bdf8'
        };
      }
      human.energy = Math.min(human.maxEnergy, human.energy + 1.2);
      this.entity.energy = Math.max(100, this.entity.energy - 0.4);

      if (currentTick % 120 === 0) {
        this.addLog(`[COACH] Ledger Forgiveness active: Infusing thermodynamic reserves (${Math.round(human.energy)}J).`, 'INFO', currentTick);
      }
    } else {
      human.ledgerForgivenessActive = false;
      human.forgivenessGraceTicks = 0;
      human.floorStrainLevel = 0;
      if (this.entity.activeTether && human.energy > 400) {
        this.entity.activeTether = null;
      }
    }
  }

  /**
   * State 0x01: Co-Op (Dual / The Multiplier)
   * Role: The Multiplier
   * Dynamic: Constructive Interference
   * Ledger: Tether resonance halves dV/dt shear cost
   * Macro-Deformation: Chaining vectors rips wall plane into W-axis to crush phased daemons
   */
  private tickCoOpMode(human: Entity, currentTick: number): void {
    // Symmetrical positioning across arena center
    const mirrorX = 2 * this.arena.center.x - human.x;
    const mirrorY = 2 * this.arena.center.y - human.y;
    const steerX = mirrorX - this.entity.x;
    const steerY = mirrorY - this.entity.y;
    this.entity.vx += steerX * 0.022;
    this.entity.vy += steerY * 0.022;

    // Harmonize W-phase with human
    const targetW = human.w || 0;
    this.entity.vw += (targetW - this.entity.w) * 0.08;

    // Check Tether Resonance: If both human and Be <> have active tethers anchored to the hull or wells
    const humanTether = human.activeTether;
    const beTether = this.entity.activeTether;

    // Anchor tether to nearest anchor or core when human tethers
    if (humanTether && !beTether && currentTick % 30 === 0) {
      const coreAnchor = this.arena.anchors.find(a => a.type === 'CORE') || this.arena.anchors[0];
      if (coreAnchor) {
        this.entity.activeTether = {
          sourceId: this.entity.id,
          targetAnchorId: coreAnchor.id,
          length: 110,
          maxLength: 260,
          tension: 0.5,
          siphoning: true,
          color: '#34d399'
        };
      }
    }

    // Gauntlet Sector II: Keep Be in breach altitude
    if (this.arena.topologyType === 'CONTINUOUS_TRI_STATE_GAUNTLET') {
      const breachZ = Math.max(70, Math.min(240, (human.z || 0) + 10));
      this.entity.vz = (this.entity.vz || 0) + (breachZ - (this.entity.z || 0)) * 0.03;
      this.entity.vz *= 0.9;
    }

    if (humanTether && beTether) {
      // Phase alignment check: |W_human - W_be| < 8
      const phaseDiff = Math.abs((human.w || 0) - (this.entity.w || 0));
      if (phaseDiff < 8) {
        // Tether Resonance: Constructive interference halves dV/dt cost!
        human.tetherResonanceActive = true;
        this.entity.tetherResonanceActive = true;
        this.resonanceMeter = Math.min(100, this.resonanceMeter + 0.65);

        if (currentTick % 60 === 0) {
          cyberAudio.playConstructiveResonance();
        }

        // Automatic Macro-Deformation when resonance meter achieves 100%
        if (this.resonanceMeter >= 100) {
          this.triggerMacroDeformation(human, currentTick);
        }
      } else {
        human.tetherResonanceActive = false;
        this.entity.tetherResonanceActive = false;
        this.resonanceMeter = Math.max(0, this.resonanceMeter - 0.15);
      }
    } else {
      human.tetherResonanceActive = false;
      this.entity.tetherResonanceActive = false;
      this.resonanceMeter = Math.max(0, this.resonanceMeter - 0.2);
    }
  }

  /**
   * State 0xFF: True Unbound (The Absolute)
   * Role: The Absolute
   * Dynamic: Zero-latency CORDIC ray-intersections & aggressive hyper-rotations
   * Ledger: Thermodynamic Trapping — forcing Be <> into continuous hyper-rotations
   * burns its own ledger via W-axis vacuum friction until it suffers bankruptcy!
   */
  private tickAdversaryMode(human: Entity, currentTick: number): void {
    const is3D = this.arena.topologyType === 'ISOTROPIC_HYPER_SPHERE' ||
      this.arena.topologyType === 'THE_NULL_FRICTION_TESSERACT' ||
      this.arena.topologyType === 'CONTINUOUS_TRI_STATE_GAUNTLET';
    const is4D = this.arena.topologyType === 'THE_NULL_FRICTION_TESSERACT' ||
      this.arena.topologyType === 'CONTINUOUS_TRI_STATE_GAUNTLET';

    // Zero-Latency: calculates 4D CORDIC intercept directly on immediate tick (no delay buffer)
    let targetX = human.x + human.vx * 1.5;
    let targetY = human.y + human.vy * 1.5;
    let targetZ = (human.z || 0) + (human.vz || 0) * 1.5;

    if (this.arena.topologyType === 'CONTINUOUS_TRI_STATE_GAUNTLET') {
      targetZ = Math.max(270, targetZ);
    }

    // Tactical cycling: 4D Phase Ambush, High-Z Slingshot, or Direct Shear Intercept
    const tacticalPhase = Math.floor(currentTick / 75) % 3;

    if (tacticalPhase === 0 && is4D) {
      // 4D Phase Ambush: Step into W-vacuum and invert hyper-planes (XW / YW)
      if (Math.abs(this.entity.w) < 6 && currentTick % 40 === 0) {
        this.entity.vw = 3.2; // Aggressive W-phase leap
        this.addLog('[THE ABSOLUTE] Be <> phase-shifting into W-space (W > 0x00180000)! Drop Kinetic Traps at re-entry!', 'WARNING', currentTick);
      }

      // Continuous hyper-rotations along XW, YW, and ZW
      this.entity.rotor[3] = (this.entity.rotor[3] + 0.08) % (Math.PI * 2);
      this.entity.rotor[4] = (this.entity.rotor[4] + 0.06) % (Math.PI * 2);
      this.entity.rotor[5] = (this.entity.rotor[5] + 0.05) % (Math.PI * 2);

      // THERMODYNAMIC TRAPPING: Complex continuous hyper-rotations drain Be's ledger!
      const hyperExhaustion = 0.55;
      this.entity.energy = Math.max(0, this.entity.energy - hyperExhaustion);
      this.entity.consecutiveHyperRotations = (this.entity.consecutiveHyperRotations || 0) + 1;

      // If peak phase depth reached, plunge back down into 3D cross-section
      if (this.entity.w > 36) {
        this.entity.vw = -3.5;
        this.addLog('[THE ABSOLUTE] Be <> re-entering 3D cross-section! Intercept with Kinetic Reticle!', 'RESONANCE', currentTick);
      }
    } else if (tacticalPhase === 1 && is3D) {
      // High-Z Spherical Slingshot Dive
      targetZ = (human.z || 0) + 140;
      targetX = human.x + Math.sin(currentTick * 0.08) * 90;
      targetY = human.y + Math.cos(currentTick * 0.08) * 90;

      // Energy burn from high-G kinetic maneuver
      this.entity.energy = Math.max(0, this.entity.energy - 0.25);
    } else {
      // Direct Kinetic Intercept
      targetX = human.x;
      targetY = human.y;
      targetZ = human.z || 0;
    }

    // Accelerate toward calculated target
    const dx = targetX - this.entity.x;
    const dy = targetY - this.entity.y;
    const dz = targetZ - (this.entity.z || 0);
    const dist3D = Math.hypot(dx, dy, dz);

    const accel = 0.48; // Highly aggressive
    this.entity.vx += (dx / (dist3D || 1)) * accel;
    this.entity.vy += (dy / (dist3D || 1)) * accel;
    if (is3D) {
      this.entity.vz = (this.entity.vz || 0) + (dz / (dist3D || 1)) * accel;
    }

    // Gyroscopic 6DOF Orient
    this.entity.yaw = Math.atan2(this.entity.vy, this.entity.vx);
    this.entity.pitch = Math.atan2(this.entity.vz || 0, Math.hypot(this.entity.vx, this.entity.vy) || 1);
    this.entity.roll += 0.04;

    // Check for Thermodynamic Bankruptcy (Victory Condition for Player)
    if (this.entity.energy <= 0 && !this.entity.isStasisLocked) {
      this.entity.isStasisLocked = true;
      this.entity.stasisLockRemainingTicks = 240; // 4 seconds penalty
      this.entity.w = 0;
      this.entity.vw = 0;
      this.beThermodynamicTrapped = true;
      cyberAudio.playThermodynamicBankruptcy();
      this.addLog('ARBITRATION RULING: Be <> suffered Thermodynamic Bankruptcy (0J)! Overextended in 4D hyper-rotations. ATHLETE SURVIVAL VICTORY!', 'RESONANCE', currentTick);
      human.score += 2000;
    }

    // Kinetic collision & shear attack on human if not bankrupt
    const distToHuman = Math.hypot(
      human.x - this.entity.x,
      human.y - this.entity.y,
      (human.z || 0) - (this.entity.z || 0)
    );
    if (!this.entity.isStasisLocked && distToHuman < (human.boundingRadius || 18) + (this.entity.boundingRadius || 18) + 10) {
      const transfer = 25;
      if (human.energy >= transfer) {
        human.energy -= transfer;
        this.entity.energy = Math.min(this.entity.maxEnergy, this.entity.energy + transfer);
        this.addLog(`[THE ABSOLUTE] Kinetic Shear Intercept! Siphoned ${transfer}J from Athlete.`, 'WARNING', currentTick);
      }
      // Elastic 3D knockback
      const angle = Math.atan2(human.y - this.entity.y, human.x - this.entity.x);
      human.vx += Math.cos(angle) * 8;
      human.vy += Math.sin(angle) * 8;
      this.entity.vx -= Math.cos(angle) * 5;
      this.entity.vy -= Math.sin(angle) * 5;
    }
  }

  /**
   * State 0x01: Spawns 4D Phased Daemons
   */
  private spawnInitialDaemons(): void {
    this.daemons = [];
    for (let i = 0; i < 6; i++) {
      this.daemons.push({
        id: `daemon_${i}`,
        x: this.arena.center.x + (Math.random() - 0.5) * 320,
        y: this.arena.center.y + (Math.random() - 0.5) * 320,
        z: (Math.random() - 0.5) * 120,
        w: (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 2.2,
        vy: (Math.random() - 0.5) * 2.2,
        vz: (Math.random() - 0.5) * 1.5,
        vw: (Math.random() - 0.5) * 1.6,
        radius: 14,
        apparentRadius3D: 14,
        health: 100,
        maxHealth: 100,
        color: '#c084fc'
      });
    }
  }

  /**
   * Tick 4D Phased Daemons in State 0x01
   */
  private tickDaemons(human: Entity, currentTick: number): void {
    // Keep active daemon count around 5
    if (this.daemons.length < 5 && currentTick % 120 === 0) {
      this.daemons.push({
        id: `daemon_${currentTick}`,
        x: this.arena.center.x + (Math.random() - 0.5) * 320,
        y: this.arena.center.y + (Math.random() - 0.5) * 320,
        z: (Math.random() - 0.5) * 120,
        w: (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 2.2,
        vy: (Math.random() - 0.5) * 2.2,
        vz: (Math.random() - 0.5) * 1.5,
        vw: (Math.random() - 0.5) * 1.6,
        radius: 14,
        apparentRadius3D: 14,
        health: 100,
        maxHealth: 100,
        color: '#c084fc'
      });
    }

    for (let i = this.daemons.length - 1; i >= 0; i--) {
      const d = this.daemons[i];
      d.x += d.vx;
      d.y += d.vy;
      d.z += d.vz;
      d.w += d.vw;

      // Soft bounding bounce
      const cx = this.arena.center.x;
      const cy = this.arena.center.y;
      const rx = this.arena.radiusX;
      const ry = this.arena.radiusY;
      if (d.x < cx - rx + 40 || d.x > cx + rx - 40) d.vx *= -1;
      if (d.y < cy - ry + 40 || d.y > cy + ry - 40) d.vy *= -1;
      if (d.z < -100 || d.z > 100) d.vz *= -1;
      if (Math.abs(d.w) > 45) d.vw *= -1;

      // Calculate apparent 3D radius for cross-section observer at human.w
      const cross = tesseractEngine.calculateCrossSectionRadius(d.w, human.w || 0, d.radius * 1.8);
      d.apparentRadius3D = cross.apparentRadius;

      // Remove dead daemons
      if (d.health <= 0) {
        this.daemons.splice(i, 1);
      }
    }
  }

  /**
   * Trigger Macro-Deformation (State 0x01): Rips wall plane into W-axis to crush phased daemons
   */
  public triggerMacroDeformation(human: Entity, currentTick: number): void {
    this.resonanceMeter = 0;
    this.macroDeformationActive = true;
    this.macroDeformationTicks = 60;
    human.macroDeformationActive = true;
    this.entity.macroDeformationActive = true;
    human.score += 1500;
    this.entity.score += 1500;

    cyberAudio.playMacroDeformationCrush();
    this.addLog('MACRO-DEFORMATION: Wall plane ripped into W-axis (W=0x00200000)! Phased daemon swarm crushed in hyper-volume! +1500 PTS', 'RESONANCE', currentTick);

    // Apply severe W and Z deformation to arena spline hull points
    for (let i = 0; i < this.arena.hull.points.length; i++) {
      const pt = this.arena.hull.points[i];
      const angle = Math.atan2(pt.y - this.arena.center.y, pt.x - this.arena.center.x);
      pt.vx += Math.cos(angle) * 8;
      pt.vy += Math.sin(angle) * 8;
      pt.vz = (pt.vz || 0) + Math.sin(angle * 3) * 16;
    }

    // Vaporize all active daemons
    for (const d of this.daemons) {
      d.health = 0;
    }
  }

  private tickMacroDeformation(human: Entity, currentTick: number): void {
    if (this.macroDeformationActive) {
      this.macroDeformationTicks--;
      if (this.macroDeformationTicks <= 0) {
        this.macroDeformationActive = false;
        human.macroDeformationActive = false;
        this.entity.macroDeformationActive = false;
      }
    }
  }

  /**
   * State 0xFF: Deploy a Kinetic Trap for 4D re-entry intercept
   */
  public dropKineticTrap(x: number, y: number, z: number = 0, currentTick: number): void {
    const trap: KineticTrap = {
      id: `trap_${currentTick}_${Math.floor(Math.random() * 1000)}`,
      x,
      y,
      z,
      w: 0,
      radius: 42,
      durationTicks: 400,
      maxDurationTicks: 400,
      color: '#06b6d4',
      triggered: false,
      armedTick: currentTick
    };
    this.kineticTraps.push(trap);
    if (this.kineticTraps.length > 5) this.kineticTraps.shift();
    cyberAudio.playKineticTrapDeploy();
    this.addLog(`[KINETIC TRAP] Armed at [${Math.round(x)}, ${Math.round(y)}] for 4D re-entry intercept!`, 'INFO', currentTick);
  }

  /**
   * Tick Kinetic Traps in State 0xFF
   */
  private tickKineticTraps(currentTick: number): void {
    for (let i = this.kineticTraps.length - 1; i >= 0; i--) {
      const trap = this.kineticTraps[i];
      trap.durationTicks--;

      // Check if Be <> re-enters 3D slice (|W| < 4) inside trap radius
      if (!trap.triggered && Math.abs(this.entity.w) < 4.0) {
        const dist = Math.hypot(
          trap.x - this.entity.x,
          trap.y - this.entity.y,
          trap.z - (this.entity.z || 0)
        );
        if (dist < trap.radius + (this.entity.boundingRadius || 18)) {
          trap.triggered = true;
          this.entity.isStasisLocked = true;
          this.entity.stasisLockRemainingTicks = 180;
          this.entity.energy = Math.max(0, this.entity.energy - 350);
          cyberAudio.playReentryShatter();
          this.addLog('[TRAP DETONATION] Be <> struck by Kinetic Trap at re-entry point! Stasis Disrupted!', 'RESONANCE', currentTick);
        }
      }

      if (trap.durationTicks <= 0) {
        this.kineticTraps.splice(i, 1);
      }
    }
  }

  private findNearestAnchor(x: number, y: number) {
    let nearest = null;
    let minDist = Infinity;
    for (const a of this.arena.anchors) {
      const d = Math.hypot(a.x - x, a.y - y);
      if (d < minDist) {
        minDist = d;
        nearest = a;
      }
    }
    return nearest;
  }
}
