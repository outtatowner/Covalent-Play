/**
 * KernelTerminal: Ring-0 Bare-Metal Console & Organelle Code Inspector
 * Integrates:
 * - Organelle 0xB0: covalent_4d_rollback.c
 * - Organelle 0xB1: node_0xVECTOR_TETHER.ts
 * - Organelle 0xB2: covalent_arena_materials.c & node_0xARENA_SYNTHESIZER.ts
 * - quipu_ledger.h
 */

import React, { useState } from 'react';
import { Terminal, Code, Cpu, ShieldCheck, Database, Layers } from 'lucide-react';
import { Entity } from '../types';
import { floatToQ16 } from '../engine/q16';

interface KernelTerminalProps {
  currentTick: number;
  merkleRoot: string;
  human: Entity;
  be: Entity;
}

type TabType = 'B2_MATERIALS' | 'B2_SYNTHESIZER' | 'C_KERNEL' | 'TS_TETHER' | 'QUIPU_LEDGER';

export const KernelTerminal: React.FC<KernelTerminalProps> = ({
  currentTick,
  merkleRoot,
  human,
  be
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('B2_MATERIALS');

  return (
    <div className="bg-[#090d16] border border-[#1e293b] rounded-xl p-4 flex flex-col gap-3 font-mono shadow-xl text-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-wider text-cyan-400">
            BARE-METAL RING-0 // ORGANELLE SOURCE
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            0xB2 COVALENT ACTIVE
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-1 bg-[#05070c] p-1 rounded-lg border border-[#1e293b] text-xs">
          <button
            onClick={() => setActiveTab('B2_MATERIALS')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'B2_MATERIALS'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            covalent_arena_materials.c
          </button>
          <button
            onClick={() => setActiveTab('B2_SYNTHESIZER')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'B2_SYNTHESIZER'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            node_0xARENA_SYNTHESIZER.ts
          </button>
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
      <div className="bg-[#05070c] rounded-lg p-3 border border-[#1e293b] text-xs overflow-x-auto max-h-60 leading-relaxed font-mono">
        {activeTab === 'B2_MATERIALS' && (
          <pre className="text-slate-300">
            <span className="text-slate-500">/* kernel/covalent_arena_materials.c */</span>{'\n'}
            <span className="text-slate-500">/* Target: Baseline Q16.16 Vector Grid Generation */</span>{'\n'}
            <span className="text-purple-400">#include</span> <span className="text-emerald-400">"covalent_rt_engine.h"</span>{'\n\n'}
            <span className="text-slate-500">// Generates the reactive floor grid</span>{'\n'}
            <span className="text-blue-400">void</span> <span className="text-emerald-400 font-bold">sys_covalent_init_kinetic_grid</span>() {'{'}{'\n'}
            {'    '}<span className="text-slate-500">// Base reflective manifold</span>{'\n'}
            {'    '}<span className="text-cyan-300">sys_covalent_set_global_albedo</span>(<span className="text-amber-400">0x00000000</span>); <span className="text-slate-500">// Pure black</span>{'\n'}
            {'    '}<span className="text-cyan-300">sys_covalent_set_global_roughness</span>(<span className="text-amber-400">0x00000000</span>); <span className="text-slate-500">// Perfect mirror</span>{'\n\n'}
            {'    '}<span className="text-slate-500">// Emissive parametric lines driven by thermodynamic mass</span>{'\n'}
            {'    '}<span className="text-purple-400">for</span>(<span className="text-cyan-400">q16_t</span> x = -ARENA_BOUNDS; x &lt; ARENA_BOUNDS; x += <span className="text-amber-400">0x00100000</span>) {'{'}{'\n'}
            {'        '}<span className="text-cyan-300">sys_covalent_draw_emissive_spline</span>(x, -ARENA_BOUNDS, x, ARENA_BOUNDS, COLOR_CYAN_BASE);{'\n'}
            {'    '}{'}'}{'\n'}
            {'}'}{'\n\n'}
            <span className="text-slate-500">// Spawns the deformable boundary splines</span>{'\n'}
            <span className="text-cyan-400">uint32_t</span> <span className="text-emerald-400 font-bold">sys_covalent_spawn_tensile_bounds</span>(<span className="text-cyan-400">q16_t</span> radius) {'{'}{'\n'}
            {'    '}<span className="text-slate-500">// 8 control points defining a circular vector cage</span>{'\n'}
            {'    '}<span className="text-cyan-400">q16_t</span> control_points[<span className="text-amber-400">8</span>][<span className="text-amber-400">2</span>] = <span className="text-cyan-300">sys_covalent_calculate_octagon_splines</span>(radius);{'\n\n'}
            {'    '}<span className="text-slate-500">// Bind to the BVH as a dynamic, morphable hull</span>{'\n'}
            {'    '}<span className="text-purple-400">return</span> <span className="text-cyan-300">sys_covalent_spawn_vector_hull</span>(control_points, MATERIAL_TRANSLUCENT_GLASS);{'\n'}
            {'}'}
          </pre>
        )}

        {activeTab === 'B2_SYNTHESIZER' && (
          <pre className="text-slate-300">
            <span className="text-slate-500">// node_0xARENA_SYNTHESIZER.ts</span>{'\n'}
            <span className="text-purple-400">export class</span> <span className="text-yellow-400">CyberArenaSynthesizer</span> {'{'}{'\n'}
            {'    '}<span className="text-purple-400">public</span> <span className="text-emerald-400 font-bold">generateBaselineGrid</span>(): <span className="text-cyan-400">void</span> {'{'}{'\n'}
            {'        '}console.log(<span className="text-emerald-300">`[ FORGE ] Synthesizing The Null-Friction Octagon...`</span>);{'\n\n'}
            {'        '}<span className="text-slate-500">// 1. Establish the absolute thermodynamic boundary</span>{'\n'}
            {'        '}<span className="text-cyan-300">sys_covalent_spawn_tensile_bounds</span>(<span className="text-amber-400">0x04000000</span>); <span className="text-slate-500">// 64-unit radius Q16.16</span>{'\n\n'}
            {'        '}<span className="text-slate-500">// 2. Ignite the reactive kinetic floor</span>{'\n'}
            {'        '}<span className="text-cyan-300">sys_covalent_init_kinetic_grid</span>();{'\n\n'}
            {'        '}<span className="text-slate-500">// 3. Spawn 4 Thermodynamic Wells (Lissajous Anchors)</span>{'\n'}
            {'        '}<span className="text-cyan-300">sys_covalent_spawn_energy_well</span>(<span className="text-amber-400">0x02000000</span>, <span className="text-amber-400">0x02000000</span>);{'\n'}
            {'        '}<span className="text-cyan-300">sys_covalent_spawn_energy_well</span>(-<span className="text-amber-400">0x02000000</span>, <span className="text-amber-400">0x02000000</span>);{'\n'}
            {'        '}<span className="text-cyan-300">sys_covalent_spawn_energy_well</span>(<span className="text-amber-400">0x02000000</span>, -<span className="text-amber-400">0x02000000</span>);{'\n'}
            {'        '}<span className="text-cyan-300">sys_covalent_spawn_energy_well</span>(-<span className="text-amber-400">0x02000000</span>, -<span className="text-amber-400">0x02000000</span>);{'\n\n'}
            {'        '}console.log(<span className="text-emerald-300">`[ 1 === 1 ] Arena topology locked. Ready for tether injection.`</span>);{'\n'}
            {'    '}{'}'}{'\n'}
            {'}'}
          </pre>
        )}

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
