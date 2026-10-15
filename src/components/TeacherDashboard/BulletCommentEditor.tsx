import React from "react";
import { Trash2, Plus } from "lucide-react";

/** Splits a comment into bullets (one per line; leading "•", "-" or "*" removed). */
export function commentToBullets(text: string | undefined | null): string[] {
  return String(text || "")
    .split("\n")
    .map((l) => l.replace(/^\s*[•\-*]\s*/, "").trim())
    .filter(Boolean);
}

export function bulletsToComment(bullets: string[]): string {
  return bullets
    .map((b) => b.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .map((b) => "• " + b)
    .join("\n");
}

/**
 * Feedback as a list of bullet points: one per lost mark. The teacher can edit any
 * bullet, delete the ones that are not relevant, or add their own.
 */
export const BulletCommentEditor: React.FC<{ value: string; onChange: (text: string) => void }> = ({ value, onChange }) => {
  const bullets = commentToBullets(value);
  // keep an empty bullet visible while the teacher is typing a new one
  const rows = value.endsWith("\n• ") || value === "• " ? [...bullets, ""] : bullets;

  const set = (list: string[]) => {
    const joined = list.map((b) => "• " + b.replace(/\s*\n\s*/g, " ")).join("\n");
    onChange(joined);
  };

  return (
    <div className="space-y-1.5">
      {rows.length === 0 && (
        <div className="text-[11px] text-slate-500 italic">
          No feedback yet. Press "Suggest" to get one bullet for each lost mark, or add your own.
        </div>
      )}
      {rows.map((b, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <span className="mt-1.5 text-amber-700 font-black">•</span>
          <textarea
            value={b}
            rows={Math.min(4, Math.max(1, Math.ceil(b.length / 90)))}
            onChange={(e) => {
              const list = [...rows];
              list[i] = e.target.value;
              set(list);
            }}
            className="flex-1 p-1.5 text-xs border border-amber-200 rounded-lg bg-white"
            placeholder="e.g. Lost 1 mark - file not closed: add file.close() after the loop."
          />
          <button
            type="button"
            onClick={() => set(rows.filter((_, k) => k !== i))}
            className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50"
            title="Delete this bullet"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange((value ? value + "\n" : "") + "• ")}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 text-[11px] font-bold"
      >
        <Plus className="w-3 h-3" /> Add bullet
      </button>
    </div>
  );
};
