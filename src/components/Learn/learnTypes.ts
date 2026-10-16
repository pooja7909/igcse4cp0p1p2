// Types shared by the Learning Hub (lessons, classes, progress).

export interface TraceFrame {
  line: number; // line about to run (0 = finished)
  vars: Record<string, string>;
  out: string;
  done?: boolean;
}

export type LearnStep =
  | { kind: "explain"; title: string; body: string; code?: string; tip?: string }
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

export type PracticeItem =
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
  | { kind: "answer"; id: string; title: string; prompt: string; accept: string[]; hints: string[]; solution: string };

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explain: string;
  code?: string;
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
}

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
  mastery: { icon: "🏆", label: "Mastery", tip: "Full marks in the quiz" },
  ontime: { icon: "⏰", label: "On time", tip: "Learned and passed the quiz before the due date" },
};
