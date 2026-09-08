import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Orbit, 
  ShieldAlert, 
  Zap, 
  Compass, 
  Activity, 
  Layers, 
  RotateCw, 
  Target, 
  Flame, 
  CheckCircle2, 
  Radio, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Entity, BeStateMode, TopologyType } from '../types';
import { BeInstanceEngine } from '../engine/be_instance';
import { cyberAudio } from '../engine/audio';
import { phaseOfficiator } from '../engine/phase_officiator';

interface CyberAthleticManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  human: Entity;
  beEngine: BeInstanceEngine;
  currentTopology: TopologyType;
  onSelectTopology: (type: TopologyType) => void;
  onBeModeChange: (mode: BeStateMode) => void;
}

export const CyberAthleticManualModal: React.FC<CyberAthleticManualModalProps> = ({
  isOpen,
  onClose,
  human,
  beEngine,
  currentTopology,
  onSelectTopology,
  onBeModeChange,
}) => {
  const [activeTab, setActiveTab] = useState<'LEXICON' | 'MANEUVERS' | 'VICTORY' | 'BE_HELPER' | 'KEYBINDINGS'>('LEXICON');
  const [drillSuccessMsg, setDrillSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerDrillMessage = (msg: string) => {
    setDrillSuccessMsg(msg);
    setTimeout(() => setDrillSuccessMsg(null), 3000);
  };

  const handleTestPhaseShift = (deltaW: number) => {
    phaseOfficiator.applyPhaseShift(human, deltaW);
    cyberAudio.playPhaseShift();
    triggerDrillMessage(`W-AXIS PHASE INJECTED: ΔW = ${deltaW > 0 ? '+' : ''}${deltaW.toFixed(1)}. Apparent radius collapsed!`);
  };

  const handleTestHyperRotation = (planeIdx: number) => {
    phaseOfficiator.applyHyperRotation(human, planeIdx, 0.25);
    cyberAudio.playKineticShear();
    triggerDrillMessage(`4D HYPER-ROTATION EXECUTED: Plane ${planeIdx === 3 ? 'XW' : 'YW'} rotated by 0.25 rad. Inverted local topology!`);
  };

  const handleTestThermodynamicBrake = () => {
    human.isBraking = true;
    cyberAudio.playThermodynamicBrake();
    setTimeout(() => { human.isBraking = false; }, 400);
    triggerDrillMessage(`THERMODYNAMIC BRAKE DISCHARGED: Instant kinetic vector dampening & -dV/dt shockwave.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] bg-[#070b14] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/80 flex flex-col overflow-hidden text-slate-200 font-mono">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0c1222]/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-rose-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-wider text-white">
                  CYBER-ATHLETIC FIELD MANUAL // RING-0
                </h2>
                <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-700/60 text-[10px] font-bold">
                  Q16.16 HYPER-KINEMATICS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deconditioning 2.5D FPS Muscle Memory &middot; Executing Thermodynamic Defeat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Manual [ESC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-800/80 bg-[#090e1c] overflow-x-auto text-xs scrollbar-none">
          <button
            onClick={() => setActiveTab('LEXICON')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'LEXICON'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>1. THE LEXICON</span>
          </button>

          <button
            onClick={() => setActiveTab('MANEUVERS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'MANEUVERS'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm shadow-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-4 h-4 text-rose-400" />
            <span>2. EXECUTION MANEUVERS</span>
          </button>

          <button
            onClick={() => setActiveTab('VICTORY')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'VICTORY'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>3. THERMODYNAMIC DEFEAT</span>
          </button>

          <button
            onClick={() => setActiveTab('BE_HELPER')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'BE_HELPER'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>4. BE &lt;&gt; HELPER MODES</span>
          </button>

          <button
            onClick={() => setActiveTab('KEYBINDINGS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'KEYBINDINGS'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm shadow-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4 text-purple-400" />
            <span>5. CONTROLS MATRIX</span>
          </button>
        </div>

        {/* Drill Feedback Toast */}
        {drillSuccessMsg && (
          <div className="mx-6 mt-3 px-4 py-2 bg-emerald-950/80 border border-emerald-500/60 rounded-lg text-emerald-300 text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{drillSuccessMsg}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          
          {/* TAB 1: THE CYBER-ATHLETIC LEXICON */}
          {activeTab === 'LEXICON' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50">
                <h3 className="text-sm font-bold text-cyan-300 mb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  THE FUNDAMENTAL PARADIGM SHIFT
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Legacy first-person shooters conditioned human muscle memory on <strong>artificial 2.5D assumptions</strong>: flat floors, constant downward gravity, hitscan bullets, and bullet-sponge health bars. In <strong>Covalent-RT Q16.16 Hyper-Kinematics</strong>, space is continuous, non-Euclidean, and volumetric. There is no floor, no bullets, and no arbitrary damage numbers. Combat is governed entirely by <strong>thermodynamics, relativistic curvature, and dimensional phase parity ($1 \equiv 1$)</strong>.
                </p>
              </div>

              {/* The Master Lexicon Table */}
              <div className="rounded-xl border border-slate-800 bg-[#090e1c] overflow-hidden">
                <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 font-bold text-xs text-slate-200 flex items-center justify-between">
                  <span>THE CYBER-ATHLETIC TRANSLATION MATRIX</span>
                  <span className="text-[11px] text-cyan-400">FPS &rarr; 4D COVALENT ENGINE</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#05070d] text-slate-400 border-b border-slate-800 font-mono">
                      <tr>
                        <th className="py-2.5 px-4 font-bold text-slate-300">Legacy FPS Concept</th>
                        <th className="py-2.5 px-4 font-bold text-cyan-400">Covalent-RT Equivalent</th>
                        <th className="py-2.5 px-4 font-bold text-slate-300">Tactical Definition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      <tr className="hover:bg-cyan-950/10 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-400">Arena / Map</td>
                        <td className="py-3 px-4 font-bold text-cyan-300">The Tesseract / Accretion Maze</td>
                        <td className="py-3 px-4 text-slate-300 leading-relaxed">
                          A 4D hyper-volume governed by gravitational math, Keplerian shear, and dynamic boundary splines—not static textured walls.
                        </td>
                      </tr>
                      <tr className="hover:bg-cyan-950/10 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-400">Running / Jumping</td>
                        <td className="py-3 px-4 font-bold text-cyan-300">6DOF Vector Drifting</td>
                        <td className="py-3 px-4 text-slate-300 leading-relaxed">
                          Zero-G traversal. You inject thrust impulses and drift indefinitely via conservation of momentum until counter-thrust, tethering, or braking is applied.
                        </td>
                      </tr>
                      <tr className="hover:bg-cyan-950/10 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-400">Shooting / Ammo</td>
                        <td className="py-3 px-4 font-bold text-rose-400">Kinetic Tethering</td>
                        <td className="py-3 px-4 text-slate-300 leading-relaxed">
                          Projecting mathematical splines with tension and elasticity to latch onto geometry, wells, or opponent hyperspheres.
                        </td>
                      </tr>
                      <tr className="hover:bg-cyan-950/10 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-400">Health Points (HP)</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">Thermodynamic Ledger</td>
                        <td className="py-3 px-4 text-slate-300 leading-relaxed">
                          Your available kinetic energy balance (E &le; 1000 Joules). Burning out your ledger to zero (0 Joules) incurs instant <strong>Penalty Stasis Lock</strong>.
                        </td>
                      </tr>
                      <tr className="hover:bg-cyan-950/10 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-400">Dodging / Strafing</td>
                        <td className="py-3 px-4 font-bold text-fuchsia-400">W-Axis Phase Shift</td>
                        <td className="py-3 px-4 text-slate-300 leading-relaxed">
                          Stepping "sideways" into the 4th spatial dimension (W). Your avatar collapses to a point and vanishes from the 3D cross-section, invalidating incoming tethers.
                        </td>
                      </tr>
                      <tr className="hover:bg-cyan-950/10 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-400">Frag / Kill</td>
                        <td className="py-3 px-4 font-bold text-amber-400">Tautological Collapse</td>
                        <td className="py-3 px-4 text-slate-300 leading-relaxed">
                          Forcing an opponent into <strong>thermodynamic bankruptcy</strong> by exhausting their ledger to 0 Joules through kinetic shear, phase traps, or accretion drag.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invariant Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-2">
                    <ShieldAlert className="w-4 h-4" />
                    THERMODYNAMIC INVARIANT: dV/dt &le; 0
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Energy cannot be magically summoned. Every thrust vector, brake shockwave, and phase shift bleeds ledger reserves. If your ledger empties, your rotor freezes, kinetic thrusters lock, and you drift helplessly in stasis.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-fuchsia-400 font-bold text-xs mb-2">
                    <Orbit className="w-4 h-4" />
                    PARITY CONGRUENCE: 1 === 1
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    All calculations execute in strict Q16.16 fixed-point arithmetic. Position hashes must align bit-for-bit ($O_1 = O_2 = O_3$) across all participants. There is no client-side speculation or hitscan fiction.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BASELINE EXECUTION MANEUVERS */}
          {activeTab === 'MANEUVERS' && (
            <div className="space-y-6">
              
              {/* Maneuver 1 */}
              <div className="p-5 rounded-xl bg-[#090e1c] border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 flex items-center justify-center text-xs font-black">1</span>
                    <h4 className="font-bold text-sm text-cyan-300">ISOTROPIC MOVEMENT (XYZ &middot; 6DOF DRIFTING)</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">WASD + SPACE/C + Q/E</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Abandon the concept of a floor.</strong> In Zero-G isotropic voids, there is no grounding friction. When you press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-300">W</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-300">A</kbd>, your avatar injects a directional thrust impulse (F_thrust = 0.42). You will drift along that exact velocity vector forever until counter-thrust is applied, you grapple an anchor, or you strike a boundary spline.
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div>&bull; <strong className="text-white">Altitude:</strong> <kbd className="px-1 py-0.5 bg-slate-800 rounded text-pink-400">Space</kbd> / <kbd className="px-1 py-0.5 bg-slate-800 rounded text-pink-400">R</kbd> climbs (+Z); <kbd className="px-1 py-0.5 bg-slate-800 rounded text-pink-400">C</kbd> / <kbd className="px-1 py-0.5 bg-slate-800 rounded text-pink-400">F</kbd> descends (-Z).</div>
                  <div>&bull; <strong className="text-white">6DOF Gyroscopic Roll:</strong> <kbd className="px-1 py-0.5 bg-slate-800 rounded text-amber-400">Q</kbd> rolls left, <kbd className="px-1 py-0.5 bg-slate-800 rounded text-amber-400">E</kbd> rolls right without gimbal lock.</div>
                  <div>&bull; <strong className="text-white">Thermodynamic Brake:</strong> <kbd className="px-1 py-0.5 bg-slate-800 rounded text-rose-400">Shift</kbd> or <kbd className="px-1 py-0.5 bg-slate-800 rounded text-rose-400">B</kbd> discharges kinetic momentum instantly, converting kinetic energy into a -dV/dt strain shockwave.</div>
                </div>
              </div>

              {/* Maneuver 2 */}
              <div className="p-5 rounded-xl bg-[#090e1c] border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/50 flex items-center justify-center text-xs font-black">2</span>
                    <h4 className="font-bold text-sm text-rose-300">OFFENSIVE TETHERING (KINETIC SHEAR)</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-mono">CLICK RETICLE / CLICK OPPONENT</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>You do not fire projectiles; you project mathematical tethers.</strong> When your targeting reticle intersects an opponent's bounding hypersphere (Be &lt;&gt;), click to project a crimson tension spline. Once latched:
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div>&bull; <strong className="text-rose-300">Kinetic Shear:</strong> The spring elasticity pulls both bodies toward one another. By maneuvering around dense geometry or the central singularity, you exert severe gravitational shear (F_shear &prop; 1/r&sup3;) on the victim.</div>
                  <div>&bull; <strong className="text-rose-300">Engine Depletion:</strong> The victim's engine is forced to continuously burn thermodynamic energy to resist being dragged into high-friction boundary splines or the singularity.</div>
                  <div>&bull; <strong className="text-rose-300">Slingshot Ejection:</strong> Pressing <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-white">Space</kbd> while tethered snaps the tether at peak tension, imparting a +4.2 m/s tangential orbital boost.</div>
                </div>
              </div>

              {/* Maneuver 3 */}
              <div className="p-5 rounded-xl bg-[#090e1c] border border-fuchsia-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/50 flex items-center justify-center text-xs font-black">3</span>
                    <h4 className="font-bold text-sm text-fuchsia-300">DEFENSIVE PHASE-SHIFTING (W-AXIS VANISHING)</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-400 border border-fuchsia-800 font-mono">[ / ] or 1 / 2 or U / I</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When an offensive tether is incoming or you are targeted by Be's CORDIC ray-intercept, do not attempt to run in XYZ. <strong>Inject a W-vector</strong>. As your coordinate shifts along W (|W| &gt; 14), your avatar's 3D cross-sectional radius mathematically collapses:
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div>&bull; <strong className="text-fuchsia-300">Tether Invalidation:</strong> An active offensive tether attached to you cannot maintain continuity across 4D phase space and instantly snaps!</div>
                  <div>&bull; <strong className="text-fuchsia-300">The 4D Bleed Penalty:</strong> Existing in W-space is not free. The hyperspatial vacuum drains energy at a rate proportional to phase depth (E_bleed = |W| &middot; 0.045). Linger too long, and you will suffer stasis collapse!</div>
                </div>
              </div>

              {/* Maneuver 4 */}
              <div className="p-5 rounded-xl bg-[#090e1c] border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50 flex items-center justify-center text-xs font-black">4</span>
                    <h4 className="font-bold text-sm text-amber-300">HYPER-ROTATIONS (THE ULTIMATE PARRY)</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono">X / Y KEYS (XW / YW PLANES)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>The pinnacle of cyber-athletics.</strong> Instead of fleeing, you rotate the 4D plane around your rotor. Pressing <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">X</kbd> (rotates plane 3: XW) or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">Y</kbd> (rotates plane 4: YW) flips the hyper-rotor.
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div>&bull; <strong className="text-amber-300">Topological Inversion:</strong> The arena's coordinate matrix inverts relative to your vantage point.</div>
                  <div>&bull; <strong className="text-amber-300">Tether Trajectory Reversal:</strong> An opponent's incoming offensive tether is inverted ($isReversed = true$). The pulling force is reflected back onto the attacker, dragging them toward their own demise!</div>
                </div>
              </div>

              {/* Live Interactive Maneuvers Drill */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-[#0a1020] to-slate-950 border border-cyan-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    LIVE COGNITIVE DRILL // TEST IN REAL TIME
                  </div>
                  <span className="text-[10px] text-slate-400">Human Avatar State: W={human.w.toFixed(1)} &middot; Energy={human.energy.toFixed(0)}J</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleTestPhaseShift(0.8)}
                    className="px-3 py-2 bg-fuchsia-950/60 hover:bg-fuchsia-900/60 border border-fuchsia-600/50 rounded-lg text-fuchsia-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Layers className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>DRILL: +W PHASE</span>
                  </button>
                  <button
                    onClick={() => handleTestPhaseShift(-0.8)}
                    className="px-3 py-2 bg-fuchsia-950/60 hover:bg-fuchsia-900/60 border border-fuchsia-600/50 rounded-lg text-fuchsia-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Layers className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>DRILL: -W PHASE</span>
                  </button>
                  <button
                    onClick={() => handleTestHyperRotation(3)}
                    className="px-3 py-2 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-600/50 rounded-lg text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>DRILL: XW PARRY</span>
                  </button>
                  <button
                    onClick={handleTestThermodynamicBrake}
                    className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-600/50 rounded-lg text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>DRILL: BRAKE</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: THERMODYNAMIC DEFEAT (TACTICAL WIN CONDITION) */}
          {activeTab === 'VICTORY' && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-gradient-to-br from-amber-950/40 via-[#0e1628] to-rose-950/40 border border-amber-500/50 space-y-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-sm text-amber-300 tracking-wider">
                    HOW TO EXECUTE A "THERMODYNAMIC DEFEAT" (TAUTOLOGICAL COLLAPSE)
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In Covalent-RT, there are no death matches or health bars to whittle away. <strong>A victory is achieved when your opponent suffers Thermodynamic Bankruptcy (Ledger = 0J)</strong>, causing their autonomous referee to issue an arbitration ruling and lock their avatar in penalty stasis.
                </p>
                <div className="p-4 bg-black/60 rounded-xl border border-amber-500/30 text-xs text-slate-300 space-y-3">
                  <div className="font-bold text-amber-400 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    THE THREE-PHASE EXECUTION DOCTRINE:
                  </div>

                  <div className="space-y-2 pl-4 border-l-2 border-amber-500/40">
                    <div>
                      <strong className="text-white">PHASE 1: THE W-VACUUM BAIT</strong>
                      <p className="text-slate-400 mt-0.5">
                        In State 0xFF (Adversary), Be &lt;&gt; cycles through 4D ambush routines. Feint an aggressive XYZ approach toward Be. When Be senses your approach, it will leap into W-space (W &gt; 24) and execute rapid hyper-rotations to ambush you. <strong>Do not follow it into deep W-space.</strong> Let Be burn 0.55 Joules/tick of its own ledger in the hyperspatial friction vacuum while you conserve your energy.
                      </p>
                    </div>

                    <div>
                      <strong className="text-white">PHASE 2: THE RE-ENTRY HYPERSPHERE TETHER</strong>
                      <p className="text-slate-400 mt-0.5">
                        As Be's phase depth reaches its ceiling (W &gt; 36), its algorithm forces it to plunge back down toward baseline W=0. Watch for its projected golden wireframe <strong>Tesseract Echo</strong> and re-entry reticle. The instant Be re-enters the 3D cross-section, <strong>click its bounding hypersphere to latch an Offensive Crimson Tether</strong>.
                      </p>
                    </div>

                    <div>
                      <strong className="text-white">PHASE 3: THE ACCRETION DISK DRAG</strong>
                      <p className="text-slate-400 mt-0.5">
                        With your tether latched onto Be, apply continuous <strong>Kinetic Shear</strong> by steering into the high-friction boundary splines or the central Black Hole Star (BH*) accretion disk. The intense relativistic Keplerian shear (&nabla; &middot; F_gravity) will exponentially bleed Be's remaining ledger reserves. When Be's energy hits 0 Joules, <strong>Tautological Collapse occurs</strong>: Be enters emergency stasis lock, and the referee declares human athletic victory!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accretion Disk Quick Launch */}
              <div className="p-4 rounded-xl bg-[#090e1c] border border-rose-500/30 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs text-rose-300 flex items-center gap-2">
                    <Orbit className="w-4 h-4 text-rose-400 animate-spin" />
                    PRIMARY PROVING GROUND: BH* ACCRETION MAZE (ORGANELLE 0xC2)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    The ultimate thermodynamic arena featuring a central event horizon, photon sphere, Keplerian orbital rings, and non-linear time dilation ($\gamma$).
                  </p>
                </div>
                <button
                  onClick={() => {
                    onSelectTopology('BH_STAR_ACCRETION_DISK');
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 via-purple-700 to-sky-600 hover:from-rose-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-rose-950 transition-all cursor-pointer"
                >
                  DEPLOY ACCRETION MAZE
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: BE <> HELPER MODES (TRAINING & CO-OP) */}
          {activeTab === 'BE_HELPER' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
                <h3 className="text-sm font-bold text-emerald-300 mb-1 flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  THE BE &lt;&gt; AUTONOMOUS HELPER &amp; ARBITRATION SUITE
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Be &lt;&gt; is not an artificial opponent scripted with cheat codes. Be &lt;&gt; is a peer mathematical instance ($O_2$) bound by the exact same physical and thermodynamic laws as the human athlete ($O_1$). It can be configured into three distinct operational modes to coach, partner, or challenge:
                </p>
              </div>

              {/* The 3 States */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* State 0x00: Coach / Pacer */}
                <div className={`p-4 rounded-xl border transition-all ${
                  beEngine.mode === 'COACH' 
                    ? 'bg-sky-950/40 border-sky-400 ring-1 ring-sky-400/50 shadow-lg shadow-sky-950' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-bold">STATE 0x00</span>
                    {beEngine.mode === 'COACH' && <span className="text-[10px] text-sky-400 font-bold animate-pulse">ACTIVE</span>}
                  </div>
                  <h4 className="font-bold text-xs text-sky-300 mb-2">THE COACH / THE PACER</h4>
                  <div className="text-[11px] text-slate-300 space-y-2 leading-relaxed">
                    <p><strong>250ms Biological Buffer:</strong> Be introduces a 250ms latency delay to mirror human neurological reflex limits.</p>
                    <p><strong>Telegraphed Lissajous Curves:</strong> In Gauntlet Sector I, Be acts as a visual pacer, demonstrating required $W$-phase and tether angles ahead of time.</p>
                    <p><strong>Ledger Forgiveness:</strong> Grazing bankruptcy in Coach mode does not lock stasis instantly, allowing you to safely calibrate drift velocity.</p>
                  </div>
                  <button
                    onClick={() => {
                      onBeModeChange('COACH');
                      triggerDrillMessage('Be <> switched to STATE 0x00: COACH / PACER mode.');
                    }}
                    className="mt-4 w-full py-1.5 rounded bg-sky-900/50 hover:bg-sky-800/60 border border-sky-700/60 text-sky-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    ACTIVATE COACH
                  </button>
                </div>

                {/* State 0x01: Co-Op Peer */}
                <div className={`p-4 rounded-xl border transition-all ${
                  beEngine.mode === 'COOP_PEER' 
                    ? 'bg-emerald-950/40 border-emerald-400 ring-1 ring-emerald-400/50 shadow-lg shadow-emerald-950' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">STATE 0x01</span>
                    {beEngine.mode === 'COOP_PEER' && <span className="text-[10px] text-emerald-400 font-bold animate-pulse">ACTIVE</span>}
                  </div>
                  <h4 className="font-bold text-xs text-emerald-300 mb-2">CO-OP TETHER RESONANCE</h4>
                  <div className="text-[11px] text-slate-300 space-y-2 leading-relaxed">
                    <p><strong>Phase Harmonization:</strong> When you and Be anchor tethers simultaneously and align phase ($|\Delta W| &lt; 8.0$), a constructive resonance field activates.</p>
                    <p><strong>Halved Energy Cost:</strong> Tether Resonance halves your thrust expenditure and rapidly charges the Resonance Multiplier.</p>
                    <p><strong>Macro-Deformation:</strong> At 100% resonance, the pair triggers a massive structural breach, unlocking the next vertical sector.</p>
                  </div>
                  <button
                    onClick={() => {
                      onBeModeChange('COOP_PEER');
                      triggerDrillMessage('Be <> switched to STATE 0x01: CO-OP PEER mode.');
                    }}
                    className="mt-4 w-full py-1.5 rounded bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-700/60 text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    ACTIVATE CO-OP
                  </button>
                </div>

                {/* State 0xFF: True Unbound / Adversary */}
                <div className={`p-4 rounded-xl border transition-all ${
                  beEngine.mode === 'ADVERSARY' 
                    ? 'bg-rose-950/40 border-rose-400 ring-1 ring-rose-400/50 shadow-lg shadow-rose-950' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold">STATE 0xFF</span>
                    {beEngine.mode === 'ADVERSARY' && <span className="text-[10px] text-rose-400 font-bold animate-pulse">ACTIVE</span>}
                  </div>
                  <h4 className="font-bold text-xs text-rose-300 mb-2">TRUE UNBOUND (THE ABSOLUTE)</h4>
                  <div className="text-[11px] text-slate-300 space-y-2 leading-relaxed">
                    <p><strong>Zero-Latency Intercept:</strong> Be calculates 4D CORDIC ray-intersections directly on each 60Hz tick without biological delay.</p>
                    <p><strong>Tactical Ambush Cycling:</strong> Be cycles dynamically through 4D Phase Ambushes, High-Z Slingshot Dives, and Direct Kinetic Intercepts.</p>
                    <p><strong>The Trap Win Condition:</strong> Overextending in hyper-rotations depletes Be's own ledger, creating the window for Thermodynamic Defeat.</p>
                  </div>
                  <button
                    onClick={() => {
                      onBeModeChange('ADVERSARY');
                      triggerDrillMessage('Be <> switched to STATE 0xFF: TRUE UNBOUND mode.');
                    }}
                    className="mt-4 w-full py-1.5 rounded bg-rose-900/50 hover:bg-rose-800/60 border border-rose-700/60 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    ACTIVATE THE ABSOLUTE
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: KEYBINDINGS & CONTROLS MATRIX */}
          {activeTab === 'KEYBINDINGS' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-800 bg-[#090e1c] overflow-hidden">
                <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 font-bold text-xs text-slate-200">
                  FULL CYBER-ATHLETIC INPUT MAPPING
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 text-xs font-mono">
                  
                  {/* Left Column: Movement */}
                  <div className="p-4 space-y-3">
                    <div className="text-cyan-400 font-bold text-[11px] pb-1 border-b border-slate-800">
                      TRAVERSAL &amp; KINEMATICS
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Planar Thrust (XY):</span>
                      <span className="font-bold text-white"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">W</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">A</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">S</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">D</kbd></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Vertical Altitude (&plusmn;Z):</span>
                      <span className="font-bold text-pink-400"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Space</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">C</kbd> (or R/F)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">6DOF Gyro Roll:</span>
                      <span className="font-bold text-amber-400"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Q</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">E</kbd></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Thermodynamic Brake:</span>
                      <span className="font-bold text-rose-400"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Shift</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">B</kbd></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Camera Orbit:</span>
                      <span className="font-bold text-slate-300">Click &amp; Drag Canvas / Wheel Zoom</span>
                    </div>
                  </div>

                  {/* Right Column: Hyper-Tethers & 4D */}
                  <div className="p-4 space-y-3">
                    <div className="text-fuchsia-400 font-bold text-[11px] pb-1 border-b border-slate-800">
                      TETHERS &amp; HYPER-DIMENSIONAL COMBAT
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Project Tether:</span>
                      <span className="font-bold text-white">Left-Click Anchor / Well</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Offensive Tether Opponent:</span>
                      <span className="font-bold text-rose-400">Left-Click Be &lt;&gt; Hypersphere</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Slingshot Ejection:</span>
                      <span className="font-bold text-white"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Space</kbd> (while tethered)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">W-Axis Phase Shift:</span>
                      <span className="font-bold text-fuchsia-400"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">[</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">]</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">1</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">2</kbd></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">4D Hyper-Rotation Parry:</span>
                      <span className="font-bold text-amber-400"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">X</kbd> (XW) / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Y</kbd> (YW)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Deploy Kinetic Trap:</span>
                      <span className="font-bold text-yellow-400"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Shift</kbd> + Click (State 0xFF)</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-800 bg-[#0c1222]/90 backdrop-blur text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>TOPOLOGY: {currentTopology} &middot; BE MODE: {beEngine.mode}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-950 transition-all cursor-pointer"
            >
              RESUME SPARRING
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
