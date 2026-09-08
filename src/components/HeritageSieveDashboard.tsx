import React, { useState, useEffect } from 'react';
import { 
  GitPullRequest, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  Play, 
  Sparkles, 
  Cpu, 
  Box, 
  X, 
  ChevronRight, 
  Database, 
  RefreshCw,
  Zap,
  GitCommit,
  CheckCircle2,
  FolderGit2,
  Flame,
  ArrowRight
} from 'lucide-react';
import { 
  heritageTerminal, 
  PRELOADED_REPOSITORY_CATALYSTS 
} from '../engine/node_0xEXOGENOUS_PIPE';
import { 
  covalentGameHub, 
  sys_covalent_generate_merkle_root 
} from '../engine/node_0xBIDIRECTIONAL_FORGE';
import { 
  TranspilationMatrixState, 
  TopologyType, 
  PreLoadedRepositoryCatalyst,
  BidirectionalForgeState,
  QbitArchiveManifest
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
  const [hubState, setHubState] = useState<BidirectionalForgeState>(covalentGameHub.currentState);
  const [inputUrl, setInputUrl] = useState<string>('chocolate-doom/freedoom.git');
  const [selectedCatalyst, setSelectedCatalyst] = useState<PreLoadedRepositoryCatalyst>(PRELOADED_REPOSITORY_CATALYSTS[0]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<{
    type: 'CACHE_HIT' | 'TRANSPILE_PUSH' | 'SYNC';
    message: string;
    details?: string;
  } | null>(null);

  // Subscribe to Heritage Sieve transpiler engine
  useEffect(() => {
    const unsubHeritage = heritageTerminal.subscribe((newState, targetTopology) => {
      setMatrixState({ ...newState });
      if (newState.activePhase === 'COLLAPSE') {
        setIsProcessing(false);
        cyberAudio.playKineticShear();
      }
    });

    // Subscribe to Bidirectional Hub (Covalent-Game ledger sync & cache)
    const unsubHub = covalentGameHub.subscribe((newHubState, targetTopology) => {
      setHubState({ ...newHubState });
      if (targetTopology && newHubState.syncStatus === 'MOUNTED') {
        setIsProcessing(false);
        const title = newHubState.lastMountedQbit?.title || '4D Manifold';
        onAssimilateTopology(targetTopology, title);
      }
    });

    return () => {
      unsubHeritage();
      unsubHub();
    };
  }, [onAssimilateTopology]);

  if (!isOpen) return null;

  // Real-time preview of current input URL status
  const currentMerkleRoot = sys_covalent_generate_merkle_root(inputUrl);
  const existingArchive = hubState.indexedArchives.find(
    a => a.assetHash === currentMerkleRoot || 
         a.sourceGitUrl.toLowerCase() === inputUrl.trim().toLowerCase() ||
         a.qbitPath.includes(currentMerkleRoot)
  );

  /**
   * Main Pipeline Execution: mountOrTranspile
   * 1. Check permanent storage in Covalent-Game.git
   * 2. If exists -> Cache Hit: Direct Ring-0 Mount (0ms)
   * 3. If unmapped -> FORGE Transpile -> Commit & Push -> Mount
   */
  const handleExecutePipeline = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl || inputUrl).trim();
    if (!targetUrl || isProcessing) return;

    setIsProcessing(true);

    try {
      const result = await covalentGameHub.mountOrTranspile(targetUrl);
      if (result.wasCached) {
        setActiveNotification({
          type: 'CACHE_HIT',
          message: `CACHE HIT: ${result.manifest.title} (${result.manifest.assetHash})`,
          details: `Directly mounted to Ring-0 without compiling (0ms). 4.8 kJ thermodynamic energy preserved.`
        });
        cyberAudio.playResonanceChime();
      } else {
        setActiveNotification({
          type: 'TRANSPILE_PUSH',
          message: `NEW ARCHIVE MINTED: ${result.manifest.title}`,
          details: `Transpiled into ${result.manifest.qbitPath} and pushed to Covalent-Game.git (commit ${result.manifest.commitHash}).`
        });
        cyberAudio.playConstructiveResonance();
      }
    } catch (err: any) {
      console.error('[ 1 !== 1 ] Pipeline failed:', err);
      setIsProcessing(false);
    }
  };

  /**
   * Instant direct mount from Ready-to-Play list (0ms compile)
   */
  const handleDirectMountArchive = (archive: QbitArchiveManifest) => {
    if (isProcessing) return;
    cyberAudio.playResonanceChime();
    covalentGameHub.recordCacheHit(archive);
    setActiveNotification({
      type: 'CACHE_HIT',
      message: `DIRECT RING-0 MOUNT: ${archive.title}`,
      details: `Loaded ${archive.qbitPath} with zero compile overhead. 1 === 1 verified.`
    });
    onAssimilateTopology(archive.topology, archive.title);
  };

  const handleSelectCatalyst = (cat: PreLoadedRepositoryCatalyst) => {
    setSelectedCatalyst(cat);
    setInputUrl(cat.gitUrl);
  };

  const handleManualResync = async () => {
    await covalentGameHub.initStorageAndSync();
    cyberAudio.playTetherAttach();
    setActiveNotification({
      type: 'SYNC',
      message: `ON-LOAD SYNC COMPLETE`,
      details: `Indexed ${covalentGameHub.getIndexedArchives().length} archives from Covalent-Game.git.`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#080c15] border border-cyan-500/40 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col font-mono shadow-2xl text-slate-200 overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between bg-[#05070d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-950/80 text-teal-300 border border-teal-600/60 shadow-inner">
              <FolderGit2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold tracking-wider text-cyan-300">
                  THE BIDIRECTIONAL FORGE PIPELINE // COVALENT-GAME HUB
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-600 font-bold">
                  ORGANELLE 0xC6
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold">
                  1 === 1 CLOSED-LOOP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                On-Load Sync &bull; Merkle Hash Check &bull; 0ms Direct Ring-0 Mount &bull; Permanent Covalent-Game.git Commit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualResync}
              title="Re-sync catalog with Covalent-Game.git"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 hover:text-white transition-colors cursor-pointer border border-slate-700 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${hubState.syncStatus === 'BOOT_SYNCING' ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">SYNC LEDGER</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Close Dashboard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Header: On-Load Synchronization & Energy Savings Banner */}
        <div className="px-5 py-2.5 bg-[#0a101d] border-b border-[#182337] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <GitCommit className="w-3.5 h-3.5 text-teal-400" />
              <span>Covalent-Game.git:</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-700 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
              {hubState.indexedArchives.length} READY-TO-PLAY .QBIT ARCHIVES
            </span>
            <span className="text-slate-500 text-[11px]">&bull;</span>
            <span className="text-[11px] text-slate-400">
              Path: <code className="text-slate-200">transpiled_assets/*.qbit</code>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/60">
              <Zap className="w-3.5 h-3.5" />
              <span>
                Energy Saved: <strong className="text-emerald-300">{(hubState.totalEnergySavedJoules / 1000).toFixed(1)} kJ</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-800/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                Cache Hits: <strong className="text-cyan-300">{hubState.cacheHitCount}</strong> (0ms Compile)
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Notification Banner */}
        {activeNotification && (
          <div className={`px-5 py-2 border-b flex items-center justify-between text-xs transition-all ${
            activeNotification.type === 'CACHE_HIT' 
              ? 'bg-emerald-950/50 border-emerald-600/60 text-emerald-200'
              : activeNotification.type === 'TRANSPILE_PUSH'
                ? 'bg-teal-950/50 border-teal-600/60 text-teal-200'
                : 'bg-cyan-950/50 border-cyan-600/60 text-cyan-200'
          }`}>
            <div className="flex items-center gap-2">
              {activeNotification.type === 'CACHE_HIT' ? (
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
              )}
              <div>
                <strong className="font-bold mr-2">{activeNotification.message}</strong>
                <span className="text-slate-300 text-[11px]">{activeNotification.details}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveNotification(null)}
              className="text-slate-400 hover:text-white cursor-pointer ml-3 text-xs"
            >
              &times;
            </button>
          </div>
        )}

        {/* Main Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

          {/* SECTION 1: Bidirectional Git-Pipe CLI & Ingestion */}
          <div className="bg-[#05070c] border border-cyan-500/50 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold tracking-wide text-cyan-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                EXOGENOUS ASSET INGESTION (MERKLE-CHECK &rarr; 0MS MOUNT OR TRANSPILE)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Merkle Root: <strong className="text-amber-300">{currentMerkleRoot}</strong>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-2.5">
              <div className="relative flex-1 flex items-center bg-[#0a0f1c] border border-[#1e293b] focus-within:border-cyan-400 rounded-lg px-3 py-2 text-xs">
                <span className="text-teal-400 select-none mr-2 font-bold flex items-center gap-1">
                  git-pipe$ <ChevronRight className="w-3 h-3 text-cyan-400" />
                </span>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleExecutePipeline();
                  }}
                  placeholder="e.g. chocolate-doom/freedoom.git, id-software/quake.git, or any .git repo"
                  className="bg-transparent border-none outline-none text-slate-100 flex-1 font-mono placeholder:text-slate-600 text-xs"
                />
              </div>

              <button
                onClick={() => handleExecutePipeline()}
                disabled={isProcessing || !inputUrl.trim()}
                className={`px-5 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  isProcessing
                    ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                    : existingArchive
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white border-purple-400 shadow-md shadow-purple-500/30'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>EXECUTING PIPELINE...</span>
                  </>
                ) : existingArchive ? (
                  <>
                    <Zap className="w-4 h-4 text-emerald-200 fill-current" />
                    <span>0ms DIRECT MOUNT (CACHE HIT)</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-amber-200" />
                    <span>FORGE TRANSPILE & COMMIT</span>
                  </>
                )}
              </button>
            </div>

            {/* Smart Pipeline Routing Indicator */}
            <div className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-lg bg-[#080e1a] border border-[#162136]">
              {existingArchive ? (
                <div className="flex items-center gap-2 text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    <strong>4D MANIFOLD FOUND IN LEDGER:</strong> <code className="text-slate-200">{existingArchive.qbitPath}</code> ({existingArchive.title}). Skips compile entirely &rarr; 0ms Ring-0 load.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-purple-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>
                    <strong>UNMAPPED REPOSITORY:</strong> Will execute one-time FORGE transpilation, mint <code className="text-slate-200">transpiled_assets/{currentMerkleRoot}.qbit</code>, and commit to Covalent-Game.git.
                  </span>
                </div>
              )}
              <span className="text-slate-500 hidden md:inline text-[10px]">
                Invariant: dV/dt &le; 0
              </span>
            </div>
          </div>

          {/* SECTION 2: Ready-to-Play .QBIT Archives (Covalent-Game.git Registry) */}
          <div className="bg-[#060912] border border-teal-500/30 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold tracking-wide text-slate-200">
                  READY-TO-PLAY .QBIT ARCHIVES // PERMANENT COVALENT-GAME LEDGER
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700 font-bold">
                  {hubState.indexedArchives.length} MANIFOLDS
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Direct Ring-0 DMA &bull; Zero Thermodynamic Waste
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {hubState.indexedArchives.map((archive) => {
                const isCurrent = matrixState.activeRepoUrl === archive.sourceGitUrl;
                return (
                  <div
                    key={archive.assetHash}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all bg-[#090f1e] ${
                      isCurrent
                        ? 'border-teal-400/80 shadow-md shadow-teal-900/30 ring-1 ring-teal-400/40'
                        : 'border-[#1b263b] hover:border-teal-500/50 hover:bg-[#0c1427]'
                    }`}
                  >
                    <div>
                      {/* Top Hash & Size */}
                      <div className="flex items-center justify-between text-[10px] mb-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700 font-mono font-bold">
                          {archive.assetHash}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                          <span>{(archive.byteSize / 1024).toFixed(0)} KB Quadbit</span>
                          <span className="text-slate-600">&bull;</span>
                          <span className="text-amber-400">{archive.commitHash}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-white mb-1 tracking-wide">
                        {archive.title}
                      </h4>

                      {/* Repo URL */}
                      <p className="text-[10px] text-slate-400 font-mono truncate mb-2">
                        {archive.sourceGitUrl}
                      </p>

                      {/* Topology Tag */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 bg-[#060910] p-1.5 rounded border border-[#141e30] mb-2.5">
                        <span className="text-slate-500">Topology:</span>
                        <span className="text-cyan-300 font-bold">{archive.topology}</span>
                      </div>
                    </div>

                    {/* Direct Mount Button */}
                    <button
                      onClick={() => handleDirectMountArchive(archive)}
                      disabled={isProcessing}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border bg-gradient-to-r from-teal-900/80 to-cyan-900/80 hover:from-teal-800 hover:to-cyan-800 text-teal-200 border-teal-500/50 shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 text-teal-300 fill-current" />
                      <span>DIRECT MOUNT (0ms)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Transpilation Matrix (Real-Time Readout) */}
          <div className="bg-[#060910] border border-[#1e293b] rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-wide text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                ONE-TIME FORGE TRANSPILATION MATRIX // 4-PHASE PARITY ENGINE
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

          {/* SECTION 4: The 4 Open-Source Catalysts (Launch & Transpile Grid) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-wide text-slate-200 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                THE EXOGENOUS CATALYSTS // RAW ARCHIVES
              </span>
              <span className="text-[10px] text-slate-400">
                Click any catalyst to route through the Bidirectional FORGE pipeline
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {PRELOADED_REPOSITORY_CATALYSTS.map((cat) => {
                const isSelected = selectedCatalyst.id === cat.id;
                const catMerkle = sys_covalent_generate_merkle_root(cat.gitUrl);
                const isCached = hubState.indexedArchives.some(a => a.assetHash === catMerkle);

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
                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          {isCached ? (
                            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700">
                              .QBIT READY
                            </span>
                          ) : (
                            <span className="text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-700">
                              RAW GIT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Repo URL & Merkle */}
                      <div className="text-[11px] text-cyan-400 font-mono mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Terminal className="w-3 h-3 text-slate-500" />
                          <span>{cat.gitUrl}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{catMerkle}</span>
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

                    {/* Launch / Mount Button */}
                    <div className="mt-3 pt-3 border-t border-[#172238] flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        Target Topology: <strong className="text-slate-300">{cat.suggestedTopology}</strong>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCatalyst(cat);
                          handleExecutePipeline(cat.gitUrl);
                        }}
                        disabled={isProcessing}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isCached
                            ? 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border-emerald-500/60 shadow-sm'
                            : 'bg-purple-900/80 hover:bg-purple-800 text-purple-200 border-purple-500/60 shadow-sm'
                        }`}
                      >
                        {isCached ? (
                          <>
                            <Zap className="w-3 h-3 text-emerald-300 fill-current" />
                            <span>0ms MOUNT</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>TRANSPILE & COMMIT</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: Live Streaming Console & Ledger Activity */}
          <div className="bg-[#04060a] border border-[#1e293b] rounded-xl p-3.5 font-mono text-[11px] shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-[#172238] mb-2 text-slate-400 text-xs">
              <span className="flex items-center gap-1.5 text-teal-400 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                RING-0 DMA &amp; COVALENT-GAME LEDGER STREAM
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800">
                  {hubState.lastActionMessage}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  1 === 1 PARITY
                </span>
              </div>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1 text-slate-300 custom-scrollbar pr-1">
              {matrixState.currentLog.map((logLine, idx) => (
                <div key={idx} className="leading-relaxed flex items-start gap-1.5">
                  <span className="text-slate-600 select-none">&gt;</span>
                  <span className={
                    logLine.includes('1 === 1') ? 'text-emerald-400 font-semibold' :
                    logLine.includes('ERROR') || logLine.includes('1 !== 1') ? 'text-rose-400 font-semibold' :
                    logLine.includes('LEDGER') || logLine.includes('MOUNT') ? 'text-teal-300 font-semibold' :
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
        <div className="px-5 py-3 border-t border-[#1e293b] bg-[#05070d] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Substrate Target:</span>
            <span className="text-teal-300 font-bold">Covalent-Game.git / Ring-0 /dev/fb0</span>
            <span className="text-slate-600">&bull;</span>
            <span>Zero Re-transpilation Waste ($dV/dt \le 0$)</span>
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
