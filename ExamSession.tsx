import React, { useState, useEffect, useRef, useMemo } from "react";
import { Assessment, IGCSETask, StudentSession, MarkResult } from "../../types";
import { QuestionCard } from "../QuestionCard";
import { MarkPointsList } from "../MarkPointsList";
import { syncStudentSessionToFirestore } from "../../firebase";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";

function isEmptyAnswer(v: any): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return !v.trim();
  if (Array.isArray(v)) return v.length === 0 || v.every((x) => isEmptyAnswer(x));
  return false;
}

interface ExamSessionProps {
  assessment: Assessment;
  studentSession: StudentSession;
  allTasks: Record<string, IGCSETask>;
  onFinishExam: (result: {
    marks: Record<string, number>;
    totalMarks: number;
    maxMarks: number;
    percentage: number;
    answers: Record<string, any>;
    detailedResults: Record<string, MarkResult>;
  }) => void;
}

export const ExamSession: React.FC<ExamSessionProps> = ({
  assessment,
  studentSession,
  allTasks,
  onFinishExam,
}) => {
  const [liveAssessment, setLiveAssessment] = useState<Assessment>(assessment);
  const [currentIdx, setCurrentIdx] = useState(0);
  // Backup of the answers in this browser, so a refresh, a crash or a lost connection
  // never loses work (the server copy is restored first, then anything newer from here).
  const backupKey = `exam_backup_${assessment.id}_${studentSession.studentId}`;
  const [restoredCount, setRestoredCount] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    const server: Record<string, any> = { ...(studentSession.answers || {}) };
    let backup: { answers?: Record<string, any>; changedAt?: number; saved?: boolean } | null = null;
    try {
      const raw = localStorage.getItem(backupKey);
      backup = raw ? JSON.parse(raw) : null;
    } catch {
      backup = null;
    }
    if (!backup || !backup.answers || typeof backup.answers !== "object") return server;
    // saved === false: the last thing typed here never reached the server, so it is newer
    const backupIsNewer = backup.saved === false;
    let restored = 0;
    for (const [qid, v] of Object.entries(backup.answers)) {
      if (isEmptyAnswer(v)) continue;
      if (isEmptyAnswer(server[qid]) || (backupIsNewer && JSON.stringify(server[qid]) !== JSON.stringify(v))) {
        server[qid] = v;
        restored++;
      }
    }
    if (restored) setTimeout(() => setRestoredCount(restored), 0);
    return server;
  });
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    liveAssessment.durationMinutes > 0 ? liveAssessment.durationMinutes * 60 : 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const autoSaveTimerRef = useRef<any>(null);
  // Always holds the latest answers. The exam timer's auto-submit runs from a callback
  // created when the exam opened; without this it would submit the answers from that
  // moment (usually none) instead of what the student has written since.
  const answersRef = useRef<Record<string, any>>(answers);
  answersRef.current = answers;
  const submittingRef = useRef(false);

  // Poll for assessment edits so live updates reflect in the exam hall without refreshing
  useEffect(() => {
    const syncAssessment = async () => {
      try {
        // sid: keeps this student's own order of multiple-choice options
        const res = await fetch(`/api/assessments/${liveAssessment.id}?sid=${encodeURIComponent(studentSession.studentId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.assessment) {
            setLiveAssessment(data.assessment);
          }
        }
      } catch (e) {}
    };

    // Check for teacher edits every 30s (was 6s)
    const interval = setInterval(syncAssessment, 30000);
    return () => clearInterval(interval);
  }, [liveAssessment.id]);

  const isTaskMode = liveAssessment.type === "task";

  const questionsList: IGCSETask[] = useMemo(() => {
    const rawList =
      liveAssessment.questions && liveAssessment.questions.length > 0
        ? liveAssessment.questions
        : (liveAssessment.questionIds || []).map((id) => allTasks[id]).filter(Boolean);

    // If in exam mode, strictly sanitize every question to strip any solutions, hints, or mark scheme
    if (!isTaskMode) {
      return rawList.map((q) => {
        const copy: any = { ...q };
        delete copy.solution;
        delete copy.markScheme;
        delete copy.hint;
        if (copy.mcqs) {
          copy.mcqs = copy.mcqs.map((m: any) => {
            const mc = { ...m };
            delete mc.a;
            delete mc.why;
            return mc;
          });
        }
        if (copy.subQuestions) {
          copy.subQuestions = copy.subQuestions.map((sq: any) => {
            const sc = { ...sq };
            delete sc.a;
            delete sc.why;
            return sc;
          });
        }
        if (copy.tests) {
          copy.tests = copy.tests.map((tc: any) => {
            const t = { ...tc };
            delete t.out;
            return t;
          });
        }
        if (copy.theorySubQuestions) {
          copy.theorySubQuestions = copy.theorySubQuestions.map((ts: any) => {
            const tsc = { ...ts };
            delete tsc.keywords;
            delete tsc.criteria;
            return tsc;
          });
        }
        return copy as IGCSETask;
      });
    }

    return rawList;
  }, [liveAssessment.questions, liveAssessment.questionIds, allTasks, isTaskMode]);

  // Prevent index out of bounds if questions were re-ordered or removed
  useEffect(() => {
    if (questionsList.length > 0 && currentIdx >= questionsList.length) {
      setCurrentIdx(questionsList.length - 1);
    }
  }, [questionsList.length, currentIdx]);

  const currentTask = questionsList[currentIdx];

  // "Check answer" (only when the teacher allowed it for this assessment)
  type CheckResult = {
    marks: number;
    maxMarks: number;
    verdict: "correct" | "partial" | "incorrect";
    feedback?: string;
    checksLeft: number | null; // null = unlimited
    answerChecked: string;
    points?: Array<{ point: string; awarded: number; max: number; reason?: string }>;
    tests?: Array<{
      inputs: string[];
      output: string;
      expected?: string;
      passed: boolean;
      marks: number;
      maxMarks: number;
      error?: string;
    }>;
  };
  const [checkResults, setCheckResults] = useState<Record<string, CheckResult>>({});
  const [checkError, setCheckError] = useState<Record<string, string>>({});
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const handleCheckAnswer = async () => {
    if (!currentTask) return;
    const qid = currentTask.id;
    setCheckingId(qid);
    setCheckError((e) => ({ ...e, [qid]: "" }));
    try {
      const ctrl = new AbortController();
      const abortTimer = setTimeout(() => ctrl.abort(), 60000);
      const res = await fetch(`/api/assessments/${liveAssessment.id}/check`, {
        signal: ctrl.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentSession.studentId, questionId: qid, answer: answers[qid] }),
      });
      clearTimeout(abortTimer);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setCheckError((e) => ({ ...e, [qid]: (data && data.error) || "Could not check your answer. Please try again." }));
        if (data && data.checksLeft === 0) {
          setCheckResults((r) => (r[qid] ? { ...r, [qid]: { ...r[qid], checksLeft: 0 } } : r));
        }
        return;
      }
      setCheckResults((r) => ({ ...r, [qid]: { ...data, answerChecked: JSON.stringify(answers[qid] ?? "") } }));
    } catch (err: any) {
      setCheckError((e) => ({
        ...e,
        [qid]:
          err && err.name === "AbortError"
            ? "Checking took too long, so it was stopped. Your answer is saved - try again in a minute."
            : "Could not reach the server. Please try again.",
      }));
    } finally {
      setCheckingId(null);
    }
  };

  // Live timer
  useEffect(() => {
    if (liveAssessment.durationMinutes <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [liveAssessment.durationMinutes]);

  // ---------- Saving work ----------
  // "saved": the server has everything. "unsaved": changes not sent yet (they are always
  // kept in this browser). "saving": sending now. "error": the last save failed.
  const [saveState, setSaveState] = useState<"saved" | "unsaved" | "saving" | "error">("saved");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [attemptMissing, setAttemptMissing] = useState(false);
  const [otherTabOpen, setOtherTabOpen] = useState(false);
  const lastSavedJsonRef = useRef<string>(JSON.stringify(studentSession.answers || {}));
  const firstUnsavedAtRef = useRef<number | null>(null);
  const saveInFlightRef = useRef(false);
  const currentIdxRef = useRef(currentIdx);
  currentIdxRef.current = currentIdx;
  const finishedRef = useRef(false);

  const answeredIdsOf = (ans: Record<string, any>) => Object.keys(ans).filter((id) => !isEmptyAnswer(ans[id]));

  const saveProgress = async (opts: { keepalive?: boolean } = {}): Promise<boolean> => {
    if (finishedRef.current || submittingRef.current) return true;
    if (saveInFlightRef.current && !opts.keepalive) return false;
    const snapshot = answersRef.current;
    const json = JSON.stringify(snapshot);
    saveInFlightRef.current = true;
    if (!opts.keepalive) setSaveState("saving");
    try {
      const res = await fetch(`/api/assessments/${assessment.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: opts.keepalive,
        body: JSON.stringify({
          studentId: studentSession.studentId,
          currentQuestionIndex: currentIdxRef.current,
          answeredQuestions: answeredIdsOf(snapshot),
          answers: snapshot,
        }),
      });
      if (res.status === 404) {
        setAttemptMissing(true);
        setSaveState("error");
        return false;
      }
      if (!res.ok) throw new Error("save failed " + res.status);
      lastSavedJsonRef.current = json;
      setLastSavedAt(Date.now());
      setAttemptMissing(false);
      if (JSON.stringify(answersRef.current) === json) {
        firstUnsavedAtRef.current = null;
        setSaveState("saved");
        try {
          localStorage.setItem(backupKey, JSON.stringify({ answers: snapshot, changedAt: Date.now(), saved: true }));
        } catch {}
      } else {
        setSaveState("unsaved"); // more was typed while saving; the next save sends it
      }
      return true;
    } catch {
      setSaveState("error");
      return false;
    } finally {
      saveInFlightRef.current = false;
    }
  };

  // Every change: keep a copy in this browser at once, and send it to the server 20s after
  // the student stops typing (and at least once a minute while they keep typing).
  useEffect(() => {
    if (finishedRef.current) return;
    try {
      localStorage.setItem(
        backupKey,
        JSON.stringify({ answers, changedAt: Date.now(), saved: JSON.stringify(answers) === lastSavedJsonRef.current })
      );
    } catch {}
    if (JSON.stringify(answers) === lastSavedJsonRef.current) return;
    const now = Date.now();
    if (firstUnsavedAtRef.current === null) firstUnsavedAtRef.current = now;
    setSaveState((st) => (st === "error" ? "error" : "unsaved"));
    const wait = Math.max(0, Math.min(20000, 60000 - (now - firstUnsavedAtRef.current)));
    clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => saveProgress(), wait);
    return () => clearTimeout(autoSaveTimerRef.current);
  }, [answers]);

  // Moving to another question saves straight away
  const firstIdxRun = useRef(true);
  useEffect(() => {
    if (firstIdxRun.current) {
      firstIdxRun.current = false;
      return;
    }
    if (JSON.stringify(answersRef.current) !== lastSavedJsonRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      saveProgress();
    }
  }, [currentIdx]);

  // After a failed save, keep retrying every 15s
  useEffect(() => {
    if (saveState !== "error" || attemptMissing) return;
    const t = setTimeout(() => saveProgress(), 15000);
    return () => clearTimeout(t);
  }, [saveState, attemptMissing]);

  // Leaving the page: send the latest answers and warn if something is not saved yet
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (finishedRef.current) return;
      if (JSON.stringify(answersRef.current) !== lastSavedJsonRef.current) {
        saveProgress({ keepalive: true });
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const onHide = () => {
      if (document.visibilityState === "hidden" && JSON.stringify(answersRef.current) !== lastSavedJsonRef.current) {
        saveProgress({ keepalive: true });
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  // Warn when the same exam is open in another tab or window of this browser
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel(`exam_${assessment.id}_${studentSession.studentId}`);
    ch.onmessage = (ev) => {
      if (ev.data === "hello") ch.postMessage("here");
      if (ev.data === "hello" || ev.data === "here") setOtherTabOpen(true);
    };
    ch.postMessage("hello");
    return () => ch.close();
  }, [assessment.id, studentSession.studentId]);

  const handleAnswerChange = (newAns: any) => {
    if (!currentTask) return;
    setAnswers((prev) => ({
      ...prev,
      [currentTask.id]: newAns,
    }));
  };

  const handleAutoSubmit = async () => {
    // Submit automatically when timer expires without modal alert
    await executeSubmission();
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const executeSubmission = async () => {
    // Only one submission at a time (e.g. clicking Submit just as the timer runs out)
    if (submittingRef.current) return;
    submittingRef.current = true;
    clearTimeout(autoSaveTimerRef.current);
    const answers = answersRef.current;
    try {
      localStorage.setItem(backupKey, JSON.stringify({ answers, changedAt: Date.now(), saved: false }));
    } catch {}
    setIsSubmitting(true);
    setShowConfirmSubmit(false);
    setSubmitError(null);

    let marksRecord: Record<string, number> = {};
    let detailedRecord: Record<string, MarkResult> = {};
    let totalMarks = 0;
    let percentage = 0;
    let serverMarked = false;
    let serverConfidential = false;

    // 1. Submit to the server, which marks against the full mark scheme. Tried up to
    //    3 times; the exam only finishes once the server has really received the answers.
    let lastProblem = "";
    for (let attempt = 0; attempt < 3 && !serverMarked; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, attempt * 3000));
      try {
        const res = await fetch(`/api/assessments/${liveAssessment.id}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: studentSession.studentId, answers }),
        });
        if (res.ok) {
          const data = await res.json();
          serverMarked = true;
          serverConfidential = Boolean(data.confidential);
          const serverSession = data.studentSession || {};
          if (!serverConfidential && serverSession.marks) {
            marksRecord = serverSession.marks;
            const notes: Record<string, string> = serverSession.markingNotes || {};
            for (const task of questionsList) {
              const m = marksRecord[task.id] ?? 0;
              const M = task.marks || 0;
              detailedRecord[task.id] = { m, M, passed: M > 0 && m >= M * 0.7, feedback: notes[task.id] } as MarkResult;
            }
            totalMarks = serverSession.totalMarks ?? Object.values(marksRecord).reduce((acc, m) => acc + (m || 0), 0);
            percentage = serverSession.percentage ?? 0;
          }
        } else {
          lastProblem = res.status === 404 ? "missing" : `status ${res.status}`;
          if (res.status === 404) break;
        }
      } catch (e) {
        lastProblem = "offline";
      }
    }

    // 2. Not received: keep the exam open (answers are kept on this computer) and tell the student.
    if (!serverMarked) {
      submittingRef.current = false;
      setIsSubmitting(false);
      setSubmitError(
        lastProblem === "missing"
          ? "Your attempt could not be found on the server (your teacher may have removed it). Your answers are still kept on this computer. Do not close this page - tell your teacher now."
          : "Your answers have NOT reached your teacher yet (no connection or the server is busy). They are kept on this computer. Do not close this page - check your internet and press \"Try again\"."
      );
      return;
    }
    finishedRef.current = true;
    try {
      localStorage.removeItem(backupKey);
    } catch {}

    // 3. Real-time notification so the teacher's screen updates instantly.
    //    Marks are only included when they came from the server (or offline fallback);
    //    for confidential exams the teacher's dashboard reads marks from the server.
    try {
      const fsSession: any = {
        studentId: studentSession.studentId,
        name: studentSession.name,
        candidateNumber: studentSession.candidateNumber,
        className: studentSession.className,
        status: "submitted",
        currentQuestionIndex: questionsList.length - 1,
        answeredQuestions: Object.keys(answers).filter(
          (k) => answers[k] !== undefined && answers[k] !== null && answers[k] !== ""
        ),
        answers,
        maxMarks: liveAssessment.maxMarks,
        submittedAt: Date.now(),
        lastActiveAt: Date.now(),
      };
      if (!serverConfidential) {
        fsSession.marks = marksRecord;
        fsSession.totalMarks = totalMarks;
        fsSession.percentage = percentage;
      }
      await syncStudentSessionToFirestore(liveAssessment.id, fsSession);
    } catch (fsErr) {
      console.warn("Firestore submission sync warning:", fsErr);
    }

    // If confidential formal exam, do not display marks to student on their screen
    let studentMarks = marksRecord;
    let studentDetailed = detailedRecord;
    let studentTotal = totalMarks;
    let studentPct = percentage;

    if (!isTaskMode && !liveAssessment.showScoreImmediately) {
      studentMarks = {};
      studentDetailed = {};
      studentTotal = 0;
      studentPct = 0;
    }

    setIsSubmitting(false);
    onFinishExam({
      marks: studentMarks,
      totalMarks: studentTotal,
      maxMarks: liveAssessment.maxMarks,
      percentage: studentPct,
      answers,
      detailedResults: studentDetailed,
    });
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).filter((id) => {
    const a = answers[id];
    return a !== undefined && a !== null && a !== "";
  }).length;

  const isLowTime = liveAssessment.durationMinutes > 0 && secondsRemaining < 300; // less than 5 min

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Fixed / Sticky Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 sticky top-18 z-30">
        <div>
          {liveAssessment.customHeaderBanner ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
              <span>🏛️ {liveAssessment.customHeaderBanner}</span>
            </div>
          ) : (
            <span
              className={`text-[11px] font-bold uppercase tracking-wider block ${
                isTaskMode ? "text-emerald-700" : "text-purple-700"
              }`}
            >
              {isTaskMode ? "In-Class Practice Task Assignment" : "In-Class Assessment"}
            </span>
          )}
          <h2 className="text-base font-bold text-slate-900">{liveAssessment.title}</h2>
          {liveAssessment.customInstructions && (
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{liveAssessment.customInstructions}</p>
          )}
        </div>

        {/* Live Timer if timed */}
        {liveAssessment.durationMinutes > 0 && (
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${
              isLowTime
                ? "bg-red-50 border-red-300 text-red-700 animate-pulse"
                : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Time Left: {formatTimer(secondsRemaining)}</span>
          </div>
        )}

        {/* Answered progress */}
        <div className="text-right">
          <span className="text-xs text-slate-500 block">Progress</span>
          <span className="text-xs font-bold text-slate-800">
            {answeredCount} of {questionsList.length} Answered
          </span>
        </div>
      </div>

      {/* Saving status and warnings */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div
          className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
            saveState === "error"
              ? "bg-red-50 border-red-300 text-red-700"
              : saveState === "saved"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
          role="status"
        >
          {saveState === "saved" && (
            <span>✓ All work saved{lastSavedAt ? ` at ${new Date(lastSavedAt).toLocaleTimeString()}` : ""}</span>
          )}
          {saveState === "unsaved" && <span>● Changes not sent yet (kept on this computer, saving automatically)</span>}
          {saveState === "saving" && <span>Saving…</span>}
          {saveState === "error" && (
            <span>⚠ Your latest work is NOT saved to the server - check your internet. It is kept on this computer; do not close this page.</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            clearTimeout(autoSaveTimerRef.current);
            saveProgress();
          }}
          disabled={saveState === "saving"}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-sm disabled:opacity-50"
        >
          Save now
        </button>
      </div>

      {restoredCount > 0 && (
        <div className="bg-sky-50 border border-sky-300 text-sky-900 rounded-xl px-4 py-2.5 text-sm flex items-start justify-between gap-3">
          <span>
            We restored {restoredCount} answer{restoredCount === 1 ? "" : "s"} saved on this computer. Check your work and carry on.
          </span>
          <button type="button" onClick={() => setRestoredCount(0)} className="text-sky-700 font-bold text-xs">
            OK
          </button>
        </div>
      )}

      {otherTabOpen && (
        <div className="bg-red-50 border border-red-300 text-red-800 rounded-xl px-4 py-2.5 text-sm font-semibold">
          ⚠ This exam is open in another tab or window. Close the other one and only use one - otherwise you could lose work.
        </div>
      )}

      {attemptMissing && !submitError && (
        <div className="bg-red-50 border border-red-300 text-red-800 rounded-xl px-4 py-2.5 text-sm font-semibold">
          ⚠ Your attempt could not be found on the server (your teacher may have removed it). Your answers are kept on this computer. Tell your teacher now.
        </div>
      )}

      {liveAssessment.durationMinutes > 0 && secondsRemaining > 0 && secondsRemaining <= 300 && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl px-4 py-2.5 text-sm font-semibold">
          ⏱ Less than {Math.ceil(secondsRemaining / 60)} minute{Math.ceil(secondsRemaining / 60) === 1 ? "" : "s"} left. When time runs out, everything you have written is submitted automatically.
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border-2 border-red-400 text-red-800 rounded-xl px-4 py-3 text-sm font-semibold flex flex-wrap items-center justify-between gap-3">
          <span>⚠ {submitError}</span>
          <button
            type="button"
            onClick={() => executeSubmission()}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-50"
          >
            {isSubmitting ? "Sending…" : "Try again"}
          </button>
        </div>
      )}

      {/* Question Navigation Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-500 mr-2 shrink-0">Questions:</span>
        {questionsList.map((t, idx) => {
          const isAnswered =
            answers[t.id] !== undefined && answers[t.id] !== null && answers[t.id] !== "";
          const isCurrent = idx === currentIdx;

          return (
            <button
              key={t.id}
              onClick={() => setCurrentIdx(idx)}
              className={`w-9 h-9 rounded-lg font-bold text-xs shrink-0 flex items-center justify-center transition-all ${
                isCurrent
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-300"
                  : isAnswered
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Question Card Area */}
      {currentTask ? (
        <>
        <QuestionCard
          key={currentTask.id}
          task={currentTask}
          mode="exam"
          hideAiScaffold={true}
          questionNumber={currentIdx + 1}
          studentAnswer={answers[currentTask.id]}
          onAnswerChange={handleAnswerChange}
          allowCopyPaste={liveAssessment.allowCopyPaste}
          showOperatorToolbar={liveAssessment.showOperatorToolbar}
        />
        {liveAssessment.instantFeedback && (() => {
          const r = checkResults[currentTask.id];
          const err = checkError[currentTask.id];
          const changed = r && r.answerChecked !== JSON.stringify(answers[currentTask.id] ?? "");
          const limit = liveAssessment.maxChecks ?? 3; // 0 = unlimited
          const usedBefore = (((studentSession as any).answerChecks || {})[currentTask.id] || 0) as number;
          const left: number | null = limit === 0 ? null : r ? r.checksLeft : Math.max(0, limit - usedBefore);
          const hasAnswer = (() => {
            const v = answers[currentTask.id];
            if (v === undefined || v === null) return false;
            if (typeof v === "string") return v.trim() !== "";
            if (Array.isArray(v)) return v.some((x) => (Array.isArray(x) ? x.some((y) => String(y ?? "").trim()) : String(x ?? "").trim()));
            if (typeof v === "object") return Object.values(v).some((x) => String(x ?? "").trim());
            return true;
          })();
          const style =
            r?.verdict === "correct"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : r?.verdict === "partial"
              ? "bg-amber-50 border-amber-300 text-amber-900"
              : "bg-rose-50 border-rose-300 text-rose-900";
          return (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  Your teacher lets you check this answer before moving on.{" "}
                  {left === null ? (
                    <span className="font-semibold">Unlimited checks.</span>
                  ) : (
                    <>
                      <span className="font-semibold">
                        {left} check{left === 1 ? "" : "s"} left
                      </span>{" "}
                      for this question.
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCheckAnswer}
                  disabled={checkingId === currentTask.id || (left !== null && left <= 0) || !hasAnswer}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {checkingId === currentTask.id ? "Checking…" : "Check answer"}
                </button>
              </div>
              {r && (
                <div className={`p-3 rounded-xl border text-sm ${style}`}>
                  <div className="font-bold">
                    {r.verdict === "correct"
                      ? `✓ Correct: ${r.marks}/${r.maxMarks} marks`
                      : r.verdict === "partial"
                      ? `◐ Partly correct: ${r.marks}/${r.maxMarks} marks`
                      : `✗ Not correct yet: 0/${r.maxMarks} marks`}
                  </div>
                  {r.points && r.points.length > 0 ? (
                    <div className="mt-2">
                      <MarkPointsList points={r.points} feedback={r.feedback} />
                    </div>
                  ) : (
                    r.feedback && <div className="text-xs mt-1 whitespace-pre-line">{r.feedback}</div>
                  )}
                  {Array.isArray(r.tests) && r.tests.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-bold">Test by test (where you gained and lost marks):</div>
                      {r.tests.map((t, i) => (
                        <div
                          key={i}
                          className={`rounded-lg border bg-white p-2.5 text-xs text-slate-800 ${
                            t.passed ? "border-emerald-200" : "border-rose-200"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 font-semibold">
                            <span className={t.passed ? "text-emerald-700" : "text-rose-700"}>
                              {t.passed ? "✓" : "✗"} Test {i + 1}
                            </span>
                            <span>
                              {t.marks}/{t.maxMarks} mark{t.maxMarks === 1 ? "" : "s"}
                            </span>
                          </div>
                          <div className="mt-1.5 grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-slate-500">Inputs typed</div>
                              <pre className="font-mono whitespace-pre-wrap bg-slate-50 rounded p-1.5">
                                {t.inputs.length ? t.inputs.join("\n") : "(no input)"}
                              </pre>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-slate-500">Your program printed</div>
                              <pre className="font-mono whitespace-pre-wrap bg-slate-50 rounded p-1.5">
                                {t.output.trim() || "(nothing)"}
                              </pre>
                            </div>
                            {t.expected !== undefined && (
                              <div>
                                <div className="text-[10px] uppercase tracking-wide text-slate-500">Expected</div>
                                <pre className="font-mono whitespace-pre-wrap bg-emerald-50 rounded p-1.5">
                                  {t.expected.trim() || "(nothing)"}
                                </pre>
                              </div>
                            )}
                          </div>
                          {t.error && <div className="mt-1.5 font-mono text-rose-700">Error: {t.error}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  {changed && (
                    <div className="text-[11px] mt-1 opacity-80">You have changed your answer since this check.</div>
                  )}
                </div>
              )}
              {err && <div className="text-xs text-rose-700">{err}</div>}
            </div>
          );
        })()}
        </>
      ) : (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          No questions available.
        </div>
      )}

      {/* Bottom Navigation & Submit Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
        <button
          type="button"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous Question
        </button>

        <div className="flex items-center gap-3">
          {currentIdx < questionsList.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIdx((i) => Math.min(questionsList.length - 1, i + 1))}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
            >
              Next Question <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmSubmit(true)}
              className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
            >
              <Send className="w-4 h-4" /> {isTaskMode ? "Complete Task" : "Submit Exam"}
            </button>
          )}

          {currentIdx < questionsList.length - 1 && (
            <button
              type="button"
              onClick={() => setShowConfirmSubmit(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 ml-2"
            >
              Finish Early
            </button>
          )}
        </div>
      </div>

      {/* Confirm Submission Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Exam Submission</h3>
                <p className="text-xs text-slate-500">
                  You cannot modify your answers once submitted.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Questions:</span>
                <span className="font-bold text-slate-900">{questionsList.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Answered Questions:</span>
                <span className="font-bold text-emerald-700">{answeredCount}</span>
              </div>
              {questionsList.length - answeredCount > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold pt-1 border-t border-slate-200">
                  <span>Unanswered Questions:</span>
                  <span>{questionsList.length - answeredCount}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Return to Exam
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={executeSubmission}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Auto-Marking..." : "Yes, Submit Exam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
