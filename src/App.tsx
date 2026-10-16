import React, { useState, useEffect, useMemo } from "react";
import { Header, AppView } from "./components/Header";
import { PracticeMode } from "./components/PracticeMode";
import { TeacherDashboard } from "./components/TeacherDashboard/TeacherDashboard";
import { TeacherAuthGate } from "./components/TeacherDashboard/TeacherAuthGate";
import { StudentSignIn } from "./components/StudentExam/StudentSignIn";
import { ExamSession } from "./components/StudentExam/ExamSession";
import { StudentSubmissionConfirmation } from "./components/StudentExam/StudentSubmissionConfirmation";
import { SpecificationReferenceModal } from "./components/SpecificationReferenceModal";
import { AppFeatureHelpModal } from "./components/AppFeatureHelpModal";
import { getAll1000Units } from "./data/questionBank1000";
import { IGCSEUnit, IGCSETask, Assessment, StudentSession, MarkResult } from "./types";
import { setLibraryFiles } from "./utils/pythonRunner";
import { getTeacherToken, verifyTeacherToken, teacherLogout, teacherFetch, TEACHER_SESSION_EXPIRED_EVENT } from "./utils/teacherAuth";
import { syncCustomQuestionToFirestore, subscribeToCustomQuestions } from "./firebase";
import { AlertTriangle } from "lucide-react";

// ---------- Keeping students on the assessment / task they were sent to ----------
// Opening a teacher's link (?task=CODE or ?assessment=CODE) locks this browser to it for the
// rest of the day, also after submitting, so students cannot reach the main site (Practice)
// by deleting the end of the link. A teacher signing in on this computer clears it.
type ExamLockInfo = { code: string; type: "task" | "assessment"; at: number };
function readExamLock(): ExamLockInfo | null {
  try {
    const lock = JSON.parse(localStorage.getItem("edexcel_exam_lock") || "null");
    if (lock && lock.code && new Date(lock.at || 0).toDateString() === new Date().toDateString()) return lock;
  } catch (e) {}
  return null;
}
function setExamLock(code: string, type: "task" | "assessment") {
  try {
    if (code) localStorage.setItem("edexcel_exam_lock", JSON.stringify({ code, type, at: Date.now() }));
  } catch (e) {}
}
function clearExamLock() {
  try {
    localStorage.removeItem("edexcel_exam_lock");
  } catch (e) {}
}

export function App() {
  const [units, setUnits] = useState<IGCSEUnit[]>(() => {
    // 1. Always load the full authoritative 1,000+ curriculum bank (including U11 Text File Handling)
    const baseUnits = getAll1000Units();

    // 2. Remove any legacy stale cache that froze old unit definitions with empty tasks
    try {
      localStorage.removeItem("igcse_custom_units");
    } catch (e) {}

    // 3. Merge any teacher-created custom questions saved in local storage
    try {
      const rawCustom = localStorage.getItem("edexcel_local_custom_questions");
      if (rawCustom) {
        const customTasks: IGCSETask[] = JSON.parse(rawCustom);
        if (Array.isArray(customTasks) && customTasks.length > 0) {
          const mergedUnits = [...baseUnits];
          for (const task of customTasks) {
            const targetUnitCode = task.unit || "U99";
            const unitIdx = mergedUnits.findIndex((u) => u.code === targetUnitCode);
            if (unitIdx >= 0) {
              const u = mergedUnits[unitIdx];
              if (!u.tasks.some((t) => t.id === task.id)) {
                mergedUnits[unitIdx] = {
                  ...u,
                  tasks: [task, ...u.tasks],
                };
              }
            } else {
              mergedUnits.push({
                code: targetUnitCode,
                title: task.unitName || "Custom Questions",
                tasks: [task],
              });
            }
          }
          return mergedUnits;
        }
      }
    } catch (e) {}

    return baseUnits;
  });

  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const hash = window.location.hash;
        if (params.has("teacher") || params.get("view") === "teacher" || hash === "#teacher" || hash === "#staff") {
          return "teacher";
        }
        if (params.has("join") || params.has("assessment") || params.has("task") || hash.startsWith("#task=") || hash.startsWith("#assessment=")) {
          return "exam_join";
        }
        // A formal assessment this browser started and has not submitted yet: go straight back to it
        const lock = JSON.parse(localStorage.getItem("edexcel_exam_lock") || "null");
        if (lock && lock.code && new Date(lock.at || 0).toDateString() === new Date().toDateString()) {
          return "exam_join";
        }
        // Free Practice area: ?practice
        if (params.has("practice") || params.get("view") === "practice" || hash === "#practice") {
          return "practice";
        }
      }
    } catch (e) {}
    // The site opens on the teacher page (sign-in screen until a teacher signs in)
    return "teacher";
  });
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [currentStudentSession, setCurrentStudentSession] = useState<StudentSession | null>(null);
  const [examResult, setExamResult] = useState<{
    marks: Record<string, number>;
    totalMarks: number;
    maxMarks: number;
    percentage: number;
    answers: Record<string, any>;
    detailedResults: Record<string, MarkResult>;
  } | null>(null);

  const [initialJoinCode, setInitialJoinCode] = useState<string>("");
  const [dedicatedStudentMode, setDedicatedStudentMode] = useState<{
    type: "task" | "assessment";
    title?: string;
  } | null>(null);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [pendingTargetView, setPendingTargetView] = useState<AppView | null>(null);
  const [sessionExitedMessage, setSessionExitedMessage] = useState<string | null>(null);

  // Practice Mode copy/paste setting (synced with server)
  const [allowPracticeCopyPaste, setAllowPracticeCopyPaste] = useState<boolean>(() => {
    const cached = localStorage.getItem("igcse_practice_allow_copy_paste");
    return cached !== null ? cached === "true" : false;
  });

  // Practice portal open/closed, and questions from open assessments (never shown in Practice)
  const [practiceOpen, setPracticeOpen] = useState<boolean>(true);
  const [hiddenPracticeIds, setHiddenPracticeIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/settings/practice")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.allowCopyPaste === "boolean") {
          setAllowPracticeCopyPaste(data.allowCopyPaste);
          localStorage.setItem("igcse_practice_allow_copy_paste", String(data.allowCopyPaste));
        }
        if (data && typeof data.practiceOpen === "boolean") setPracticeOpen(data.practiceOpen);
        if (data && Array.isArray(data.hiddenQuestionIds)) setHiddenPracticeIds(data.hiddenQuestionIds.map(String));
      })
      .catch(() => {});
  }, []);

  const handleTogglePracticeOpen = async (newVal: boolean) => {
    setPracticeOpen(newVal);
    try {
      await teacherFetch("/api/settings/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ practiceOpen: newVal }),
      });
    } catch (e) {
      console.warn("Failed to save the Practice portal setting:", e);
    }
  };

  const handleTogglePracticeCopyPaste = async (newVal: boolean) => {
    setAllowPracticeCopyPaste(newVal);
    localStorage.setItem("igcse_practice_allow_copy_paste", String(newVal));
    try {
      await teacherFetch("/api/settings/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowCopyPaste: newVal }),
      });
    } catch (e) {
      console.warn("Failed to persist practice copy paste setting to server:", e);
    }
  };

  // Teacher authentication state - validated via cryptographic session token
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(() => {
    return !!getTeacherToken();
  });

  // Verify token validity on load
  useEffect(() => {
    if (getTeacherToken()) {
      verifyTeacherToken().then((valid) => {
        setIsTeacherAuthenticated(valid);
      });
    }
  }, []);

  // If the server rejects the teacher session (expired, or password changed), show the login screen.
  useEffect(() => {
    const onExpired = () => setIsTeacherAuthenticated(false);
    window.addEventListener(TEACHER_SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(TEACHER_SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  // Map of all task IDs to task objects (1,000+ questions)
  const allTasks = useMemo(() => {
    const map: Record<string, IGCSETask> = {};
    for (const u of units) {
      for (const t of u.tasks) {
        map[t.id] = t;
      }
    }
    return map;
  }, [units]);

  // What students see in Practice: no questions from open assessments
  const practiceUnits = useMemo(() => {
    if (!hiddenPracticeIds.length) return units;
    const hidden = new Set(hiddenPracticeIds);
    return units
      .map((u) => ({ ...u, tasks: u.tasks.filter((t) => !hidden.has(t.id)) }))
      .filter((u) => u.tasks.length > 0);
  }, [units, hiddenPracticeIds]);
  const practiceTasks = useMemo(() => {
    const map: Record<string, IGCSETask> = {};
    for (const u of practiceUnits) for (const t of u.tasks) map[t.id] = t;
    return map;
  }, [practiceUnits]);

  // Load custom questions persisted on the server or in local storage
  useEffect(() => {
    // Load the teacher's data file library so student programs can open past-paper files
    fetch("/api/data-files?content=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.files)) {
          const map: Record<string, string> = {};
          for (const f of data.files) map[f.name] = f.content || "";
          setLibraryFiles(map);
        }
      })
      .catch(() => {});

    teacherFetch("/api/custom-questions")
      .then((res) => (res.ok ? res.json() : { questions: [] }))
      .then((data) => {
        let serverQuestions: IGCSETask[] = data.questions || [];

        try {
          const localQ = localStorage.getItem("edexcel_local_custom_questions");
          if (localQ) {
            const parsed = JSON.parse(localQ);
            if (Array.isArray(parsed)) {
              for (const q of parsed) {
                if (!serverQuestions.some((sq) => sq.id === q.id)) {
                  serverQuestions.push(q);
                }
              }
            }
          }
        } catch (e) {}

        if (serverQuestions.length === 0) return;

        setUnits((prevUnits) => {
          let updated = [...prevUnits];
          for (const task of serverQuestions) {
            const targetUnitCode = task.unit || "U99";
            const unitIdx = updated.findIndex((u) => u.code === targetUnitCode);
            if (unitIdx >= 0) {
              const u = updated[unitIdx];
              const exists = u.tasks.some((t) => t.id === task.id);
              updated[unitIdx] = {
                ...u,
                tasks: exists
                  ? u.tasks.map((t) => (t.id === task.id ? task : t))
                  : [task, ...u.tasks],
              };
            } else {
              updated.push({
                code: targetUnitCode,
                title: task.unitName || "Teacher Added Questions",
                tasks: [task],
              });
            }
          }
          return updated;
        });
      })
      .catch(() => {
        // Fallback to local storage on offline/static host
        try {
          const localQ = localStorage.getItem("edexcel_local_custom_questions");
          if (localQ) {
            const parsed: IGCSETask[] = JSON.parse(localQ);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setUnits((prevUnits) => {
                let updated = [...prevUnits];
                for (const task of parsed) {
                  const targetUnitCode = task.unit || "U99";
                  const unitIdx = updated.findIndex((u) => u.code === targetUnitCode);
                  if (unitIdx >= 0) {
                    const u = updated[unitIdx];
                    const exists = u.tasks.some((t) => t.id === task.id);
                    updated[unitIdx] = {
                      ...u,
                      tasks: exists
                        ? u.tasks.map((t) => (t.id === task.id ? task : t))
                        : [task, ...u.tasks],
                    };
                  } else {
                    updated.push({
                      code: targetUnitCode,
                      title: task.unitName || "Teacher Added Questions",
                      tasks: [task],
                    });
                  }
                }
                return updated;
              });
            }
          }
        } catch (e) {}
      });

    // Real-time listener for custom questions across devices
    const unsubscribeQuestions = subscribeToCustomQuestions((fsQuestions) => {
      if (fsQuestions && fsQuestions.length > 0) {
        setUnits((prevUnits) => {
          let updated = [...prevUnits];
          for (const task of fsQuestions) {
            const targetUnitCode = task.unit || "U99";
            const unitIdx = updated.findIndex((u) => u.code === targetUnitCode);
            if (unitIdx >= 0) {
              const u = updated[unitIdx];
              const exists = u.tasks.some((t) => t.id === task.id);
              updated[unitIdx] = {
                ...u,
                tasks: exists
                  ? u.tasks.map((t) => (t.id === task.id ? task : t))
                  : [task, ...u.tasks],
              };
            } else {
              updated.push({
                code: targetUnitCode,
                title: task.unitName || "Teacher Added Questions",
                tasks: [task],
              });
            }
          }
          return updated;
        });
      }
    });

    return () => unsubscribeQuestions();
  }, [isTeacherAuthenticated]);

  // Whatever way a locked student ends up on the main site (deleting the link, "Back to
  // Practice", the menu), send them back to their assessment or task.
  useEffect(() => {
    if (isTeacherAuthenticated) return;
    if (currentView !== "practice" && currentView !== "teacher") return;
    // Someone who typed ?teacher on purpose may sign in (that is how a teacher unlocks a computer)
    if (currentView === "teacher") {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.has("teacher") || window.location.hash === "#teacher" || window.location.hash === "#staff") return;
      } catch (e) {}
    }
    const lock = readExamLock();
    if (!lock) return;
    setInitialJoinCode(lock.code);
    setDedicatedStudentMode({ type: lock.type });
    setCurrentView("exam_join");
    try {
      window.history.replaceState({}, document.title, window.location.pathname + `?${lock.type}=${encodeURIComponent(lock.code)}`);
    } catch (e) {}
  }, [currentView, isTeacherAuthenticated]);

  // Handle URL query parameters and hash changes (e.g. ?task=CODE or ?assessment=CODE or #task=CODE or #assessment=CODE)
  useEffect(() => {
    const parseUrlRoute = () => {
      // 1. Check search query parameters: ?task=CODE or ?assessment=CODE
      const urlParams = new URLSearchParams(window.location.search);
      const taskParam = urlParams.get("task");
      const assessmentParam = urlParams.get("assessment");

      if (taskParam) {
        setInitialJoinCode(taskParam.trim().toUpperCase());
        setDedicatedStudentMode({ type: "task" });
        setCurrentView("exam_join");
        setExamLock(taskParam.trim().toUpperCase(), "task");
        return;
      }

      if (assessmentParam) {
        setInitialJoinCode(assessmentParam.trim().toUpperCase());
        setDedicatedStudentMode({ type: "assessment" });
        setCurrentView("exam_join");
        setExamLock(assessmentParam.trim().toUpperCase(), "assessment");
        return;
      }

      // No link in the address, but this browser is in the middle of a formal assessment
      // (e.g. the student deleted the end of the link): send them back to it.
      if (!urlParams.has("teacher")) {
        try {
          const lock = JSON.parse(localStorage.getItem("edexcel_exam_lock") || "null");
          if (lock && lock.code && new Date(lock.at || 0).toDateString() === new Date().toDateString()) {
            setInitialJoinCode(String(lock.code));
            setDedicatedStudentMode({ type: lock.type === "task" ? "task" : "assessment" });
            setCurrentView("exam_join");
            try {
              window.history.replaceState({}, document.title, window.location.pathname + `?${lock.type === "task" ? "task" : "assessment"}=${encodeURIComponent(lock.code)}`);
            } catch (e) {}
            return;
          }
        } catch (e) {}
      }

      // 2. Check hash routes: #task=CODE, #assessment=CODE, #join=CODE
      const hash = window.location.hash;
      if (hash.startsWith("#task=")) {
        const code = hash.replace("#task=", "").trim();
        if (code) {
          setInitialJoinCode(code.toUpperCase());
          setDedicatedStudentMode({ type: "task" });
          setCurrentView("exam_join");
        }
      } else if (hash.startsWith("#assessment=")) {
        const code = hash.replace("#assessment=", "").trim();
        if (code) {
          setInitialJoinCode(code.toUpperCase());
          setDedicatedStudentMode({ type: "assessment" });
          setCurrentView("exam_join");
        }
      } else if (hash.startsWith("#join=")) {
        const code = hash.replace("#join=", "").trim();
        if (code) {
          setInitialJoinCode(code.toUpperCase());
          setDedicatedStudentMode({ type: "assessment" });
          setCurrentView("exam_join");
        }
      } else if (hash === "#teacher" || hash === "#staff" || urlParams.has("teacher")) {
        setCurrentView("teacher");
      }
    };

    // (The old Ctrl+Shift+T / Alt+T teacher shortcut was removed: teachers use the ?teacher address.)
    const handleKeyDown = (_e: KeyboardEvent) => {};

    parseUrlRoute();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("hashchange", parseUrlRoute);
    window.addEventListener("popstate", parseUrlRoute);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("hashchange", parseUrlRoute);
      window.removeEventListener("popstate", parseUrlRoute);
    };
  }, []);

  // Save custom questions added or edited by teacher to bank, server, and Firestore
  const handleQuestionAdded = (newTask: IGCSETask) => {
    // Realtime sync to Firestore so all other teacher and student devices get it immediately
    syncCustomQuestionToFirestore(newTask).catch(() => {});

    // Persist to server
    teacherFetch("/api/custom-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    }).catch((e) => console.warn("Failed to persist custom question:", e));

    setUnits((prevUnits) => {
      const targetUnitCode = newTask.unit || "U99";
      let unitExists = prevUnits.some((u) => u.code === targetUnitCode);

      let updatedUnits: IGCSEUnit[];
      if (unitExists) {
        updatedUnits = prevUnits.map((u) => {
          if (u.code === targetUnitCode) {
            const exists = u.tasks.some((t) => t.id === newTask.id);
            return {
              ...u,
              tasks: exists
                ? u.tasks.map((t) => (t.id === newTask.id ? newTask : t))
                : [newTask, ...u.tasks],
            };
          }
          return u;
        });
      } else {
        const newUnit: IGCSEUnit = {
          code: targetUnitCode,
          title: newTask.unitName || (targetUnitCode === "U99" ? "Teacher Added Questions" : "Custom Unit"),
          tasks: [newTask],
        };
        updatedUnits = [...prevUnits, newUnit];
      }

      try {
        const rawLocal = localStorage.getItem("edexcel_local_custom_questions");
        const existing: IGCSETask[] = rawLocal ? JSON.parse(rawLocal) : [];
        const nextList = Array.isArray(existing) ? existing.filter((q) => q.id !== newTask.id) : [];
        nextList.push(newTask);
        localStorage.setItem("edexcel_local_custom_questions", JSON.stringify(nextList));
      } catch (e) {}
      return updatedUnits;
    });
  };

  const handleQuestionsBatchAdded = (newTasks: IGCSETask[]) => {
    if (!newTasks || newTasks.length === 0) return;
    // Sync batch questions to Firestore for other devices
    for (const t of newTasks) {
      syncCustomQuestionToFirestore(t).catch(() => {});
    }

    teacherFetch("/api/custom-questions/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: newTasks }),
    }).catch((e) => console.warn("Failed to persist batch custom questions:", e));

    setUnits((prevUnits) => {
      let updatedUnits = [...prevUnits];
      for (const newTask of newTasks) {
        const targetUnitCode = newTask.unit || "U99";
        const unitIdx = updatedUnits.findIndex((u) => u.code === targetUnitCode);
        if (unitIdx >= 0) {
          const targetUnit = updatedUnits[unitIdx];
          const exists = targetUnit.tasks.some((t) => t.id === newTask.id);
          updatedUnits[unitIdx] = {
            ...targetUnit,
            tasks: exists
              ? targetUnit.tasks.map((t) => (t.id === newTask.id ? newTask : t))
              : [newTask, ...targetUnit.tasks],
          };
        } else {
          updatedUnits.push({
            code: targetUnitCode,
            title: newTask.unitName || (targetUnitCode === "U99" ? "Teacher Added Questions" : "Past Paper Questions"),
            tasks: [newTask],
          });
        }
      }
      try {
        const rawLocal = localStorage.getItem("edexcel_local_custom_questions");
        const existing: IGCSETask[] = rawLocal ? JSON.parse(rawLocal) : [];
        const map = new Map<string, IGCSETask>();
        if (Array.isArray(existing)) {
          for (const q of existing) map.set(q.id, q);
        }
        for (const t of newTasks) map.set(t.id, t);
        localStorage.setItem("edexcel_local_custom_questions", JSON.stringify(Array.from(map.values())));
      } catch (e) {}
      return updatedUnits;
    });
  };

  const handleJoinExam = (assessment: Assessment, studentSession: StudentSession) => {
    // If assessment contains custom/edited full questions, register them into student's question pool
    if (assessment.questions && assessment.questions.length > 0) {
      setUnits((prevUnits) => {
        let updated = [...prevUnits];
        for (const task of assessment.questions!) {
          const targetUnitCode = task.unit || "U99";
          const unitIdx = updated.findIndex((u) => u.code === targetUnitCode);
          if (unitIdx >= 0) {
            const u = updated[unitIdx];
            const exists = u.tasks.some((t) => t.id === task.id);
            updated[unitIdx] = {
              ...u,
              tasks: exists
                ? u.tasks.map((t) => (t.id === task.id ? task : t))
                : [...u.tasks, task],
            };
          } else {
            updated.push({
              code: targetUnitCode,
              title: task.unitName || "Assessment Questions",
              tasks: [task],
            });
          }
        }
        return updated;
      });
    }

    setActiveAssessment(assessment);
    setCurrentStudentSession(studentSession);
    // Formal assessment in progress: keep this browser on it until it is submitted
    try {
      // Stays for the rest of the day, also after submitting, so the student cannot reach the
      // main site (Practice) from this browser. A teacher signing in here (?teacher) clears it.
      const prev = readExamLock();
      setExamLock(assessment.code, prev && prev.code === assessment.code ? prev.type : assessment.type === "task" ? "task" : "assessment");
    } catch (e) {}
    setDedicatedStudentMode({
      type: assessment.type === "task" ? "task" : "assessment",
      title: assessment.title,
    });

    // If student has already submitted this assessment previously, restore their submission screen
    if (studentSession?.status === "submitted") {
      setExamResult({
        marks: studentSession.marks || {},
        totalMarks: studentSession.totalMarks || 0,
        maxMarks: studentSession.maxMarks || assessment.maxMarks || 25,
        percentage: studentSession.percentage || 0,
        answers: studentSession.answers || {},
        detailedResults: {},
      });
    } else {
      setExamResult(null);
    }
    setCurrentView("exam_active");
  };

  const handleFinishExam = (result: {
    marks: Record<string, number>;
    totalMarks: number;
    maxMarks: number;
    percentage: number;
    answers: Record<string, any>;
    detailedResults: Record<string, MarkResult>;
  }) => {
    setExamResult(result);
  };

  const handleLockTeacherMode = () => {
    try {
      teacherLogout();
    } catch (e) {}
    setIsTeacherAuthenticated(false);
    setCurrentView("teacher");
  };

  const performExitExam = (targetView: AppView = "exam_join") => {
    // 1. Force logout teacher so student computer can NEVER access teacher screen
    try {
      teacherLogout();
    } catch (e) {}
    setIsTeacherAuthenticated(false);

    // 2. Clear any active student session in localStorage
    try {
      localStorage.removeItem("active_student_session");
    } catch (e) {}

    // 3. Clear modal & candidate state
    setShowExitConfirmModal(false);
    setPendingTargetView(null);

    // Keep student containment active: preserve assessment code and mode
    const currentCode = initialJoinCode || activeAssessment?.code || "";
    const modeType = dedicatedStudentMode?.type || activeAssessment?.type || "assessment";
    setDedicatedStudentMode({ type: modeType, title: activeAssessment?.title });
    if (currentCode) {
      setInitialJoinCode(currentCode);
    }
    setActiveAssessment(null);
    setCurrentStudentSession(null);
    setExamResult(null);

    // 4. Set session exited banner
    setSessionExitedMessage("Assessment session completed. Your answers were safely recorded and submitted to your teacher. Workstation session is closed.");

    // 5. Always return to student join page for this assessment (never project homepage or teacher portal)
    setCurrentView("exam_join");

    // 6. Restore the teacher's link in URL so student remains on their assessment home page
    try {
      const searchParam = currentCode ? `?${modeType}=${encodeURIComponent(currentCode)}` : "";
      window.history.replaceState({}, document.title, window.location.pathname + searchParam);
    } catch (e) {}
  };

  const handleExitDedicatedStudentMode = () => {
    // If the student has already submitted (examResult is populated) or not in active exam:
    // Exit immediately with zero confirmation dialog!
    if (examResult || currentView !== "exam_active") {
      performExitExam("exam_join");
      return;
    }

    // Active exam in progress (unsubmitted): show in-app confirmation modal (never window.confirm)
    setPendingTargetView("exam_join");
    setShowExitConfirmModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-purple-200">
      <Header
        currentView={currentView}
        onViewChange={(v) => {
          // If in dedicated student assessment mode, students cannot navigate to practice or teacher portal
          if (dedicatedStudentMode && v !== "exam_join") {
            return;
          }
          if (currentView === "exam_active" && !examResult) {
            setPendingTargetView(v === "teacher" ? "exam_join" : v);
            setShowExitConfirmModal(true);
            return;
          }
          if (currentView === "exam_active" && examResult) {
            performExitExam("exam_join");
            return;
          }
          setCurrentView(v);
        }}
        activeExamCount={1}
        isExamInProgress={currentView === "exam_active" && !examResult}
        isExamFinished={currentView === "exam_active" && !!examResult}
        studentName={currentStudentSession?.name}
        className={currentStudentSession?.className}
        activeAssessment={activeAssessment}
        onOpenSpecGuide={() => setIsSpecModalOpen(true)}
        onOpenHelpGuide={() => setIsHelpModalOpen(true)}
        isTeacherAuthenticated={isTeacherAuthenticated}
        onTeacherLogout={handleLockTeacherMode}
        dedicatedStudentMode={dedicatedStudentMode}
        onExitDedicatedMode={handleExitDedicatedStudentMode}
      />

      <SpecificationReferenceModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
      />

      <AppFeatureHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onNavigateToView={(view) => setCurrentView(view)}
        onOpenSpecGuide={() => setIsSpecModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: Practice Mode (Only available when NOT in dedicated student assignment mode) */}
        {currentView === "practice" && !dedicatedStudentMode && !practiceOpen && !isTeacherAuthenticated && (
          <div className="max-w-xl mx-auto mt-16 bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Practice is closed right now</h2>
            <p className="text-sm text-slate-600">
              Your teacher has closed the practice area. If you have been given an assessment code or link, use it to join.
            </p>
            <button
              type="button"
              onClick={() => setCurrentView("exam_join")}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold"
            >
              Join with a code
            </button>
          </div>
        )}
        {currentView === "practice" && !dedicatedStudentMode && (practiceOpen || isTeacherAuthenticated) && (
          <PracticeMode
            units={isTeacherAuthenticated ? units : practiceUnits}
            allTasks={isTeacherAuthenticated ? allTasks : practiceTasks}
            onOpenHelpGuide={() => setIsHelpModalOpen(true)}
            allowCopyPaste={allowPracticeCopyPaste}
          />
        )}

        {/* VIEW 2: Teacher Dashboard (Strictly protected by Teacher Authentication Gate) */}
        {currentView === "teacher" && !dedicatedStudentMode && (
          <>
            {isTeacherAuthenticated ? (
              <TeacherDashboard
                units={units}
                allTasks={allTasks}
                onQuestionAdded={handleQuestionAdded}
                onQuestionsBatchAdded={handleQuestionsBatchAdded}
                onLockTeacherMode={handleLockTeacherMode}
                onOpenHelpGuide={() => setIsHelpModalOpen(true)}
                allowPracticeCopyPaste={allowPracticeCopyPaste}
                onTogglePracticeCopyPaste={handleTogglePracticeCopyPaste}
                practiceOpen={practiceOpen}
                onTogglePracticeOpen={handleTogglePracticeOpen}
              />
            ) : (
              <TeacherAuthGate
                onAuthenticated={() => {
                  // A teacher signed in on this computer: it is no longer locked to a student's assessment
                  clearExamLock();
                  setIsTeacherAuthenticated(true);
                }}
                onCancel={() => setCurrentView("practice")}
              />
            )}
          </>
        )}

        {/* VIEW 3: Student Task / Exam Join */}
        {(currentView === "exam_join" || (dedicatedStudentMode && currentView !== "exam_active")) && (
          <StudentSignIn
            initialCode={initialJoinCode}
            initialMode={dedicatedStudentMode?.type || "assessment"}
            onJoinExam={(assessment, studentSession) => {
              setSessionExitedMessage(null);
              handleJoinExam(assessment, studentSession);
            }}
            onOpenHelpGuide={() => setIsHelpModalOpen(true)}
            sessionExitedMessage={sessionExitedMessage}
            onClearSessionExitedMessage={() => setSessionExitedMessage(null)}
          />
        )}

        {/* VIEW 4: Active Task / Exam Session - Dedicated single view */}
        {currentView === "exam_active" && activeAssessment && currentStudentSession && (
          <>
            {examResult ? (
              /* Student Submission Screen - task score vs confidential formal assessment */
              <StudentSubmissionConfirmation
                assessment={activeAssessment}
                studentId={currentStudentSession.studentId}
                studentName={currentStudentSession.name}
                candidateNumber={currentStudentSession.candidateNumber}
                className={currentStudentSession.className}
                submittedAt={Date.now()}
                questionCount={activeAssessment.questionIds?.length || 0}
                result={examResult}
                allTasks={allTasks}
                onReturnToHome={handleExitDedicatedStudentMode}
              />
            ) : (
              <ExamSession
                assessment={activeAssessment}
                studentSession={currentStudentSession}
                allTasks={allTasks}
                onFinishExam={handleFinishExam}
              />
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>
            Pearson Edexcel International GCSE (9–1) in Computer Science (4CP0) • {Object.keys(allTasks).length} Questions Repository
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-slate-400">
              Official 4CP0 Specification Alignment & 9–1 Grading
            </span>
          </div>
        </div>
      </footer>

      {/* In-app Exit Assessment Confirmation Modal (replaces browser confirm) */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Exit Active Assessment?</h3>
                <p className="text-xs text-slate-500">
                  {dedicatedStudentMode?.type === "task" ? "Practice Task" : "Formal Examination"} in progress
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              You have not submitted your assessment yet. If you exit now, your current responses will not be recorded. Are you sure you want to leave?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                id="continue-exam-btn"
                type="button"
                onClick={() => {
                  setShowExitConfirmModal(false);
                  setPendingTargetView(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Continue Assessment
              </button>
              <button
                id="confirm-exit-exam-btn"
                type="button"
                onClick={() => performExitExam(pendingTargetView || "exam_join")}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-600/20 transition-colors cursor-pointer"
              >
                Exit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
