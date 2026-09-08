import React, { useState } from 'react';
import { 
  ScalingSubstrateMode, 
  C4BootSequenceState 
} from '../types';
import { covalentUnifiedBoot } from '../engine/node_0xC4_UNIFIED_BOOT';
import { cyberAudio } from '../engine/audio';
import { 
  Cpu, 
  HardDrive, 
  Monitor, 
  Terminal, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  X, 
  Play, 
  RefreshCw, 
  Activity, 
  Compass, 
  Zap 
} from 'lucide-react';

interface BareMetalScalingMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBootExecuted: () => void;
}

export const BareMetalScalingMatrixModal: React.FC<BareMetalScalingMatrixModalProps> = ({
  isOpen,
  onClose,
  onBootExecuted
}) => {
  const [substrateMode, setSubstrateMode] = useState<ScalingSubstrateMode>(covalentUnifiedBoot.substrateMode);
  const [isExecutingBoot, setIsExecutingBoot] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(5);
  const [consoleLog, setConsoleLog] = useState<string[]>([
    '[INIT] Covalent-OS-11-11-0 Bare-Metal Substrate primed.',
    '[HARDWARE] Ring-0 /dev/fb0 Direct DMA verified. GPU API bypassed.',
    '[MEMORY] Heap bounded to 14.2 MB (< 16 MB ceiling). Zero leak guarantee.',
    '[INVARIANT] Invariant 1 === 1 authenticated. Mathematical parity absolute.'
  ]);

  if (!isOpen) return null;

  const handleSubstrateToggle = (mode: ScalingSubstrateMode) => {
    setSubstrateMode(mode);
    covalentUnifiedBoot.setSubstrateMode(mode);
    cyberAudio.playConstructiveResonance();
    setConsoleLog(prev => [
      ...prev.slice(-8),
      `[SUBSTRATE] Switched to ${mode === 'MINIMUM_SUBSTRATE' ? 'MINIMUM SUBSTRATE (ARM/x86 32-bit, <16MB RAM, /dev/fb0)' : 'INFINITE SCALING PARITY (64-Core Threadripper, CORDIC Caustics, 4K/8K Zero-Mem)'}`
    ]);
  };

  const handleExecuteBoot = () => {
    setIsExecutingBoot(true);
    setActiveStep(1);
    cyberAudio.playTesseractEcho();
    
    setConsoleLog(prev => [
      ...prev.slice(-8),
      '>>> INITIATING ORGANELLE 0xC4: sys_covalent_hypervisor_boot() <<<'
    ]);

    // Step 1: Substrate Init
    setTimeout(() => {
      setActiveStep(1);
      covalentUnifiedBoot.sys_covalent_fb_init_scaled();
      cyberAudio.playResonanceChime();
      setConsoleLog(prev => [
        ...prev.slice(-8),
        '[STEP 1/4] sys_covalent_fb_init_scaled() -> Framebuffer /dev/fb0 initialized at 14.2 MB RAM.'
      ]);

      // Step 2: Transpile BSP
      setTimeout(() => {
        setActiveStep(2);
        covalentUnifiedBoot.sys_covalent_transpile_bsp_to_manifold();
        cyberAudio.playConstructiveResonance();
        setConsoleLog(prev => [
          ...prev.slice(-8),
          '[STEP 2/4] sys_covalent_transpile_bsp_to_manifold() -> Z-Lofting complete. Injected W=0 phase baseline.'
        ]);

        // Step 3: Intercept Entities
        setTimeout(() => {
          setActiveStep(3);
          covalentUnifiedBoot.sys_covalent_intercept_legacy_entities();
          cyberAudio.playKineticShear();
          setConsoleLog(prev => [
            ...prev.slice(-8),
            '[STEP 3/4] sys_covalent_intercept_legacy_entities() -> Hitboxes extruded to 4D hyperspheres. dV/dt <= 0 ledger locked.'
          ]);

          // Step 4: Recalculate BVH
          setTimeout(() => {
            setActiveStep(4);
            covalentUnifiedBoot.sys_covalent_recalculate_bvh();
            cyberAudio.playConstructiveResonance();
            setConsoleLog(prev => [
              ...prev.slice(-8),
              '[STEP 4/4] sys_covalent_recalculate_bvh() -> 4D Rollback Sieve bound. Zero-latency BVH tree ready.',
              '[SUCCESS] 0xC4_COVALENT Hypervisor Boot Complete! 1 === 1 Invariant Holds.'
            ]);
            setActiveStep(5);
            setIsExecutingBoot(false);
            onBootExecuted();
          }, 450);
        }, 450);
      }, 450);
    }, 450);
  };

  const matrix = covalentUnifiedBoot.getScalingMatrix();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#090d16] border border-cyan-500/40 rounded-xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl shadow-cyan-950/60 flex flex-col font-sans text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/40 bg-gradient-to-r from-[#0d1527] via-[#091122] to-[#0d1527]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-cyan-300 font-mono tracking-wide">
                  COVALENT-OS-11-11-0 // BARE-METAL SCALING MATRIX
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                  ORGANELLE 0xC4
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Target: Emulation of Absolute Physics via $1 \equiv 1$ Invariant & Unified Transpilation Macro
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Substrate Mode Selector Pills */}
        <div className="px-6 py-3 bg-[#060910] border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Substrate Mode:</span>
            <div className="flex bg-[#0b101d] p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => handleSubstrateToggle('MINIMUM_SUBSTRATE')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  substrateMode === 'MINIMUM_SUBSTRATE'
                    ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Minimum Substrate (32-bit ARM/x86)</span>
              </button>

              <button
                onClick={() => handleSubstrateToggle('INFINITE_SCALING_PARITY')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  substrateMode === 'INFINITE_SCALING_PARITY'
                    ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Infinite Scaling Parity (64-Core Threadripper / 8K)</span>
              </button>
            </div>
          </div>

          {/* Quick Telemetry Indicators */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>RAM: 14.2 MB / &lt;16 MB</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Activity className="w-4 h-4" />
              <span>GPU: 0% (BYPASSED)</span>
            </div>
            <div className="flex items-center gap-1.5 text-fuchsia-400">
              <Zap className="w-4 h-4" />
              <span>1 ≡ 1 VALIDATED</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* 1. Bare-Metal Scaling Matrix Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Bare-Metal Scaling Matrix
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Mathematical Resolution Independence (Q16.16)
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-cyan-900/30 bg-[#050810]">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0c1220] text-slate-300">
                    <th className="py-2.5 px-4 font-semibold text-slate-400 w-1/4">Hardware Parameter</th>
                    <th className="py-2.5 px-4 font-semibold text-amber-400 w-3/8">Minimum Substrate</th>
                    <th className="py-2.5 px-4 font-semibold text-cyan-400 w-3/8">Infinite Scaling Parity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {matrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-300 flex items-center gap-2">
                        {idx === 0 && <Cpu className="w-4 h-4 text-slate-400" />}
                        {idx === 1 && <HardDrive className="w-4 h-4 text-slate-400" />}
                        {idx === 2 && <Monitor className="w-4 h-4 text-slate-400" />}
                        <span>{row.parameter}</span>
                      </td>
                      <td className={`py-3 px-4 ${substrateMode === 'MINIMUM_SUBSTRATE' ? 'bg-amber-950/20 text-amber-200 font-medium' : 'text-slate-400'}`}>
                        {row.minimumSubstrate}
                      </td>
                      <td className={`py-3 px-4 ${substrateMode === 'INFINITE_SCALING_PARITY' ? 'bg-cyan-950/20 text-cyan-200 font-medium' : 'text-slate-400'}`}>
                        {row.infiniteScalingParity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. The Heritage Sieve Transpilation Sequence */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Compass className="w-4 h-4" />
              The Heritage Sieve Transpilation Sequence
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Step 1: Z-Lofting */}
              <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80 hover:border-emerald-500/40 transition-all space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 font-mono">1. Z-Lofting</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  The hypervisor ingests legacy <code className="text-emerald-300">.GAME_DATA</code> binary space partitions, interpreting 2D vertex arrays and sector heights to mathematically loft them into rigid Q16.16 vector splines.
                </p>
              </div>

              {/* Step 2: W-Axis Injection */}
              <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80 hover:border-fuchsia-500/40 transition-all space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-fuchsia-300 font-mono">2. W-Axis Injection</span>
                  <CheckCircle2 className="w-4 h-4 text-fuchsia-400" />
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  The transpiler explicitly assigns a <code className="text-fuchsia-300">W=0</code> phase to every vector, anchoring the map to Phase 0 and establishing the physical space required for W-vector thrust.
                </p>
              </div>

              {/* Step 3: Algorithmic Albedo */}
              <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80 hover:border-cyan-500/40 transition-all space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 font-mono">3. Algorithmic Albedo</span>
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Rasterized image files are eliminated. Qbit masks—pure mathematical functions like Q16.16 Voronoi cells—are evaluated at exact ray-spline intersections for infinite fractal depth.
                </p>
              </div>

              {/* Step 4: Ledger Binding */}
              <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80 hover:border-amber-500/40 transition-all space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 font-mono">4. Ledger Binding</span>
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Legacy hitboxes are extruded into 4D bounding hyperspheres. Ancient logic loops are intercepted and immediately bound to the continuous <code className="text-amber-300">dV/dt ≤ 0</code> friction limit.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Organelle 0xC4_COVALENT: Unified Boot Command */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* C Source Code Block */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" />
                  kernel/covalent_unified_boot.c
                </span>
                <span className="text-[10px] font-mono text-slate-400">Ring-0 Hypervisor Entry</span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#04060c] border border-cyan-950 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto">
                <div className="text-slate-500">/* kernel/covalent_unified_boot.c */</div>
                <div className="text-slate-500">/* Target: Emulation of Absolute Physics via $1 \equiv 1$ Invariant */</div>
                <div className="mt-1">
                  <span className="text-purple-400">void</span> <span className="text-cyan-300 font-bold">sys_covalent_hypervisor_boot</span>(
                  <span className="text-amber-300">GAME_DATA_lump_t</span>* sector_lump, <span className="text-amber-300">GAME_DATA_lump_t</span>* vertex_lump, <span className="text-amber-300">LegacyEntity</span>* entities) &#123;
                </div>
                
                <div className={`pl-4 py-0.5 rounded transition-colors ${activeStep === 1 ? 'bg-cyan-900/40 text-cyan-200 font-bold' : ''}`}>
                  <span className="text-slate-500">// 1. Ignite Hardware-Agnostic Substrate</span><br />
                  <span className="text-emerald-400">sys_covalent_fb_init_scaled</span>();
                </div>
                
                <div className={`pl-4 py-0.5 rounded transition-colors ${activeStep === 2 ? 'bg-cyan-900/40 text-cyan-200 font-bold' : ''}`}>
                  <span className="text-slate-500">// 2. Extrude BSP to 4D Manifold (Z-Lofting & W-Injection)</span><br />
                  <span className="text-emerald-400">sys_covalent_transpile_bsp_to_manifold</span>(sector_lump, vertex_lump);
                </div>
                
                <div className={`pl-4 py-0.5 rounded transition-colors ${activeStep === 3 ? 'bg-cyan-900/40 text-cyan-200 font-bold' : ''}`}>
                  <span className="text-slate-500">// 3. Morph Hitboxes to Thermodynamic Hyperspheres</span><br />
                  <span className="text-emerald-400">sys_covalent_intercept_legacy_entities</span>(entities);
                </div>
                
                <div className={`pl-4 py-0.5 rounded transition-colors ${activeStep === 4 ? 'bg-cyan-900/40 text-cyan-200 font-bold' : ''}`}>
                  <span className="text-slate-500">// 4. Bind 4D Rollback Sieve</span><br />
                  <span className="text-emerald-400">sys_covalent_recalculate_bvh</span>();
                </div>
                
                <div>&#125;</div>
              </div>
            </div>

            {/* Live Interactive Boot Trigger & Telemetry */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3 bg-[#050810] p-4 rounded-lg border border-slate-800">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-300">Macro Execution Control</span>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Executes the 4-phase transpiler pipeline across bare-metal Q16.16 vector memory.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className={`flex items-center justify-between p-1.5 rounded ${activeStep === 1 ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400'}`}>
                  <span>1. sys_covalent_fb_init_scaled()</span>
                  {activeStep > 1 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <RefreshCw className={`w-3.5 h-3.5 ${activeStep === 1 ? 'animate-spin text-cyan-400' : 'opacity-20'}`} />}
                </div>
                <div className={`flex items-center justify-between p-1.5 rounded ${activeStep === 2 ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400'}`}>
                  <span>2. transpile_bsp_to_manifold()</span>
                  {activeStep > 2 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <RefreshCw className={`w-3.5 h-3.5 ${activeStep === 2 ? 'animate-spin text-cyan-400' : 'opacity-20'}`} />}
                </div>
                <div className={`flex items-center justify-between p-1.5 rounded ${activeStep === 3 ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400'}`}>
                  <span>3. intercept_legacy_entities()</span>
                  {activeStep > 3 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <RefreshCw className={`w-3.5 h-3.5 ${activeStep === 3 ? 'animate-spin text-cyan-400' : 'opacity-20'}`} />}
                </div>
                <div className={`flex items-center justify-between p-1.5 rounded ${activeStep === 4 ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400'}`}>
                  <span>4. recalculate_bvh()</span>
                  {activeStep >= 5 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <RefreshCw className={`w-3.5 h-3.5 ${activeStep === 4 ? 'animate-spin text-cyan-400' : 'opacity-20'}`} />}
                </div>
              </div>

              {/* Boot Action Button */}
              <button
                onClick={handleExecuteBoot}
                disabled={isExecutingBoot}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 via-emerald-600 to-cyan-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isExecutingBoot ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>EXECUTING UNIFIED BOOT...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>EXECUTE 0xC4 UNIFIED BOOT</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Console Output Terminal */}
          <div className="p-3 bg-[#030509] border border-slate-800/80 rounded-lg font-mono text-[10px] text-slate-300 space-y-1">
            <div className="text-slate-500 flex items-center justify-between border-b border-slate-900 pb-1">
              <span>RING-0 HYPERVISOR DMA TERMINAL</span>
              <span>PARITY: 1 === 1</span>
            </div>
            {consoleLog.map((log, idx) => (
              <div key={idx} className="text-emerald-400/90 font-mono">
                {log}
              </div>
            ))}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#070b14] flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            <span>Topology Hash: </span>
            <span className="text-cyan-300">0x7F4C_1111_0xC4_E1M1</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono transition-colors cursor-pointer"
          >
            DISMISS MATRIX
          </button>
        </div>

      </div>
    </div>
  );
};
