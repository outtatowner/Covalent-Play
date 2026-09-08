import React, { useState, useEffect } from 'react';
import { 
  GitPullRequest, 
  Terminal, 
  Layers, 
  Orbit, 
  ShieldCheck, 
  AlertCircle, 
  Play, 
  Sparkles, 
  Cpu, 
  Box, 
  Radio, 
  X, 
  ExternalLink,
  ChevronRight,
  Database,
  RefreshCw
} from 'lucide-react';
import { 
  heritageTerminal, 
  PRELOADED_REPOSITORY_CATALYSTS 
} from '../engine/node_0xEXOGENOUS_PIPE';
import { 
  TranspilationMatrixState, 
  TopologyType, 
  PreLoadedRepositoryCatalyst 
} from '../types';
import { cyberAudio } from '../engine/audio';

interface HeritageSieveDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onAssimilateTopology: (topology: TopologyType, repoTitle: string) => void;
}

export const HeritageSieveDashboard: React.FC<HeritageSieveDashboardProps> = ({
  isOpen,
  onClose,
  onAssimilateTopology
}) => {
  const [matrixState, setMatrixState] = useState<TranspilationMatrixState>(heritageTerminal.state);
  const [inputUrl, setInputUrl] = useState<string>('chocolate-doom/freedoom.git');
  const [selectedCatalyst, setSelectedCatalyst] = useState<PreLoadedRepositoryCatalyst>(PRELOADED_REPOSITORY_CATALYSTS[0]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    const unsub = heritageTerminal.subscribe((newState, targetTopology) => {
      setMatrixState({ ...newState });
      if (newState.activePhase === 'ASSIMILATED' && targetTopology) {
        setIsProcessing(false);
        cyberAudio.playConstructiveResonance();
        onAssimilateTopology(targetTopology, newState.activeRepoUrl);
      } else if (newState.activePhase === 'COLLAPSE') {
        setIsProcessing(false);
        cyberAudio.playKineticShear();
      }
    });

    return unsub;
  }, [onAssimilateTopology]);

  if (!isOpen) return null;

  const handleRunIngestion = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl || inputUrl;
    if (!targetUrl || isProcessing) return;

    setIsProcessing(true);
    cyberAudio.playTetherAttach();
    await heritageTerminal.ingestRepository(targetUrl);
  };

  const handleSelectCatalyst = (cat: PreLoadedRepositoryCatalyst) => {
    setSelectedCatalyst(cat);
    setInputUrl(cat.gitUrl);
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'LEGACY_PARSING': return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
      case 'Z_LOFTING': return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20';
      case 'W_AXIS_INJECTION': return 'text-purple-400 border-purple-500/30 bg-purple-950/20';
      case 'QBIT_MASKING': return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
      case 'ASSIMILATED': return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/30';
      case 'COLLAPSE': return 'text-rose-400 border-rose-500/50 bg-rose-950/30';
      default: return 'text-slate-400 border-slate-700/50 bg-slate-900/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#090d16] border border-cyan-500/30 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col font-mono shadow-2xl text-slate-200 overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between bg-[#060910]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-700/50">
              <GitPullRequest className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-wider text-cyan-300">
                  THE HERITAGE SIEVE // EXOGENOUS INGESTION
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-600 font-bold">
                  ORGANELLE 0xC5
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold hidden sm:inline-block">
                  INVARIANT: 1 === 1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Dynamic .git buffer cloning &bull; Direct DMA into Quipu Ledger &bull; 4D Vector Spline Transpilation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Close Heritage Sieve"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

          {/* SECTION 1: Bare-Metal Git-Pipe Input */}
          <div className="bg-[#05070c] border border-cyan-500/40 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold tracking-wide text-cyan-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                GIT-PIPE INPUT BUFFER (RING-0 RAW .GIT CLI)
              </span>
              <span className="text-[10px] text-slate-400">
                Buffer Memory: <strong className="text-emerald-400">{(matrixState.gitBufferBytes / (1024 * 1024)).toFixed(1)} MB</strong> / 64MB DMA
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1 flex items-center bg-[#0a0f1c] border border-[#1e293b] focus-within:border-cyan-400 rounded-lg px-3 py-2 text-xs">
                <span className="text-emerald-400 select-none mr-2 font-bold flex items-center gap-1">
                  git-pipe$ <ChevronRight className="w-3 h-3 text-cyan-400" />
                </span>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRunIngestion();
                  }}
                  placeholder="e.g. chocolate-doom/freedoom.git or https://github.com/..."
                  className="bg-transparent border-none outline-none text-slate-100 flex-1 font-mono placeholder:text-slate-600 text-xs"
                />
              </div>

              <button
                onClick={() => handleRunIngestion()}
                disabled={isProcessing || !inputUrl.trim()}
                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  isProcessing
                    ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white border-cyan-400 shadow-md shadow-cyan-500/30'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>TRANSPILING...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>INGEST & ASSIMILATE</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SECTION 2: Transpilation Matrix (Real-Time Readout) */}
          <div className="bg-[#060910] border border-[#1e293b] rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-wide text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                TRANSPILATION MATRIX // 4-PHASE PARITY CONVERSION
              </span>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-400">LEDGER HASH:</span>
                <span className="text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                  {matrixState.quipuLedgerHash}
                </span>
                <span className="text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                  {matrixState.invariantStatus}
                </span>
              </div>
            </div>

            {/* 4 Conversion Phases Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Phase 1: Legacy Parsing */}
              <div className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                matrixState.activePhase === 'LEGACY_PARSING' 
                  ? 'border-amber-500/80 bg-amber-950/30 ring-1 ring-amber-400/50' 
                  : matrixState.phaseProgress.LEGACY_PARSING === 100
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-[#1e293b] bg-[#05070c]'
              }`}>
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-amber-400">1. LEGACY PARSING</span>
                    <span className="text-slate-400">{matrixState.phaseProgress.LEGACY_PARSING}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Raw git buffer streaming, binary lump headers, and BSP tree segmentation.
                  </p>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
                  <div 
                    className="bg-amber-400 h-full transition-all duration-300"
                    style={{ width: `${matrixState.phaseProgress.LEGACY_PARSING}%` }}
                  />
                </div>
              </div>

              {/* Phase 2: Z-Lofting */}
              <div className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                matrixState.activePhase === 'Z_LOFTING' 
                  ? 'border-cyan-500/80 bg-cyan-950/30 ring-1 ring-cyan-400/50' 
                  : matrixState.phaseProgress.Z_LOFTING === 100
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-[#1e293b] bg-[#05070c]'
              }`}>
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-cyan-400">2. Z-LOFTING</span>
                    <span className="text-slate-400">{matrixState.phaseProgress.Z_LOFTING}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Lofting 2D/2.5D flat vertices into continuous Q16.16 vector splines.
                  </p>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
                  <div 
                    className="bg-cyan-400 h-full transition-all duration-300"
                    style={{ width: `${matrixState.phaseProgress.Z_LOFTING}%` }}
                  />
                </div>
              </div>

              {/* Phase 3: W-Axis Injection */}
              <div className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                matrixState.activePhase === 'W_AXIS_INJECTION' 
                  ? 'border-purple-500/80 bg-purple-950/30 ring-1 ring-purple-400/50' 
                  : matrixState.phaseProgress.W_AXIS_INJECTION === 100
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-[#1e293b] bg-[#05070c]'
              }`}>
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-purple-400">3. W-AXIS INJECTION</span>
                    <span className="text-slate-400">{matrixState.phaseProgress.W_AXIS_INJECTION}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Anchoring control points to Phase W=0; rewiring teleporters to 4D phase doors.
                  </p>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
                  <div 
                    className="bg-purple-400 h-full transition-all duration-300"
                    style={{ width: `${matrixState.phaseProgress.W_AXIS_INJECTION}%` }}
                  />
                </div>
              </div>

              {/* Phase 4: Qbit Masking */}
              <div className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                matrixState.activePhase === 'QBIT_MASKING' 
                  ? 'border-emerald-500/80 bg-emerald-950/30 ring-1 ring-emerald-400/50' 
                  : matrixState.phaseProgress.QBIT_MASKING === 100
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-[#1e293b] bg-[#05070c]'
              }`}>
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-emerald-400">4. QBIT MASKING</span>
                    <span className="text-slate-400">{matrixState.phaseProgress.QBIT_MASKING}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Procedural Voronoi albedo, CORDIC caustics, and dV/dt &le; 0 friction bounds.
                  </p>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
                  <div 
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${matrixState.phaseProgress.QBIT_MASKING}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: The Archives (Pre-Loaded Catalysts Grid) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-wide text-slate-200 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                THE ARCHIVES // 4 PRE-LOADED TRANSPILATION CATALYSTS
              </span>
              <span className="text-[10px] text-slate-400">
                Ready for immediate 4D assimilation into Quipu memory
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {PRELOADED_REPOSITORY_CATALYSTS.map((cat) => {
                const isSelected = selectedCatalyst.id === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCatalyst(cat)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0e1627] border-cyan-400/80 shadow-lg shadow-cyan-900/30 ring-1 ring-cyan-400/40'
                        : 'bg-[#060910] border-[#1e293b] hover:border-slate-600 hover:bg-[#080d19]'
                    }`}
                  >
                    <div>
                      {/* Top bar */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            cat.badgeColor === 'cyan' ? 'bg-cyan-950 text-cyan-300 border-cyan-700' :
                            cat.badgeColor === 'amber' ? 'bg-amber-950 text-amber-300 border-amber-700' :
                            cat.badgeColor === 'emerald' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' :
                            'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-700'
                          }`}>
                            {cat.architectureType}
                          </span>
                          <span className="text-xs font-bold text-white tracking-wide">
                            {cat.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {(cat.byteSize / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </div>

                      {/* Repo URL */}
                      <div className="text-[11px] text-cyan-400 font-mono mb-2 flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-slate-500" />
                        <span>{cat.gitUrl}</span>
                      </div>

                      {/* Architecture & Result */}
                      <div className="space-y-1.5 text-[11px] mb-3 bg-[#04060a] p-2.5 rounded-lg border border-[#172238]">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-slate-500 shrink-0">Original Architecture:</span>
                          <span className="text-slate-300 font-medium">{cat.originalArchitecture}</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-cyan-400 shrink-0 font-bold">Covalent 4D Result:</span>
                          <span className="text-cyan-200 font-medium">{cat.covalentResult}</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {cat.mathematicalDetail}
                      </p>
                    </div>

                    {/* Launch Button */}
                    <div className="mt-3 pt-3 border-t border-[#172238] flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        Target Topology: <strong className="text-slate-300">{cat.suggestedTopology}</strong>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCatalyst(cat);
                          handleRunIngestion(cat.gitUrl);
                        }}
                        disabled={isProcessing}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                          cat.badgeColor === 'cyan' ? 'bg-cyan-900/70 hover:bg-cyan-800 text-cyan-200 border-cyan-500/50' :
                          cat.badgeColor === 'amber' ? 'bg-amber-900/70 hover:bg-amber-800 text-amber-200 border-amber-500/50' :
                          cat.badgeColor === 'emerald' ? 'bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border-emerald-500/50' :
                          'bg-fuchsia-900/70 hover:bg-fuchsia-800 text-fuchsia-200 border-fuchsia-500/50'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>ASSIMILATE REPO</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: Live Transpiler Console & Quipu Ledger Logs */}
          <div className="bg-[#04060a] border border-[#1e293b] rounded-xl p-3.5 font-mono text-[11px] shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-[#172238] mb-2 text-slate-400 text-xs">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                RING-0 DMA STREAMING CONSOLE LOGS
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                MATHEMATICAL PARITY: 1 === 1
              </span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1 text-slate-300 custom-scrollbar pr-1">
              {matrixState.currentLog.map((logLine, idx) => (
                <div key={idx} className="leading-relaxed flex items-start gap-1.5">
                  <span className="text-slate-600 select-none">&gt;</span>
                  <span className={
                    logLine.includes('1 === 1') ? 'text-emerald-400 font-semibold' :
                    logLine.includes('ERROR') || logLine.includes('1 !== 1') ? 'text-rose-400 font-semibold' :
                    logLine.includes('FORGE') ? 'text-cyan-300 font-semibold' :
                    logLine.includes('SIEVE') ? 'text-amber-300' :
                    logLine.includes('W-INJECT') || logLine.includes('QBIT') ? 'text-purple-300' :
                    'text-slate-300'
                  }>
                    {logLine}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1e293b] bg-[#060910] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Substrate Target:</span>
            <span className="text-cyan-300 font-bold">Bare-Metal /dev/fb0 Vector Framebuffer</span>
            <span className="text-slate-600">&bull;</span>
            <span>Zero GPU / Fixed-Point Q16.16 CORDIC</span>
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
