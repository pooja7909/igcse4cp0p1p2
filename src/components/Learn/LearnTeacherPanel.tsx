import React, { useEffect, useMemo, useState } from "react";
import { Plus, Copy, Users, BookOpen, BarChart3, Eye, Trash2, RefreshCw, Link as LinkIcon, X, Check } from "lucide-react";
import { teacherFetch } from "../../utils/teacherAuth";
import { LEARN_LESSONS, LEARN_LESSON_MAP } from "../../data/learnLessons";
import type { LearnStudent, LearnLesson } from "./learnTypes";
import { STAMP_INFO } from "./learnTypes";
import { LessonPlayer } from "./LessonPlayer";
import { lessonStatus, niceDate, niceTime, localToday } from "./LearnStudentApp";

interface TClass {
  id: string;
  code: string;
  name: string;
  open: boolean;
  allowQuizRetakes: boolean;
  assignments: Record<string, { lessonId: string; start: string; due: string; assignedAt?: number }>;
  ownerId?: string;
  ownerName?: string;
  createdAt?: number;
  studentCount?: number;
  lastActiveAt?: number;
}

const addDays = (d: string, n: number) => {
  const [y, m, day] = d.split("-").map(Number);
  const t = new Date(y, m - 1, day + n);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
};

export const LearnTeacherPanel: React.FC = () => {
  const [classes, setClasses] = useState<TClass[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [tab, setTab] = useState<"lessons" | "progress" | "preview">("lessons");
  const [paper, setPaper] = useState<"all" | "Paper 1" | "Paper 2">("all");
  const [draft, setDraft] = useState<TClass["assignments"]>({});
  const [dirty, setDirty] = useState(false);
  const [students, setStudents] = useState<LearnStudent[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [studentOpen, setStudentOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const selected = classes.find((c) => c.id === selectedId) || null;
  const link = selected ? `${window.location.origin}/?learn=${selected.code}` : "";

  const loadClasses = async () => {
    try {
      const r = await teacherFetch("/api/learn/classes");
      const d = await r.json();
      if (r.ok) {
        setClasses(d.classes || []);
        if (!selectedId && d.classes?.length) setSelectedId(d.classes[0].id);
      }
    } finally {
      setLoading(false);
    }
  };
  const loadProgress = async (id = selectedId) => {
    if (!id) return;
    const r = await teacherFetch(`/api/learn/classes/${id}/progress`);
    const d = await r.json();
    if (r.ok) {
      setStudents(d.students || []);
      setClasses((cs) => cs.map((c) => (c.id === id ? { ...c, studentCount: (d.students || []).length } : c)));
    }
  };
  useEffect(() => {
    loadClasses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selected) {
      setDraft(selected.assignments || {});
      setDirty(false);
      setStudents([]);
      setStudentOpen(null);
      loadProgress(selected.id);
    }
  }, [selectedId, classes.length]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (tab !== "progress" || !selectedId) return;
    const t = setInterval(() => loadProgress(), 30000);
    return () => clearInterval(t);
  }, [tab, selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 3500);
  };

  const createClass = async () => {
    if (!newName.trim()) return;
    const r = await teacherFetch("/api/learn/classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName }) });
    const d = await r.json();
    if (!r.ok) return flash(d.error || "Could not create the class");
    setClasses((cs) => [d.class, ...cs]);
    setSelectedId(d.class.id);
    setNewName("");
    setTab("lessons");
    flash(`Class "${d.class.name}" created. Share the join link with your students.`);
  };

  const updateClass = async (patch: Partial<TClass>) => {
    if (!selected) return;
    const r = await teacherFetch(`/api/learn/classes/${selected.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    const d = await r.json();
    if (!r.ok) return flash(d.error || "Could not save");
    setClasses((cs) => cs.map((c) => (c.id === selected.id ? { ...c, ...d.class } : c)));
    return d.class;
  };

  const saveLessons = async () => {
    const saved = await updateClass({ assignments: draft });
    if (saved) {
      setDraft(saved.assignments);
      setDirty(false);
      flash(`✓ Saved: ${Object.keys(saved.assignments).length} lesson(s) set for ${selected?.name}.`);
    }
  };

  const deleteClass = async () => {
    if (!selected) return;
    if (!window.confirm(`Delete the class "${selected.name}" and all its students' progress? This cannot be undone.`)) return;
    const r = await teacherFetch(`/api/learn/classes/${selected.id}`, { method: "DELETE" });
    if (r.ok) {
      setClasses((cs) => cs.filter((c) => c.id !== selected.id));
      setSelectedId("");
    }
  };

  const toggleAssign = (L: LearnLesson) => {
    setDirty(true);
    setDraft((d) => {
      const next = { ...d };
      if (next[L.id]) delete next[L.id];
      else {
        const start = localToday();
        next[L.id] = { lessonId: L.id, start, due: addDays(start, 7) };
      }
      return next;
    });
  };
  const setDate = (id: string, field: "start" | "due", v: string) => {
    setDirty(true);
    setDraft((d) => ({ ...d, [id]: { ...d[id], [field]: v } }));
  };

  const assignedIds = useMemo(
    () =>
      Object.values(selected?.assignments || {})
        .filter((a) => LEARN_LESSON_MAP[a.lessonId])
        .sort((a, b) => a.due.localeCompare(b.due))
        .map((a) => a.lessonId),
    [selected]
  );

  if (previewId && LEARN_LESSON_MAP[previewId]) {
    return <LessonPlayer lesson={LEARN_LESSON_MAP[previewId]} preview onBack={() => setPreviewId(null)} backLabel="Back to the Learning Hub" />;
  }

  const lessonsShown = LEARN_LESSONS.filter((L) => paper === "all" || L.paper === paper);
  const today = localToday();
  const st = studentOpen ? students.find((s) => s.studentId === studentOpen) : null;

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-700 text-white">
        <h2 className="text-xl font-bold">Learning Hub</h2>
        <p className="text-sm text-purple-100">
          Step-by-step lessons with code tracers and interactive visuals, then practice and a quiz - for Paper 1 and Paper 2. Create a class, share its join link, choose the lessons with start and due dates, and follow every student's progress.
        </p>
      </div>
      {msg && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-900">{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Classes */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Your classes</div>
          <div className="flex gap-1.5">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createClass()} placeholder="New class, e.g. 10A" className="flex-1 min-w-0 px-2 py-1.5 border border-slate-300 rounded-lg text-sm" data-testid="new-class-name" />
            <button type="button" onClick={createClass} data-testid="create-class" className="px-2.5 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-bold inline-flex items-center gap-1">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {loading && <div className="text-xs text-slate-400">Loading...</div>}
          {!loading && classes.length === 0 && <div className="text-xs text-slate-500">No classes yet. Type a class name above and press +.</div>}
          <div className="space-y-1.5">
            {classes.map((c) => (
              <button key={c.id} type="button" onClick={() => setSelectedId(c.id)} className={`w-full text-left px-3 py-2 rounded-xl border ${c.id === selectedId ? "border-purple-500 bg-purple-50" : "border-slate-200 hover:bg-slate-50"}`}>
                <div className="font-bold text-sm text-slate-900">{c.name}</div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span className="font-mono">{c.code}</span>
                  <span>
                    {c.studentCount || 0} students - {Object.keys(c.assignments || {}).length} lessons
                  </span>
                </div>
                {c.ownerName && <div className="text-[10px] text-slate-400">by {c.ownerName}</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Selected class */}
        <div className="lg:col-span-3 space-y-3">
          {!selected ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500">Create or choose a class.</div>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{selected.name}</h3>
                  <button type="button" onClick={deleteClass} className="text-xs font-bold text-rose-600 inline-flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Delete class
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-purple-50 border border-purple-200">
                  <LinkIcon className="w-4 h-4 text-purple-700" />
                  <span className="text-xs font-bold text-purple-900">Student join link:</span>
                  <code className="text-xs font-mono text-purple-900 break-all" data-testid="join-link">{link}</code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(link).catch(() => {});
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="ml-auto px-2.5 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold inline-flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copied" : "Copy link"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={selected.open} onChange={(e) => updateClass({ open: e.target.checked })} />
                    New students can join with the link
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={selected.allowQuizRetakes} onChange={(e) => updateClass({ allowQuizRetakes: e.target.checked })} />
                    Students may retake quizzes (best score is kept)
                  </label>
                </div>
              </div>

              <div className="flex gap-1 p-1 rounded-2xl bg-slate-100">
                {(
                  [
                    ["lessons", "Set lessons", <BookOpen key="a" className="w-4 h-4" />],
                    ["progress", `Progress (${students.length})`, <BarChart3 key="b" className="w-4 h-4" />],
                    ["preview", "Preview lessons", <Eye key="c" className="w-4 h-4" />],
                  ] as const
                ).map(([k, label, icon]) => (
                  <button key={k} type="button" data-testid={`learn-tab-${k}`} onClick={() => { setTab(k); if (k === "progress") loadProgress(); }} className={`flex-1 px-3 py-2 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-1.5 ${tab === k ? "bg-white shadow text-slate-900" : "text-slate-600"}`}>
                    {icon} {label}
                  </button>
                ))}
              </div>

              {(tab === "lessons" || tab === "preview") && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-bold text-slate-700">Paper:</span>
                  {(["all", "Paper 1", "Paper 2"] as const).map((v) => (
                    <button key={v} type="button" onClick={() => setPaper(v)} className={`px-3 py-1 rounded-lg font-bold border ${paper === v ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`}>
                      {v === "all" ? "Both papers" : v}
                    </button>
                  ))}
                </div>
              )}

              {tab === "lessons" && (
                <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-slate-600">
                      Tick the lessons for this class and set when each one opens and is due. Students cannot open a lesson before its start date.
                    </div>
                    <button type="button" data-testid="save-lessons" disabled={!dirty} onClick={saveLessons} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold disabled:opacity-40">
                      {dirty ? "Save lessons" : "Saved"}
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {lessonsShown.map((L) => {
                      const a = draft[L.id];
                      return (
                        <div key={L.id} className={`py-2.5 flex flex-wrap items-center gap-3 ${a ? "bg-purple-50/40" : ""}`}>
                          <label className="flex items-center gap-2 flex-1 min-w-[240px] cursor-pointer">
                            <input type="checkbox" checked={Boolean(a)} onChange={() => toggleAssign(L)} data-testid={`assign-${L.id}`} />
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${L.paper === "Paper 1" ? "bg-indigo-100 text-indigo-800" : "bg-emerald-100 text-emerald-800"}`}>{L.paper === "Paper 1" ? "P1" : "P2"}</span>
                            <span>
                              <span className="text-sm font-bold text-slate-900">{L.title}</span>
                              <span className="block text-[11px] text-slate-500">
                                {L.spec} - {L.steps.length} steps, {L.practice.length} practice, {L.quiz.length}-question quiz - about {L.minutes} min
                              </span>
                            </span>
                          </label>
                          {a && (
                            <div className="flex items-center gap-2 text-xs">
                              <label className="flex flex-col">
                                <span className="text-slate-500 font-semibold">Opens</span>
                                <input type="date" value={a.start} onChange={(e) => setDate(L.id, "start", e.target.value)} className="px-1.5 py-1 border border-slate-300 rounded-lg" />
                              </label>
                              <label className="flex flex-col">
                                <span className="text-slate-500 font-semibold">Due</span>
                                <input type="date" value={a.due} min={a.start} onChange={(e) => setDate(L.id, "due", e.target.value)} className="px-1.5 py-1 border border-slate-300 rounded-lg" />
                              </label>
                            </div>
                          )}
                          <button type="button" onClick={() => setPreviewId(L.id)} className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-600 inline-flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {tab === "preview" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lessonsShown.map((L) => (
                    <button key={L.id} type="button" onClick={() => setPreviewId(L.id)} className="text-left p-3 rounded-2xl bg-white border border-slate-200 hover:border-purple-400">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${L.paper === "Paper 1" ? "bg-indigo-100 text-indigo-800" : "bg-emerald-100 text-emerald-800"}`}>{L.paper}</span>
                      <div className="font-bold text-sm text-slate-900 mt-1">{L.title}</div>
                      <div className="text-xs text-slate-500">{L.summary}</div>
                    </button>
                  ))}
                </div>
              )}

              {tab === "progress" && (
                <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                      {Object.entries(STAMP_INFO).map(([k, s]) => (
                        <span key={k} title={s.tip}>{s.icon} {s.label}</span>
                      ))}
                      <span className="text-rose-700 font-semibold">Red = overdue</span>
                    </div>
                    <button type="button" onClick={() => loadProgress()} className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-600 inline-flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                  </div>
                  {students.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                      <Users className="w-6 h-6 mx-auto mb-1 text-slate-400" /> No students yet. Share the join link above.
                    </div>
                  ) : assignedIds.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">No lessons set yet - use "Set lessons".</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="text-xs border-collapse min-w-full">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="p-2 text-left sticky left-0 bg-slate-50">Student</th>
                            {assignedIds.map((id) => (
                              <th key={id} className="p-2 text-left min-w-[130px] align-bottom">
                                <div className="font-bold text-slate-800">{LEARN_LESSON_MAP[id].title}</div>
                                <div className="font-normal text-slate-500">due {niceDate(selected.assignments[id].due)}</div>
                              </th>
                            ))}
                            <th className="p-2 text-left">Last active</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((s) => (
                            <tr key={s.studentId} className="border-t border-slate-100 hover:bg-slate-50/60">
                              <td className="p-2 sticky left-0 bg-white">
                                <button type="button" onClick={() => setStudentOpen(s.studentId)} className="font-bold text-purple-700 hover:underline text-left" data-testid="student-name">
                                  {s.name}
                                </button>
                              </td>
                              {assignedIds.map((id) => {
                                const L = LEARN_LESSON_MAP[id];
                                const p = s.lessons?.[id];
                                const stt = lessonStatus(L, p);
                                const a = selected.assignments[id];
                                const overdue = !stt.done && today > a.due;
                                const tip = p
                                  ? [
                                      p.startedAt && `Started ${niceTime(p.startedAt)}`,
                                      p.learnedAt && `Learned ${niceTime(p.learnedAt)}`,
                                      p.practicedAt && `Practice done ${niceTime(p.practicedAt)}`,
                                      p.quiz && `Quiz best ${p.quiz.best}/${p.quiz.max} (${p.quiz.attempts} tries, last ${niceTime(p.quiz.lastAt)})`,
                                    ]
                                      .filter(Boolean)
                                      .join("\n")
                                  : "Not started";
                                return (
                                  <td key={id} className="p-1.5" title={tip}>
                                    <div className={`p-1.5 rounded-lg border ${stt.done ? "bg-emerald-50 border-emerald-300" : overdue ? "bg-rose-50 border-rose-300" : p ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-bold">{stt.pct}%</span>
                                        <span>{Object.keys(p?.stamps || {}).map((k) => STAMP_INFO[k]?.icon).join("")}</span>
                                      </div>
                                      <div className="text-[10px] text-slate-600">
                                        {p?.quiz ? `Quiz ${p.quiz.best}/${p.quiz.max}` : p?.learnedAt ? "Learned" : p ? `Step ${p.stepReached + 1}/${L.steps.length}` : overdue ? "Overdue" : "-"}
                                      </div>
                                    </div>
                                  </td>
                                );
                              })}
                              <td className="p-2 text-slate-500 whitespace-nowrap">{niceTime(s.lastActiveAt)}</td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold">
                            <td className="p-2 sticky left-0 bg-slate-50">Completed</td>
                            {assignedIds.map((id) => {
                              const n = students.filter((s) => lessonStatus(LEARN_LESSON_MAP[id], s.lessons?.[id]).done).length;
                              return (
                                <td key={id} className="p-2">
                                  {n}/{students.length}
                                </td>
                              );
                            })}
                            <td />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Student detail with timestamps */}
      {st && selected && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex justify-end" onClick={() => setStudentOpen(null)}>
          <div className="w-full max-w-lg h-full bg-white overflow-y-auto p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{st.name}</h3>
                <div className="text-xs text-slate-500">Joined {niceTime(st.joinedAt)} - last active {niceTime(st.lastActiveAt)}</div>
              </div>
              <button type="button" onClick={() => setStudentOpen(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            {assignedIds.map((id) => {
              const L = LEARN_LESSON_MAP[id];
              const p = st.lessons?.[id];
              return (
                <div key={id} className="p-3 rounded-xl border border-slate-200 space-y-1.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">{L.title}</span>
                    {p && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Reset ${st.name}'s progress in "${L.title}"? They will start this lesson again.`)) return;
                          const r = await teacherFetch(`/api/learn/classes/${selected.id}/students/${st.studentId}/reset`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId: id }) });
                          if (r.ok) loadProgress();
                        }}
                        className="text-[11px] font-bold text-slate-500 hover:text-rose-600"
                      >
                        Reset lesson
                      </button>
                    )}
                  </div>
                  {!p ? (
                    <div className="text-xs text-slate-500">Not started</div>
                  ) : (
                    <ul className="text-xs text-slate-700 space-y-0.5">
                      <li>Started: {niceTime(p.startedAt)}</li>
                      <li>Learning steps: {p.learnedAt ? `all done (${niceTime(p.learnedAt)})` : `${p.stepReached + 1} of ${L.steps.length}`}</li>
                      <li>
                        Practice: {Object.keys(p.practice || {}).length} of {L.practice.length}
                        {Object.entries(p.practice || {}).map(([pid, x]) => (
                          <span key={pid} className="block pl-3 text-slate-500">
                            ✓ {L.practice.find((q) => q.id === pid)?.title || pid} - {niceTime(x.doneAt)} ({x.attempts} tr{x.attempts === 1 ? "y" : "ies"})
                          </span>
                        ))}
                      </li>
                      <li>
                        Quiz: {p.quiz ? `best ${p.quiz.best}/${p.quiz.max}` : "not taken"}
                        {(p.quiz?.history || []).map((h, i) => (
                          <span key={i} className="block pl-3 text-slate-500">
                            Attempt {i + 1}: {h.score}/{h.max} - {niceTime(h.at)}
                          </span>
                        ))}
                      </li>
                      <li>
                        Stamps:{" "}
                        {Object.entries(p.stamps || {}).map(([k, t]) => (
                          <span key={k} className="mr-2" title={niceTime(t as number)}>
                            {STAMP_INFO[k]?.icon} {STAMP_INFO[k]?.label} ({niceTime(t as number)})
                          </span>
                        ))}
                      </li>
                    </ul>
                  )}
                </div>
              );
            })}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Activity timeline</div>
              <ul className="divide-y divide-slate-100 text-xs">
                {[...(st.events || [])].reverse().map((e, i) => (
                  <li key={i} className="py-1.5 flex justify-between gap-3">
                    <span>
                      {e.detail || e.kind}
                      {e.lessonId && LEARN_LESSON_MAP[e.lessonId] && <span className="text-slate-500"> - {LEARN_LESSON_MAP[e.lessonId].title}</span>}
                    </span>
                    <span className="text-slate-400 shrink-0">{niceTime(e.t)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm(`Remove ${st.name} from ${selected.name}? Their progress will be deleted.`)) return;
                const r = await teacherFetch(`/api/learn/classes/${selected.id}/students/${st.studentId}`, { method: "DELETE" });
                if (r.ok) {
                  setStudentOpen(null);
                  loadProgress();
                }
              }}
              className="text-xs font-bold text-rose-600"
            >
              Remove student from class
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
