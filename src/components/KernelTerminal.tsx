/**
 * KernelTerminal: Ring-0 Bare-Metal Console & Organelle Code Inspector
 * Integrates covalent_4d_rollback.c and node_0xVECTOR_TETHER.ts with live registers.
 */

import React, { useState } from 'react';
import { Terminal, Code, Cpu, ShieldCheck, Database, FileText } from 'lucide-react';
import { Entity } from '../types';
import { floatToQ16 } from '../engine/q16';

interface KernelTerminalProps {
  currentTick: number;
  merkleRoot: string;
  human: Entity;
  be: Entity;
}

export const KernelTerminal: React.FC<KernelTerminalProps> = ({
  currentTick,
  merkleRoot,
  human,
  be
}) => {
  const [activeTab, setActiveTab] = useState<'C_KERNEL' | 'TS_TETHER' | 'QUIPU_LEDGER'>('C_KERNEL');

  return (
    <div className="bg-[#090d16] border border-[#1e293b] rounded-xl p-4 flex flex-col gap-3 font-mono shadow-xl text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-wider text-cyan-400">
            BARE-METAL RING-0 // ORGANELLE SOURCE
          </h2>
        </div>
        {/* Tab switcher */}
        <div className="flex gap-1 bg-[#05070c] p-1 rounded-lg border border-[#1e293b] text-xs">
          <button
            onClick={() => setActiveTab('C_KERNEL')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'C_KERNEL'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            covalent_4d_rollback.c
          </button>
          <button
            onClick={() => setActiveTab('TS_TETHER')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'TS_TETHER'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            node_0xVECTOR_TETHER.ts
          </button>
          <button
            onClick={() => setActiveTab('QUIPU_LEDGER')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'QUIPU_LEDGER'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            quipu_ledger.h
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="bg-[#05070c] rounded-lg p-3 border border-[#1e293b] text-xs overflow-x-auto max-h-56 leading-relaxed">
        {activeTab === 'C_KERNEL' && (
          <pre className="text-slate-300">
            <span className="text-slate-500">/* kernel/covalent_4d_rollback.c */</span>{'\n'}
            <span className="text-slate-500">/* Target: Zero-Latency Deterministic P2P Sparring */</span>{'\n'}
            <span className="text-purple-400">#include</span> <span className="text-emerald-400">"covalent_quipu_ledger.h"</span>{'\n\n'}
            <span className="text-purple-400">#define</span> <span className="text-amber-400">TICK_WINDOW</span> 60 <span className="text-slate-500">// 1 second of sliding Q16.16 history</span>{'\n\n'}
            <span className="text-blue-400">typedef struct</span> {'{'}{'\n'}
            {'    '}<span className="text-cyan-400">q16_t</span> human_vector[3]; <span className="text-slate-500">// LIVE: [{floatToQ16(human.x)}, {floatToQ16(human.y)}, {floatToQ16(human.vx)}]</span>{'\n'}
            {'    '}<span className="text-cyan-400">q16_t</span> be_vector[3];    <span className="text-slate-500">// LIVE: [{floatToQ16(be.x)}, {floatToQ16(be.y)}, {floatToQ16(be.vx)}]</span>{'\n'}
            {'    '}<span className="text-cyan-400">uint32_t</span> topology_hash; <span className="text-slate-500">// MERKLE: {merkleRoot}</span>{'\n'}
            {'}'} <span className="text-yellow-400">rollback_frame_t</span>;{'\n\n'}
            <span className="text-yellow-400">rollback_frame_t</span> state_buffer[<span className="text-amber-400">TICK_WINDOW</span>];{'\n\n'}
            <span className="text-blue-400">void</span> <span className="text-emerald-400 font-bold">sys_covalent_reconcile_timeline</span>(<span className="text-cyan-400">uint32_t</span> mismatched_tick, <span className="text-cyan-400">q16_t</span> delayed_input[3]) {'{'}{'\n'}
            {'    '}<span className="text-slate-500">// 1. Rewind Quipu Ledger to the exact moment of divergence</span>{'\n'}
            {'    '}<span className="text-cyan-300">sys_covalent_quipu_restore</span>(state_buffer[mismatched_tick].topology_hash);{'\n\n'}
            {'    '}<span className="text-slate-500">// 2. Inject the delayed vector</span>{'\n'}
            {'    '}state_buffer[mismatched_tick].human_vector = delayed_input;{'\n\n'}
            {'    '}<span className="text-slate-500">// 3. Fast-forward simulation to current tick via pure CORDIC math</span>{'\n'}
            {'    '}<span className="text-purple-400">for</span> (<span className="text-cyan-400">uint32_t</span> t = mismatched_tick; t &lt; current_tick; t++) {'{'}{'\n'}
            {'        '}<span className="text-cyan-300">sys_covalent_tick_p2p_manifold</span>(state_buffer[t].human_vector, state_buffer[t].be_vector);{'\n'}
            {'    '}{'}'}{'\n'}
            {'}'}
          </pre>
        )}

        {activeTab === 'TS_TETHER' && (
          <pre className="text-slate-300">
            <span className="text-slate-500">// node_0xVECTOR_TETHER.ts</span>{'\n'}
            <span className="text-purple-400">export class</span> <span className="text-yellow-400">CyberAthleticTethering</span> {'{'}{'\n'}
            {'    '}<span className="text-purple-400">public</span> <span className="text-emerald-400 font-bold">applyKineticShear</span>(sourceId: <span className="text-cyan-400">string</span>, targetSplineId: <span className="text-cyan-400">string</span>, forceVector: <span className="text-cyan-400">Q16Vector</span>): <span className="text-cyan-400">void</span> {'{'}{'\n'}
            {'        '}console.log(<span className="text-emerald-300">`[ KINETIC SHEAR ] Tether attached to topological spline.`</span>);{'\n\n'}
            {'        '}<span className="text-slate-500">// Calculate the thermodynamic cost of deforming the arena</span>{'\n'}
            {'        '}<span className="text-blue-400">const</span> frictionCost = <span className="text-cyan-300">sys_covalent_calculate_deformation_mass</span>(targetSplineId, forceVector);{'\n\n'}
            {'        '}<span className="text-purple-400">if</span> (<span className="text-cyan-300">sys_covalent_deduct_energy</span>(sourceId, frictionCost)) {'{'}{'\n'}
            {'            '}<span className="text-slate-500">// Morph the arena geometry in real-time</span>{'\n'}
            {'            '}<span className="text-cyan-300">sys_covalent_deform_bezier_hull</span>(targetSplineId, forceVector);{'\n'}
            {'            '}<span className="text-cyan-300">sys_covalent_recalculate_bvh</span>();{'\n'}
            {'        '}{'}'} <span className="text-purple-400">else</span> {'{'}{'\n'}
            {'            '}console.warn(<span className="text-rose-400">`[ THERMODYNAMIC BANKRUPTCY ] Entity ${'{'}sourceId{'}'} forced into penalty stasis.`</span>);{'\n'}
            {'            '}<span className="text-cyan-300">sys_covalent_apply_stasis_lock</span>(sourceId, 180); <span className="text-slate-500">// 3-second penalty</span>{'\n'}
            {'        '}{'}'}{'\n'}
            {'    '}{'}'}{'\n'}
            {'}'}
          </pre>
        )}

        {activeTab === 'QUIPU_LEDGER' && (
          <pre className="text-slate-300">
            <span className="text-slate-500">/* kernel/covalent_quipu_ledger.h */</span>{'\n'}
            <span className="text-purple-400">#ifndef</span> COVALENT_QUIPU_LEDGER_H{'\n'}
            <span className="text-purple-400">#define</span> COVALENT_QUIPU_LEDGER_H{'\n\n'}
            <span className="text-slate-500">/* Invariant: 1 === 1 (Absolute Mathematical Parity) */</span>{'\n'}
            <span className="text-slate-500">/* Merkle tree verification of spline arena topological bounds */</span>{'\n\n'}
            <span className="text-cyan-400">uint32_t</span> <span className="text-emerald-400 font-bold">sys_covalent_quipu_snapshot_root</span>(<span className="text-blue-400">void</span>);{'\n'}
            <span className="text-blue-400">void</span>     <span className="text-emerald-400 font-bold">sys_covalent_quipu_restore</span>(<span className="text-cyan-400">uint32_t</span> root_hash);{'\n'}
            <span className="text-cyan-400">bool</span>     <span className="text-emerald-400 font-bold">sys_covalent_verify_parity</span>(<span className="text-cyan-400">q16_t</span> val_a, <span className="text-cyan-400">q16_t</span> val_b);{'\n\n'}
            <span className="text-slate-500">// Quipu Merkle Root:</span> <span className="text-amber-400 font-bold">{merkleRoot}</span>{'\n'}
            <span className="text-slate-500">// Ring-0 State Parity:</span> <span className="text-emerald-400 font-bold">$1 \equiv 1$ (NOMINAL)</span>{'\n'}
            <span className="text-purple-400">#endif</span>
          </pre>
        )}
      </div>
    </div>
  );
};
