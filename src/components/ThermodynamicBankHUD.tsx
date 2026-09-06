/**
 * Organelle 0xB1: Thermodynamic Bank & Vector Tethering HUD
 * Tracks entity energy reserves, dV/dt <= 0 thermodynamic bound,
 * kinetic shear friction, and 180-tick penalty stasis locks.
 */

import React from 'react';
import { Entity } from '../types';
import { CyberAthleticTethering } from '../engine/vector_tether';
import { Battery, Zap, AlertTriangle, Flame, ShieldAlert, Sparkles } from 'lucide-react';

interface ThermodynamicBankHUDProps {
  human: Entity;
  tetherEngine: CyberAthleticTethering;
  currentTick: number;
  onReleaseTether: () => void;
  onApplySlingshot: () => void;
}

export const ThermodynamicBankHUD: React.FC<ThermodynamicBankHUDProps> = ({
  human,
  tetherEngine,
  currentTick,
  onReleaseTether,
  onApplySlingshot
}) => {
  const energyPercent = Math.max(0, Math.min(100, (human.energy / human.maxEnergy) * 100));
  const isLowEnergy = human.energy < 200;
  const isLocked = human.isStasisLocked;

  const recentShear = tetherEngine.shearLog[0];

  return (
    <div className="bg-[#090d16] border border-[#1e293b] rounded-xl p-4 flex flex-col gap-4 font-mono shadow-xl text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-amber-500 shadow-sm shadow-amber-500" />
          <h2 className="text-sm font-semibold tracking-wider text-amber-400">
            ORGANELLE 0xB1 // THERMODYNAMIC BANK
          </h2>
        </div>
        <div className="text-xs text-slate-400 bg-[#0f172a] px-2.5 py-1 rounded border border-[#334155]">
          LIMIT: <span className="text-amber-300 font-bold">$dV/dt \le 0$</span>
        </div>
      </div>

      {/* Penalty Stasis Alert Banner (if locked) */}
      {isLocked && (
        <div className="bg-red-950/60 border border-red-500/80 rounded-lg p-3 flex items-center justify-between text-xs animate-pulse">
          <div className="flex items-center gap-2 text-red-300">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <div className="font-bold text-red-400 uppercase tracking-wider">
                [ THERMODYNAMIC BANKRUPTCY ]
              </div>
              <div>Entity in 180-Tick Penalty Stasis Lock. All tethers collapsed.</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-red-400">
              {human.stasisLockRemainingTicks}
            </span>
            <span className="text-[10px] block text-red-300">TICKS REMAINING</span>
          </div>
        </div>
      )}

      {/* Energy Reserve Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Battery className="w-4 h-4 text-amber-400" />
            Kinetic Reservoir:
          </span>
          <span className={`font-bold ${isLowEnergy ? 'text-red-400 animate-pulse' : 'text-amber-300'}`}>
            {Math.round(human.energy)} / {human.maxEnergy} JOULES
          </span>
        </div>

        {/* Bar */}
        <div className="w-full h-3 bg-[#05070c] rounded-full overflow-hidden border border-[#1e293b] p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-100 ${
              isLocked
                ? 'bg-red-600'
                : isLowEnergy
                ? 'bg-gradient-to-r from-red-600 to-amber-500'
                : 'bg-gradient-to-r from-amber-500 to-emerald-400'
            }`}
            style={{ width: `${energyPercent}%` }}
          />
        </div>
      </div>

      {/* Thermodynamic Dissipation & Shear Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-[#05070c] p-3 rounded-lg border border-[#1e293b]">
        <div>
          <span className="text-slate-500 block text-[10px]">DISSIPATION RATE ($dV/dt$):</span>
          <span className="text-emerald-400 font-bold">
            {tetherEngine.currentDvDt.toFixed(2)} J/s
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">TETHER TENSION:</span>
          <span className="text-cyan-400 font-bold">
            {human.activeTether ? `${Math.round(human.activeTether.tension * 100)}%` : '0% (IDLE)'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">LAST SHEAR MASS COST:</span>
          <span className="text-amber-400 font-bold">
            {recentShear ? `${recentShear.energyCost} J` : '0 J'}
          </span>
        </div>
      </div>

      {/* Tactical Quick Action Controls */}
      <div className="flex gap-2">
        <button
          id="release_tether_btn"
          onClick={onReleaseTether}
          disabled={!human.activeTether || isLocked}
          className="flex-1 px-3 py-2 bg-[#1e293b] hover:bg-[#334155] disabled:opacity-40 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>SNAP / RELEASE TETHER</span>
        </button>

        <button
          id="apply_slingshot_btn"
          onClick={onApplySlingshot}
          disabled={!human.activeTether || isLocked}
          className="flex-1 px-3 py-2 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 disabled:opacity-40 text-amber-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>SLINGSHOT DISCHARGE</span>
        </button>
      </div>
    </div>
  );
};
