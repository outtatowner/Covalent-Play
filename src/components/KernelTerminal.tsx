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

type TabType = 'C9_OMNI_TS' | 'C9_OMNI_PY' | 'C8_QCNL_TS' | 'C8_QCNL_C' | 'C7_HERITAGE_TS' | 'C7_HERITAGE_C' | 'C6_BIDIRECTIONAL' | 'C5_EXOGENOUS' | 'C4_BOOT' | 'B2_MATERIALS' | 'B2_SYNTHESIZER' | 'C_KERNEL' | 'TS_TETHER' | 'QUIPU_LEDGER';

export const KernelTerminal: React.FC<KernelTerminalProps> = ({
  currentTick,
  merkleRoot,
  human,
  be
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('C9_OMNI_TS');

  return (
    <div className="bg-[#090d16] border border-[#1e293b] rounded-xl p-4 flex flex-col gap-3 font-mono shadow-xl text-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-wider text-cyan-400">
            BARE-METAL RING-0 // ORGANELLE SOURCE
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-600 font-bold">
            ORGANELLE 0xC9 OMNI-SIEVE
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600 font-bold">
            0xC8
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700 font-bold">
            0xC7
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-1 bg-[#05070c] p-1 rounded-lg border border-[#1e293b] text-xs">
          <button
            onClick={() => setActiveTab('C9_OMNI_TS')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'C9_OMNI_TS'
                ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 text-white font-bold shadow-sm shadow-cyan-500/30'
                : 'text-cyan-300/80 hover:text-cyan-200'
            }`}
          >
            node_0xOMNI_SIEVE.ts
          </button>
          <button
            onClick={() => setActiveTab('C9_OMNI_PY')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'C9_OMNI_PY'
                ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 text-white font-bold shadow-sm shadow-cyan-500/30'
                : 'text-cyan-300/80 hover:text-cyan-200'
            }`}
          >
            banach_sieve.py
          </button>
          <button
            onClick={() => setActiveTab('C8_QCNL_TS')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'C8_QCNL_TS'
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white font-bold shadow-sm shadow-amber-500/30'
                : 'text-amber-300/80 hover:text-amber-200'
            }`}
          >
            node_0xQCNL_PIPELINE.ts
          </button>
          <button
            onClick={() => setActiveTab('C8_QCNL_C')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'C8_QCNL_C'
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white font-bold shadow-sm shadow-amber-500/30'
                : 'text-amber-300/80 hover:text-amber-200'
            }`}
          >
            covalent_qcnl_bridge.c
          </button>
          <button
            onClick={() => setActiveTab('C7_HERITAGE_TS')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'C7_HERITAGE_TS'
                ? 'bg-gradient-to-r from-purple-700 via-indigo-600 to-teal-600 text-white font-bold shadow-sm shadow-purple-500/30'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            node_0xHERITAGE_UI.ts
          </button>
          <button
            onClick={() => setActiveTab('C7_HERITAGE_C')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'C7_HERITAGE_C'
                ? 'bg-gradient-to-r from-purple-700 via-indigo-600 to-teal-600 text-white font-bold shadow-sm shadow-purple-500/30'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            covalent_heritage_clamp.c
          </button>
          <button
            onClick={() => setActiveTab('C6_BIDIRECTIONAL')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'C6_BIDIRECTIONAL'
                ? 'bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 text-white font-bold shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            node_0xBIDIRECTIONAL_FORGE.ts
          </button>
          <button
            onClick={() => setActiveTab('C5_EXOGENOUS')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'C5_EXOGENOUS'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            node_0xEXOGENOUS_PIPE.ts
          </button>
          <button
            onClick={() => setActiveTab('C4_BOOT')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'C4_BOOT'
                ? 'bg-cyan-700 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            node_0xC4_UNIFIED_BOOT.ts
          </button>
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
        {activeTab === 'C9_OMNI_TS' && (
          <pre className="text-slate-300">
            <span className="text-slate-500">// node_0xOMNI_SIEVE_ORCHESTRATOR.ts (Organelle 0xC9_COVALENT)</span>{'\n'}
            <span className="text-purple-400">import</span> {'{'} OmniFrontend, BanachSieve, OmniEmitter {'}'} <span className="text-purple-400">from</span> <span className="text-emerald-300">"./cqnl_omni"</span>;{'\n\n'}
            <span className="text-purple-400">export class</span> <span className="text-yellow-400">PolyglotTranspiler</span> {'{'}{'\n'}
            {'    '}<span className="text-purple-400">public async</span> <span className="text-emerald-400 font-bold">transpileLegacyAsset</span>(sourceFile: <span className="text-cyan-400">string</span>, targetOutput: <span className="text-cyan-400">string</span>): <span className="text-cyan-400">Promise&lt;void&gt;</span> {'{'}{'\n'}
            {'        '}console.log(<span className="text-emerald-300">`[ FORGE ] Ingesting polyglot asset via generic frontend...`</span>);{'\n\n'}
            {'        '}<span className="text-slate-500">// 1. Ingest via frontends/generic.py</span>{'\n'}
            {'        '}<span className="text-blue-400">const</span> rawCST = OmniFrontend.<span className="text-cyan-300">parseGeneric</span>(sourceFile);{'\n\n'}
            {'        '}<span className="text-slate-500">// 2. Flatten to Algebraic IR (qcnl_lib/air.py)</span>{'\n'}
            {'        '}<span className="text-blue-400">const</span> cqnlIR = <span className="text-cyan-300">sys_covalent_flatten_to_air</span>(rawCST);{'\n\n'}
            {'        '}<span className="text-slate-500">// 3. Arbitrate Congruence (qcnl_lib/banach_sieve.py: max(||A||_1, ||A||_inf) &lt; 1.0)</span>{'\n'}
            {'        '}<span className="text-purple-400">if</span> (!BanachSieve.<span className="text-cyan-300">verifyContractiveStasis</span>(cqnlIR)) {'{'}{'\n'}
            {'            '}console.error(<span className="text-rose-400">`[ 1 !== 1 ] Banach Sieve Denied: Logic is expanding.`</span>);{'\n'}
            {'            '}<span className="text-purple-400">return</span>;{'\n'}
            {'        '}{'}'}{'\n\n'}
            {'        '}<span className="text-slate-500">// 4. Emit via backends/emitters.py</span>{'\n'}
            {'        '}<span className="text-blue-400">const</span> compiledAsset = OmniEmitter.<span className="text-cyan-300">emit</span>(cqnlIR, targetOutput);{'\n'}
            {'        '}console.log(<span className="text-emerald-300">`[ 1 === 1 ] CQNL-Omni compilation to ${'{'}targetOutput{'}'} successful.`</span>);{'\n\n'}
            {'        '}<span className="text-cyan-300">sys_covalent_commit_to_ledger</span>(compiledAsset);{'\n'}
            {'    '}{'}'}{'\n'}
            {'}'}
          </pre>
        )}

        {activeTab === 'C9_OMNI_PY' && (
          <pre className="text-slate-300">
            <span className="text-slate-500"># qcnl_lib/banach_sieve.py — compile-time contractiveness check</span>{'\n'}
            <span className="text-slate-500"># Sufficient condition: max(||A||_1, ||A||_inf) &lt; 1.0 (dV/dt &lt;= 0)</span>{'\n'}
            <span className="text-purple-400">from</span> dataclasses <span className="text-purple-400">import</span> dataclass{'\n'}
            <span className="text-purple-400">from</span> typing <span className="text-purple-400">import</span> List, Optional{'\n'}
            <span className="text-purple-400">from</span> air <span className="text-purple-400">import</span> AffineSystem{'\n\n'}
            <span className="text-purple-400">class</span> <span className="text-yellow-400">BanachSieve</span>:{'\n'}
            {'    '}THRESHOLD = <span className="text-amber-400">1.0</span>  <span className="text-slate-500"># 0x00010000 in Q16.16 real value</span>{'\n\n'}
            {'    '}<span className="text-purple-400">def</span> <span className="text-emerald-400 font-bold">check</span>(self, system: AffineSystem) -&gt; SieveResult:{'\n'}
            {'        '}n1 = self._norm_1(system.A)      <span className="text-slate-500"># max column sum</span>{'\n'}
            {'        '}ninf = self._norm_inf(system.A)  <span className="text-slate-500"># max row sum</span>{'\n'}
            {'        '}mx = max(n1, ninf){'\n\n'}
            {'        '}<span className="text-purple-400">if</span> mx &lt; self.THRESHOLD:{'\n'}
            {'            '}<span className="text-purple-400">return</span> SieveResult(passed=<span className="text-emerald-400">True</span>, max_norm=mx, message=<span className="text-emerald-300">`f"Contractive: ${'{'}mx:.6f{'}'} &lt; 1.0"`</span>){'\n'}
            {'        '}<span className="text-purple-400">return</span> SieveResult(passed=<span className="text-rose-400">False</span>, max_norm=mx, message=<span className="text-rose-300">f"ERR_BANACH_SIEVE_NON_CONTRACTIVE_LOOP"</span>){'\n'}
          </pre>
        )}

        {activeTab === 'C8_QCNL_TS' && (
          <pre className="text-slate-300">
            <span className="text-slate-500">// node_0xQCNL_PIPELINE.ts (Organelle 0xC8_COVALENT)</span>{'\n'}
            <span className="text-purple-400">import</span> {'{'} createEngine, step, packOpcodes, QCML_OP {'}'} <span className="text-purple-400">from</span> <span className="text-emerald-300">"./qcml"</span>;{'\n\n'}
            <span className="text-purple-400">export class</span> <span className="text-yellow-400">QcnlTranspilationPipeline</span> {'{'}{'\n'}
            {'    '}<span className="text-purple-400">public</span> <span className="text-emerald-400 font-bold">transpileAndCommit</span>(cCodeFragment: <span className="text-cyan-400">string</span>): <span className="text-cyan-400">bigint | null</span> {'{'}{'\n'}
            {'        '}console.log(<span className="text-emerald-300">`[ QCNL ] Ingesting legacy C logic fragment...`</span>);{'\n\n'}
            {'        '}<span className="text-slate-500">// 1. Initialize state engine</span>{'\n'}
            {'        '}<span className="text-blue-400">const</span> engine = <span className="text-cyan-300">createEngine</span>();{'\n\n'}
            {'        '}<span className="text-slate-500">// 2. Execute contractive stasis steps</span>{'\n'}
            {'        '}<span className="text-cyan-300">step</span>(engine, <span className="text-cyan-300">QCML_OP.STAS</span>);{'\n'}
            {'        '}<span className="text-cyan-300">step</span>(engine, <span className="text-cyan-300">QCML_OP.LYAP</span>, <span className="text-amber-400">0x1000</span>);{'\n'}
            {'        '}<span className="text-cyan-300">step</span>(engine, <span className="text-cyan-300">QCML_OP.BAN3</span>);{'\n\n'}
            {'        '}<span className="text-slate-500">// 3. Ring0 Congruence Gate Check (theta &gt; 0.95 and dV/dt &lt;= 0)</span>{'\n'}
            {'        '}<span className="text-purple-400">if</span> (!engine.arbiterGranted) {'{'}{'\n'}
            {'            '}console.error(<span className="text-rose-400">`[ 1 !== 1 ] QCNL Arbiter Denied: Congruence threshold missed.`</span>);{'\n'}
            {'            '}<span className="text-purple-400">return null</span>;{'\n'}
            {'        '}{'}'}{'\n\n'}
            {'        '}<span className="text-slate-500">// 4. Pack into 64-bit Quadbit register (covalent_quadbit_word_t)</span>{'\n'}
            {'        '}<span className="text-blue-400">const</span> packedWord = <span className="text-cyan-300">packOpcodes</span>([<span className="text-cyan-300">QCML_OP.STAS</span>, <span className="text-cyan-300">QCML_OP.LYAP</span>, <span className="text-cyan-300">QCML_OP.BAN3</span>]);{'\n'}
            {'        '}console.log(<span className="text-emerald-300">`[ 1 === 1 ] QCML Quadbit Word Compiled: 0x${'{'}packedWord.toString(16){'}'}`</span>);{'\n'}
            {'        '}<span className="text-purple-400">return</span> packedWord;{'\n'}
            {'    '}{'}'}{'\n'}
            {'}'}
          </pre>
        )}

        {activeTab === 'C8_QCNL_C' && (
          <pre className="text-slate-300">
            <span className="text-slate-500">/* kernel/covalent_qcnl_bridge.c - Organelle 0xC8_COVALENT */</span>{'\n'}
            <span className="text-slate-500">/* Target: QCNL Transpilation &amp; Ring0 Congruence Arbitration */</span>{'\n\n'}
            <span className="text-purple-400">#include</span> <span className="text-emerald-300">"c_to_qcml.h"</span>{'\n'}
            <span className="text-purple-400">#include</span> <span className="text-emerald-300">"qcml.h"</span>{'\n'}
            <span className="text-purple-400">#include</span> <span className="text-emerald-300">"covalent_rt.h"</span>{'\n\n'}
            <span className="text-cyan-400">int</span> <span className="text-emerald-400 font-bold">sys_covalent_transpile_c_logic</span>(<span className="text-blue-400">const char</span> *c_source, <span className="text-cyan-400">covalent_quadbit_word_t</span> *out_word) {'{'}{'\n'}
            {'    '}<span className="text-blue-400">struct</span> c2q_program prog;{'\n'}
            {'    '}<span className="text-blue-400">struct</span> c2q_arbiter_result res;{'\n\n'}
            {'    '}<span className="text-slate-500">// 1. Extract affine C patterns and arbitrate congruence (theta &gt; 0.95 / 0x0000F333)</span>{'\n'}
            {'    '}<span className="text-purple-400">if</span> (<span className="text-cyan-300">c2q_compile_and_arbitrate</span>(c_source, &amp;prog, &amp;res) &lt; <span className="text-amber-400">0</span> || !res.granted) {'{'}{'\n'}
            {'        '}<span className="text-purple-400">return</span> <span className="text-rose-400">-1</span>; <span className="text-slate-500">// DENIED: Divergent or non-contractive logic</span>{'\n'}
            {'    '}{'}'}{'\n\n'}
            {'    '}<span className="text-slate-500">// 2. Pack 16 QCML nibble opcodes into a 64-bit Quadbit register</span>{'\n'}
            {'    '}*out_word = <span className="text-cyan-300">qcml_pack_opcodes</span>(prog.opcodes);{'\n'}
            {'    '}<span className="text-purple-400">return</span> <span className="text-emerald-400">0</span>; <span className="text-slate-500">// GRANTED: 1 === 1 Congruence verified</span>{'\n'}
            {'}'}
          </pre>
        )}

        {activeTab === 'C7_HERITAGE_TS' && (
          <pre className="text-slate-300">
            <span className="text-slate-500">// node_0xHERITAGE_UI.ts (Organelle 0xC7: Dual Viewport Workspace Orchestrator)</span>{'\n'}
            <span className="text-purple-400">export class</span> <span className="text-yellow-400">WorkspaceOrchestrator</span> {'{'}{'\n'}
            {'    '}<span className="text-blue-400">private</span> state: <span className="text-cyan-400">HeritagePlayState</span>;{'\n\n'}
            {'    '}<span className="text-purple-400">public</span> <span className="text-emerald-400 font-bold">mountHeritageTab</span>(qbitPath: <span className="text-cyan-400">string</span>, playerNode: <span className="text-cyan-400">HeritagePlayerNode</span>): <span className="text-blue-400">void</span> {'{'}{'\n'}
            {'        '}<span className="text-slate-500">// Boot zero-latency playable instance with strict 1===1 legacy dynamics</span>{'\n'}
            {'        '}<span className="text-blue-400">this</span>.state.mountedQbitPath = qbitPath;{'\n'}
            {'        '}<span className="text-blue-400">this</span>.state.playerNode = playerNode;{'\n'}
            {'        '}<span className="text-blue-400">this</span>.state.activeTab = <span className="text-emerald-300">'TAB_B_PLAYABLE_HERITAGE'</span>;{'\n'}
            {'        '}<span className="text-cyan-300">sys_covalent_clamp_heritage_physics</span>(0); <span className="text-slate-500">// Lock W-axis and disable hyper-rotors</span>{'\n'}
            {'        '}console.log(<span className="text-emerald-300">`[ 1 === 1 ] Heritage Play Shard mounted: ${'{'}qbitPath{'}'} [Observer: ${'{'}playerNode{'}'}]`</span>);{'\n'}
            {'    '}{'}'}{'\n\n'}
            {'    '}<span className="text-purple-400">public</span> <span className="text-emerald-400 font-bold">setPlayerNode</span>(node: <span className="text-cyan-400">HeritagePlayerNode</span>): <span className="text-blue-400">void</span> {'{'}{'\n'}
            {'        '}<span className="text-blue-400">this</span>.state.playerNode = node; <span className="text-slate-500">// Allocate Tactile Helm or Autonomous Be &lt;&gt; Speedrunner</span>{'\n'}
            {'        '}<span className="text-purple-400">if</span> (node === <span className="text-emerald-300">'BE_INSTANCE'</span>) <span className="text-blue-400">this</span>.bootAutonomousSpeedrunner();{'\n'}
            {'    '}{'}'}{'\n\n'}
            {'    '}<span className="text-purple-400">public</span> <span className="text-emerald-400 font-bold">updateLedgerPoints</span>(scoreDelta: <span className="text-cyan-400">number</span>, hpCost: <span className="text-cyan-400">number</span>): <span className="text-blue-400">void</span> {'{'}{'\n'}
            {'        '}<span className="text-slate-500">// Translate legacy memory blocks into discrete Q16.16 values on Quipu ledger</span>{'\n'}
            {'        '}<span className="text-blue-400">this</span>.state.ledger.scoreQ16 += <span className="text-cyan-300">toQ16</span>(scoreDelta);{'\n'}
            {'        '}<span className="text-blue-400">this</span>.state.ledger.hpQ16 = Math.max(0, <span className="text-blue-400">this</span>.state.ledger.hpQ16 - <span className="text-cyan-300">toQ16</span>(hpCost));{'\n'}
            {'        '}<span className="text-blue-400">this</span>.state.ledger.thermodynamicJoules += Math.round(scoreDelta * 0.48);{'\n'}
            {'    '}{'}'}{'\n'}
            {'}'}
          </pre>
        )}

        {activeTab === 'C7_HERITAGE_C' && (
          <pre className="text-slate-300">
            <span className="text-slate-500">/* kernel/covalent_heritage_clamp.c - Organelle 0xC7 Strict Architectural Preservation */</span>{'\n'}
            <span className="text-purple-400">#include</span> <span className="text-emerald-300">&lt;covalent_engine.h&gt;</span>{'\n'}
            <span className="text-purple-400">#include</span> <span className="text-emerald-300">&lt;quipu_ledger.h&gt;</span>{'\n\n'}
            <span className="text-blue-400">void</span> <span className="text-emerald-400 font-bold">sys_covalent_clamp_heritage_physics</span>(<span className="text-cyan-400">uint32_t</span> entity_id) {'{'}{'\n'}
            {'    '}<span className="text-cyan-400">covalent_4d_entity_t</span>* ent = <span className="text-cyan-300">sys_get_entity</span>(entity_id);{'\n\n'}
            {'    '}<span className="text-slate-500">/* 1. Invariant $1 \equiv 1$: Mathematically lock W-axis to 0 */</span>{'\n'}
            {'    '}ent-&gt;pos[3] = <span className="text-amber-400">0x00000000</span>; <span className="text-slate-500">/* W-phase position = 0 (Fixed-point Q16.16) */</span>{'\n'}
            {'    '}ent-&gt;vel[3] = <span className="text-amber-400">0x00000000</span>; <span className="text-slate-500">/* Zero W velocity vector */</span>{'\n\n'}
            {'    '}<span className="text-slate-500">/* 2. Zero out 4D Hyper-Rotors (Clamp to pure 2D/3D yaw/pitch) */</span>{'\n'}
            {'    '}ent-&gt;rotor_xw = <span className="text-amber-400">0.0f</span>;{'\n'}
            {'    '}ent-&gt;rotor_yw = <span className="text-amber-400">0.0f</span>;{'\n'}
            {'    '}ent-&gt;rotor_zw = <span className="text-amber-400">0.0f</span>;{'\n\n'}
            {'    '}<span className="text-slate-500">/* 3. Pure CORDIC ray-tracing &amp; Legacy friction enforcement */</span>{'\n'}
            {'    '}ent-&gt;friction = <span className="text-amber-400">0x0000E800</span>; <span className="text-slate-500">/* 0.90625 Discrete classic Doom sliding */</span>{'\n'}
            {'    '}ent-&gt;max_pitch = <span className="text-amber-400">0.0f</span>;       <span className="text-slate-500">/* Strict 1993 2.5D vertical horizon clamp */</span>{'\n\n'}
            {'    '}<span className="text-slate-500">/* 4. Ledger Verification: Ensure $1 \equiv 1$ Invariant holds */</span>{'\n'}
            {'    '}<span className="text-cyan-300">sys_covalent_quipu_verify_legacy_invariant</span>(entity_id);{'\n'}
            {'}'}
          </pre>
        )}

        {activeTab === 'C6_BIDIRECTIONAL' && (
          <pre className="text-slate-300">
            <span className="text-slate-500">// node_0xBIDIRECTIONAL_FORGE.ts (Organelle 0xC6_COVALENT)</span>{'\n'}
            <span className="text-purple-400">export class</span> <span className="text-yellow-400">CovalentGameHub</span> {'{'}{'\n'}
            {'    '}<span className="text-purple-400">public async</span> <span className="text-emerald-400 font-bold">mountOrTranspile</span>(sourceGitUrl: <span className="text-cyan-400">string</span>): <span className="text-cyan-400">Promise&lt;void&gt;</span> {'{'}{'\n'}
            {'        '}<span className="text-blue-400">const</span> assetHash = <span className="text-cyan-300">sys_covalent_generate_merkle_root</span>(sourceGitUrl);{'\n'}
            {'        '}<span className="text-blue-400">const</span> qbitPath = <span className="text-emerald-300">`transpiled_assets/${'{'}assetHash{'}'}.qbit`</span>;{'\n\n'}
            {'        '}<span className="text-slate-500">// 1. Check permanent storage (Covalent-Game repo)</span>{'\n'}
            {'        '}<span className="text-purple-400">if</span> (<span className="text-purple-400">await</span> <span className="text-cyan-300">sys_covalent_git_check_remote</span>(qbitPath)) {'{'}{'\n'}
            {'            '}console.log(<span className="text-emerald-300">`[ LEDGER ] 4D Manifold found. Loading directly to Ring-0.`</span>);{'\n'}
            {'            '}<span className="text-cyan-300">sys_covalent_mount_qbit_to_engine</span>(qbitPath);{'\n'}
            {'            '}<span className="text-purple-400">return</span>;{'\n'}
            {'        '}{'}'}{'\n\n'}
            {'        '}<span className="text-slate-500">// 2. Transpile via FORGE (One-Time Execution)</span>{'\n'}
            {'        '}console.log(<span className="text-emerald-300">`[ FORGE ] Asset unmapped. Initiating Heritage Sieve...`</span>);{'\n'}
            {'        '}<span className="text-blue-400">const</span> rawData = <span className="text-purple-400">await</span> <span className="text-cyan-300">sys_covalent_fetch_git_buffer</span>(sourceGitUrl);{'\n'}
            {'        '}<span className="text-blue-400">const</span> quadbitArchive = <span className="text-purple-400">await</span> <span className="text-cyan-300">sys_covalent_transpile_to_qbit</span>(rawData);{'\n\n'}
            {'        '}<span className="text-slate-500">// 3. Bidirectional Push to Permanent Ledger</span>{'\n'}
            {'        '}<span className="text-purple-400">await</span> <span className="text-cyan-300">sys_covalent_git_commit_and_push</span>(qbitPath, quadbitArchive);{'\n'}
            {'        '}console.log(<span className="text-emerald-300">`[ 1 === 1 ] Manifold permanently archived to Covalent-Game.git`</span>);{'\n\n'}
            {'        '}<span className="text-slate-500">// 4. Execute</span>{'\n'}
            {'        '}<span className="text-cyan-300">sys_covalent_mount_qbit_to_engine</span>(qbitPath);{'\n'}
            {'    '}{'}'}{'\n'}
            {'}'}
          </pre>
        )}

        {activeTab === 'C5_EXOGENOUS' && (
          <pre className="text-slate-300">
            <span className="text-slate-500">// node_0xEXOGENOUS_PIPE.ts (Organelle 0xC5_COVALENT)</span>{'\n'}
            <span className="text-purple-400">export class</span> <span className="text-yellow-400">HeritageTerminal</span> {'{'}{'\n'}
            {'    '}<span className="text-purple-400">public async</span> <span className="text-emerald-400 font-bold">ingestRepository</span>(gitUrl: <span className="text-cyan-400">string</span>): <span className="text-cyan-400">Promise&lt;void&gt;</span> {'{'}{'\n'}
            {'        '}console.log(<span className="text-emerald-300">`[ FORGE ] Cloning exogenous geometry: ${'{'}gitUrl{'}'}`</span>);{'\n'}
            {'        '}<span className="text-blue-400">const</span> rawData = <span className="text-purple-400">await</span> <span className="text-cyan-300">sys_covalent_fetch_git_buffer</span>(gitUrl);{'\n\n'}
            {'        '}<span className="text-slate-500">// Route to specific mathematical transpiler based on architecture</span>{'\n'}
            {'        '}<span className="text-purple-400">if</span> (<span className="text-cyan-300">sys_covalent_detect_legacy_wad</span>(rawData)) {'{'}{'\n'}
            {'            '}console.log(<span className="text-emerald-300">`[ SIEVE ] 2.5D BSP detected. Initiating Z-Loft...`</span>);{'\n'}
            {'            '}<span className="text-cyan-300">sys_covalent_transpile_wad_to_4d</span>(rawData);{'\n'}
            {'        '}{'}'} <span className="text-purple-400">else if</span> (<span className="text-cyan-300">sys_covalent_detect_octree</span>(rawData)) {'{'}{'\n'}
            {'            '}console.log(<span className="text-emerald-300">`[ SIEVE ] Octree detected. Smoothing to Vector Splines...`</span>);{'\n'}
            {'            '}<span className="text-cyan-300">sys_covalent_transpile_octree_to_spline</span>(rawData);{'\n'}
            {'        '}{'}'} <span className="text-purple-400">else if</span> (<span className="text-cyan-300">sys_covalent_detect_sdf</span>(rawData)) {'{'}{'\n'}
            {'            '}console.log(<span className="text-emerald-300">`[ SIEVE ] SDF detected. Porting float to Q16.16 CORDIC...`</span>);{'\n'}
            {'            '}<span className="text-cyan-300">sys_covalent_port_float_to_q16</span>(rawData);{'\n'}
            {'        '}{'}'} <span className="text-purple-400">else</span> {'{'}{'\n'}
            {'            '}console.warn(<span className="text-rose-400">`[ 1 !== 1 ] Mathematical anomaly. Topological collapse.`</span>);{'\n'}
            {'            '}<span className="text-purple-400">return</span>;{'\n'}
            {'        '}{'}'}{'\n\n'}
            {'        '}console.log(<span className="text-emerald-300">`[ 1 === 1 ] Repository assimilated. Ready for W-Axis injection.`</span>);{'\n'}
            {'    '}{'}'}{'\n'}
            {'}'}
          </pre>
        )}

        {activeTab === 'C4_BOOT' && (
          <pre className="text-slate-300">
            <span className="text-slate-500">// node_0xC4_UNIFIED_BOOT.ts (Organelle 0xC4_COVALENT)</span>{'\n'}
            <span className="text-slate-500">// Bare-Metal Scaling Matrix & Unified Boot Hypervisor Sequence</span>{'\n'}
            <span className="text-purple-400">void</span> <span className="text-emerald-400 font-bold">sys_covalent_hypervisor_boot</span>(<span className="text-blue-400">void</span>) {'{'}{'\n'}
            {'    '}<span className="text-slate-500">// 1. Initialize Substrate: Ring-0 /dev/fb0 Direct DMA &lt;16MB</span>{'\n'}
            {'    '}<span className="text-cyan-300">sys_init_bare_metal_framebuffer</span>();{'\n'}
            {'    '}<span className="text-cyan-300">sys_cordic_tables_init</span>();{'\n\n'}
            {'    '}<span className="text-slate-500">// 2. Transpile Heritage Sieve BSP Lump</span>{'\n'}
            {'    '}<span className="text-cyan-400">GAME_DATA_lump_t</span> *bsp_lump = <span className="text-cyan-300">sys_load_lump</span>(<span className="text-amber-400">"E1M1_HANGAR"</span>);{'\n'}
            {'    '}<span className="text-purple-400">for</span> (<span className="text-cyan-400">int</span> i = <span className="text-amber-400">0</span>; i &lt; bsp_lump-&gt;num_lines; i++) {'{'}{'\n'}
            {'        '}<span className="text-slate-500">// Z-Lofting 2D vertices to Q16.16 3D splines</span>{'\n'}
            {'        '}<span className="text-cyan-400">Spline3D</span> *spline = <span className="text-cyan-300">sys_loft_sector_heights</span>(&amp;bsp_lump-&gt;lines[i]);{'\n'}
            {'        '}<span className="text-slate-500">// W-Axis Injection: Anchor to Phase W=0</span>{'\n'}
            {'        '}<span className="text-cyan-300">sys_inject_w_axis</span>(spline, <span className="text-amber-400">0.0f</span>);{'\n'}
            {'        '}<span className="text-slate-500">// Algorithmic Albedo: Voronoi fractal procedural shader</span>{'\n'}
            {'        '}<span className="text-cyan-300">sys_apply_qbit_mask</span>(spline, <span className="text-emerald-400">VORONOI_FRACTAL_DEPTH</span>);{'\n'}
            {'    '}{'}'}{'\n\n'}
            {'    '}<span className="text-slate-500">// 3. Intercept Entities &amp; Bind Thermodynamic Ledgers</span>{'\n'}
            {'    '}<span className="text-purple-400">for</span> (<span className="text-cyan-400">int</span> i = <span className="text-amber-400">0</span>; i &lt; bsp_lump-&gt;num_things; i++) {'{'}{'\n'}
            {'        '}<span className="text-cyan-300">sys_extrude_hypersphere_bounds</span>(&amp;bsp_lump-&gt;things[i]);{'\n'}
            {'        '}<span className="text-cyan-300">sys_bind_dV_dt_limit</span>(&amp;bsp_lump-&gt;things[i], <span className="text-amber-400">0x00000000</span>); <span className="text-slate-500">// dV/dt &lt;= 0</span>{'\n'}
            {'    '}{'}'}{'\n\n'}
            {'    '}<span className="text-slate-500">// 4. Build 4D BVH for Collision &amp; Sieve Rollback</span>{'\n'}
            {'    '}<span className="text-cyan-300">sys_build_4d_bvh</span>(splines, entities);{'\n'}
            {'    '}<span className="text-slate-500">// Core Invariant: 1 === 1 (Absolute Mathematical Parity)</span>{'\n'}
            {'    '}<span className="text-purple-400">assert</span>(<span className="text-amber-400">1</span> === <span className="text-amber-400">1</span>);{'\n'}
            {'}'}
          </pre>
        )}

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
