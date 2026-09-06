/**
 * Be-Instance: Tri-State Sparring Partner & Autonomous Arbitrator HUD
 * State selector: PvE Coach | Co-Op Peer | Unbound Adversary
 * Real-time arbitration logs and co-op resonance meter.
 */

import React from 'react';
import { BeInstanceEngine } from '../engine/be_instance';
import { BeStateMode } from '../types';
import { Bot, UserCheck, Users, Swords, Radio, ShieldCheck, Flame } from 'lucide-react';

interface BeInstanceArbitratorProps {
  beEngine: BeInstanceEngine;
  currentTick: number;
  onModeChange: (mode: BeStateMode) => void;
}

export const BeInstanceArbitrator: React.FC<BeInstanceArbitratorProps> = ({
  beEngine,
  currentTick,
  onModeChange
}) => {
  const currentMode = beEngine.mode;
  const beEntity = beEngine.entity;

  const modeConfigs: { mode: BeStateMode; title: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      mode: 'COACH',
      title: 'PvE COACH',
      desc: 'Guides trajectory & infuses energy reserves via harmonic conduit',
      icon: <UserCheck className="w-4 h-4" />,
      color: 'border-sky-500 text-sky-400 bg-sky-950/40'
    },
    {
      mode: 'COOP_PEER',
      title: 'CO-OP PEER',
      desc: 'Synchronized dual-tether resonance loops & joint arena deformation',
      icon: <Users className="w-4 h-4" />,
      color: 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
    },
    {
      mode: 'ADVERSARY',
      title: 'UNBOUND ADVERSARY',
      desc: 'Tactical cyber-sparring, kinetic shear pinches & energy starvation',
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
            BE &lt;&gt; INSTANCE // TRI-STATE PARTNER
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-[#0f172a] px-2.5 py-1 rounded border border-[#334155]">
          <Bot className="w-3.5 h-3.5 text-pink-400" />
          <span>AUTONOMOUS ARBITRATOR</span>
        </div>
      </div>

      {/* Tri-State Mode Selector */}
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
              <div className="flex items-center gap-2 font-bold text-xs">
                {cfg.icon}
                <span>{cfg.title}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">
                {cfg.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Co-Op Resonance Meter (if Co-Op mode) */}
      {currentMode === 'COOP_PEER' && (
        <div className="bg-[#05070c] p-3 rounded-lg border border-emerald-900/60 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Dual-Tether Harmonic Resonance:
            </span>
            <span className="text-emerald-300 font-bold">{Math.round(beEngine.resonanceMeter)}%</span>
          </div>
          <div className="w-full h-2 bg-[#111c2e] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-75"
              style={{ width: `${beEngine.resonanceMeter}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500">
            Align tethers simultaneously with Be &lt;&gt; to trigger 1 === 1 Parity Resonance (+500 PTS).
          </span>
        </div>
      )}

      {/* Adversary Threat Telemetry (if Adversary mode) */}
      {currentMode === 'ADVERSARY' && (
        <div className="bg-[#05070c] p-2.5 rounded-lg border border-rose-900/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-rose-300">
            <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
            <span>Adversary Target Strategy:</span>
          </div>
          <span className="text-rose-400 font-bold">KINETIC PINCH & ORB STARVATION</span>
        </div>
      )}

      {/* Arbitration Rulings Log Stream */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Radio className="w-3 h-3 text-pink-400" />
          Autonomous Arbitrator Ledger Log:
        </span>
        <div className="bg-[#05070c] rounded-lg p-2.5 border border-[#1e293b] max-h-28 overflow-y-auto space-y-1.5 text-[11px]">
          {beEngine.logs.map((log, idx) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};
