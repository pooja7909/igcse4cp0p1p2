import React from "react";
import { Assessment } from "../../types";

// Where each question has already been set, so teachers can see at a glance which
// questions are in formal assessments (rose) and which are in practice tasks (teal).

export interface UsageRef {
  id: string;
  title: string;
  code?: string;
  classGroup?: string;
}
export interface QuestionUsageInfo {
  exams: UsageRef[];
  practice: UsageRef[];
}
export type QuestionUsageMap = Record<string, QuestionUsageInfo>;

export type UsageFilter = "all" | "unused" | "exam" | "practice" | "this";

export function buildQuestionUsage(assessments: Assessment[], excludeAssessmentId?: string | null): QuestionUsageMap {
  const map: QuestionUsageMap = {};
  for (const a of assessments || []) {
    if (!a || (excludeAssessmentId && a.id === excludeAssessmentId)) continue;
    const ref: UsageRef = { id: a.id, title: a.title || a.code || "Untitled", code: a.code, classGroup: (a as any).classGroup };
    const ids = new Set<string>([...(a.questionIds || []), ...((a.questions || []).map((q) => q && q.id).filter(Boolean) as string[])]);
    for (const qid of ids) {
      if (!map[qid]) map[qid] = { exams: [], practice: [] };
      if (a.type === "task") map[qid].practice.push(ref);
      else map[qid].exams.push(ref);
    }
  }
  return map;
}

export function matchesUsageFilter(
  filter: UsageFilter,
  usage: QuestionUsageInfo | undefined,
  isInThisAssessment: boolean
): boolean {
  if (filter === "all") return true;
  if (filter === "this") return isInThisAssessment;
  const exams = usage?.exams.length || 0;
  const practice = usage?.practice.length || 0;
  if (filter === "unused") return exams === 0 && practice === 0 && !isInThisAssessment;
  if (filter === "exam") return exams > 0;
  if (filter === "practice") return practice > 0;
  return true;
}

// Coloured stripe on the left edge of a question card
export function usageStripeClass(usage: QuestionUsageInfo | undefined): string {
  if (usage?.exams.length) return "border-l-4 border-l-rose-500";
  if (usage?.practice.length) return "border-l-4 border-l-teal-500";
  return "";
}

const names = (refs: UsageRef[]) =>
  refs.map((r) => r.title + (r.classGroup ? ` (${r.classGroup})` : "") + (r.code ? ` [${r.code}]` : "")).join("\n");

export const UsageBadges: React.FC<{ usage?: QuestionUsageInfo; compact?: boolean }> = ({ usage, compact }) => {
  if (!usage || (!usage.exams.length && !usage.practice.length)) return null;
  return (
    <div className="flex flex-wrap items-center gap-1 mt-1.5">
      {usage.exams.length > 0 && (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 max-w-full"
          title={"In formal assessments:\n" + names(usage.exams)}
        >
          📝 Exam{usage.exams.length > 1 ? ` ×${usage.exams.length}` : ""}
          {!compact && <span className="font-medium truncate">: {usage.exams.map((r) => r.title).join(", ")}</span>}
        </span>
      )}
      {usage.practice.length > 0 && (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-300 max-w-full"
          title={"In practice tasks:\n" + names(usage.practice)}
        >
          🧪 Practice{usage.practice.length > 1 ? ` ×${usage.practice.length}` : ""}
          {!compact && <span className="font-medium truncate">: {usage.practice.map((r) => r.title).join(", ")}</span>}
        </span>
      )}
    </div>
  );
};

export const UsageLegend: React.FC<{ showThis?: boolean; counts?: { exam: number; practice: number; unused: number } }> = ({
  showThis,
  counts,
}) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-600">
    <span className="font-bold text-slate-700">Key:</span>
    {showThis && (
      <span className="inline-flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-purple-100 border border-purple-400" /> In this assessment (ticked)
      </span>
    )}
    <span className="inline-flex items-center gap-1.5">
      <span className="w-1.5 h-3.5 rounded bg-rose-500" /> Already in a formal assessment{counts ? ` (${counts.exam})` : ""}
    </span>
    <span className="inline-flex items-center gap-1.5">
      <span className="w-1.5 h-3.5 rounded bg-teal-500" /> Already in a practice task{counts ? ` (${counts.practice})` : ""}
    </span>
    <span className="inline-flex items-center gap-1.5">
      <span className="w-3 h-3 rounded bg-white border border-slate-300" /> Not used yet{counts ? ` (${counts.unused})` : ""}
    </span>
  </div>
);
