import React, { useState } from "react";
import { Play, ListChecks, RotateCcw } from "lucide-react";
import { PythonCodeEditor } from "../PythonCodeEditor";
import { runPython, compareOutputs } from "../../utils/pythonRunner";

/**
 * A small Python IDLE inside the teacher's inspector: run the student's code with your
 * own inputs, or run every test case and see expected vs actual output side by side.
 * Changes here are only for trying things out - they never change the student's answer.
 */
export const TeacherPythonRunner: React.FC<{ task: any; studentCode: string }> = ({ task, studentCode }) => {
  const [code, setCode] = useState<string>(studentCode || "");
  const [inputs, setInputs] = useState<string>(
    Array.isArray(task?.tests) && task.tests[0]?.in ? task.tests[0].in.join("\n") : ""
  );
  const [output, setOutput] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [testRows, setTestRows] = useState<
    Array<{ inputs: string[]; expected: string; actual: string; passed: boolean; error: string | null; marks?: number }>
  | null>(null);

  const tests: any[] = Array.isArray(task?.tests) ? task.tests : [];

  const run = async () => {
    setRunning(true);
    setOutput("");
    let shown = "";
    const res = await runPython(
      code,
      inputs.split("\n"),
      (txt) => {
        shown += txt;
        setOutput((prev) => prev + txt);
      },
      task?.dataFiles
    );
    if (res.err) setOutput((prev) => prev + (prev ? "\n" : "") + "[Error] " + res.err);
    else if (!shown && !res.out) setOutput("(Program finished with no printed output)");
    setRunning(false);
  };

  const runTests = async () => {
    setRunning(true);
    const rows: NonNullable<typeof testRows> = [];
    for (const t of tests) {
      const ins: string[] = Array.isArray(t.in) ? t.in.map(String) : [];
      const res = await runPython(code, ins, undefined, task?.dataFiles);
      const expected = String(t.out ?? "");
      rows.push({
        inputs: ins,
        expected,
        actual: res.out || "",
        passed: !res.err && compareOutputs(res.out || "", expected),
        error: res.err,
        marks: t.m,
      });
    }
    setTestRows(rows);
    setRunning(false);
  };

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-emerald-900">Run the student's code (Python)</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" /> {running ? "Running..." : "Run"}
          </button>
          {tests.length > 0 && (
            <button
              type="button"
              onClick={runTests}
              disabled={running}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-400 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold disabled:opacity-50"
            >
              <ListChecks className="w-3.5 h-3.5" /> Run all {tests.length} test case{tests.length === 1 ? "" : "s"}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setCode(studentCode || "");
              setOutput("");
              setTestRows(null);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold"
            title="Undo your edits and go back to exactly what the student submitted"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Student's code
          </button>
        </div>
      </div>

      <PythonCodeEditor value={code} onChange={setCode} onRun={run} isRunning={running} minHeight="200px" allowCopyPaste={true} />
      <p className="text-[11px] text-slate-500">
        You can edit the code here to try things out; this never changes the student's answer or marks.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700">Inputs (one per input() line):</label>
          <textarea
            value={inputs}
            onChange={(e) => setInputs(e.target.value)}
            rows={4}
            className="w-full p-2 text-xs font-mono border border-slate-300 rounded-lg bg-white"
            placeholder={"e.g.\n12\nAlice"}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700">Output:</label>
          <pre className="w-full min-h-[92px] max-h-56 overflow-auto p-2 text-xs font-mono rounded-lg bg-slate-900 text-slate-100 whitespace-pre-wrap">
            {output || "Press Run to see the output."}
          </pre>
        </div>
      </div>

      {testRows && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-800">
            Test results: {testRows.filter((r) => r.passed).length} of {testRows.length} passed
          </div>
          {testRows.map((r, i) => (
            <div
              key={i}
              className={`rounded-lg border p-2 text-[11px] ${r.passed ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50"}`}
            >
              <div className="font-bold mb-1">
                {r.passed ? "✓" : "✗"} Test {i + 1}
                {r.marks !== undefined ? ` (${r.marks} mark${r.marks === 1 ? "" : "s"})` : ""} - inputs:{" "}
                <span className="font-mono">{r.inputs.length ? r.inputs.join(", ") : "(none)"}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <div className="text-slate-500">Expected</div>
                  <pre className="p-1.5 rounded bg-white border border-slate-200 font-mono whitespace-pre-wrap">{r.expected}</pre>
                </div>
                <div>
                  <div className="text-slate-500">Student's program printed</div>
                  <pre className="p-1.5 rounded bg-white border border-slate-200 font-mono whitespace-pre-wrap">
                    {r.actual || "(nothing)"}
                    {r.error ? `\n[Error] ${r.error}` : ""}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
