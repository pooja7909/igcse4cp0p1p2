import React from "react";

export interface MarkPointItem {
  point: string;
  awarded: number;
  max: number;
  reason?: string;
}

/**
 * "Where marks were gained and lost": a tick or cross for every mark point,
 * with the marks for each and (for missed points) a short reason.
 */
export const MarkPointsList: React.FC<{
  points?: MarkPointItem[] | null;
  feedback?: string | null;
  feedbackLabel?: string;
  compact?: boolean;
}> = ({ points, feedback, feedbackLabel = "Feedback", compact }) => {
  const list = Array.isArray(points) ? points.filter((p) => p && p.point) : [];
  if (!list.length && !feedback) return null;
  const got = list.reduce((a, p) => a + (Number(p.awarded) || 0), 0);
  const max = list.reduce((a, p) => a + (Number(p.max) || 0), 0);
  return (
    <div className={`space-y-2 ${compact ? "text-[11px]" : "text-xs"}`}>
      {feedback && (
        <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-950 leading-relaxed">
          <span className="font-bold">{feedbackLabel}: </span>
          {feedback}
        </div>
      )}
      {list.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex justify-between">
            <span>Mark scheme points</span>
            <span className="font-mono">
              {got}/{max}
            </span>
          </div>
          <ul className="divide-y divide-slate-100">
            {list.map((p, i) => {
              const full = p.awarded >= p.max && p.max > 0;
              const part = !full && p.awarded > 0;
              return (
                <li key={i} className="px-3 py-2 flex items-start gap-2">
                  <span
                    className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                      full ? "bg-emerald-100 text-emerald-700" : part ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                    }`}
                    aria-label={full ? "gained" : part ? "partly gained" : "lost"}
                  >
                    {full ? "✓" : part ? "~" : "✗"}
                  </span>
                  <span className="flex-1">
                    <span className={full ? "text-slate-900 font-semibold" : "text-slate-600"}>{p.point}</span>
                    {!full && p.reason && <span className="block text-slate-500 italic mt-0.5">{p.reason}</span>}
                  </span>
                  <span className={`shrink-0 font-mono font-bold ${full ? "text-emerald-700" : part ? "text-amber-700" : "text-slate-400"}`}>
                    +{p.awarded}
                    {p.max !== 1 || !full ? `/${p.max}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
