import React, { useMemo, useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { listQuestionFiles } from "../utils/pythonRunner";

/**
 * Shows the data files a question uses (e.g. scores.txt) so students and teachers can
 * see exactly what is inside them. Read-only.
 */
export const QuestionFilesPanel: React.FC<{ task: any; extraText?: string; defaultOpen?: boolean }> = ({
  task,
  extraText = "",
  defaultOpen = true,
}) => {
  const files = useMemo(() => listQuestionFiles(task, extraText), [task, extraText]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  if (!files.length) return null;

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
        <FileText className="w-4 h-4 text-sky-700" />
        Files used in this question ({files.length})
      </div>
      {files.map((f) => {
        const isOpen = open[f.name] ?? defaultOpen;
        const lines = f.content === undefined ? 0 : f.content.split("\n").filter((l, i, a) => i < a.length - 1 || l).length;
        return (
          <div key={f.name} className="rounded-lg border border-sky-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen((o) => ({ ...o, [f.name]: !isOpen }))}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-mono font-bold text-slate-800 hover:bg-sky-50"
            >
              <span>
                {f.name}
                <span className="ml-2 font-sans font-normal text-slate-500">
                  {f.content === undefined
                    ? "(file not found - ask your teacher)"
                    : f.content === ""
                    ? "(empty file - the program writes to it)"
                    : `${lines} line${lines === 1 ? "" : "s"}`}
                </span>
              </span>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {isOpen && f.content !== undefined && f.content !== "" && (
              <pre className="max-h-56 overflow-auto px-3 py-2 text-[11px] leading-5 font-mono bg-slate-900 text-slate-100 whitespace-pre">
                {f.content
                  .replace(/\n$/, "")
                  .split("\n")
                  .map((line, i) => `${String(i + 1).padStart(3, " ")} | ${line}`)
                  .join("\n")}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
};
