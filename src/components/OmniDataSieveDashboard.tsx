import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Database,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Boxes,
  Activity,
  AudioLines,
  Play,
  RotateCw,
  Terminal,
  Layers,
  Sparkles,
  Radio,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import {
  universalQcnlProtocol,
  DATA_SIEVE_PRESETS,
  DataSievePreset
} from '../engine/node_0xOMNI_DATA_SIEVE';
import {
  OmniDataSieveState,
  ExogenousDataType
} from '../types';

interface OmniDataSieveDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OmniDataSieveDashboard: React.FC<OmniDataSieveDashboardProps> = ({
  isOpen,
  onClose
}) => {
  const [sieveState, setSieveState] = useState<OmniDataSieveState>(() => universalQcnlProtocol.getState());
  const [copiedHex, setCopiedHex] = useState<boolean>(false);
  const [rotationAngle, setRotationAngle] = useState<{ rx: number; ry: number }>({ rx: 0.4, ry: 0.6 });
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [renderWireframe, setRenderWireframe] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Subscribe to protocol singleton
  useEffect(() => {
    return universalQcnlProtocol.subscribe((next) => {
      setSieveState(next);
    });
  }, []);

  // Web Audio Sonification
  const playSoundFeedback = (passed: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (passed) {
        // Contractive harmonic major chord
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        // Kinetic shear dissonance
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio context may be restricted before interaction
    }
  };

  // Run ingestion
  const handleTriggerIngestion = () => {
    const word = universalQcnlProtocol.ingestExogenousData(
      sieveState.customPayload,
      sieveState.activeDataType,
      sieveState.selectedPresetId || 'Custom_Data_Payload'
    );
    playSoundFeedback(word !== null);
  };

  // Load Preset
  const handleSelectPreset = (preset: DataSievePreset) => {
    universalQcnlProtocol.loadPreset(preset.id);
    playSoundFeedback(!preset.isMalicious);
  };

  // Copy hex
  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 2000);
  };

  // 3D Canvas Rendering for Geometric Assets
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      const step = 24;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isAutoRotate) {
        setRotationAngle(prev => ({
          rx: prev.rx + 0.008,
          ry: prev.ry + 0.012
        }));
      }

      const procData = sieveState.currentResult?.proceduralData;
      const isPassed = sieveState.currentResult?.status === 'GRANTED';

      if (!isPassed || !procData || procData.vertices.length === 0) {
        // Draw standby / BFT reject visual
        ctx.fillStyle = isPassed ? '#64748b' : '#f43f5e';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        if (!isPassed) {
          ctx.fillStyle = '#f43f5e';
          ctx.fillText('[ 1 !== 1 ] BFT PROTOCOL DROP: NON-CONTRACTIVE MEMORY BLOCKED', width / 2, height / 2 - 10);
          ctx.fillStyle = '#fda4af';
          ctx.fillText('Zero static geometry allocated. Memory pool invariant protected.', width / 2, height / 2 + 15);
        } else {
          ctx.fillText('Select an ASSET preset to render procedural 3D affine geometry', width / 2, height / 2);
        }
        animId = requestAnimationFrame(render);
        return;
      }

      const vertices = procData.vertices;
      const indices = procData.indices;

      const cosX = Math.cos(rotationAngle.rx);
      const sinX = Math.sin(rotationAngle.rx);
      const cosY = Math.cos(rotationAngle.ry);
      const sinY = Math.sin(rotationAngle.ry);

      const fov = 320;
      const cameraZ = 3.8;

      // Project vertices
      const projected: { x: number; y: number; z: number }[] = [];
      for (let i = 0; i < vertices.length; i++) {
        const [vx, vy, vz] = vertices[i];

        // Rotate Y
        const x1 = vx * cosY - vz * sinY;
        const z1 = vx * sinY + vz * cosY;

        // Rotate X
        const y2 = vy * cosX - z1 * sinX;
        const z2 = vy * sinX + z1 * cosX + cameraZ;

        const scale = fov / Math.max(0.2, z2);
        const px = width / 2 + x1 * scale;
        const py = height / 2 + y2 * scale;

        projected.push({ x: px, y: py, z: z2 });
      }

      // Draw wireframe triangles
      ctx.lineWidth = 1;
      const triCount = indices.length;

      for (let i = 0; i < triCount; i++) {
        const [i1, i2, i3] = indices[i];
        const p1 = projected[i1];
        const p2 = projected[i2];
        const p3 = projected[i3];

        if (!p1 || !p2 || !p3) continue;

        // Depth cue
        const avgZ = (p1.z + p2.z + p3.z) / 3.0;
        const alpha = Math.max(0.15, Math.min(0.9, 1.0 - (avgZ - 2.5) * 0.35));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();

        if (!renderWireframe) {
          ctx.fillStyle = `rgba(14, 165, 233, ${alpha * 0.25})`;
          ctx.fill();
        }

        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.stroke();
      }

      // Draw vertex halos
      ctx.fillStyle = '#38bdf8';
      for (let i = 0; i < projected.length; i += 4) {
        const p = projected[i];
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
      }

      // Overlay formula
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`PROCEDURAL AFFINE GENERATOR: ${procData.proceduralFormula}`, 12, height - 14);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, rotationAngle, isAutoRotate, renderWireframe, sieveState.currentResult]);

  // Mouse drag handlers for 3D canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    setIsAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotationAngle(prev => ({
      rx: prev.rx + dy * 0.01,
      ry: prev.ry + dx * 0.01
    }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  if (!isOpen) return null;

  const currentResult = sieveState.currentResult;
  const isGranted = currentResult?.status === 'GRANTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md font-mono animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-[#070b12] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e293b] bg-[#0c1220]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Database className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-wider text-cyan-300">
                  ORGANELLE 0xCA_COVALENT // OMNI-DATA SIEVE
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                  BFT PROTOCOL GATE
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/50">
                  QUADBIT SERIALIZER
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Universal QCNL Asset & Protocol Abstraction • Geometric Affine Functions • 16-Nibble Quadbit Registers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
                COMMITTED: {sieveState.bftGrantCount}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold">
                BFT DROPS: {sieveState.bftDropCount}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          
          {/* Left Column: Preset Selector & Ingestion Controls (5 cols) */}
          <div className="col-span-5 border-r border-[#1e293b] p-4 flex flex-col gap-3.5 overflow-y-auto bg-[#090e18]">
            
            {/* DataType Tabs */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                Non-Executable Ingestion Paradigm
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#05080f] p-1 rounded-lg border border-[#1e293b] text-xs">
                {(['ASSET', 'STATE', 'PACKET'] as ExogenousDataType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => universalQcnlProtocol.setDataType(type)}
                    className={`py-1.5 px-2 rounded font-bold cursor-pointer transition-colors ${
                      sieveState.activeDataType === type
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type === 'ASSET' && '1. GEOMETRIC ASSET'}
                    {type === 'STATE' && '2. QUADBIT STATE'}
                    {type === 'PACKET' && '3. BFT PACKET'}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets List */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                Verification Archetypes
              </label>
              <div className="flex flex-col gap-1.5">
                {DATA_SIEVE_PRESETS.map((preset) => {
                  const isSelected = sieveState.selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-left p-2 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? preset.isMalicious
                            ? 'bg-rose-950/40 border-rose-500/70 text-rose-200 ring-1 ring-rose-500'
                            : 'bg-cyan-950/40 border-cyan-500/70 text-cyan-200 ring-1 ring-cyan-500'
                          : 'bg-[#0b101c] border-[#1e293b] text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{preset.name}</span>
                        {preset.isMalicious ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-900 text-rose-300 font-bold border border-rose-600">
                            MALICIOUS EXPLOIT
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900 text-emerald-300 font-bold border border-emerald-600">
                            CONTRACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* JSON / Data Payload Editor */}
            <div className="flex-1 flex flex-col min-h-[160px]">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Raw Ingest Payload (Buffer / Struct)
                </label>
                <span className="text-[10px] text-slate-500">
                  {sieveState.customPayload.length} bytes
                </span>
              </div>
              <textarea
                value={sieveState.customPayload}
                onChange={(e) => universalQcnlProtocol.setCustomPayload(e.target.value)}
                rows={7}
                className="w-full flex-1 bg-[#05080f] text-emerald-300 border border-[#1e293b] rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                placeholder="Enter JSON payload, key-value data, or state parameters..."
              />
            </div>

            {/* Ingest Action Button */}
            <button
              onClick={handleTriggerIngestion}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/40 border border-cyan-400"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>INGEST EXOGENOUS DATA INTO RING-0 SIEVE</span>
            </button>
          </div>

          {/* Right Column: Interactive Visualizers & Quadbit Registers (7 cols) */}
          <div className="col-span-7 flex flex-col h-full overflow-hidden bg-[#060a12]">
            
            {/* View Tab Switcher */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e293b] bg-[#0a0f1d] text-xs">
              <div className="flex gap-2">
                <button
                  onClick={() => universalQcnlProtocol.setTab('GEOMETRY')}
                  className={`px-3 py-1 rounded font-bold cursor-pointer transition-colors ${
                    sieveState.activeTab === 'GEOMETRY'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5" />
                    <span>1. PROCEDURAL 3D ASSET</span>
                  </div>
                </button>

                <button
                  onClick={() => universalQcnlProtocol.setTab('QUADBIT_REGISTER')}
                  className={`px-3 py-1 rounded font-bold cursor-pointer transition-colors ${
                    sieveState.activeTab === 'QUADBIT_REGISTER'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>2. 64-BIT QUADBIT REGISTER</span>
                  </div>
                </button>

                <button
                  onClick={() => universalQcnlProtocol.setTab('BFT_PROTOCOL')}
                  className={`px-3 py-1 rounded font-bold cursor-pointer transition-colors ${
                    sieveState.activeTab === 'BFT_PROTOCOL'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>3. BFT CONSENSUS HARNESS</span>
                  </div>
                </button>
              </div>

              {currentResult && (
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    isGranted
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500'
                      : 'bg-rose-950/90 text-rose-300 border-rose-500'
                  }`}>
                    {isGranted ? '1 === 1 CONGRUENCE GRANTED' : '1 !== 1 BFT POISON SHED'}
                  </span>
                </div>
              )}
            </div>

            {/* Tab Views Body */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5">
              
              {/* Verdict Banner */}
              {currentResult && (
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  isGranted
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {isGranted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold">{currentResult.bftVerdict}</span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Norm ||A||_1 = {currentResult.sieveResult.norm_1.toFixed(4)} • ||A||_inf = {currentResult.sieveResult.norm_inf.toFixed(4)} • Max Norm = {currentResult.sieveResult.max_norm.toFixed(4)} (Limit &lt; 1.0)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-2 py-1 rounded bg-[#0b101c] border border-slate-700 font-mono text-cyan-300">
                      {currentResult.quipuHash}
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 1: GEOMETRIC ASSET (CANVAS 3D + WAVEFORM) */}
              {sieveState.activeTab === 'GEOMETRY' && (
                <div className="flex-1 flex flex-col gap-3 min-h-[360px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Boxes className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold">Procedural Affine 3D Mesh Generator</span>
                      <span className="text-[10px] text-slate-500">
                        (Zero Static Vertex Arrays — Synthesized from covalent_quadbit_word_t)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <button
                        onClick={() => setIsAutoRotate(!isAutoRotate)}
                        className={`px-2 py-0.5 rounded border text-[11px] cursor-pointer ${
                          isAutoRotate ? 'bg-cyan-950 text-cyan-300 border-cyan-600' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        Auto-Spin: {isAutoRotate ? 'ON' : 'OFF'}
                      </button>
                      <button
                        onClick={() => setRenderWireframe(!renderWireframe)}
                        className={`px-2 py-0.5 rounded border text-[11px] cursor-pointer ${
                          renderWireframe ? 'bg-cyan-950 text-cyan-300 border-cyan-600' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        Wireframe: {renderWireframe ? 'ON' : 'SOLID'}
                      </button>
                    </div>
                  </div>

                  {/* 3D Canvas Box */}
                  <div className="relative flex-1 min-h-[260px] bg-[#020408] rounded-xl border border-[#1e293b] overflow-hidden flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      width={620}
                      height={300}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      className="w-full h-full cursor-grab active:cursor-grabbing"
                    />
                    <div className="absolute top-2 left-2 text-[10px] text-slate-500 bg-black/60 px-2 py-0.5 rounded border border-slate-800 pointer-events-none">
                      Drag to rotate 3D affine space
                    </div>
                  </div>

                  {/* Procedural Audio Waveform Preview */}
                  {currentResult?.proceduralData?.waveformSamples && currentResult.proceduralData.waveformSamples.length > 0 && (
                    <div className="bg-[#0b101c] p-2.5 rounded-xl border border-[#1e293b]">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <AudioLines className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-bold text-slate-300">Contractive Procedural Waveform (256 Samples)</span>
                        </div>
                        <span className="text-[10px] text-emerald-400">
                          Decay e^(-lambda*t) • Bound: [-1.0, 1.0]
                        </span>
                      </div>
                      <div className="h-12 w-full flex items-center gap-0.5 bg-[#05080f] p-1 rounded border border-slate-800">
                        {currentResult.proceduralData.waveformSamples.slice(0, 128).map((sample, i) => {
                          const heightPct = Math.max(4, Math.abs(sample) * 100);
                          const isPositive = sample >= 0;
                          return (
                            <div
                              key={i}
                              className="flex-1 flex flex-col justify-center items-center h-full"
                            >
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full rounded-xs ${
                                  isPositive ? 'bg-cyan-400' : 'bg-emerald-400'
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: 64-BIT QUADBIT REGISTER */}
              {sieveState.activeTab === 'QUADBIT_REGISTER' && (
                <div className="flex-1 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Cpu className="w-4 h-4 text-blue-400" />
                      <span className="font-bold">covalent_quadbit_word_t Register Decomposition</span>
                    </div>
                    {currentResult?.quadbitHex && (
                      <button
                        onClick={() => handleCopyHex(currentResult.quadbitHex)}
                        className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer border border-slate-700 transition-colors"
                      >
                        {copiedHex ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedHex ? 'Copied' : 'Copy 64-bit Hex'}</span>
                      </button>
                    )}
                  </div>

                  {/* Register Hex Card */}
                  <div className="bg-[#0b101c] p-3 rounded-xl border border-blue-500/40 text-center">
                    <div className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-1">
                      Raw Packed Register (BigInt 64-Bit Word)
                    </div>
                    <div className="text-xl font-mono font-bold text-cyan-300 tracking-wider">
                      {currentResult?.quadbitHex || '0x0000000000000000'}
                    </div>
                  </div>

                  {/* 16 Nibbles Matrix Grid */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                      16-Nibble Opcode Field Mapping (F2^4 Quadbit Vector)
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                      {currentResult?.nibbles?.map((nibble, idx) => {
                        const opcode = currentResult.opcodes[idx] || 'STAS';
                        const bits = (nibble & 0xF).toString(2).padStart(4, '0');
                        return (
                          <div
                            key={idx}
                            className="bg-[#090e18] p-2 rounded-lg border border-[#1e293b] flex flex-col items-center text-center"
                          >
                            <span className="text-[9px] text-slate-500 font-bold">N{15 - idx}</span>
                            <span className="text-sm font-bold text-cyan-400 my-0.5">
                              0x{nibble.toString(16).toUpperCase()}
                            </span>
                            <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800">
                              {opcode}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono mt-1">
                              {bits}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* State Record Table */}
                  {currentResult?.proceduralData?.stateRecord && Object.keys(currentResult.proceduralData.stateRecord).length > 0 && (
                    <div className="bg-[#090e18] p-3 rounded-xl border border-[#1e293b]">
                      <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Serialized State Record Channels</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(currentResult.proceduralData.stateRecord).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between p-1.5 rounded bg-[#05080f] border border-slate-800">
                            <span className="text-slate-400">{key}:</span>
                            <span className="font-bold text-emerald-400">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BFT CONSENSUS HARNESS */}
              {sieveState.activeTab === 'BFT_PROTOCOL' && (
                <div className="flex-1 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Radio className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold">C-112 Byzantine Fault Tolerant (BFT) Network Arbiter</span>
                    </div>
                  </div>

                  {/* Comparison Cards: Valid vs Exploit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-950/20 border border-emerald-500/40 p-3 rounded-xl">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-300 mb-1">
                        <span>CONTRACTIVE P2P PACKET</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-900 rounded">PASS</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        State transitions guarantee energy dissipation ($dV/dt \le 0$). Operator norm $\max(\lVert A \rVert_1, \lVert A \rVert_\infty) &lt; 1.0$. The packet is committed to the local rollback ledger with 1===1 Byzantine consensus.
                      </p>
                    </div>

                    <div className="bg-rose-950/20 border border-rose-500/40 p-3 rounded-xl">
                      <div className="flex items-center justify-between text-xs font-bold text-rose-300 mb-1">
                        <span>POISONED BYZANTINE PACKET</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-rose-900 rounded">HARD DROP</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Adversary attempting runaway kinetic velocities or infinite coordinate inflation is caught by the Banach Sieve. Resulting norm $\ge 1.0$ causes an immediate null return, terminating the malicious packet before memory allocation.
                      </p>
                    </div>
                  </div>

                  {/* Mathematical Proof Matrix */}
                  <div className="bg-[#0b101c] p-3 rounded-xl border border-[#1e293b]">
                    <div className="text-xs font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Mathematical Contraction Invariant Check</span>
                    </div>
                    <pre className="text-xs font-mono text-slate-300 bg-[#05080f] p-2.5 rounded-lg border border-slate-800 overflow-x-auto leading-relaxed">
                      {`// Ring-0 Contractive Verification Equation
||A||_1   = max_j sum_i |A_ij| = ${currentResult?.sieveResult.norm_1.toFixed(6) || '0.000000'}
||A||_inf = max_i sum_j |A_ij| = ${currentResult?.sieveResult.norm_inf.toFixed(6) || '0.000000'}
max(||A||_1, ||A||_inf)        = ${currentResult?.sieveResult.max_norm.toFixed(6) || '0.000000'}
Lyapunov Dissipation Threshold = 1.000000 (0x00010000 in Q16.16)

Verdict: ${isGranted ? '1 === 1 CONGRUENCE CONFIRMED (Fixed-point contraction guaranteed)' : '1 !== 1 EXPANSION DETECTED (BFT Dropped via C-112 harness)'}`}
                    </pre>
                  </div>

                  {/* History Ledger */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                      Recent Ingestion History
                    </label>
                    <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                      {sieveState.history.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center justify-between px-3 py-1.5 rounded bg-[#090e18] border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              h.status === 'GRANTED' ? 'bg-emerald-400' : 'bg-rose-400'
                            }`} />
                            <span className="font-bold text-slate-300">{h.name}</span>
                            <span className="text-[10px] text-slate-500">[{h.dataType}]</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-cyan-400 text-[11px]">{h.quadbitHex.slice(0, 10)}...</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              h.status === 'GRANTED' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                            }`}>
                              {h.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-[#1e293b] bg-[#0c1220] text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Universal QCNL Asset & Protocol Abstraction Active</span>
            </span>
            <span className="text-slate-600">|</span>
            <span>Invariant: 1 === 1</span>
            <span className="text-slate-600">|</span>
            <span>covalent_quadbit_word_t: 16-nibbles (64-bit)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Target Substrate:</span>
            <span className="text-slate-300 font-bold">Ring-0 Omni-Data Sieve (0xCA)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
