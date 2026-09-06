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
      vx: 0,
      vy: 0,
      radius: 16,
      energy: 850,
      maxEnergy: 1000,
      stasisLockRemainingTicks: 0,
      isStasisLocked: false,
      color: '#ec4899', // Hot neon pink/purple for Be <>
      trail: [],
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
   * Unbound Adversary behavior: High-speed tactical cyber-athletics
   */
  private tickAdversaryMode(human: Entity, currentTick: number): void {
    // Intercept active orbs or human
    const activeOrbs = this.arena.anchors.filter(a => a.active && a.type === 'RESONANCE_ORB');

    let targetX = human.x;
    let targetY = human.y;

    if (activeOrbs.length > 0) {
      // Rush nearest orb to starve human
      const nearest = activeOrbs.reduce((prev, curr) => {
        const d1 = Math.hypot(curr.x - this.entity.x, curr.y - this.entity.y);
        const d2 = Math.hypot(prev.x - this.entity.x, prev.y - this.entity.y);
        return d1 < d2 ? curr : prev;
      });
      targetX = nearest.x;
      targetY = nearest.y;
    }

    const dx = targetX - this.entity.x;
    const dy = targetY - this.entity.y;
    const dist = Math.hypot(dx, dy);

    this.entity.vx += (dx / (dist || 1)) * 0.38;
    this.entity.vy += (dy / (dist || 1)) * 0.38;

    // Tactical Tethering: Cast tether to slingshot around boundary
    if (!this.entity.activeTether && currentTick % 70 === 0) {
      // Pick random spline control point to apply kinetic shear
      const pts = this.arena.hull.points;
      const targetIdx = Math.floor(Math.random() * pts.length);
      const pt = pts[targetIdx];

      this.entity.activeTether = {
        sourceId: this.entity.id,
        targetSplineId: this.arena.hull.id,
        splinePointIndex: targetIdx,
        length: 120,
        maxLength: 280,
        tension: 0.6,
        siphoning: false,
        color: '#f43f5e'
      };

      // Apply kinetic shear deformation!
      const forceVec = {
        x: floatToQ16((this.entity.vx * 1.5)),
        y: floatToQ16((this.entity.vy * 1.5))
      };
      this.tetherEngine.applyKineticShear(
        this.entity,
        this.arena.hull.id,
        targetIdx,
        forceVec,
        currentTick
      );
    } else if (this.entity.activeTether && currentTick % 120 === 0) {
      // Slingshot release
      this.entity.activeTether = null;
    }

    // If human is close, attempt kinetic body charge to drain energy
    const distToHuman = Math.hypot(human.x - this.entity.x, human.y - this.entity.y);
    if (distToHuman < human.radius + this.entity.radius + 10) {
      const transfer = 15;
      if (human.energy >= transfer) {
        human.energy -= transfer;
        this.entity.energy = Math.min(this.entity.maxEnergy, this.entity.energy + transfer);
        this.addLog(`[ADVERSARY] Kinetic Shear intercept! Siphoned ${transfer}J from Human.`, 'WARNING', currentTick);
      }
      // Knockback
      const angle = Math.atan2(human.y - this.entity.y, human.x - this.entity.x);
      human.vx += Math.cos(angle) * 6;
      human.vy += Math.sin(angle) * 6;
      this.entity.vx -= Math.cos(angle) * 4;
      this.entity.vy -= Math.sin(angle) * 4;
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
