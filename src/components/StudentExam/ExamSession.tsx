import React, { useState, useEffect, useRef, useMemo } from "react";
import { Assessment, IGCSETask, StudentSession, MarkResult } from "../../types";
import { QuestionCard } from "../QuestionCard";
import { autoMarkTask } from "../../utils/autoMarker";
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
  const [answers, setAnswers] = useState<Record<string, any>>(studentSession.answers || {});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    liveAssessment.durationMinutes > 0 ? liveAssessment.durationMinutes * 60 : 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const autoSaveTimerRef = useRef<any>(null);

  // Poll for assessment edits so live updates reflect in the exam hall without refreshing
  useEffect(() => {
    const syncAssessment = async () => {
      try {
        const res = await fetch(`/api/assessments/${liveAssessment.id}`);
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
    checksLeft: number;
    answerChecked: string;
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
      const res = await fetch(`/api/assessments/${liveAssessment.id}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentSession.studentId, questionId: qid, answer: answers[qid] }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setCheckError((e) => ({ ...e, [qid]: (data && data.error) || "Could not check your answer. Please try again." }));
        if (data && data.checksLeft === 0) {
          setCheckResults((r) => (r[qid] ? { ...r, [qid]: { ...r[qid], checksLeft: 0 } } : r));
        }
        return;
      }
      setCheckResults((r) => ({ ...r, [qid]: { ...data, answerChecked: JSON.stringify(answers[qid] ?? "") } }));
    } catch {
      setCheckError((e) => ({ ...e, [qid]: "Could not reach the server. Please try again." }));
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

  // Periodic live progress push to server and Firestore (so teacher dashboard updates live)
  useEffect(() => {
    const pushProgress = async () => {
      try {
        const answeredIds = Object.keys(answers).filter((id) => {
          const val = answers[id];
          if (val === undefined || val === null || val === "") return false;
          if (Array.isArray(val) && val.length === 0) return false;
          return true;
        });

        // 1. Sync live progress to Firestore in real time
        syncStudentSessionToFirestore(liveAssessment.id, {
          studentId: studentSession.studentId,
          name: studentSession.name,
          candidateNumber: studentSession.candidateNumber,
          className: studentSession.className,
          status: "in_progress",
          currentQuestionIndex: currentIdx,
          answeredQuestions: answeredIds,
          answers,
          lastActiveAt: Date.now(),
        });

        // 2. Also notify backend API
        await fetch(`/api/assessments/${assessment.id}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: studentSession.studentId,
            currentQuestionIndex: currentIdx,
            answeredQuestions: answeredIds,
            answers,
          }),
        });
      } catch (e) {
        // silent sync fallback
      }
    };

    clearTimeout(autoSaveTimerRef.current);
    // Save 10s after the last change (was 1.2s, which wrote to the database on almost every keystroke)
    autoSaveTimerRef.current = setTimeout(pushProgress, 10000);

    return () => clearTimeout(autoSaveTimerRef.current);
  }, [currentIdx, answers, assessment.id, liveAssessment.id, studentSession]);

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

  const executeSubmission = async () => {
    setIsSubmitting(true);
    setShowConfirmSubmit(false);

    let marksRecord: Record<string, number> = {};
    let detailedRecord: Record<string, MarkResult> = {};
    let totalMarks = 0;
    let percentage = 0;
    let serverMarked = false;
    let serverConfidential = false;

    // 1. Submit to the server first. The server marks against the full mark scheme
    //    (expected outputs, mark points, AI examiner), which the browser never sees.
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
        console.warn("Server submission failed with status", res.status);
      }
    } catch (e) {
      console.warn("Server submission unavailable, marking in the browser instead", e);
    }

    // 2. Offline fallback only: mark in the browser if the server could not be reached.
    if (!serverMarked) {
      for (const task of questionsList) {
        const studentAns = answers[task.id];
        const markRes = await autoMarkTask(task, studentAns);
        marksRecord[task.id] = markRes.m;
        detailedRecord[task.id] = markRes;
        totalMarks += markRes.m;
      }
      percentage = liveAssessment.maxMarks > 0 ? Math.round((totalMarks / liveAssessment.maxMarks) * 100) : 0;
    }

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
          const left = r ? r.checksLeft : Math.max(0, 3 - (((studentSession as any).answerChecks || {})[currentTask.id] || 0));
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
                  <span className="font-semibold">{left} check{left === 1 ? "" : "s"} left</span> for this question.
                </div>
                <button
                  type="button"
                  onClick={handleCheckAnswer}
                  disabled={checkingId === currentTask.id || left <= 0 || !hasAnswer}
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
                  {r.feedback && <div className="text-xs mt-1 whitespace-pre-line">{r.feedback}</div>}
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
