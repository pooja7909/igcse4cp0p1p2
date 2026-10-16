import React from "react";

// Shows a question brief. Plain lines keep their line breaks; blocks wrapped in ``` fences
// (sample output, file contents) are shown in a fixed-width box so tables line up.
// pre-line collapses leading spaces, so keep sub-bullet indents with non-breaking spaces.
const keepIndent = (t: string) => t.replace(/^( +)/gm, (m) => "\u00a0".repeat(m.length * 2));

export const BriefText: React.FC<{ text?: string; className?: string }> = ({ text, className }) => {
  const src = String(text || "");
  if (!src.includes("```")) {
    return <div className={`whitespace-pre-line ${className || ""}`}>{keepIndent(src)}</div>;
  }
  const pieces = src.split(/```[^\n]*\n?/);
  return (
    <div className={className}>
      {pieces.map((piece, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            className="my-2 p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[12.5px] leading-snug text-slate-800 overflow-x-auto whitespace-pre"
          >
            {piece.replace(/\n$/, "")}
          </pre>
        ) : piece.trim() ? (
          <div key={i} className="whitespace-pre-line">
            {keepIndent(piece.replace(/^\n+|\n+$/g, ""))}
          </div>
        ) : null
      )}
    </div>
  );
};

// One-line summaries: drop the fenced blocks.
export function briefSummary(text?: string): string {
  return String(text || "").replace(/```[\s\S]*?```/g, " ").replace(/\s+/g, " ").trim();
}
