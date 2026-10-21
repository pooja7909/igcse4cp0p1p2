import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react";
import type { StepperFrame, TraceFrame } from "./learnTypes";

// ---------- Small text formatter: paragraphs, "- " bullets, **bold**, `code` ----------
function inline(text: string, keyBase: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={keyBase + i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <code key={keyBase + i} className="px-1 py-0.5 rounded bg-slate-100 text-[0.92em] font-mono text-purple-800">
          {p.slice(1, -1)}
        </code>
      );
    return <React.Fragment key={keyBase + i}>{p}</React.Fragment>;
  });
}

function TextBlock({ b, bi }: { b: string; bi: number }) {
  const lines = b.split("\n");
  // simple markdown table: | a | b |
  if (lines.length >= 2 && lines.every((l) => /^\s*\|.*\|\s*$/.test(l))) {
    const rows = lines.filter((l) => !/^\s*\|[\s:|-]+\|\s*$/.test(l)).map((l) => l.trim().slice(1, -1).split("|").map((c) => c.trim()));
    const [head, ...body] = rows;
    return (
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr>{head.map((c, i) => <th key={i} className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">{inline(c, `${bi}-th${i}-`)}</th>)}</tr>
          </thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri}>{r.map((c, i) => <td key={i} className="border border-slate-300 px-2 py-1 align-top">{inline(c, `${bi}-${ri}-${i}-`)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  const isBullet = (l: string) => /^\s*- /.test(l);
  const isNum = (l: string) => /^\s*\d+\. /.test(l);
  const head = lines.filter((l) => !isBullet(l) && !isNum(l));
  const bullets = lines.filter(isBullet);
  const nums = lines.filter(isNum);
  return (
    <div>
      {head.map((l, li) => (
        <p key={li}>{inline(l, `${bi}-h${li}-`)}</p>
      ))}
      {bullets.length > 0 && (
        <ul className={`list-disc pl-5 space-y-1 ${head.length ? "mt-1" : ""}`}>
          {bullets.map((l, li) => (
            <li key={li}>{inline(l.replace(/^\s*- /, ""), `${bi}-b${li}-`)}</li>
          ))}
        </ul>
      )}
      {nums.length > 0 && (
        <ol className={`list-decimal pl-5 space-y-1 ${head.length || bullets.length ? "mt-1" : ""}`}>
          {nums.map((l, li) => (
            <li key={li}>{inline(l.replace(/^\s*\d+\. /, ""), `${bi}-n${li}-`)}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

export const RichText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  // fenced ``` code blocks first (they may contain blank lines), then paragraphs
  const pieces = String(text || "").trim().split(/^```[a-z]*\s*$/m);
  const out: React.ReactNode[] = [];
  pieces.forEach((piece, pi) => {
    if (pi % 2 === 1) {
      out.push(
        <pre key={`c${pi}`} className="bg-slate-900 text-slate-100 rounded-lg p-3 text-sm font-mono overflow-x-auto whitespace-pre">
          {piece.replace(/^\n+|\n+$/g, "")}
        </pre>
      );
      return;
    }
    piece
      .trim()
      .split(/\n\s*\n/)
      .filter((b) => b.trim())
      .forEach((b, bi) => out.push(<TextBlock key={`${pi}-${bi}`} b={b} bi={pi * 1000 + bi} />));
  });
  return <div className={`space-y-3 leading-relaxed ${className || ""}`}>{out}</div>;
};

// ---------- Python syntax colouring (light, for lesson code) ----------
const KW = new Set(["if", "elif", "else", "for", "while", "in", "def", "return", "and", "or", "not", "True", "False", "import", "range", "print", "input", "int", "float", "str", "len", "open", "None", "break"]);
// Pearson Edexcel pseudocode keywords (upper case), coloured like Python keywords
const PKW = new Set(["SET", "TO", "IF", "THEN", "ELSE", "END", "WHILE", "DO", "FOR", "FROM", "STEP", "EACH", "REPEAT", "UNTIL", "TIMES", "SEND", "DISPLAY", "RECEIVE", "KEYBOARD", "PROCEDURE", "FUNCTION", "BEGIN", "RETURN", "AND", "OR", "NOT", "MOD", "DIV", "TRUE", "FALSE", "CONST", "INTEGER", "REAL", "STRING", "CHARACTER", "BOOLEAN", "ARRAY", "READ", "WRITE", "LINE", "OPEN", "CLOSE", "FILE"]);
const PFN = new Set(["LENGTH", "RANDOM"]);

/** True when the code is Pearson pseudocode rather than Python. */
export function isPseudocode(code: string): boolean {
  return /^\s*(SET\s|SEND\s|RECEIVE\s|IF\s.*\sTHEN\b|WHILE\s.*\sDO\b|FOR\s.*\sDO\b|REPEAT\b|PROCEDURE\s|FUNCTION\s)/m.test(code || "");
}

export function colourPython(line: string): React.ReactNode[] {
  const tokens = line.split(/("[^"]*"|'[^']*'|#.*$|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]+\b)/g);
  return tokens.map((t, i) => {
    if (!t) return null;
    if (/^["']/.test(t)) return <span key={i} className="text-emerald-700">{t}</span>;
    if (t.startsWith("#")) return <span key={i} className="text-slate-400 italic">{t}</span>;
    if (/^\d/.test(t)) return <span key={i} className="text-blue-700">{t}</span>;
    if (PKW.has(t)) return <span key={i} className="text-orange-700 font-semibold">{t}</span>;
    if (PFN.has(t)) return <span key={i} className="text-purple-700">{t}</span>;
    if (KW.has(t))
      return (
        <span key={i} className={["print", "input", "int", "float", "str", "len", "range", "open"].includes(t) ? "text-purple-700" : "text-orange-700 font-semibold"}>
          {t}
        </span>
      );
    return <span key={i}>{t}</span>;
  });
}

export const CodeBlock: React.FC<{ code: string; title?: string }> = ({ code, title }) => {
  const shownTitle = title === "program.py" && isPseudocode(code) ? "algorithm (pseudocode)" : title;
  return (
  <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
    <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
      {shownTitle && <span className="ml-2 text-xs font-mono text-slate-500">{shownTitle}</span>}
    </div>
    <pre className="p-3 text-[13px] leading-6 font-mono overflow-x-auto">
      {code.split("\n").map((l, i) => (
        <div key={i}>{colourPython(l) }{"​"}</div>
      ))}
    </pre>
  </div>
  );
};

// ---------- Code tracer: step through a program line by line ----------
export const CodeTracer: React.FC<{
  code: string;
  frames: TraceFrame[];
  notes?: Record<string, string>;
  inputs?: string[];
  fileName?: string;
  files?: Record<string, string>;
  onFinished?: () => void;
}> = ({ code, frames, notes, inputs, fileName, files, onFinished }) => {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const lines = code.replace(/\n$/, "").split("\n");
  const f = frames[Math.min(i, frames.length - 1)];
  const prev = i > 0 ? frames[i - 1] : null;
  const atEnd = i >= frames.length - 1;

  useEffect(() => {
    if (atEnd && onFinished) onFinished();
  }, [atEnd]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((x) => x + 1), 1100);
    return () => clearTimeout(t);
  }, [playing, i, atEnd]);

  const note = f.line ? notes?.[String(f.line)] : "";
  const changed = (k: string) => !prev || prev.vars[k] !== f.vars[k];

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="px-4 py-2 bg-amber-50/60 border-b border-slate-200 flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="flex-1 text-center text-sm font-mono text-slate-500">{fileName || (isPseudocode(code) ? "algorithm (pseudocode)" : "program.py")}</span>
        </div>
        <div className="py-2 font-mono text-[15px] sm:text-base">
          {lines.map((l, idx) => {
            const n = idx + 1;
            const active = f.line === n;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2 px-2 py-1 transition-colors ${active ? "bg-amber-100/80 border-l-4 border-amber-500" : "border-l-4 border-transparent"}`}
              >
                <span className="w-6 text-right text-xs text-slate-400 select-none">{n}</span>
                <span className="w-5 text-center select-none">{active ? "👉" : ""}</span>
                <span className="whitespace-pre">{colourPython(l)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {note && (
        <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sm text-sky-950">
          💡 {note}
        </div>
      )}
      {f.done && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 font-semibold">✓ The program has finished.</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="text-[11px] font-bold tracking-widest text-slate-500 mb-2">VARIABLES</div>
          {Object.keys(f.vars).length === 0 ? (
            <div className="text-xs text-slate-400 italic">No variables yet</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(f.vars).map(([k, v]) => (
                <div
                  key={k}
                  className={`px-2.5 py-1.5 rounded-lg border font-mono text-sm transition-all ${
                    changed(k) ? "bg-amber-100 border-amber-400 scale-105" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <span className="text-slate-600">{k}</span> <span className="text-slate-400">=</span>{" "}
                  <span className="font-bold text-slate-900">{v}</span>
                </div>
              ))}
            </div>
          )}
          {inputs && inputs.length > 0 && (
            <div className="mt-2 text-[11px] text-slate-500">Typed by the user: {inputs.map((x) => `"${x}"`).join(", ")}</div>
          )}
          {files && Object.keys(files).length > 0 && (
            <div className="mt-2 space-y-1">
              {Object.entries(files).map(([n, c]) => (
                <details key={n} className="text-[11px]">
                  <summary className="cursor-pointer text-slate-600 font-semibold">📄 {n}</summary>
                  <pre className="mt-1 p-2 bg-slate-50 rounded border border-slate-200 font-mono">{c}</pre>
                </details>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl bg-slate-800 p-3 min-h-[90px]">
          <div className="text-[11px] font-bold tracking-widest text-slate-400 mb-1">OUTPUT</div>
          <pre className="font-mono text-sm text-slate-100 whitespace-pre-wrap">{f.out || " "}</pre>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => { setPlaying(false); setI(0); }} className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 inline-flex items-center gap-1">
          <RotateCcw className="w-3.5 h-3.5" /> Restart
        </button>
        <button type="button" disabled={i === 0} onClick={() => { setPlaying(false); setI((x) => Math.max(0, x - 1)); }} className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 inline-flex items-center gap-1 disabled:opacity-40">
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button type="button" data-testid="trace-next" disabled={atEnd} onClick={() => { setPlaying(false); setI((x) => Math.min(frames.length - 1, x + 1)); }} className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1 disabled:opacity-40">
          Run next line <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button type="button" disabled={atEnd} onClick={() => setPlaying((p) => !p)} className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 inline-flex items-center gap-1 disabled:opacity-40">
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />} {playing ? "Pause" : "Auto-play"}
        </button>
        <span className="text-xs text-slate-500 ml-auto">
          Step {Math.min(i + 1, frames.length)} of {frames.length}
        </span>
      </div>
    </div>
  );
};

// ---------- Binary bits (unsigned, two's complement, sign and magnitude) ----------
export const BitsWidget: React.FC<{
  mode: "unsigned" | "twos" | "signmag";
  bits: number;
  target: number | null;
  showHex?: boolean;
  onSolved?: () => void;
}> = ({ mode, bits, target, showHex, onSolved }) => {
  const [b, setB] = useState<number[]>(() => Array(bits).fill(0));
  const solvedRef = useRef(false);
  const places = Array.from({ length: bits }, (_, i) => 2 ** (bits - 1 - i));
  const value = useMemo(() => {
    if (mode === "unsigned") return b.reduce((s, x, i) => s + x * places[i], 0);
    if (mode === "twos") return b.reduce((s, x, i) => s + x * (i === 0 ? -places[0] : places[i]), 0);
    const mag = b.slice(1).reduce((s, x, i) => s + x * places[i + 1], 0);
    return b[0] ? -mag : mag;
  }, [b, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const solved = target !== null && value === target && !(mode === "signmag" && target === 0 && b[0] === 1);
  useEffect(() => {
    if (solved && !solvedRef.current) {
      solvedRef.current = true;
      onSolved && onSolved();
    }
  }, [solved]); // eslint-disable-line react-hooks/exhaustive-deps

  const label = (i: number) => {
    if (i === 0 && mode === "twos") return `-${places[0]}`;
    if (i === 0 && mode === "signmag") return "sign";
    return String(places[i]);
  };
  const hex = b.join("").match(/.{1,4}/g)?.map((n) => parseInt(n, 2).toString(16).toUpperCase()).join("") || "";

  return (
    <div className="space-y-3">
      {target !== null && (
        <div className={`p-3 rounded-xl border text-sm font-semibold ${solved ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-amber-50 border-amber-300 text-amber-950"}`}>
          {solved ? `✓ Well done - that is ${target}!` : `🎯 Target: make ${showHex ? `${target} (hex ${target.toString(16).toUpperCase()})` : target}`}
        </div>
      )}
      <div className="overflow-x-auto">
        <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `repeat(${bits}, minmax(44px, 1fr))` }}>
          {b.map((x, i) => (
            <div key={"l" + i} className={`text-center text-[11px] font-bold ${i === 0 && mode !== "unsigned" ? "text-rose-600" : "text-slate-500"} ${showHex && i % 4 === 0 && i > 0 ? "ml-2" : ""}`}>
              {label(i)}
            </div>
          ))}
          {b.map((x, i) => (
            <button
              key={i}
              type="button"
              data-testid={`bit-${i}`}
              onClick={() => setB((arr) => arr.map((v, j) => (j === i ? 1 - v : v)))}
              className={`h-12 rounded-xl border-2 font-mono text-xl font-bold transition-all ${
                x ? "bg-purple-600 border-purple-700 text-white shadow" : "bg-white border-slate-300 text-slate-400 hover:border-purple-400"
              } ${showHex && i % 4 === 0 && i > 0 ? "ml-2" : ""}`}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono">
          Denary: <strong>{value}</strong>
        </span>
        {showHex && (
          <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-mono">
            Hex: <strong>{hex}</strong>
          </span>
        )}
        <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs self-center">
          {mode === "unsigned" ? "Unsigned binary" : mode === "twos" ? "Two's complement: the left bit is worth a negative amount" : "Sign and magnitude: left bit 1 = negative"}
        </span>
        <button type="button" onClick={() => setB(Array(bits).fill(0))} className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-600">
          Clear
        </button>
      </div>
      {b.some((x) => x) && (
        <div className="text-xs text-slate-600 font-mono">
          ={" "}
          {b
            .map((x, i) => (x ? (i === 0 && mode === "twos" ? `-${places[0]}` : i === 0 && mode === "signmag" ? null : String(places[i])) : null))
            .filter(Boolean)
            .join(" + ") || "0"}
          {mode === "signmag" && b[0] ? "  (negative)" : ""}
        </div>
      )}
    </div>
  );
};

// ---------- Logic gates ----------
export const GatesWidget: React.FC<{ gate: "AND" | "OR" | "NOT" | "EXPR1"; onSolved?: () => void }> = ({ gate, onSolved }) => {
  const names = gate === "NOT" ? ["A"] : gate === "EXPR1" ? ["A", "B", "C"] : ["A", "B"];
  const [inp, setInp] = useState<number[]>(names.map(() => 0));
  const [seen, setSeen] = useState<Set<string>>(new Set(["0".repeat(names.length)]));
  const calc = (v: number[]) => {
    if (gate === "AND") return v[0] & v[1];
    if (gate === "OR") return v[0] | v[1];
    if (gate === "NOT") return v[0] ? 0 : 1;
    return (v[0] & v[1]) | (v[2] ? 0 : 1);
  };
  const out = calc(inp);
  const rows = Array.from({ length: 2 ** names.length }, (_, r) => r.toString(2).padStart(names.length, "0").split("").map(Number));
  const allSeen = seen.size === rows.length;
  useEffect(() => {
    if (allSeen && onSolved) onSolved();
  }, [allSeen]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (i: number) => {
    const next = inp.map((v, j) => (j === i ? 1 - v : v));
    setInp(next);
    setSeen((s) => new Set(s).add(next.join("")));
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
        <div className="text-xs font-bold text-slate-500">{gate === "EXPR1" ? "Q = (A AND B) OR NOT C" : `${gate} gate`}</div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-2">
            {names.map((n, i) => (
              <button key={n} type="button" data-testid={`gate-in-${n}`} onClick={() => toggle(i)} className={`w-24 py-2 rounded-xl border-2 font-bold font-mono ${inp[i] ? "bg-amber-400 border-amber-500 text-slate-900" : "bg-white border-slate-300 text-slate-500"}`}>
                {n} = {inp[i]}
              </button>
            ))}
          </div>
          <div className="flex-1 text-center">
            <div className="inline-block px-4 py-3 rounded-2xl border-2 border-slate-700 bg-slate-50 font-bold text-slate-800">{gate === "EXPR1" ? "logic" : gate}</div>
          </div>
          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl font-bold transition-all ${out ? "bg-yellow-300 border-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.8)]" : "bg-slate-200 border-slate-400 text-slate-500"}`}>
            {out}
          </div>
        </div>
        <div className="text-xs text-slate-500">Try every combination of inputs - the truth table fills in as you go.</div>
      </div>
      <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden bg-white">
        <thead className="bg-slate-100">
          <tr>
            {names.map((n) => (
              <th key={n} className="px-3 py-1.5 font-mono">{n}</th>
            ))}
            <th className="px-3 py-1.5 font-mono">Output</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const key = r.join("");
            const isNow = key === inp.join("");
            return (
              <tr key={key} className={isNow ? "bg-amber-50" : ""}>
                {r.map((v, i) => (
                  <td key={i} className="px-3 py-1 text-center font-mono">{v}</td>
                ))}
                <td className="px-3 py-1 text-center font-mono font-bold">{seen.has(key) ? calc(r) : "?"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ---------- Stepper: arrays, groups or register tables, one frame at a time ----------
export const StepperWidget: React.FC<{ frames: StepperFrame[]; onFinished?: () => void }> = ({ frames, onFinished }) => {
  const [i, setI] = useState(0);
  const f = frames[i];
  const atEnd = i >= frames.length - 1;
  useEffect(() => {
    if (atEnd && onFinished) onFinished();
  }, [atEnd]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl border border-slate-200 bg-white min-h-[120px] flex flex-col items-center justify-center gap-3">
        {f.array && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {f.array.map((v, k) => {
              const hl = f.highlight?.includes(k);
              const dn = f.done?.includes(k);
              const dim = f.dim?.includes(k);
              const ptr = Object.entries(f.pointers || {}).filter(([, p]) => p === k).map(([n]) => n);
              return (
                <div key={k} className="flex flex-col items-center">
                  <div
                    className={`min-w-[44px] h-12 px-2 rounded-xl border-2 flex items-center justify-center font-mono text-lg font-bold transition-all ${
                      dn ? "bg-emerald-100 border-emerald-500 text-emerald-900" : hl ? "bg-amber-200 border-amber-500 text-slate-900 -translate-y-1" : dim ? "bg-slate-100 border-slate-200 text-slate-300" : "bg-white border-slate-300 text-slate-800"
                    }`}
                  >
                    {String(v)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{k}</div>
                  {ptr.length > 0 && <div className="text-[10px] font-bold text-purple-700">{ptr.join("/")}</div>}
                </div>
              );
            })}
          </div>
        )}
        {f.groups && (
          <div className="flex flex-wrap justify-center gap-3">
            {f.groups.map((g, gi) => (
              <div key={gi} className="flex gap-1 p-1.5 rounded-xl bg-indigo-50 border border-indigo-200">
                {g.map((v, k) => (
                  <div key={k} className="min-w-[34px] h-9 px-1.5 rounded-lg bg-white border border-indigo-300 flex items-center justify-center font-mono font-bold text-indigo-900">
                    {String(v)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {f.table && (
          <table className="text-sm border border-slate-200 rounded-xl overflow-hidden">
            <tbody>
              {f.table.map(([k, v], ti) => {
                const prev = i > 0 ? frames[i - 1].table?.find((x) => x[0] === k)?.[1] : undefined;
                const changed = i > 0 && prev !== v;
                return (
                  <tr key={ti}>
                    <td className="px-3 py-1.5 bg-slate-100 font-bold text-slate-700">{k}</td>
                    <td className={`px-3 py-1.5 font-mono min-w-[160px] ${changed ? "bg-amber-100 font-bold" : ""}`}>{v || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sm text-sky-950 min-h-[44px]">{f.caption}</div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setI(0)} className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 inline-flex items-center gap-1">
          <RotateCcw className="w-3.5 h-3.5" /> Restart
        </button>
        <button type="button" disabled={i === 0} onClick={() => setI((x) => x - 1)} className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 inline-flex items-center gap-1 disabled:opacity-40">
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button type="button" data-testid="stepper-next" disabled={atEnd} onClick={() => setI((x) => x + 1)} className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1 disabled:opacity-40">
          Next step <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs text-slate-500 ml-auto">
          {i + 1} / {frames.length}
        </span>
      </div>
    </div>
  );
};

// ---------- File size calculators ----------
function niceSize(bits: number) {
  const bytes = bits / 8;
  const units = ["bytes", "KiB", "MiB", "GiB"];
  let v = bytes;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  return `${bits.toLocaleString()} bits = ${bytes.toLocaleString()} bytes${u > 0 ? ` = ${v.toFixed(2)} ${units[u]}` : ""}`;
}

export const CalcWidget: React.FC<{ calc: "image" | "sound" }> = ({ calc }) => {
  const [w, setW] = useState(640);
  const [h, setH] = useState(480);
  const [d, setD] = useState(24);
  const [rate, setRate] = useState(44100);
  const [depth, setDepth] = useState(16);
  const [secs, setSecs] = useState(10);
  const [ch, setCh] = useState(2);
  const field = (label: string, value: number, set: (n: number) => void, extra?: string) => (
    <label className="flex flex-col gap-1 text-xs font-bold text-slate-600">
      {label}
      <input type="number" min={1} value={value} onChange={(e) => set(Math.max(0, Number(e.target.value) || 0))} className="px-2 py-1.5 border border-slate-300 rounded-lg font-mono text-sm text-slate-900" />
      {extra && <span className="font-normal text-[11px] text-slate-500">{extra}</span>}
    </label>
  );
  if (calc === "image") {
    const bits = w * h * d;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {field("Width (pixels)", w, setW)}
          {field("Height (pixels)", h, setH)}
          {field("Colour depth (bits)", d, setD, `${d <= 30 ? (2 ** d).toLocaleString() : "many"} colours`)}
        </div>
        <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-sm">
          {w} x {h} x {d} = {niceSize(bits)}
        </div>
      </div>
    );
  }
  const bits = rate * depth * secs * ch;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {field("Sample rate (Hz)", rate, setRate)}
        {field("Bit depth", depth, setDepth)}
        {field("Seconds", secs, setSecs)}
        {field("Channels", ch, setCh, ch === 1 ? "mono" : ch === 2 ? "stereo" : "")}
      </div>
      <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-sm">
        {rate} x {depth} x {secs} x {ch} = {niceSize(bits)}
      </div>
    </div>
  );
};

export const DoneBadge: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
    <CheckCircle2 className="w-4 h-4" /> {text}
  </span>
);
