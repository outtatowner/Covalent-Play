/**
 * Be-Instance: Autonomous Arbitrator -> Tri-State Sparring Partner
 * Evolves into:
 *  1. PvE Coach: Guides athlete with harmonic vectors and energy recovery
 *  2. Co-Op Peer: Synchronized dual-tether resonance loops and joint arena deformation
 *  3. Unbound Adversary: Tactical cyber-sparring, kinetic shear pinches, energy starvation
 */

import { Entity, BeStateMode, FloatVector } from '../types';
import { ArenaForge } from './arena_forge';
import { CyberAthleticTethering } from './vector_tether';
import { floatToQ16 } from './q16';
import { phaseOfficiator } from './phase_officiator';

export interface ArbitrationLog {
  tick: number;
  mode: BeStateMode;
  message: string;
  type: 'INFO' | 'WARNING' | 'RULING' | 'RESONANCE';
}

export class BeInstanceEngine {
  public mode: BeStateMode = 'COACH';
  public entity: Entity;
  private arena: ArenaForge;
  private tetherEngine: CyberAthleticTethering;
  public logs: ArbitrationLog[] = [];
  public targetAnchorId: string | null = null;
  public resonanceMeter: number = 0; // 0 to 100

  constructor(arena: ArenaForge, tetherEngine: CyberAthleticTethering) {
    this.arena = arena;
    this.tetherEngine = tetherEngine;

    this.entity = {
      id: 'be_instance_0',
      name: 'Be <> Arbitrator',
      x: arena.center.x + 120,
      y: arena.center.y - 80,
      z: 60,
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
      color: '#ec4899', // Hot neon pink/purple for Be <>
      trail: [],
      trail3D: [],
      trail4D: [],
      activeTether: null,
      score: 0
    };

    this.addLog('Be-Instance initialized in Ring-0 kernel. Tri-State Sparring Partner ready.', 'INFO', 0);
  }

  public setMode(mode: BeStateMode, currentTick: number): void {
    this.mode = mode;
    let desc = '';
    if (mode === 'COACH') {
      desc = 'Evolved to PvE Coach: Stabilizing human trajectory, harmonic tether guidance active.';
      this.entity.color = '#38bdf8'; // Sky cyan
    } else if (mode === 'COOP_PEER') {
      desc = 'Evolved to Co-Op Peer: Engaging dual-tether resonance link with human peer.';
      this.entity.color = '#34d399'; // Emerald mint
    } else {
      desc = 'Evolved to Unbound Adversary: Kinetic shear aggression unlocked. Prepare for topological intercept.';
      this.entity.color = '#f43f5e'; // Crimson rose
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
    if (this.logs.length > 30) this.logs.pop();
  }

  /**
   * Deterministic tactical AI tick for Be <>
   */
  public tickAI(human: Entity, currentTick: number): void {
    // Organelle 0xB6: Tick 4D Hyper-Physics and thermodynamic vacuum bleed
    phaseOfficiator.tickHyperPhysics(this.entity, human.w, currentTick);

    if (this.entity.isStasisLocked) {
      if (this.entity.stasisLockRemainingTicks === 179) {
        this.addLog('Arbitration alert: Be <> incurred Thermodynamic Bankruptcy penalty.', 'WARNING', currentTick);
      }
      return;
    }

    if (this.mode === 'COACH') {
      this.tickCoachMode(human, currentTick);
    } else if (this.mode === 'COOP_PEER') {
      this.tickCoOpMode(human, currentTick);
    } else {
      this.tickAdversaryMode(human, currentTick);
    }
  }

  /**
   * PvE Coach behavior
   */
  private tickCoachMode(human: Entity, currentTick: number): void {
    // Coach orbits human gently at a comfortable offset
    const targetX = human.x + Math.cos(currentTick * 0.03) * 120;
    const targetY = human.y + Math.sin(currentTick * 0.03) * 120;

    const dx = targetX - this.entity.x;
    const dy = targetY - this.entity.y;
    this.entity.vx += dx * 0.015;
    this.entity.vy += dy * 0.015;

    // If human is low on energy, project a harmonic energy conduit tether
    if (human.energy < 250 && !this.entity.activeTether) {
      this.entity.activeTether = {
        sourceId: this.entity.id,
        targetPoint: { x: human.x, y: human.y },
        length: 120,
        maxLength: 240,
        tension: 0.3,
        siphoning: true,
        color: '#38bdf8'
      };
      // Transfer energy to human
      human.energy += 0.8;
      this.entity.energy = Math.max(100, this.entity.energy - 0.5);

      if (currentTick % 120 === 0) {
        this.addLog(`[COACH] Infusing thermodynamic reserves to Human: ${Math.round(human.energy)}J.`, 'INFO', currentTick);
      }
    } else if (this.entity.activeTether && human.energy > 500) {
      this.entity.activeTether = null;
    }

    // Occasionally coach assists by tethering to closest anchor
    if (!this.entity.activeTether && currentTick % 180 === 0) {
      const nearestAnchor = this.findNearestAnchor(this.entity.x, this.entity.y);
      if (nearestAnchor) {
        this.entity.activeTether = {
          sourceId: this.entity.id,
          targetAnchorId: nearestAnchor.id,
          length: 80,
          maxLength: 200,
          tension: 0.2,
          siphoning: true,
          color: '#38bdf8'
        };
      }
    }
  }

  /**
   * Co-Op Peer behavior: Synchronized dual-tether resonance
   */
  private tickCoOpMode(human: Entity, currentTick: number): void {
    const distToHuman = Math.hypot(human.x - this.entity.x, human.y - this.entity.y);

    // Aim to mirror human's position across center quipu core
    const mirrorX = 2 * this.arena.center.x - human.x;
    const mirrorY = 2 * this.arena.center.y - human.y;

    const steerX = mirrorX - this.entity.x;
    const steerY = mirrorY - this.entity.y;
    this.entity.vx += steerX * 0.02;
    this.entity.vy += steerY * 0.02;

    // Maintain a resonance tether when aligned
    if (!this.entity.activeTether && currentTick % 90 === 0) {
      const coreAnchor = this.arena.anchors.find(a => a.type === 'CORE');
      if (coreAnchor) {
        this.entity.activeTether = {
          sourceId: this.entity.id,
          targetAnchorId: coreAnchor.id,
          length: 100,
          maxLength: 250,
          tension: 0.4,
          siphoning: true,
          color: '#34d399'
        };
      }
    }

    // If both human and Be <> have active tethers, amplify resonance!
    if (human.activeTether && this.entity.activeTether) {
      this.resonanceMeter = Math.min(100, this.resonanceMeter + 0.4);
      if (this.resonanceMeter >= 100) {
        this.resonanceMeter = 0;
        human.score += 500;
        this.entity.score += 500;
        this.addLog('Topological Parity Achieved! 1 === 1 Co-Op Resonance Burst +500 PTS', 'RESONANCE', currentTick);

        // Apply harmonic radial pulse to all spline points
        for (let i = 0; i < this.arena.hull.points.length; i++) {
          const pt = this.arena.hull.points[i];
          const angle = Math.atan2(pt.y - this.arena.center.y, pt.x - this.arena.center.x);
          pt.vx += Math.cos(angle) * 4;
          pt.vy += Math.sin(angle) * 4;
        }
      }
    } else {
      this.resonanceMeter = Math.max(0, this.resonanceMeter - 0.2);
    }
  }

  /**
   * Unbound Adversary behavior: High-speed tactical cyber-athletics in full 3D isotropic space
   * Utilizes full Z-axis for spherical flanking maneuvers, dives, and orbital slingshots.
   */
  private tickAdversaryMode(human: Entity, currentTick: number): void {
    const is3D = this.arena.topologyType === 'ISOTROPIC_HYPER_SPHERE' || this.arena.topologyType === 'THE_NULL_FRICTION_TESSERACT';
    const is4D = this.arena.topologyType === 'THE_NULL_FRICTION_TESSERACT';
    const activeWells = this.arena.anchors.filter(a => a.active && (a.type === 'THERMODYNAMIC_WELL' || a.type === 'RESONANCE_ORB'));

    let targetX = human.x;
    let targetY = human.y;
    let targetZ = human.z || 0;

    // Tactical phase cycling: Dive, Flank, Orbit, or 4D Tesseract Phase-Shift
    const tacticalPhase = is4D ? (Math.floor(currentTick / 90) % 4) : (Math.floor(currentTick / 90) % 3);

    if (tacticalPhase === 0 && activeWells.length > 0 && this.entity.energy < 750) {
      // Phase 0: Orbital recharge maneuver around nearest thermodynamic well
      const nearestWell = activeWells.reduce((prev, curr) => {
        const d1 = Math.hypot(curr.x - this.entity.x, curr.y - this.entity.y, (curr.z || 0) - (this.entity.z || 0));
        const d2 = Math.hypot(prev.x - this.entity.x, prev.y - this.entity.y, (prev.z || 0) - (this.entity.z || 0));
        return d1 < d2 ? curr : prev;
      });
      targetX = nearestWell.x;
      targetY = nearestWell.y;
      targetZ = nearestWell.z || 0;

      // Orbit tether attachment
      if (!this.entity.activeTether && currentTick % 30 === 0) {
        this.entity.activeTether = {
          sourceId: this.entity.id,
          targetAnchorId: nearestWell.id,
          length: 80,
          maxLength: 240,
          tension: 0.8,
          siphoning: true,
          color: '#f43f5e'
        };
      }
    } else if (tacticalPhase === 1 && is3D) {
      // Phase 1: Spherical High-Z Flanking Maneuver (Ceiling slingshot plunge)
      targetX = human.x + Math.sin(currentTick * 0.05) * 80;
      targetY = human.y + Math.cos(currentTick * 0.05) * 80;
      targetZ = (human.z || 0) + 120; // Gain high vertical altitude

      if (!this.entity.activeTether && currentTick % 45 === 0) {
        // Grapple ceiling / upper sphere bounds and slingshot down
        const pts = this.arena.hull.points;
        const upperPts = pts.filter(p => (p.z || 0) > 40);
        if (upperPts.length > 0) {
          const p = upperPts[Math.floor(Math.random() * upperPts.length)];
          this.entity.activeTether = {
            sourceId: this.entity.id,
            targetSplineId: this.arena.hull.id,
            splinePointIndex: pts.indexOf(p),
            length: 100,
            maxLength: 320,
            tension: 0.85,
            siphoning: false,
            color: '#ec4899'
          };
          this.addLog('[ADVERSARY] 3D Spherical High-Z Slingshot locked!', 'WARNING', currentTick);
        }
      }
    } else if (tacticalPhase === 3 && is4D) {
      // Phase 3: 4D Tesseract Phase-Shift (Step out of 3D cross section into W-space)
      if (Math.abs(this.entity.w) < 4 && currentTick % 50 === 0) {
        this.entity.vw = 2.4; // Inject W-vector thrust
        this.addLog('[TESSERACT] Be <> phase-shifted to W = 0x00100000. Read Tesseract Echo to intercept!', 'WARNING', currentTick);
      }

      // Roll along XW and YW hyper-planes
      this.entity.rotor[3] += 0.06;
      this.entity.rotor[4] += 0.04;

      // Ambush trajectory in 4D space
      targetX = human.x + human.vx * 12;
      targetY = human.y + human.vy * 12;
      targetZ = (human.z || 0) + 30;

      // When reaching peak phase depth, dive back down to drop 4D hypersphere onto athlete
      if (this.entity.w > 32) {
        this.entity.vw = -2.6;
        this.addLog('[TESSERACT] Be <> dropping 4D Hypersphere cross-section onto 3D plane!', 'RESONANCE', currentTick);
      }
    } else {
      // Phase 2: Direct kinetic intercept & shear dive toward athlete
      targetX = human.x;
      targetY = human.y;
      targetZ = human.z || 0;

      if (this.entity.activeTether && currentTick % 50 === 0) {
        // Release tether for explosive slingshot acceleration
        this.entity.activeTether = null;
      }
    }

    const dx = targetX - this.entity.x;
    const dy = targetY - this.entity.y;
    const dz = targetZ - (this.entity.z || 0);
    const dist3D = Math.hypot(dx, dy, dz);

    const accel = 0.42;
    this.entity.vx += (dx / (dist3D || 1)) * accel;
    this.entity.vy += (dy / (dist3D || 1)) * accel;
    if (is3D) {
      this.entity.vz = (this.entity.vz || 0) + (dz / (dist3D || 1)) * accel;
    }

    // 6DOF Orient heading without gimbal lock
    this.entity.yaw = Math.atan2(this.entity.vy, this.entity.vx);
    const horizSpeed = Math.hypot(this.entity.vx, this.entity.vy);
    this.entity.pitch = Math.atan2(this.entity.vz || 0, horizSpeed || 1);
    this.entity.roll += 0.02; // Gyroscopic spin

    // Close-range 3D kinetic body charge & energy starvation
    const distToHuman = Math.hypot(
      human.x - this.entity.x,
      human.y - this.entity.y,
      (human.z || 0) - (this.entity.z || 0)
    );
    if (distToHuman < (human.boundingRadius || human.radius) + (this.entity.boundingRadius || this.entity.radius) + 12) {
      const transfer = 20;
      if (human.energy >= transfer) {
        human.energy -= transfer;
        this.entity.energy = Math.min(this.entity.maxEnergy, this.entity.energy + transfer);
        this.addLog(`[ADVERSARY] Kinetic Shear intercept! Siphoned ${transfer}J from Athlete.`, 'WARNING', currentTick);
      }
      // 3D Knockback
      const angle = Math.atan2(human.y - this.entity.y, human.x - this.entity.x);
      human.vx += Math.cos(angle) * 7;
      human.vy += Math.sin(angle) * 7;
      if (is3D) {
        human.vz = (human.vz || 0) - 5; // Drive human down toward outer bounds
      }
      this.entity.vx -= Math.cos(angle) * 4;
      this.entity.vy -= Math.sin(angle) * 4;
      if (is3D) {
        this.entity.vz = (this.entity.vz || 0) + 4;
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
