import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Lightbulb, Lock, CheckCircle2, XCircle, Play, Trophy, BookOpen, Wrench, Star } from "lucide-react";
import type { LearnLesson, LearnStep, LessonProgress, PracticeItem, QuizQuestion } from "./learnTypes";
import { STAMP_INFO, practiceTargetCount, quizLength } from "./learnTypes";
import { McqPractice, OutputPractice, TracePractice, OrderPractice, LEVEL_LABEL, ClassifyPractice, WrittenPractice } from "./PracticeKinds";
import { RichText, CodeBlock, CodeTracer, BitsWidget, GatesWidget, StepperWidget, CalcWidget } from "./LearnWidgets";
import { Flowchart } from "./Flowchart";
import { PythonCodeEditor } from "../PythonCodeEditor";
import { runPython, compareOutputs, normalizeOutput } from "../../utils/pythonRunner";

export type LessonEvent =
  | { kind: "step"; step: number }
  | { kind: "learned" }
  | { kind: "practice"; practiceId: string; attempts: number }
  | { kind: "quiz"; score: number };

interface Props {
  lesson: LearnLesson;
  progress?: LessonProgress | null;
  preview?: boolean; // teacher preview: nothing is saved, everything unlocked
  allowQuizRetakes?: boolean;
  onEvent?: (e: LessonEvent) => Promise<void> | void;
  onBack: () => void;
  backLabel?: string;
}

const norm = (s: string) => String(s || "").trim().toLowerCase().replace(/\s+/g, " ").replace(/^["']|["']$/g, "");
const normTight = (s: string) => norm(s).replace(/\s/g, "");

// Seeded shuffle so quiz options are mixed but stable for one attempt
function shuffled<T>(arr: T[], seed: number): { item: T; orig: number }[] {
  const a = arr.map((item, orig) => ({ item, orig }));
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------- Check question with scaffolding (hints, then explanation) ----------------
const CheckStep: React.FC<{ step: Extract<LearnStep, { kind: "check" }>; onPassed: () => void; preview?: boolean }> = ({ step, onPassed, preview }) => {
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [wrong, setWrong] = useState(0);
  const [status, setStatus] = useState<"idle" | "right" | "revealed">("idle");
  const [lastWrong, setLastWrong] = useState(false);

  const submit = () => {
    const ok = step.options
      ? choice === step.answer
      : (step.accept || []).some((a) => norm(a) === norm(text) || normTight(a) === normTight(text));
    if (ok) {
      setStatus("right");
      setLastWrong(false);
      onPassed();
    } else {
      setWrong((w) => w + 1);
      setLastWrong(true);
    }
  };
  const hintsShown = Math.min(wrong, step.hints.length);
  const canReveal = wrong >= step.hints.length || preview;

  return (
    <div className="space-y-3">
      <div className="text-base font-semibold text-slate-900">
        <RichText text={step.question} />
      </div>
      {(step as any).flowchart && <Flowchart nodes={(step as any).flowchart} title="flowchart" />}
{step.code && <CodeBlock code={step.code} />}
      {step.options ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {step.options.map((o, i) => (
            <button
              key={i}
              type="button"
              disabled={status !== "idle"}
              onClick={() => { setChoice(i); setLastWrong(false); }}
              className={`text-left px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                status !== "idle" && i === step.answer
                  ? "border-emerald-500 bg-emerald-50"
                  : choice === i
                  ? "border-purple-500 bg-purple-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="font-mono">{o}</span>
            </button>
          ))}
        </div>
      ) : (
        <input
          value={text}
          disabled={status !== "idle"}
          onChange={(e) => { setText(e.target.value); setLastWrong(false); }}
          onKeyDown={(e) => e.key === "Enter" && text.trim() && submit()}
          placeholder="Type your answer"
          className="w-full sm:w-80 px-3 py-2 border-2 border-slate-300 rounded-xl font-mono"
        />
      )}
      {status === "idle" && (
        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            data-testid="check-answer"
            disabled={step.options ? choice === null : !text.trim()}
            onClick={submit}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold disabled:opacity-40"
          >
            Check answer
          </button>
          {canReveal && (
            <button type="button" onClick={() => { setStatus("revealed"); onPassed(); }} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-600">
              Show me the answer
            </button>
          )}
        </div>
      )}
      {lastWrong && status === "idle" && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-900 flex gap-2">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" /> Not quite - have another go.
        </div>
      )}
      {hintsShown > 0 && status === "idle" && (
        <div className="space-y-1.5">
          {step.hints.slice(0, hintsShown).map((h, i) => (
            <div key={i} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-950 flex gap-2">
              <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" /> <span><strong>Hint {i + 1}:</strong> {h}</span>
            </div>
          ))}
        </div>
      )}
      {status !== "idle" && (
        <div className={`p-3 rounded-xl border text-sm flex gap-2 ${status === "right" ? "bg-emerald-50 border-emerald-200 text-emerald-950" : "bg-sky-50 border-sky-200 text-sky-950"}`}>
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            <strong>{status === "right" ? "Correct! " : "Answer: "}</strong>
            {step.explain}
          </span>
        </div>
      )}
    </div>
  );
};

// ---------------- Trace step with an optional "predict first" question ----------------
const TraceStep: React.FC<{ step: Extract<LearnStep, { kind: "trace" }>; onDone: () => void }> = ({ step, onDone }) => {
  const [predicted, setPredicted] = useState<number | null>(step.predict ? null : -1);
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-700">{step.intro}</p>
      {step.predict && predicted === null ? (
        <div className="space-y-3">
          <CodeBlock code={step.code.replace(/\n$/, "")} title="Predict first" />
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-sm font-semibold text-purple-950">🤔 {step.predict.question}</div>
          <div className="grid grid-cols-2 gap-2">
            {step.predict.options.map((o, i) => (
              <button key={i} type="button" data-testid="predict-option" onClick={() => setPredicted(i)} className="px-3 py-2 rounded-xl border-2 border-slate-200 bg-white hover:border-purple-400 font-mono text-sm">
                {o}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-500">Make a prediction, then step through the code to check it.</div>
        </div>
      ) : (
        <>
          {step.predict && predicted !== null && predicted >= 0 && (
            <div className="text-xs text-slate-600">
              Your prediction: <span className="font-mono font-bold">{step.predict.options[predicted]}</span> - step through to the end to see if you were right.
            </div>
          )}
          <CodeTracer code={step.code} frames={step.frames} notes={step.notes} inputs={step.inputs} files={step.files} onFinished={onDone} />
          {step.predict && predicted !== null && predicted >= 0 && step.frames.length > 0 && (
            <TracePredictResult right={predicted === step.predict.answer} answer={step.predict.options[step.predict.answer]} />
          )}
        </>
      )}
    </div>
  );
};

const TracePredictResult: React.FC<{ right: boolean; answer: string }> = ({ right, answer }) => (
  <div className={`p-3 rounded-xl border text-sm ${right ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-amber-50 border-amber-200 text-amber-950"}`}>
    {right ? "✓ Your prediction was right!" : `The answer is ${answer}. Step through slowly to see why.`}
  </div>
);

// ---------------- Practice ----------------
async function runAllTests(item: Extract<PracticeItem, { kind: "code" }>, code: string) {
  const results: { pass: boolean; got: string; expected: string; inputs: string[]; err?: string | null }[] = [];
  const hasSk = typeof (window as any).Sk !== "undefined";
  if (hasSk) {
    for (const t of item.tests) {
      const r = await runPython(code, t.inputs, undefined, item.files);
      results.push({
        pass: !r.err && (normalizeOutput(r.out) === normalizeOutput(t.expected) || compareOutputs(r.out, t.expected)),
        got: r.out,
        expected: t.expected,
        inputs: t.inputs,
        err: r.err,
      });
    }
    return results;
  }
  const res = await fetch("/api/learn/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, inputsList: item.tests.map((t) => t.inputs), files: item.files || {} }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !Array.isArray(data.results)) throw new Error(data.error || "Could not run your code.");
  item.tests.forEach((t, i) => {
    const r = data.results[i] || { out: "", err: "No result" };
    results.push({ pass: !r.err && compareOutputs(r.out, t.expected), got: r.out, expected: t.expected, inputs: t.inputs, err: r.err });
  });
  return results;
}

const PracticeCard: React.FC<{
  item: Extract<PracticeItem, { kind: "code" }> | Extract<PracticeItem, { kind: "answer" }>;
  done: boolean;
  preview?: boolean;
  onSolved: (attempts: number) => void;
}> = ({ item, done, preview, onSolved }) => {
  const [code, setCode] = useState(item.kind === "code" ? item.starter : "");
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Awaited<ReturnType<typeof runAllTests>> | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [runOut, setRunOut] = useState("");
  const [solved, setSolved] = useState(done);

  const check = async () => {
    setBusy(true);
    setMsg(null);
    const n = attempts + 1;
    setAttempts(n);
    try {
      if (item.kind === "code") {
        const r = await runAllTests(item, code);
        setResults(r);
        const all = r.every((x) => x.pass);
        if (all) {
          setSolved(true);
          setMsg({ ok: true, text: `All ${r.length} test${r.length > 1 ? "s" : ""} passed - well done!` });
          onSolved(n);
        } else {
          setMsg({ ok: false, text: `${r.filter((x) => x.pass).length} of ${r.length} tests passed. Compare your output with the expected output below.` });
          if (n >= 1) setHints((h) => Math.max(h, Math.min(item.hints.length, n)));
        }
      } else {
        const ok = item.accept.some((a) => norm(a) === norm(answer) || normTight(a) === normTight(answer));
        if (ok) {
          setSolved(true);
          setMsg({ ok: true, text: "Correct!" });
          onSolved(n);
        } else {
          setMsg({ ok: false, text: "Not quite - check your working." });
          setHints((h) => Math.max(h, Math.min(item.hints.length, n)));
        }
      }
    } catch (e: any) {
      setMsg({ ok: false, text: e?.message || "Something went wrong running your code." });
    } finally {
      setBusy(false);
    }
  };

  const tryRun = async () => {
    if (item.kind !== "code") return;
    setRunOut("Running...");
    const firstInputs = item.tests[0]?.inputs || [];
    if (typeof (window as any).Sk !== "undefined") {
      let shown = "";
      const r = await runPython(code, firstInputs, (t) => { shown += t; }, item.files);
      setRunOut(shown + (r.err ? "\n[Error] " + r.err : ""));
    } else {
      try {
        const res = await fetch("/api/learn/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, inputsList: [firstInputs], files: item.files || {} }) });
        const d = await res.json();
        const r = d.results?.[0];
        setRunOut(r ? r.out + (r.err ? "\n[Error] " + r.err : "") : d.error || "Could not run.");
      } catch {
        setRunOut("Could not run your code.");
      }
    }
  };

  const canShowSolution = preview || attempts >= 3;
  return (
    <div className={`p-4 rounded-2xl border-2 bg-white space-y-3 ${solved ? "border-emerald-300" : "border-slate-200"}`}>
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-bold text-slate-900">{item.title}</h4>
        {solved && <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Solved</span>}
      </div>
      <RichText text={item.prompt} className="text-sm text-slate-800" />
      {item.kind === "code" && item.files && Object.keys(item.files).length > 0 && (
        <div className="space-y-1">
          {Object.entries(item.files).map(([n, c]) => (
            <details key={n} className="text-xs" open>
              <summary className="cursor-pointer font-semibold text-slate-600">📄 {n} (your program can open this file)</summary>
              <pre className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded font-mono">{c}</pre>
            </details>
          ))}
        </div>
      )}
      {item.kind === "code" ? (
        <>
          <PythonCodeEditor value={code} onChange={setCode} starterCode={item.starter} onRun={tryRun} minHeight="160px" allowCopyPaste={true} title="Your program" />
          {item.tests[0]?.inputs.length > 0 && (
            <div className="text-[11px] text-slate-500">Run uses the test inputs: {item.tests[0].inputs.map((x) => `"${x}"`).join(", ")}</div>
          )}
          {runOut && <pre className="p-2 rounded-lg bg-slate-800 text-slate-100 text-xs font-mono whitespace-pre-wrap">{runOut}</pre>}
        </>
      ) : (
        <input value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && answer.trim() && check()} placeholder="Your answer" className="w-full sm:w-80 px-3 py-2 border-2 border-slate-300 rounded-xl font-mono" />
      )}
      <div className="flex flex-wrap gap-2">
        {item.kind === "code" && (
          <button type="button" onClick={tryRun} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 inline-flex items-center gap-1">
            <Play className="w-3.5 h-3.5" /> Run
          </button>
        )}
        <button type="button" data-testid="practice-check" disabled={busy || (item.kind === "answer" && !answer.trim())} onClick={check} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-50">
          {busy ? "Checking..." : item.kind === "code" ? "Check my code" : "Check answer"}
        </button>
        {hints < item.hints.length && (
          <button type="button" onClick={() => setHints((h) => h + 1)} className="px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 text-sm font-bold text-amber-800 inline-flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5" /> Hint
          </button>
        )}
        {canShowSolution && !showSolution && (
          <button type="button" onClick={() => setShowSolution(true)} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-600">
            Show a model answer
          </button>
        )}
      </div>
      {msg && (
        <div className={`p-3 rounded-xl border text-sm ${msg.ok ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900"}`}>{msg.text}</div>
      )}
      {results && !results.every((r) => r.pass) && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`p-2.5 rounded-xl border text-xs ${r.pass ? "border-emerald-200 bg-emerald-50/50" : "border-rose-200 bg-rose-50/50"}`}>
              <div className="font-bold mb-1">
                {r.pass ? "✓" : "✗"} Test {i + 1}
                {r.inputs.length > 0 && <span className="font-normal text-slate-500"> - inputs {r.inputs.map((x) => `"${x}"`).join(", ")}</span>}
              </div>
              {!r.pass && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <div className="text-slate-500">Expected output</div>
                    <pre className="p-1.5 bg-white rounded border border-slate-200 font-mono whitespace-pre-wrap">{r.expected}</pre>
                  </div>
                  <div>
                    <div className="text-slate-500">Your output</div>
                    <pre className="p-1.5 bg-white rounded border border-slate-200 font-mono whitespace-pre-wrap">{r.err ? r.got + "\nError: " + r.err : r.got || "(nothing printed)"}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {hints > 0 && (
        <div className="space-y-1.5">
          {item.hints.slice(0, hints).map((h, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-950 flex gap-2">
              <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" /> <span><strong>Hint {i + 1}:</strong> <span className="whitespace-pre-wrap">{h}</span></span>
            </div>
          ))}
        </div>
      )}
      {showSolution && (
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-600">Model answer {item.kind === "code" && "(type it yourself rather than copying - that is how you learn it)"}</div>
          {item.kind === "code" ? <CodeBlock code={item.solution.replace(/\n$/, "")} /> : <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono">{item.solution}</div>}
        </div>
      )}
    </div>
  );
};

// ---------------- Practice runner: one question at a time ----------------
const KIND_LABEL: Record<string, string> = {
  mcq: "Multiple choice",
  output: "Predict the output",
  trace: "Trace table",
  order: "Put the code in order",
  code: "Write the program",
  answer: "Short answer",
  classify: "Complete the table",
  written: "Exam-style written answer",
};

const PracticeRunner: React.FC<{
  items: PracticeItem[];
  solvedIds: Set<string>;
  preview?: boolean;
  onSolved: (id: string, attempts: number) => void;
  onGoQuiz: () => void;
}> = ({ items, solvedIds, preview, onSolved, onGoQuiz }) => {
  const [localSolved, setLocalSolved] = useState<Set<string>>(new Set());
  const isSolved = (id: string) => solvedIds.has(id) || localSolved.has(id);
  const [level, setLevel] = useState<number>(0);
  const visible = items.filter((p) => !level || (p.level || 2) === level);
  const firstOpen = Math.max(0, visible.findIndex((p) => !isSolved(p.id)));
  const [pos, setPos] = useState(firstOpen);
  const cur = visible[Math.min(pos, visible.length - 1)];
  const solvedCount = items.filter((p) => isSolved(p.id)).length;
  const target = practiceTargetCount(items.length);
  const go = (i: number) => {
    setPos(Math.max(0, Math.min(visible.length - 1, i)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const nextOpen = () => {
    for (let k = 1; k <= visible.length; k++) {
      const i = (pos + k) % visible.length;
      if (!isSolved(visible[i].id)) return go(i);
    }
  };
  const markSolved = (id: string, attempts: number) => {
    setLocalSolved((s) => new Set(s).add(id));
    onSolved(id, attempts);
  };
  const levels = Array.from(new Set(items.map((p) => p.level || 2))).sort();
  if (!cur) return <div className="text-sm text-slate-500">No practice questions for this lesson.</div>;
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-emerald-950">
          <span>
            <strong>{solvedCount}</strong> of {items.length} solved - get <strong>{target}</strong> right to earn the 🛠️ stamp.
          </span>
          <span className="flex gap-1 text-xs">
            <button type="button" onClick={() => { setLevel(0); setPos(0); }} className={`px-2 py-1 rounded-lg font-bold ${!level ? "bg-emerald-700 text-white" : "bg-white text-emerald-800 border border-emerald-300"}`}>
              All
            </button>
            {levels.map((l) => (
              <button key={l} type="button" onClick={() => { setLevel(l); setPos(0); }} className={`px-2 py-1 rounded-lg font-bold ${level === l ? "bg-emerald-700 text-white" : "bg-white text-emerald-800 border border-emerald-300"}`}>
                {LEVEL_LABEL[l]?.label}
              </button>
            ))}
          </span>
        </div>
        <div className="h-2 rounded-full bg-white overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(solvedCount / Math.max(1, items.length)) * 100}%` }} />
        </div>
        <div className="flex flex-wrap gap-1">
          {visible.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => go(i)}
              title={`${i + 1}. ${KIND_LABEL[p.kind]}`}
              className={`w-7 h-7 rounded-lg text-[11px] font-bold border ${
                i === pos ? "bg-purple-600 text-white border-purple-700" : isSolved(p.id) ? "bg-emerald-500 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div key={cur.id} className="p-4 rounded-2xl border-2 border-slate-200 bg-white space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-500">
            Question {pos + 1} of {visible.length}
          </span>
          <span className={`px-2 py-0.5 rounded-full font-bold ${LEVEL_LABEL[cur.level || 2]?.cls}`}>{LEVEL_LABEL[cur.level || 2]?.label}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">{KIND_LABEL[cur.kind]}</span>
          {cur.title && <span className="text-slate-600 font-semibold">{cur.title}</span>}
          {isSolved(cur.id) && <span className="ml-auto text-emerald-700 font-bold inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Solved</span>}
        </div>
        {cur.kind === "mcq" && <McqPractice item={cur} solved={isSolved(cur.id)} preview={preview} onSolved={(n) => markSolved(cur.id, n)} />}
        {cur.kind === "output" && <OutputPractice item={cur} solved={isSolved(cur.id)} preview={preview} onSolved={(n) => markSolved(cur.id, n)} />}
        {cur.kind === "trace" && <TracePractice item={cur} solved={isSolved(cur.id)} preview={preview} onSolved={(n) => markSolved(cur.id, n)} />}
        {cur.kind === "order" && <OrderPractice item={cur} solved={isSolved(cur.id)} preview={preview} onSolved={(n) => markSolved(cur.id, n)} />}
        {cur.kind === "classify" && <ClassifyPractice item={cur} solved={isSolved(cur.id)} preview={preview} onSolved={(n) => markSolved(cur.id, n)} />}
        {cur.kind === "written" && <WrittenPractice item={cur} solved={isSolved(cur.id)} preview={preview} onSolved={(n) => markSolved(cur.id, n)} />}
        {(cur.kind === "code" || cur.kind === "answer") && (
          <PracticeCard item={cur} done={isSolved(cur.id)} preview={preview} onSolved={(n) => markSolved(cur.id, n)} />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" disabled={pos === 0} onClick={() => go(pos - 1)} className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700 inline-flex items-center gap-1 disabled:opacity-40">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <div className="flex gap-2">
          {solvedCount < items.length && (
            <button type="button" onClick={nextOpen} className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-sm font-bold text-emerald-800">
              Next unsolved
            </button>
          )}
          {pos < visible.length - 1 ? (
            <button type="button" data-testid="practice-next" onClick={() => go(pos + 1)} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold inline-flex items-center gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={onGoQuiz} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold inline-flex items-center gap-1">
              Go to the quiz <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------- Quiz ----------------
const QuizPanel: React.FC<{
  questions: QuizQuestion[];
  best?: number;
  attempts: number;
  allowRetake: boolean;
  preview?: boolean;
  draw?: number;
  onFinish: (score: number) => void;
}> = ({ questions, best, attempts, allowRetake, preview, onFinish, draw }) => {
  const [seed, setSeed] = useState(() => Date.now() % 100000);
  const pool = questions;
  // A fresh random selection of questions for each attempt
  questions = useMemo(() => {
    const n = quizLength({ quiz: pool, quizDraw: draw });
    return shuffled(pool, seed * 3 + 1).slice(0, n).map((x) => x.item);
  }, [pool, seed, draw]); // eslint-disable-line react-hooks/exhaustive-deps
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(quizLength({ quiz: pool, quizDraw: draw })).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const orders = useMemo(() => questions.map((q, i) => shuffled(q.options, seed + i * 7)), [questions, seed]);
  const score = answers.reduce((s: number, a, i) => s + (a === questions[i].answer ? 1 : 0), 0);
  const locked = !preview && !allowRetake && attempts > 0 && !submitted;

  if (locked) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm">
        You have already taken this quiz. Your score: <strong>{best} / {questions.length}</strong>. Your teacher allows one attempt.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {attempts > 0 && !submitted && (
        <div className="text-xs text-slate-600">Best score so far: <strong>{best} / {questions.length}</strong> ({attempts} attempt{attempts > 1 ? "s" : ""}). The options are in a new order each time.</div>
      )}
      {questions.map((q, qi) => (
        <div key={qi} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
          <div className="font-semibold text-slate-900 text-sm">
            {qi + 1}. <RichText text={q.q} className="inline" />
          </div>
          {q.flowchart && <Flowchart nodes={q.flowchart} title="flowchart" />}
{q.code && <CodeBlock code={q.code} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {orders[qi].map(({ item, orig }) => {
              const chosen = answers[qi] === orig;
              const isRight = orig === q.answer;
              return (
                <button
                  key={orig}
                  type="button"
                  disabled={submitted}
                  data-testid={`quiz-${qi}-opt`}
                  data-correct={isRight ? "1" : "0"}
                  onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? orig : v)))}
                  className={`text-left px-3 py-2 rounded-xl border-2 text-sm font-mono transition-all ${
                    submitted && isRight ? "border-emerald-500 bg-emerald-50" : submitted && chosen ? "border-rose-400 bg-rose-50" : chosen ? "border-purple-500 bg-purple-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
          {submitted && (
            <div className={`text-xs p-2 rounded-lg ${answers[qi] === q.answer ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-950"}`}>
              {answers[qi] === q.answer ? "✓ " : "✗ "}
              {q.explain}
            </div>
          )}
        </div>
      ))}
      {!submitted ? (
        <button
          type="button"
          data-testid="quiz-submit"
          disabled={answers.some((a) => a === null)}
          onClick={() => {
            setSubmitted(true);
            onFinish(score);
          }}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold disabled:opacity-40"
        >
          Submit quiz
        </button>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="text-lg font-bold">
            Score: {score} / {questions.length} {score === questions.length ? "🏆" : score / questions.length >= 0.6 ? "⭐" : ""}
          </div>
          {(allowRetake || preview) && (
            <button
              type="button"
              onClick={() => {
                setAnswers(questions.map(() => null));
                setSubmitted(false);
                setSeed((s) => s + 101);
              }}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 text-sm font-bold"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ---------------- Player ----------------
export const LessonPlayer: React.FC<Props> = ({ lesson, progress, preview, allowQuizRetakes = true, onEvent, onBack, backLabel }) => {
  const total = lesson.steps.length;
  const learned = Boolean(progress?.learnedAt) || preview;
  const [tab, setTab] = useState<"learn" | "practice" | "quiz">(progress?.learnedAt && !preview ? "practice" : "learn");
  const [idx, setIdx] = useState(() => Math.min(Math.max(0, progress?.stepReached || 0), total - 1));
  const [ready, setReady] = useState<Record<number, boolean>>({});
  const reportedRef = useRef(progress?.stepReached || 0);
  const step = lesson.steps[idx];

  const markReady = (i: number) => setReady((r) => (r[i] ? r : { ...r, [i]: true }));
  const needsAction = (s: LearnStep) =>
    s.kind === "check" || s.kind === "trace" || s.kind === "stepper" || (s.kind === "bits" && s.target !== null) || s.kind === "gates";
  const stepDone = preview || !needsAction(step) || ready[idx] || idx < (progress?.stepReached || 0) || Boolean(progress?.learnedAt);

  useEffect(() => {
    if (preview || !onEvent) return;
    if (idx > reportedRef.current) {
      reportedRef.current = idx;
      onEvent({ kind: "step", step: idx });
    }
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishLearning = async () => {
    if (!preview && onEvent && !progress?.learnedAt) await onEvent({ kind: "learned" });
    setTab("practice");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const practiceDone = (id: string) => Boolean(progress?.practice?.[id]);
  const practiceCount = lesson.practice.filter((p) => practiceDone(p.id)).length;
  const quiz = progress?.quiz;

  const tabBtn = (key: "learn" | "practice" | "quiz", label: string, icon: React.ReactNode, lockedTab: boolean, extra?: string) => (
    <button
      type="button"
      data-testid={`tab-${key}`}
      disabled={lockedTab}
      onClick={() => setTab(key)}
      className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-all ${
        tab === key ? "bg-white shadow text-slate-900" : lockedTab ? "text-slate-400 cursor-not-allowed" : "text-slate-600 hover:bg-white/60"
      }`}
      title={lockedTab ? "Finish the learning steps first" : ""}
    >
      {lockedTab ? <Lock className="w-3.5 h-3.5" /> : icon} {label}
      {extra && <span className="text-[11px] font-semibold text-slate-500">{extra}</span>}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> {backLabel || "Back to my lessons"}
        </button>
        {preview && <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold">Teacher preview - nothing is saved</span>}
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-700 text-white space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="px-2 py-0.5 rounded-full bg-white/20">{lesson.paper}</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20">{lesson.spec}</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20">about {lesson.minutes} min</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold">{lesson.title}</h2>
        <p className="text-sm text-purple-100">{lesson.summary}</p>
        {progress && Object.keys(progress.stamps || {}).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {Object.entries(progress.stamps).map(([k, t]) => (
              <span key={k} className="px-2 py-0.5 rounded-full bg-white text-slate-900 text-xs font-bold" title={new Date(t as number).toLocaleString()}>
                {STAMP_INFO[k]?.icon} {STAMP_INFO[k]?.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-1 p-1 rounded-2xl bg-slate-100">
        {tabBtn("learn", "Learn", <BookOpen className="w-4 h-4" />, false, `${Math.min(idx + 1, total)}/${total}`)}
        {tabBtn("practice", "Practice", <Wrench className="w-4 h-4" />, !learned, `${practiceCount}/${lesson.practice.length}`)}
        {tabBtn("quiz", "Quiz", <Star className="w-4 h-4" />, !learned, quiz ? `best ${quiz.best}/${quiz.max}` : `${quizLength(lesson)} questions`)}
      </div>

      {tab === "learn" && (
        <div className="space-y-4">
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-purple-600 transition-all" style={{ width: `${((idx + 1) / total) * 100}%` }} />
          </div>
          <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
            {"title" in step && step.title && <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>}
            {step.kind === "explain" && (
              <>
                <RichText text={step.body} className="text-[15px] text-slate-800" />
                {(step as any).flowchart && <Flowchart nodes={(step as any).flowchart} title="flowchart" />}
{step.code && <CodeBlock code={step.code} />}
                {step.tip && <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-950">💡 {step.tip}</div>}
              </>
            )}
            {step.kind === "trace" && <TraceStep step={step} onDone={() => markReady(idx)} />}
            {step.kind === "check" && (
              <>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-700">Check your understanding</div>
                <CheckStep step={step} preview={preview} onPassed={() => markReady(idx)} />
              </>
            )}
            {step.kind === "bits" && (
              <>
                <p className="text-sm text-slate-700">{step.intro}</p>
                <BitsWidget mode={step.mode} bits={step.bits} target={step.target} showHex={step.showHex} onSolved={() => markReady(idx)} />
              </>
            )}
            {step.kind === "gates" && (
              <>
                <p className="text-sm text-slate-700">{step.intro}</p>
                <GatesWidget gate={step.gate} onSolved={() => markReady(idx)} />
              </>
            )}
            {step.kind === "stepper" && (
              <>
                <p className="text-sm text-slate-700">{step.intro}</p>
                <StepperWidget frames={step.frames} onFinished={() => markReady(idx)} />
              </>
            )}
            {step.kind === "calc" && (
              <>
                <p className="text-sm text-slate-700">{step.intro}</p>
                <CalcWidget calc={step.calc} />
              </>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <button type="button" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)} className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700 inline-flex items-center gap-1 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {!stepDone && (
              <span className="text-xs text-slate-500 text-center">
                {step.kind === "check" ? "Answer the question to continue" : step.kind === "gates" ? "Try every input combination to continue" : step.kind === "bits" ? "Make the target number to continue" : "Step through to the end to continue"}
              </span>
            )}
            {idx < total - 1 ? (
              <button type="button" data-testid="lesson-next" disabled={!stepDone} onClick={() => { setIdx((i) => i + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold inline-flex items-center gap-1 disabled:opacity-40">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" data-testid="lesson-finish" disabled={!stepDone} onClick={finishLearning} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center gap-1 disabled:opacity-40">
                Finish learning <Trophy className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {tab === "practice" && (
        <div className="space-y-4">
          <PracticeRunner
            items={lesson.practice}
            solvedIds={new Set(Object.keys(progress?.practice || {}))}
            preview={preview}
            onSolved={(id, attempts) => {
              if (!preview && onEvent) onEvent({ kind: "practice", practiceId: id, attempts });
            }}
            onGoQuiz={() => {
              setTab("quiz");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}

      {tab === "quiz" && (
        <QuizPanel
          questions={lesson.quiz}
          draw={lesson.quizDraw}
          best={quiz?.best}
          attempts={quiz?.attempts || 0}
          allowRetake={allowQuizRetakes}
          preview={preview}
          onFinish={(score) => {
            if (!preview && onEvent) onEvent({ kind: "quiz", score });
          }}
        />
      )}
    </div>
  );
};
