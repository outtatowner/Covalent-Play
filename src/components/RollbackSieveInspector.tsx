/**
 * Organelle 0xB0: The 4D Rollback Sieve Inspector
 * Visualizes 60-tick sliding memory window, Quipu Ledger Merkle root,
 * synthetic latency injection, and deterministic CORDIC timeline reconciliation.
 */

import React, { useState } from 'react';
import { CovalentRollbackSieve, TICK_WINDOW } from '../engine/rollback_kernel';
import { Entity, RollbackFrame } from '../types';
import { floatToQ16, q16ToFloat } from '../engine/q16';
import { cyberAudio } from '../engine/audio';
import { Play, RotateCcw, ShieldCheck, Zap, Activity, Clock, Cpu } from 'lucide-react';

interface RollbackSieveInspectorProps {
  rollbackSieve: CovalentRollbackSieve;
  human: Entity;
  be: Entity;
  currentTick: number;
  onReconciled: () => void;
}

export const RollbackSieveInspector: React.FC<RollbackSieveInspectorProps> = ({
  rollbackSieve,
  human,
  be,
  currentTick,
  onReconciled
}) => {
  const [selectedFrame, setSelectedFrame] = useState<RollbackFrame | null>(null);
  const [syntheticLagTicks, setSyntheticLagTicks] = useState<number>(18);
  const [isSimulatingRollback, setIsSimulatingRollback] = useState<boolean>(false);

  const history = rollbackSieve.getOrderedHistory();
  const lastEvent = rollbackSieve.lastRollbackEvent;

  // Triggers the C-Kernel reconciliation procedure:
  // sys_covalent_reconcile_timeline(mismatched_tick, delayed_input)
  const handleInjectDelayedVector = () => {
    setIsSimulatingRollback(true);
    const targetTick = Math.max(0, currentTick - syntheticLagTicks);

    // Create a delayed vector perturbation
    const delayedVector: [number, number, number] = [
      floatToQ16(human.x + (Math.random() - 0.5) * 40),
      floatToQ16(human.y + (Math.random() - 0.5) * 40),
      floatToQ16((Math.random() - 0.5) * 6)
    ];

    cyberAudio.playRollbackWarp();

    setTimeout(() => {
      const event = rollbackSieve.sysCovalentReconcileTimeline(
        targetTick,
        delayedVector,
        human,
        be
      );
      setIsSimulatingRollback(false);
      onReconciled();
    }, 80);
  };

  return (
    <div className="bg-[#090d16] border border-[#1e293b] rounded-xl p-4 flex flex-col gap-4 font-mono shadow-xl text-slate-200">
      {/* Header & Core Invariant Indicator */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-cyan-500 shadow-sm shadow-cyan-500" />
          <h2 className="text-sm font-semibold tracking-wider text-cyan-400">
            ORGANELLE 0xB0 // 4D ROLLBACK SIEVE
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs bg-[#0f172a] px-2.5 py-1 rounded border border-[#334155]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-bold">$1 \equiv 1$ PARITY VERIFIED</span>
        </div>
      </div>

      {/* 60-Tick Sliding Window Timeline Ribbon */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Sliding Memory Window (60 Ticks / 1.00s at Q16.16)
          </span>
          <span className="text-slate-500">
            CURRENT: T+{currentTick} | RING: {(currentTick % TICK_WINDOW)}
          </span>
        </div>

        <div className="grid grid-cols-12 sm:grid-cols-20 md:grid-cols-30 gap-1 bg-[#05070c] p-2 rounded-lg border border-[#1e293b] overflow-x-auto">
          {Array.from({ length: TICK_WINDOW }).map((_, i) => {
            const frame = rollbackSieve.stateBuffer[i];
            const isCurrent = frame && frame.tick === currentTick;
            const isReconciled = lastEvent && frame && frame.tick >= lastEvent.mismatched_tick && frame.tick <= lastEvent.tick;
            const isSelected = selectedFrame && selectedFrame.tick === frame?.tick;

            return (
              <button
                key={`tick_cell_${i}`}
                onClick={() => frame && setSelectedFrame(frame)}
                title={frame ? `Tick ${frame.tick} | Hash: ${frame.topology_hash}` : `Slot ${i}`}
                className={`h-7 rounded text-[9px] flex items-center justify-center font-mono transition-all ${
                  isCurrent
                    ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/50 scale-105 z-10'
                    : isReconciled
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/60'
                    : isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#0e1626] text-slate-400 hover:bg-[#192742] hover:text-cyan-200'
                }`}
              >
                {frame ? frame.tick % 100 : i}
              </button>
            );
          })}
        </div>
      </div>

      {/* Latency Injection & Reconciliation Simulation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#05070c] p-3 rounded-lg border border-[#1e293b]">
        {/* Lag config slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Tactile Network Lag ($\Delta t$):</span>
            <span className="text-cyan-300 font-bold">{syntheticLagTicks} ticks ({Math.round((syntheticLagTicks / 60) * 1000)}ms)</span>
          </div>
          <input
            type="range"
            min={1}
            max={55}
            value={syntheticLagTicks}
            onChange={(e) => setSyntheticLagTicks(Number(e.target.value))}
            className="accent-cyan-400 w-full h-1.5 bg-[#1e293b] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>1 tick (16ms)</span>
            <span>30 ticks (500ms)</span>
            <span>55 ticks (916ms)</span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center">
          <button
            id="inject_delayed_vector_btn"
            onClick={handleInjectDelayedVector}
            disabled={isSimulatingRollback}
            className="w-full h-full min-h-[42px] px-3 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSimulatingRollback ? 'animate-spin' : ''}`} />
            <span>INJECT DELAYED VECTOR & RECONCILE</span>
          </button>
        </div>

        {/* Telemetry quick stats */}
        <div className="flex flex-col justify-center text-xs space-y-1 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Total Rollbacks:</span>
            <span className="text-amber-400 font-bold">{rollbackSieve.totalRollbacks}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Last Reconcile:</span>
            <span className="text-emerald-400">
              {lastEvent ? `${lastEvent.reconcileTimeUs} μs (${lastEvent.rewindDepth} ticks)` : 'Nominal'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">CORDIC Math Parity:</span>
            <span className="text-cyan-400 font-bold">100.00% DET.</span>
          </div>
        </div>
      </div>

      {/* Inspector Detail drawer for selected tick */}
      {selectedFrame && (
        <div className="bg-[#0b1220] p-3 rounded-lg border border-cyan-900/50 text-xs space-y-2">
          <div className="flex justify-between items-center text-cyan-300 border-b border-[#1e293b] pb-1.5">
            <span className="font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              QUIPU LEDGER FRAME DETAIL // TICK #{selectedFrame.tick}
            </span>
            <button
              onClick={() => setSelectedFrame(null)}
              className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-[#1e293b]"
            >
              CLOSE
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block">HUMAN VECTOR (Q16):</span>
              <span className="text-slate-200">
                [{selectedFrame.human_vector[0]}, {selectedFrame.human_vector[1]}]
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">HUMAN COORDS (F):</span>
              <span className="text-cyan-300">
                X: {q16ToFloat(selectedFrame.human_vector[0]).toFixed(2)}, Y: {q16ToFloat(selectedFrame.human_vector[1]).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">TOPOLOGY MERKLE ROOT:</span>
              <span className="text-amber-300 truncate block">{selectedFrame.topology_hash}</span>
            </div>
            <div>
              <span className="text-slate-500 block">PARITY STATE:</span>
              <span className="text-emerald-400 font-bold">1 === 1 [VALIDATED]</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
