import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Code, 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  X, 
  Layers, 
  Check, 
  Copy, 
  FileCode, 
  Flame, 
  Gauge, 
  Radio, 
  Database, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Binary,
  Maximize2
} from 'lucide-react';
import { 
  polyglotTranspiler, 
  OMNI_PRESETS, 
  OmniPreset 
} from '../engine/node_0xOMNI_SIEVE_ORCHESTRATOR';
import { 
  OmniSieveState, 
  OmniTargetLanguage, 
  OmniTranspileResult 
} from '../types';
import { BACKEND_EXTS } from '../engine/cqnl_omni';
import { cyberAudio } from '../engine/audio';

interface OmniSieveDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_TARGETS: { id: OmniTargetLanguage; label: string; ext: string; category: string }[] = [
  { id: 'c', label: 'C (q16_t)', ext: '.c', category: 'Bare-Metal' },
  { id: 'rust', label: 'Rust (Q16)', ext: '.rs', category: 'Bare-Metal' },
  { id: 'javascript', label: 'JavaScript', ext: '.js', category: 'Web' },
  { id: 'verilog', label: 'Verilog HDL', ext: '.v', category: 'FPGA / Silicon' },
  { id: 'opcodes', label: 'Raw Opcodes', ext: '.ops.txt', category: 'QCML Bytecode' },
  { id: 'python', label: 'Python', ext: '.py', category: 'Scientific' },
  { id: 'cpp', label: 'C++20', ext: '.hpp', category: 'Bare-Metal' },
  { id: 'wasm', label: 'WebAssembly (WAT)', ext: '.wat', category: 'Web / VM' },
  { id: 'asm', label: 'x86-64 GAS', ext: '.s', category: 'Bare-Metal' },
  { id: 'cqnl', label: 'CQNL Autopoiesis', ext: '.qcnl', category: 'DSL' },
  { id: 'json', label: 'AIR JSON', ext: '.json', category: 'IR' },
];

const SOURCE_LANG_OPTIONS = [
  'python',
  'javascript',
  'verilog',
  'c',
  'rust',
  'go',
  'asm'
];

export const OmniSieveDashboard: React.FC<OmniSieveDashboardProps> = ({
  isOpen,
  onClose
}) => {
  const [sieveState, setSieveState] = useState<OmniSieveState>(polyglotTranspiler.getState());
  const [sourceCodeInput, setSourceCodeInput] = useState<string>(sieveState.currentSourceText);
  const [sourceLang, setSourceLang] = useState<string>(sieveState.currentSourceLang);
  const [targetLang, setTargetLang] = useState<OmniTargetLanguage>(sieveState.currentTargetLang);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  // Multi-target emission preview cache (for "Synthesize All Targets")
  const [multiTargetOutputs, setMultiTargetOutputs] = useState<Record<string, string>>({});
  const [activePreviewTab, setActivePreviewTab] = useState<OmniTargetLanguage>('c');

  // Subscribe to pipeline state
  useEffect(() => {
    const unsub = polyglotTranspiler.subscribe((state) => {
      setSieveState({ ...state });
      setSourceCodeInput(state.currentSourceText);
      setSourceLang(state.currentSourceLang);
      setTargetLang(state.currentTargetLang);
      setActivePreviewTab(state.currentTargetLang);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const currentResult: OmniTranspileResult | null = sieveState.currentResult;
  const isGranted = currentResult?.status === 'GRANTED';
  const sieve = currentResult?.sieveResult;
  const air = currentResult?.airSystem;

  const handleTranspile = async (tgt = targetLang, srcL = sourceLang, srcCode = sourceCodeInput) => {
    setIsSynthesizing(true);
    setTimeout(async () => {
      await polyglotTranspiler.transpileLegacyAsset(srcCode, tgt, srcL);
      setIsSynthesizing(false);
    }, 120);
  };

  const handleSelectPreset = (preset: OmniPreset) => {
    polyglotTranspiler.selectPreset(preset.id);
  };

  const handleTargetChange = (tgt: OmniTargetLanguage) => {
    setTargetLang(tgt);
    setActivePreviewTab(tgt);
    polyglotTranspiler.setTargetLang(tgt);
  };

  const handleCopyCode = () => {
    if (!currentResult?.emittedCode) return;
    navigator.clipboard.writeText(currentResult.emittedCode);
    setCopied(true);
    cyberAudio.playConstructiveResonance();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSynthesizeAll = async () => {
    setIsSynthesizing(true);
    const results: Record<string, string> = {};
    for (const t of ['c', 'rust', 'javascript', 'verilog', 'opcodes', 'python', 'wasm', 'asm', 'cqnl'] as OmniTargetLanguage[]) {
      const res = await polyglotTranspiler.transpileLegacyAsset(sourceCodeInput, t, sourceLang);
      results[t] = res.emittedCode;
    }
    setMultiTargetOutputs(results);
    setIsSynthesizing(false);
    cyberAudio.playResonanceChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-mono text-slate-200">
      <div className="bg-[#060911] border border-cyan-500/50 rounded-2xl w-full max-w-7xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#1b263b] flex items-center justify-between bg-[#03050a]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-600/60 shadow-inner">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold tracking-wider text-cyan-300">
                  CQNL-OMNI POLYGLOT SIEVE &amp; UNIVERSAL HYPERVISOR
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-600 font-bold">
                  ORGANELLE 0xC9
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold">
                  BANACH SIEVE dV/dt &le; 0
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-600 font-bold">
                  POLYGLOT n&times;m PIVOT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Generic AST Ingestion &bull; Algebraic IR (AIR) &bull; Banach Sieve Thermodynamic Sieve &bull; Multi-Target Emitter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3 text-xs pr-3 border-r border-slate-800">
              <span className="text-slate-400">
                Passed: <strong className="text-emerald-400">{sieveState.totalPassed}</strong>
              </span>
              <span className="text-slate-400">
                Rejected: <strong className="text-rose-400">{sieveState.totalRejected}</strong>
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Close Omni Sieve Dashboard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ring-0 Banach Sieve Status Banner */}
        <div className={`px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
          isGranted
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
            : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
        }`}>
          <div className="flex items-center gap-2 flex-wrap">
            {isGranted ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <strong className="tracking-wide">
              {isGranted ? '1 === 1 BANACH CONTRACTIVE STASIS GRANTED' : '1 !== 1 BANACH SIEVE REJECTION: LOGIC IS EXPANDING'}
            </strong>
            <span className="text-slate-500 text-[11px]">&bull;</span>
            <span className="text-[11px]">
              max(||A||_1, ||A||_&infin;) = <strong className={isGranted ? 'text-emerald-300' : 'text-rose-400 font-bold'}>{sieve?.max_norm.toFixed(4) ?? '0.0000'}</strong> (Threshold &lt; 1.0000)
            </span>
            <span className="text-slate-500 text-[11px]">&bull;</span>
            <span className="text-[11px]">
              ||A||_1 = <strong className="text-slate-300">{sieve?.norm_1.toFixed(4) ?? '0'}</strong> &bull; ||A||_&infin; = <strong className="text-slate-300">{sieve?.norm_inf.toFixed(4) ?? '0'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400">Target Output:</span>
            <code className="px-2 py-0.5 rounded bg-black/60 border border-slate-700 text-cyan-300 font-bold">
              {currentResult?.filename || `intent_via_cqnl_to_${targetLang}${BACKEND_EXTS[targetLang]}`}
            </code>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar space-y-5">

          {/* Preset Chips */}
          <div>
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                POLYGLOT SOURCE ASSETS (GENERIC FRONTEND):
              </span>
              <span className="text-[11px] text-slate-500">
                Select legacy code from Python, JS, or Verilog to run thermodynamic arbitration
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {OMNI_PRESETS.map((preset) => {
                const isSelected = sieveState.selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-lg text-left transition-all border cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400 shadow-md'
                        : 'bg-[#0a0f1d] border-[#1b263b] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="truncate">{preset.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 block capitalize">{preset.sourceLang} &rarr; {preset.defaultTarget}</span>
                    </div>

                    <div className="mt-2 pt-1 border-t border-slate-800 flex items-center justify-between text-[9px]">
                      <span className={preset.expectedPass ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {preset.expectedPass ? 'STABLE' : 'DIVERGENT'}
                      </span>
                      <span className="text-slate-500 truncate max-w-[70px]">{preset.id}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two-Column Core Layout: Ingestion & AIR (Left) vs Multi-Target Emitter (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left 6 cols: Polyglot Ingestion & Banach Sieve Analysis */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Ingestion Editor Box */}
              <div className="bg-[#05070f] border border-[#1b263b] rounded-xl p-4 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-cyan-400" />
                        UNIVERSAL SOURCE INGESTION
                      </span>
                      <select
                        value={sourceLang}
                        onChange={(e) => {
                          setSourceLang(e.target.value);
                          polyglotTranspiler.setSourceLang(e.target.value);
                        }}
                        className="bg-[#080d1a] border border-slate-700 text-cyan-300 text-[10px] rounded px-2 py-0.5 font-bold focus:outline-none cursor-pointer"
                      >
                        {SOURCE_LANG_OPTIONS.map(l => (
                          <option key={l} value={l}>{l.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      frontends/generic.py
                    </span>
                  </div>

                  <textarea
                    value={sourceCodeInput}
                    onChange={(e) => {
                      setSourceCodeInput(e.target.value);
                      polyglotTranspiler.setSourceCode(e.target.value);
                    }}
                    rows={7}
                    className="w-full bg-[#080d1a] border border-[#1e293b] focus:border-cyan-500 rounded-lg p-3 text-xs text-cyan-100 font-mono focus:outline-none custom-scrollbar leading-relaxed resize-none"
                    placeholder="// Paste legacy Python, JS, or Verilog code..."
                    spellCheck={false}
                  />

                  {/* Extracted Affine Assigns Tag Cloud */}
                  <div className="mt-2.5 bg-[#080e1d] border border-[#152033] rounded-lg p-2.5 text-[11px]">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                      <span>EXTRACTED AFFINE ASSIGNMENTS ({currentResult?.intent.assigns.length || 0}):</span>
                      <span className="text-cyan-400 font-mono">hash={currentResult?.intent.source_hash}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(currentResult?.intent.assigns || []).map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-black/60 border border-slate-700 text-[10px] font-mono text-cyan-300">
                          <strong>{a.target}</strong> *= {a.scale} {Math.abs(a.const) > 1e-12 ? `+ ${a.const}` : ''}
                        </span>
                      ))}
                      {(!currentResult?.intent.assigns || currentResult.intent.assigns.length === 0) && (
                        <span className="text-slate-500 text-[10px] italic">No affine updates found</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#172338] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Target: <strong className="text-cyan-300 uppercase">{targetLang}</strong>
                  </span>

                  <button
                    onClick={() => handleTranspile(targetLang, sourceLang, sourceCodeInput)}
                    disabled={isSynthesizing}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 border border-cyan-400 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Play className={`w-3.5 h-3.5 fill-current ${isSynthesizing ? 'animate-spin' : ''}`} />
                    <span>TRANSPILE &amp; ARBITRATE</span>
                  </button>
                </div>
              </div>

              {/* Banach Sieve Matrix & Thermodynamics Box */}
              <div className="bg-[#05070f] border border-[#1b263b] rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    THERMODYNAMIC BANACH SIEVE (qcnl_lib/banach_sieve.py)
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isGranted
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                      : 'bg-rose-950 text-rose-300 border-rose-600'
                  }`}>
                    {isGranted ? 'CONTRACTIVE (PASS)' : 'EXPANDING (FAIL)'}
                  </span>
                </div>

                {/* Transition Matrix A (n x n) Heatmap */}
                <div className="bg-[#080d1a] border border-[#152033] rounded-lg p-3 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                    <span className="font-bold text-slate-300">TRANSITION MATRIX A (x_(k+1) = A x_k + b):</span>
                    <span className="font-mono text-slate-500">dim: {air?.n ?? 0} &times; {air?.n ?? 0}</span>
                  </div>

                  {air && air.n > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-center border-collapse text-[10px] font-mono">
                        <thead>
                          <tr>
                            <th className="p-1 text-slate-500 text-left">var</th>
                            {air.var_names.map((v, idx) => (
                              <th key={idx} className="p-1 text-cyan-300 font-bold">{v}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {air.A.map((row, rIdx) => (
                            <tr key={rIdx} className="border-t border-slate-800/80">
                              <td className="p-1 text-cyan-300 font-bold text-left">{air.var_names[rIdx]}</td>
                              {row.map((val, cIdx) => {
                                const isZero = Math.abs(val) < 1e-12;
                                const isExp = Math.abs(val) >= 1.0;
                                return (
                                  <td 
                                    key={cIdx} 
                                    className={`p-1.5 rounded ${
                                      isZero ? 'text-slate-600' :
                                      isExp ? 'bg-rose-950/70 text-rose-300 font-bold' :
                                      'bg-emerald-950/60 text-emerald-300 font-bold'
                                    }`}
                                  >
                                    {val.toFixed(4)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-[10px] italic py-2 text-center">
                      No state variables in system
                    </div>
                  )}

                  {/* Norms Readout */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800 grid grid-cols-2 gap-3 text-[11px]">
                    <div className="bg-black/40 border border-slate-800 rounded p-2">
                      <span className="text-slate-400 block text-[9px]">COLUMN NORM ||A||_1:</span>
                      <strong className="text-cyan-300 text-xs">{sieve?.norm_1.toFixed(4) ?? '0.0000'}</strong>
                    </div>
                    <div className="bg-black/40 border border-slate-800 rounded p-2">
                      <span className="text-slate-400 block text-[9px]">ROW NORM ||A||_&infin;:</span>
                      <strong className="text-cyan-300 text-xs">{sieve?.norm_inf.toFixed(4) ?? '0.0000'}</strong>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-2 italic">
                    {sieve?.message || 'Sieve pending verification.'}
                  </p>
                </div>

                {/* Opcode Stream */}
                <div className="mt-3 bg-[#080d1a] border border-[#152033] rounded-lg p-2.5">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">
                    QUADBIT QCML OPCODES GENERATED:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(currentResult?.intent.opcodes || []).map((op, idx) => (
                      <span 
                        key={idx} 
                        className="px-1.5 py-0.5 rounded bg-[#111827] border border-slate-700 text-[9px] font-mono text-amber-300 font-bold"
                      >
                        {op.toString(16).toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Right 6 cols: Multi-Target Code Emission */}
            <div className="lg:col-span-6 bg-[#05070f] border border-[#1b263b] rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Binary className="w-3.5 h-3.5 text-amber-400" />
                    MULTI-TARGET EMITTER (backends/emitters.py)
                  </span>
                  <button
                    onClick={handleSynthesizeAll}
                    disabled={isSynthesizing}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 cursor-pointer transition-colors"
                  >
                    SYNTHESIZE ALL TARGETS
                  </button>
                </div>

                {/* Target Language Category Selector */}
                <div className="flex flex-wrap gap-1 mb-2 bg-[#090e1c] p-1 rounded-lg border border-[#1e293b] text-xs">
                  {SUPPORTED_TARGETS.map((t) => {
                    const isSelected = targetLang === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleTargetChange(t.id)}
                        className={`px-2 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                {/* Generated Code Window */}
                <div className="relative bg-[#080d19] border border-[#1e293b] rounded-lg p-3 overflow-hidden">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-300 font-bold">{currentResult?.filename}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400">
                        {currentResult?.emittedCode.length || 0} bytes
                      </span>
                    </div>

                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[10px]"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'COPIED' : 'COPY'}</span>
                    </button>
                  </div>

                  <pre className="text-xs text-amber-100 font-mono overflow-x-auto max-h-80 custom-scrollbar leading-relaxed">
                    {currentResult?.emittedCode || '// Click Transpile to emit target...'}
                  </pre>
                </div>

                {/* Deterministic Hardware Equivalence Stamp */}
                <div className="mt-3 bg-[#080d1a] border border-[#152033] rounded-lg p-3 text-[11px] space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-[10px]">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>DETERMINISTIC HARDWARE FOOTPRINT EQUIVALENCE</span>
                  </div>
                  <p className="text-slate-400 text-[10px] leading-relaxed">
                    Logic ingested from Python or JavaScript compiles with the <strong>exact same deterministic state updates</strong> as raw Verilog hardware registers (<code>always_ff @(posedge clk)</code>) or Q16.16 bare-metal C (<code>q16_mul</code>).
                  </p>
                </div>

              </div>

              {/* Quipu Ledger of Validated Assets */}
              <div className="mt-4 pt-3 border-t border-[#182438]">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-bold">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Database className="w-3 h-3 text-teal-400" />
                    QUIPU ASSET LEDGER (VERIFIED CONTRACTIVE SHARDS):
                  </span>
                  <span>{sieveState.ledger.length} entries</span>
                </div>

                <div className="space-y-1 max-h-28 overflow-y-auto custom-scrollbar">
                  {sieveState.ledger.map((entry) => (
                    <div 
                      key={entry.id}
                      className="px-2 py-1 rounded bg-[#080e1c] border border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-slate-400"
                    >
                      <span className="text-cyan-300 font-bold">{entry.filename}</span>
                      <span className="capitalize">{entry.sourceLang} &rarr; {entry.targetLang}</span>
                      <span className="text-emerald-400">||A|| &le; {entry.normMax.toFixed(2)}</span>
                      <span className="text-slate-500">{entry.id}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1b263b] bg-[#03050a] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Substrate Target:</span>
            <span className="text-cyan-300 font-bold">CQNL-Omni Universal Hypervisor</span>
            <span className="text-slate-600">&bull;</span>
            <span>Banach Sieve Contractive Guarantee ($\max(\lVert A \rVert_1, \lVert A \rVert_\infty) &lt; 1.0$)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700 text-xs font-semibold"
          >
            RETURN TO 4D ARENA
          </button>
        </div>

      </div>
    </div>
  );
};
