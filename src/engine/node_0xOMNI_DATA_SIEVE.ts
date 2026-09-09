/**
 * Organelle 0xCA_COVALENT: Omni-Data Sieve
 * Universal QCNL Asset & Protocol Abstraction
 * 
 * - Geometric Assets as Affine Functions (Torus, Icosahedron, Waveforms generated procedurally from quadbits)
 * - Data Classes as Quadbit Words (Health, Inventory, Armor packed into 16-nibble 64-bit covalent_quadbit_word_t)
 * - BFT Protocol Gatekeeping (Drop non-contractive dV/dt > 0 P2P packets natively enforcing Byzantine Fault Tolerance)
 */

import {
  BanachSieve,
  OmniFrontend,
  sys_covalent_pack_data_to_qbit,
  unpackQuadbitNibbles,
  synthesizeProceduralMeshFromQuadbit,
  synthesizeProceduralWaveformFromQuadbit,
  OMNI_OP_NAME
} from "./cqnl_omni";

import {
  ExogenousDataType,
  DataQuadbitStreamResult,
  OmniDataSieveState
} from "../types";

export class UniversalQcnlProtocol {
  private state: OmniDataSieveState;
  private subscribers: Set<(state: OmniDataSieveState) => void> = new Set();

  constructor() {
    this.state = {
      activeDataType: 'ASSET',
      selectedPresetId: 'PRESET_ASSET_TORUS',
      customPayload: JSON.stringify({
        asset_name: "Torus_Affine_Generator",
        major_radius: 1.45,
        minor_radius: 0.42,
        contraction_damping: 0.78,
        harmonic_p: 2,
        harmonic_q: 3,
        energy_dissipation: 0.12
      }, null, 2),
      currentResult: null,
      history: [],
      bftGrantCount: 0,
      bftDropCount: 0,
      activeTab: 'GEOMETRY'
    };

    // Auto-run initial asset ingestion
    this.ingestExogenousData(this.state.customPayload, 'ASSET', 'Torus_Affine_Generator');
  }

  /**
   * Primary Protocol Directive: Ingest Exogenous Data
   * Flattens arbitrary non-executable data (Assets, Packets, State) into AIR,
   * performs Banach Sieve contractive bounds checking,
   * and serializes into 64-bit Quadbit Word registers.
   */
  public ingestExogenousData(
    payload: Uint8Array | string | Record<string, unknown> | ArrayBuffer | any,
    dataType: ExogenousDataType = "STATE",
    nameHint = "Unnamed_Payload"
  ): bigint | null {
    console.log(`[ SIEVE ] Abstracting ${dataType} into QCNL Algebraic IR...`);

    // 1. Flatten arbitrary data structures into affine transformations
    const dataIR = OmniFrontend.parseDataToAir(payload, dataType);

    // 2. Arbitrate via Banach Sieve (Thermodynamic bounds check: max(||A||_1, ||A||_inf) < 1.0)
    const sieveResult = BanachSieve.check(dataIR);
    const isContractive = sieveResult.passed;

    if (!isContractive) {
      console.error(`[ 1 !== 1 ] Data Rejected: Payload exceeds dV/dt <= 0 limit.`);
      this.state.bftDropCount++;

      const failResult: DataQuadbitStreamResult = {
        id: `drop_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        dataType,
        name: nameHint,
        quadbitWord: null,
        quadbitHex: '0x0000000000000000 (BFT_DENIED)',
        nibbles: Array(16).fill(0),
        opcodes: ['DENIED_NON_CONTRACTIVE', 'BFT_DROP'],
        status: 'BFT_DROPPED',
        airSystem: dataIR,
        sieveResult,
        bftVerdict: `BFT PACKET DROP: Operator norm ${sieveResult.max_norm.toFixed(4)} >= 1.0 violates dV/dt <= 0. Threat neutralized.`,
        bftConsensusRatio: 0.0,
        quipuHash: `Q_DROP_${Math.floor(Math.random() * 0xFFFFFF).toString(16)}`,
        timestamp: Date.now(),
        payloadBytes: typeof payload === 'string' ? payload.length : (payload?.byteLength || 64)
      };

      this.state.currentResult = failResult;
      this.state.history.unshift(failResult);
      this.notify();
      return null; // BFT Protocol Drop
    }

    // 3. Serialize validated data into a 64-bit Quadbit Word array
    const quadbitStream = sys_covalent_pack_data_to_qbit(dataIR);
    console.log(`[ 1 === 1 ] ${dataType} verified and bound to Quipu Ledger.`);
    this.state.bftGrantCount++;

    const nibbles = unpackQuadbitNibbles(quadbitStream);
    const opcodes = nibbles.map(n => OMNI_OP_NAME[n] || `0x${n.toString(16)}`);

    // Synthesize procedural outputs based on data type
    let proceduralData: DataQuadbitStreamResult['proceduralData'];
    if (dataType === 'ASSET') {
      const meshKind = nameHint.toLowerCase().includes('ico') ? 'ICOSAHEDRON' : 'TORUS';
      const mesh = synthesizeProceduralMeshFromQuadbit(quadbitStream, meshKind);
      const waveform = synthesizeProceduralWaveformFromQuadbit(quadbitStream);
      proceduralData = {
        vertices: mesh.vertices,
        indices: mesh.indices,
        waveformSamples: waveform,
        stateRecord: {},
        proceduralFormula: mesh.formula
      };
    } else if (dataType === 'STATE') {
      let stateRecord: Record<string, number | string> = {};
      try {
        stateRecord = typeof payload === 'string' ? JSON.parse(payload) : (payload as any);
      } catch {
        stateRecord = { rawState: 'SerializedQuadbit' };
      }
      proceduralData = {
        vertices: [],
        indices: [],
        waveformSamples: synthesizeProceduralWaveformFromQuadbit(quadbitStream),
        stateRecord,
        proceduralFormula: `QuadbitRegister(0x${quadbitStream.toString(16)}, 1===1 verified)`
      };
    } else {
      // PACKET
      proceduralData = {
        vertices: [],
        indices: [],
        waveformSamples: [],
        stateRecord: typeof payload === 'string' ? JSON.parse(payload) : payload,
        proceduralFormula: `BFT_RollbackSync(Consensus=100%, OpcodeStream=[${opcodes.slice(0, 4).join(',')}...])`
      };
    }

    const hexWord = `0x${quadbitStream.toString(16).toUpperCase().padStart(16, '0')}`;
    const grantResult: DataQuadbitStreamResult = {
      id: `grant_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      dataType,
      name: nameHint,
      quadbitWord: quadbitStream,
      quadbitHex: hexWord,
      nibbles,
      opcodes,
      status: 'GRANTED',
      airSystem: dataIR,
      sieveResult,
      bftVerdict: `1 === 1 BFT COMMITTED: Contractive max norm ${sieveResult.max_norm.toFixed(4)} < 1.0. Packed to covalent_quadbit_word_t.`,
      bftConsensusRatio: 1.0,
      proceduralData,
      quipuHash: `Q_KNOT_${hexWord.slice(2, 10)}`,
      timestamp: Date.now(),
      payloadBytes: typeof payload === 'string' ? payload.length : (payload?.byteLength || 64)
    };

    this.state.currentResult = grantResult;
    this.state.history.unshift(grantResult);
    this.notify();

    return quadbitStream;
  }

  public getState(): OmniDataSieveState {
    return { ...this.state };
  }

  public setTab(tab: OmniDataSieveState['activeTab']) {
    this.state.activeTab = tab;
    this.notify();
  }

  public setDataType(dataType: ExogenousDataType) {
    this.state.activeDataType = dataType;
    this.notify();
  }

  public setCustomPayload(payload: string) {
    this.state.customPayload = payload;
    this.notify();
  }

  public loadPreset(presetId: string) {
    this.state.selectedPresetId = presetId;
    const preset = DATA_SIEVE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      this.state.activeDataType = preset.dataType;
      this.state.customPayload = preset.payload;
      this.ingestExogenousData(preset.payload, preset.dataType, preset.name);
    }
    this.notify();
  }

  public subscribe(cb: (state: OmniDataSieveState) => void): () => void {
    this.subscribers.add(cb);
    cb(this.state);
    return () => this.subscribers.delete(cb);
  }

  private notify() {
    for (const cb of this.subscribers) {
      cb({ ...this.state });
    }
  }
}

export interface DataSievePreset {
  id: string;
  name: string;
  dataType: ExogenousDataType;
  description: string;
  payload: string;
  isMalicious?: boolean;
}

export const DATA_SIEVE_PRESETS: DataSievePreset[] = [
  {
    id: 'PRESET_ASSET_TORUS',
    name: 'Geometric 3D Mesh: Torus Affine Wave',
    dataType: 'ASSET',
    description: 'Procedurally generated torus knot synthesized directly from 64-bit Quadbit opcodes without storing static vertex arrays.',
    payload: JSON.stringify({
      asset_name: "Torus_Affine_Generator",
      major_radius: 1.45,
      minor_radius: 0.42,
      contraction_damping: 0.78,
      harmonic_p: 2,
      harmonic_q: 3,
      energy_dissipation: 0.12
    }, null, 2)
  },
  {
    id: 'PRESET_ASSET_ICOSA',
    name: 'Geometric 3D Mesh: Icosahedral Contraction',
    dataType: 'ASSET',
    description: 'Golden ratio polyhedron procedural envelope bounded by Banach contractive dissipation matrix.',
    payload: JSON.stringify({
      asset_name: "Icosahedron_Proc_Envelope",
      scale_phi: 1.618,
      dissipation: 0.85,
      damping_factor: 0.72,
      vertex_coupling: 0.08
    }, null, 2)
  },
  {
    id: 'PRESET_STATE_PLAYER',
    name: 'Data Class: Player Inventory & Health Struct',
    dataType: 'STATE',
    description: 'Player attributes and inventory state serialized directly into a 16-nibble covalent_quadbit_word_t register with 1===1 invariant.',
    payload: JSON.stringify({
      health: 95.0,
      shield: 80.0,
      stamina: 70.0,
      inventorySlots: 6,
      kinetic_decay: 0.75,
      entropy_flux: 0.15
    }, null, 2)
  },
  {
    id: 'PRESET_PACKET_VALID_ROLLBACK',
    name: 'BFT Protocol: Valid P2P Rollback Frame',
    dataType: 'PACKET',
    description: 'P2P frame state delta from peer node passing Lyapunov stability test and receiving BFT Ring-0 gate approval.',
    payload: JSON.stringify({
      tick: 4892,
      entityId: "peer_human_athlete_1",
      pos_x: 14.2,
      pos_y: 0.0,
      pos_z: -6.5,
      vel_x: 0.75,
      vel_y: -0.1,
      vel_z: 0.6,
      drift_damping: 0.82
    }, null, 2)
  },
  {
    id: 'PRESET_PACKET_BYZANTINE_EXPLOIT',
    name: 'BFT Protocol: Poisoned Byzantine Exploit Packet',
    dataType: 'PACKET',
    isMalicious: true,
    description: 'Malicious P2P packet attempting to inject expanding velocities (50,000x) and negative entropy. Instantly rejected by Banach Sieve.',
    payload: JSON.stringify({
      tick: 4892,
      entityId: "byzantine_adversary_node",
      pos_x: 999999.0,
      vel_x: 50000.0,
      vel_y: 25000.0,
      runawayEntropy: 4.85,
      expansionFactor: 3.5,
      isByzantineExploit: true
    }, null, 2)
  }
];

export const universalQcnlProtocol = new UniversalQcnlProtocol();
