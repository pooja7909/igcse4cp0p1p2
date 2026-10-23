import React, { useEffect, useMemo, useState } from "react";
import { GraduationCap, Lock, CalendarClock, CheckCircle2, ChevronRight, Clock, FolderOpen, Download } from "lucide-react";
import type { TeacherResource } from "../Resources/resourceTypes";
import { ResourceTypeIcon, TopicBadges, typeLabel, viewMode, formatSize, needsPieces, downloadResource } from "../Resources/resourceTypes";
import { ResourceViewer } from "../Resources/ResourceViewer";
import { LEARN_LESSON_MAP } from "../../data/learnLessons";
import type { LearnStudent, LessonProgress, LearnLesson } from "./learnTypes";
import { STAMP_INFO } from "./learnTypes";
import { LessonPlayer, LessonEvent } from "./LessonPlayer";

interface ClassInfo {
  id: string;
  code: string;
  name: string;
  open: boolean;
  allowQuizRetakes: boolean;
  assignments: Record<string, { lessonId: string; start: string; due: string }>;
  ownerName?: string;
}

export const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const niceDate = (d: string) => {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
};
export const niceTime = (t?: number) => (t ? new Date(t).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");

export function lessonStatus(lesson: LearnLesson, p?: LessonProgress) {
  if (!p) return { label: "Not started", pct: 0, done: false };
  const stepsPct = p.learnedAt ? 1 : (p.stepReached + 1) / Math.max(1, lesson.steps.length);
  const prac = lesson.practice.length ? Object.keys(p.practice || {}).length / lesson.practice.length : 1;
  const quiz = p.quiz ? 1 : 0;
  const pct = Math.round(((stepsPct * 0.5 + prac * 0.25 + quiz * 0.25) * 100));
  const done = Boolean(p.learnedAt && p.quiz);
  return { label: done ? "Complete" : p.learnedAt ? "Learned - practise and quiz" : "In progress", pct: Math.min(100, pct), done };
}

export const LearnStudentApp: React.FC<{ code: string }> = ({ code }) => {
  const sidKey = `learn_sid_${code.toUpperCase()}`;
  const [cls, setCls] = useState<ClassInfo | null>(null);
  const [student, setStudent] = useState<LearnStudent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [resources, setResources] = useState<TeacherResource[]>([]);
  const [openRes, setOpenRes] = useState<TeacherResource | null>(null);
  const [dl, setDl] = useState<{ id: string; pct: number; error?: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      let sid = "";
      try {
        sid = localStorage.getItem(sidKey) || "";
      } catch {}
      if (sid) {
        const r = await fetch(`/api/learn/c/${encodeURIComponent(code)}/me?sid=${encodeURIComponent(sid)}`);
        if (r.ok) {
          const d = await r.json();
          setCls(d.class);
          setStudent(d.student);
          return;
        }
      }
      const r = await fetch(`/api/learn/c/${encodeURIComponent(code)}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Class not found");
      setCls(d.class);
    } catch (e: any) {
      setError(e?.message || "Could not load the class.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Resources (web pages, worksheets, links) the teacher shared with this class
  const joined = Boolean(student);
  useEffect(() => {
    if (!joined) return;
    let gone = false;
    fetch(`/api/learn/c/${encodeURIComponent(code)}/resources`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!gone && d && Array.isArray(d.resources)) setResources(d.resources);
      })
      .catch(() => {});
    return () => {
      gone = true;
    };
  }, [joined, code]);
  const resourceAccess = `class=${encodeURIComponent(code)}`;
  const downloadBig = async (r: TeacherResource) => {
    if (dl && !dl.error) return;
    setDl({ id: r.id, pct: 0 });
    try {
      await downloadResource(r, resourceAccess, (f) => setDl({ id: r.id, pct: Math.round(f * 100) }));
      setDl(null);
    } catch (e: any) {
      setDl({ id: r.id, pct: 0, error: e?.message || "Could not download the file." });
    }
  };
  const resourceSrc = (r: TeacherResource) => (r.kind === "link" ? r.url || "" : `/api/resources/${encodeURIComponent(r.id)}/view?class=${encodeURIComponent(code)}`);

  const join = async () => {
    setJoining(true);
    setError(null);
    try {
      const r = await fetch(`/api/learn/c/${encodeURIComponent(code)}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not join");
      try {
        localStorage.setItem(sidKey, d.student.studentId);
      } catch {}
      setCls(d.class);
      setStudent(d.student);
    } catch (e: any) {
      setError(e?.message || "Could not join");
    } finally {
      setJoining(false);
    }
  };

  const sendEvent = async (lessonId: string, e: LessonEvent) => {
    if (!student) return;
    try {
      const r = await fetch(`/api/learn/c/${encodeURIComponent(code)}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.studentId, lessonId, ...e }),
      });
      const d = await r.json();
      if (d.student) setStudent(d.student);
      if (!r.ok) setSaveError(d.error || "Your progress could not be saved.");
      else setSaveError(null);
    } catch {
      setSaveError("Your progress could not be saved - check your internet connection.");
    }
  };

  const today = localToday();
  const assigned = useMemo(() => {
    if (!cls) return [];
    return Object.values(cls.assignments || {})
      .filter((a) => LEARN_LESSON_MAP[a.lessonId])
      .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.start.localeCompare(b.start)));
  }, [cls]);

  const totalStamps = student ? Object.values(student.lessons || {}).reduce((n, p) => n + Object.keys(p.stamps || {}).length, 0) : 0;

  if (loading) return <div className="p-10 text-center text-slate-500">Loading your class...</div>;
  if (!cls) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 rounded-2xl bg-white border border-rose-200 text-center space-y-2">
        <div className="text-3xl">🔗</div>
        <div className="font-bold text-slate-900">Class not found</div>
        <p className="text-sm text-slate-600">{error || "Please check the link with your teacher."}</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">Learning Hub</div>
            <h1 className="text-xl font-bold text-slate-900">{cls.name}</h1>
          </div>
        </div>
        <p className="text-sm text-slate-600">Type your full name to join. Use the same name every time - then your progress follows you to any computer.</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && name.trim().length > 1 && join()}
          placeholder="e.g. Alex Smith"
          className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl"
        />
        {error && <div className="text-sm text-rose-700">{error}</div>}
        <button type="button" disabled={joining || name.trim().length < 2} onClick={join} className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold disabled:opacity-50">
          {joining ? "Joining..." : "Join class"}
        </button>
      </div>
    );
  }

  if (openLesson && LEARN_LESSON_MAP[openLesson]) {
    return (
      <div className="space-y-3">
        {saveError && <div className="max-w-4xl mx-auto p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-900">{saveError}</div>}
        <LessonPlayer
          key={openLesson}
          lesson={LEARN_LESSON_MAP[openLesson]}
          progress={student.lessons?.[openLesson] || null}
          allowQuizRetakes={cls.allowQuizRetakes}
          onEvent={(e) => sendEvent(openLesson, e)}
          onBack={() => {
            setOpenLesson(null);
            window.scrollTo({ top: 0 });
          }}
        />
      </div>
    );
  }

  const card = (a: { lessonId: string; start: string; due: string }) => {
    const L = LEARN_LESSON_MAP[a.lessonId];
    const p = student.lessons?.[a.lessonId];
    const st = lessonStatus(L, p);
    const locked = today < a.start;
    const overdue = !st.done && today > a.due;
    return (
      <button
        key={a.lessonId}
        type="button"
        disabled={locked}
        data-testid={`lesson-card-${a.lessonId}`}
        onClick={() => setOpenLesson(a.lessonId)}
        className={`text-left p-4 rounded-2xl border-2 bg-white transition-all space-y-2 ${locked ? "opacity-60 cursor-not-allowed border-slate-200" : st.done ? "border-emerald-300 hover:shadow-md" : overdue ? "border-rose-300 hover:shadow-md" : "border-slate-200 hover:border-purple-400 hover:shadow-md"}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${L.paper === "Paper 1" ? "bg-indigo-100 text-indigo-800" : "bg-emerald-100 text-emerald-800"}`}>{L.paper}</span>
          {locked ? (
            <span className="text-[11px] font-bold text-slate-500 inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Opens {niceDate(a.start)}</span>
          ) : (
            <span className={`text-[11px] font-bold inline-flex items-center gap-1 ${overdue ? "text-rose-700" : "text-slate-500"}`}>
              <CalendarClock className="w-3 h-3" /> {overdue ? "Overdue - was due" : "Due"} {niceDate(a.due)}
            </span>
          )}
        </div>
        <div className="font-bold text-slate-900">{L.title}</div>
        <div className="text-xs text-slate-500">{L.summary}</div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className={`h-full ${st.done ? "bg-emerald-500" : "bg-purple-500"}`} style={{ width: `${st.pct}%` }} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-600">{st.label}</span>
          <span className="flex gap-0.5">
            {Object.keys(p?.stamps || {}).map((k) => (
              <span key={k} title={`${STAMP_INFO[k]?.label} - ${niceTime(p!.stamps[k as keyof typeof p.stamps])}`}>{STAMP_INFO[k]?.icon}</span>
            ))}
            {!locked && <ChevronRight className="w-4 h-4 text-slate-400" />}
          </span>
        </div>
      </button>
    );
  };

  const toDo = assigned.filter((a) => today >= a.start && !lessonStatus(LEARN_LESSON_MAP[a.lessonId], student.lessons?.[a.lessonId]).done);
  const later = assigned.filter((a) => today < a.start);
  const done = assigned.filter((a) => today >= a.start && lessonStatus(LEARN_LESSON_MAP[a.lessonId], student.lessons?.[a.lessonId]).done);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-700 to-indigo-700 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-purple-200">Learning Hub - {cls.name}</div>
          <h1 className="text-2xl font-bold">Hi {student.name.split(" ")[0]} 👋</h1>
          <div className="text-sm text-purple-100">
            {toDo.length ? `You have ${toDo.length} lesson${toDo.length > 1 ? "s" : ""} to do.` : "You are all caught up!"}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/15 text-center">
            <div className="text-2xl font-bold">{done.length}/{assigned.length}</div>
            <div className="text-[11px] text-purple-100">lessons done</div>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/15 text-center">
            <div className="text-2xl font-bold">{totalStamps}</div>
            <div className="text-[11px] text-purple-100">stamps</div>
          </div>
        </div>
      </div>

      {assigned.length === 0 && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500">Your teacher has not set any lessons yet. Check back soon!</div>
      )}
      {toDo.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-bold text-slate-800">To do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{toDo.map(card)}</div>
        </section>
      )}
      {later.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-bold text-slate-800">Coming soon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{later.map(card)}</div>
        </section>
      )}
      {done.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-bold text-slate-800 inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{done.map(card)}</div>
        </section>
      )}

      {resources.length > 0 && (
        <section className="space-y-2" data-testid="student-resources">
          <h2 className="font-bold text-slate-800 inline-flex items-center gap-1"><FolderOpen className="w-4 h-4 text-sky-600" /> Resources from your teacher</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {resources.map((r) => {
              const mode = viewMode(r);
              const inner = (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      <ResourceTypeIcon r={r} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{r.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {typeLabel(r)}
                        {mode === "download" && r.size ? ` - ${formatSize(r.size)} - download` : ""}
                        {dl?.id === r.id && (dl.error ? <span className="block text-rose-700">{dl.error}</span> : <span className="block font-semibold text-purple-700">Downloading... {dl.pct}%</span>)}
                      </div>
                    </div>
                    {mode === "download" ? <Download className="w-4 h-4 text-slate-400 ml-auto shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 ml-auto shrink-0" />}
                  </div>
                  {r.description && <div className="text-xs text-slate-600 line-clamp-3">{r.description}</div>}
                  <TopicBadges topics={r.topics} paper={r.paper} />
                </>
              );
              const cls = "text-left p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-sky-400 hover:shadow-md transition-all space-y-2 block";
              return mode === "download" && needsPieces(r) ? (
                <button key={r.id} type="button" onClick={() => downloadBig(r)} className={cls} data-testid={`student-resource-${r.id}`}>
                  {inner}
                </button>
              ) : mode === "download" ? (
                <a key={r.id} href={resourceSrc(r)} download={r.fileName || true} className={cls} data-testid={`student-resource-${r.id}`}>
                  {inner}
                </a>
              ) : (
                <button key={r.id} type="button" onClick={() => setOpenRes(r)} className={cls} data-testid={`student-resource-${r.id}`}>
                  {inner}
                </button>
              );
            })}
          </div>
        </section>
      )}
      {openRes && <ResourceViewer resource={openRes} src={resourceSrc(openRes)} access={resourceAccess} onClose={() => setOpenRes(null)} />}

      <section className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 inline-flex items-center gap-1"><Clock className="w-4 h-4" /> My activity</h2>
          <button type="button" onClick={() => setShowHistory((s) => !s)} className="text-xs font-bold text-purple-700">
            {showHistory ? "Hide" : "Show"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          {Object.entries(STAMP_INFO).map(([k, s]) => (
            <span key={k} className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200">{s.icon} {s.label}: {s.tip}</span>
          ))}
        </div>
        {showHistory && (
          <ul className="divide-y divide-slate-100 text-sm max-h-80 overflow-y-auto">
            {[...(student.events || [])].reverse().map((e, i) => (
              <li key={i} className="py-1.5 flex justify-between gap-3">
                <span>
                  {e.detail || e.kind}
                  {e.lessonId && LEARN_LESSON_MAP[e.lessonId] && <span className="text-slate-500"> - {LEARN_LESSON_MAP[e.lessonId].title}</span>}
                </span>
                <span className="text-xs text-slate-400 shrink-0">{niceTime(e.t)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
