import React, { useMemo, useState } from "react";
import { Lightbulb, CheckCircle2, XCircle, ArrowUp, ArrowDown } from "lucide-react";
import type { PracticeItem } from "./learnTypes";
import { RichText, CodeBlock, colourPython } from "./LearnWidgets";
import { Flowchart } from "./Flowchart";

type Kind<K extends PracticeItem["kind"]> = Extract<PracticeItem, { kind: K }>;

export interface KindProps<K extends PracticeItem["kind"]> {
  item: Kind<K>;
  solved: boolean;
  preview?: boolean;
  onSolved: (attempts: number) => void;
}

// trace-table cells: ignore quotes, spaces and case ("Lap 1", ['a', 'b'] and ["a","b"] all match)
const normCell = (s: string) =>
  String(s ?? "")
    .replace(/["'“”‘’]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
const normOut = (s: string) =>
  String(s ?? "")
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .replace(/^\n+|\n+$/g, "");

// Shared feedback: hints after wrong tries, "show answer" after 2 (no credit), explanation when done
function useAttempts(hintsLen: number) {
  const [wrong, setWrong] = useState(0);
  const [status, setStatus] = useState<"idle" | "right" | "revealed">("idle");
  const [flash, setFlash] = useState(false);
  return {
    wrong,
    status,
    flash,
    right: () => setStatus("right"),
    reveal: () => setStatus("revealed"),
    miss: () => {
      setWrong((w) => w + 1);
      setFlash(true);
    },
    clearFlash: () => setFlash(false),
    hintsShown: Math.min(wrong, hintsLen),
  };
}

const Feedback: React.FC<{
  a: ReturnType<typeof useAttempts>;
  hints: string[];
  explain?: string;
  answerText?: React.ReactNode;
  solvedBefore: boolean;
}> = ({ a, hints, explain, answerText, solvedBefore }) => (
  <div className="space-y-2">
    {a.flash && a.status === "idle" && (
      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-900 flex gap-2">
        <XCircle className="w-4 h-4 mt-0.5 shrink-0" /> Not quite - have another go.
      </div>
    )}
    {a.status === "idle" &&
      hints.slice(0, a.hintsShown).map((h, i) => (
        <div key={i} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-950 flex gap-2">
          <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
          <span>
            <strong>Hint {i + 1}:</strong> {h}
          </span>
        </div>
      ))}
    {(a.status !== "idle" || solvedBefore) && (explain || answerText) && (
      <div className={`p-3 rounded-xl border text-sm ${a.status === "revealed" ? "bg-sky-50 border-sky-200 text-sky-950" : "bg-emerald-50 border-emerald-200 text-emerald-950"}`}>
        <div className="font-bold mb-1">{a.status === "revealed" ? "Answer" : "✓ Correct!"}</div>
        {answerText}
        {explain && <RichText text={explain} className="text-sm mt-1" />}
      </div>
    )}
  </div>
);

const ActionRow: React.FC<{
  a: ReturnType<typeof useAttempts>;
  canCheck: boolean;
  onCheck: () => void;
  preview?: boolean;
}> = ({ a, canCheck, onCheck, preview }) =>
  a.status === "idle" ? (
    <div className="flex flex-wrap gap-2">
      <button type="button" data-testid="pk-check" disabled={!canCheck} onClick={onCheck} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-40">
        Check answer
      </button>
      {(a.wrong >= 2 || preview) && (
        <button type="button" onClick={a.reveal} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-600">
          Show me the answer
        </button>
      )}
    </div>
  ) : null;

// ---------------- Multiple choice ----------------
export const McqPractice: React.FC<KindProps<"mcq">> = ({ item, solved, preview, onSolved }) => {
  const a = useAttempts(item.hints.length);
  const [choice, setChoice] = useState<number | null>(null);
  const order = useMemo(() => item.options.map((o, i) => ({ o, i })).sort(() => Math.random() - 0.5), [item.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const check = () => {
    if (choice === item.answer) {
      a.right();
      onSolved(a.wrong + 1);
    } else a.miss();
  };
  return (
    <div className="space-y-3">
      <RichText text={item.prompt} className="text-[15px] font-semibold text-slate-900" />
      {item.flowchart ? <Flowchart nodes={item.flowchart} title="flowchart" /> : item.code && <CodeBlock code={item.code} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {order.map(({ o, i }) => (
          <button
            key={i}
            type="button"
            disabled={a.status !== "idle"}
            onClick={() => {
              setChoice(i);
              a.clearFlash();
            }}
            className={`text-left px-3 py-2.5 rounded-xl border-2 text-sm transition-all ${
              a.status !== "idle" && i === item.answer ? "border-emerald-500 bg-emerald-50" : choice === i ? "border-purple-500 bg-purple-50" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <RichText text={o} />
          </button>
        ))}
      </div>
      <ActionRow a={a} canCheck={choice !== null} onCheck={check} preview={preview} />
      <Feedback a={a} hints={item.hints} explain={item.explain} solvedBefore={false} />
      {solved && a.status === "idle" && <div className="text-xs text-emerald-700 font-semibold">You have already solved this one.</div>}
    </div>
  );
};

// ---------------- Predict the output ----------------
export const OutputPractice: React.FC<KindProps<"output">> = ({ item, preview, onSolved, solved }) => {
  const a = useAttempts(item.hints.length);
  const [text, setText] = useState("");
  const check = () => {
    const ok = normOut(text).toLowerCase() === normOut(item.expected).toLowerCase();
    if (ok) {
      a.right();
      onSolved(a.wrong + 1);
    } else a.miss();
  };
  const lines = normOut(item.expected).split("\n").length;
  return (
    <div className="space-y-3">
      <RichText text={item.prompt} className="text-[15px] font-semibold text-slate-900" />
      {item.flowchart ? <Flowchart nodes={item.flowchart} title="flowchart" /> : <CodeBlock code={item.code.replace(/\n$/, "")} title="program.py" />}
      {item.inputs && item.inputs.length > 0 && (
        <div className="text-xs text-slate-600">
          The user types: {item.inputs.map((x, i) => <code key={i} className="mx-0.5 px-1.5 py-0.5 rounded bg-slate-100 font-mono">{x}</code>)}
        </div>
      )}
      {item.files &&
        Object.entries(item.files).map(([n, c]) => (
          <details key={n} className="text-xs" open>
            <summary className="cursor-pointer font-semibold text-slate-600">📄 {n}</summary>
            <pre className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded font-mono">{c}</pre>
          </details>
        ))}
      <div>
        <div className="text-xs font-bold text-slate-600 mb-1">
          Type exactly what is printed{lines > 1 ? ` (${lines} lines - one per line)` : ""}. Do not type the input prompts.
        </div>
        <textarea
          value={text}
          disabled={a.status !== "idle"}
          rows={Math.min(8, Math.max(1, lines))}
          onChange={(e) => {
            setText(e.target.value);
            a.clearFlash();
          }}
          className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 font-mono text-sm bg-slate-900 text-slate-100"
          placeholder="Output..."
          data-testid="pk-output"
        />
      </div>
      <ActionRow a={a} canCheck={text.trim().length > 0} onCheck={check} preview={preview} />
      <Feedback
        a={a}
        hints={item.hints}
        explain={item.explain}
        solvedBefore={false}
        answerText={<pre className="p-2 rounded bg-slate-900 text-slate-100 font-mono text-sm whitespace-pre-wrap">{normOut(item.expected)}</pre>}
      />
      {solved && a.status === "idle" && <div className="text-xs text-emerald-700 font-semibold">You have already solved this one.</div>}
    </div>
  );
};

// ---------------- Trace table ----------------
export const TracePractice: React.FC<KindProps<"trace">> = ({ item, preview, onSolved, solved }) => {
  const a = useAttempts(item.hints.length);
  const [cells, setCells] = useState<string[][]>(() => item.rows.map((r) => r.map(() => "")));
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const check = () => {
    const bad = new Set<string>();
    item.rows.forEach((r, ri) =>
      r.forEach((v, ci) => {
        if (v === null) return;
        if (normCell(cells[ri][ci]) !== normCell(v)) bad.add(`${ri}-${ci}`);
      })
    );
    setWrongCells(bad);
    if (bad.size === 0) {
      a.right();
      onSolved(a.wrong + 1);
    } else a.miss();
  };
  const filled = cells.some((r, ri) => r.some((c, ci) => item.rows[ri][ci] !== null && c.trim()));
  const show = a.status !== "idle";
  return (
    <div className="space-y-3">
      <RichText text={item.prompt} className="text-[15px] font-semibold text-slate-900" />
      {item.flowchart ? <Flowchart nodes={item.flowchart} title="flowchart" /> : <CodeBlock code={item.code.replace(/\n$/, "")} title="program.py" />}
      {item.inputs && item.inputs.length > 0 && (
        <div className="text-xs text-slate-600">
          Inputs typed by the user, in order: {item.inputs.map((x, i) => <code key={i} className="mx-0.5 px-1.5 py-0.5 rounded bg-slate-100 font-mono">{x}</code>)}
        </div>
      )}
      {item.files &&
        Object.entries(item.files).map(([n, c]) => (
          <details key={n} className="text-xs" open>
            <summary className="cursor-pointer font-semibold text-slate-600">📄 {n}</summary>
            <pre className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded font-mono">{c}</pre>
          </details>
        ))}
      <div className="text-xs text-slate-500">
        Each row is one change. Fill only the white boxes (grey boxes stay empty). Write strings without quotes.
      </div>
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr>
              {item.columns.map((c) => (
                <th key={c} className="px-2 py-1.5 border border-slate-300 bg-slate-100 font-mono text-xs">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {item.rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((v, ci) => {
                  const k = `${ri}-${ci}`;
                  if (v === null) return <td key={ci} className="border border-slate-300 bg-slate-100 min-w-[70px]" />;
                  return (
                    <td key={ci} className="border border-slate-300 p-0.5 min-w-[70px]">
                      {show ? (
                        <div className={`px-1.5 py-1 font-mono text-sm ${normCell(cells[ri][ci]) === normCell(v) ? "text-emerald-800" : "text-sky-800 font-bold"}`}>{v}</div>
                      ) : (
                        <input
                          value={cells[ri][ci]}
                          data-testid={`trace-cell-${ri}-${ci}`}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCells((cs) => cs.map((row, x) => (x === ri ? row.map((c, y) => (y === ci ? val : c)) : row)));
                            a.clearFlash();
                          }}
                          className={`w-full px-1.5 py-1 font-mono text-sm rounded outline-none ${wrongCells.has(k) ? "bg-rose-50 ring-1 ring-rose-400" : "bg-white focus:ring-1 focus:ring-purple-400"}`}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {wrongCells.size > 0 && a.status === "idle" && <div className="text-xs text-rose-700">{wrongCells.size} box{wrongCells.size > 1 ? "es are" : " is"} wrong (highlighted in red).</div>}
      <ActionRow a={a} canCheck={filled} onCheck={check} preview={preview} />
      <Feedback a={a} hints={item.hints} explain={item.explain} solvedBefore={false} />
      {solved && a.status === "idle" && <div className="text-xs text-emerald-700 font-semibold">You have already solved this one.</div>}
    </div>
  );
};

// ---------------- Put the lines in order (Parsons problem) ----------------
export const OrderPractice: React.FC<KindProps<"order">> = ({ item, preview, onSolved, solved }) => {
  const a = useAttempts(item.hints.length);
  const [order, setOrder] = useState<number[]>(() => {
    const idx = item.lines.map((_, i) => i);
    for (let t = 0; t < 20; t++) {
      idx.sort(() => Math.random() - 0.5);
      if (idx.some((v, i) => v !== i)) break;
    }
    return [...idx];
  });
  const move = (pos: number, d: number) => {
    const np = pos + d;
    if (np < 0 || np >= order.length) return;
    const o = [...order];
    [o[pos], o[np]] = [o[np], o[pos]];
    setOrder(o);
    a.clearFlash();
  };
  const check = () => {
    // Lines that are identical may be in either order
    const same = (ord: number[]) => order.every((li, pos) => item.lines[li] === item.lines[ord[pos]]);
    // the given order, or any other order that has been checked to work the same (e.g. two setup lines swapped)
    const ok = same(item.lines.map((_, i) => i)) || (item.accept || []).some((alt) => same(alt));
    if (ok) {
      a.right();
      onSolved(a.wrong + 1);
    } else a.miss();
  };
  const shown = a.status === "revealed" ? item.lines.map((_, i) => i) : order;
  return (
    <div className="space-y-3">
      <RichText text={item.prompt} className="text-[15px] font-semibold text-slate-900" />
      <div className="text-xs text-slate-500">Use the arrows to put the lines in the right order. The indentation is already correct.</div>
      <div className="rounded-xl border border-slate-200 bg-white p-2 space-y-1">
        {shown.map((li, pos) => (
          <div key={li} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-400 w-4">{pos + 1}</span>
            <span className="flex-1 font-mono text-sm whitespace-pre">{colourPython(item.lines[li])}</span>
            {a.status === "idle" && (
              <span className="flex gap-0.5">
                <button type="button" onClick={() => move(pos, -1)} disabled={pos === 0} className="p-1 rounded hover:bg-slate-200 disabled:opacity-30" title="Move up" data-testid={`order-up-${pos}`}>
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => move(pos, 1)} disabled={pos === shown.length - 1} className="p-1 rounded hover:bg-slate-200 disabled:opacity-30" title="Move down">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        ))}
      </div>
      <ActionRow a={a} canCheck={true} onCheck={check} preview={preview} />
      <Feedback a={a} hints={item.hints} explain={item.explain} solvedBefore={false} />
      {solved && a.status === "idle" && <div className="text-xs text-emerald-700 font-semibold">You have already solved this one.</div>}
    </div>
  );
};

export const LEVEL_LABEL: Record<number, { label: string; cls: string }> = {
  1: { label: "Warm-up", cls: "bg-emerald-100 text-emerald-800" },
  2: { label: "Core", cls: "bg-amber-100 text-amber-800" },
  3: { label: "Exam-style", cls: "bg-purple-100 text-purple-800" },
};

export { CheckCircle2 };

// ---------------- Tick-box table (one tick per row), like the exam's "complete the table" ----------------
export const ClassifyPractice: React.FC<KindProps<"classify">> = ({ item, preview, onSolved, solved }) => {
  const a = useAttempts(item.hints.length);
  const [picks, setPicks] = useState<(number | null)[]>(() => item.rows.map(() => null));
  const [bad, setBad] = useState<Set<number>>(new Set());
  const check = () => {
    const b = new Set<number>();
    item.rows.forEach((r, i) => {
      if (picks[i] !== r.answer) b.add(i);
    });
    setBad(b);
    if (b.size === 0) {
      a.right();
      onSolved(a.wrong + 1);
    } else a.miss();
  };
  const show = a.status !== "idle";
  return (
    <div className="space-y-3">
      <RichText text={item.prompt} className="text-[15px] font-semibold text-slate-900" />
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr>
              <th className="border border-slate-300 bg-slate-100 px-2 py-1.5 text-left">{item.rowHeader || "Statement"}</th>
              {item.columns.map((c) => (
                <th key={c} className="border border-slate-300 bg-slate-100 px-2 py-1.5 text-center whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {item.rows.map((r, ri) => (
              <tr key={ri} className={bad.has(ri) && !show ? "bg-rose-50" : ""}>
                <td className="border border-slate-300 px-2 py-1.5">
                  <RichText text={r.text} />
                </td>
                {item.columns.map((c, ci) => {
                  const chosen = (show ? r.answer : picks[ri]) === ci;
                  return (
                    <td key={c} className="border border-slate-300 text-center">
                      <button
                        type="button"
                        data-testid={`cls-${ri}-${ci}`}
                        disabled={show}
                        onClick={() => {
                          setPicks((p) => p.map((v, i) => (i === ri ? ci : v)));
                          a.clearFlash();
                        }}
                        className={`w-8 h-8 m-1 rounded-lg border-2 font-bold ${chosen ? (show ? "bg-emerald-500 border-emerald-600 text-white" : "bg-purple-600 border-purple-700 text-white") : "bg-white border-slate-300 text-transparent hover:border-purple-400"}`}
                      >
                        ✓
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {bad.size > 0 && a.status === "idle" && <div className="text-xs text-rose-700">{bad.size} row{bad.size > 1 ? "s are" : " is"} wrong (highlighted).</div>}
      <ActionRow a={a} canCheck={picks.every((p) => p !== null)} onCheck={check} preview={preview} />
      <Feedback a={a} hints={item.hints} explain={item.explain} solvedBefore={false} />
      {solved && a.status === "idle" && <div className="text-xs text-emerald-700 font-semibold">You have already solved this one.</div>}
    </div>
  );
};

// ---------------- Written answer, self-marked against the mark scheme ----------------
export const WrittenPractice: React.FC<KindProps<"written">> = ({ item, preview, onSolved, solved }) => {
  const [text, setText] = useState("");
  const [shown, setShown] = useState(false);
  const [ticks, setTicks] = useState<boolean[]>(() => item.points.map(() => false));
  const [done, setDone] = useState(false);
  const got = ticks.filter(Boolean).length;
  const enough = text.trim().split(/\s+/).filter(Boolean).length >= 3 || preview;
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <RichText text={item.prompt} className="text-[15px] font-semibold text-slate-900 flex-1" />
        <span className="shrink-0 px-2 py-0.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
          {item.marks} mark{item.marks > 1 ? "s" : ""}
        </span>
      </div>
      <textarea
        value={text}
        disabled={shown}
        data-testid="written-answer"
        rows={Math.min(8, 2 + item.marks)}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your answer as you would in the exam..."
        className="w-full p-2.5 rounded-xl border border-slate-300 text-sm disabled:bg-slate-50"
      />
      {!shown ? (
        <button type="button" data-testid="written-reveal" disabled={!enough} onClick={() => setShown(true)} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-40">
          Show the mark scheme
        </button>
      ) : (
        <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
          <div className="text-sm font-bold text-sky-950">
            Mark scheme - tick each point your answer makes (up to {item.marks} mark{item.marks > 1 ? "s" : ""}):
          </div>
          {item.guide && <div className="text-xs text-sky-900 bg-white/70 rounded-lg p-2 border border-sky-100"><RichText text={item.guide} /></div>}
          {item.points.map((p, i) => (
            <label key={i} className="flex items-start gap-2 text-sm text-sky-950 cursor-pointer">
              <input
                type="checkbox"
                disabled={done}
                checked={ticks[i]}
                data-testid={`written-tick-${i}`}
                onChange={() => setTicks((t) => t.map((v, j) => (j === i ? !v : v)))}
                className="mt-1"
              />
              <RichText text={p} />
            </label>
          ))}
          {item.model && (
            <div className="text-sm text-sky-950">
              <span className="font-bold">Example full-mark answer: </span>
              <RichText text={item.model} className="inline" />
            </div>
          )}
          {!done ? (
            <button
              type="button"
              data-testid="written-done"
              onClick={() => {
                setDone(true);
                if (got > 0 || preview) onSolved(1);
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold"
            >
              I have marked my answer
            </button>
          ) : (
            <div className={`text-sm font-bold ${got ? "text-emerald-800" : "text-rose-700"}`}>
              You gave yourself {Math.min(got, item.marks)} / {item.marks}.{" "}
              {got ? "Well done - read the example answer to see how to pick up any marks you missed." : "Read the mark scheme and example answer, then try the next question. This one does not count as solved yet."}
            </div>
          )}
        </div>
      )}
      {solved && !shown && <div className="text-xs text-emerald-700 font-semibold">You have already answered this one.</div>}
    </div>
  );
};
