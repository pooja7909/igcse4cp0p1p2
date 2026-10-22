import React, { useEffect, useMemo, useState } from "react";
import { Layers, Download, Printer, Save, Trash2, Search, Link2, X } from "lucide-react";
import { Assessment } from "../../types";
import { teacherFetch } from "../../utils/teacherAuth";
import { getEdexcelGrade, GRADE_BOUNDARY_PRESETS, GradeBoundaries, EDEXCEL_STANDARD_BOUNDARIES } from "../../utils/gradeBoundaries";

// Merge the results of several assessments (e.g. two Year 11 Python assessments) into one
// combined mark, percentage and grade per student.

interface CStudent {
  studentId: string;
  name: string;
  className: string;
  candidateNumber: string;
  status: string;
  totalMarks: number;
  maxMarks: number;
  submittedAt: number;
}
interface CAssessment {
  id: string;
  title: string;
  code: string;
  type: string;
  maxMarks: number;
  createdAt: number;
  classGroup: string;
  gradeBoundaries: Partial<GradeBoundaries> | null;
  students: CStudent[];
}
type Method = "marks" | "equal" | "weights";
interface SavedCombo {
  name: string;
  ids: string[];
  method: Method;
  weights: Record<string, number>;
  missing: "zero" | "skip";
  boundaries: string;
  alts?: Record<string, string[]>;
}

const SAVED_KEY = "edexcel_combined_results_v1";
const MERGE_KEY = "edexcel_combined_name_links_v1";
// The total marks students actually sat (the most common total among submitted work).
// If questions were changed after students sat it, the stored total can differ from this.
function realMax(a: { maxMarks: number; students: { status: string; maxMarks: number }[] }): number {
  const counts: Record<number, number> = {};
  a.students.forEach((s) => {
    if (s.status === "submitted" && s.maxMarks > 0) counts[s.maxMarks] = (counts[s.maxMarks] || 0) + 1;
  });
  const best = Object.entries(counts).sort((x, y) => y[1] - x[1])[0];
  return best ? Number(best[0]) : a.maxMarks || 0;
}
const normName = (n: string) => String(n || "").trim().toLowerCase().replace(/\s+/g, " ");

function loadJSON<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key: string, v: any) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

export const CombinedResultsView: React.FC<{ assessments: Assessment[] }> = ({ assessments }) => {
  const [selected, setSelected] = useState<string[]>([]);
  // Different versions of an assessment (e.g. a catch-up paper with other questions): mainId -> other ids
  const [alts, setAlts] = useState<Record<string, string[]>>({});
  const [allById, setAllById] = useState<Record<string, CAssessment>>({});
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "assessment" | "task">("all");
  const [data, setData] = useState<CAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [method, setMethod] = useState<Method>("marks");
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [missing, setMissing] = useState<"zero" | "skip">("zero");
  const [boundaries, setBoundaries] = useState<string>("first");
  const [classFilter, setClassFilter] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "pct">("name");
  const [links, setLinks] = useState<Record<string, string>>(() => loadJSON(MERGE_KEY, {}));
  const [saved, setSaved] = useState<SavedCombo[]>(() => loadJSON(SAVED_KEY, []));
  const [saveName, setSaveName] = useState("");

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...assessments]
      .filter((a) => typeFilter === "all" || (a.type || "assessment") === typeFilter)
      .filter((a) => !q || a.title.toLowerCase().includes(q) || String(a.code).toLowerCase().includes(q))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [assessments, search, typeFilter]);

  // Load results whenever the selection changes
  useEffect(() => {
    if (!selected.length) {
      setData([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    const want = Array.from(new Set([...selected, ...selected.flatMap((id) => alts[id] || [])]));
    teacherFetch("/api/combined-results", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: want }) })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const byId: Record<string, CAssessment> = {};
        (d.assessments || []).forEach((a: CAssessment) => (byId[a.id] = a));
        setAllById(byId);
        setData(selected.map((id) => byId[id]).filter(Boolean));
      })
      .catch(() => !cancelled && setError("Could not load the results. Please try again."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selected.join("|"), JSON.stringify(alts)]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const setLink = (from: string, to: string) => {
    const next = { ...links };
    if (to) next[from] = to;
    else delete next[from];
    setLinks(next);
    saveJSON(MERGE_KEY, next);
  };
  const resolve = (key: string) => {
    let k = key;
    for (let i = 0; i < 10 && links[k] && links[k] !== k; i++) k = links[k];
    return k;
  };

  const bounds: Partial<GradeBoundaries> | null = useMemo(() => {
    if (boundaries === "first") return data[0]?.gradeBoundaries || null;
    if (boundaries.startsWith("a:")) return allById[boundaries.slice(2)]?.gradeBoundaries || null;
    return GRADE_BOUNDARY_PRESETS.find((p) => p.id === boundaries)?.boundaries || null;
  }, [boundaries, data, allById]);

  // One row per student (names matched ignoring case/spaces, plus any links the teacher made)
  const rows = useMemo(() => {
    const map: Record<string, { key: string; names: Set<string>; classes: Set<string>; cand: string; res: Record<string, { marks: number; max: number; pct: number; attempts: number; alt?: string; altRaw?: string }> }> = {};
    data.forEach((a) => {
      // the assessment itself, plus any different versions of it
      const sources = [a, ...(alts[a.id] || []).map((id) => allById[id]).filter(Boolean)];
      sources.forEach((src) => {
        const isAlt = src.id !== a.id;
        src.students.forEach((s) => {
          if (s.status !== "submitted") return;
          const key = resolve(normName(s.name));
          if (!key) return;
          const row = (map[key] = map[key] || { key, names: new Set(), classes: new Set(), cand: "", res: {} });
          row.names.add(s.name.trim());
          if (s.className) row.classes.add(s.className);
          if (s.candidateNumber) row.cand = s.candidateNumber;
          const srcMax = s.maxMarks || src.maxMarks || 0;
          const pct = srcMax ? (s.totalMarks / srcMax) * 100 : 0;
          // A different version is converted to this assessment's marks using the percentage
          const entry = isAlt
            ? { marks: Math.round(((pct / 100) * realMax(a)) * 10) / 10, max: realMax(a), pct, attempts: 1, alt: src.title, altRaw: `${s.totalMarks}/${srcMax}` }
            : { marks: s.totalMarks, max: srcMax, pct, attempts: 1 };
          const prev = row.res[a.id];
          if (!prev || entry.pct > prev.pct) row.res[a.id] = { ...entry, attempts: (prev?.attempts || 0) + 1 };
          else prev.attempts += 1;
        });
      });
    });
    const out = Object.values(map).map((r) => {
      let num = 0, den = 0, marks = 0, maxSum = 0, counted = 0;
      data.forEach((a) => {
        const x = r.res[a.id];
        if (!x && missing === "skip") return;
        const pct = x ? x.pct : 0;
        const max = x ? x.max : realMax(a);
        marks += x ? x.marks : 0;
        maxSum += max;
        counted++;
        const w = method === "weights" ? Math.max(0, Number(weights[a.id] ?? 1)) : method === "equal" ? 1 : max;
        num += w * pct;
        den += w;
      });
      const pct = den > 0 ? num / den : 0;
      return {
        ...r,
        // Show the neatest spelling: one with capital letters first, then the longest
        name: [...r.names]
          .map((n) => n.replace(/\s+/g, " "))
          .sort((a, b) => Number(b !== b.toLowerCase()) - Number(a !== a.toLowerCase()) || b.length - a.length)[0],
        className: [...r.classes].join(", "),
        marks,
        maxSum,
        pct,
        counted,
        complete: data.every((a) => r.res[a.id]),
        grade: getEdexcelGrade(pct, bounds),
      };
    });
    return out;
  }, [data, links, method, weights, missing, bounds, alts, allById]); // eslint-disable-line react-hooks/exhaustive-deps

  const classes = useMemo(() => Array.from(new Set(rows.flatMap((r) => r.className.split(", ").filter(Boolean)))).sort(), [rows]);
  const shown = useMemo(
    () =>
      rows
        .filter((r) => !classFilter || r.className.split(", ").includes(classFilter))
        .sort((a, b) => (sortBy === "pct" ? b.pct - a.pct : a.name.localeCompare(b.name))),
    [rows, classFilter, sortBy]
  );
  const avg = shown.length ? shown.reduce((a, r) => a + r.pct, 0) / shown.length : 0;
  const dist = useMemo(() => {
    const d: Record<string, number> = {};
    shown.forEach((r) => (d[r.grade.grade] = (d[r.grade.grade] || 0) + 1));
    return d;
  }, [shown]);

  const exportCsv = () => {
    const head = ["Student", "Candidate number", "Class", ...data.flatMap((a) => [`${a.title} marks`, `${a.title} %`]), "Combined marks", "Combined %", "Grade"];
    const lines = [head];
    shown.forEach((r) => {
      lines.push([
        r.name,
        r.cand,
        r.className,
        ...data.flatMap((a) => (r.res[a.id] ? [`${r.res[a.id].marks}/${r.res[a.id].max}${r.res[a.id].alt ? ` (other version: ${r.res[a.id].alt} ${r.res[a.id].altRaw})` : ""}`, r.res[a.id].pct.toFixed(1)] : ["absent", ""])),
        method === "marks" ? `${r.marks}/${r.maxSum}` : "",
        r.pct.toFixed(1),
        r.grade.grade,
      ]);
    });
    const csv = lines.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `combined-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const saveCombo = () => {
    const name = saveName.trim() || data.map((a) => a.title).join(" + ");
    const next = [...saved.filter((s) => s.name !== name), { name, ids: selected, method, weights, missing, boundaries, alts }];
    setSaved(next);
    saveJSON(SAVED_KEY, next);
    setSaveName("");
  };
  const loadCombo = (c: SavedCombo) => {
    setSelected(c.ids);
    setMethod(c.method);
    setWeights(c.weights || {});
    setMissing(c.missing);
    setBoundaries(c.boundaries || "first");
    setAlts(c.alts || {});
  };
  const deleteCombo = (name: string) => {
    const next = saved.filter((s) => s.name !== name);
    setSaved(next);
    saveJSON(SAVED_KEY, next);
  };

  return (
    <div className="space-y-4" data-testid="combined-results">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-extrabold text-slate-900">Combined results</h2>
        </div>
        <p className="text-xs text-slate-500">Tick two or more assessments (e.g. two Python assessments for Year 11) to merge them into one mark, percentage and grade per student. Only submitted work is counted; if a student sat one assessment twice, their best score is used.</p>
        {saved.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Saved:</span>
            {saved.map((c) => (
              <span key={c.name} className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 pl-3 pr-1 py-1 text-xs">
                <button type="button" onClick={() => loadCombo(c)} className="font-bold text-purple-800 hover:underline">
                  {c.name}
                </button>
                <button type="button" onClick={() => deleteCombo(c.name)} title="Delete" className="p-0.5 text-slate-400 hover:text-rose-600">
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-4">
        {/* Choose assessments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 h-fit">
          <div className="text-xs font-bold text-slate-700">1. Choose assessments ({selected.length} ticked)</div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or code" className="w-full pl-8 pr-2 py-2 rounded-lg border border-slate-200 text-xs" />
          </div>
          <div className="flex gap-1 text-[11px]">
            {(["all", "assessment", "task"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTypeFilter(t)} className={`px-2 py-1 rounded-lg font-bold ${typeFilter === t ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                {t === "all" ? "All" : t === "assessment" ? "Assessments" : "Practice tasks"}
              </button>
            ))}
          </div>
          <div className="max-h-[460px] overflow-y-auto space-y-1 pr-1">
            {list.map((a) => (
              <label key={a.id} className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer text-xs ${selected.includes(a.id) ? "border-purple-300 bg-purple-50" : "border-slate-100 hover:bg-slate-50"}`}>
                <input type="checkbox" data-testid={`combine-${a.code}`} checked={selected.includes(a.id)} onChange={() => toggle(a.id)} className="mt-0.5" />
                <span className="min-w-0">
                  <span className="block font-bold text-slate-800 break-words leading-snug" title={a.title}>{a.title}</span>
                  <span className="block text-slate-500">
                    {a.code} · {(a.type || "assessment") === "task" ? "Task" : "Assessment"} · {a.maxMarks || 0} marks{a.createdAt ? ` · ${new Date(a.createdAt).toLocaleDateString()}` : ""}
                  </span>
                </span>
              </label>
            ))}
            {!list.length && <div className="text-xs text-slate-400 p-2">No assessments match.</div>}
          </div>
        </div>

        {/* Settings and table */}
        <div className="space-y-4 min-w-0">
          {data.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-700">2. How to combine</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {([
                  ["marks", "Add up the marks", "Bigger papers count for more"],
                  ["equal", "Equal weight", "Each assessment counts the same"],
                  ["weights", "My own weights", "e.g. 40% / 60%"],
                ] as const).map(([k, label, tip]) => (
                  <button key={k} type="button" data-testid={`method-${k}`} onClick={() => setMethod(k)} title={tip} className={`px-3 py-2 rounded-xl border font-bold ${method === k ? "bg-purple-600 text-white border-purple-700" : "bg-white text-slate-700 border-slate-200"}`}>
                    {label}
                  </button>
                ))}
              </div>
              {method === "weights" && (
                <div className="flex flex-wrap gap-3">
                  {data.map((a) => (
                    <label key={a.id} className="text-xs text-slate-700 flex items-center gap-1.5">
                      <span className="font-semibold max-w-[260px] break-words">{a.title}</span>
                      <input type="number" min={0} value={weights[a.id] ?? 1} onChange={(e) => setWeights({ ...weights, [a.id]: Number(e.target.value) })} className="w-16 px-2 py-1 rounded-lg border border-slate-300" />
                    </label>
                  ))}
                  <span className="text-[11px] text-slate-500 self-center">(weights are relative: 40 and 60 means 40% / 60%)</span>
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-slate-700">
                <label className="flex items-center gap-1.5">
                  Missed an assessment:
                  <select value={missing} onChange={(e) => setMissing(e.target.value as any)} className="px-2 py-1 rounded-lg border border-slate-300">
                    <option value="zero">count it as 0</option>
                    <option value="skip">leave it out (use the ones they did)</option>
                  </select>
                </label>
                <label className="flex items-center gap-1.5">
                  Grade boundaries:
                  <select value={boundaries} onChange={(e) => setBoundaries(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-300">
                    <option value="first">as set on "{data[0]?.title}"</option>
                    {[...data.slice(1), ...data.flatMap((a) => (alts[a.id] || []).map((id) => allById[id]).filter(Boolean))].map((a) => (
                      <option key={a.id} value={`a:${a.id}`}>
                        as set on "{a.title}"
                      </option>
                    ))}
                    {GRADE_BOUNDARY_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="basis-full text-[11px] text-slate-500" data-testid="boundaries-used">
                  Boundaries in use: grade {([9, 8, 7, 6, 5, 4, 3, 2, 1] as const).map((g) => `${g} ≥ ${({ ...EDEXCEL_STANDARD_BOUNDARIES, ...(bounds || {}) } as GradeBoundaries)[g]}%`).join(", ")}
                </span>
                {classes.length > 1 && (
                  <label className="flex items-center gap-1.5">
                    Class:
                    <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-300">
                      <option value="">All classes</option>
                      {classes.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3 space-y-2">
                <div className="text-xs font-bold text-sky-900">Students who sat a different version (other questions)</div>
                <p className="text-[11px] text-sky-800">If some students did a catch-up or alternative paper instead, add it here. Their percentage on that paper is used for this assessment, converted to its marks.</p>
                {data.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-700 break-words max-w-[260px]">{a.title}:</span>
                    {(alts[a.id] || []).map((id) => (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-sky-200 text-sky-900">
                        {allById[id]?.title || assessments.find((x) => x.id === id)?.title || id}
                        <button type="button" title="Remove" onClick={() => setAlts({ ...alts, [a.id]: (alts[a.id] || []).filter((x) => x !== id) })} className="text-slate-400 hover:text-rose-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <select
                      value=""
                      data-testid={`alt-${a.code}`}
                      onChange={(e) => e.target.value && setAlts({ ...alts, [a.id]: [...(alts[a.id] || []), e.target.value] })}
                      className="px-2 py-1 rounded-lg border border-sky-200 bg-white text-xs max-w-[280px]"
                    >
                      <option value="">+ add a different version...</option>
                      {assessments
                        .filter((x) => !selected.includes(x.id) && !Object.values(alts).some((l) => l.includes(x.id)))
                        .sort((x, y) => (y.createdAt || 0) - (x.createdAt || 0))
                        .map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.title} ({x.code})
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Name to save, e.g. Y11 Python combined" className="px-2 py-1.5 rounded-lg border border-slate-300 text-xs w-64" />
                <button type="button" onClick={saveCombo} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold">
                  <Save className="w-3.5 h-3.5" /> Save this combination
                </button>
                <button type="button" onClick={exportCsv} data-testid="combined-csv" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                  <Download className="w-3.5 h-3.5" /> Download spreadsheet (CSV)
                </button>
                <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700">
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>
            </div>
          )}

          {loading && <div className="text-sm text-slate-500">Loading results...</div>}
          {error && <div className="text-sm text-rose-700">{error}</div>}
          {!selected.length && <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center text-sm text-slate-500">Tick the assessments you want to combine.</div>}

          {data.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-bold text-slate-800">{shown.length} students</span>
                <span className="text-slate-600">Class average: <strong>{avg.toFixed(1)}%</strong></span>
                <span className="flex flex-wrap gap-1">
                  {["9", "8", "7", "6", "5", "4", "3", "2", "1", "U"].filter((g) => dist[g]).map((g) => (
                    <span key={g} className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700">
                      Grade {g}: {dist[g]}
                    </span>
                  ))}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse" data-testid="combined-table">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600">
                      <th className="text-left p-2 border-b cursor-pointer" onClick={() => setSortBy("name")}>Student {sortBy === "name" ? "▼" : ""}</th>
                      <th className="text-left p-2 border-b">Class</th>
                      {data.map((a) => (
                        <th key={a.id} className="text-center p-2 border-b">
                          <div className="font-bold text-slate-700 max-w-[220px] mx-auto whitespace-normal break-words leading-snug" title={a.title}>{a.title}</div>
                          <div className="font-normal text-slate-400">
                            out of {realMax(a)}
                            {realMax(a) !== a.maxMarks && a.maxMarks > 0 && (
                              <span className="block text-amber-600" title="The assessment was changed after students sat it">
                                (now set as {a.maxMarks})
                              </span>
                            )}
                            {method === "weights" ? ` · weight ${weights[a.id] ?? 1}` : ""}
                          </div>
                        </th>
                      ))}
                      <th className="text-center p-2 border-b">Combined</th>
                      <th className="text-center p-2 border-b cursor-pointer" onClick={() => setSortBy("pct")}>% {sortBy === "pct" ? "▼" : ""}</th>
                      <th className="text-center p-2 border-b">Grade</th>
                      <th className="p-2 border-b print:hidden"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((r) => (
                      <tr key={r.key} className="border-b border-slate-100 hover:bg-slate-50/60">
                        <td className="p-2 font-semibold text-slate-800">
                          {r.name}
                          {r.names.size > 1 && <span className="ml-1 text-[10px] text-slate-400" title={[...r.names].join(" / ")}>({r.names.size} spellings)</span>}
                        </td>
                        <td className="p-2 text-slate-600">{r.className}</td>
                        {data.map((a) => {
                          const x = r.res[a.id];
                          return (
                            <td key={a.id} className="p-2 text-center">
                              {x ? (
                                <span>
                                  <span className="font-bold text-slate-800">{x.marks}</span>
                                  <span className="text-slate-400">/{x.max}</span> <span className="text-slate-500">({Math.round(x.pct)}%)</span>
                                  {x.alt && (
                                    <span className="ml-1 text-[10px] px-1 rounded bg-sky-100 text-sky-800 font-bold" title={`Sat a different version: "${x.alt}" (${x.altRaw}), converted using the percentage`}>
                                      other version
                                    </span>
                                  )}
                                  {x.attempts > 1 && <span className="ml-1 text-[10px] text-amber-600" title="Best of several attempts">best of {x.attempts}</span>}
                                </span>
                              ) : (
                                <span className="text-rose-500 font-semibold">absent</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-2 text-center font-bold text-slate-800">{method === "marks" ? `${r.marks}/${r.maxSum}` : "-"}</td>
                        <td className="p-2 text-center font-bold text-slate-900">{r.pct.toFixed(1)}%</td>
                        <td className="p-2 text-center">
                          <span className={`inline-block min-w-[28px] px-2 py-0.5 rounded-full font-extrabold ${r.grade.badgeBg} ${r.grade.textClass}`}>{r.grade.grade}</span>
                        </td>
                        <td className="p-2 print:hidden">
                          <select
                            value={links[r.key] || ""}
                            onChange={(e) => setLink(r.key, e.target.value)}
                            title="If this student typed their name differently in another assessment, join the two rows"
                            className="text-[11px] px-1 py-0.5 rounded border border-slate-200 text-slate-500 max-w-[130px]"
                          >
                            <option value="">Same student as...</option>
                            {rows
                              .filter((o) => o.key !== r.key)
                              .map((o) => (
                                <option key={o.key} value={o.key}>
                                  {o.name}
                                </option>
                              ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {Object.keys(links).length > 0 && (
                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1">
                  <Link2 className="w-3 h-3" /> Joined names:
                  {Object.entries(links).map(([from, to]) => (
                    <span key={from} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100">
                      {from} → {to}
                      <button type="button" onClick={() => setLink(from, "")} className="text-slate-400 hover:text-rose-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-slate-400">
                Students are matched by name (ignoring capitals and extra spaces). If one student typed their name differently, use "Same student as..." to join the rows. "Add up the marks" gives the overall percentage of all marks; "Equal weight" averages the percentages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
