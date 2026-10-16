import { IGCSETask } from "../types";

// Past-paper items uploaded from a PDF are sometimes classed as "drawing" or written
// questions even though the candidate has to write or amend a program (Paper 2 style:
// "Open Q03.py ... Save your amended code as Q03FINISHED.py"). These helpers spot
// those questions so students get a code window and teachers can convert them.

const CODING_PATTERNS: RegExp[] = [
  /save your (amended |completed |finished )?(code|program)/i,
  /\bQ\d+\s*FINISHED\b/i,
  /\bQ\d+\.py\b/i,
  /\bopen (the )?(file |program )?Q\d+/i,
  /\bamend (the |this )?(code|program)/i,
  /\b(complete|correct|extend|modify|fix) (the |this )?(code|program)\b/i,
  /\bwrite (a |an |the |your )?(python )?(program|code|function|subprogram|procedure)\b/i,
  /#\s*write your code/i,
];

const NOT_CODING_DRAWING = /\b(draw|sketch|complete the flowchart|flowchart|diagram|logic circuit|graph)\b/i;

export const DRAWING_HINT = "This question was a drawing task on the paper; answer it in words.";

export function looksLikeCodingTask(task: IGCSETask | null | undefined): boolean {
  if (!task || task.type === "code") return false;
  if (task.type !== "theory") return false;
  const text = [task.title, task.brief, (task as any).stem, (task as any).question].filter(Boolean).join("\n");
  const codeText = String(task.code || "") + "\n" + String(task.starter || "");
  if (/#\s*write your code/i.test(codeText)) return true;
  if (!CODING_PATTERNS.some((re) => re.test(text))) return false;
  // "Draw a flowchart for this program" is still a drawing task, unless it says to save code.
  if (NOT_CODING_DRAWING.test(text) && !/save your|FINISHED|\.py\b/i.test(text)) return false;
  return true;
}

// Paper listings often carry line numbers ("1 total = 0"). Strip them so the code runs.
export function cleanCodeListing(code: string | undefined | null): string {
  const src = String(code || "").replace(/\r\n/g, "\n");
  if (!src.trim()) return "";
  const lines = src.split("\n");
  const nonEmpty = lines.filter((l) => l.trim());
  const numbered = nonEmpty.filter((l) => /^\s*\d+(\s|$)/.test(l));
  if (nonEmpty.length && numbered.length / nonEmpty.length >= 0.8) {
    // Remove "12 " or "12\t" plus one separator; keep the program's own indentation after that.
    return lines.map((l) => l.replace(/^\s*\d+( |\t)?/, "")).join("\n");
  }
  return src;
}

// The code the student starts from when a code window opens on a written question.
export function starterForCodeWindow(task: IGCSETask): string {
  return task.starter || cleanCodeListing(task.code) || "# Write your Python 3 code here\n";
}

// Teacher action: turn a mis-classified written question into a programming question.
// The program listing becomes the starter code; marking falls back to the mark scheme
// with AI because there are no automated tests.
export function convertToCodeTask(task: IGCSETask): IGCSETask {
  const starter = starterForCodeWindow(task);
  const next: any = { ...task, type: "code", starter };
  delete next.code; // shown in the editor now, not as a separate read-only listing
  delete next.manualReview;
  if (next.hint === DRAWING_HINT) delete next.hint;
  if (!Array.isArray(next.tests)) next.tests = [];
  if (!next.markScheme && Array.isArray(next.questions) && next.questions[0]) {
    const q: any = next.questions[0];
    const ms = [q.markScheme, Array.isArray(q.keywords) ? q.keywords.join("\n") : ""].filter(Boolean).join("\n");
    if (ms) next.markScheme = ms;
  }
  return next as IGCSETask;
}
