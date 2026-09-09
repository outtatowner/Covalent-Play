import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  RotateCcw, 
  X, 
  Layers, 
  Flame, 
  Database, 
  Zap, 
  Tv, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  Code,
  Gauge,
  Radio,
  FileCode,
  Sparkles
} from 'lucide-react';
import { 
  qcnlPipeline, 
  QCNL_PRESETS, 
  QcnlPreset 
} from '../engine/node_0xQCNL_PIPELINE';
import { 
  QcnlEngineState, 
  QCML_OP 
} from '../types';
import { 
  QCML_OP_INFO, 
  AMBER_PHOSPHOR_PALETTE_16,
  unpackOpcodes 
} from '../engine/qcml';
import { cyberAudio } from '../engine/audio';

interface QcnlArbiterDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QcnlArbiterDashboard: React.FC<QcnlArbiterDashboardProps> = ({
  isOpen,
  onClose
}) => {
  const [pipelineState, setPipelineState] = useState<QcnlEngineState>(qcnlPipeline.getState());
  const [cCodeInput, setCCodeInput] = useState<string>(QCNL_PRESETS[0].cSource);
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [customNodeInput, setCustomNodeInput] = useState<string>('peer-ring4-0x9B');
  const [isTranspiling, setIsTranspiling] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subscribe to QCNL Pipeline state
  useEffect(() => {
    const unsub = qcnlPipeline.subscribe((newState) => {
      setPipelineState({ ...newState });
    });
    return () => unsub();
  }, []);

  // Framebuffer /dev/fb0 16-color Amber Phosphor Real-time Rasterizer
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed internal framebuffer resolution (320x200 or 256x160)
    const fbWidth = 280;
    const fbHeight = 180;
    canvas.width = fbWidth;
    canvas.height = fbHeight;

    let tick = 0;

    const renderFramebuffer = () => {
      tick++;

      // 1. Fill base obsidian
      ctx.fillStyle = AMBER_PHOSPHOR_PALETTE_16[0];
      ctx.fillRect(0, 0, fbWidth, fbHeight);

      // Draw faint phosphor grid lines
      ctx.strokeStyle = AMBER_PHOSPHOR_PALETTE_16[2];
      ctx.lineWidth = 1;
      for (let x = 0; x < fbWidth; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, fbHeight);
        ctx.stroke();
      }
      for (let y = 0; y < fbHeight; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(fbWidth, y);
        ctx.stroke();
      }

      // 2. Draw /dev/fb0 Header Stamp
      ctx.font = '9px monospace';
      ctx.fillStyle = AMBER_PHOSPHOR_PALETTE_16[11];
      ctx.fillText('/DEV/FB0 [16-COLOR AMBER PHOSPHOR]', 8, 14);
      ctx.fillStyle = AMBER_PHOSPHOR_PALETTE_16[7];
      ctx.fillText('DIRECT RING-0 QUANTIZATION', 8, 25);

      const isGranted = pipelineState.arbiterResult?.granted ?? true;
      const theta = pipelineState.arbiterResult?.theta ?? 0.985;
      const deltaV = pipelineState.arbiterResult?.lyapunovDeltaV ?? -0.05;

      // 3. Render Lyapunov Phase-Plane Spiral Trajectory (x vs dx/dt)
      const centerX = fbWidth / 2;
      const centerY = fbHeight / 2 + 10;
      const maxRadius = 55;

      // Draw contractive boundary limit ellipse
      ctx.strokeStyle = isGranted ? AMBER_PHOSPHOR_PALETTE_16[8] : AMBER_PHOSPHOR_PALETTE_16[5];
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, maxRadius, maxRadius * 0.75, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw spiral trajectory
      ctx.beginPath();
      const points = 80;
      for (let i = 0; i < points; i++) {
        const t = (i / points) * Math.PI * 6 + tick * 0.05;
        // If contractive, radius decays exponentially; if expanding, radius grows
        const decayFactor = isGranted ? Math.exp(-i * 0.045) : Math.min(2.0, Math.exp(i * 0.015));
        const r = Math.min(maxRadius * 1.3, maxRadius * decayFactor);
        const px = centerX + Math.cos(t) * r;
        const py = centerY + Math.sin(t) * (r * 0.75);

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      // Bright phosphor trace
      ctx.strokeStyle = isGranted ? AMBER_PHOSPHOR_PALETTE_16[13] : AMBER_PHOSPHOR_PALETTE_16[6];
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Current particle position on trajectory
      const headT = tick * 0.05;
      const headR = isGranted ? 12 : maxRadius * 1.1;
      const hx = centerX + Math.cos(headT) * headR;
      const hy = centerY + Math.sin(headT) * (headR * 0.75);

      ctx.fillStyle = AMBER_PHOSPHOR_PALETTE_16[15];
      ctx.beginPath();
      ctx.arc(hx, hy, 3, 0, Math.PI * 2);
      ctx.fill();

      // 4. Render 16-Nibble Quadbit Opcode Waterfall at bottom
      const barY = fbHeight - 24;
      const opcodes = pipelineState.currentProgram?.opcodes || [];
      const barWidth = Math.floor((fbWidth - 20) / 16);

      for (let i = 0; i < 16; i++) {
        const opVal = i < opcodes.length ? opcodes[i] : 0;
        // Map 4-bit nibble (0..15) directly to 16 amber palette colors
        const colorIdx = Math.min(15, Math.max(0, opVal));
        ctx.fillStyle = AMBER_PHOSPHOR_PALETTE_16[colorIdx];
        ctx.fillRect(10 + i * barWidth, barY, barWidth - 1, 14);

        if (i % 2 === 0) {
          ctx.fillStyle = AMBER_PHOSPHOR_PALETTE_16[14];
          ctx.font = '8px monospace';
          ctx.fillText(opVal.toString(16).toUpperCase(), 10 + i * barWidth + 2, barY + 10);
        }
      }

      // 5. CRT Scanline Raster Filter
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 0; y < fbHeight; y += 2) {
        ctx.fillRect(0, y, fbWidth, 1);
      }

      animId = requestAnimationFrame(renderFramebuffer);
    };

    animId = requestAnimationFrame(renderFramebuffer);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, pipelineState.arbiterResult, pipelineState.currentProgram]);

  if (!isOpen) return null;

  const handleTranspile = () => {
    setIsTranspiling(true);
    setTimeout(() => {
      qcnlPipeline.transpileAndCommit(cCodeInput);
      setIsTranspiling(false);
    }, 150);
  };

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    setCCodeInput(QCNL_PRESETS[idx].cSource);
    qcnlPipeline.selectPreset(idx);
  };

  const handleArbitrateChallenge = (id: string, forceGrant = false) => {
    qcnlPipeline.arbitrateChallenge(id, forceGrant);
  };

  const handleSubmitCustomChallenge = () => {
    if (!cCodeInput.trim()) return;
    qcnlPipeline.submitChallenge(cCodeInput, customNodeInput);
    cyberAudio.playConstructiveResonance();
  };

  const res = pipelineState.arbiterResult;
  const prog = pipelineState.currentProgram;
  const isGranted = res?.granted ?? false;
  const theta = res?.theta ?? 0;
  const thetaQ16Hex = `0x${(res?.thetaQ16 ?? 0).toString(16).padStart(8, '0').toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-mono text-slate-200">
      <div className="bg-[#070b14] border border-amber-500/50 rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#1f2b3e] flex items-center justify-between bg-[#04060a]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-600/60 shadow-inner">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold tracking-wider text-amber-300">
                  QCNL TRANSPILER &amp; STASIS ARBITRATION ENGINE
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600 font-bold">
                  ORGANELLE 0xC8
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-600 font-bold">
                  RING-0 GATE &theta; &gt; 0.95
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Affine C-to-QCML Extraction &bull; F_2^4 Quadbit Registers &bull; Mesh Stasis Protocol &bull; /dev/fb0 Amber Driver
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3 text-xs pr-3 border-r border-slate-700">
              <span className="text-slate-400">
                Granted: <strong className="text-emerald-400">{pipelineState.totalGranted}</strong>
              </span>
              <span className="text-slate-400">
                Denied: <strong className="text-rose-400">{pipelineState.totalDenied}</strong>
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Close QCNL Dashboard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Header / Ring0 Congruence Status Banner */}
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
              {isGranted ? '1 === 1 RING-0 CONGRUENCE GRANTED' : '1 !== 1 ARBITER REJECTION: THRESHOLD MISSED'}
            </strong>
            <span className="text-slate-400 text-[11px]">&bull;</span>
            <span className="text-[11px]">
              &theta; = <strong className={isGranted ? 'text-emerald-300' : 'text-rose-300'}>{theta.toFixed(4)}</strong> (Req &gt; 0.9500 / {thetaQ16Hex})
            </span>
            <span className="text-slate-400 text-[11px]">&bull;</span>
            <span className="text-[11px]">
              dV/dt = <strong className={res?.lyapunovDeltaV! <= 0 ? 'text-emerald-300' : 'text-rose-400 font-bold'}>{res?.lyapunovDeltaV.toFixed(4)}</strong> (Req &le; 0)
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400">Word:</span>
            <code className="px-2 py-0.5 rounded bg-black/60 border border-slate-700 text-amber-300 font-bold">
              {prog?.packedHex || '0x0000000000000000'}
            </code>
          </div>
        </div>

        {/* Main Workspace Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar space-y-5">
          
          {/* Top Section: Presets Chips */}
          <div>
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                AFFINE C PRESET ARCHETYPES:
              </span>
              <span className="text-[11px] text-slate-500">
                Click preset to load C fragment &amp; test Ring0 referee
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {QCNL_PRESETS.map((preset, idx) => {
                const isSelected = selectedPreset === idx;
                const isPass = preset.expectedOutcome === 'GRANTED';
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(idx)}
                    className={`p-2 rounded-lg text-left transition-all border cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200 ring-1 ring-amber-400 shadow-md'
                        : 'bg-[#0b101c] border-[#1b263b] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="truncate">{preset.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 block truncate">{preset.origin}</span>
                    </div>

                    <div className="mt-2 pt-1 border-t border-slate-800 flex items-center justify-between text-[9px]">
                      <span className={isPass ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {preset.expectedOutcome}
                      </span>
                      <span className="text-slate-500">&theta; ~{preset.expectedTheta}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Middle Grid: C-Source Editor + Ring0 Gate Results */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left 6 cols: C Code Input & Transpiler Actions */}
            <div className="lg:col-span-6 bg-[#05070d] border border-[#1b263b] rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-amber-400" />
                    LEGACY C GAME LOOP FRAGMENT
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Input C statements (e.g. friction, vel, clamp)
                  </span>
                </div>

                <textarea
                  value={cCodeInput}
                  onChange={(e) => setCCodeInput(e.target.value)}
                  rows={8}
                  className="w-full bg-[#080c16] border border-[#1e293b] focus:border-amber-500 rounded-lg p-3 text-xs text-amber-100 font-mono focus:outline-none custom-scrollbar leading-relaxed resize-none"
                  placeholder="// Paste legacy C code here..."
                  spellCheck={false}
                />

                {/* Extracted Affine Operations Readout */}
                <div className="mt-2.5 bg-[#080d1a] border border-[#152033] rounded-lg p-2.5 text-[11px]">
                  <span className="text-[10px] text-slate-400 block font-bold mb-1">
                    EXTRACTED AFFINE OPERATIONS:
                  </span>
                  <div className="space-y-1 max-h-20 overflow-y-auto custom-scrollbar">
                    {prog?.extractedAffineOps.map((opStr, i) => (
                      <div key={i} className="text-cyan-300 font-mono text-[10px] flex items-center gap-1.5">
                        <span className="text-slate-600">&bull;</span>
                        <span>{opStr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-[#182438] flex items-center justify-between gap-3">
                <button
                  onClick={handleSubmitCustomChallenge}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 text-xs flex items-center gap-1.5"
                  title="Broadcast as Mesh Stasis Challenge to RingN peers"
                >
                  <Send className="w-3 h-3 text-cyan-400" />
                  <span>BROADCAST CHALLENGE</span>
                </button>

                <button
                  onClick={handleTranspile}
                  disabled={isTranspiling}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 border border-amber-400 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isTranspiling ? 'animate-spin' : ''}`} />
                  <span>TRANSPILE &amp; ARBITRATE (RING-0)</span>
                </button>
              </div>
            </div>

            {/* Right 6 cols: Ring-0 Gate & 64-bit Quadbit Register */}
            <div className="lg:col-span-6 bg-[#05070d] border border-[#1b263b] rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-teal-400" />
                    RING-0 CONGRUENCE GATE METRICS
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isGranted
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                      : 'bg-rose-950 text-rose-300 border-rose-600'
                  }`}>
                    {res?.status || 'PENDING'}
                  </span>
                </div>

                {/* Meter Bars */}
                <div className="space-y-3 bg-[#080d1a] border border-[#152033] rounded-lg p-3">
                  
                  {/* Theta Meter */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-300 font-bold">Congruence Factor (&theta;):</span>
                      <span className={theta > 0.95 ? 'text-emerald-300 font-bold' : 'text-rose-400 font-bold'}>
                        {theta.toFixed(4)} / Threshold: 0.9500 (0x0000F333)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative">
                      {/* 0.95 threshold mark */}
                      <div className="absolute top-0 bottom-0 left-[95%] w-0.5 bg-yellow-400 z-10" title="0.95 Gate Threshold" />
                      <div 
                        className={`h-full transition-all duration-300 ${
                          theta > 0.95 ? 'bg-gradient-to-r from-teal-500 to-emerald-400' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, theta * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Lyapunov dV/dt Meter */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-300 font-bold">Lyapunov Derivative (dV/dt):</span>
                      <span className={res?.lyapunovDeltaV! <= 0 ? 'text-emerald-300 font-bold' : 'text-rose-400 font-bold'}>
                        {res?.lyapunovDeltaV.toFixed(4)} J/tic (Must be &le; 0)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          res?.lyapunovDeltaV! <= 0 ? 'bg-emerald-400' : 'bg-rose-500'
                        }`}
                        style={{ width: `${res?.lyapunovDeltaV! <= 0 ? Math.min(100, Math.abs(res?.lyapunovDeltaV!) * 200 + 20) : 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Energy Dissipation Joules */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                    <span>Dissipated Joules Preserved:</span>
                    <strong className="text-teal-300">{res?.dissipationJoules} J</strong>
                  </div>
                </div>

                {/* 64-Bit Quadbit Register (covalent_quadbit_word_t) */}
                <div className="mt-3 bg-[#080d1a] border border-[#152033] rounded-lg p-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                    <span className="font-bold text-amber-300">64-BIT QUADBIT REGISTER:</span>
                    <span className="font-mono text-slate-500">covalent_quadbit_word_t</span>
                  </div>

                  <div className="p-2 rounded bg-black border border-slate-800 text-center">
                    <span className="text-sm font-mono font-black text-amber-300 tracking-widest">
                      {prog?.packedHex || '0x0000000000000000'}
                    </span>
                  </div>

                  {/* 16 Nibbles Opcode Breakdown */}
                  <div className="mt-2.5">
                    <span className="text-[10px] text-slate-500 block mb-1">
                      16 x 4-BIT OPCODES (F_2^4 Quadbit Stream):
                    </span>
                    <div className="grid grid-cols-8 gap-1 text-[10px] font-mono text-center">
                      {(prog?.opcodes || []).map((op, idx) => {
                        const info = QCML_OP_INFO[op];
                        return (
                          <div 
                            key={idx} 
                            className="bg-[#111827] border border-slate-700 rounded py-1 px-0.5 flex flex-col"
                            title={`[Nibble ${idx}] ${info?.name}: ${info?.desc}`}
                          >
                            <span className="text-[8px] text-slate-500">{idx}</span>
                            <span className="text-amber-300 font-bold text-[9px]">{info?.name || '0'}</span>
                            <span className="text-[8px] text-cyan-400">{op.toString(16).toUpperCase()}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {/* Message readout */}
              <div className="mt-3 text-[11px] p-2 rounded bg-black/60 border border-slate-800 text-slate-300 font-mono truncate">
                {res?.message || 'Awaiting C-logic ingestion...'}
              </div>
            </div>

          </div>

          {/* Bottom Grid: Amber Phosphor Framebuffer (/dev/fb0) + Mesh Stasis Protocol */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left 5 cols: Framebuffer Driver Canvas */}
            <div className="lg:col-span-5 bg-[#05070d] border border-amber-500/40 rounded-xl p-3.5 flex flex-col shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b263b] mb-2 text-xs">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5" />
                  FRAMEBUFFER DRIVER (/DEV/FB0)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700 font-bold">
                  16-COLOR AMBER CRT
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center bg-black rounded-lg border border-amber-900/60 p-1.5 overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto aspect-[14/9] object-contain rounded"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              <p className="text-[10px] text-slate-400 mt-2">
                Zero GPU overhead: Direct memory-mapped rasterizer displaying Lyapunov phase-plane state &amp; opcode waterfall.
              </p>
            </div>

            {/* Right 7 cols: Mesh Stasis Protocol Challenges */}
            <div className="lg:col-span-7 bg-[#05070d] border border-[#1b263b] rounded-xl p-3.5 flex flex-col shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b263b] mb-2 text-xs">
                <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  MESH STASIS PROTOCOL (RING-N PEER CHALLENGES)
                </span>
                <span className="text-[10px] text-slate-400">
                  Unix Socket / RPC Payloads
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1 flex-1">
                {pipelineState.activeChallenges.map((chal) => {
                  const isPending = chal.status === 'PENDING';
                  const isGrantedChal = chal.status === 'GRANTED';
                  return (
                    <div
                      key={chal.id}
                      className="bg-[#080d19] border border-[#1a263c] rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-200 font-mono text-[11px]">{chal.id}</strong>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                            {chal.challengerNode}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isPending ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                            isGrantedChal ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            {chal.status}
                          </span>
                        </div>

                        <code className="text-[10px] text-amber-200/90 block font-mono">
                          {chal.cFragment}
                        </code>

                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span>Word: <code className="text-slate-300">{chal.proposedWord}</code></span>
                          <span>&theta;: <strong className={chal.theta > 0.95 ? 'text-emerald-400' : 'text-rose-400'}>{chal.theta.toFixed(3)}</strong></span>
                          <span>dV/dt: <strong className={chal.lyapunovDeltaV <= 0 ? 'text-emerald-400' : 'text-rose-400'}>{chal.lyapunovDeltaV.toFixed(2)}</strong></span>
                        </div>
                      </div>

                      {/* Arbitration Buttons */}
                      {isPending && (
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleArbitrateChallenge(chal.id, true)}
                            className="px-2.5 py-1 rounded bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600 text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            GRANT
                          </button>
                          <button
                            onClick={() => handleArbitrateChallenge(chal.id, false)}
                            className="px-2.5 py-1 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-600 text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            DENY
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Challenge Bar */}
              <div className="mt-3 pt-2 border-t border-[#172338] flex items-center gap-2 text-xs">
                <span className="text-[10px] text-slate-400 whitespace-nowrap">Peer Node ID:</span>
                <input
                  type="text"
                  value={customNodeInput}
                  onChange={(e) => setCustomNodeInput(e.target.value)}
                  className="bg-[#090e1c] border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 font-mono focus:outline-none w-36"
                />
                <span className="text-[10px] text-slate-500">
                  Ready to receive STASIS_CHALLENGE packets over Ring-0 sockets.
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1f2b3e] bg-[#04060a] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Substrate Target:</span>
            <span className="text-amber-300 font-bold">QCNL Transpiler / Ring0 Arbiter</span>
            <span className="text-slate-600">&bull;</span>
            <span>Invariant $1 \equiv 1$ Congruence (&theta; &gt; 0.95)</span>
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
