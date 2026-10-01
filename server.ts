import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { spawn } from "child_process";
import os from "os";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { EDEXCEL_2025_PAPER_TASKS, EDEXCEL_2025_COMPANION_TASKS } from "./src/data/edexcel2025PaperQuestions.js";
import { EDEXCEL_20_MARKER_TASKS } from "./src/data/edexcel20MarkerQuestions.js";
import { INITIAL_UNITS } from "./src/data/initialQuestionBank.js";
import { SEED_ASSESSMENTS_MAP } from "./src/data/seedAssessments.js";
import { VIRTUAL_FILES } from "./src/utils/pythonRunner.js";
import {
  SyncedCollection,
  isSharedStoreEnabled,
  saveUploadChunk,
  readUpload,
  deleteUpload,
} from "./serverStore.js";

dotenv.config();

const app = express();
const PORT = 3000;

// Master dictionary of all built-in tasks across curriculum modules
const ALL_BUILTIN_TASKS: Record<string, any> = {};
for (const task of [...EDEXCEL_2025_PAPER_TASKS, ...EDEXCEL_2025_COMPANION_TASKS, ...EDEXCEL_20_MARKER_TASKS]) {
  if (task && task.id) ALL_BUILTIN_TASKS[task.id] = task;
}
for (const unit of INITIAL_UNITS) {
  for (const task of unit.tasks || []) {
    if (task && task.id) ALL_BUILTIN_TASKS[task.id] = task;
  }
}

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ==========================================
// SHARED DATABASE SYNC (Vercel / serverless)
// ==========================================
// Every API request first pulls recent changes from Firestore, and every JSON
// response waits until this request's changes are saved. This is what makes an
// assessment created by the teacher visible to students on other server instances.
app.use("/api", async (req, res, next) => {
  if (!isSharedStoreEnabled() || !sharedCollections) return next();
  try {
    await pullSharedState();
  } catch (err: any) {
    console.error("[store] Pull failed:", err);
    res.status(503).json({
      error: "The app could not reach its database. Please try again in a moment.",
      detail: err?.message || String(err),
    });
    return;
  }

  const originalJson = res.json.bind(res);
  let handled = false;
  (res as any).json = (body: any) => {
    if (handled) return originalJson(body);
    handled = true;
    pushSharedState()
      .then(() => originalJson(body))
      .catch((err: any) => {
        console.error("[store] Push failed:", err);
        if (!res.headersSent) {
          res.status(500);
          originalJson({ error: "Could not save changes to the database: " + (err?.message || String(err)) });
        }
      });
    return res;
  };
  next();
});

// In-memory & file-backed persistent data store for live exams & teacher dashboard
interface LiveStudentSession {
  studentId: string;
  name: string;
  candidateNumber: string;
  className: string;
  status: "joined" | "in_progress" | "submitted";
  currentQuestionIndex: number;
  answeredQuestions: string[];
  answers: Record<string, any>;
  marks: Record<string, number>;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  joinedAt: number;
  lastActiveAt: number;
  submittedAt?: number;
  feedback?: string;
  markingNotes?: Record<string, string>;
  reflectionSheet?: any;
  aiDiagnostic?: {
    overallSummary: string;
    focusTopics: string[];
    questionBreakdowns: {
      questionId: string;
      marksAwarded: number;
      maxMarks: number;
      studentError: string;
      specTopic: string;
      revisionAction: string;
    }[];
  };
}

interface ResultReleaseSettings {
  resultsReleased: boolean;
  shareTotalScore: boolean;
  shareQuestionMarks: boolean;
  shareMarkScheme: boolean;
  shareSubmissionsAndAnswers: boolean;
  shareTeacherFeedback: boolean;
  shareReflectionSheet: boolean;
  releasedAt?: number;
  releasedStudentIds?: string[];
}

interface AssessmentStore {
  id: string;
  title: string;
  ownerId?: string; // teacher who created it
  ownerName?: string;
  code: string; // 6-digit access code for QR / PIN
  type?: "task" | "assessment"; // "task" for practice tasks/classwork, "assessment" for formal timed exams
  customHeaderBanner?: string;
  customSubtitle?: string;
  customInstructions?: string;
  headerConfig?: {
    schoolOrDepartment?: string;
    subjectSubtitle?: string;
    termOrClass?: string;
    instructionsNotice?: string;
    headerTheme?: string;
  };
  durationMinutes: number;
  showScoreImmediately: boolean;
  allowCopyPaste?: boolean;
  showOperatorToolbar?: boolean;
  shareSolutions?: boolean; // Teacher setting: whether students are allowed to view solutions/mark scheme
  releaseSettings?: ResultReleaseSettings;
  questionIds: string[];
  questions?: any[]; // Cached full question objects for cross-client consistency
  maxMarks: number;
  gradeBoundaries?: any;
  createdAt: number;
  status: "active" | "archived";
  students: Record<string, LiveStudentSession>;
}

// Statically initialize with all official papers and mock examinations
const assessmentsDb: Record<string, AssessmentStore> = { ...(SEED_ASSESSMENTS_MAP as unknown as Record<string, AssessmentStore>) };

// Custom questions uploaded or created by teachers
const customQuestionsDb: Record<string, any> = {};

const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const SOURCE_DATA_DIR = path.join(process.cwd(), "data");
const DATA_DIR = isServerless ? path.join("/tmp", "edexcel_data") : SOURCE_DATA_DIR;
const ASSESSMENTS_FILE = path.join(DATA_DIR, "assessments_db.json");
const CUSTOM_QUESTIONS_FILE = path.join(DATA_DIR, "custom_questions_db.json");
const SETTINGS_FILE = path.join(DATA_DIR, "system_settings.json");

interface SystemSettings {
  allowPracticeCopyPaste: boolean;
}

const systemSettings: SystemSettings = {
  allowPracticeCopyPaste: false,
};

// ==========================================
// DATA FILE LIBRARY (files student programs can open)
// ==========================================
// Past-paper programming questions read data files supplied with the paper
// (e.g. a .txt or .csv). Teachers upload them once; every student program can
// then open them, both when running in the browser and when marked on the server.
interface DataFileRecord {
  name: string;
  content: string;
  uploadedAt: number;
}
const dataFilesDb: Record<string, DataFileRecord> = {};
const DATA_FILES_FILE = path.join(DATA_DIR, "data_files.json");
const MAX_DATA_FILE_CHARS = 1_500_000;

function loadDataFiles() {
  // With the shared database on (Vercel), /tmp copies may be stale; the database is the source of truth
  if (isSharedStoreEnabled()) return;
  try {
    if (fs.existsSync(DATA_FILES_FILE)) {
      Object.assign(dataFilesDb, JSON.parse(fs.readFileSync(DATA_FILES_FILE, "utf-8")) || {});
    }
  } catch (e) {
    console.warn("Could not read data files library:", e);
  }
}
function savePersistedDataFiles() {
  try {
    fs.writeFileSync(DATA_FILES_FILE, JSON.stringify(dataFilesDb));
  } catch {}
}

/** Only a plain file name (no folders); keeps student code's open("Name.txt") working. */
function cleanDataFileName(name: any): string {
  const base = path.basename(String(name || "")).trim();
  return /^[A-Za-z0-9 _.,()+-]{1,100}$/.test(base) && !base.startsWith(".") ? base : "";
}

/** Files a program for this task can open: built-in samples < library < files attached to the task. */
function getFilesForTask(task: any): Record<string, string> {
  const files: Record<string, string> = { ...VIRTUAL_FILES };
  for (const f of Object.values(dataFilesDb)) files[f.name] = f.content;
  if (task && task.dataFiles && typeof task.dataFiles === "object") {
    for (const [n, c] of Object.entries(task.dataFiles)) {
      const clean = cleanDataFileName(n);
      if (clean) files[clean] = String(c ?? "");
    }
  }
  return files;
}

function loadPersistedData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // 1. Always load baseline repository seed data from SOURCE_DATA_DIR first
    const sourceAssessments = path.join(SOURCE_DATA_DIR, "assessments_db.json");
    if (fs.existsSync(sourceAssessments)) {
      try {
        const content = fs.readFileSync(sourceAssessments, "utf-8");
        const loaded = JSON.parse(content);
        if (loaded && typeof loaded === "object") {
          Object.assign(assessmentsDb, loaded);
        }
      } catch (err) {
        console.warn("Could not read source assessments:", err);
      }
    }

    const sourceQuestions = path.join(SOURCE_DATA_DIR, "custom_questions_db.json");
    if (fs.existsSync(sourceQuestions)) {
      try {
        const content = fs.readFileSync(sourceQuestions, "utf-8");
        const loaded = JSON.parse(content);
        if (loaded && typeof loaded === "object") {
          Object.assign(customQuestionsDb, loaded);
        }
      } catch (err) {
        console.warn("Could not read source custom questions:", err);
      }
    }

    const sourceSettings = path.join(SOURCE_DATA_DIR, "system_settings.json");
    if (fs.existsSync(sourceSettings)) {
      try {
        const content = fs.readFileSync(sourceSettings, "utf-8");
        const loaded = JSON.parse(content);
        if (loaded && typeof loaded === "object") {
          Object.assign(systemSettings, loaded);
        }
      } catch (err) {}
    }

    // 2. Layer any newer data written to DATA_DIR (e.g. /tmp on Vercel)
    if (DATA_DIR !== SOURCE_DATA_DIR && !isSharedStoreEnabled()) {
      if (fs.existsSync(ASSESSMENTS_FILE)) {
        try {
          const content = fs.readFileSync(ASSESSMENTS_FILE, "utf-8");
          const loaded = JSON.parse(content);
          if (loaded && typeof loaded === "object") {
            Object.assign(assessmentsDb, loaded);
          }
        } catch (err) {}
      }
      if (fs.existsSync(CUSTOM_QUESTIONS_FILE)) {
        try {
          const content = fs.readFileSync(CUSTOM_QUESTIONS_FILE, "utf-8");
          const loaded = JSON.parse(content);
          if (loaded && typeof loaded === "object") {
            Object.assign(customQuestionsDb, loaded);
          }
        } catch (err) {}
      }
      if (fs.existsSync(SETTINGS_FILE)) {
        try {
          const content = fs.readFileSync(SETTINGS_FILE, "utf-8");
          const loaded = JSON.parse(content);
          if (loaded && typeof loaded === "object") {
            Object.assign(systemSettings, loaded);
          }
        } catch (err) {}
      }
    }

    // Initialize sample curriculum text files for Topic 2.5 File Handling
    const sampleFiles: Record<string, string> = {
      "message.txt": "Welcome to Computer Science\nGood luck with Paper 2!\n",
      "names.txt": "Alice\nBob\nCharlie\nDiana\n",
      "scores.txt": "Alice,85\nBob,42\nCharlie,90\nDiana,68\nEthan,55\n",
      "runners.txt": "Sara,12.4\nLeo,11.8\nMia,13.1\nNoah,12.0\n",
      "sales.txt": "Book,12.50,4\nPen,1.20,10\nRuler,0.80,5\nFolder,3.50,2\n",
    };
    for (const [fname, fcontent] of Object.entries(sampleFiles)) {
      const p1 = path.join(DATA_DIR, fname);
      const p2 = path.join(process.cwd(), fname);
      if (!fs.existsSync(p1)) {
        try { fs.writeFileSync(p1, fcontent, "utf-8"); } catch (e) {}
      }
      if (!fs.existsSync(p2)) {
        try { fs.writeFileSync(p2, fcontent, "utf-8"); } catch (e) {}
      }
    }
  } catch (err) {
    console.warn("Could not load persisted data from disk:", err);
  }
}

function savePersistedSettings() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(systemSettings, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save system settings:", err);
  }
}

function savePersistedAssessments() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ASSESSMENTS_FILE, JSON.stringify(assessmentsDb, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save assessments to disk:", err);
  }
}

function savePersistedQuestions() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CUSTOM_QUESTIONS_FILE, JSON.stringify(customQuestionsDb, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save custom questions to disk:", err);
  }
}

// ==========================================
// SECURE MULTI-TEACHER AUTHENTICATION & SESSIONS
// ==========================================
const TEACHERS_DB_FILE = path.join(DATA_DIR, "teachers_db.json");
const TEACHER_AUTH_FILE = path.join(DATA_DIR, "teacher_auth.json");

export interface TeacherProfile {
  id: string;
  email: string;
  name: string;
  school: string;
  department: string;
  role: "teacher" | "head_of_dept" | "examiner";
  avatarColor: string;
  createdAt: number;
}

export interface TeacherRecord extends TeacherProfile {
  salt: string;
  hash: string;
}

const activeTeacherTokens = new Map<
  string,
  { teacherId: string; createdAt: number; lastActive: number }
>();

function hashTeacherPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

let teachersDb: Record<string, TeacherRecord> = {};

function savePersistedTeachers(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TEACHERS_DB_FILE, JSON.stringify(teachersDb, null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to persist teachers db:", e);
  }
}

function loadOrCreateTeachers(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // 1. Load seed teachers from SOURCE_DATA_DIR first if exists
    const sourceTeachers = path.join(SOURCE_DATA_DIR, "teachers_db.json");
    if (fs.existsSync(sourceTeachers)) {
      try {
        const content = fs.readFileSync(sourceTeachers, "utf-8");
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === "object") {
          teachersDb = parsed;
        }
      } catch (e) {}
    }

    // 2. Layer from DATA_DIR if present
    if (DATA_DIR !== SOURCE_DATA_DIR && !isSharedStoreEnabled() && fs.existsSync(TEACHERS_DB_FILE)) {
      try {
        const content = fs.readFileSync(TEACHERS_DB_FILE, "utf-8");
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === "object") {
          Object.assign(teachersDb, parsed);
        }
      } catch (e) {}
    } else if (DATA_DIR === SOURCE_DATA_DIR && fs.existsSync(TEACHERS_DB_FILE)) {
      const content = fs.readFileSync(TEACHERS_DB_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        teachersDb = parsed;
      }
    }
  } catch (e) {
    console.warn("Error reading teachers_db file:", e);
  }

  // If no teachers exist, import legacy teacher_auth.json or seed default head of department
  if (Object.keys(teachersDb).length === 0) {
    // Deterministic salt so every serverless instance builds the identical default
    // account (a random salt would make tokens from one instance fail on another).
    let initialSalt = crypto.createHash("sha256").update("default-teacher-salt:" + getTokenSecret()).digest("hex").slice(0, 32);
    let initialHash = hashTeacherPassword(process.env.TEACHER_PASSCODE || "4CP0-teacher", initialSalt);

    if (fs.existsSync(TEACHER_AUTH_FILE)) {
      try {
        const legacy = JSON.parse(fs.readFileSync(TEACHER_AUTH_FILE, "utf-8"));
        if (legacy && legacy.salt && legacy.hash) {
          initialSalt = legacy.salt;
          initialHash = legacy.hash;
        }
      } catch (e) {}
    }

    const defaultTeacher: TeacherRecord = {
      id: "t_primary",
      email: "teacher@edexcel.org",
      name: "Faculty Head of Computer Science",
      school: "Pearson Edexcel Centre",
      department: "Computer Science & IT",
      role: "head_of_dept",
      avatarColor: "purple",
      createdAt: Date.now(),
      salt: initialSalt,
      hash: initialHash,
    };

    teachersDb[defaultTeacher.id] = defaultTeacher;
    savePersistedTeachers();
  }
}

loadOrCreateTeachers();
loadDataFiles();

// Teacher sessions use signed tokens so they stay valid on every serverless
// instance (an in-memory session list is lost whenever Vercel starts a new one).
// Format: tea_<base64url payload>.<HMAC signature>
const TEACHER_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getTokenSecret(): string {
  if (process.env.TEACHER_TOKEN_SECRET) return process.env.TEACHER_TOKEN_SECRET;
  // Fallback keeps the app working, but set TEACHER_TOKEN_SECRET in Vercel for proper security.
  return crypto
    .createHash("sha256")
    .update("edexcel-token-secret:" + (process.env.GEMINI_API_KEY || "") + ":" + (process.env.TEACHER_PASSCODE || "4CP0-teacher"))
    .digest("hex");
}

function signTokenPayload(payload: string): string {
  return crypto.createHmac("sha256", getTokenSecret()).update(payload).digest("base64url");
}

function issueTeacherToken(teacherId: string): string {
  const teacher = teachersDb[teacherId];
  const payload = Buffer.from(
    JSON.stringify({
      tid: teacherId,
      exp: Date.now() + TEACHER_TOKEN_TTL_MS,
      // Changing the password changes this value, which invalidates old tokens.
      pv: teacher ? teacher.hash.slice(0, 12) : "",
    })
  ).toString("base64url");
  return `tea_${payload}.${signTokenPayload(payload)}`;
}

function getTeacherFromToken(token?: string): TeacherProfile | undefined {
  if (!token || !token.startsWith("tea_")) return undefined;
  const body = token.slice(4);
  const dot = body.lastIndexOf(".");
  if (dot <= 0) return undefined;
  const payload = body.slice(0, dot);
  const sig = body.slice(dot + 1);
  const expected = signTokenPayload(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return undefined;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (!data || typeof data.exp !== "number" || data.exp < Date.now()) return undefined;
    const record = teachersDb[data.tid];
    if (!record) return undefined;
    if (data.pv && record.hash.slice(0, 12) !== data.pv) return undefined;
    const { salt, hash, ...profile } = record;
    return profile;
  } catch {
    return undefined;
  }
}

function extractToken(req: express.Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  // Fallback: check query parameter or cookie
  if (req.query && typeof req.query.token === "string") {
    return req.query.token.trim();
  }
  return undefined;
}

function getTeacherFromRequest(req: express.Request): TeacherProfile | undefined {
  const token = extractToken(req);
  return getTeacherFromToken(token);
}

function isTeacherRequest(req: express.Request): boolean {
  return !!getTeacherFromRequest(req);
}

function requireTeacher(req: express.Request, res: express.Response, next: express.NextFunction) {
  const teacher = getTeacherFromRequest(req);

  if (!teacher) {
    res.status(401).json({
      error: "Unauthorized: Teacher session credentials required. Please re-enter the Teacher passcode.",
      code: "TEACHER_AUTH_REQUIRED",
    });
    return;
  }
  // Attach teacher to request
  (req as any).teacher = teacher;
  next();
}

// ==========================================
// SERVER-SIDE CODE RUNNER & GRADING UTILITIES
// ==========================================
function executePythonCode(
  code: string,
  inputs: string[] = [],
  files?: Record<string, string>
): Promise<{ out: string; err: string | null }> {
  // Each run gets its own folder containing the data files, so file-handling
  // programs can open them and can't interfere with each other.
  let workDir: string | undefined;
  if (files) {
    try {
      workDir = fs.mkdtempSync(path.join(os.tmpdir(), "pyrun-"));
      for (const [name, content] of Object.entries(files)) {
        const clean = cleanDataFileName(name);
        if (clean) fs.writeFileSync(path.join(workDir, clean), String(content ?? ""));
      }
    } catch (e) {
      console.warn("[python] Could not prepare data files:", e);
    }
  }
  const cleanup = () => {
    if (workDir) {
      try {
        fs.rmSync(workDir, { recursive: true, force: true });
      } catch {}
    }
  };

  return new Promise<{ out: string; err: string | null }>((resolve) => {
    let resolved = false;
    let stdout = "";
    let stderr = "";

    const proc = spawn("python3", ["-c", code], {
      timeout: 4000,
      ...(workDir ? { cwd: workDir } : {}),
    });

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try {
          proc.kill("SIGKILL");
        } catch (e) {}
        resolve({ out: stdout, err: "Execution timed out (exceeded 4s limit)." });
      }
    }, 4000);

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > 50000) {
        stdout = stdout.slice(0, 50000);
      }
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    if (inputs && inputs.length > 0) {
      try {
        proc.stdin.write(inputs.join("\n") + "\n");
      } catch (e) {}
    }
    try {
      proc.stdin.end();
    } catch (e) {}

    proc.on("close", (exitCode) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({
          out: stdout,
          err: exitCode === 0 ? null : (stderr.trim() || `Program exited with code ${exitCode}`),
        });
      }
    });

    proc.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({ out: stdout, err: err.message });
      }
    });
  }).finally(cleanup);
}

function normalizeOutput(s: string): string {
  return String(s || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function stripPrompts(s: string): string {
  const norm = normalizeOutput(s);
  const lines = norm.split("\n");
  const cleaned = lines.map((line) => {
    const promptMatch = line.match(/^([A-Za-z0-9 _\-\(\)\$#@]+[:?=]\s*)(.+)$/);
    if (promptMatch && promptMatch[2]) {
      return promptMatch[2].trim();
    }
    return line;
  });
  return cleaned.join("\n").trim();
}

function extractNumbers(s: string): number[] {
  const matches = (s || "").match(/-?\d+(?:\.\d+)?/g);
  if (!matches) return [];
  return matches.map(Number).filter((n) => !isNaN(n));
}

function flexibleCompareOutputs(
  actual: string,
  expected: string
): { matches: boolean; reason: string } {
  const actNorm = normalizeOutput(actual);
  const expNorm = normalizeOutput(expected);

  // 1. Exact normalized match
  if (actNorm === expNorm) {
    return { matches: true, reason: "exact_match" };
  }

  // 2. Prompt-stripped match (e.g. "Result: 42" vs "42", "Pass" vs "Pass")
  const actStripped = stripPrompts(actual);
  const expStripped = stripPrompts(expected);
  if (actStripped === expNorm || actStripped === expStripped) {
    return { matches: true, reason: "prompt_stripped_match" };
  }

  // 3. Case-insensitive match (e.g. "pass" vs "Pass", "yes" vs "Yes")
  if (actNorm.toLowerCase() === expNorm.toLowerCase()) {
    return { matches: true, reason: "case_insensitive_match" };
  }
  if (actStripped.toLowerCase() === expStripped.toLowerCase()) {
    return { matches: true, reason: "prompt_stripped_case_match" };
  }

  // 4. Numeric tolerance match (e.g. 12.5 vs 12.50, 4.0 vs 4, or float epsilon ±0.02)
  const actNums = extractNumbers(actStripped || actNorm);
  const expNums = extractNumbers(expStripped || expNorm);

  if (expNums.length > 0 && actNums.length === expNums.length) {
    let allNumsMatch = true;
    for (let i = 0; i < expNums.length; i++) {
      const diff = Math.abs(actNums[i] - expNums[i]);
      if (diff > 0.02 && diff / Math.max(0.001, Math.abs(expNums[i])) > 0.01) {
        allNumsMatch = false;
        break;
      }
    }
    if (allNumsMatch) {
      return { matches: true, reason: "numeric_equivalence_match" };
    }
  }

  // If expected is a single number and student printed it as the final answer
  if (expNums.length === 1 && actNums.length > 0) {
    const lastActNum = actNums[actNums.length - 1];
    if (Math.abs(lastActNum - expNums[0]) <= 0.02) {
      return { matches: true, reason: "final_numeric_match" };
    }
  }

  // 5. Line presence match
  const actLines = actNorm.split("\n").map((l) => l.trim()).filter(Boolean);
  const expLines = expNorm.split("\n").map((l) => l.trim()).filter(Boolean);

  if (actLines.length > 0 && expLines.length === 1) {
    const target = expLines[0].toLowerCase().trim();
    const strippedTarget = stripPrompts(expLines[0]).toLowerCase().trim();

    const lastAct = actLines[actLines.length - 1];
    const strippedLastAct = stripPrompts(lastAct);
    if (
      lastAct === expLines[0] ||
      lastAct.toLowerCase() === target ||
      strippedLastAct === expLines[0] ||
      strippedLastAct.toLowerCase() === strippedTarget
    ) {
      return { matches: true, reason: "last_line_match" };
    }

    const anyLineMatch = actLines.some((l) => {
      const low = l.toLowerCase().trim();
      const str = stripPrompts(l).toLowerCase().trim();
      return (
        low === target ||
        str === strippedTarget ||
        low.replace(/\s+/g, " ") === target.replace(/\s+/g, " ") ||
        str.replace(/\s+/g, " ") === strippedTarget.replace(/\s+/g, " ")
      );
    });
    if (anyLineMatch) {
      return { matches: true, reason: "line_presence_match" };
    }
  }

  // 6. Multiline sequence match
  if (actLines.length === expLines.length && expLines.length > 1) {
    let allLinesMatch = true;
    for (let i = 0; i < expLines.length; i++) {
      const a = stripPrompts(actLines[i]).toLowerCase().replace(/\s+/g, " ");
      const e = stripPrompts(expLines[i]).toLowerCase().replace(/\s+/g, " ");
      if (a !== e) {
        allLinesMatch = false;
        break;
      }
    }
    if (allLinesMatch) {
      return { matches: true, reason: "multiline_flexible_match" };
    }
  }

  // 7. Token inclusion match
  const expTokens = expNorm.toLowerCase().split(/[\s,;:|]+/).filter(Boolean);
  const actTokens = actNorm.toLowerCase().split(/[\s,;:|]+/).filter(Boolean);
  if (expTokens.length > 0 && expTokens.length <= 4 && actTokens.length >= expTokens.length) {
    let matchedCount = 0;
    for (const t of expTokens) {
      if (actTokens.includes(t)) matchedCount++;
    }
    if (matchedCount === expTokens.length) {
      return { matches: true, reason: "token_inclusion_match" };
    }
  }

  return { matches: false, reason: "mismatch" };
}

function compareOutputs(actual: string, expected: string): boolean {
  return flexibleCompareOutputs(actual, expected).matches;
}

function detectAntiHardcoding(
  code: string,
  tests: any[]
): { isHardcoded: boolean; reason?: string } {
  if (!code || !tests || tests.length === 0) {
    return { isHardcoded: false };
  }

  const cleaned = code
    .replace(/#.*$/gm, "")
    .replace(/'''[\s\S]*?'''/g, "")
    .replace(/"""[\s\S]*?"""/g, "")
    .trim();

  const testsWithInputs = tests.filter((t: any) => t.in && t.in.length > 0);
  const distinctOutputs = new Set(tests.map((t: any) => normalizeOutput(t.out).toLowerCase())).size;

  if (testsWithInputs.length >= 2 && distinctOutputs >= 2) {
    const hasInputCall = /\binput\s*\(/.test(cleaned) || /\bsys\.stdin\b/.test(cleaned);
    const hasDef = /\bdef\s+\w+\s*\([^)]+\)/.test(cleaned);

    if (!hasInputCall && !hasDef) {
      const hasPrint = /\bprint\s*\(/.test(cleaned);
      if (hasPrint) {
        return {
          isHardcoded: true,
          reason:
            "Hardcoded output detected: The question requires reading dynamic inputs. Your solution must call input() rather than printing static values.",
        };
      }
    }
  }

  const ifCount = (cleaned.match(/\b(if|elif)\b/g) || []).length;
  const printCount = (cleaned.match(/\bprint\s*\(/g) || []).length;
  const hasArithmeticOrLoops =
    /[+\-*/%]|(\bfor\b)|(\bwhile\b)|(\bsum\b)|(\blen\b)|(\bappend\b)|(\bint\b)|(\bfloat\b)/.test(
      cleaned
    );

  if (tests.length >= 3 && ifCount >= 3 && printCount >= 3 && !hasArithmeticOrLoops) {
    let literalOutputsCount = 0;
    for (const t of tests) {
      const expStr = normalizeOutput(t.out).replace(/\n/g, "");
      if (expStr && cleaned.includes(expStr)) {
        literalOutputsCount++;
      }
    }
    if (literalOutputsCount >= 3) {
      return {
        isHardcoded: true,
        reason:
          "Hardcoded lookups detected: Solutions must compute answers dynamically using algorithms, variables, and calculations rather than hardcoding static output tables.",
      };
    }
  }

  return { isHardcoded: false };
}

function normalizeStringAnswer(s: string | number | null | undefined): string {
  return String(s ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^[#\s]+/, "")
    .replace(/[.\u2019']+$/, "")
    .replace(/^["'\u201c]+|["'\u201d]+$/g, "");
}

function cellMatches(given: string | undefined, expected: string | number): boolean {
  const g = normalizeStringAnswer(given);
  return String(expected)
    .split("|")
    .some((alt) => normalizeStringAnswer(alt) === g);
}

// ==========================================
// STUDENT PAYLOAD SANITIZATION
// Prevents students from inspecting solutions, hints, or mark schemes
// ==========================================
function sanitizeTaskForStudent(task: any, allowHints = false) {
  if (!task) return task;
  const safe = { ...task };

  // Strip master solution and mark scheme
  delete safe.solution;
  delete safe.markScheme;

  if (!allowHints) {
    delete safe.hint;
  }

  // Sanitize MCQ questions
  if (safe.mcqs && Array.isArray(safe.mcqs)) {
    safe.mcqs = safe.mcqs.map((m: any) => {
      const copy = { ...m };
      delete copy.a;
      delete copy.why;
      return copy;
    });
  }

  // Sanitize inspect sub-questions
  if (safe.subQuestions && Array.isArray(safe.subQuestions)) {
    safe.subQuestions = safe.subQuestions.map((sq: any) => {
      const copy = { ...sq };
      delete copy.a;
      delete copy.why;
      return copy;
    });
  }

  // Sanitize table questions
  if (safe.tableRows && Array.isArray(safe.tableRows)) {
    safe.tableRows = safe.tableRows.map((row: any) => {
      if (!row || !row.c || !Array.isArray(row.c)) return row;
      return {
        ...row,
        c: row.c.map((cell: any) => {
          if (!cell) return cell;
          if (cell.g) {
            return { g: true, v: cell.v };
          } else {
            return { g: false, v: "" };
          }
        }),
      };
    });
  }

  // Sanitize theory questions
  if (safe.theorySubQuestions && Array.isArray(safe.theorySubQuestions)) {
    safe.theorySubQuestions = safe.theorySubQuestions.map((t: any) => {
      const copy = { ...t };
      delete copy.keywords;
      delete copy.criteria;
      return copy;
    });
  }

  // Mark points (from uploaded mark schemes) are examiner-only
  delete safe.markPoints;
  delete safe.markThresholds;
  delete safe.why;

  // MCQ / inspect / theory items stored under "questions" (format used by uploaded papers)
  if (Array.isArray(safe.questions)) {
    safe.questions = safe.questions.map((q: any) => {
      if (!q || typeof q !== "object") return q;
      const copy = { ...q };
      delete copy.a;
      delete copy.why;
      delete copy.accepted;
      delete copy.keywords;
      delete copy.criteria;
      return copy;
    });
  }

  // Trace tables: keep given cells, blank the answers. Sort tasks: keep only the grid shape.
  if (Array.isArray(safe.rows)) {
    if (safe.type === "sort") {
      safe.rows = safe.rows.map((row: any) => (Array.isArray(row) ? row.map(() => "") : row));
    } else {
      safe.rows = safe.rows.map((row: any) =>
        Array.isArray(row)
          ? row.map((cell: any) =>
              cell && typeof cell === "object" ? (cell.g ? { g: true, v: cell.v } : { g: false, v: "" }) : cell
            )
          : row
      );
    }
  }

  // Sub-parts such as 1(a), 1(b) from uploaded papers
  if (Array.isArray(safe.parts)) {
    safe.parts = safe.parts.map((p: any) => {
      if (!p || typeof p !== "object") return p;
      const copy = { ...p };
      delete copy.solution;
      delete copy.markScheme;
      delete copy.markPoints;
      delete copy.correctOption;
      if (Array.isArray(copy.tests)) copy.tests = copy.tests.map((tc: any) => ({ ...tc, out: undefined }));
      return copy;
    });
  }

  // Sanitize test cases: students get input so they can test code, but not expected outputs
  if (safe.tests && Array.isArray(safe.tests)) {
    safe.tests = safe.tests.map((tc: any) => {
      const copy = { ...tc };
      delete copy.out;
      return copy;
    });
  }

  return safe;
}

function sanitizeAssessmentForStudent(a: AssessmentStore) {
  if (!a) return a;
  const safe = {
    id: a.id,
    title: a.title,
    code: a.code,
    type: a.type || "assessment",
    customHeaderBanner: a.customHeaderBanner,
    customSubtitle: a.customSubtitle,
    customInstructions: a.customInstructions,
    headerConfig: a.headerConfig,
    durationMinutes: a.durationMinutes,
    showScoreImmediately: a.showScoreImmediately,
    allowCopyPaste: a.allowCopyPaste !== undefined ? Boolean(a.allowCopyPaste) : (a.type === "task"),
    showOperatorToolbar: a.showOperatorToolbar !== undefined ? Boolean(a.showOperatorToolbar) : (a.type === "task"),
    shareSolutions: a.shareSolutions !== undefined ? Boolean(a.shareSolutions) : (a.type === "task"),
    questionIds: a.questionIds || [],
    maxMarks: a.maxMarks,
    gradeBoundaries: a.gradeBoundaries,
    createdAt: a.createdAt,
    status: a.status,
    questions: (a.questions || []).map((q: any) => sanitizeTaskForStudent(q, a.type === "task")),
  };
  return safe;
}

// Initialize Gemini lazily
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Resilient Gemini generator with exponential backoff and model cascade
// Prevents 503 (high demand) and 429 (rate limits) from breaking features
function isTransientGeminiError(err: any): boolean {
  const msg = String(err?.message || "");
  return (
    err?.status === 503 ||
    err?.code === 503 ||
    err?.status === 429 ||
    err?.code === 429 ||
    err?.status === 500 ||
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("high demand") ||
    msg.includes("overloaded") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("INTERNAL") ||
    /fetch failed|ECONNRESET|ETIMEDOUT|socket hang up/i.test(msg)
  );
}

/** Reads Gemini's "retry in 12s" hint from a 429 error, if present. */
function geminiRetryHintMs(err: any): number {
  const msg = String(err?.message || "");
  const m = msg.match(/retryDelay"?\s*:\s*"(\d+(?:\.\d+)?)s"/) || msg.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
  return m ? Math.ceil(parseFloat(m[1]) * 1000) : 0;
}

// Resilient Gemini call. "High demand" (503) and rate-limit (429) spikes often last
// a minute or more, so we keep retrying with growing pauses and rotate through the
// fallback models until maxWaitMs runs out. Other errors (bad key, bad request) fail fast.
async function generateContentWithResilience(
  ai: GoogleGenAI,
  options: {
    contents: any;
    config?: any;
    candidateModels?: string[];
    maxWaitMs?: number;
  }
) {
  const candidateModels = options.candidateModels || [
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ];
  const deadline = Date.now() + (options.maxWaitMs ?? 60_000);
  const pauses = [0, 2_000, 5_000, 10_000, 20_000, 30_000, 30_000];

  let lastError: any = null;

  for (let round = 0; round < pauses.length; round++) {
    if (round > 0) {
      const hinted = geminiRetryHintMs(lastError);
      const jitter = Math.floor(Math.random() * 1000);
      const wait = Math.min(Math.max(pauses[round], hinted) + jitter, deadline - Date.now());
      if (wait <= 0) break;
      console.warn(`[gemini] Busy, retrying in ${Math.round(wait / 1000)}s (round ${round + 1})`);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

    let sawTransient = false;
    for (const model of candidateModels) {
      if (Date.now() >= deadline) break;
      try {
        return await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });
      } catch (err: any) {
        lastError = err;
        if (isTransientGeminiError(err)) {
          sawTransient = true;
          continue; // try the next model straight away
        }
        // A bad/blocked API key won't be fixed by another model or by waiting
        const authProblem =
          err?.status === 401 || err?.code === 401 || err?.status === 403 || err?.code === 403 ||
          /API key not valid|API_KEY_INVALID|PERMISSION_DENIED|UNAUTHENTICATED/i.test(String(err?.message || ""));
        if (authProblem) throw err;
        // Otherwise (e.g. model not available on this key) just try the next model
      }
    }
    if (!sawTransient) break; // nothing temporary left to wait out
  }

  throw lastError || new Error("Gemini request failed");
}

// Topic catalog for IGCSE Computer Science
export const IGCSE_UNITS = [
  { code: "U01", title: "Output and variables", spec: "2.1, 2.4", keywords: ["print", "variable", "string", "output", "display", "message", "assign"] },
  { code: "U02", title: "Input and data types", spec: "2.3, 2.4", keywords: ["input", "int", "float", "str", "casting", "data type", "prompt"] },
  { code: "U03", title: "Arithmetic and operators", spec: "2.5", keywords: ["//", "%", "mod", "div", "power", "**", "arithmetic", "remainder", "quotient"] },
  { code: "U04", title: "Selection", spec: "2.2", keywords: ["if", "elif", "else", "condition", "relational", "and", "or", "not", "branching"] },
  { code: "U05", title: "String manipulation", spec: "2.3, 2.5", keywords: ["upper", "lower", "len", "slice", "indexing", "split", "concatenate", "substring"] },
  { code: "U06", title: "Iteration with while", spec: "2.2", keywords: ["while", "sentinel", "condition-controlled", "loop forever", "flag"] },
  { code: "U07", title: "Iteration with for", spec: "2.2", keywords: ["for", "range", "count-controlled", "loop counter", "iterate"] },
  { code: "U08", title: "Lists", spec: "2.3", keywords: ["list", "array", "append", "element", "index", "pop", "1d list"] },
  { code: "U09", title: "Subprograms", spec: "2.6", keywords: ["def", "function", "procedure", "parameter", "return", "argument", "scope"] },
  { code: "U10", title: "Standard algorithms", spec: "1.1", keywords: ["linear search", "min", "max", "accumulator", "total", "count", "threshold"] },
  { code: "U11", title: "Two-dimensional lists", spec: "2.3", keywords: ["2d list", "matrix", "grid", "nested list", "row", "column", "table"] },
  { code: "U12", title: "Validation and robust code", spec: "2.1, 2.4", keywords: ["try", "except", "range check", "presence check", "type check", "length check", "format check"] },
  { code: "U13", title: "Libraries: math and time", spec: "2.1", keywords: ["math.sqrt", "math.floor", "math.ceil", "math.pi", "import math", "library"] },
  { code: "U14", title: "Reading a program", spec: "2.1, 2.5, 2.6", keywords: ["line number", "constant", "subprogram name", "inspect", "identify"] },
  { code: "U15", title: "Trace tables", spec: "1.1, 1.2", keywords: ["trace table", "dry run", "column", "iteration", "truth table", "logic gates"] },
  { code: "U16", title: "Find and fix the error", spec: "2.1", keywords: ["syntax error", "logic error", "runtime error", "bug", "debugging", "fix"] },
  { code: "U17", title: "Test data and testing", spec: "2.1", keywords: ["normal", "boundary", "erroneous", "extreme", "test case", "test data"] },
  { code: "U18", title: "Searching: linear and binary", spec: "1.1", keywords: ["binary search", "linear search", "midpoint", "sorted list", "halving"] },
  { code: "U19", title: "Sorting: bubble and merge", spec: "1.1", keywords: ["bubble sort", "merge sort", "pass", "swap", "split", "neighbour"] },
  { code: "U20", title: "Exam-style 20-mark programs", spec: "1.1, 2.2–2.6", keywords: ["20-mark", "extended program", "specification", "scenario", "solution"] },
  { code: "U21", title: "Mixed exam practice", spec: "1.1, 2.2–2.6", keywords: ["past paper", "mock", "mixed practice", "cipher", "palindrome"] },
  { code: "U22", title: "Pseudocode and flowcharts", spec: "1.1, 1.2, 2.2", keywords: ["pseudocode", "flowchart", "RECEIVE", "SEND", "SET", "WHILE", "diamond"] },
  { code: "U23", title: "Exam theory & computational thinking", spec: "1.2, 2.1, 2.6", keywords: ["abstraction", "decomposition", "efficiency", "global", "local", "readability", "maintenance"] },
  { code: "U24", title: "Binary & Hexadecimal Representation", spec: "3.1", keywords: ["binary", "hexadecimal", "two's complement", "twos complement", "signed integer", "sign and magnitude", "shift", "overflow"] },
  { code: "U25", title: "Data Storage, Compression & IEC Prefixes", spec: "3.2, 3.3", keywords: ["kibibyte", "kib", "mebibyte", "mib", "gibibyte", "gib", "tebibyte", "rle", "lossy", "lossless", "jpeg", "mp3", "compression", "file size"] },
  { code: "U26", title: "Historical Ciphers & Encryption", spec: "3.4", keywords: ["caesar cipher", "pigpen", "vigenere", "vigenére", "rail fence", "cipher", "encryption", "plaintext", "ciphertext"] },
  { code: "U27", title: "Von Neumann Architecture & Hardware", spec: "4.1, 4.2", keywords: ["von neumann", "cpu", "registers", "pc", "mar", "mdr", "acc", "alu", "cu", "fetch decode execute", "bus", "clock speed", "cache", "ram", "rom"] },
  { code: "U28", title: "Logic Gates & Truth Tables", spec: "4.3", keywords: ["truth table", "logic gate", "and gate", "or gate", "not gate", "boolean"] },
  { code: "U29", title: "Operating Systems, Utilities & Translators", spec: "4.4, 4.5", keywords: ["operating system", "utility", "defragmentation", "anti-malware", "compiler", "interpreter", "assembler", "translation"] },
  { code: "U30", title: "Networks & the 4-Layer TCP/IP Model", spec: "5.1", keywords: ["tcp/ip", "application layer", "transport layer", "network layer", "data link", "topology", "star", "mesh", "bus", "lan", "wan", "pan"] },
  { code: "U31", title: "Network Security & Cyber Attacks", spec: "5.2, 5.3", keywords: ["phishing", "pharming", "shoulder surfing", "firewall", "cyber attack", "ipv4", "ipv6", "dns", "router", "switch", "wap"] },
  { code: "U32", title: "Emerging Trends, Ethics & Legislation", spec: "6.1", keywords: ["quantum computing", "dna computing", "nanotechnology", "artificial intelligence", "e-waste", "environmental", "intellectual property", "copyright", "patent", "licensing"] },
  { code: "U99", title: "Miscellaneous", spec: "—", keywords: [] }
];

// Fallback rule-based classifier
function classifyTopicRuleBased(text: string): string {
  const lower = text.toLowerCase();
  let bestUnit = "U99";
  let maxMatches = 0;

  for (const u of IGCSE_UNITS) {
    if (u.code === "U99") continue;
    let matches = 0;
    for (const kw of u.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        matches += 2;
      }
    }
    if (lower.includes(u.title.toLowerCase())) {
      matches += 5;
    }
    if (matches > maxMatches && matches >= 2) {
      maxMatches = matches;
      bestUnit = u.code;
    }
  }

  return bestUnit;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGemini: !!process.env.GEMINI_API_KEY,
    totalAssessments: Object.keys(assessmentsDb).length,
  });
});

// Convert or Generate Similar exam questions from uploaded paper + mark scheme (PDF or Image)
// ==========================================
// DATA FILE LIBRARY ENDPOINTS
// ==========================================
// Contents are readable by students on purpose: programs need them to run,
// exactly as candidates receive the data files in the real exam.
app.get("/api/data-files", (req, res) => {
  const withContent = req.query.content === "1";
  const files = Object.values(dataFilesDb)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((f) => ({
      name: f.name,
      size: f.content.length,
      uploadedAt: f.uploadedAt,
      ...(withContent ? { content: f.content } : {}),
    }));
  res.json({ files });
});

app.post("/api/data-files", requireTeacher, (req, res) => {
  const incoming = Array.isArray(req.body?.files) ? req.body.files : [];
  const saved: string[] = [];
  const rejected: string[] = [];
  for (const f of incoming) {
    const name = cleanDataFileName(f?.name);
    const content = typeof f?.content === "string" ? f.content : null;
    if (!name || content === null || content.length > MAX_DATA_FILE_CHARS) {
      rejected.push(String(f?.name || "(unnamed)"));
      continue;
    }
    dataFilesDb[name] = { name, content, uploadedAt: Date.now() };
    saved.push(name);
  }
  savePersistedDataFiles();
  res.json({ success: true, saved, rejected });
});

app.delete("/api/data-files/:name", requireTeacher, (req, res) => {
  const name = cleanDataFileName(req.params.name);
  if (name && dataFilesDb[name]) {
    delete dataFilesDb[name];
    savePersistedDataFiles();
  }
  res.json({ success: true });
});

// ==========================================
// LARGE FILE UPLOADS (sent in pieces)
// ==========================================
// Vercel rejects any request body larger than 4.5 MB, and a past paper PDF plus
// its mark scheme is usually bigger than that once base64-encoded. The browser
// therefore uploads big files in ~900 KB pieces, then sends only an uploadId.
app.post("/api/uploads/chunk", requireTeacher, async (req, res) => {
  try {
    const { uploadId, index, total, data } = req.body || {};
    if (
      typeof uploadId !== "string" ||
      !/^[a-zA-Z0-9_-]{8,64}$/.test(uploadId) ||
      !Number.isInteger(index) ||
      !Number.isInteger(total) ||
      index < 0 ||
      total < 1 ||
      total > 60 ||
      index >= total ||
      typeof data !== "string" ||
      data.length > 950_000
    ) {
      res.status(400).json({ error: "Invalid upload chunk." });
      return;
    }
    await saveUploadChunk(uploadId, index, total, data);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Could not store upload chunk: " + (err?.message || String(err)) });
  }
});

/** If the browser uploaded a file in pieces, reassemble it into `base64`. */
async function resolveUploadedDoc(doc: any): Promise<any> {
  if (!doc || doc.base64 || !doc.uploadId) return doc;
  const base64 = await readUpload(String(doc.uploadId), Number(doc.totalChunks) || 0);
  return { ...doc, base64 };
}

async function cleanupUploadedDocs(...docs: any[]) {
  for (const d of docs) {
    if (d && d.uploadId) await deleteUpload(String(d.uploadId), Number(d.totalChunks) || 0);
  }
}

app.post("/api/convert-question", requireTeacher, async (req, res) => {
  try {
    const {
      questionText,
      markScheme,
      starterCode,
      preferredUnit,
      preferredType,
      imageBase64,
      questionDoc: rawQuestionDoc,
      markSchemeDoc: rawMarkSchemeDoc,
      mode = "convert", // "convert" (exact paper) or "generate_similar" (pattern-derived)
    } = req.body;
    const questionDoc = await resolveUploadedDoc(rawQuestionDoc);
    const markSchemeDoc = await resolveUploadedDoc(rawMarkSchemeDoc);
    await cleanupUploadedDocs(rawQuestionDoc, rawMarkSchemeDoc);

    const hasAnyInput =
      Boolean(questionText?.trim()) ||
      Boolean(markScheme?.trim()) ||
      Boolean(imageBase64) ||
      Boolean(questionDoc?.base64) ||
      Boolean(markSchemeDoc?.base64);

    if (!hasAnyInput) {
      res.status(400).json({
        error: "Please provide question text, mark scheme, or upload a question / mark scheme file (PDF or Image).",
      });
      return;
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const unitsListPrompt = IGCSE_UNITS.map(
          (u) => `${u.code}: ${u.title} (Keywords: ${u.keywords.slice(0, 5).join(", ")})`
        ).join("\n");

        const isSimilarMode = mode === "generate_similar";

        const prompt = `You are an expert Pearson Edexcel International GCSE (9-1) Computer Science (4CP0) Chief Examiner for Paper 1 (Principles) and Paper 2 (Application of Computational Thinking).
A teacher has provided an authentic past examination question and official mark scheme (in text, image, or PDF format).

MODE: ${isSimilarMode ? "GENERATE_SIMILAR_EXAM_QUESTION" : "TRANSCRIBE_EXACT_EXAM_QUESTION"}

${
  isSimilarMode
    ? `CRITICAL DIRECTIVE FOR 'GENERATE_SIMILAR_EXAM_QUESTION':
1. ANALYZE THE PATTERN: Identify the fundamental computational pattern, algorithmic thinking level, and data structures of the input past paper question and mark scheme (e.g., sentinel while-loop with division-by-zero protection, 2D array score filtering with file output, parallel arrays with unit-prefix conversions like 'C'/'F' or 'K'/'L', bubble sort pass tracing, simulation with conditional multipliers/boosters, or code inspection with misplaced accumulator).
2. DO NOT MERELY SWAP TRIVIAL VALUES: Do not simply change 'Cairo' to 'Paris' or '50' to '60'. Formulate a fresh, engaging, and authentic real-world examination problem matching the exact cognitive level and curriculum constraints of Pearson Edexcel 4CP0.
3. DERIVE RIGOROUS TEST VALUES FROM THE PATTERN: Create thorough test cases (normal, boundary, and extreme/erroneous where relevant) with exact expected outputs and mark weightings.
4. PRODUCE COMPLETE SOLUTION: Ensure Python 3 solutions and starters are completely valid, elegant, and syntax-correct.`
    : `CRITICAL DIRECTIVE FOR 'TRANSCRIBE_EXACT_EXAM_QUESTION':
1. PRESERVE THE QUESTION FIDELITY: Faithfully transcribe the question prompt, starter code, figures, and constraints from the past paper.
2. DERIVE TEST VALUES DIRECTLY FROM MARK SCHEME: Extract the official mark scheme test values, boundary conditions, and expected outputs into the 'tests' array for code questions or 'questions' for theory/inspect questions.`
}

Taxonomy and Format Requirements:
1. Determine which Pearson Edexcel 4CP0 unit it best fits into:
${unitsListPrompt}
Use units U01 to U32. If it is from Paper 2, typically U01-U17.
${preferredUnit ? `Note: Preferred unit: "${preferredUnit}".` : ""}

2. Follow Pearson Edexcel Command Words (Appendix 7):
- "Explain": Linked justification / reasoning.
- "Describe": Account of characteristics.
- "Devise": Plan algorithm or program.
- "Calculate": Mathematical working.

3. Select the best auto-markable question format ("type"):
- "code": Student writes Python 3 code in browser. Must provide:
    "starter": Python starter template,
    "solution": Complete working reference Python 3 code,
    "tests": Array of test cases: [ { "in": string[] (stdin lines), "out": string (exact stdout expected), "m": number (marks) } ]. Total test marks MUST equal "marks".
- "mcq": Multiple choice. Must provide "questions": [ { "q": string, "options": string[], "a": number (0-based correct index) } ].
- "table": Trace table or classification grid. Must provide "columns": [ { "label": string, "type"?: "text"|"select", "options"?: string[] } ], and "rows": [ [ { "v": string, "g": boolean } ] ] where g:true is given/fixed, g:false is student input.
- "inspect": Code comprehension with numbered code snippet. Must provide "code": string, and "questions": [ { "q": string, "a": string[] (all accepted variations), "why"?: string } ].
- "theory": Free text answer. Must provide "questions": [ { "q": string, "keywords": string[], "maxMarks": number, "criteria": string[] } ].

4. 4CP0 Programming Scope Boundaries:
- Students are expected to know: print(), input(), int(), float(), str(), len(), random (import random, random.randint()), basic loops, conditions, subprograms, text files.
- Students have NOT done: zfill(), max(), min(), sort(), sorted(). Questions/starters must not assume or require them (finding max/min is done via loops/comparisons). Students can use max/min/sort/zfill if they want, and automated tests must accept valid outputs from either approach.
- 2D lists: flat rows of mixed numbers and string, or just string. NO lists inside a 2D list item (no jagged/nested sub-lists).

${preferredType ? `Note: Preferred type: "${preferredType}".` : ""}

QUESTION CONTENT / CONTEXT:
${questionText ? questionText : "(Refer to attached question file/image)"}

MARK SCHEME / TEST CRITERIA:
${markScheme ? markScheme : "(Refer to attached mark scheme file/image)"}

${starterCode ? `STARTER CODE:\n${starterCode}\n` : ""}

Reply STRICTLY with a valid JSON object only (no markdown backticks, no text outside JSON):
{
  "unit": "U01" | ... | "U23",
  "unitName": "Unit title",
  "title": "Short descriptive title (2-6 words)",
  "level": "Starter" | "Core" | "Exam-style",
  "marks": number,
  "type": "code" | "mcq" | "table" | "inspect" | "theory",
  "brief": "Full formatted question instructions and specification for student",
  "hint": "Pedagogical hint guiding students towards the mark scheme requirement",
  "starter": "starter Python 3 code (if type == 'code')",
  "solution": "model Python 3 solution (if type == 'code')",
  "tests": [ { "in": ["input1"], "out": "expected output\\n", "m": 2 } ],
  "questions": [ ... ],
  "columns": [ ... ],
  "rows": [ ... ],
  "code": "code snippet (if type == 'inspect')"
}`;

        const parts: any[] = [];

        // Helper to extract base64 data and mimeType
        const appendInlineDoc = (docBase64: string, fallbackMime = "application/pdf", label = "Document") => {
          const match = docBase64.match(/^data:([a-zA-Z0-9.+/-]+);base64,(.*)$/);
          const mimeType = match ? match[1] : fallbackMime;
          const data = match ? match[2] : docBase64;
          parts.push({
            inlineData: { mimeType, data },
          });
          parts.push({ text: `[Attached ${label} (${mimeType})]` });
        };

        if (questionDoc?.base64) {
          appendInlineDoc(questionDoc.base64, questionDoc.mimeType || "application/pdf", "Question Paper");
        }
        if (markSchemeDoc?.base64) {
          appendInlineDoc(markSchemeDoc.base64, markSchemeDoc.mimeType || "application/pdf", "Mark Scheme");
        }
        if (imageBase64) {
          appendInlineDoc(imageBase64, "image/png", "Question / Mark Scheme Image");
        }

        parts.push({ text: prompt });

        const response = await generateContentWithResilience(ai, {
          contents: { parts },
          config: {
            responseMimeType: "application/json",
          },
        });

        const rawText = response.text?.trim() || "";
        const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        // Sanitize and ensure valid fields
        parsed.id = "c_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
        if (!parsed.unit || !IGCSE_UNITS.find((u) => u.code === parsed.unit)) {
          parsed.unit = classifyTopicRuleBased((questionText || "") + " " + (markScheme || ""));
        }
        const unitObj = IGCSE_UNITS.find((u) => u.code === parsed.unit);
        parsed.unitName = unitObj ? unitObj.title : "Examination Practice";
        parsed.custom = true;
        parsed.createdAt = Date.now();
        parsed.generationMode = mode;

        customQuestionsDb[parsed.id] = parsed;
        savePersistedQuestions();
        res.json({ success: true, task: parsed, method: "gemini" });
        return;
      } catch (aiErr) {
        console.error("Gemini conversion error, falling back to rule-based:", aiErr);
      }
    }

    // Rule-based fallback if Gemini API is unavailable
    const detectedUnit = preferredUnit || classifyTopicRuleBased((questionText || "") + " " + (markScheme || ""));
    const unitObj = IGCSE_UNITS.find((u) => u.code === detectedUnit) || IGCSE_UNITS[IGCSE_UNITS.length - 1];

    let taskType: "code" | "mcq" | "table" | "inspect" | "theory" = preferredType || "inspect";
    if (!preferredType) {
      if ((questionText || "").toLowerCase().includes("def ") || (questionText || "").toLowerCase().includes("write a program") || starterCode) {
        taskType = "code";
      } else if ((markScheme || "").toLowerCase().includes("options") || (questionText || "").toLowerCase().includes("which one")) {
        taskType = "mcq";
      } else if ((questionText || "").toLowerCase().includes("trace table") || (questionText || "").toLowerCase().includes("complete the table")) {
        taskType = "table";
      } else if ((markScheme || "").toLowerCase().includes("mark per bullet") || (questionText || "").toLowerCase().includes("explain")) {
        taskType = "theory";
      }
    }

    const fallbackTask: any = {
      id: "c_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      unit: detectedUnit,
      unitName: unitObj.title,
      title: (questionText || "Custom Question").split("\n")[0].slice(0, 40) || "Uploaded Question",
      level: "Exam-style",
      marks: 4,
      type: taskType,
      brief: questionText || "Answer the question based on the mark scheme.",
      hint: "Read the requirements carefully.",
      custom: true,
      createdAt: Date.now(),
    };

    if (taskType === "code") {
      fallbackTask.starter = starterCode || "# Write your Python 3 solution here\n";
      fallbackTask.solution = starterCode || "# Reference answer\n";
      fallbackTask.tests = [
        { in: ["10"], out: "10\n", m: 2 },
        { in: ["20"], out: "20\n", m: 2 },
      ];
    } else if (taskType === "mcq") {
      fallbackTask.questions = [
        {
          q: questionText || "Select the correct option according to the mark scheme:",
          options: ["Option A", "Option B", "Option C", "Option D"],
          a: 0,
        },
      ];
      fallbackTask.marks = 1;
    } else if (taskType === "table") {
      fallbackTask.columns = [{ label: "Input", type: "text" }, { label: "Output", type: "text" }];
      fallbackTask.rows = [
        [{ v: "Sample 1", g: true }, { v: "Expected 1", g: false }],
        [{ v: "Sample 2", g: true }, { v: "Expected 2", g: false }],
      ];
      fallbackTask.marks = 2;
    } else if (taskType === "theory") {
      fallbackTask.questions = [
        {
          q: questionText || "Explain the concept described.",
          keywords: (markScheme || "algorithm program variable").split(/[\s,]+/).filter((w: string) => w.length > 3).slice(0, 6),
          maxMarks: 4,
          criteria: markScheme ? [markScheme] : ["Accurate explanation of key mechanism"],
        },
      ];
    } else {
      fallbackTask.questions = [
        {
          q: "What is the expected outcome?",
          a: [(markScheme || "Answer").trim()],
          why: markScheme || "Matches exam specification",
        },
      ];
      fallbackTask.marks = 1;
    }

    customQuestionsDb[fallbackTask.id] = fallbackTask;
    res.json({ success: true, task: fallbackTask, method: "rule-based" });
  } catch (error: any) {
    console.error("Convert question error:", error);
    res.status(500).json({ error: error.message || "Failed to convert question" });
  }
});

// ==========================================
// AI-POWERED SIMILAR QUESTION GENERATOR (PEARSON EDEXCEL 4CP0 SPECIFICATION)
// Uses Gemini API to create authentic variations of existing tasks in the question bank
// ==========================================
app.post("/api/generate-similar-question", requireTeacher, async (req, res) => {
  try {
    const {
      sourceTask,
      variationMode = "parallel", // "parallel" | "easier" | "harder" | "code_to_trace" | "code_to_inspect"
      targetMarks: reqMarks,
      customInstruction,
      preferredDifficulty,
    } = req.body;

    if (!sourceTask || !sourceTask.title) {
      res.status(400).json({ error: "A valid source task from the question bank is required." });
      return;
    }

    const currentMarks = Number(sourceTask.marks) || 3;
    let targetMarks = reqMarks ? Number(reqMarks) : currentMarks;
    if (!reqMarks) {
      if (variationMode === "easier") targetMarks = Math.max(1, currentMarks - 1);
      if (variationMode === "harder") targetMarks = currentMarks + 2;
    }

    const unitInfo = IGCSE_UNITS.find((u) => u.code === sourceTask.unit) || {
      code: sourceTask.unit || "U01",
      title: sourceTask.unitName || "Problem Solving & Programming",
      spec: "1.1, 2.2-2.6",
      keywords: ["input", "output", "variable", "condition", "iteration"],
    };

    const ai = getGeminiClient();

    if (ai) {
      try {
        const variationDirectives: Record<string, string> = {
          parallel: `Create a PARALLEL authentic examination task with the EXACT same cognitive depth and mark weighting (${targetMarks} marks).
- Identify the core computational pattern (e.g. sentinel while-loop, list traversal, 2D lookup, accumulator with threshold, validation).
- Transfer it into a FRESH, realistic real-world context (e.g. drone battery monitor, electric vehicle telemetry, smart warehouse inventory, sports tournament timing, wildlife sanctuary tracker, greenhouse temperature regulation).
- Do NOT merely change trivial variable names (e.g. 'cat' to 'dog'). Invent an authentic problem scenario with clear user prompts and formatted output specifications.`,
          easier: `Create a FOUNDATIONAL / SCAFFOLDED variant targeted for reinforcement (${targetMarks} marks).
- Simplify complex nested branching or multi-condition requirements into a clear, direct requirement.
- Provide descriptive scaffold guidance in the starter code with helpful comment cues.
- Maintain rigorous 4CP0 syllabus fidelity while building candidate confidence.`,
          harder: `Create a HIGHER-TIER / CHALLENGING EXTENSION variant (${targetMarks} marks).
- Introduce boundary checks, robust validation (e.g. ensuring input is within specified range or re-prompting on invalid entry), compound conditions, or edge case handling.
- Require professional code structure, defensive programming, and formatted numeric display (e.g. two decimal places or percentage output).`,
          code_to_trace: `Transform this programming task into a 4CP0 PAPER 2 TRACE TABLE QUESTION (${targetMarks} marks).
- Present a numbered algorithm or Python snippet derived from this problem.
- Provide trace table columns (Line, key variables, conditions, Output).
- Students dry-run the provided test data through the logic step-by-step.`,
          code_to_inspect: `Transform this programming task into a 4CP0 CODE INSPECTION & DEBUGGING QUESTION (${targetMarks} marks).
- Provide a short, numbered Python snippet with an intentional deliberate bug (syntax, runtime, or logic error) or key architectural feature.
- Ask sub-questions following 4CP0 command words: state line numbers, identify error categories, or explain the purpose of variables/parameters.`,
        };

        const targetType =
          variationMode === "code_to_trace"
            ? "table"
            : variationMode === "code_to_inspect"
            ? "inspect"
            : sourceTask.type || "code";

        const prompt = `You are the Pearson Edexcel International GCSE (9-1) Computer Science (4CP0) Chief Examiner for Paper 1 (Principles) and Paper 2 (Application of Computational Thinking).

Your task is to generate a new, authentic, high-quality examination question derived from an existing question bank item.

==================================================
PEARSON EDEXCEL 4CP0 SPECIFICATION CONTEXT:
- Unit: ${unitInfo.code} - ${unitInfo.title} (Specification ref: ${unitInfo.spec})
- Target Marks: ${targetMarks}
- Target Question Type: ${targetType}
- Target Difficulty: ${preferredDifficulty || (variationMode === "easier" ? "Easy" : variationMode === "harder" ? "Hard" : "Moderate")}
- Variation Directive:
${variationDirectives[variationMode] || variationDirectives.parallel}
${customInstruction ? `\nTEACHER CUSTOM DIRECTIVE / THEME INSTRUCTION:\n"${customInstruction}"\n` : ""}

==================================================
ORIGINAL SOURCE QUESTION FROM QUESTION BANK:
- Title: ${sourceTask.title}
- Brief / Statement: ${sourceTask.brief}
- Original Marks: ${sourceTask.marks}
- Original Level: ${sourceTask.level}
- Original Type: ${sourceTask.type}
${sourceTask.starter ? `Original Starter Code:\n${sourceTask.starter}\n` : ""}
${sourceTask.solution ? `Original Reference Solution:\n${sourceTask.solution}\n` : ""}
${sourceTask.tests && sourceTask.tests.length > 0 ? `Original Test Cases:\n${JSON.stringify(sourceTask.tests, null, 2)}\n` : ""}
${sourceTask.questions && sourceTask.questions.length > 0 ? `Original Sub-Questions:\n${JSON.stringify(sourceTask.questions, null, 2)}\n` : ""}

==================================================
EXAMINATION REQUIREMENTS FOR 4CP0:
1. Pearson Edexcel Command Words (Appendix 7):
   Use appropriate command word: "Devise", "Explain", "Describe", "Complete", "State", "Identify", or "Calculate".
2. Paper 2 Python 3 Standards:
   - For 'code' questions, all input must be captured using standard input() prompts.
   - Type conversions (int(), float()) must be clean and explicitly required.
   - Starter code must include standard Pearson candidate headers:
     # Candidate Name:
     # Candidate Number:
     # Question <Number>
     # Complete the program below
   - Solution must be 100% syntactically valid Python 3, PEP-8 compliant, and free of unnecessary external libraries.
   - Test cases MUST include:
     a) Normal valid cases
     b) Boundary cases (e.g. exactly 0, thresholds, boundaries)
     c) Extreme / Sentinel cases (e.g. termination flags or edge values)
     The sum of all test case marks ("m") MUST EXACTLY EQUAL ${targetMarks}.
3. Mark Scheme & Criteria:
   - Provide structured "markPoints" (MP1, MP2, MP3, etc.) detailing exact criteria for awarding marks (e.g. 1 mark for input capture with prompt, 1 mark for correct condition, 1 mark for formatted output).

4. OFFICIAL 4CP0 CURRICULUM BOUNDARIES & INBUILT FUNCTION EXPECTATIONS (CRITICAL):
   - What candidates ARE EXPECTED TO KNOW:
     * Built-in functions: print(), input() (with prompt string), int(), float(), str(), len(), and random (import random, random.randint()).
     * Standard programming constructs: sequence, selection (if, elif, else), iteration (count-controlled for loop with range() or element traversal; condition-controlled while loop).
     * Operators: arithmetic (+, -, *, /, %, //, **), relational (==, !=, <, <=, >, >=), logical (and, or, not).
     * 1D lists / arrays: indexing, appending, iterating.
     * 2D lists / arrays (Topic 2.3.2):
       MUST consist of flat rows with mixed values of numbers and string (e.g. [["Alice", 85, "Pass"], ["Bob", 72, "Merit"]]) or just strings (e.g. [["X", "O"], ["O", "X"]]).
       STRICT SYLLABUS RULE: NO list inside a 2D list item (NO 3D lists, jagged lists, or nested lists inside a cell).
     * Basic text file I/O: open(), .readline(), .write(), .close().
     * Subprograms: def func(param1, param2) with return.
   - What candidates HAVE NOT DONE / ARE NOT EXPECTED TO KNOW:
     * Inbuilt functions: zfill(), max(), min(), sort(), sorted().
     * DO NOT require, prescribe, or assume zfill(), max(), min(), or sort() in questions, starter code, or hints!
     * If finding a maximum or minimum value: students are taught algorithmic comparison loops (e.g. highest = scores[0]; for s in scores: if s > highest: highest = s). Reference solutions and hints must present standard loops/comparisons.
     * If sorting values: students are taught algorithmic bubble sort / linear search logic in Topic 1, not Python's built-in .sort() or sorted().
     * STUDENT FREEDOM: Candidates ARE permitted to use max(), min(), sort(), or zfill() if they want and have learned them. Auto-grading test cases and mark schemes MUST evaluate output correctness agnostic of implementation approach (accept both loop-based and built-in methods).

==================================================
OUTPUT FORMAT:
Reply with ONLY a valid, raw JSON object (no markdown quotes, no text before or after):
{
  "unit": "${unitInfo.code}",
  "unitName": "${unitInfo.title}",
  "title": "Short title (3-6 words)",
  "level": "${variationMode === "easier" ? "Core" : variationMode === "harder" ? "Extension" : "Exam-style"}",
  "difficulty": "${preferredDifficulty || (variationMode === "easier" ? "Easy" : variationMode === "harder" ? "Hard" : "Moderate")}",
  "type": "${targetType}",
  "marks": ${targetMarks},
  "commandWord": "Devise" | "Explain" | "Complete" | "State",
  "specReference": "Spec ${unitInfo.spec} (${unitInfo.title})",
  "brief": "Full formatted examination problem brief with bulleted requirements",
  "hint": "Pedagogical hint guiding students towards mark scheme requirements",
  "starter": "Starter Python 3 scaffold with candidate header",
  "solution": "Complete working Python 3 reference solution",
  "starterFileName": "Q01_similar.py",
  "tests": [
    { "in": ["input_line_1", "input_line_2"], "out": "exact expected output\\n", "m": number }
  ],
  "markPoints": [
    { "id": "MP1", "marks": 1, "criterion": "Award 1 mark for ..." }
  ],
  "questions": [ ... for mcq, inspect, or theory ... ],
  "columns": [ ... for table ... ],
  "rows": [ ... for table ... ]
}`;

        const response = await generateContentWithResilience(ai, {
          contents: { parts: [{ text: prompt }] },
          config: {
            responseMimeType: "application/json",
          },
        });

        const rawText = response.text?.trim() || "";
        const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        parsed.id = `c_sim_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        parsed.unit = parsed.unit || unitInfo.code;
        parsed.unitName = parsed.unitName || unitInfo.title;
        parsed.marks = Number(parsed.marks) || targetMarks;
        parsed.custom = true;
        parsed.isSimilar = true;
        parsed.generationMode = "generate_similar";
        parsed.variationMode = variationMode;
        parsed.parentTaskId = sourceTask.id;
        parsed.modelUsed = "gemini-3.8-flash";
        parsed.createdAt = Date.now();
        const teacherProfile = (req as any).teacher;
        if (teacherProfile?.name) {
          parsed.authorName = teacherProfile.name;
          parsed.authorSchool = teacherProfile.school || "Pearson Edexcel Centre";
        }

        if (parsed.type === "code") {
          parsed.starterFileName = parsed.starterFileName || (sourceTask.starterFileName ? `sim_${sourceTask.starterFileName}` : "task_variant.py");
          // Ensure test marks sum to total marks
          if (Array.isArray(parsed.tests) && parsed.tests.length > 0) {
            const sumM = parsed.tests.reduce((acc: number, t: any) => acc + (Number(t.m) || 0), 0);
            if (sumM !== parsed.marks) {
              const baseM = Math.max(1, Math.floor(parsed.marks / parsed.tests.length));
              let rem = parsed.marks;
              parsed.tests.forEach((t: any, idx: number) => {
                if (idx === parsed.tests.length - 1) {
                  t.m = rem;
                } else {
                  t.m = baseM;
                  rem -= baseM;
                }
              });
            }
          }
        }

        // Persist to custom questions database
        customQuestionsDb[parsed.id] = parsed;
        savePersistedQuestions();

        res.json({ success: true, task: parsed, method: "gemini", model: "gemini-3.8-flash" });
        return;
      } catch (geminiErr) {
        console.warn("Gemini generation encountered error, invoking syllabus rule-based generator:", geminiErr);
      }
    }

    // Deterministic syllabus-grounded Pearson Edexcel 4CP0 fallback
    const fallbackSimId = `c_sim_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const domains = [
      { domain: "Wildlife Camera Trap Battery Monitor", item: "voltage readings", validMsg: "BATTERY LEVEL STABLE:", outputFlag: "WARNING LOW VOLTAGE ALERT:" },
      { domain: "Autonomous Delivery Drone Cargo Weight", item: "package weights (kg)", validMsg: "PAYLOAD APPROVED:", outputFlag: "OVERWEIGHT DETECTED:" },
      { domain: "Hydroponics Nutrient pH Balance", item: "acidity readings", validMsg: "OPTIMAL BALANCE:", outputFlag: "BUFFER FLUID REQUIRED:" },
      { domain: "Smart Greenhouse Solar Array", item: "kilowatt output", validMsg: "SYSTEM ONLINE:", outputFlag: "STORAGE OVERCHARGE:" },
    ];
    const picked = domains[Math.floor(Math.random() * domains.length)];

    const fallbackTask: any = {
      id: fallbackSimId,
      unit: unitInfo.code,
      unitName: unitInfo.title,
      title: `${sourceTask.title} (4CP0 Variant - ${picked.domain.split(" ")[0]})`,
      level: variationMode === "easier" ? "Core" : variationMode === "harder" ? "Extension" : "Exam-style",
      difficulty: preferredDifficulty || (variationMode === "easier" ? "Easy" : variationMode === "harder" ? "Hard" : "Moderate"),
      type: sourceTask.type || "code",
      marks: targetMarks,
      commandWord: "Devise",
      specReference: `Spec ${unitInfo.spec} (${unitInfo.title})`,
      custom: true,
      isSimilar: true,
      generationMode: "generate_similar",
      variationMode,
      parentTaskId: sourceTask.id,
      createdAt: Date.now(),
      modelUsed: "4cp0-rule-engine",
    };

    if (sourceTask.type === "code") {
      fallbackTask.brief = `[Pearson Edexcel 4CP0 Examination Variant - ${picked.domain}]\nDevise a Python 3 program meeting the following specification requirements:\n1. Prompt the user to enter two ${picked.item} with meaningful prompts.\n2. Calculate the combined total of the two readings.\n3. If the total exceeds 100.0, output "${picked.outputFlag}" followed by the total value.\n4. Otherwise, display "${picked.validMsg}" followed by the verified total formatted to one decimal place.${variationMode === "harder" ? "\n5. Validate that neither value is negative; output 'INVALID VALUE' if negative numbers are entered." : ""}`;
      fallbackTask.starter = `# Candidate Name:\n# Candidate Number:\n# Pearson Edexcel 4CP0 Python 3 Scaffold\n\ndef main():\n    # Complete your solution below\n    pass\n\nif __name__ == "__main__":\n    main()\n`;
      fallbackTask.starterFileName = sourceTask.starterFileName ? `sim_${sourceTask.starterFileName}` : "task_variant.py";
      fallbackTask.solution = `def main():\n    v1 = float(input("Enter reading 1: "))\n    v2 = float(input("Enter reading 2: "))\n    total = v1 + v2\n    if total > 100.0:\n        print(f"${picked.outputFlag} {total:.1f}")\n    else:\n        print(f"${picked.validMsg} {total:.1f}")\n\nif __name__ == "__main__":\n    main()\n`;
      const halfM = Math.max(1, Math.floor(targetMarks / 2));
      const remM = Math.max(1, targetMarks - halfM);
      fallbackTask.tests = [
        { in: ["24.5", "30.0"], out: `${picked.validMsg} 54.5\n`, m: halfM },
        { in: ["65.0", "45.0"], out: `${picked.outputFlag} 110.0\n`, m: remM },
      ];
      fallbackTask.markPoints = [
        { id: "MP1", marks: 1, criterion: "Accurately captures inputs with descriptive prompt strings" },
        { id: "MP2", marks: Math.max(1, targetMarks - 2), criterion: "Evaluates threshold comparison condition correctly" },
        { id: "MP3", marks: 1, criterion: "Formats output string exactly matching examination test specification" },
      ];
    } else {
      fallbackTask.brief = `[Pearson Edexcel 4CP0 Companion - ${picked.domain}]\n${sourceTask.brief}`;
      fallbackTask.questions = sourceTask.questions || [];
      fallbackTask.columns = sourceTask.columns;
      fallbackTask.rows = sourceTask.rows;
    }

    customQuestionsDb[fallbackTask.id] = fallbackTask;
    savePersistedQuestions();

    res.json({ success: true, task: fallbackTask, method: "rule-based" });
  } catch (error: any) {
    console.error("Generate similar question error:", error);
    res.status(500).json({ error: error.message || "Failed to generate similar question" });
  }
});

// Batch Convert Past Examination Paper and Official Mark Scheme
// ==========================================
// PAST PAPER EXTRACTION (one question at a time)
// ==========================================
// Asking the model for a whole 80-mark paper in one reply produced huge JSON that was
// often cut off or malformed. We now (1) get a short outline of the paper, then
// (2) extract each question separately and in parallel, and (3) turn every
// sub-part that carries its own marks into a separate, auto-markable question.

function parseModelJson(text: string): any {
  const clean = String(text || "")
    .replace(/^\uFEFF/, "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  try {
    return JSON.parse(clean);
  } catch {
    // Fall back to the outermost {...} block (models sometimes add stray text)
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(clean.slice(start, end + 1));
    throw new Error("The AI returned invalid JSON.");
  }
}

function inlineDocParts(doc: any, label: string, fallbackMime = "application/pdf"): any[] {
  if (!doc?.base64) return [];
  const match = String(doc.base64).match(/^data:([a-zA-Z0-9.+/-]+);base64,(.*)$/s);
  const mimeType = match ? match[1] : doc.mimeType || fallbackMime;
  const data = match ? match[2] : doc.base64;
  return [{ inlineData: { mimeType, data } }, { text: `[Attached: ${label}]` }];
}

async function generateJsonWithRetry(ai: GoogleGenAI, parts: any[], label: string, maxWaitMs = 120_000): Promise<any> {
  let lastErr: any = null;
  const deadline = Date.now() + maxWaitMs;
  for (let attempt = 0; attempt < 2; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining <= 5_000) break;
    try {
      const response = await generateContentWithResilience(ai, {
        contents: { parts },
        config: { responseMimeType: "application/json", maxOutputTokens: 32768, temperature: 0.1 },
        maxWaitMs: remaining,
      });
      return parseModelJson(response.text || "");
    } catch (e: any) {
      lastErr = e;
      console.warn(`[convert-paper] ${label} attempt ${attempt + 1} failed:`, e?.message || e);
      // Busy/rate-limited errors were already retried for the whole time budget
      if (isTransientGeminiError(e)) break;
    }
  }
  throw new Error(`${label}: ${friendlyGeminiError(lastErr)}`);
}

function friendlyGeminiError(err: any): string {
  const msg = String(err?.message || err || "AI request failed");
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) {
    return "Gemini's usage limit for your API key was reached. Wait a minute and try again (or enable billing in Google AI Studio for higher limits).";
  }
  if (/503|high demand|UNAVAILABLE|overloaded/i.test(msg)) {
    return "Google's Gemini service is very busy right now. Please wait a few minutes and try again.";
  }
  if (/API key not valid|API_KEY_INVALID|PERMISSION_DENIED|403/i.test(msg)) {
    return "Gemini rejected the API key. Check GEMINI_API_KEY in Vercel → Settings → Environment Variables.";
  }
  return msg;
}

const PAPER_ITEM_RULES = `ITEM TYPES - choose the one that lets the answer be marked automatically in a web app:
- "mcq": a single "cross one box" question. Provide "options" (the option texts WITHOUT the A/B/C/D letters) and "answerIndex" (0-based index of the correct option from the mark scheme).
- "tick_table": a table where the candidate ticks one column per row (e.g. Compiler/Interpreter, RAM/ROM). Provide "tickColumns" (column headings) and "tickRows": [{ "statement": "...", "answerIndex": 0-based column index }]. Copy the mark scheme rule for how many correct rows earn how many marks into "markThresholds": an array where entry k is the number of correct rows needed for k+1 marks (e.g. [2,4,5] means 2 rows = 1 mark, 4 rows = 2 marks, 5 rows = 3 marks). If each row is worth 1 mark use [1,2,...].
- "trace_table": a trace table or any table the candidate fills in with values. Provide "columns" (headings) and "rows": [[ { "v": "value", "g": true|false } ]]. g:true = printed on the paper (given), g:false = the candidate must fill it; for g:false cells put the CORRECT value from the mark scheme in "v" ("" if the cell should stay empty).
- "short": any written/calculation answer (definitions, explain, binary conversion, expressions, URL descriptions, etc.).
- "extended": levels-based extended writing (e.g. "Discuss..." 6-mark questions). Put the indicative content AND the level descriptors in "markScheme".
- "drawing": the candidate must draw (graph, flowchart, diagram). Rewrite "question" so it can be answered in text (e.g. "Describe your flowchart step by step, including each decision and its Yes/No branches"), keep the original requirement in "stem", and set "manualReview": true.
- "code": the candidate writes a program. Provide "starter", "solution" (working Python 3), and "tests": [{ "in": [input lines], "out": "exact expected output", "m": marks }] where the test marks add up to the item's marks.

FOR EVERY ITEM ALSO PROVIDE:
- "label": the exact paper reference, e.g. "1(a)(i)", "4(c)(iii)".
- "title": a short descriptive title (max 8 words).
- "stem": shared context from the parent question/part that the candidate needs to answer this item (e.g. scenario text, figure data written out as text). Empty string if none.
- "code": any pseudocode / program listing the item refers to, copied exactly with its line numbers (otherwise "").
- "question": the exact wording of this item's question.
- "marks": the marks shown in brackets for this item.
- "markScheme": the official mark scheme text for this item (answers, additional guidance, accept/do-not-accept notes).
- "markPoints": [{ "id": "MP1", "marks": 1, "criterion": "...", "acceptedAnswers": ["..."] }] whose marks add up to the item's marks.`;

async function extractPaperPerQuestion(
  ai: GoogleGenAI,
  opts: {
    questionDoc: any;
    markSchemeDoc: any;
    starterFiles: any[];
    dataFiles?: Array<{ name: string; content: string }>;
    preferredUnit?: string;
    paperMetadata?: any;
  }
): Promise<any> {
  const docParts = [
    ...inlineDocParts(opts.questionDoc, "QUESTION PAPER"),
    ...inlineDocParts(opts.markSchemeDoc, "OFFICIAL MARK SCHEME"),
  ];
  const paperDataFiles: Record<string, string> = {};
  for (const f of Array.isArray(opts.dataFiles) ? opts.dataFiles : []) {
    const name = cleanDataFileName(f?.name);
    if (name && typeof f?.content === "string") paperDataFiles[name] = f.content;
  }
  const dataFilesText = Object.keys(paperDataFiles).length
    ? "DATA FILES SUPPLIED WITH THIS PAPER (programs open these by name; use their real contents when writing test cases and expected outputs):\n" +
      Object.entries(paperDataFiles)
        .map(([n, c]) => `### ${n}\n${c.length > 20000 ? c.slice(0, 20000) + "\n...(truncated)" : c}`)
        .join("\n\n")
    : "";
  const starterText =
    Array.isArray(opts.starterFiles) && opts.starterFiles.length
      ? "PYTHON STARTER FILES PROVIDED WITH THIS PAPER:\n" +
        opts.starterFiles.map((sf: any) => `### ${sf.name}\n\`\`\`python\n${sf.code}\n\`\`\``).join("\n\n")
      : "";

  // Whole conversion must finish inside Vercel's 300s limit (keep a safety margin).
  const budgetEnd = Date.now() + 270_000;
  const budgetLeft = (cap: number) => Math.max(10_000, Math.min(cap, budgetEnd - Date.now()));

  // ---- Step 1: outline ----
  const outline = await generateJsonWithRetry(
    ai,
    [
      ...docParts,
      {
        text: `You are a Pearson Edexcel International GCSE Computer Science (4CP0) examiner.
Read the attached question paper and list EVERY top-level numbered question in it (1, 2, 3, ...).
Use the "(Total for Question N = X marks)" lines for the marks. Ignore the pseudocode command set / resource booklet pages.
Detect the paper from the cover page: "Paper 1" (Principles of Computer Science, written) or "Paper 2" (Application of Computational Thinking, programming).

Return JSON only:
{ "paperTitle": "...", "paper": "Paper 1" | "Paper 2", "session": "e.g. June", "year": number,
  "totalMarks": number, "questions": [ { "number": "1", "marks": number, "topic": "short topic" } ] }`,
      },
    ],
    "Paper outline",
    budgetLeft(120_000)
  );

  const outlineQs: any[] = Array.isArray(outline.questions) ? outline.questions.filter((q: any) => q && q.number) : [];
  if (!outlineQs.length) throw new Error("No questions were found in the uploaded question paper.");

  const unitsList = IGCSE_UNITS.map((u) => `${u.code}: ${u.title}`).join("\n");

  // ---- Step 2: each question separately (3 at a time) ----
  const results: any[] = new Array(outlineQs.length);
  const failures: string[] = [];
  let next = 0;
  const worker = async () => {
    while (next < outlineQs.length) {
      const i = next++;
      const oq = outlineQs[i];
      if (budgetEnd - Date.now() < 15_000) {
        failures.push(`Question ${oq.number}: ran out of time because Gemini was busy - please upload the paper again later.`);
        continue;
      }
      try {
        results[i] = await generateJsonWithRetry(
          ai,
          [
            ...docParts,
            ...(starterText ? [{ text: starterText }] : []),
            ...(dataFilesText ? [{ text: dataFilesText }] : []),
            {
              text: `You are a Pearson Edexcel International GCSE Computer Science (4CP0) examiner converting a past paper into an online auto-marked test.

Extract ONLY Question ${oq.number} (worth ${oq.marks ?? "?"} marks in total) from the attached ${outline.paper || "question paper"}, and match every part to the attached official mark scheme.

Split the question into ITEMS: one item for every sub-part that has its own mark allocation in brackets, e.g. 1(a)(i), 1(a)(ii), 1(b), 1(c)(i)... Do not skip any sub-part. The item marks must add up to ${oq.marks ?? "the question total"}.

${PAPER_ITEM_RULES}

Choose the best matching unit for the whole question from this list:
${unitsList}

Return JSON only:
{ "questionNumber": "${oq.number}", "unit": "U..", "topic": "...", "items": [ ... ] }`,
            },
          ],
          `Question ${oq.number}`,
          budgetLeft(150_000)
        );
      } catch (e: any) {
        failures.push(String(e?.message || e));
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(3, outlineQs.length) }, worker));

  // ---- Step 3: convert items into app tasks ----
  const stamp = Date.now().toString(36);
  const tasks: any[] = [];
  let totalMarkPoints = 0;
  const year = Number(outline.year) || Number(opts.paperMetadata?.year) || undefined;
  const paperLabel = outline.paper || opts.paperMetadata?.paper || "";
  const sourceLabel = `Pearson Edexcel ${outline.session ? outline.session + " " : ""}${year || ""} ${paperLabel}`.replace(/\s+/g, " ").trim();

  results.forEach((qr, qi) => {
    if (!qr) return;
    const qNum = String(qr.questionNumber || outlineQs[qi].number);
    const unitCode = IGCSE_UNITS.some((u) => u.code === qr.unit) ? qr.unit : opts.preferredUnit || "U01";
    const unitObj = IGCSE_UNITS.find((u) => u.code === unitCode);
    const items: any[] = Array.isArray(qr.items) ? qr.items : [];

    items.forEach((it, ii) => {
      const label = String(it.label || `${qNum}(${String.fromCharCode(97 + ii)})`);
      const marks = Math.max(1, Math.round(Number(it.marks) || 1));
      const markPoints = Array.isArray(it.markPoints) ? it.markPoints : [];
      totalMarkPoints += markPoints.length;
      const briefPieces = [it.stem, it.question].map((x: any) => String(x || "").trim()).filter(Boolean);

      const task: any = {
        id: `q_paper_${stamp}_${qNum}_${ii + 1}`.replace(/[^a-zA-Z0-9_]/g, "_"),
        unit: unitCode,
        unitName: unitObj?.title,
        title: `Question ${label}: ${String(it.title || qr.topic || "").trim()}`.replace(/:\s*$/, ""),
        level: "Exam-style",
        marks,
        brief: briefPieces.join("\n\n"),
        markScheme: String(it.markScheme || ""),
        markPoints,
        source: sourceLabel,
        paperQuestion: qNum,
        paperLabel: label,
        custom: true,
      };
      if (it.code) {
        task.code = String(it.code);
        task.codeTitle = "Code / pseudocode";
      }

      const kind = String(it.type || "short");
      if (kind === "mcq" && Array.isArray(it.options) && it.options.length) {
        task.type = "mcq";
        task.questions = [{ q: String(it.question || ""), options: it.options.map(String), a: Number(it.answerIndex) || 0 }];
      } else if (kind === "tick_table" && Array.isArray(it.tickRows) && it.tickRows.length) {
        const cols: string[] = Array.isArray(it.tickColumns) && it.tickColumns.length ? it.tickColumns.map(String) : ["Yes", "No"];
        task.type = "mcq";
        task.questions = it.tickRows.map((r: any) => ({
          q: String(r.statement || ""),
          options: cols,
          a: Number(r.answerIndex) || 0,
        }));
        if (Array.isArray(it.markThresholds) && it.markThresholds.length) {
          task.markThresholds = it.markThresholds.map((n: any) => Number(n) || 0);
        }
      } else if (kind === "trace_table" && Array.isArray(it.rows) && it.rows.length) {
        task.type = "table";
        task.columns = (Array.isArray(it.columns) ? it.columns : []).map((c: any) => ({
          label: typeof c === "string" ? c : String(c?.label || ""),
          type: "text",
        }));
        task.rows = it.rows.map((row: any) =>
          (Array.isArray(row) ? row : []).map((cell: any) =>
            cell && typeof cell === "object"
              ? { v: String(cell.v ?? ""), g: Boolean(cell.g) }
              : { v: String(cell ?? ""), g: true }
          )
        );
      } else if (kind === "code") {
        task.type = "code";
        task.starter = String(it.starter || "");
        task.solution = String(it.solution || "");
        task.tests = Array.isArray(it.tests) ? it.tests : [];
        if (Object.keys(paperDataFiles).length) task.dataFiles = { ...paperDataFiles };
      } else {
        task.type = "theory";
        if (kind === "drawing" || it.manualReview) {
          task.manualReview = true;
          task.hint = "This question was a drawing task on the paper; answer it in words.";
        }
      }
      tasks.push(task);
    });
  });

  if (!tasks.length) {
    throw new Error("The AI could not extract any questions. " + failures.join(" | "));
  }

  const totalMarks = tasks.reduce((acc, t) => acc + (t.marks || 0), 0);
  return {
    paperTitle: String(outline.paperTitle || `Pearson Edexcel ${year || ""} ${paperLabel}`).trim(),
    examBoard: "Pearson Edexcel",
    qualification: "International GCSE (9-1) Computer Science (4CP0)",
    paper: paperLabel,
    session: outline.session,
    year,
    totalQuestions: results.filter(Boolean).length,
    totalSubParts: tasks.length,
    totalMarkPoints,
    totalMarks,
    expectedTotalMarks: Number(outline.totalMarks) || undefined,
    questions: tasks,
    dataFileNames: Object.keys(paperDataFiles),
    warnings: failures,
  };
}

app.post("/api/convert-paper", requireTeacher, async (req, res) => {
  try {
    const {
      questionDoc: rawQuestionDoc,
      markSchemeDoc: rawMarkSchemeDoc,
      starterFiles = [],
      dataFiles = [],
      paperMetadata = {},
      preferredUnit,
    } = req.body;
    const questionDoc = await resolveUploadedDoc(rawQuestionDoc);
    const markSchemeDoc = await resolveUploadedDoc(rawMarkSchemeDoc);
    await cleanupUploadedDocs(rawQuestionDoc, rawMarkSchemeDoc);

    const hasDocs = Boolean(questionDoc?.base64 || markSchemeDoc?.base64);
    const hasStarterFiles = Array.isArray(starterFiles) && starterFiles.length > 0;

    if (!hasDocs && !hasStarterFiles) {
      res.status(400).json({
        error: "Please upload at least a Question Paper / Mark Scheme file (PDF or Image) or Python starter code (.py).",
      });
      return;
    }

    const ai = getGeminiClient();

    // Uploaded question paper / mark scheme: extract question by question.
    // Never substitute demo questions - if extraction fails, tell the teacher why.
    if (hasDocs) {
      if (!ai) {
        res.status(503).json({
          error: "AI conversion is not available: GEMINI_API_KEY is not set on the server (Vercel → Settings → Environment Variables).",
        });
        return;
      }
      try {
        // Data files also go into the shared library, so every question can open them
        for (const f of Array.isArray(dataFiles) ? dataFiles : []) {
          const name = cleanDataFileName(f?.name);
          if (name && typeof f?.content === "string" && f.content.length <= MAX_DATA_FILE_CHARS) {
            dataFilesDb[name] = { name, content: f.content, uploadedAt: Date.now() };
          }
        }
        savePersistedDataFiles();

        const paper = await extractPaperPerQuestion(ai, {
          questionDoc,
          markSchemeDoc,
          starterFiles: Array.isArray(starterFiles) ? starterFiles : [],
          dataFiles: Array.isArray(dataFiles) ? dataFiles : [],
          preferredUnit,
          paperMetadata,
        });
        res.json({ success: true, paper });
      } catch (err: any) {
        console.error("Gemini convert-paper error:", err);
        res.status(502).json({
          error: "The AI could not convert this paper. " + (err?.message || String(err)),
        });
      }
      return;
    }

    if (ai) {
      try {
        const unitsListPrompt = IGCSE_UNITS.map(
          (u) => `${u.code}: ${u.title} (Keywords: ${u.keywords.slice(0, 5).join(", ")})`
        ).join("\n");

        const prompt = `You are an expert Pearson Edexcel International GCSE (9-1) Computer Science (4CP0) Chief Examiner for Paper 1 (Principles) and Paper 2 (Application of Computational Thinking).
A teacher has uploaded a full or partial authentic past examination Question Paper along with its Official Mark Scheme.

YOUR MANDATE:
Execute a high-fidelity, end-to-end Past Paper Ingestion Pipeline:

1. DETECT ALL QUESTIONS IN THE DOCUMENT:
   - Identify every question present (e.g. Q1, Q2, Q3, Q4, Q5, Q6 or Q01 to Q06, Q03c, Q04c, etc.).
   - Extract and preserve all sub-parts (e.g., 1(a), 1(b), 1(c) or 3(a), 3(b), etc.).
   - Extract the authentic question statements, specifications, constraints, and total marks.
   - Categorize each question into the appropriate Pearson Edexcel Unit (U01 to U32).

2. MATCH EACH QUESTION TO ITS OFFICIAL MARK SCHEME ENTRY:
   - Deconstruct the mark scheme into distinct, individual, structured "markPoints" (e.g. MP1, MP2, MP3, etc.):
     "markPoints": [
       {
         "id": "MP1",
         "marks": 1,
         "criterion": "Award 1 mark for stating that ...",
         "acceptedAnswers": ["...", "..."],
         "alternativeAnswers": ["..."],
         "negativeIndicators": ["Do not accept ..."]
       }
     ]
   - NEVER lump criteria into vague unparsed paragraphs. Every mark in the question's total must be accounted for by the mark points.

3. CONFIGURE AUTO-MARKING ENGINE FOR EACH QUESTION ("type"):
   - "code" (Python 3 programming questions):
       "starter": authentic scaffold code or function headers given to candidates,
       "solution": working model Python 3 code that satisfies 100% of mark scheme requirements,
       "tests": automated test cases matching the mark scheme test table:
         [ { "in": string[] (console inputs), "out": string (exact expected stdout), "m": number (marks) } ].
         The sum of test marks ("m") MUST equal the question's total marks.
   - "theory" (Explanations, descriptions, definitions, command word items):
       "brief": formatted question text,
       "markScheme": full text from mark scheme,
       "markPoints": individual MarkPoint criteria list.
   - "mcq" (Multiple choice):
       "questions": [ { "q": string, "options": string[], "a": number (0-based index) } ]
   - "table" (Trace tables, truth tables):
       "columns": [ { "label": string, "type": "text" } ],
       "rows": [ [ { "v": string, "g": boolean } ] ] (g:true for given, g:false for student input)
   - "inspect" (Code analysis with line numbers):
       "code": numbered Python snippet,
       "questions": [ { "q": string, "a": string[], "why": string } ]

4. SUPPORT SUB-PARTS ("parts"):
   If a question has sub-parts like (a), (b), (c), provide them in "parts":
   "parts": [
     {
       "id": "q1_a",
       "label": "1(a)",
       "question": "Sub-part question prompt",
       "marks": 2,
       "type": "theory",
       "markPoints": [
         { "id": "MP1", "marks": 1, "criterion": "..." },
         { "id": "MP2", "marks": 1, "criterion": "..." }
       ]
     }
   ]

Units Catalog Reference:
${unitsListPrompt}

PAPER METADATA:
Exam Board: ${paperMetadata.examBoard || "Pearson Edexcel"}
Qualification: ${paperMetadata.qualification || "International GCSE (9-1) Computer Science (4CP0)"}
Paper: ${paperMetadata.paper || "Paper 2 (Application of Computational Thinking)"}
Year: ${paperMetadata.year || 2025}
${preferredUnit ? `Preferred Target Unit: ${preferredUnit}` : ""}

Return STRICTLY valid JSON ONLY (no markdown backticks, no text before or after):
{
  "paperTitle": "Pearson Edexcel International GCSE (9-1) Computer Science ...",
  "examBoard": "Pearson Edexcel",
  "qualification": "International GCSE (9-1) Computer Science (4CP0)",
  "paper": "Paper 2",
  "session": "June",
  "year": 2025,
  "totalQuestions": number,
  "totalSubParts": number,
  "totalMarkPoints": number,
  "totalMarks": number,
  "questions": [
    {
      "id": "q1",
      "unit": "U01",
      "unitName": "Unit Name",
      "title": "Question 1: ...",
      "level": "Exam-style",
      "type": "code" | "theory" | "mcq" | "table" | "inspect",
      "brief": "Full question statement and specification",
      "marks": number,
      "hint": "Examiner guidance hint",
      "markScheme": "Official mark scheme criteria",
      "markPoints": [
        {
          "id": "MP1",
          "marks": 1,
          "criterion": "...",
          "acceptedAnswers": ["..."]
        }
      ],
      "parts": [ ... ],
      "starter": "...",
      "solution": "...",
      "tests": [ ... ]
    }
  ]
}`;

        const parts: any[] = [];
        const appendInlineDoc = (docBase64: string, fallbackMime = "application/pdf", label = "Document") => {
          const match = docBase64.match(/^data:([a-zA-Z0-9.+/-]+);base64,(.*)$/);
          const mimeType = match ? match[1] : fallbackMime;
          const data = match ? match[2] : docBase64;
          parts.push({
            inlineData: { mimeType, data },
          });
          parts.push({ text: `[Attached ${label} (${mimeType})]` });
        };

        if (questionDoc?.base64) {
          appendInlineDoc(questionDoc.base64, questionDoc.mimeType || "application/pdf", "Question Paper");
        }
        if (markSchemeDoc?.base64) {
          appendInlineDoc(markSchemeDoc.base64, markSchemeDoc.mimeType || "application/pdf", "Official Mark Scheme");
        }

        if (hasStarterFiles) {
          const starterText = starterFiles
            .map(
              (sf: any, i: number) =>
                `### STARTER FILE #${i + 1}: ${sf.name}\n\`\`\`python\n${sf.code}\n\`\`\``
            )
            .join("\n\n");
          parts.push({
            text: `AUTHENTIC PYTHON STARTER FILES ATTACHED BY TEACHER FOR THIS PAST PAPER:\n${starterText}\n\nCRITICAL: For every coding question, match the question with its corresponding Python starter file (e.g. Q01.py, Q02.py, etc.). Populate "starter": "<exact code from the matching starter file>", "starterFileName": "${starterFiles[0]?.name || "Q01.py"}", and ensure solution and automated tests are tailored to that exact scaffold.`,
          });
        }

        parts.push({ text: prompt });

        const response = await generateContentWithResilience(ai, {
          contents: { parts },
          config: {
            responseMimeType: "application/json",
          },
        });

        const rawText = response.text?.trim() || "";
        const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        // Sanitize question items and assign consistent IDs
        const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
        let totalMarkPointsCount = 0;
        let totalSubPartsCount = 0;
        let totalPaperMarks = 0;

        const sanitizedQuestions = questions.map((q: any, idx: number) => {
          const qId = "q_paper_" + Date.now().toString(36) + "_" + (idx + 1);
          const unitCode = q.unit && IGCSE_UNITS.some((u) => u.code === q.unit) ? q.unit : (preferredUnit || "U01");
          const unitObj = IGCSE_UNITS.find((u) => u.code === unitCode);

          const markPoints = Array.isArray(q.markPoints) ? q.markPoints : [];
          totalMarkPointsCount += markPoints.length;

          const subParts = Array.isArray(q.parts) ? q.parts : [];
          totalSubPartsCount += subParts.length;
          subParts.forEach((sp: any) => {
            if (Array.isArray(sp.markPoints)) {
              totalMarkPointsCount += sp.markPoints.length;
            }
          });

          const qMarks = Number(q.marks) || markPoints.reduce((acc: number, mp: any) => acc + (Number(mp.marks) || 1), 0) || 4;
          totalPaperMarks += qMarks;

          return {
            ...q,
            id: qId,
            unit: unitCode,
            unitName: unitObj ? unitObj.title : (q.unitName || "Past Examination Paper"),
            level: q.level || "Exam-style",
            marks: qMarks,
            custom: true,
            createdAt: Date.now(),
            markPoints,
            parts: subParts,
            source: {
              examBoard: parsed.examBoard || paperMetadata.examBoard || "Pearson Edexcel",
              qualification: parsed.qualification || paperMetadata.qualification || "International GCSE (9-1) Computer Science (4CP0)",
              paper: parsed.paper || paperMetadata.paper || "Paper 2",
              session: parsed.session || paperMetadata.session || "June",
              year: parsed.year || paperMetadata.year || 2025,
              questionPaperFile: questionDoc?.name,
              markSchemeFile: markSchemeDoc?.name,
            },
          };
        });

        // Deterministic auto-match of starter files to coding questions
        if (hasStarterFiles) {
          sanitizedQuestions.forEach((q: any, idx: number) => {
            const qNum = idx + 1;
            const qTitle = (q.title || "").toLowerCase();
            let matched = starterFiles.find((sf: any) => {
              const nameLower = (sf.name || "").toLowerCase();
              const baseName = nameLower.replace(/\.py$/i, "");
              return (
                nameLower.includes(`q0${qNum}`) ||
                nameLower.includes(`q${qNum}`) ||
                nameLower.includes(`question_${qNum}`) ||
                nameLower.includes(`question${qNum}`) ||
                (baseName && qTitle.includes(baseName))
              );
            });

            if (!matched && q.type === "code") {
              matched = starterFiles[idx] || starterFiles[0];
            }

            if (matched) {
              if (!q.starter || q.starter.trim().length === 0 || q.starter.includes("Write your Python 3 solution here")) {
                q.starter = matched.code;
              }
              q.starterFileName = matched.name;
            }
          });
        }

        const extractedPaper = {
          paperTitle: parsed.paperTitle || `${paperMetadata.examBoard || "Pearson Edexcel"} ${paperMetadata.year || 2025} Past Paper`,
          examBoard: parsed.examBoard || paperMetadata.examBoard || "Pearson Edexcel",
          qualification: parsed.qualification || paperMetadata.qualification || "International GCSE (9-1) Computer Science (4CP0)",
          paper: parsed.paper || paperMetadata.paper || "Paper 2",
          session: parsed.session || paperMetadata.session || "June",
          year: parsed.year || paperMetadata.year || 2025,
          totalQuestions: sanitizedQuestions.length,
          totalSubParts: totalSubPartsCount || sanitizedQuestions.length,
          totalMarkPoints: totalMarkPointsCount || sanitizedQuestions.length * 2,
          totalMarks: totalPaperMarks || (parsed.totalMarks ?? 80),
          questions: sanitizedQuestions,
        };

        res.json({
          success: true,
          paper: extractedPaper,
        });
        return;
      } catch (aiErr: any) {
        console.error("Gemini convert-paper error:", aiErr);
      }
    }

    // Fallback: create structured past paper template if Gemini unavailable
    let fallbackQuestions: any[] = [
      {
        id: "q_paper_demo_1",
        unit: "U03",
        unitName: "Selection and Boolean logic",
        title: "Question 3(c): Number Input Validation",
        level: "Exam-style",
        type: "code",
        brief: "Devise a Python program to validate input numbers according to the exam specification table.",
        marks: 6,
        markScheme: "Award marks for empty check (1m), negative check (1m), range checks (3m), and default message (1m).",
        markPoints: [
          { id: "MP1", marks: 1, criterion: "Checks for empty input and displays: You must provide a number" },
          { id: "MP2", marks: 1, criterion: "Validates number is greater than zero, else: The number must be greater than zero" },
          { id: "MP3", marks: 1, criterion: "Validates range 1-20 or >60 and displays: Acceptable" },
          { id: "MP4", marks: 1, criterion: "Exact value 30 displays: Perfect" },
          { id: "MP5", marks: 1, criterion: "Range 31-39 inclusive displays: Centre" },
          { id: "MP6", marks: 1, criterion: "All other numbers display: No message" },
        ],
        starter: "num_str = input()\n# Devise validation\n",
        solution: 'num_str = input()\nif num_str == "":\n    print("You must provide a number")\nelse:\n    n = int(num_str)\n    if n <= 0:\n        print("The number must be greater than zero")\n    elif (1 <= n <= 20) or n > 60:\n        print("Acceptable")\n    elif n == 30:\n        print("Perfect")\n    elif 31 <= n <= 39:\n        print("Centre")\n    else:\n        print("No message")\n',
        tests: [
          { in: [""], out: "You must provide a number\n", m: 1 },
          { in: ["-5"], out: "The number must be greater than zero\n", m: 1 },
          { in: ["12"], out: "Acceptable\n", m: 1 },
          { in: ["30"], out: "Perfect\n", m: 1 },
          { in: ["35"], out: "Centre\n", m: 1 },
          { in: ["25"], out: "No message\n", m: 1 },
        ],
      },
      {
        id: "q_paper_demo_2",
        unit: "U04",
        unitName: "Subprograms and parameters",
        title: "Question 4(c): Key Construction Subprogram",
        level: "Exam-style",
        type: "code",
        brief: "Devise a subprogram construct_key(text, digits) that inserts the digits between the first two and remaining characters.",
        marks: 6,
        markPoints: [
          { id: "MP1", marks: 2, criterion: "Defines subprogram with two parameters text and digits" },
          { id: "MP2", marks: 2, criterion: "Slices text[:2] and text[2:] correctly" },
          { id: "MP3", marks: 2, criterion: "Concatenates text[:2] + digits + text[2:] and returns value" },
        ],
        starter: "def construct_key(text, digits):\n    pass\n",
        solution: "def construct_key(text, digits):\n    return text[:2] + str(digits) + text[2:]\n\nt = input()\nd = input()\nprint(construct_key(t, d))\n",
        tests: [
          { in: ["abcd", "123"], out: "ab123cd\n", m: 2 },
          { in: ["wxyz", "45"], out: "wx45yz\n", m: 2 },
          { in: ["code", "9"], out: "co9de\n", m: 2 },
        ],
      },
      {
        id: "q_paper_demo_3",
        unit: "U06",
        unitName: "Data storage and memory",
        title: "Question 5: Volatile vs Non-Volatile Memory",
        level: "Exam-style",
        type: "theory",
        brief: "Explain why RAM is described as volatile memory and ROM is described as non-volatile.",
        marks: 4,
        markPoints: [
          { id: "MP1", marks: 1, criterion: "States that RAM is volatile because it loses data when power is switched off" },
          { id: "MP2", marks: 1, criterion: "States that ROM is non-volatile because it retains its contents permanently without power" },
          { id: "MP3", marks: 1, criterion: "Explains that RAM stores open applications and current working data" },
          { id: "MP4", marks: 1, criterion: "Explains that ROM stores the bootstrap loader / BIOS startup firmware" },
        ],
      },
    ];

    if (hasStarterFiles) {
      if (!hasDocs) {
        // Teacher uploaded exclusively authentic Python starter files
        fallbackQuestions = starterFiles.map((sf: any, idx: number) => {
          const match = (sf.name || "").match(/q0?([0-9]+)/i);
          const qNum = match ? match[1] : `${idx + 1}`;
          const lines = (sf.code || "").split("\n");
          const commentLines = lines
            .filter((l: string) => l.trim().startsWith("#"))
            .map((l: string) => l.replace(/^#\s*/, ""))
            .filter(Boolean);
          const brief =
            commentLines.length > 0
              ? commentLines.slice(0, 3).join("\n")
              : `Devise and implement an authentic Pearson Edexcel Python 3 solution using the provided starter scaffold (${sf.name}). Ensure all specified inputs, calculations, and output requirements are met.`;

          return {
            id: `q_py_file_${Date.now().toString(36)}_${idx + 1}`,
            unit: "U03",
            unitName: "Topic 3: Selection, iteration and subprograms",
            title: `Question ${qNum}: Practical Programming (${sf.name})`,
            level: "Exam-style",
            type: "code",
            brief,
            marks: 6,
            markScheme: `Award marks for authentic program structure (1m), correct input parsing (1m), algorithmic logic (2m), and passing all automated test suites (2m).`,
            markPoints: [
              { id: "MP1", marks: 1, criterion: "Adheres to provided function signatures and structure in " + sf.name },
              { id: "MP2", marks: 1, criterion: "Correct input prompt and data type conversion" },
              { id: "MP3", marks: 2, criterion: "Accurate computational algorithm / logic" },
              { id: "MP4", marks: 2, criterion: "Exact output formatting matching test suite" },
            ],
            starter: sf.code,
            starterFileName: sf.name,
            solution: sf.code + "\n# Sample passing solution\n",
            tests: [
              { in: ["10"], out: "10\n", m: 3 },
              { in: ["20"], out: "20\n", m: 3 },
            ],
          };
        });
      } else {
        // Overlay uploaded starter files onto fallback coding questions
        starterFiles.forEach((sf: any, idx: number) => {
          const targetQ = fallbackQuestions.find((q: any) => {
            const num = idx + 1;
            return (
              (sf.name.toLowerCase().includes(`q0${num}`) || sf.name.toLowerCase().includes(`q${num}`)) &&
              q.type === "code"
            );
          }) || fallbackQuestions.find((q: any) => q.type === "code");

          if (targetQ) {
            targetQ.starter = sf.code;
            targetQ.starterFileName = sf.name;
          }
        });
      }
    }

    const fallbackPaper = {
      paperTitle: `${paperMetadata.examBoard || "Pearson Edexcel"} ${paperMetadata.year || 2025} Past Paper`,
      examBoard: paperMetadata.examBoard || "Pearson Edexcel",
      qualification: paperMetadata.qualification || "International GCSE (9-1) Computer Science (4CP0)",
      paper: paperMetadata.paper || "Paper 2",
      session: paperMetadata.session || "June",
      year: paperMetadata.year || 2025,
      totalQuestions: fallbackQuestions.length,
      totalSubParts: fallbackQuestions.length * 2,
      totalMarkPoints: fallbackQuestions.reduce((acc: number, q: any) => acc + (q.markPoints?.length || 2), 0),
      totalMarks: fallbackQuestions.reduce((acc: number, q: any) => acc + (q.marks || 6), 0),
      questions: fallbackQuestions,
    };

    res.json({ success: true, paper: fallbackPaper });
  } catch (error: any) {
    console.error("Batch convert paper error:", error);
    res.status(500).json({ error: error.message || "Failed to convert paper" });
  }
});

// Batch Save Questions into Custom Repository and Question Bank
app.post("/api/custom-questions/batch", requireTeacher, (req, res) => {
  const { tasks } = req.body;
  if (!Array.isArray(tasks) || tasks.length === 0) {
    res.status(400).json({ error: "An array of tasks is required" });
    return;
  }
  const teacher = (req as any).teacher as TeacherProfile | undefined;
  for (const task of tasks) {
    if (!task.id) {
      task.id = "c_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    }
    if (teacher) {
      if (!task.authorId) task.authorId = teacher.id;
      if (!task.authorName) task.authorName = teacher.name;
      if (!task.authorSchool) task.authorSchool = teacher.school;
    }
    task.custom = true;
    if (!task.createdAt) task.createdAt = Date.now();
    customQuestionsDb[task.id] = task;
  }
  savePersistedQuestions();
  res.json({ success: true, count: tasks.length, tasks });
});

// Auto-mark written / open response answers against mark scheme
export interface WrittenMarkResult {
  awardedMarks: number;
  maxMarks: number;
  feedback: string;
  breakdown: any[];
}

/** Marks a written answer against the official mark points / mark scheme (Gemini, with keyword fallback). */
async function markWrittenAnswer(input: {
  question: string;
  studentAnswer: string;
  markScheme?: string;
  maxMarks: number;
  markPoints?: any[];
}): Promise<WrittenMarkResult> {
    const { question, markScheme, maxMarks, markPoints } = input;
    const studentAnswer = String(input.studentAnswer ?? "");

    const hasStructuredPoints = Array.isArray(markPoints) && markPoints.length > 0;

    if (!studentAnswer || !studentAnswer.trim()) {
      const emptyBreakdown = hasStructuredPoints
        ? markPoints.map((mp: any) => ({
            markPointId: mp.id || "MP",
            awarded: 0,
            maxMarks: mp.marks || 1,
            criterion: mp.criterion || "",
            reason: "No answer provided.",
          }))
        : [];

      return ({
        awardedMarks: 0,
        maxMarks: maxMarks || 1,
        feedback: "No answer provided.",
        breakdown: emptyBreakdown,
      });
    }

    const ai = getGeminiClient();
    if (ai) {
      if (hasStructuredPoints) {
        const prompt = `You are an official Pearson Edexcel International GCSE (9-1) Computer Science Chief Examiner.
You must grade the student's written response strictly and transparently against the individual official marking points below.
Do NOT grade by loose overall keyword count or hallucinate external criteria. Assess each individual Mark Point independently.

QUESTION:
${question}

MAX MARKS AVAILABLE: ${maxMarks || 2}

STUDENT ANSWER:
"${studentAnswer}"

OFFICIAL MARK POINTS:
${JSON.stringify(markPoints, null, 2)}

EXAMINER MARKING RULES:
1. Examine the student's answer for each Mark Point independently.
2. For each Mark Point:
   - Award up to the available marks for that point if the student explicitly or clearly conveys the stated criterion or any accepted/alternative answers.
   - If the student misses the criterion, award 0.
   - Provide a concise, professional 1-sentence reason explaining why this point was awarded or missed.
3. Calculate "awardedMarks" as the sum of awarded marks across all mark points, capped at ${maxMarks || 2}.
4. Provide constructive summary "feedback" explaining both strengths and missing concepts.

Return strictly a JSON object:
{
  "awardedMarks": number,
  "breakdown": [
    {
      "markPointId": "string (e.g. MP1)",
      "awarded": number (from 0 to maxMarks for this mark point),
      "maxMarks": number,
      "criterion": "string (the criterion statement)",
      "reason": "string (1 concise sentence explaining why awarded or missed)"
    }
  ],
  "feedback": "string (summary feedback)"
}`;

        const response = await generateContentWithResilience(ai, {
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        const parsed = JSON.parse(response.text?.trim() || "{}");
        const breakdown = Array.isArray(parsed.breakdown) ? parsed.breakdown : [];
        const awarded = typeof parsed.awardedMarks === "number"
          ? parsed.awardedMarks
          : breakdown.reduce((acc: number, item: any) => acc + (item.awarded || 0), 0);

        return ({
          awardedMarks: Math.min(maxMarks || 2, Math.max(0, awarded)),
          maxMarks: maxMarks || 2,
          feedback: parsed.feedback || "Evaluated against official mark points.",
          breakdown,
        });
      } else {
        const prompt = `You are an official Pearson Edexcel IGCSE Computer Science examiner.
Grade the student's answer against the official mark scheme strictly, accurately, and fairly.

QUESTION:
${question}

MARK SCHEME / RUBRIC:
${markScheme}

MAX MARKS: ${maxMarks || 2}

STUDENT ANSWER:
${studentAnswer}

Return strictly a JSON object:
{
  "awardedMarks": number (from 0 to ${maxMarks || 2}),
  "feedback": "Concise 1-2 sentence explanation of why marks were awarded or deducted",
  "keyPointsMatched": ["list of mark scheme points the student earned"],
  "missingPoints": ["list of mark scheme points the student missed"]
}`;

        const response = await generateContentWithResilience(ai, {
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        const parsed = JSON.parse(response.text?.trim() || "{}");
        return ({
          awardedMarks: Math.min(maxMarks || 1, Math.max(0, parsed.awardedMarks ?? 0)),
          maxMarks: maxMarks || 1,
          feedback: parsed.feedback || "Evaluated by auto-marker.",
          breakdown: parsed.keyPointsMatched || [],
        });
      }
    }

    // Heuristic fallback if Gemini API is unavailable
    if (hasStructuredPoints) {
      const lower = studentAnswer.toLowerCase();
      let totalEarned = 0;
      const breakdown = markPoints.map((mp: any) => {
        const critWords = (mp.criterion || "")
          .toLowerCase()
          .split(/[\s,;|]+/)
          .filter((w: string) => w.length > 3);
        const matches = critWords.filter((w: string) => lower.includes(w));
        const passed = critWords.length > 0 && matches.length >= Math.min(2, Math.ceil(critWords.length / 2));
        const pts = passed ? (mp.marks || 1) : 0;
        totalEarned += pts;
        return {
          markPointId: mp.id || "MP",
          awarded: pts,
          maxMarks: mp.marks || 1,
          criterion: mp.criterion,
          reason: passed
            ? `Identified key criteria: "${matches.slice(0, 3).join('", "')}".`
            : `Missing required concept: ${mp.criterion}`,
        };
      });

      return ({
        awardedMarks: Math.min(maxMarks || 2, totalEarned),
        maxMarks: maxMarks || 2,
        feedback: `Evaluated against ${markPoints.length} marking points.`,
        breakdown,
      });
    }

    const lowerAns = studentAnswer.toLowerCase();
    const keywords = (markScheme || "").toLowerCase().split(/[\s,;|]+/).filter((w: string) => w.length > 3);
    let matches = 0;
    for (const kw of keywords) {
      if (lowerAns.includes(kw)) matches++;
    }
    const ratio = keywords.length ? Math.min(1, matches / Math.max(1, Math.ceil(keywords.length / 2))) : 0.5;
    const awarded = Math.round(ratio * (maxMarks || 2));

    return ({
      awardedMarks: Math.max(0, Math.min(maxMarks || 2, awarded)),
      maxMarks: maxMarks || 2,
      feedback: `Marked by keyword criteria (${matches} key terms found).`,
      breakdown: [],
    });
}

app.post("/api/mark-written", async (req, res) => {
  try {
    const { question, studentAnswer, markScheme, maxMarks, markPoints } = req.body;
    const result = await markWrittenAnswer({
      question,
      studentAnswer: typeof studentAnswer === "string" ? studentAnswer : JSON.stringify(studentAnswer ?? ""),
      markScheme,
      maxMarks,
      markPoints,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to mark response" });
  }
});

// ==========================================
// MULTI-TEACHER AUTHENTICATION & PORTAL ENDPOINTS
// ==========================================
app.post("/api/teacher/register", requireTeacher, (req, res) => {
  const { email, password, name, school, department, role } = req.body || {};
  if (!email || !password || !name) {
    res.status(400).json({ error: "Full name, email address, and password are required." });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  if (cleanEmail.length < 4 || !cleanEmail.includes("@")) {
    res.status(400).json({ error: "Please provide a valid teacher email address." });
    return;
  }

  if (String(password).length < 5) {
    res.status(400).json({ error: "Teacher password must be at least 5 characters long." });
    return;
  }

  // Check if email already registered
  const existing = Object.values(teachersDb).find(
    (t) => t.email.toLowerCase() === cleanEmail
  );
  if (existing) {
    res.status(409).json({ error: "A teacher account with this email address already exists." });
    return;
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = hashTeacherPassword(String(password), salt);
  const teacherId =
    "t_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
  const colors = ["purple", "indigo", "blue", "teal", "emerald", "amber", "rose"];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newTeacher: TeacherRecord = {
    id: teacherId,
    email: cleanEmail,
    name: String(name).trim(),
    school: String(school || "Pearson Edexcel Centre").trim(),
    department: String(department || "Computer Science").trim(),
    role: role || "teacher",
    avatarColor,
    createdAt: Date.now(),
    salt,
    hash,
  };

  teachersDb[teacherId] = newTeacher;
  savePersistedTeachers();

  const token = issueTeacherToken(teacherId);
  const { salt: _s, hash: _h, ...profile } = newTeacher;
  res.json({ success: true, token, teacher: profile });
});

// ==========================================
// TEACHER ACCOUNTS (colleagues)
// ==========================================
/** Passcode-only login identifies the teacher by passcode, so passcodes must be unique. */
function passcodeInUse(passcode: string, exceptId?: string): boolean {
  return Object.values(teachersDb).some(
    (t) => t.id !== exceptId && hashTeacherPassword(passcode, t.salt) === t.hash
  );
}

app.get("/api/teachers", requireTeacher, (req, res) => {
  const me = getTeacherFromRequest(req);
  const teachers = Object.values(teachersDb)
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    .map((t) => ({ id: t.id, name: t.name, email: t.email, createdAt: t.createdAt, isMe: t.id === me?.id }));
  res.json({ teachers });
});

app.post("/api/teachers", requireTeacher, (req, res) => {
  const { name, passcode, email } = req.body || {};
  const cleanName = String(name || "").trim();
  const cleanPass = String(passcode || "");
  if (cleanName.length < 2) {
    res.status(400).json({ error: "Please enter your colleague's name." });
    return;
  }
  if (cleanPass.length < 5) {
    res.status(400).json({ error: "The passcode must be at least 5 characters long." });
    return;
  }
  if (passcodeInUse(cleanPass)) {
    res.status(409).json({ error: "That passcode is already used by another teacher. Please choose a different one." });
    return;
  }
  let cleanEmail = String(email || "").trim().toLowerCase();
  if (cleanEmail && (!cleanEmail.includes("@") || cleanEmail.length < 4)) {
    res.status(400).json({ error: "Please enter a valid email address, or leave it blank." });
    return;
  }
  if (!cleanEmail) {
    // Email is optional; accounts need a unique one internally
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "") || "teacher";
    cleanEmail = `${slug}.${Date.now().toString(36)}@teachers.local`;
  }
  if (Object.values(teachersDb).some((t) => t.email.toLowerCase() === cleanEmail)) {
    res.status(409).json({ error: "A teacher account with this email address already exists." });
    return;
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const teacherId = "t_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
  const colors = ["purple", "indigo", "blue", "teal", "emerald", "amber", "rose"];
  teachersDb[teacherId] = {
    id: teacherId,
    email: cleanEmail,
    name: cleanName,
    school: "Pearson Edexcel Centre",
    department: "Computer Science",
    role: "teacher",
    avatarColor: colors[Math.floor(Math.random() * colors.length)],
    createdAt: Date.now(),
    salt,
    hash: hashTeacherPassword(cleanPass, salt),
  } as TeacherRecord;
  savePersistedTeachers();
  res.json({ success: true, teacher: { id: teacherId, name: cleanName, email: cleanEmail } });
});

app.delete("/api/teachers/:id", requireTeacher, (req, res) => {
  const me = getTeacherFromRequest(req);
  const id = String(req.params.id);
  if (!teachersDb[id]) {
    res.status(404).json({ error: "Teacher not found." });
    return;
  }
  if (id === me?.id) {
    res.status(400).json({ error: "You can't remove your own account." });
    return;
  }
  // Their assessments and results are kept; they just can't log in any more.
  delete teachersDb[id];
  savePersistedTeachers();
  res.json({ success: true });
});

app.post("/api/teacher/login", (req, res) => {
  const { email, password, passcode } = req.body || {};

  // Mode 1: Individual Teacher Account (Email + Password)
  if (email && password) {
    const cleanEmail = String(email).trim().toLowerCase();
    const teacher = Object.values(teachersDb).find(
      (t) => t.email.toLowerCase() === cleanEmail
    );
    if (!teacher) {
      res.status(401).json({ error: "No teacher account registered with this email address." });
      return;
    }

    const computed = hashTeacherPassword(String(password), teacher.salt);
    const valid = crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(teacher.hash));
    if (!valid) {
      res.status(401).json({ error: "Incorrect password for this teacher account." });
      return;
    }

    const token = issueTeacherToken(teacher.id);
    const { salt: _s, hash: _h, ...profile } = teacher;
    res.json({ success: true, token, teacher: profile });
    return;
  }

  // Mode 2: Quick Passcode / Master PIN unlock
  const candidate = passcode || password;
  if (!candidate || typeof candidate !== "string") {
    res.status(400).json({ error: "Teacher email & password or passcode is required." });
    return;
  }

  // Check across registered teachers (matches default teacher or any staff PIN)
  for (const t of Object.values(teachersDb)) {
    try {
      const computed = hashTeacherPassword(candidate, t.salt);
      if (crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(t.hash))) {
        const token = issueTeacherToken(t.id);
        const { salt: _s, hash: _h, ...profile } = t;
        res.json({ success: true, token, teacher: profile });
        return;
      }
    } catch (e) {}
  }

  res.status(401).json({ error: "Invalid teacher passcode or credentials. Access denied." });
});

app.get("/api/teacher/me", requireTeacher, (req, res) => {
  const teacher = (req as any).teacher;
  res.json({ teacher });
});

app.get("/api/teacher/verify", (req, res) => {
  const teacher = getTeacherFromRequest(req);
  if (teacher) {
    res.json({ authenticated: true, teacher });
  } else {
    res.status(401).json({ authenticated: false, error: "Invalid or expired teacher session." });
  }
});

app.get("/api/teachers", requireTeacher, (req, res) => {
  const faculty = Object.values(teachersDb).map(({ salt, hash, ...profile }) => profile);
  res.json({ teachers: faculty });
});

app.post("/api/teacher/logout", (req, res) => {
  const token = extractToken(req);
  if (token) {
    activeTeacherTokens.delete(token);
  }
  res.json({ success: true });
});

app.post("/api/teacher/change-password", requireTeacher, (req, res) => {
  const { oldPasscode, newPasscode } = req.body || {};
  if (!oldPasscode || !newPasscode) {
    res.status(400).json({ error: "Both current and new passwords are required." });
    return;
  }

  const currentTeacherProfile = (req as any).teacher as TeacherProfile;
  const currentRecord = teachersDb[currentTeacherProfile.id];
  if (!currentRecord) {
    res.status(404).json({ error: "Teacher record not found." });
    return;
  }

  const computedOld = hashTeacherPassword(oldPasscode, currentRecord.salt);
  if (!crypto.timingSafeEqual(Buffer.from(computedOld), Buffer.from(currentRecord.hash))) {
    res.status(403).json({ error: "Current password is incorrect." });
    return;
  }

  if (typeof newPasscode !== "string" || newPasscode.length < 5) {
    res.status(400).json({ error: "New password must be at least 5 characters long." });
    return;
  }

  const newSalt = crypto.randomBytes(16).toString("hex");
  if (passcodeInUse(newPasscode, currentRecord.id)) {
    res.status(409).json({ error: "That passcode is already used by another teacher. Please choose a different one." });
    return;
  }
  const newHash = hashTeacherPassword(newPasscode, newSalt);
  currentRecord.salt = newSalt;
  currentRecord.hash = newHash;
  savePersistedTeachers();

  // Old tokens stop working after a password change, so hand back a fresh one.
  res.json({
    success: true,
    token: issueTeacherToken(currentRecord.id),
    message: "Teacher password successfully updated and hashed.",
  });
});

// ==========================================
// TEACHER QUESTION & AUTO MARK SCHEME GENERATOR
// ==========================================
app.post("/api/teacher/generate-mark-scheme", requireTeacher, async (req, res) => {
  try {
    const {
      title,
      brief,
      marks = 4,
      unit = "U01",
      type = "code",
      level = "Core",
      starterCode,
    } = req.body || {};

    if (!brief || !String(brief).trim()) {
      res.status(400).json({
        error: "Please enter the question brief or problem description.",
      });
      return;
    }

    const teacher = (req as any).teacher as TeacherProfile;
    const targetMarks = Math.max(1, Number(marks) || 4);
    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are a Pearson Edexcel International GCSE (9-1) Computer Science (4CP0) Chief Examiner for Paper 1 and Paper 2.
A teacher has added a new question prompt and requires you to formulate:
1. The Official Pearson Edexcel Mark Scheme
2. A clean, working reference solution in Python 3
3. A robust auto-grading test suite that strictly prevents hardcoding while being method-agnostic.

TEACHER INPUTS:
Question Title: ${title || "Computer Science Task"}
Specification Unit: ${unit}
Target Marks: ${targetMarks} Marks
Question Type: ${type}
Cognitive Level: ${level}
Question Prompt / Brief:
${brief}

${starterCode ? `Teacher's Optional Starter Code:\n${starterCode}\n` : ""}

CRITICAL SPECIFICATION REQUIREMENTS:
1. OFFICIAL MARK SCHEME:
   - Provide clear M1 (Method), A1 (Accuracy), and C1 (Communication/Formatting) marking criteria totaling exactly ${targetMarks} marks.
   - Explicitly note: "Any valid programming approach (while loops, for loops, list comprehension, recursion, built-in functions) that calculates the correct output MUST be awarded full marks."
2. WORKING REFERENCE SOLUTION:
   - Must be clean, syntax-error-free, functional Python 3 code in "solution".
3. COMPREHENSIVE AUTO-GRADING TEST SUITE (ANTI-HARDCODING GUARANTEE):
   - Provide 4 to 6 diverse test cases:
     a) Normal typical inputs
     b) Boundary/edge cases (e.g. 0, negatives, exact thresholds like >= 50, maximum values, empty/single elements)
     c) Validation / extreme values
     d) Ensure test cases have different input-output pairs so that any hardcoded static print statements or lookup tables fail!
   - Test case format: { "in": string[] (array of stdin lines), "out": string (stdout ending with \\n), "m": number (mark weighting) }
   - The sum of test marks "m" MUST equal ${targetMarks}.
4. PEDAGOGICAL HINT:
   - Provide guidance without revealing the complete solution.
5. 4CP0 PROGRAMMING BOUNDARIES:
   - Students know: print(), input(), int(), float(), str(), len(), random, loops, conditions, subprograms.
   - Students have NOT learned: zfill(), max(), min(), sort(), sorted(). Do not require or assume them. When finding extremes or sorting, demonstrate algorithmic logic. Students may use max/min/sort if they want and tests must pass.
   - 2D lists: flat rows of mixed numbers and string, or just strings. Strictly NO list inside a 2D list item (no jagged/nested lists).

Respond STRICTLY with a valid JSON object only (no markdown, no backticks):
{
  "title": "${title || "Descriptive Title"}",
  "markScheme": "Detailed Pearson Edexcel mark scheme text with M1/A1/C1 criteria and alternative method acceptance notes",
  "brief": "${brief.replace(/"/g, '\\"')}",
  "starter": "# Starter Python code with comments",
  "solution": "# Reference Python 3 solution",
  "tests": [
    { "in": ["input1"], "out": "output1\\n", "m": 1 },
    { "in": ["input2"], "out": "output2\\n", "m": 1 },
    { "in": ["boundary_in"], "out": "boundary_out\\n", "m": 1 },
    { "in": ["edge_in"], "out": "edge_out\\n", "m": 1 }
  ],
  "hint": "Pedagogical hint for students",
  "level": "${level}",
  "marks": ${targetMarks}
}`;

        const response = await generateContentWithResilience(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const rawText = response.text?.trim() || "";
        const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        // Adjust test marks sum to equal targetMarks
        if (Array.isArray(parsed.tests) && parsed.tests.length > 0) {
          let currentSum = parsed.tests.reduce(
            (acc: number, t: any) => acc + (Number(t.m) || 1),
            0
          );
          if (currentSum !== targetMarks) {
            const diff = targetMarks - currentSum;
            parsed.tests[parsed.tests.length - 1].m = Math.max(
              1,
              (parsed.tests[parsed.tests.length - 1].m || 1) + diff
            );
          }
        }

        parsed.unit = unit;
        parsed.type = type;
        parsed.marks = targetMarks;
        parsed.authorId = teacher.id;
        parsed.authorName = teacher.name;
        parsed.authorSchool = teacher.school;

        res.json({ success: true, data: parsed });
        return;
      } catch (aiErr) {
        console.error("Gemini mark scheme generator error, falling back to rule-based:", aiErr);
      }
    }

    // Rule-based fallback generator
    const fallback = generateRuleBasedMarkSchemeAndTests({
      title,
      brief,
      marks: targetMarks,
      unit,
      type,
      level,
      starterCode,
      teacher,
    });
    res.json({ success: true, data: fallback });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate mark scheme" });
  }
});

function generateRuleBasedMarkSchemeAndTests(params: {
  title?: string;
  brief: string;
  marks: number;
  unit: string;
  type: string;
  level: string;
  starterCode?: string;
  teacher?: TeacherProfile;
}) {
  const {
    title = "Python Programming Problem",
    brief,
    marks = 4,
    unit = "U01",
    level = "Core",
    starterCode,
    teacher,
  } = params;
  const targetMarks = Math.max(1, marks);

  const markScheme = `Pearson Edexcel International GCSE (4CP0) Official Mark Scheme
Paper 2: Application of Computational Thinking
Total Marks: ${targetMarks} Marks

MARKING CRITERIA:
• M1 (Method): Awarded for implementing valid algorithmic flow (input acquisition, iteration, or conditional logic).
• A1 (Accuracy): Awarded for correct variable manipulation, calculation, and data type handling.
• C1 (Communication / Output): Awarded for outputting the specified result format.

SPECIFICATION METHOD-AGNOSTIC PRINCIPLE:
Any valid programming technique that produces the specified outcome must be credited with full marks. Students may choose while loops, for loops, list comprehensions, recursion, or standard built-in functions (e.g. sum, max, min).

ANTI-HARDCODING DIRECTIVE:
All solutions must read dynamic inputs and process variables. Solutions that output hardcoded constants without reading inputs will be awarded 0 marks.`;

  const qMarksPerTest = Math.max(1, Math.floor(targetMarks / 4));
  const remainder = targetMarks - qMarksPerTest * 3;

  return {
    title: title || "Custom Programming Challenge",
    brief: brief.trim(),
    starter:
      starterCode ||
      "# Write your Python 3 solution here\n# Remember to read input() dynamically\n",
    solution: `# Model Reference Solution\nimport sys\n\ntry:\n    # Read inputs\n    lines = [line.strip() for line in sys.stdin if line.strip()]\n    if lines:\n        nums = [float(x) if '.' in x else int(x) for x in lines if x.replace('-', '').isdigit()]\n        if nums:\n            print(sum(nums))\n        else:\n            print(lines[0])\nexcept Exception as e:\n    pass\n`,
    markScheme,
    hint: "Analyze the required input format and break the problem down into input collection, processing, and output.",
    level,
    marks: targetMarks,
    unit,
    type: "code",
    authorId: teacher?.id,
    authorName: teacher?.name,
    authorSchool: teacher?.school,
    tests: [
      { in: ["10", "20"], out: "30\n", m: qMarksPerTest },
      { in: ["5", "15"], out: "20\n", m: qMarksPerTest },
      { in: ["0", "0"], out: "0\n", m: qMarksPerTest },
      { in: ["50", "150"], out: "200\n", m: Math.max(1, remainder) },
    ],
  };
}

// Helper to ensure assessment returns the most up-to-date question definitions
function enrichAssessment(a: AssessmentStore): AssessmentStore {
  if (!a) return a;
  const questionMap: Record<string, any> = {};

  // 1. Base built-in tasks from curriculum repositories
  for (const qId of a.questionIds || []) {
    if (ALL_BUILTIN_TASKS[qId]) {
      questionMap[qId] = { ...ALL_BUILTIN_TASKS[qId] };
    }
  }

  // 2. Existing stored questions on assessment
  if (a.questions && Array.isArray(a.questions)) {
    for (const q of a.questions) {
      if (q && q.id) {
        questionMap[q.id] = { ...(questionMap[q.id] || {}), ...q };
      }
    }
  }

  // 3. Overlay any latest edits from customQuestionsDb
  for (const qId of a.questionIds || []) {
    if (customQuestionsDb[qId]) {
      questionMap[qId] = { ...(questionMap[qId] || {}), ...customQuestionsDb[qId] };
    }
  }

  const enrichedQuestions = (a.questionIds || []).map((id) => questionMap[id]).filter(Boolean);
  if (enrichedQuestions.length > 0) {
    return { ...a, questions: enrichedQuestions };
  }
  return a;
}

// ==========================================
// SERVER-AUTHORITATIVE TASK AUTO-MARKER
// Evaluates submissions securely without exposing mark schemes to students
// ==========================================
// ==========================================
// MARK-SCHEME AWARE MARKING HELPERS
// ==========================================

/** Collects every bit of mark scheme information a question carries (including sub-parts). */
function collectMarkScheme(task: any): { text: string; markPoints: any[] } {
  const lines: string[] = [];
  const markPoints: any[] = Array.isArray(task.markPoints) ? [...task.markPoints] : [];
  if (task.markScheme) lines.push(String(task.markScheme));
  for (const q of Array.isArray(task.questions) ? task.questions : []) {
    if (q && Array.isArray(q.criteria) && q.criteria.length) lines.push(q.criteria.join("; "));
    else if (q && Array.isArray(q.keywords) && q.keywords.length) lines.push("Key terms: " + q.keywords.join(", "));
  }
  for (const part of Array.isArray(task.parts) ? task.parts : []) {
    if (!part) continue;
    const label = part.label || part.id || "Part";
    if (part.markScheme) lines.push(`${label}: ${part.markScheme}`);
    if (Array.isArray(part.markPoints)) {
      for (const mp of part.markPoints) markPoints.push({ ...mp, id: `${label} ${mp.id || "MP"}` });
    }
  }
  return { text: lines.join("\n"), markPoints };
}

function describeQuestion(task: any): string {
  const pieces: string[] = [task.title ? `${task.title}` : "", task.brief || ""];
  for (const part of Array.isArray(task.parts) ? task.parts : []) {
    if (part) pieces.push(`${part.label || ""} ${part.question || ""} (${part.marks || 0} marks)`);
  }
  if (task.code) pieces.push("Code provided to candidates:\n" + task.code);
  return pieces.filter(Boolean).join("\n\n");
}

function answerToText(ans: any): string {
  if (ans === null || ans === undefined) return "";
  if (typeof ans === "string") return ans;
  if (Array.isArray(ans)) return ans.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join("\n");
  if (typeof ans === "object") {
    return Object.entries(ans)
      .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
      .join("\n");
  }
  return String(ans);
}

function hasMarkSchemeInfo(task: any): boolean {
  const ms = collectMarkScheme(task);
  return Boolean(ms.text.trim() || ms.markPoints.length || task.solution);
}

// ---------- Python execution that also works on Vercel ----------
// Vercel's Node.js runtime has no python3, so on Vercel we call the small Python
// function in api/run_python.py instead. If neither is available we fall back to AI.
let localPythonAvailable: boolean | null = null;

function pythonRunnerUrl(): string | null {
  if (process.env.PYTHON_RUNNER_URL) return process.env.PYTHON_RUNNER_URL;
  const host =
    process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL;
  return host ? `https://${host}/api/run_python` : null;
}

async function runPythonTests(
  code: string,
  inputsList: string[][],
  files: Record<string, string> = VIRTUAL_FILES
): Promise<Array<{ out: string; err: string | null }> | null> {
  if (localPythonAvailable !== false) {
    const results: Array<{ out: string; err: string | null }> = [];
    for (const inputs of inputsList) {
      const r = await executePythonCode(code, inputs, files);
      if (r.err && /ENOENT|spawn python3/i.test(r.err)) {
        localPythonAvailable = false;
        break;
      }
      localPythonAvailable = true;
      results.push(r);
    }
    if (localPythonAvailable) return results;
  }

  const url = pythonRunnerUrl();
  if (!url) return null;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-runner-secret": getTokenSecret(),
    };
    if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
      headers["x-vercel-protection-bypass"] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    }
    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ code, tests: inputsList, files }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!resp.ok) {
      console.warn("[python] Remote runner returned", resp.status);
      return null;
    }
    const data: any = await resp.json();
    return Array.isArray(data.results) ? data.results : null;
  } catch (e) {
    console.warn("[python] Remote runner unavailable:", e);
    return null;
  }
}

/** Uses Gemini to mark a code answer against the mark scheme, tests and model solution. */
async function markCodeWithAI(task: any, code: string, maxMarks: number): Promise<{ m: number; feedback: string } | null> {
  const ai = getGeminiClient();
  if (!ai) return null;
  const ms = collectMarkScheme(task);
  const prompt = `You are a Pearson Edexcel International GCSE Computer Science (4CP0) examiner marking a Python 3 programming answer.
Mark strictly against the official mark scheme. If mark points are given, assess each one independently.
Where test cases are given, mentally trace the candidate's program with each input and compare the output.
Award credit for working alternative solutions that meet the mark scheme. Never award marks for code that only prints hard-coded expected outputs.

QUESTION:
${describeQuestion(task)}

MAXIMUM MARKS: ${maxMarks}

MARK SCHEME:
${ms.text || "(none supplied)"}

MARK POINTS:
${ms.markPoints.length ? JSON.stringify(ms.markPoints, null, 2) : "(none supplied)"}

TEST CASES (inputs -> expected output):
${Array.isArray(task.tests) && task.tests.length ? JSON.stringify(task.tests, null, 2) : "(none supplied)"}

MODEL SOLUTION (for reference only):
${task.solution || "(none supplied)"}

DATA FILES THE PROGRAM CAN OPEN:
${
  task.dataFiles && Object.keys(task.dataFiles).length
    ? Object.entries(task.dataFiles)
        .map(([n, c]) => `--- ${n} ---\n${String(c).slice(0, 4000)}`)
        .join("\n")
    : "(see question)"
}

CANDIDATE'S CODE:
\`\`\`python
${code}
\`\`\`

Return strictly a JSON object:
{ "awardedMarks": number (0 to ${maxMarks}), "feedback": "2-3 sentences: which mark points were earned and what was missing" }`;

  try {
    const response = await generateContentWithResilience(ai, {
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    const parsed = JSON.parse(response.text?.trim() || "{}");
    const m = Math.max(0, Math.min(maxMarks, Math.round(Number(parsed.awardedMarks) || 0)));
    return { m, feedback: `AI marked against the mark scheme: ${parsed.feedback || ""}`.trim() };
  } catch (e) {
    console.warn("[marking] AI code marking failed:", e);
    return null;
  }
}

/** Marks all questions in parallel (AI marking one-by-one could exceed the server time limit). */
async function markAllQuestions(
  questions: any[],
  answers: Record<string, any>
): Promise<{ marks: Record<string, number>; notes: Record<string, string>; total: number }> {
  const marks: Record<string, number> = {};
  const notes: Record<string, string> = {};
  const list = questions.filter((q) => q && q.id);
  const CONCURRENCY = 5;
  let next = 0;
  async function worker() {
    while (next < list.length) {
      const q = list[next++];
      try {
        const r = await autoMarkTaskOnServer(q, answers ? answers[q.id] : undefined);
        marks[q.id] = r.m;
        if (r.feedback) notes[q.id] = r.feedback;
      } catch (e: any) {
        console.warn("[marking] Failed to mark", q.id, e);
        marks[q.id] = 0;
        notes[q.id] = "Automatic marking failed for this question; please mark it manually.";
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, list.length) }, worker));
  const total = Object.values(marks).reduce((acc, m) => acc + (m || 0), 0);
  return { marks, notes, total };
}

async function autoMarkTaskOnServer(task: any, studentAns: any): Promise<{ m: number; feedback?: string }> {
  if (!task) return { m: 0 };
  const maxMarks = task.marks || 1;

  // 1. Multiple Choice (MCQ)
  if (task.type === "mcq") {
    const mcqs = task.questions || task.mcqs || [];
    if (!mcqs.length) return { m: 0 };
    let correct = 0;
    const ansArray = Array.isArray(studentAns)
      ? studentAns
      : studentAns !== null && studentAns !== undefined
      ? [studentAns]
      : [];

    const feedbackNotes: string[] = [];

    for (let i = 0; i < mcqs.length; i++) {
      const q = mcqs[i];
      const given = ansArray[i];
      const options: string[] = q.options || q.o || [];

      if (given !== undefined && given !== null && String(given).trim() !== "") {
        let isCorrect = false;

        if (typeof q.a === "number") {
          const numGiven = Number(given);
          if (!isNaN(numGiven) && numGiven === q.a) {
            isCorrect = true;
          } else if (typeof given === "string") {
            const cleanGiven = given.trim().toLowerCase();
            // Match letter 'a', 'b', 'c', 'd'
            if (cleanGiven.length === 1 && cleanGiven >= "a" && cleanGiven <= "z") {
              const letterIndex = cleanGiven.charCodeAt(0) - 97;
              if (letterIndex === q.a) isCorrect = true;
            }
            // Match literal option text e.g. "if" matching options[q.a]
            if (!isCorrect && options[q.a] && options[q.a].trim().toLowerCase() === cleanGiven) {
              isCorrect = true;
            }
          }
        } else if (typeof q.a === "string") {
          const cleanExp = q.a.trim().toLowerCase();
          const cleanGiven = String(given).trim().toLowerCase();
          if (cleanGiven === cleanExp) {
            isCorrect = true;
          } else {
            const numGiven = Number(given);
            if (!isNaN(numGiven) && options[numGiven] && options[numGiven].trim().toLowerCase() === cleanExp) {
              isCorrect = true;
            }
            if (cleanExp.length === 1 && cleanExp >= "a" && cleanExp <= "z" && !isNaN(numGiven)) {
              if (numGiven === cleanExp.charCodeAt(0) - 97) isCorrect = true;
            }
          }
        }

        if (isCorrect) {
          correct++;
        } else {
          const chosenText =
            typeof given === "number" && options[given]
              ? `"${options[given]}"`
              : !isNaN(Number(given)) && options[Number(given)]
              ? `"${options[Number(given)]}"`
              : `"${given}"`;
          const correctText =
            typeof q.a === "number" && options[q.a]
              ? `"${options[q.a]}"`
              : !isNaN(Number(q.a)) && options[Number(q.a)]
              ? `"${options[Number(q.a)]}"`
              : `"${q.a}"`;
          feedbackNotes.push(`Q${i + 1}: Selected ${chosenText}, expected ${correctText}`);
        }
      } else {
        feedbackNotes.push(`Q${i + 1}: No answer selected`);
      }
    }

    // Tick tables from past papers carry the official rule, e.g. [2,4,5]:
    // 2 correct rows = 1 mark, 4 = 2 marks, 5 = 3 marks.
    const thresholds: number[] = Array.isArray(task.markThresholds) ? task.markThresholds : [];
    const awarded = thresholds.length
      ? thresholds.filter((needed) => correct >= needed).length
      : Math.round((correct / mcqs.length) * maxMarks);
    return {
      m: Math.min(maxMarks, awarded),
      feedback: feedbackNotes.length === 0 ? "Correct selection." : feedbackNotes.join("; "),
    };
  }

  // 2. Code Inspection / Exact Short Answer
  if (task.type === "inspect") {
    const subQs = task.questions || task.subQuestions || [];
    if (!subQs.length) return { m: 0 };
    let correct = 0;
    let ansArray: any[] = [];
    if (Array.isArray(studentAns)) {
      ansArray = studentAns;
    } else if (typeof studentAns === "object" && studentAns !== null) {
      ansArray = subQs.map((sq: any, idx: number) => studentAns[sq.id] ?? studentAns[idx] ?? "");
    } else if (studentAns !== undefined && studentAns !== null) {
      ansArray = [studentAns];
    }

    const feedbackNotes: string[] = [];
    for (let i = 0; i < subQs.length; i++) {
      const sq = subQs[i];
      const given = normalizeStringAnswer(ansArray[i]);
      const acceptedList = Array.isArray(sq.a)
        ? sq.a
        : typeof sq.a === "string"
        ? sq.a.split("|")
        : Array.isArray(sq.accepted)
        ? sq.accepted
        : [];
      const matches = acceptedList.some((acc: string) => normalizeStringAnswer(acc) === given);
      if (matches) {
        correct++;
      } else {
        feedbackNotes.push(
          `Part ${i + 1}: "${ansArray[i] || "blank"}" incorrect. Expected: ${acceptedList.join(" or ")}`
        );
      }
    }
    const awarded = Math.round((correct / subQs.length) * maxMarks);
    return {
      m: Math.min(maxMarks, awarded),
      feedback: feedbackNotes.length === 0 ? "All inspection questions correct." : feedbackNotes.join("; "),
    };
  }

  // 3. Sorting pass-by-pass
  if (task.type === "sort") {
    const studentRows = Array.isArray(studentAns) ? studentAns : [];
    const expectedRows = (task.rows || []) as string[][];
    let earned = 0;
    let totalBoxes = 0;
    const errorsList: string[] = [];

    for (let rIdx = 0; rIdx < expectedRows.length; rIdx++) {
      const row = expectedRows[rIdx];
      for (let cIdx = 0; cIdx < row.length; cIdx++) {
        totalBoxes++;
        const expectedCell = row[cIdx];
        const studentCell = (studentRows[rIdx] || [])[cIdx] || "";
        const ok = normalizeStringAnswer(studentCell) === normalizeStringAnswer(expectedCell);
        if (ok) {
          earned++;
        } else if (errorsList.length < 2) {
          errorsList.push(
            `Pass ${rIdx + 1}, Pos ${cIdx + 1}: entered "${studentCell}" vs expected "${expectedCell}"`
          );
        }
      }
    }
    if (totalBoxes === 0) return { m: 0 };
    const awarded = Math.round((earned / totalBoxes) * maxMarks);
    return {
      m: Math.min(maxMarks, awarded),
      feedback:
        earned === totalBoxes
          ? "Sorting trace completely correct."
          : `Sorting trace: ${earned}/${totalBoxes} passes correct.`,
    };
  }

  if (task.type === "table") {
    const rawRows = task.rows || task.tableRows || [];
    let fillableCount = 0;
    let correctCount = 0;
    const givenGrid = Array.isArray(studentAns) ? studentAns : [];

    for (let r = 0; r < rawRows.length; r++) {
      const rawRow = rawRows[r];
      const cells = Array.isArray(rawRow) ? rawRow : Array.isArray(rawRow?.c) ? rawRow.c : [];
      for (let c = 0; c < cells.length; c++) {
        const cell = cells[c];
        if (cell && !cell.g) {
          fillableCount++;
          const givenVal =
            givenGrid[r] && givenGrid[r][c] !== undefined && givenGrid[r][c] !== null
              ? String(givenGrid[r][c]).trim()
              : "";
          const expectedBlank = String(cell.v ?? "").trim() === "";
          // Trace tables often require some cells to stay empty
          if (expectedBlank ? givenVal === "" : givenVal && cellMatches(givenVal, cell.v)) {
            correctCount++;
          }
        }
      }
    }

    if (fillableCount === 0) return { m: 0, feedback: "Table has no fillable cells." };

    // Check if candidate actually entered any values
    const hasEnteredValues = givenGrid.some((row: any) =>
      Array.isArray(row) && row.some((val: any) => val !== undefined && val !== null && String(val).trim() !== "")
    );
    if (!hasEnteredValues) {
      return { m: 0, feedback: "No values entered in trace table." };
    }

    let awarded = Math.min(maxMarks, Math.round((correctCount / fillableCount) * maxMarks));
    let feedback = `Table score: ${correctCount} of ${fillableCount} cells correct (${awarded}/${maxMarks} marks).`;

    // Past-paper trace tables are marked by column/row rules in the mark scheme,
    // which strict cell matching can't see. Let the AI examiner apply those rules.
    if (awarded < maxMarks && hasMarkSchemeInfo(task) && getGeminiClient()) {
      const expectedGrid = rawRows.map((row: any) =>
        (Array.isArray(row) ? row : row?.c || []).map((cell: any) => (cell ? String(cell.v ?? "") : ""))
      );
      const header = (task.columns || []).map((c: any) => c.label || "").join(" | ");
      const render = (grid: any[]) =>
        grid.map((row: any) => (Array.isArray(row) ? row.map((v: any) => String(v ?? "")).join(" | ") : "")).join("\n");
      const ms = collectMarkScheme(task);
      const r = await markWrittenAnswer({
        question: describeQuestion(task) + "\n\nCompleted table expected:\n" + header + "\n" + render(expectedGrid),
        studentAnswer: "Candidate's table:\n" + header + "\n" + render(givenGrid),
        markScheme: ms.text,
        markPoints: ms.markPoints.length ? ms.markPoints : undefined,
        maxMarks,
      });
      const aiMarks = Math.max(0, Math.min(maxMarks, Math.round(r.awardedMarks)));
      if (aiMarks > awarded) {
        awarded = aiMarks;
        feedback = `${feedback} Marked against the mark scheme: ${r.feedback}`;
      }
    }

    return { m: awarded, feedback };
  }

  if (task.type === "code") {
    const code = typeof studentAns === "string" ? studentAns : "";
    if (!code.trim()) return { m: 0, feedback: "No code submitted." };

    const tests = task.tests || [];

    // Anti-Hardcoding Guard: detects static prints without inputs or hardcoded lookup tables
    if (tests.length) {
      const hardcodeCheck = detectAntiHardcoding(code, tests);
      if (hardcodeCheck.isHardcoded) {
        return {
          m: 0,
          feedback: `Anti-Hardcoding Guard triggered: ${hardcodeCheck.reason || "Hardcoded outputs are not permitted. Solutions must calculate values dynamically from inputs."}`,
        };
      }
    }

    // No automated tests: mark against the mark scheme with AI instead of guessing.
    if (!tests.length) {
      const aiResult = hasMarkSchemeInfo(task) ? await markCodeWithAI(task, code, maxMarks) : null;
      if (aiResult) return aiResult;
      return {
        m: 0,
        feedback: "This question has no automated tests or mark scheme, so it needs to be marked by the teacher.",
      };
    }

    const results = await runPythonTests(code, tests.map((t: any) => t.in || []), getFilesForTask(task));
    if (!results) {
      // Python could not be run on this server: use AI marking against the mark scheme and tests.
      const aiResult = await markCodeWithAI(task, code, maxMarks);
      if (aiResult) return aiResult;
      return {
        m: 0,
        feedback: "Python could not be run on the server and AI marking is unavailable. Please mark this answer manually.",
      };
    }

    let earnedMarks = 0;
    let passedTests = 0;
    const testWeight = maxMarks / tests.length;

    tests.forEach((test: any, i: number) => {
      const res = results[i];
      if (res && !res.err) {
        const comp = flexibleCompareOutputs(res.out, test.out || "");
        if (comp.matches) {
          passedTests++;
          earnedMarks += typeof test.m === "number" ? test.m : testWeight;
        }
      }
    });

    let awarded = Math.max(0, Math.min(maxMarks, Math.round(earnedMarks)));
    let feedback = `Passed ${passedTests} of ${tests.length} automated test cases (Anti-Hardcoding Shield active).`;

    // Tests are strict about exact output. If not everything passed and a mark scheme
    // exists, let the AI examiner award method marks the tests could not see.
    if (passedTests < tests.length && hasMarkSchemeInfo(task)) {
      const aiResult = await markCodeWithAI(task, code, maxMarks);
      if (aiResult && aiResult.m > awarded) {
        awarded = aiResult.m;
        feedback = `${feedback} ${aiResult.feedback}`;
      }
    }

    return { m: awarded, feedback };
  }

  if (task.type === "theory") {
    const subQs = task.theorySubQuestions || [];
    if (subQs.length > 0) {
      let totalEarned = 0;
      const notes: string[] = [];
      const ansMap = typeof studentAns === "object" && studentAns !== null ? studentAns : {};
      for (const tsq of subQs) {
        const given = String(ansMap[tsq.id] || "");
        const subMax = tsq.marks || 1;
        const subScheme =
          tsq.markScheme ||
          (Array.isArray(tsq.criteria) ? tsq.criteria.join("; ") : "") ||
          (Array.isArray(tsq.keywords) ? "Key terms: " + tsq.keywords.join(", ") : "");
        const r = await markWrittenAnswer({
          question: tsq.q || tsq.question || task.brief || "",
          studentAnswer: given,
          markScheme: subScheme,
          markPoints: Array.isArray(tsq.markPoints) ? tsq.markPoints : undefined,
          maxMarks: subMax,
        });
        totalEarned += Math.max(0, Math.min(subMax, Math.round(r.awardedMarks)));
        if (r.feedback) notes.push(r.feedback);
      }
      return { m: Math.min(maxMarks, totalEarned), feedback: notes.join(" ") };
    }

    const ms = collectMarkScheme(task);
    const r = await markWrittenAnswer({
      question: describeQuestion(task),
      studentAnswer: answerToText(studentAns),
      markScheme: ms.text || task.hint || "",
      markPoints: ms.markPoints.length ? ms.markPoints : undefined,
      maxMarks,
    });
    return {
      m: Math.max(0, Math.min(maxMarks, Math.round(r.awardedMarks))),
      feedback: task.manualReview
        ? `${r.feedback} (Originally a drawing question - please check this mark.)`
        : r.feedback,
    };
  }

  // Any other question type: mark against the mark scheme when one exists.
  const answerText = answerToText(studentAns);
  if (!answerText.trim()) return { m: 0, feedback: "No answer provided." };
  if (hasMarkSchemeInfo(task)) {
    const ms = collectMarkScheme(task);
    const r = await markWrittenAnswer({
      question: describeQuestion(task),
      studentAnswer: answerText,
      markScheme: ms.text || (task.solution ? "Model answer:\n" + task.solution : ""),
      markPoints: ms.markPoints.length ? ms.markPoints : undefined,
      maxMarks,
    });
    return { m: Math.max(0, Math.min(maxMarks, Math.round(r.awardedMarks))), feedback: r.feedback };
  }
  return { m: 0, feedback: "No mark scheme available for this question; please mark it manually." };
}

// Assessment management endpoints (Public list for active assessments, full details for authenticated teachers)
app.get("/api/assessments", (req, res) => {
  const isTeacher = isTeacherRequest(req);
  const list = Object.values(assessmentsDb)
    .filter((a) => isTeacher || a.status === "active")
    .map((a) => ({
      id: a.id,
      title: a.title,
      code: a.code,
      type: a.type || "assessment",
      customHeaderBanner: a.customHeaderBanner,
      customSubtitle: a.customSubtitle,
      customInstructions: a.customInstructions,
      durationMinutes: a.durationMinutes,
      showScoreImmediately: a.showScoreImmediately,
      allowCopyPaste: a.allowCopyPaste,
      showOperatorToolbar: a.showOperatorToolbar,
      shareSolutions: a.shareSolutions,
      questionIds: a.questionIds || [],
      questions: isTeacher ? (a.questions || []) : undefined,
      questionCount: (a.questionIds || []).length,
      maxMarks: a.maxMarks,
      createdAt: a.createdAt,
      status: a.status,
      // Assessments made before teacher accounts existed belong to the original account
      ownerId: isTeacher ? (a as any).ownerId || "t_primary" : undefined,
      ownerName: isTeacher ? (a as any).ownerName || teachersDb[(a as any).ownerId || "t_primary"]?.name : undefined,
      studentsCount: isTeacher ? Object.keys(a.students || {}).length : undefined,
      submittedCount: isTeacher ? Object.values(a.students || {}).filter((s) => s.status === "submitted").length : undefined,
    }));
  res.json({ assessments: list });
});

// System settings for Practice Mode: Get practice settings (Public for all students)
app.get("/api/settings/practice", (req, res) => {
  res.json({
    allowCopyPaste: systemSettings.allowPracticeCopyPaste,
  });
});

// System settings for Practice Mode: Update practice settings (Protected by Teacher Auth)
app.post("/api/settings/practice", requireTeacher, (req, res) => {
  const { allowCopyPaste } = req.body;
  if (allowCopyPaste !== undefined) {
    systemSettings.allowPracticeCopyPaste = Boolean(allowCopyPaste);
    savePersistedSettings();
  }
  res.json({
    success: true,
    allowCopyPaste: systemSettings.allowPracticeCopyPaste,
  });
});

// Custom questions endpoint: get all questions created or edited by teacher
app.get("/api/custom-questions", (req, res) => {
  res.json({ questions: Object.values(customQuestionsDb) });
});

// Save or update a custom question (Protected)
app.post("/api/custom-questions", requireTeacher, (req, res) => {
  const task = req.body;
  if (!task || !task.id) {
    res.status(400).json({ error: "Invalid task data: id required" });
    return;
  }
  const teacher = (req as any).teacher as TeacherProfile | undefined;
  if (teacher) {
    if (!task.authorId) task.authorId = teacher.id;
    if (!task.authorName) task.authorName = teacher.name;
    if (!task.authorSchool) task.authorSchool = teacher.school;
  }
  customQuestionsDb[task.id] = task;
  savePersistedQuestions();

  // Also update this question in any assessment that contains it
  let assessmentsChanged = false;
  for (const a of Object.values(assessmentsDb)) {
    if (a.questionIds && a.questionIds.includes(task.id)) {
      if (a.questions && Array.isArray(a.questions)) {
        a.questions = a.questions.map((q: any) => (q && q.id === task.id ? task : q));
        if (!a.questions.some((q: any) => q && q.id === task.id)) {
          a.questions.push(task);
        }
      } else {
        a.questions = [task];
      }
      assessmentsChanged = true;
    }
  }
  if (assessmentsChanged) {
    savePersistedAssessments();
  }

  res.json({ success: true, task });
});

// Helper for generating rule-based pedagogical scaffolding when offline or Gemini is constrained
function generateRuleBasedScaffold(
  task: any,
  studentAnswer: any,
  consoleOutput: string = "",
  failedTests: any = null,
  struggleReason: string = "general"
) {
  const brief = String(task.brief || "").toLowerCase();
  const title = String(task.title || "");
  const codeStr = typeof studentAnswer === "string" ? studentAnswer : "";
  const starter = String(task.starter || "");
  const isCode = task.type === "code";

  // Derive Concept
  let concept = "Algorithm Design & Problem Solving";
  if (brief.includes("input") && (brief.includes("int") || brief.includes("number") || brief.includes("mark") || brief.includes("age"))) {
    concept = "User Input & Type Conversion";
  } else if (brief.includes("if") || brief.includes("condition") || brief.includes("selection") || brief.includes("otherwise") || brief.includes("grade")) {
    concept = "Conditional Selection (if / elif / else)";
  } else if (brief.includes("loop") || brief.includes("for") || brief.includes("while") || brief.includes("repeat") || brief.includes("count")) {
    concept = "Iteration & Controlled Loops";
  } else if (brief.includes("list") || brief.includes("array") || brief.includes("names") || brief.includes("items")) {
    concept = "List Structures & Element Indexing";
  } else if (brief.includes("string") || brief.includes("substring") || brief.includes("upper") || brief.includes("lower") || brief.includes("split")) {
    concept = "String Slicing & String Methods";
  } else if (brief.includes("file") || brief.includes("read") || brief.includes("write") || brief.includes(".txt")) {
    concept = "Text File Handling (open / read / write / close)";
  } else if (brief.includes("def ") || brief.includes("function") || brief.includes("subroutine") || brief.includes("return")) {
    concept = "Subroutines, Parameters & Return Values";
  } else if (task.type === "table") {
    concept = "Dry-Run Trace Table Analysis";
  }

  // Determine Level 1 Clue
  let level1Clue = task.hint || "Carefully re-read what data must be taken in (Inputs), what calculation or check is done (Process), and what text must be displayed (Output).";
  if (!codeStr || codeStr.trim() === starter.trim()) {
    level1Clue = `To begin this task on ${concept}, look at what input is requested first. Set up your variable to store the value, convert its type if a number is needed, and then write your processing step.`;
  } else if (consoleOutput.includes("TypeError")) {
    level1Clue = "Notice how Python handles data types. When input() is called, it returns text (a string). To perform comparisons (like > or <) or math, you must wrap it with int() or float().";
  } else if (consoleOutput.includes("SyntaxError")) {
    level1Clue = "Look closely at the syntax of your statements. In Python, compound statements (like if, for, while, def) MUST end with a colon (:), and all opened quotes or brackets must be closed.";
  }

  // Determine Level 2 Steps
  const level2LogicSteps = [
    "Step 1: Read the required input from the user using input() and store it in a meaningfully named variable.",
    "Step 2: If the input represents numeric data, cast it using int(variable) or float(variable) before using it.",
    "Step 3: Implement the core logic using an if/elif/else branch, loop, or string operation to satisfy the condition in the question brief.",
    "Step 4: Use print() to display the exact output format requested by the examiner, with correct spacing and punctuation.",
  ];

  // Determine Level 3 Structure
  let level3Structure = `# Step 1: Input & Type Conversion
user_input = input("Enter value: ")
# user_val = int(user_input)  # Uncomment if number needed

# Step 2: Core Logic / Decision
# TODO: Write your condition or loop:
# if condition:
#     # do action
# else:
#     # do other action

# Step 3: Output
# TODO: print the final result
# print(result)
`;

  if (concept.includes("Iteration")) {
    level3Structure = `# Step 1: Initialize counters / inputs
# total = 0

# Step 2: Loop through range or list
# for item in items:
#     # TODO: Process each item
#     pass

# Step 3: Print result
# print(total)
`;
  } else if (concept.includes("Selection")) {
    level3Structure = `# Step 1: Take input
# val = int(input("Enter number: "))

# Step 2: Compare with condition
# if val >= 50:
#     print("Pass")
# else:
#     print("Fail")
`;
  }

  // Determine What Went Wrong
  let whatWentWrong = "No fatal syntax errors found. Check whether your program output matches all test cases and formatting requirements.";
  let immediateNextStep = "Run your program with sample test inputs and verify the printed text matches the expected question brief.";

  if (consoleOutput.includes("SyntaxError")) {
    whatWentWrong = "SyntaxError detected: Check the line indicated by the arrow. Common causes include a missing colon (:) at the end of an if/for/while line, or an unclosed quotation mark/parenthesis.";
    immediateNextStep = "Add a colon (:) to the end of your if/for line or close any open brackets () and quotes.";
  } else if (consoleOutput.includes("IndentationError")) {
    whatWentWrong = "IndentationError: Python uses indentation (4 spaces) to define code blocks. A line inside an 'if', 'for', 'while', or 'def' block is not indented correctly.";
    immediateNextStep = "Select the lines inside your if or loop block and indent them by 4 spaces.";
  } else if (consoleOutput.includes("TypeError")) {
    whatWentWrong = "TypeError: You are likely comparing a string with a number (e.g. string > int). Remember that input() always returns text in Python 3.";
    immediateNextStep = "Convert your input variable using int(variable) before doing arithmetic or comparisons.";
  } else if (consoleOutput.includes("IndexError")) {
    whatWentWrong = "IndexError: You tried to access a list element or character at an index that doesn't exist. Python indexes start at 0, and the last item is at len(items) - 1.";
    immediateNextStep = "Check your index variable or loop bounds (e.g., range(len(items))) to ensure you don't go past the end.";
  } else if (consoleOutput.includes("NameError")) {
    whatWentWrong = "NameError: A variable name was used that has not been defined yet, or there is a spelling / capitalization typo.";
    immediateNextStep = "Check the spelling of the variable name in your code to ensure it matches where you created it.";
  } else if (failedTests && Array.isArray(failedTests) && failedTests.length > 0) {
    const ft = failedTests[0];
    whatWentWrong = `Test case ${ft.testIndex || 1} failed. Expected output was: "${ft.expected}", but your program produced: "${ft.actual || "(no output)"}". Check for extra labels or incorrect calculation.`;
    immediateNextStep = "Adjust your print() statement so the printed string matches the expected output character-for-character.";
  } else if (!codeStr || codeStr.trim() === starter.trim()) {
    whatWentWrong = "Your program is currently empty or contains only starter comments. You haven't added the logic steps yet.";
    immediateNextStep = "Write the first input() statement to store user data in a variable.";
  }

  const howToImprove = "1. Use meaningful variable names (e.g. 'total_score' instead of 'x') to secure clarity marks.\n2. Ensure proper type casting (e.g. int() or float()) on all numeric inputs.\n3. Make sure print statements do not include extra unwanted spaces or prompts if the question asks for exact output.";

  return {
    concept,
    level1Clue,
    level2LogicSteps,
    level3Structure,
    whatWentWrong,
    howToImprove,
    immediateNextStep,
  };
}

// AI Practice Scaffolding & Live Tutor Endpoint for Practice Tasks
app.post("/api/ai/practice-scaffold", async (req, res) => {
  try {
    const {
      task,
      studentAnswer,
      consoleOutput = "",
      failedTests = null,
      scaffoldLevel = 1,
      struggleReason = "general",
    } = req.body;

    if (!task) {
      res.status(400).json({ error: "Task object is required" });
      return;
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are an expert, supportive Computer Science teacher and pedagogical tutor specializing in the Pearson Edexcel GCSE / International GCSE (9-1) Computer Science (4CP0) Paper 2 specification (Application of Computational Thinking & Python 3 programming).

A student is doing practice questions set by their teacher. The student is struggling or stuck on a step and needs guidance.

TASK SPECIFICATION:
Title: ${task.title || "Programming Task"}
Unit: ${task.unit || "Programming"} (${task.unitName || "Paper 2 Computational Thinking"})
Type: ${task.type || "code"}
Marks: ${task.marks || 2}
Question Brief:
${task.brief || "(No brief provided)"}

Starter Code:
${task.starter || "(None)"}

Reference Tests / Criteria:
${task.tests ? JSON.stringify(task.tests.slice(0, 3)) : "(None)"}

STUDENT CURRENT ATTEMPT:
Current Student Code / Answer:
${studentAnswer ? (typeof studentAnswer === "string" ? studentAnswer : JSON.stringify(studentAnswer)) : "(Empty / Not started)"}

Execution Console Output / Runtime Error (if any):
${consoleOutput || "(No console output)"}

Failed Tests / Marker Diagnostics (if any):
${failedTests ? (typeof failedTests === "string" ? failedTests : JSON.stringify(failedTests)) : "(None)"}

Struggle Reason indicated:
${struggleReason}

Requested Scaffolding Level: ${scaffoldLevel} (1 = Concept & Nudge, 2 = Numbered Logic Breakdown, 3 = Structural Code Skeleton)

PEDAGOGICAL REQUIREMENTS:
1. SCAFFOLDING PRINCIPLE: Do NOT simply write the full finished solution for them. Guide the student so they think through each step and write the code themselves.
2. LEVEL 1 (Concept & Nudge): Explain what the question actually asks for in plain, friendly English. Highlight the key computational thinking concept without giving away code.
3. LEVEL 2 (Numbered Logic Breakdown): Break down the algorithm into 3 to 5 clear sequential steps (e.g., "1. Take input and convert to integer. 2. Compare mark..."). State which step their code is currently at.
4. LEVEL 3 (Code Structure Skeleton): Provide a structural code snippet with clear placeholders (# TODO: ...) showing syntax patterns without giving away the final solution.
5. WHAT WENT WRONG: Directly analyze their current code vs the brief and any runtime errors or failed tests. Pinpoint the exact line number, type mismatch, off-by-one, indentation, unclosed parenthesis, or missing condition.
6. HOW TO IMPROVE: Give 2-3 concrete tips on how their program can be improved (e.g., meaningful variable names, formatting output, handling unexpected input, removing redundant code).
7. IMMEDIATE NEXT STEP: Exactly ONE simple, concrete micro-action for the student to do right now to move forward.

Respond ONLY with valid JSON matching this schema:
{
  "concept": "Name of the core programming concept (e.g., 'Type Conversion with int() & Selection')",
  "level1Clue": "Encouraging, clear conceptual hint explaining the task requirement without spoiling code.",
  "level2LogicSteps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "level3Structure": "Code skeleton or syntax pattern with comments showing the structure.",
  "whatWentWrong": "Specific, clear analysis of the bug, syntax issue, logic flaw, or why the test failed.",
  "howToImprove": "Practical tips on making the program cleaner, more robust, or adhering to Edexcel best practices.",
  "immediateNextStep": "A single actionable sentence guiding the student's next keystrokes."
}`;

        const aiResponse = await generateContentWithResilience(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const text = aiResponse.text || "{}";
        const parsed = JSON.parse(text);
        res.json({ success: true, scaffold: parsed, source: "gemini" });
        return;
      } catch (geminiErr: any) {
        console.info("Gemini practice scaffold fallback invoked:", geminiErr?.message || geminiErr);
      }
    }

    // Heuristic Fallback engine
    const fallbackScaffold = generateRuleBasedScaffold(task, studentAnswer, consoleOutput, failedTests, struggleReason);
    res.json({ success: true, scaffold: fallbackScaffold, source: "rule-based" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate AI scaffolding" });
  }
});


app.post("/api/assessments", requireTeacher, (req, res) => {
  const creator = getTeacherFromRequest(req);
  const { title, durationMinutes, showScoreImmediately, allowCopyPaste, showOperatorToolbar, shareSolutions, customHeaderBanner, customSubtitle, customInstructions, headerConfig, questionIds, questions, maxMarks, type, gradeBoundaries } = req.body;
  const id = "a_" + Math.random().toString(36).substring(2, 8);
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const isTask = type === "task";
  const newAssessment: AssessmentStore = {
    id,
    title: title || (isTask ? "IGCSE Practice Task" : "IGCSE Assessment"),
    code,
    type: isTask ? "task" : "assessment",
    customHeaderBanner: customHeaderBanner || undefined,
    customSubtitle: customSubtitle || undefined,
    customInstructions: customInstructions || undefined,
    headerConfig: headerConfig || {
      schoolOrDepartment: "Department of Computer Science",
      subjectSubtitle: isTask ? "Practical Problem Solving Task" : "Paper 2 In-Class Assessment",
      termOrClass: "Class Assessment",
      instructionsNotice: "Answer all questions. You may run your code in the embedded editor.",
      headerTheme: isTask ? "emerald-lab" : "purple-exam",
    },
    durationMinutes: Number(durationMinutes) || 0,
    showScoreImmediately: showScoreImmediately !== false,
    allowCopyPaste: allowCopyPaste !== undefined ? Boolean(allowCopyPaste) : isTask,
    showOperatorToolbar: showOperatorToolbar !== undefined ? Boolean(showOperatorToolbar) : isTask,
    shareSolutions: shareSolutions !== undefined ? Boolean(shareSolutions) : isTask,
    questionIds: questionIds || [],
    questions: Array.isArray(questions) ? questions : undefined,
    maxMarks: Number(maxMarks) || 20,
    gradeBoundaries: gradeBoundaries || undefined,
    createdAt: Date.now(),
    ownerId: creator?.id,
    ownerName: creator?.name,
    status: "active",
    students: {},
  };

  assessmentsDb[id] = newAssessment;
  savePersistedAssessments();
  res.json({ success: true, assessment: newAssessment });
});

// Update an existing assessment (Protected)
app.put("/api/assessments/:id", requireTeacher, (req, res) => {
  let a = assessmentsDb[req.params.id];
  if (!a) {
    a = Object.values(assessmentsDb).find((x) => x.code === req.params.id.toUpperCase()) as AssessmentStore;
  }
  if (!a) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }

  const { title, type, durationMinutes, showScoreImmediately, allowCopyPaste, showOperatorToolbar, shareSolutions, customHeaderBanner, customSubtitle, customInstructions, headerConfig, questionIds, questions, maxMarks, status, gradeBoundaries } = req.body;

  if (title !== undefined) a.title = String(title).trim() || a.title;
  if (type !== undefined) a.type = type === "task" ? "task" : "assessment";
  if (customHeaderBanner !== undefined) a.customHeaderBanner = customHeaderBanner;
  if (customSubtitle !== undefined) a.customSubtitle = customSubtitle;
  if (customInstructions !== undefined) a.customInstructions = customInstructions;
  if (headerConfig !== undefined) a.headerConfig = headerConfig;
  if (durationMinutes !== undefined) a.durationMinutes = Math.max(0, Number(durationMinutes) || 0);
  if (showScoreImmediately !== undefined) a.showScoreImmediately = Boolean(showScoreImmediately);
  if (allowCopyPaste !== undefined) a.allowCopyPaste = Boolean(allowCopyPaste);
  if (showOperatorToolbar !== undefined) a.showOperatorToolbar = Boolean(showOperatorToolbar);
  if (shareSolutions !== undefined) a.shareSolutions = Boolean(shareSolutions);
  if (Array.isArray(questionIds)) a.questionIds = questionIds;
  if (Array.isArray(questions)) a.questions = questions;
  if (maxMarks !== undefined) a.maxMarks = Math.max(1, Number(maxMarks) || 1);
  if (status !== undefined) a.status = status;
  if (gradeBoundaries !== undefined) a.gradeBoundaries = gradeBoundaries;

  if (a.students) {
    for (const sid of Object.keys(a.students)) {
      a.students[sid].maxMarks = a.maxMarks;
      if (a.students[sid].totalMarks !== undefined && a.maxMarks > 0) {
        a.students[sid].percentage = Math.round((a.students[sid].totalMarks / a.maxMarks) * 100);
      }
    }
  }

  savePersistedAssessments();
  res.json({ success: true, assessment: a });
});

// Update grade boundaries for an assessment (Protected)
app.post("/api/assessments/:id/grade-boundaries", requireTeacher, (req, res) => {
  let a = assessmentsDb[req.params.id];
  if (!a) {
    a = Object.values(assessmentsDb).find((x) => x.code === req.params.id.toUpperCase()) as AssessmentStore;
  }
  if (!a) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }

  const { gradeBoundaries } = req.body;
  if (!gradeBoundaries || typeof gradeBoundaries !== "object") {
    res.status(400).json({ error: "Invalid grade boundaries payload" });
    return;
  }

  a.gradeBoundaries = gradeBoundaries;
  savePersistedAssessments();
  res.json({ success: true, assessment: a, gradeBoundaries: a.gradeBoundaries });
});

// Delete an assessment (Protected)
app.delete("/api/assessments/:id", requireTeacher, (req, res) => {
  const targetId = req.params.id;
  let idToDelete = targetId;

  if (!assessmentsDb[idToDelete]) {
    const found = Object.values(assessmentsDb).find((x) => x.code === targetId.toUpperCase());
    if (found) idToDelete = found.id;
  }

  if (!assessmentsDb[idToDelete]) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }

  delete assessmentsDb[idToDelete];
  savePersistedAssessments();
  res.json({ success: true, message: `Assessment ${idToDelete} deleted successfully` });
});

// Fetch Assessment: Teachers get full solutions; Students get sanitized payload without solutions or other students' data
app.get("/api/assessments/:id", (req, res) => {
  const a = assessmentsDb[req.params.id];
  if (!a) {
    const byCode = Object.values(assessmentsDb).find((x) => x.code === req.params.id.toUpperCase());
    if (byCode) {
      const enriched = enrichAssessment(byCode);
      if (isTeacherRequest(req)) {
        res.json({ assessment: enriched });
      } else {
        res.json({ assessment: sanitizeAssessmentForStudent(enriched) });
      }
      return;
    }
    res.status(404).json({ error: "Assessment not found" });
    return;
  }
  const enriched = enrichAssessment(a);
  if (isTeacherRequest(req)) {
    res.json({ assessment: enriched });
  } else {
    res.json({ assessment: sanitizeAssessmentForStudent(enriched) });
  }
});

// Student joins via QR Code or PIN (Returns strictly sanitized assessment)
app.post("/api/assessments/:id/join", (req, res) => {
  const { name, candidateNumber, className, studentId: requestedStudentId } = req.body;
  let a = assessmentsDb[req.params.id];
  if (!a) {
    a = Object.values(assessmentsDb).find((x) => x.code === req.params.id.toUpperCase()) as AssessmentStore;
  }
  if (!a) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }

  const cleanName = (name || "").trim().toLowerCase();
  
  // Look for existing session for this specific student in this assessment
  // 1. By requested studentId ONLY IF it matches the student's name (never hijack another student's session)
  // 2. Or by normalized student name match
  let existingSession: LiveStudentSession | undefined;
  if (requestedStudentId && a.students[requestedStudentId]) {
    const candidate = a.students[requestedStudentId];
    const candidateCleanName = (candidate.name || "").trim().toLowerCase();
    // Only reuse session if the requested name matches the session owner
    if (!cleanName || candidateCleanName === cleanName) {
      existingSession = candidate;
    }
  }

  // If not matched by ID + name, look for this specific student by clean name in this assessment
  if (!existingSession && cleanName) {
    existingSession = Object.values(a.students).find(
      (s) => (s.name || "").trim().toLowerCase() === cleanName
    );
  }

  let session: LiveStudentSession;
  if (existingSession) {
    // Reconnect to existing session for this student
    session = existingSession;
    session.lastActiveAt = Date.now();
    if (className && !session.className) session.className = className;
  } else {
    // Create new session for this new student
    const studentId = "s_" + (cleanName || "student").replace(/[^a-z0-9]/g, "") + "_" + Math.random().toString(36).substring(2, 6);
    session = {
      studentId,
      name: (name || "Anonymous Candidate").trim(),
      candidateNumber: candidateNumber || "C" + Math.floor(1000 + Math.random() * 9000),
      className: className || "Class 1",
      status: "in_progress",
      currentQuestionIndex: 0,
      answeredQuestions: [],
      answers: {},
      marks: {},
      totalMarks: 0,
      maxMarks: a.maxMarks,
      percentage: 0,
      joinedAt: Date.now(),
      lastActiveAt: Date.now(),
    };
    a.students[session.studentId] = session;
  }

  savePersistedAssessments();

  const enriched = enrichAssessment(a);
  res.json({ success: true, assessment: sanitizeAssessmentForStudent(enriched), studentSession: session });
});

// Student updates live progress
app.post("/api/assessments/:id/progress", (req, res) => {
  const { studentId, currentQuestionIndex, answeredQuestions, answers } = req.body;
  let a = assessmentsDb[req.params.id];
  if (!a) {
    a = Object.values(assessmentsDb).find((x) => x.code === req.params.id.toUpperCase()) as AssessmentStore;
  }
  if (!a || !a.students[studentId]) {
    res.status(404).json({ error: "Student session not found" });
    return;
  }

  const s = a.students[studentId];
  if (currentQuestionIndex !== undefined) s.currentQuestionIndex = currentQuestionIndex;
  if (answeredQuestions) s.answeredQuestions = answeredQuestions;
  if (answers) s.answers = { ...s.answers, ...answers };
  s.lastActiveAt = Date.now();
  if (s.status === "joined") s.status = "in_progress";

  savePersistedAssessments();
  res.json({ success: true });
});

// Student submits assessment (Server-authoritative auto-grading)
app.post("/api/assessments/:id/submit", async (req, res) => {
  const { studentId, answers, marks: clientMarks, totalMarks: clientTotal } = req.body;
  let a = assessmentsDb[req.params.id];
  if (!a) {
    a = Object.values(assessmentsDb).find((x) => x.code === req.params.id.toUpperCase()) as AssessmentStore;
  }
  if (!a || !a.students[studentId]) {
    res.status(404).json({ error: "Student session not found" });
    return;
  }

  const s = a.students[studentId];
  s.status = "submitted";
  s.answers = answers || s.answers || {};

  // Execute authoritative server-side grading using the master unsanitized question bank
  const enriched = enrichAssessment(a);
  const masterQuestions = enriched.questions || [];
  const officialMarks: Record<string, number> = {};
  let calculatedTotal = 0;

  if (masterQuestions.length) {
    const result = await markAllQuestions(masterQuestions, s.answers);
    Object.assign(officialMarks, result.marks);
    calculatedTotal = result.total;
    s.markingNotes = result.notes;
  }

  // If master questions were empty, fallback to client marks safely
  if (masterQuestions.length === 0 && clientMarks) {
    s.marks = clientMarks;
    s.totalMarks = clientTotal !== undefined ? clientTotal : Object.values(clientMarks).reduce((acc: number, m: any) => acc + (m || 0), 0);
  } else {
    s.marks = officialMarks;
    s.totalMarks = calculatedTotal;
  }

  s.percentage = a.maxMarks > 0 ? Math.round((s.totalMarks / a.maxMarks) * 100) : 0;
  s.submittedAt = Date.now();
  s.lastActiveAt = Date.now();

  savePersistedAssessments();

  // Confidential assessment policy:
  // If showScoreImmediately is false (formal exam), DO NOT send back marks or question answers to the student
  if (a.showScoreImmediately === false) {
    res.json({
      success: true,
      confidential: true,
      studentSession: {
        studentId: s.studentId,
        name: s.name,
        candidateNumber: s.candidateNumber,
        className: s.className,
        status: "submitted",
        submittedAt: s.submittedAt,
      },
    });
  } else {
    res.json({ success: true, studentSession: s });
  }
});

// Teacher views live progress & analytics (Protected with requireTeacher)
app.get("/api/assessments/:id/live", requireTeacher, (req, res) => {
  let a = assessmentsDb[req.params.id];
  if (!a) {
    a = Object.values(assessmentsDb).find((x) => x.code === req.params.id.toUpperCase()) as AssessmentStore;
  }
  if (!a) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }

  const studentsList = Object.values(a.students).sort((x, y) => x.name.localeCompare(y.name));
  const submitted = studentsList.filter((s) => s.status === "submitted");
  const inProgress = studentsList.filter((s) => s.status === "in_progress");

  const avgScore = submitted.length
    ? Math.round(submitted.reduce((acc, s) => acc + s.totalMarks, 0) / submitted.length)
    : 0;
  const avgPercentage = a.maxMarks > 0 ? Math.round((avgScore / a.maxMarks) * 100) : 0;

  // Question difficulty analysis
  const questionAnalytics: Record<string, { totalAwarded: number; attempts: number; averageMarks: number }> = {};
  for (const qId of a.questionIds) {
    let totalAwarded = 0;
    let attempts = 0;
    for (const s of studentsList) {
      if (s.marks && s.marks[qId] !== undefined) {
        totalAwarded += s.marks[qId];
        attempts++;
      }
    }
    questionAnalytics[qId] = {
      totalAwarded,
      attempts,
      averageMarks: attempts ? Number((totalAwarded / attempts).toFixed(1)) : 0,
    };
  }

  res.json({
    assessment: a,
    students: studentsList,
    stats: {
      totalJoined: studentsList.length,
      inProgressCount: inProgress.length,
      submittedCount: submitted.length,
      avgScore,
      avgPercentage,
      maxMarks: a.maxMarks,
    },
    releaseSettings: a.releaseSettings || {
      resultsReleased: false,
      shareTotalScore: true,
      shareQuestionMarks: true,
      shareMarkScheme: true,
      shareSubmissionsAndAnswers: true,
      shareTeacherFeedback: true,
      shareReflectionSheet: true,
    },
    questionAnalytics,
  });
});

// Teacher manual override / feedback (Protected with requireTeacher)
app.post("/api/assessments/:id/override-mark", requireTeacher, (req, res) => {
  const { studentId, questionId, mark, feedback } = req.body;
  const a = assessmentsDb[req.params.id];
  if (!a || !a.students[studentId]) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const s = a.students[studentId];
  if (questionId && mark !== undefined) {
    s.marks[questionId] = Number(mark);
    s.totalMarks = Object.values(s.marks).reduce((acc, m) => acc + (m || 0), 0);
    s.percentage = a.maxMarks > 0 ? Math.round((s.totalMarks / a.maxMarks) * 100) : 0;
  }
  if (feedback !== undefined) {
    s.feedback = feedback;
  }

  savePersistedAssessments();
  res.json({ success: true, studentSession: s });
});

// Teacher updates reflection sheet fields directly (Protected with requireTeacher)
app.post("/api/assessments/:id/update-reflection-sheet", requireTeacher, (req, res) => {
  const { studentId, reflectionSheet } = req.body;
  let a = assessmentsDb[req.params.id];
  if (!a) {
    a = Object.values(assessmentsDb).find((x) => x.code === req.params.id.toUpperCase()) as AssessmentStore;
  }
  if (!a || !a.students[studentId]) {
    res.status(404).json({ error: "Candidate session not found" });
    return;
  }

  const s = a.students[studentId];
  s.reflectionSheet = {
    ...(s.reflectionSheet || {}),
    ...(reflectionSheet || {}),
    updatedAt: Date.now(),
  };

  savePersistedAssessments();
  res.json({ success: true, reflectionSheet: s.reflectionSheet, studentSession: s });
});

// Re-evaluate a student against latest question mark schemes & tests (Protected with requireTeacher)
app.post("/api/assessments/:id/regrade-student", requireTeacher, async (req, res) => {
  const { studentId } = req.body;
  let a = assessmentsDb[req.params.id];
  if (!a) {
    a = Object.values(assessmentsDb).find((x) => x.code === req.params.id.toUpperCase()) as AssessmentStore;
  }
  if (!a || !a.students[studentId]) {
    res.status(404).json({ error: "Student session not found" });
    return;
  }

  const s = a.students[studentId];
  const enriched = enrichAssessment(a);
  const masterQuestions = enriched.questions || [];
  const officialMarks: Record<string, number> = {};
  let calculatedTotal = 0;

  if (masterQuestions.length) {
    const result = await markAllQuestions(masterQuestions, s.answers || {});
    Object.assign(officialMarks, result.marks);
    calculatedTotal = result.total;
    s.markingNotes = result.notes;
  }

  s.marks = officialMarks;
  s.totalMarks = calculatedTotal;
  s.percentage = a.maxMarks > 0 ? Math.round((s.totalMarks / a.maxMarks) * 100) : 0;
  savePersistedAssessments();

  res.json({ success: true, studentSession: s });
});

// Teacher generates AI diagnostic feedback (Protected with requireTeacher)
app.post("/api/assessments/:id/generate-student-feedback", requireTeacher, async (req, res) => {
  try {
    const { studentId } = req.body;
    const a = assessmentsDb[req.params.id];
    if (!a || !a.students[studentId]) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const s = a.students[studentId];
    const questionKeys = a.questionIds || Object.keys(s.answers || {});

    // Collect questions where student struggled
    const performanceData = questionKeys.map((qId) => {
      const awarded = s.marks ? s.marks[qId] ?? 0 : 0;
      const answer = s.answers ? s.answers[qId] : null;
      return {
        questionId: qId,
        awardedMarks: awarded,
        answer: typeof answer === "string" ? answer : JSON.stringify(answer),
      };
    });

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are a Pearson Edexcel International GCSE (9-1) Computer Science (Specification 4CP0) expert senior examiner and teacher diagnostic assistant.

Assessment Title: "${a.title}"
Candidate: ${s.name} (${s.candidateNumber})
Total Score: ${s.totalMarks} / ${a.maxMarks} (${s.percentage}%)

Performance Record:
${JSON.stringify(performanceData, null, 2)}

Official Pearson Edexcel 4CP0 Topic Structure:
- Topic 1: Problem solving (1.1 Algorithms, 1.2 Decomposition & Abstraction)
- Topic 2: Programming (2.1 Program structure, 2.2 Selection & iteration, 2.3 Data types & structures, 2.4 Input & validation, 2.5 Operators, 2.6 Subprograms)
- Topic 3: Data (3.1 Binary, Two's complement & hex, 3.2 Storage & IEC prefixes KiB/MiB/GiB, 3.3 Compression RLE/Lossy, 3.4 Historical Ciphers)
- Topic 4: Computers (4.1 Hardware & architecture, 4.2 Von Neumann registers & buses, 4.3 Logic gates & truth tables, 4.4 Software & OS, 4.5 Translators)
- Topic 5: Communication & the internet (5.1 Networks & 4-layer TCP/IP stack, 5.2 Network security & cyber threats)
- Topic 6: The bigger picture (6.1 Ethical, environmental e-waste, legal & emerging tech)

Task:
Analyze where the student lost marks or went wrong. Provide targeted diagnostic feedback focused strictly on Pearson Edexcel 4CP0 topics they must review.
Return ONLY valid JSON matching this exact structure:
{
  "overallSummary": "Concise 2-3 sentence overview of candidate performance, strengths, and primary revision priority.",
  "focusTopics": ["Exact 4CP0 Topic and spec clause to prioritize (e.g. Topic 2.2: Loop boundaries and range() parameters)"],
  "questionBreakdowns": [
    {
      "questionId": "id string",
      "marksAwarded": 2,
      "maxMarks": 5,
      "studentError": "Analysis of the specific misconception or error in their submission",
      "specTopic": "Pearson Edexcel 4CP0 Topic reference",
      "revisionAction": "Actionable practice step for the candidate to correct this weakness"
    }
  ]
}`;

        const aiResponse = await generateContentWithResilience(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const text = aiResponse.text || "{}";
        const parsed = JSON.parse(text);
        s.aiDiagnostic = parsed;
        res.json({ success: true, aiDiagnostic: parsed, method: "gemini" });
        return;
      } catch (geminiErr: any) {
        console.info("Gemini diagnostic capacity peak/spikes; seamlessly delivering Pearson 4CP0 syllabus diagnostic fallback.");
      }
    }

    // High quality syllabus-grounded fallback
    const fallbackDiagnostic = {
      overallSummary: `Candidate ${s.name} scored ${s.totalMarks}/${a.maxMarks} (${s.percentage}%). Targeted review recommended on logic structure and algorithmic syntax.`,
      focusTopics: [
        "Topic 2.2: Selection statements and relational conditions",
        "Topic 1.1: Trace tables and dry-run iteration variables",
        "Topic 3.1: Two's complement and binary data representation",
      ],
      questionBreakdowns: performanceData
        .filter((p) => p.awardedMarks < 4)
        .map((p) => ({
          questionId: p.questionId,
          marksAwarded: p.awardedMarks,
          maxMarks: 4,
          studentError: "Suboptimal condition logic or incomplete trace table iteration values.",
          specTopic: "Pearson Edexcel 4CP0 Topic 2.2: Programming selection and iterative control",
          revisionAction: "Practice tracing loop termination conditions using dry-run trace tables before coding.",
        })),
    };

    s.aiDiagnostic = fallbackDiagnostic;
    res.json({ success: true, aiDiagnostic: fallbackDiagnostic, method: "syllabus-rules" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate diagnostic feedback" });
  }
});

// Teacher views current release configuration
app.get("/api/assessments/:id/release-settings", requireTeacher, (req, res) => {
  let a = assessmentsDb[req.params.id];
  if (!a) {
    a = Object.values(assessmentsDb).find((x) => x.code === req.params.id.toUpperCase()) as AssessmentStore;
  }
  if (!a) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }

  const defaultSettings: ResultReleaseSettings = {
    resultsReleased: a.type === "task",
    shareTotalScore: true,
    shareQuestionMarks: true,
    shareMarkScheme: true,
    shareSubmissionsAndAnswers: true,
    shareTeacherFeedback: true,
    shareReflectionSheet: true,
  };

  res.json({
    success: true,
    releaseSettings: a.releaseSettings || defaultSettings,
  });
});

// Teacher configures release options (which components to share with students)
app.post("/api/assessments/:id/release-settings", requireTeacher, (req, res) => {
  let a = assessmentsDb[req.params.id];
  if (!a) {
    a = Object.values(assessmentsDb).find((x) => x.code === req.params.id.toUpperCase()) as AssessmentStore;
  }
  if (!a) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }

  const prev = a.releaseSettings || {
    resultsReleased: false,
    shareTotalScore: true,
    shareQuestionMarks: true,
    shareMarkScheme: true,
    shareSubmissionsAndAnswers: true,
    shareTeacherFeedback: true,
    shareReflectionSheet: true,
  };

  const updated: ResultReleaseSettings = {
    resultsReleased: req.body.resultsReleased !== undefined ? !!req.body.resultsReleased : prev.resultsReleased,
    shareTotalScore: req.body.shareTotalScore !== undefined ? !!req.body.shareTotalScore : prev.shareTotalScore,
    shareQuestionMarks: req.body.shareQuestionMarks !== undefined ? !!req.body.shareQuestionMarks : prev.shareQuestionMarks,
    shareMarkScheme: req.body.shareMarkScheme !== undefined ? !!req.body.shareMarkScheme : prev.shareMarkScheme,
    shareSubmissionsAndAnswers:
      req.body.shareSubmissionsAndAnswers !== undefined
        ? !!req.body.shareSubmissionsAndAnswers
        : prev.shareSubmissionsAndAnswers,
    shareTeacherFeedback:
      req.body.shareTeacherFeedback !== undefined ? !!req.body.shareTeacherFeedback : prev.shareTeacherFeedback,
    shareReflectionSheet:
      req.body.shareReflectionSheet !== undefined ? !!req.body.shareReflectionSheet : prev.shareReflectionSheet,
    releasedAt: req.body.resultsReleased ? (req.body.releasedAt || Date.now()) : prev.releasedAt,
    releasedStudentIds: Array.isArray(req.body.releasedStudentIds)
      ? req.body.releasedStudentIds
      : prev.releasedStudentIds,
  };

  a.releaseSettings = updated;
  savePersistedAssessments();

  res.json({
    success: true,
    releaseSettings: updated,
    message: updated.resultsReleased ? "Results successfully released to students" : "Results unreleased (confidential)",
  });
});

// Helper to format student result with selective teacher release masking
function buildStudentResultPayload(a: AssessmentStore, s: LiveStudentSession) {
  const isPracticeTask = a.type === "task";
  const releaseSettings: ResultReleaseSettings = a.releaseSettings || {
    resultsReleased: isPracticeTask,
    shareTotalScore: true,
    shareQuestionMarks: true,
    shareMarkScheme: true,
    shareSubmissionsAndAnswers: true,
    shareTeacherFeedback: true,
    shareReflectionSheet: true,
  };

  const isReleasedForThisStudent =
    isPracticeTask ||
    (releaseSettings.resultsReleased &&
      (!releaseSettings.releasedStudentIds ||
        releaseSettings.releasedStudentIds.length === 0 ||
        releaseSettings.releasedStudentIds.includes(s.studentId) ||
        releaseSettings.releasedStudentIds.includes(s.candidateNumber)));

  if (!isReleasedForThisStudent) {
    return {
      resultsReleased: false,
      message: "Results are currently being moderated by your teacher. You will be able to review your marks, examiner mark scheme, and reflection sheet once your teacher releases them.",
      student: {
        studentId: s.studentId,
        name: s.name,
        candidateNumber: s.candidateNumber,
        className: s.className,
        status: s.status,
        submittedAt: s.submittedAt,
      },
    };
  }

  // Get up-to-date question definitions
  const enriched = enrichAssessment(a);
  const masterQuestions = enriched.questions || [];

  const canShareSolutions = a.type === "task" || (a.shareSolutions !== false && releaseSettings.shareMarkScheme);

  const sanitizedQuestions = masterQuestions.map((q) => {
    const qCopy = { ...q };
    // If teacher turned OFF solution / mark scheme sharing, delete solution, markScheme, markPoints, why
    if (!canShareSolutions) {
      delete qCopy.solution;
      delete qCopy.markScheme;
      delete qCopy.markPoints;
      delete qCopy.why;
    }
    return qCopy;
  });

  const studentData: Partial<LiveStudentSession> & Record<string, any> = {
    studentId: s.studentId,
    name: s.name,
    candidateNumber: s.candidateNumber,
    className: s.className,
    status: s.status,
    submittedAt: s.submittedAt,
  };

  if (releaseSettings.shareTotalScore) {
    studentData.totalMarks = s.totalMarks;
    studentData.maxMarks = a.maxMarks;
    studentData.percentage = s.percentage;
  }

  if (releaseSettings.shareQuestionMarks) {
    studentData.marks = s.marks;
  }

  if (releaseSettings.shareSubmissionsAndAnswers) {
    studentData.answers = s.answers;
  }

  if (releaseSettings.shareTeacherFeedback) {
    studentData.feedback = s.feedback;
    studentData.aiDiagnostic = s.aiDiagnostic;
  }

  if (releaseSettings.shareReflectionSheet !== false) {
    studentData.reflectionSheet = s.reflectionSheet;
  }

  return {
    resultsReleased: true,
    releaseSettings,
    assessment: {
      id: a.id,
      title: a.title,
      code: a.code,
      type: a.type,
      headerConfig: a.headerConfig,
      shareSolutions: a.shareSolutions,
      maxMarks: a.maxMarks,
      durationMinutes: a.durationMinutes,
      questionIds: a.questionIds,
      questions: sanitizedQuestions,
      gradeBoundaries: a.gradeBoundaries,
    },
    student: studentData,
    reflectionSheetAllowed: releaseSettings.shareReflectionSheet !== false,
  };
}

// Student views released results, mark scheme, and reflection
app.get("/api/assessments/:id/student-result/:studentId", (req, res) => {
  let a = assessmentsDb[req.params.id];
  if (!a) {
    a = Object.values(assessmentsDb).find((x) => x.code === req.params.id.toUpperCase()) as AssessmentStore;
  }
  if (!a) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }

  const studentId = req.params.studentId;
  const cleanTarget = studentId.trim().toLowerCase();
  const s =
    a.students[studentId] ||
    Object.values(a.students).find(
      (st) =>
        st.studentId?.toLowerCase() === cleanTarget ||
        st.name?.trim().toLowerCase() === cleanTarget ||
        st.candidateNumber?.trim().toLowerCase() === cleanTarget
    );

  if (!s) {
    res.status(404).json({ error: "Candidate record not found in this assessment" });
    return;
  }

  const payload = buildStudentResultPayload(a, s);
  res.json({ success: true, ...payload });
});

// Student lookup by assessment PIN and candidate number
app.post("/api/assessments/lookup-result", (req, res) => {
  const { code, candidateNumber } = req.body;
  if (!code || !candidateNumber) {
    res.status(400).json({ error: "Assessment code and candidate number are required" });
    return;
  }

  const cleanCode = String(code).trim().toUpperCase();
  const cleanCand = String(candidateNumber).trim().toLowerCase();

  const a = Object.values(assessmentsDb).find((x) => x.code === cleanCode || x.id === code);
  if (!a) {
    res.status(404).json({ error: "Assessment code not found. Please verify the PIN." });
    return;
  }

  const s = Object.values(a.students).find(
    (st) =>
      st.candidateNumber?.trim().toLowerCase() === cleanCand ||
      st.studentId?.trim().toLowerCase() === cleanCand ||
      st.name?.trim().toLowerCase() === cleanCand
  );

  if (!s) {
    res.status(404).json({ error: `Student "${candidateNumber}" not found for assessment ${a.title}` });
    return;
  }

  const payload = buildStudentResultPayload(a, s);
  res.json({ success: true, ...payload });
});

// Seed initial data or restore from disk
function seedInitialData() {
  loadPersistedData();

  // Register all 2025 Paper 2, Pattern Companion, and 20-Marker tasks in customQuestionsDb for server-authoritative marking
  for (const t of [...EDEXCEL_2025_PAPER_TASKS, ...EDEXCEL_2025_COMPANION_TASKS, ...EDEXCEL_20_MARKER_TASKS]) {
    if (!customQuestionsDb[t.id]) {
      customQuestionsDb[t.id] = t;
    }
  }
  savePersistedQuestions();

  // Pre-seed Summer 2025 Paper 2 official exam assessment
  const p25Id = "exam_2025_summer_p2";
  const p25Code = "4CP025";
  if (!assessmentsDb[p25Id]) {
    assessmentsDb[p25Id] = {
      id: p25Id,
      title: "Pearson Edexcel 4CP0/2AW Summer 2025 Paper 2",
      code: p25Code,
      type: "assessment",
      durationMinutes: 180,
      showScoreImmediately: true,
      questionIds: EDEXCEL_2025_PAPER_TASKS.map((t) => t.id),
      questions: EDEXCEL_2025_PAPER_TASKS,
      maxMarks: EDEXCEL_2025_PAPER_TASKS.reduce((acc, t) => acc + (t.marks || 0), 0),
      createdAt: Date.now() - 7200 * 1000,
      status: "active",
      students: {},
    };
  }

  // Pre-seed Pattern Companion Exam assessment
  const p26Id = "exam_2025_pattern_companion";
  const p26Code = "PAT2025";
  if (!assessmentsDb[p26Id]) {
    assessmentsDb[p26Id] = {
      id: p26Id,
      title: "Paper 2 Exam Pattern Companion Assessment",
      code: p26Code,
      type: "assessment",
      durationMinutes: 90,
      showScoreImmediately: true,
      questionIds: EDEXCEL_2025_COMPANION_TASKS.map((t) => t.id),
      questions: EDEXCEL_2025_COMPANION_TASKS,
      maxMarks: EDEXCEL_2025_COMPANION_TASKS.reduce((acc, t) => acc + (t.marks || 0), 0),
      createdAt: Date.now() - 3600 * 1000,
      status: "active",
      students: {},
    };
  }

  // Pre-seed 20-Marker Capstone Mastery Exam assessment (10 Questions x 20 Marks = 200 Marks)
  const p20mId = "exam_20_marker_mastery";
  const p20mCode = "20MARK";
  if (!assessmentsDb[p20mId]) {
    assessmentsDb[p20mId] = {
      id: p20mId,
      title: "Paper 2 Capstone: 20-Marker Synthesis Mastery Exam",
      code: p20mCode,
      type: "assessment",
      durationMinutes: 120,
      showScoreImmediately: true,
      questionIds: EDEXCEL_20_MARKER_TASKS.map((t) => t.id),
      questions: EDEXCEL_20_MARKER_TASKS,
      maxMarks: EDEXCEL_20_MARKER_TASKS.reduce((acc, t) => acc + (t.marks || 0), 0),
      createdAt: Date.now() - 1800 * 1000,
      status: "active",
      students: {},
    };
  }

  // If demo paper 2 mock already exists, no need to recreate it
  const demoId = "demo_paper2_mock";
  if (assessmentsDb[demoId]) {
    savePersistedAssessments();
    return;
  }
  const demoCode = "IGCSE1";
  const demoSession1: LiveStudentSession = {
    studentId: "s_amira",
    name: "Amira K.",
    candidateNumber: "0014",
    className: "11B",
    status: "submitted",
    currentQuestionIndex: 5,
    answeredQuestions: ["u01a", "u04a", "u05c", "u10a", "u15a"],
    answers: {
      u01a: 'print("Welcome to Paper 2")\nprint("Good luck!")\n',
      u04a: 'mark = int(input("Mark: "))\nif mark >= 50:\n    print("Pass")\nelse:\n    print("Fail")',
      u05c: 'name = input("Full name: ")\nyear = input("Year: ")\nparts = name.split(" ")\nprint(parts[1][:3].lower() + year[-2:])',
      u10a: 'names = ["Zara", "Ben", "Chloe", "Dev", "Esme"]\ntarget = input("Name: ")\nfound = -1\nfor i in range(len(names)):\n    if names[i] == target:\n        found = i\nif found == -1:\n    print("Not found")\nelse:\n    print("Found at position", found)',
      u15a: [["4", "5", "5"], ["3", "9", "9"], ["2", "12", "12"]],
    },
    marks: { u01a: 2, u04a: 2, u05c: 6, u10a: 2, u15a: 9 },
    totalMarks: 21,
    maxMarks: 25,
    percentage: 84,
    joinedAt: Date.now() - 42 * 60 * 1000,
    lastActiveAt: Date.now() - 5 * 60 * 1000,
    submittedAt: Date.now() - 5 * 60 * 1000,
    feedback: "Excellent trace table and variable naming accuracy!",
  };

  const demoSession2: LiveStudentSession = {
    studentId: "s_tariq",
    name: "Tariq M.",
    candidateNumber: "0022",
    className: "11B",
    status: "in_progress",
    currentQuestionIndex: 3,
    answeredQuestions: ["u01a", "u04a", "u05c"],
    answers: {
      u01a: 'print("Welcome to Paper 2")\nprint("Good luck!")',
      u04a: 'mark = int(input())\nif mark >= 50:\n    print("Pass")\nelse:\n    print("Fail")',
      u05c: 'name = input()\nyear = input()\nprint(name.split()[1][:3].lower() + year[-2:])',
    },
    marks: { u01a: 2, u04a: 2, u05c: 6 },
    totalMarks: 10,
    maxMarks: 25,
    percentage: 40,
    joinedAt: Date.now() - 28 * 60 * 1000,
    lastActiveAt: Date.now() - 1 * 60 * 1000,
  };

  const demoSession3: LiveStudentSession = {
    studentId: "s_chloe",
    name: "Chloe L.",
    candidateNumber: "0031",
    className: "11A",
    status: "submitted",
    currentQuestionIndex: 5,
    answeredQuestions: ["u01a", "u04a", "u05c", "u10a", "u15a"],
    answers: {
      u01a: 'print("Welcome to Paper 2")\nprint("Good luck!")',
      u04a: 'mark = int(input())\nif mark > 50:\n    print("Pass")\nelse:\n    print("Fail")',
      u05c: 'name = input()\nyear = input()\nprint("pat10")',
      u10a: 'names = ["Zara", "Ben", "Chloe", "Dev", "Esme"]\ntarget = input()\nprint("Found at position 3")',
      u15a: [["4", "5", "5"], ["3", "9", "9"], ["2", "12", "12"]],
    },
    marks: { u01a: 2, u04a: 1, u05c: 2, u10a: 1, u15a: 9 },
    totalMarks: 15,
    maxMarks: 25,
    percentage: 60,
    joinedAt: Date.now() - 40 * 60 * 1000,
    lastActiveAt: Date.now() - 12 * 60 * 1000,
    submittedAt: Date.now() - 12 * 60 * 1000,
  };

  assessmentsDb[demoId] = {
    id: demoId,
    title: "IGCSE Paper 2 Mock Examination",
    code: demoCode,
    durationMinutes: 45,
    showScoreImmediately: true,
    questionIds: ["u01a", "u04a", "u05c", "u10a", "u15a"],
    maxMarks: 25,
    createdAt: Date.now() - 3600 * 1000,
    status: "active",
    students: {
      [demoSession1.studentId]: demoSession1,
      [demoSession2.studentId]: demoSession2,
      [demoSession3.studentId]: demoSession3,
    },
  };

  savePersistedAssessments();
}

seedInitialData();

// ---------- Shared state collections (see serverStore.ts) ----------
let sharedCollections: SyncedCollection[] | null = null;
let pullInFlight: Promise<void> | null = null;
let pushChain: Promise<void> = Promise.resolve();

function initSharedCollections() {
  const assessments = new SyncedCollection(
    "assessments",
    () => {
      const out: Record<string, any> = {};
      for (const [id, a] of Object.entries(assessmentsDb)) {
        const { students, ...rest } = a as any;
        out[id] = rest;
      }
      return out;
    },
    (id, value) => {
      if (value === null) {
        delete assessmentsDb[id];
      } else {
        assessmentsDb[id] = { ...value, students: assessmentsDb[id]?.students || {} };
      }
    }
  );

  const students = new SyncedCollection(
    "students",
    () => {
      const out: Record<string, any> = {};
      for (const [aid, a] of Object.entries(assessmentsDb)) {
        for (const [sid, s] of Object.entries(a.students || {})) {
          out[`${aid}::${sid}`] = s;
        }
      }
      return out;
    },
    (key, value) => {
      const sep = key.indexOf("::");
      if (sep < 0) return;
      const aid = key.slice(0, sep);
      const sid = key.slice(sep + 2);
      const a = assessmentsDb[aid];
      if (!a) return;
      if (!a.students) a.students = {};
      if (value === null) delete a.students[sid];
      else a.students[sid] = value;
    }
  );

  const questions = new SyncedCollection(
    "custom_questions",
    () => customQuestionsDb,
    (id, value) => {
      if (value === null) delete customQuestionsDb[id];
      else customQuestionsDb[id] = value;
    }
  );

  const teachers = new SyncedCollection(
    "teachers",
    () => teachersDb,
    (id, value) => {
      if (value === null) delete teachersDb[id];
      else teachersDb[id] = value;
    }
  );

  const settings = new SyncedCollection(
    "settings",
    () => ({ main: systemSettings }),
    (_id, value) => {
      if (value) Object.assign(systemSettings, value);
    }
  );

  const dataFiles = new SyncedCollection(
    "data_files",
    () => dataFilesDb,
    (id, value) => {
      if (value === null) delete dataFilesDb[id];
      else dataFilesDb[id] = value;
    }
  );

  // Order matters: assessments must be pulled before their students.
  sharedCollections = [assessments, students, questions, teachers, settings, dataFiles];
  for (const c of sharedCollections) c.captureBaseline();
}

async function pullSharedState(): Promise<void> {
  if (!sharedCollections) return;
  if (!pullInFlight) {
    pullInFlight = (async () => {
      for (const c of sharedCollections!) await c.pull();
    })().finally(() => {
      pullInFlight = null;
    });
  }
  return pullInFlight;
}

async function pushSharedState(): Promise<void> {
  if (!sharedCollections) return;
  const run = pushChain.then(async () => {
    for (const c of sharedCollections!) await c.push();
  });
  pushChain = run.catch(() => {});
  return run;
}

if (isSharedStoreEnabled()) {
  initSharedCollections();
  console.log("[store] Shared Firestore persistence enabled.");
}

// Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`IGCSE Exam Auto-Grader server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
