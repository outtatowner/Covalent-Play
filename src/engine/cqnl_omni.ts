/**
 * cqnl_omni.ts
 * Organelle 0xC9_COVALENT: CQNL-Omni Universal Polyglot Sieve & Hypervisor
 * 
 * Implements:
 * 1. OmniFrontend: Universal ingestion for JS, Python, Verilog, C, Rust, etc.
 * 2. sys_covalent_flatten_to_air: Converts affine assignments into Algebraic Intermediate Representation (AIR)
 * 3. BanachSieve: Thermodynamic arbitration verifying contractive dV/dt <= 0 stasis (max(||A||_1, ||A||_inf) < 1.0)
 * 4. OmniEmitter: Multi-target synthesizer (C, Rust, JavaScript, Verilog, Opcodes, Python, WASM, etc.)
 */

import { 
  AffineAssign, 
  CQNLIntent, 
  AffineSystem, 
  BanachSieveResult, 
  OmniTargetLanguage,
  OmniLedgerEntry 
} from '../types';

export const OMNI_OP = {
  STAS: 0x0,
  SADD: 0x1,
  SSUB: 0x2,
  SMUL: 0x3,
  SDIV: 0x4,
  CRTR: 0x5,
  CRTV: 0x6,
  LYAP: 0x7,
  MITS: 0x8,
  APOP: 0x9,
  BOND: 0xA,
  FREE: 0xB,
  LWTN: 0xC,
  THAL: 0xD,
  SONI: 0xE,
  BAN3: 0xF,
} as const;

export const OMNI_OP_NAME: Record<number, string> = {
  0x0: "STAS",
  0x1: "SADD",
  0x2: "SSUB",
  0x3: "SMUL",
  0x4: "SDIV",
  0x5: "CRTR",
  0x6: "CRTV",
  0x7: "LYAP",
  0x8: "MITS",
  0x9: "APOP",
  0xA: "BOND",
  0xB: "FREE",
  0xC: "LWTN",
  0xD: "THAL",
  0xE: "SONI",
  0xF: "BAN3",
};

export const BACKEND_EXTS: Record<OmniTargetLanguage, string> = {
  c: ".c",
  rust: ".rs",
  javascript: ".js",
  verilog: ".v",
  opcodes: ".ops.txt",
  python: ".py",
  cpp: ".hpp",
  wasm: ".wat",
  asm: ".s",
  go: ".go",
  cqnl: ".qcnl",
  json: ".json",
  java: ".java",
  csharp: ".cs",
};

export function hashSource(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
}

/**
 * Universal Ingestion: OmniFrontend
 */
export class OmniFrontend {
  public static stripComments(lang: string, src: string): string {
    const l = lang.toLowerCase();
    if (["python", "ruby", "julia", "r", "shell"].includes(l)) {
      return src.replace(/#.*/g, "");
    } else if (["haskell", "lua", "elm"].includes(l)) {
      return src.replace(/--.*/g, "");
    } else if (l === "matlab") {
      return src.replace(/%.*/g, "");
    } else if (["clojure", "elixir", "lisp", "scheme"].includes(l)) {
      return src.replace(/;.*/g, "");
    } else {
      // C-style comments (// and /* */)
      let out = src.replace(/\/\*[\s\S]*?\*\//g, "");
      out = out.replace(/\/\/.*/g, "");
      return out;
    }
  }

  public static extractAffine(src: string): AffineAssign[] {
    const assigns: AffineAssign[] = [];
    const seen = new Set<string>();

    const add = (varName: string, scale: number, constVal = 0.0) => {
      if (seen.has(varName)) {
        for (const a of assigns) {
          if (a.target === varName) {
            a.scale = scale;
            a.const = constVal;
          }
        }
        return;
      }
      seen.add(varName);
      assigns.push({ target: varName, scale, const: constVal });
    };

    // Pattern 1: var *= 0.5
    const regex1 = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\*=\s*([+-]?\d+\.?\d*)[fFlL]?/g;
    let m: RegExpExecArray | null;
    while ((m = regex1.exec(src)) !== null) {
      add(m[1], parseFloat(m[2]));
    }

    // Pattern 2: var = 0.5 * var
    const regex2 = /\b([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([+-]?\d+\.?\d*)[fFlL]?\s*\*\s*\1\b/g;
    while ((m = regex2.exec(src)) !== null) {
      add(m[1], parseFloat(m[2]));
    }

    // Pattern 3: var = var * 0.5
    const regex3 = /\b([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\1\s*\*\s*([+-]?\d+\.?\d*)[fFlL]?/g;
    while ((m = regex3.exec(src)) !== null) {
      add(m[1], parseFloat(m[2]));
    }

    // Pattern 4: Verilog non-blocking var <= var * 0.5
    const regex4 = /\b([A-Za-z_][A-Za-z0-9_]*)\s*<=\s*\1\s*\*\s*([+-]?\d+\.?\d*)/g;
    while ((m = regex4.exec(src)) !== null) {
      add(m[1], parseFloat(m[2]));
    }

    // Pattern 5: Verilog non-blocking var <= 0.5 * var
    const regex5 = /\b([A-Za-z_][A-Za-z0-9_]*)\s*<=\s*([+-]?\d+\.?\d*)\s*\*\s*\1\b/g;
    while ((m = regex5.exec(src)) !== null) {
      add(m[1], parseFloat(m[2]));
    }

    // Pattern 6: explicit qcnl: var *= 0.5 annotations
    const regex6 = /qcnl:\s*([A-Za-z_][A-Za-z0-9_]*)\s*\*=\s*([+-]?\d+\.?\d*)/gi;
    while ((m = regex6.exec(src)) !== null) {
      add(m[1], parseFloat(m[2]));
    }

    return assigns;
  }

  public static assignsToOpcodes(assigns: AffineAssign[], hwPath = false): number[] {
    const ops: number[] = [OMNI_OP.STAS];
    for (const a of assigns) {
      const s = a.scale;
      const c = a.const;
      if (Math.abs(s - 1.0) < 1e-12 && Math.abs(c) < 1e-12) {
        ops.push(OMNI_OP.STAS);
      } else if (Math.abs(s) < 1.0) {
        ops.push(OMNI_OP.SMUL, OMNI_OP.LYAP);
      } else {
        ops.push(OMNI_OP.SMUL, OMNI_OP.SONI);
      }

      if (c > 1e-12) {
        ops.push(OMNI_OP.SADD);
      } else if (c < -1e-12) {
        ops.push(OMNI_OP.SSUB);
      }
    }

    if (hwPath) {
      ops.push(OMNI_OP.CRTR);
    }
    ops.push(OMNI_OP.THAL, OMNI_OP.BOND, OMNI_OP.BAN3);
    return ops;
  }

  public static parseGeneric(source: string, lang = "python", organelle?: string): CQNLIntent {
    const clean = OmniFrontend.stripComments(lang, source);
    const assigns = OmniFrontend.extractAffine(clean);
    const isHw = ["asm", "verilog", "fpga", "wasm", "wat", "vhdl"].includes(lang.toLowerCase());
    const opcodes = OmniFrontend.assignsToOpcodes(assigns, isHw);

    const titleLang = lang.charAt(0).toUpperCase() + lang.slice(1);
    return {
      source_lang: lang.toLowerCase(),
      source_hash: hashSource(source),
      organelle: organelle || `From_${titleLang}`,
      assigns,
      opcodes,
      notes: [`frontend=${lang}`, `n_assigns=${assigns.length}`],
      meta: { hw_path: isHw }
    };
  }
}

/**
 * AIR: Algebraic Intermediate Representation flattener
 * x_{k+1} = A x_k + b
 */
export function sys_covalent_flatten_to_air(intent: CQNLIntent): AffineSystem {
  const var_names = intent.assigns.map(a => a.target);
  const n = var_names.length;
  
  if (n === 0) {
    return { var_names: [], A: [], b: [], n: 0 };
  }

  const index: Record<string, number> = {};
  var_names.forEach((v, idx) => { index[v] = idx; });

  // Initialize n x n matrix A and vector b
  const A: number[][] = Array.from({ length: n }, () => Array(n).fill(0.0));
  const b: number[] = Array(n).fill(0.0);

  intent.assigns.forEach((a) => {
    const row = index[a.target];
    A[row][row] = a.scale;
    b[row] = a.const;
  });

  return { var_names, A, b, n };
}

/**
 * Thermodynamic Arbitration: BanachSieve
 * Evaluates contractiveness: max(||A||_1, ||A||_inf) < 1.0 (dV/dt <= 0)
 */
export class BanachSieve {
  public static readonly THRESHOLD = 1.0;

  public static norm1(A: number[][]): number {
    const n = A.length;
    if (n === 0) return 0.0;
    let maxColSum = 0.0;
    for (let j = 0; j < n; j++) {
      let colSum = 0.0;
      for (let i = 0; i < n; i++) {
        colSum += Math.abs(A[i][j]);
      }
      if (colSum > maxColSum) maxColSum = colSum;
    }
    return maxColSum;
  }

  public static normInf(A: number[][]): number {
    const n = A.length;
    if (n === 0) return 0.0;
    let maxRowSum = 0.0;
    for (let i = 0; i < n; i++) {
      let rowSum = 0.0;
      for (let j = 0; j < n; j++) {
        rowSum += Math.abs(A[i][j]);
      }
      if (rowSum > maxRowSum) maxRowSum = rowSum;
    }
    return maxRowSum;
  }

  public static check(system: AffineSystem): BanachSieveResult {
    if (system.n === 0) {
      return {
        passed: true,
        norm_1: 0.0,
        norm_inf: 0.0,
        max_norm: 0.0,
        message: "Empty system (vacuously contractive)",
        system
      };
    }

    const n1 = BanachSieve.norm1(system.A);
    const ninf = BanachSieve.normInf(system.A);
    const mx = Math.max(n1, ninf);

    if (mx < BanachSieve.THRESHOLD) {
      return {
        passed: true,
        norm_1: n1,
        norm_inf: ninf,
        max_norm: mx,
        message: `Contractive: max(||A||_1, ||A||_inf) = ${mx.toFixed(6)} < 1.0 (dV/dt <= 0)`,
        system
      };
    }

    return {
      passed: false,
      norm_1: n1,
      norm_inf: ninf,
      max_norm: mx,
      message: `ERR_BANACH_SIEVE_NON_CONTRACTIVE_LOOP: max(||A||_1, ||A||_inf) = ${mx.toFixed(6)} >= 1.0 (Divergent/Expanding)`,
      system
    };
  }

  public static verifyContractiveStasis(system: AffineSystem): boolean {
    const res = BanachSieve.check(system);
    return res.passed;
  }
}

/**
 * Multi-Target Emission: OmniEmitter
 */
export class OmniEmitter {
  public static emitC(intent: CQNLIntent): string {
    const lines = [
      `/* generated from CQNL omni (${intent.source_lang}) */`,
      "#include <stdint.h>",
      "typedef int32_t q16_t;",
      "static inline q16_t q16_mul(q16_t a, q16_t b) {",
      "  return (q16_t)(((int64_t)a * (int64_t)b) >> 16);",
      "}",
      `void ${intent.organelle}_step(q16_t *state) {`
    ];

    intent.assigns.forEach((a, i) => {
      const q = Math.round(a.scale * 65536.0);
      lines.push(`  state[${i}] = q16_mul(state[${i}], (q16_t)${q}); /* ${a.target} */`);
    });

    lines.push("}");
    lines.push("");
    return lines.join("\n");
  }

  public static emitCpp(intent: CQNLIntent): string {
    const count = Math.max(intent.assigns.length, 1);
    const lines = [
      `// CQNL omni → C++ (${intent.source_lang})`,
      "#pragma once",
      "#include <array>",
      "#include <cstdint>",
      "namespace cqnl {",
      "using q16 = int32_t;",
      `struct ${intent.organelle} {`,
      `  std::array<q16, ${count}> x{};`,
      "  void step() {"
    ];

    intent.assigns.forEach((a, i) => {
      const q = Math.round(a.scale * 65536.0);
      lines.push(`    x[${i}] = (q16)(((int64_t)x[${i}] * ${q}) >> 16); // ${a.target}`);
    });

    if (intent.assigns.length === 0) {
      lines.push("    (void)x;");
    }

    lines.push("  }");
    lines.push("};");
    lines.push("} // namespace cqnl");
    lines.push("");
    return lines.join("\n");
  }

  public static emitRust(intent: CQNLIntent): string {
    const count = Math.max(intent.assigns.length, 1);
    const lines = [
      `// CQNL omni → Rust (${intent.source_lang})`,
      "pub type Q16 = i32;",
      `pub struct ${intent.organelle} {`,
      `    pub x: [Q16; ${count}],`,
      "}",
      `impl ${intent.organelle} {`,
      "    pub fn step(&mut self) {"
    ];

    intent.assigns.forEach((a, i) => {
      const q = Math.round(a.scale * 65536.0);
      lines.push(`        self.x[${i}] = (((self.x[${i}] as i64) * ${q}) >> 16) as Q16;`);
    });

    lines.push("    }");
    lines.push("}");
    lines.push("");
    return lines.join("\n");
  }

  public static emitJavaScript(intent: CQNLIntent): string {
    const lines = [
      `// CQNL omni → JavaScript (${intent.source_lang})`,
      `export function ${intent.organelle}Step(state) {`
    ];

    intent.assigns.forEach((a) => {
      lines.push(`  state.${a.target} *= ${a.scale};`);
    });

    lines.push("  return state;");
    lines.push("}");
    lines.push("");
    return lines.join("\n");
  }

  public static emitPython(intent: CQNLIntent): string {
    const lines = [
      `# CQNL omni → Python (${intent.source_lang})`,
      `class ${intent.organelle}:`,
      "    def __init__(self):",
      "        self.state = {"
    ];

    intent.assigns.forEach((a) => {
      lines.push(`            '${a.target}': 1.0,`);
    });

    if (intent.assigns.length === 0) {
      lines.push("            '_empty': 0.0,");
    }

    lines.push("        }");
    lines.push("    def step(self):");

    intent.assigns.forEach((a) => {
      const comment = Math.abs(a.const) > 1e-15 ? `  # +${a.const}` : "";
      lines.push(`        self.state['${a.target}'] *= ${a.scale}${comment}`);
    });

    if (intent.assigns.length === 0) {
      lines.push("        pass");
    }

    lines.push("");
    return lines.join("\n");
  }

  public static emitVerilog(intent: CQNLIntent): string {
    const lines = [
      `// CQNL omni → Verilog (${intent.source_lang})`,
      `module ${intent.organelle}(input logic clk);`
    ];

    intent.assigns.forEach((a) => {
      lines.push(`  real ${a.target};`);
    });

    lines.push("  always_ff @(posedge clk) begin");

    intent.assigns.forEach((a) => {
      lines.push(`    ${a.target} <= ${a.target} * ${a.scale};`);
    });

    lines.push("  end");
    lines.push("endmodule");
    lines.push("");
    return lines.join("\n");
  }

  public static emitOpcodes(intent: CQNLIntent): string {
    const names = intent.opcodes.map(o => OMNI_OP_NAME[o] || `0x${o.toString(16)}`);
    return names.join(" ") + "\n";
  }

  public static emitCqnl(intent: CQNLIntent): string {
    const lines = [
      `(* CQNL omni IR from ${intent.source_lang} hash=${intent.source_hash} *)`,
      `organelle ${intent.organelle} at [0x0, 0x1] {`
    ];

    intent.assigns.forEach((a) => {
      lines.push(`  Invariant ${a.target} := 1.0;`);
    });

    lines.push("  autopoiesis (attractor := 0x0000D5DF) {");

    intent.assigns.forEach((a) => {
      if (Math.abs(a.const) < 1e-15) {
        lines.push(`    ${a.target} <- ${a.target} *= ${a.scale};`);
      } else {
        lines.push(`    ${a.target} <- ${a.target} *= ${a.scale}; (* + ${a.const} *)`);
      }
    });

    lines.push("  }");
    lines.push("}");
    lines.push("");
    return lines.join("\n");
  }

  public static emitWasm(intent: CQNLIntent): string {
    const lines = [
      `;; CQNL omni → WAT (${intent.source_lang})`,
      "(module",
      `  (func $${intent.organelle}_step (param $x f64) (result f64)`
    ];

    if (intent.assigns.length > 0) {
      const s = intent.assigns[0].scale;
      lines.push("    local.get $x");
      lines.push(`    f64.const ${s}`);
      lines.push("    f64.mul");
    } else {
      lines.push("    local.get $x");
    }

    lines.push("  )");
    lines.push(`  (export "step" (func $${intent.organelle}_step))`);
    lines.push(")");
    lines.push("");
    return lines.join("\n");
  }

  public static emitAsm(intent: CQNLIntent): string {
    const lines = [
      `/* CQNL omni → x86-64 GAS (${intent.source_lang}) */`,
      ".text",
      `.globl ${intent.organelle}_step`,
      `${intent.organelle}_step:`,
      "    /* rdi = q16 state[] */"
    ];

    intent.assigns.forEach((a, i) => {
      const q = Math.round(a.scale * 65536.0);
      lines.push(`    mov ${i * 4}(%rdi), %eax`);
      lines.push(`    imul $${q}, %rax`);
      lines.push("    sar $16, %rax");
      lines.push(`    mov %eax, ${i * 4}(%rdi)`);
    });

    lines.push("    ret");
    lines.push("");
    return lines.join("\n");
  }

  public static emitGo(intent: CQNLIntent): string {
    const lines = [
      `// CQNL omni → Go (${intent.source_lang})`,
      "package cqnl",
      `type ${intent.organelle} struct {`
    ];

    intent.assigns.forEach((a) => {
      const title = a.target.charAt(0).toUpperCase() + a.target.slice(1);
      lines.push(`\t${title} float64`);
    });

    lines.push("}");
    lines.push(`func (s *${intent.organelle}) Step() {`);

    intent.assigns.forEach((a) => {
      const title = a.target.charAt(0).toUpperCase() + a.target.slice(1);
      lines.push(`\ts.${title} *= ${a.scale}`);
    });

    lines.push("}");
    lines.push("");
    return lines.join("\n");
  }

  public static emitJson(intent: CQNLIntent): string {
    return JSON.stringify(intent, null, 2);
  }

  public static emit(intent: CQNLIntent, target: OmniTargetLanguage): string {
    switch (target) {
      case 'c': return OmniEmitter.emitC(intent);
      case 'rust': return OmniEmitter.emitRust(intent);
      case 'javascript': return OmniEmitter.emitJavaScript(intent);
      case 'verilog': return OmniEmitter.emitVerilog(intent);
      case 'opcodes': return OmniEmitter.emitOpcodes(intent);
      case 'python': return OmniEmitter.emitPython(intent);
      case 'cpp': return OmniEmitter.emitCpp(intent);
      case 'wasm': return OmniEmitter.emitWasm(intent);
      case 'asm': return OmniEmitter.emitAsm(intent);
      case 'go': return OmniEmitter.emitGo(intent);
      case 'cqnl': return OmniEmitter.emitCqnl(intent);
      case 'json': return OmniEmitter.emitJson(intent);
      default: return OmniEmitter.emitC(intent);
    }
  }
}

/**
 * Universal Quipu Ledger Commit
 */
export function sys_covalent_commit_to_ledger(entry: OmniLedgerEntry): void {
  console.log(`[ QUIPU LEDGER ] Committed contractive asset ${entry.filename} (${entry.sourceLang} → ${entry.targetLang}) | NormMax: ${entry.normMax.toFixed(4)}`);
}
