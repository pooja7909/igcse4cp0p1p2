// Learning Hub: teacher classes with join links, lesson assignments with start/due dates,
// and student progress (steps, practice, quizzes, stamps, timestamps).
import type express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { LEARN_LESSON_MAP } from "./src/data/learnLessons.js";

export const learnClassesDb: Record<string, any> = {};
export const learnProgressDb: Record<string, any> = {}; // key: `${classId}::${studentId}`

let dataFile = "";

export function loadLearnData(dataDir: string) {
  dataFile = path.join(dataDir, "learn_db.json");
  try {
    if (fs.existsSync(dataFile)) {
      const d = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
      Object.assign(learnClassesDb, d.classes || {});
      Object.assign(learnProgressDb, d.progress || {});
    }
  } catch (e) {
    console.warn("Could not load learning hub data:", e);
  }
}

export function saveLearnData() {
  if (!dataFile) return;
  try {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify({ classes: learnClassesDb, progress: learnProgressDb }));
  } catch (e) {
    console.warn("Could not save learning hub data:", e);
  }
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newCode(): string {
  for (;;) {
    let c = "L";
    for (let i = 0; i < 5; i++) c += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
    if (!Object.values(learnClassesDb).some((x: any) => x.code === c)) return c;
  }
}

function findClassByCode(code: string): any | null {
  const c = String(code || "").trim().toUpperCase();
  return Object.values(learnClassesDb).find((x: any) => x && x.code === c) || null;
}

const today = () => new Date().toISOString().slice(0, 10);
// One day of leeway either side so time zones never lock a student out early
function dateAddDays(d: string, n: number) {
  const t = new Date(d + "T00:00:00Z").getTime() + n * 86400000;
  return new Date(t).toISOString().slice(0, 10);
}

function publicClass(c: any) {
  return {
    id: c.id,
    code: c.code,
    name: c.name,
    open: c.open !== false,
    allowQuizRetakes: c.allowQuizRetakes !== false,
    assignments: c.assignments || {},
    // Teacher resources shared with this class, in the order students see them (resourcesServer.ts)
    resourceIds: Array.isArray(c.resourceIds) ? c.resourceIds : [],
    ownerName: c.ownerName,
  };
}

function lessonTotals(lessonId: string) {
  const L: any = (LEARN_LESSON_MAP as any)[lessonId];
  if (!L) return null;
  const n = L.practice.length;
  return {
    steps: L.steps.length,
    practiceIds: L.practice.map((p: any) => p.id),
    // 🛠️ stamp: 80% of the practice questions right (all of them if there are only a few)
    practiceTarget: n <= 3 ? n : Math.ceil(n * 0.8),
    quizMax: Math.min(L.quizDraw || 10, L.quiz.length),
  };
}

function blankLesson(totalSteps: number) {
  return { stepReached: 0, totalSteps, practice: {}, stamps: {} };
}

function addEvent(s: any, lessonId: string, kind: string, detail?: string) {
  s.events = Array.isArray(s.events) ? s.events : [];
  s.events.push({ t: Date.now(), lessonId, kind, ...(detail ? { detail } : {}) });
  if (s.events.length > 400) s.events = s.events.slice(-400);
}

function awardStamps(s: any, c: any, lessonId: string) {
  const lp = s.lessons[lessonId];
  const tot = lessonTotals(lessonId);
  if (!lp || !tot) return;
  const now = Date.now();
  const give = (k: string, label: string) => {
    if (!lp.stamps[k]) {
      lp.stamps[k] = now;
      addEvent(s, lessonId, "stamp", label);
    }
  };
  if (lp.learnedAt) give("learned", "📘 Learned");
  const solved = tot.practiceIds.filter((id: string) => lp.practice[id]).length;
  if (tot.practiceIds.length && solved >= tot.practiceTarget) {
    if (!lp.practicedAt) lp.practicedAt = now;
    give("practised", "🛠️ Practised");
  }
  if (lp.quiz && lp.quiz.max && lp.quiz.best / lp.quiz.max >= 0.6) give("quiz", "⭐ Quiz passed");
  // Mastery: practice target reached AND full marks in the quiz
  if (lp.stamps.practised && lp.quiz && lp.quiz.max && lp.quiz.best === lp.quiz.max) give("mastery", "🏆 Mastery");
  const a = (c.assignments || {})[lessonId];
  if (a && a.due && lp.stamps.learned && lp.stamps.quiz && !lp.stamps.ontime) {
    const doneDay = new Date(Math.max(lp.stamps.learned, lp.stamps.quiz)).toISOString().slice(0, 10);
    if (doneDay <= dateAddDays(a.due, 1)) give("ontime", "⏰ On time");
  }
}

function cleanName(n: any) {
  return String(n || "").replace(/\s+/g, " ").trim().slice(0, 60);
}

/** Learn requests that refer to a class or student this server copy has not seen need fresh data. */
export function learnNeedsFresh(req: express.Request): boolean {
  // Saving progress always works on the newest copy, so two quick saves never undo each other
  if (req.method !== "GET") return true;
  const m = req.path.match(/^\/learn\/c\/([^/]+)/);
  if (!m) return /^\/learn\//.test(req.path);
  const c = findClassByCode(decodeURIComponent(m[1]));
  if (!c) return true;
  const sid = req.body?.studentId || (req.query as any)?.sid;
  if (sid && !learnProgressDb[`${c.id}::${sid}`]) return true;
  return false;
}

export function registerLearnRoutes(
  app: express.Express,
  deps: {
    requireTeacher: express.RequestHandler;
    runPythonTests: (code: string, inputsList: string[][], files?: Record<string, string>) => Promise<Array<{ out: string; err: string | null }> | null>;
    defaultFiles?: Record<string, string>;
  }
) {
  const { requireTeacher } = deps;

  // ---------------- Teacher ----------------
  app.get("/api/learn/classes", requireTeacher, (req, res) => {
    const classes = Object.values(learnClassesDb).map((c: any) => {
      const students = Object.values(learnProgressDb).filter((s: any) => s && s.classId === c.id);
      return {
        ...publicClass(c),
        ownerId: c.ownerId,
        createdAt: c.createdAt,
        studentCount: students.length,
        lastActiveAt: students.reduce((m: number, s: any) => Math.max(m, s.lastActiveAt || 0), 0),
      };
    });
    classes.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json({ classes });
  });

  app.post("/api/learn/classes", requireTeacher, (req, res) => {
    const name = cleanName(req.body?.name);
    if (!name) {
      res.status(400).json({ error: "Please give the class a name." });
      return;
    }
    const teacher = (req as any).teacher;
    const id = "lc_" + Date.now().toString(36) + crypto.randomBytes(3).toString("hex");
    const c = {
      id,
      code: newCode(),
      name,
      ownerId: teacher?.id || "t_primary",
      ownerName: teacher?.name || "",
      createdAt: Date.now(),
      open: true,
      allowQuizRetakes: true,
      assignments: {},
    };
    learnClassesDb[id] = c;
    saveLearnData();
    res.json({ class: { ...publicClass(c), ownerId: c.ownerId, createdAt: c.createdAt, studentCount: 0 } });
  });

  app.put("/api/learn/classes/:id", requireTeacher, (req, res) => {
    const c = learnClassesDb[req.params.id];
    if (!c) {
      res.status(404).json({ error: "Class not found" });
      return;
    }
    const b = req.body || {};
    if (b.name !== undefined) {
      const name = cleanName(b.name);
      if (!name) {
        res.status(400).json({ error: "Please give the class a name." });
        return;
      }
      if (String(b.name).trim().length > 60) {
        res.status(400).json({ error: "Class names can be at most 60 characters." });
        return;
      }
      c.name = name;
    }
    if (b.open !== undefined) c.open = Boolean(b.open);
    if (b.allowQuizRetakes !== undefined) c.allowQuizRetakes = Boolean(b.allowQuizRetakes);
    if (b.assignments && typeof b.assignments === "object") {
      const next: Record<string, any> = {};
      for (const [lessonId, a] of Object.entries<any>(b.assignments)) {
        if (!(LEARN_LESSON_MAP as any)[lessonId]) continue;
        const start = /^\d{4}-\d{2}-\d{2}$/.test(a?.start) ? a.start : today();
        const due = /^\d{4}-\d{2}-\d{2}$/.test(a?.due) ? a.due : start;
        next[lessonId] = { lessonId, start, due: due < start ? start : due, assignedAt: c.assignments?.[lessonId]?.assignedAt || Date.now() };
      }
      c.assignments = next;
    }
    saveLearnData();
    res.json({ class: { ...publicClass(c), ownerId: c.ownerId, createdAt: c.createdAt } });
  });

  app.delete("/api/learn/classes/:id", requireTeacher, (req, res) => {
    const c = learnClassesDb[req.params.id];
    if (!c) {
      res.status(404).json({ error: "Class not found" });
      return;
    }
    for (const k of Object.keys(learnProgressDb)) if (k.startsWith(c.id + "::")) delete learnProgressDb[k];
    delete learnClassesDb[c.id];
    saveLearnData();
    res.json({ success: true });
  });

  app.get("/api/learn/classes/:id/progress", requireTeacher, (req, res) => {
    const c = learnClassesDb[req.params.id];
    if (!c) {
      res.status(404).json({ error: "Class not found" });
      return;
    }
    const students = Object.values(learnProgressDb)
      .filter((s: any) => s && s.classId === c.id)
      .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)));
    res.json({ class: publicClass(c), students });
  });

  app.delete("/api/learn/classes/:id/students/:sid", requireTeacher, (req, res) => {
    const key = `${req.params.id}::${req.params.sid}`;
    if (!learnProgressDb[key]) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    delete learnProgressDb[key];
    saveLearnData();
    res.json({ success: true });
  });

  app.post("/api/learn/classes/:id/students/:sid/reset", requireTeacher, (req, res) => {
    const s = learnProgressDb[`${req.params.id}::${req.params.sid}`];
    const lessonId = String(req.body?.lessonId || "");
    if (!s || !s.lessons?.[lessonId]) {
      res.status(404).json({ error: "Nothing to reset" });
      return;
    }
    delete s.lessons[lessonId];
    addEvent(s, lessonId, "reset", "Teacher reset this lesson");
    saveLearnData();
    res.json({ success: true, student: s });
  });

  // ---------------- Students ----------------
  app.get("/api/learn/c/:code", (req, res) => {
    const c = findClassByCode(req.params.code);
    if (!c) {
      res.status(404).json({ error: "This class link is not valid. Please check it with your teacher." });
      return;
    }
    res.json({ class: publicClass(c), today: today() });
  });

  app.post("/api/learn/c/:code/join", (req, res) => {
    const c = findClassByCode(req.params.code);
    if (!c) {
      res.status(404).json({ error: "This class link is not valid." });
      return;
    }
    const name = cleanName(req.body?.name);
    const existingId = String(req.body?.studentId || "");
    if (existingId && learnProgressDb[`${c.id}::${existingId}`]) {
      res.json({ student: learnProgressDb[`${c.id}::${existingId}`], class: publicClass(c), today: today() });
      return;
    }
    if (!name || name.length < 2) {
      res.status(400).json({ error: "Please type your full name." });
      return;
    }
    if (c.open === false) {
      res.status(403).json({ error: "Your teacher has closed this class to new students." });
      return;
    }
    // Same name in the same class = the same student on another device
    const same = Object.values(learnProgressDb).find(
      (s: any) => s && s.classId === c.id && String(s.name).toLowerCase() === name.toLowerCase()
    );
    if (same) {
      res.json({ student: same, class: publicClass(c), today: today() });
      return;
    }
    const sid = "ls_" + Date.now().toString(36) + crypto.randomBytes(3).toString("hex");
    const s = { classId: c.id, studentId: sid, name, joinedAt: Date.now(), lastActiveAt: Date.now(), lessons: {}, events: [] };
    addEvent(s, "", "joined", "Joined the class");
    learnProgressDb[`${c.id}::${sid}`] = s;
    saveLearnData();
    res.json({ student: s, class: publicClass(c), today: today() });
  });

  app.get("/api/learn/c/:code/me", (req, res) => {
    const c = findClassByCode(req.params.code);
    const s = c && learnProgressDb[`${c.id}::${String((req.query as any).sid || "")}`];
    if (!c || !s) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ student: s, class: publicClass(c), today: today() });
  });

  app.post("/api/learn/c/:code/progress", (req, res) => {
    const c = findClassByCode(req.params.code);
    const b = req.body || {};
    const s = c && learnProgressDb[`${c.id}::${String(b.studentId || "")}`];
    if (!c || !s) {
      res.status(404).json({ error: "Please join the class again." });
      return;
    }
    const lessonId = String(b.lessonId || "");
    const a = (c.assignments || {})[lessonId];
    const tot = lessonTotals(lessonId);
    if (!a || !tot) {
      res.status(403).json({ error: "This lesson has not been set for your class." });
      return;
    }
    if (today() < dateAddDays(a.start, -1)) {
      res.status(403).json({ error: `This lesson opens on ${a.start}.` });
      return;
    }
    s.lessons = s.lessons || {};
    if (!s.lessons[lessonId]) s.lessons[lessonId] = blankLesson(tot.steps);
    const lp = s.lessons[lessonId];
    lp.totalSteps = tot.steps;
    const now = Date.now();
    if (!lp.startedAt) {
      lp.startedAt = now;
      addEvent(s, lessonId, "started", "Started the lesson");
    }
    const kind = String(b.kind || "");
    if (kind === "step") {
      const step = Math.max(0, Math.min(tot.steps - 1, Number(b.step) || 0));
      if (step > (lp.stepReached || 0)) lp.stepReached = step;
    } else if (kind === "learned") {
      lp.stepReached = tot.steps - 1;
      if (!lp.learnedAt) {
        lp.learnedAt = now;
        addEvent(s, lessonId, "learned", "Finished the learning steps");
      }
    } else if (kind === "practice") {
      const pid = String(b.practiceId || "");
      if (tot.practiceIds.includes(pid)) {
        const prev = lp.practice[pid];
        lp.practice[pid] = { doneAt: prev?.doneAt || now, attempts: Math.max(1, Number(b.attempts) || 1) };
        if (!prev) addEvent(s, lessonId, "practice", `Practice solved: ${pid}`);
      }
    } else if (kind === "quiz") {
      const max = tot.quizMax;
      const score = Math.max(0, Math.min(max, Math.round(Number(b.score) || 0)));
      const q = lp.quiz || { best: 0, max, attempts: 0, lastAt: 0, history: [] };
      if (q.attempts > 0 && c.allowQuizRetakes === false) {
        res.status(403).json({ error: "Your teacher allows only one attempt at this quiz.", student: s });
        return;
      }
      q.attempts += 1;
      q.max = max;
      q.best = Math.max(q.best || 0, score);
      q.lastAt = now;
      q.history = [...(q.history || []), { score, max, at: now }].slice(-20);
      lp.quiz = q;
      addEvent(s, lessonId, "quiz", `Quiz ${score}/${max} (attempt ${q.attempts})`);
    } else {
      res.status(400).json({ error: "Unknown progress type" });
      return;
    }
    s.lastActiveAt = now;
    awardStamps(s, c, lessonId);
    saveLearnData();
    res.json({ student: s });
  });

  // Run a student's practice code on the server when the browser can't (no Python engine)
  app.post("/api/learn/run", async (req, res) => {
    const code = String(req.body?.code || "");
    const inputsList: string[][] = Array.isArray(req.body?.inputsList) ? req.body.inputsList.slice(0, 6) : [[]];
    const files = req.body?.files && typeof req.body.files === "object" ? req.body.files : undefined;
    if (!code.trim() || code.length > 8000) {
      res.status(400).json({ error: "No code to run." });
      return;
    }
    const results = await deps.runPythonTests(code, inputsList.map((x) => (Array.isArray(x) ? x.map(String) : [])), {
      ...(deps.defaultFiles || {}),
      ...(files || {}),
    });
    if (!results) {
      res.status(503).json({ error: "Python is not available on the server right now." });
      return;
    }
    res.json({ results });
  });
}
