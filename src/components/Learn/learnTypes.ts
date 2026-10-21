import type { FlowNode } from "./Flowchart";
// Types shared by the Learning Hub (lessons, classes, progress).

export interface TraceFrame {
  line: number; // line about to run (0 = finished)
  vars: Record<string, string>;
  out: string;
  done?: boolean;
}

export type LearnStep =
  | { kind: "explain"; title: string; body: string; code?: string; tip?: string; flowchart?: FlowNode[] }
  | {
      kind: "trace";
      title: string;
      intro: string;
      code: string;
      inputs: string[];
      notes: Record<string, string>;
      frames: TraceFrame[];
      predict?: { question: string; options: string[]; answer: number } | null;
      files?: Record<string, string>;
    }
  | {
      kind: "check";
      question: string;
      options?: string[];
      answer?: number;
      accept?: string[];
      hints: string[];
      explain: string;
      code?: string;
      flowchart?: FlowNode[];
    }
  | { kind: "bits"; title: string; intro: string; mode: "unsigned" | "twos" | "signmag"; bits: number; target: number | null; showHex?: boolean }
  | { kind: "gates"; title: string; intro: string; gate: "AND" | "OR" | "NOT" | "EXPR1" }
  | { kind: "stepper"; title: string; intro: string; frames: StepperFrame[] }
  | { kind: "calc"; title: string; intro: string; calc: "image" | "sound" };

export interface StepperFrame {
  caption: string;
  array?: (number | string)[];
  highlight?: number[];
  done?: number[];
  dim?: number[];
  pointers?: Record<string, number>;
  groups?: (number | string)[][];
  table?: [string, string][];
}

export type PracticeLevel = 1 | 2 | 3; // 1 warm-up, 2 core, 3 exam-style

export type PracticeItem = (
  | { kind: "mcq"; id: string; title?: string; prompt: string; code?: string; flowchart?: FlowNode[]; options: string[]; answer: number; explain: string; hints: string[] }
  | { kind: "output"; id: string; title?: string; prompt: string; code: string; flowchart?: FlowNode[]; inputs?: string[]; files?: Record<string, string>; expected: string; explain?: string; hints: string[] }
  | {
      kind: "trace";
      id: string;
      title?: string;
      prompt: string;
      code: string;
      inputs?: string[];
      columns: string[];
      flowchart?: FlowNode[];
      files?: Record<string, string>;
      rows: (string | null)[][]; // null = cell stays blank
      explain?: string;
      hints: string[];
    }
  | { kind: "order"; id: string; title?: string; prompt: string; lines: string[]; accept?: number[][]; explain?: string; hints: string[] }
  | {
      kind: "code";
      id: string;
      title: string;
      prompt: string;
      starter: string;
      solution: string;
      tests: { inputs: string[]; expected: string }[];
      hints: string[];
      files?: Record<string, string>;
    }
  | { kind: "answer"; id: string; title: string; prompt: string; accept: string[]; hints: string[]; solution: string }
  | { kind: "classify"; id: string; title?: string; prompt: string; columns: string[]; rowHeader?: string; rows: { text: string; answer: number }[]; explain?: string; hints: string[] }
  | { kind: "written"; id: string; title?: string; prompt: string; marks: number; points: string[]; guide?: string; model?: string; hints: string[] }
) & { level?: PracticeLevel; topic?: string };

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explain: string;
  code?: string;
  flowchart?: FlowNode[];
}

export interface LearnLesson {
  id: string;
  paper: "Paper 1" | "Paper 2";
  spec: string;
  title: string;
  summary: string;
  minutes: number;
  steps: LearnStep[];
  practice: PracticeItem[];
  quiz: QuizQuestion[];
  /** How many quiz questions are drawn (at random) for each attempt */
  quizDraw?: number;
}

/** Practice target for the 🛠️ stamp: this share of the practice questions answered correctly */
export const PRACTICE_TARGET = 0.8;
export const practiceTargetCount = (total: number) => (total <= 3 ? total : Math.ceil(total * PRACTICE_TARGET));
export const quizLength = (l: { quiz: unknown[]; quizDraw?: number }) => Math.min(l.quizDraw || 10, l.quiz.length);

// ---- Classes and progress (stored on the server) ----
export interface LearnAssignment {
  lessonId: string;
  start: string; // YYYY-MM-DD
  due: string; // YYYY-MM-DD
  assignedAt: number;
}

export interface LearnClass {
  id: string;
  code: string;
  name: string;
  ownerId?: string;
  ownerName?: string;
  createdAt: number;
  open: boolean;
  allowQuizRetakes: boolean;
  assignments: Record<string, LearnAssignment>;
}

export interface LessonProgress {
  startedAt?: number;
  stepReached: number; // highest learn step reached (0-based)
  totalSteps: number;
  learnedAt?: number;
  practice: Record<string, { doneAt: number; attempts: number }>;
  practicedAt?: number;
  quiz?: { best: number; max: number; attempts: number; lastAt: number; history: { score: number; max: number; at: number }[] };
  stamps: Partial<Record<"learned" | "practised" | "quiz" | "mastery" | "ontime", number>>;
}

export interface LearnEvent {
  t: number;
  lessonId: string;
  kind: string;
  detail?: string;
}

export interface LearnStudent {
  classId: string;
  studentId: string;
  name: string;
  joinedAt: number;
  lastActiveAt: number;
  lessons: Record<string, LessonProgress>;
  events: LearnEvent[];
}

export const STAMP_INFO: Record<string, { icon: string; label: string; tip: string }> = {
  learned: { icon: "📘", label: "Learned", tip: "Worked through every learning step" },
  practised: { icon: "🛠️", label: "Practised", tip: "Completed all practice tasks" },
  quiz: { icon: "⭐", label: "Quiz passed", tip: "Scored 60% or more in the quiz" },
  mastery: { icon: "🏆", label: "Mastery", tip: "Practice target reached and full marks in the quiz" },
  ontime: { icon: "⏰", label: "On time", tip: "Learned and passed the quiz before the due date" },
};
