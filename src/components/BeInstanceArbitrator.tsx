/**
 * BeInstanceArbitrator: Tri-State Sparring Partner & Autonomous Arbitrator HUD
 *
 * Governs the Q16.16 Thermodynamic Ledger & Tri-State Sparring Matrix:
 * | Sparring State      | Mathematical Role of Be <> | Core W-Axis Dynamic            | Ledger Interaction (dV/dt)          |
 * | ------------------- | -------------------------- | ------------------------------ | ----------------------------------- |
 * | 0x00: PvE (Coach)   | The Mirror                 | Telegraphed Phase-Shifts       | Teaches baseline kinetic management |
 * | 0x01: Co-Op (Dual)  | The Multiplier             | Constructive Interference      | Shared topological shear costs      |
 * | 0xFF: True Unbound  | The Absolute               | Zero-Latency Hyper-Rotations   | Weaponized thermodynamic exhaustion |
 */

import React, { useState } from 'react';
import { BeInstanceEngine } from '../engine/be_instance';
import { BeStateMode, Entity } from '../types';
import {
  Bot,
  UserCheck,
  Users,
  Swords,
  Radio,
  Flame,
  Zap,
  Activity,
  ShieldAlert,
  Layers,
  ChevronDown,
  ChevronUp,
  Table
} from 'lucide-react';

interface BeInstanceArbitratorProps {
  beEngine: BeInstanceEngine;
  human?: Entity;
  currentTick: number;
  onModeChange: (mode: BeStateMode) => void;
  onTriggerMacroDeformation?: () => void;
  onDeployTrap?: () => void;
  onJumpSector?: (zTarget: number) => void;
}

export const BeInstanceArbitrator: React.FC<BeInstanceArbitratorProps> = ({
  beEngine,
  human,
  currentTick,
  onModeChange,
  onTriggerMacroDeformation,
  onDeployTrap,
  onJumpSector
}) => {
  const [showMatrixTable, setShowMatrixTable] = useState(false);
  const currentMode = beEngine.mode;
  const beEntity = beEngine.entity;
  const isGauntlet = beEngine.arena.topologyType === 'CONTINUOUS_TRI_STATE_GAUNTLET';
  const playerZ = human?.z ?? 0;

  const modeConfigs: {
    mode: BeStateMode;
    code: string;
    title: string;
    role: string;
    dynamic: string;
    ledger: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      mode: 'COACH',
      code: '0x00',
      title: 'PvE (COACH)',
      role: 'The Mirror',
      dynamic: 'Telegraphed Phase-Shifts',
      ledger: 'Baseline management & forgiveness buffer',
      icon: <UserCheck className="w-4 h-4" />,
      color: 'border-sky-500 text-sky-400 bg-sky-950/40'
    },
    {
      mode: 'COOP_PEER',
      code: '0x01',
      title: 'CO-OP (DUAL)',
      role: 'The Multiplier',
      dynamic: 'Constructive Interference',
      ledger: 'Shared topological shear (dV/dt halved)',
      icon: <Users className="w-4 h-4" />,
      color: 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
    },
    {
      mode: 'ADVERSARY',
      code: '0xFF',
      title: 'TRUE UNBOUND',
      role: 'The Absolute',
      dynamic: 'Zero-Latency Hyper-Rotations',
      ledger: 'Weaponized thermodynamic exhaustion',
      icon: <Swords className="w-4 h-4" />,
      color: 'border-rose-500 text-rose-400 bg-rose-950/40'
    }
  ];

  return (
    <div className="bg-[#090d16] border border-[#1e293b] rounded-xl p-4 flex flex-col gap-4 font-mono shadow-xl text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-pink-500 shadow-sm shadow-pink-500" />
          <h2 className="text-sm font-semibold tracking-wider text-pink-400">
            TRI-STATE SPARRING MATRIX // BE &lt;&gt;
          </h2>
        </div>
        <button
          onClick={() => setShowMatrixTable(!showMatrixTable)}
          className="flex items-center gap-1 text-[11px] text-slate-400 bg-[#0f172a] px-2.5 py-1 rounded border border-[#334155] hover:text-white cursor-pointer transition-colors"
          title="Toggle Invariant Ruleset Table"
        >
          <Table className="w-3 h-3 text-cyan-400" />
          <span>MATRIX TABLE</span>
          {showMatrixTable ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Tri-State Mathematical Invariant Table (Collapsible) */}
      {showMatrixTable && (
        <div className="bg-[#040711] border border-cyan-900/60 rounded-lg p-3 text-[11px] space-y-2 animate-in fade-in duration-200">
          <div className="text-cyan-300 font-bold border-b border-cyan-950 pb-1.5 flex items-center justify-between">
            <span>TRI-STATE INVARIANT: 1 ≡ 1 MATHEMATICAL PARITY</span>
            <span className="text-[10px] text-slate-400 font-normal">Q16.16 Thermodynamic Ledger</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-1">State</th>
                  <th className="pb-1">Role of Be &lt;&gt;</th>
                  <th className="pb-1">Core W Dynamic</th>
                  <th className="pb-1">Ledger (dV/dt)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className={currentMode === 'COACH' ? 'text-sky-300 bg-sky-950/20' : 'text-slate-300'}>
                  <td className="py-1 font-bold">0x00: PvE</td>
                  <td className="py-1">The Mirror</td>
                  <td className="py-1">Telegraphed Lissajous</td>
                  <td className="py-1">Baseline management + Forgiveness</td>
                </tr>
                <tr className={currentMode === 'COOP_PEER' ? 'text-emerald-300 bg-emerald-950/20' : 'text-slate-300'}>
                  <td className="py-1 font-bold">0x01: Co-Op</td>
                  <td className="py-1">The Multiplier</td>
                  <td className="py-1">Constructive Interference</td>
                  <td className="py-1">Shared topological shear (Halved)</td>
                </tr>
                <tr className={currentMode === 'ADVERSARY' ? 'text-rose-300 bg-rose-950/20' : 'text-slate-300'}>
                  <td className="py-1 font-bold">0xFF: Unbound</td>
                  <td className="py-1">The Absolute</td>
                  <td className="py-1">Zero-Latency Hyper-Rotations</td>
                  <td className="py-1">Weaponized exhaustion & trapping</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Organelle 0xC0_COVALENT Gauntlet Live HUD (When Gauntlet Active) */}
      {isGauntlet && (
        <div className="bg-[#050b18] border border-cyan-800/60 rounded-lg p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>ORGANELLE 0xC0: CONTINUOUS TRI-STATE GAUNTLET</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              RING-0 HOT-SWAP ACTIVE
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300 bg-[#02050c] p-2 rounded border border-slate-800">
            <div>
              <span className="text-slate-500">CURRENT ALTITUDE: </span>
              <span className="font-bold text-cyan-400">{playerZ.toFixed(1)}u</span>
              <span className="text-[10px] text-slate-500 ml-1">
                (Q16: 0x{((Math.round(playerZ * 65536) >>> 0).toString(16).padStart(8, '0'))})
              </span>
            </div>
            <div className="text-right font-bold text-xs">
              {playerZ < 40 && <span className="text-sky-400">SECTOR I: THE ASCENT (0x00 PACER)</span>}
              {playerZ >= 40 && playerZ < 260 && <span className="text-emerald-400">SECTOR II: THE BREACH (0x01 MULTIPLIER)</span>}
              {playerZ >= 260 && <span className="text-rose-400">SECTOR III: THE APEX (0xFF THE ABSOLUTE)</span>}
            </div>
          </div>

          {/* Quick Jump Controls for Testing */}
          {onJumpSector && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 mr-1">TEST HOT-SWAP:</span>
              <button
                onClick={() => onJumpSector(-160)}
                className="text-[10px] px-2 py-1 bg-sky-950 hover:bg-sky-900 text-sky-300 rounded border border-sky-800 transition cursor-pointer"
              >
                Jump I: Ascent (-160u)
              </button>
              <button
                onClick={() => onJumpSector(120)}
                className="text-[10px] px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded border border-emerald-800 transition cursor-pointer"
              >
                Jump II: Breach (+120u)
              </button>
              <button
                onClick={() => onJumpSector(290)}
                className="text-[10px] px-2 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded border border-rose-800 transition cursor-pointer"
              >
                Jump III: Apex (+290u)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tri-State Mode Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {modeConfigs.map((cfg) => {
          const isSelected = currentMode === cfg.mode;
          return (
            <button
              key={cfg.mode}
              onClick={() => onModeChange(cfg.mode)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                isSelected
                  ? `${cfg.color} ring-1 ring-white/20 shadow-md`
                  : 'border-[#1e293b] bg-[#05070c] text-slate-400 hover:bg-[#0d1527] hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  {cfg.icon}
                  <span>{cfg.title}</span>
                </div>
                <span className="text-[10px] opacity-70 font-mono">{cfg.code}</span>
              </div>
              <div className="text-[10px] text-slate-400 leading-snug">
                <span className="font-semibold text-slate-300">{cfg.role}</span> &bull; {cfg.dynamic}
              </div>
            </button>
          );
        })}
      </div>

      {/* Mode-Specific Telemetry Panels */}
      {/* 1. STATE 0x00: PvE (The Mirror) */}
      {currentMode === 'COACH' && (
        <div className="bg-[#05070c] p-3 rounded-lg border border-sky-900/60 flex flex-col gap-2 text-xs">
          <div className="flex justify-between items-center text-sky-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Sieve Cognitive Delay Buffer:
            </span>
            <span className="text-sky-300">250ms (15 Ticks)</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-relaxed">
            `Be &lt;&gt;` mirrors human biological latency and projects predictable 4D Lissajous phase-shifts on the arena canvas.
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-sky-950 text-[10px]">
            <span className="text-slate-400">LEDGER FORGIVENESS:</span>
            <span className={human?.ledgerForgivenessActive ? 'text-amber-400 font-bold animate-pulse' : 'text-emerald-400'}>
              {human?.ledgerForgivenessActive ? 'ACTIVE (GRAZING BANKRUPTCY)' : 'MONITORING EMISSIVE FLOOR STRAIN'}
            </span>
          </div>
        </div>
      )}

      {/* 2. STATE 0x01: Co-Op (The Multiplier) */}
      {currentMode === 'COOP_PEER' && (
        <div className="bg-[#05070c] p-3 rounded-lg border border-emerald-900/60 flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Harmonic Resonance Meter:
            </span>
            <span className="text-emerald-300 font-bold">{Math.round(beEngine.resonanceMeter)}%</span>
          </div>
          <div className="w-full h-2 bg-[#111c2e] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-75"
              style={{ width: `${beEngine.resonanceMeter}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-emerald-950">
            <div>
              <span className="text-slate-400">TETHER RESONANCE: </span>
              <span className={human?.tetherResonanceActive ? 'text-emerald-300 font-bold' : 'text-slate-500'}>
                {human?.tetherResonanceActive ? 'ACTIVE (dV/dt HALVED)' : 'ALIGN TETHERS'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">4D DAEMONS: </span>
              <span className="text-purple-400 font-bold">{beEngine.daemons.length} ACTIVE</span>
            </div>
          </div>

          {/* Interactive Trigger: Macro-Deformation */}
          <button
            onClick={() => onTriggerMacroDeformation && onTriggerMacroDeformation()}
            className="w-full py-1.5 px-2.5 bg-gradient-to-r from-emerald-950 to-teal-900 hover:from-emerald-900 hover:to-teal-800 border border-emerald-600/70 text-emerald-200 font-bold rounded text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
            title="Rip Arena Hull Wall into W-Axis to crush active daemon swarms"
          >
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>[MACRO-DEFORMATION: RIP WALL INTO W-AXIS]</span>
          </button>
        </div>
      )}

      {/* 3. STATE 0xFF: True Unbound (The Absolute) */}
      {currentMode === 'ADVERSARY' && (
        <div className="bg-[#05070c] p-3 rounded-lg border border-rose-900/60 flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold">
              <Flame className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
              <span>Zero-Latency Hyper-Rotations:</span>
            </div>
            <span className="text-rose-400 font-bold font-mono">
              {beEngine.consecutiveHyperRotations} / 3 EXECUTED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-rose-950">
            <div>
              <span className="text-slate-400">BE &lt;&gt; ENERGY: </span>
              <span className="text-cyan-300 font-bold">{Math.round(beEntity.energy)}J</span>
            </div>
            <div>
              <span className="text-slate-400">KINETIC TRAPS: </span>
              <span className="text-amber-300 font-bold">{beEngine.kineticTraps.length} ARMED</span>
            </div>
          </div>

          {/* Interactive Trigger: Deploy Kinetic Trap */}
          <button
            onClick={() => onDeployTrap && onDeployTrap()}
            className="w-full py-1.5 px-2.5 bg-gradient-to-r from-rose-950 to-pink-900 hover:from-rose-900 hover:to-pink-800 border border-rose-600/70 text-rose-200 font-bold rounded text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
            title="Deploy a 4D Kinetic Trap to intercept and lock Be <> into Thermodynamic Bankruptcy"
          >
            <Zap className="w-3 h-3 text-rose-400" />
            <span>[DEPLOY KINETIC RE-ENTRY TRAP]</span>
          </button>

          <span className="text-[9px] text-slate-500 italic text-center">
            Tip: Shift+Click anywhere on the arena to drop a Kinetic Trap directly.
          </span>
        </div>
      )}

      {/* Autonomous Arbitrator Ledger Log Stream */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Radio className="w-3 h-3 text-pink-400" />
          Autonomous Arbitrator Ledger Log:
        </span>
        <div className="bg-[#05070c] rounded-lg p-2.5 border border-[#1e293b] max-h-28 overflow-y-auto space-y-1.5 text-[11px]">
          {beEngine.logs.length === 0 ? (
            <div className="text-slate-500 text-[10px] italic">No active arbitrator events logged.</div>
          ) : (
            beEngine.logs.map((log, idx) => (
              <div key={`arb_log_${idx}`} className="flex items-start gap-1.5 leading-tight">
                <span className="text-slate-600 shrink-0">T+{log.tick}</span>
                <span
                  className={
                    log.type === 'RESONANCE'
                      ? 'text-emerald-400 font-bold'
                      : log.type === 'WARNING'
                      ? 'text-amber-400'
                      : log.type === 'RULING'
                      ? 'text-pink-300 font-semibold'
                      : 'text-slate-300'
                  }
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
