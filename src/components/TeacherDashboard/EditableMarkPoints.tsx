import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { teacherFetch } from "../../utils/teacherAuth";
import { MarkPointsList, MarkPointItem } from "../MarkPointsList";

/**
 * The marker's feedback and mark scheme points for one question, which the teacher can
 * edit: change the wording, change the marks for a point, delete points that are not
 * relevant, or add their own. Students see the edited version.
 */
export const EditableMarkPoints: React.FC<{
  assessmentId: string;
  studentId: string;
  questionId: string;
  questionMax: number;
  currentMark: number;
  points?: MarkPointItem[] | null;
  feedback?: string | null;
  onSaved: (studentSession: any) => void;
}> = ({ assessmentId, studentId, questionId, questionMax, currentMark, points, feedback, onSaved }) => {
  const [editing, setEditing] = useState(false);
  const [draftFeedback, setDraftFeedback] = useState("");
  const [draftPoints, setDraftPoints] = useState<MarkPointItem[]>([]);
  const [applyMark, setApplyMark] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setEditing(false);
    setMsg(null);
  }, [studentId, questionId]);

  const startEdit = () => {
    setDraftFeedback(feedback || "");
    setDraftPoints((points || []).map((p) => ({ ...p })));
    setApplyMark(false);
    setMsg(null);
    setEditing(true);
  };

  const update = (i: number, patch: Partial<MarkPointItem>) =>
    setDraftPoints((list) => list.map((p, k) => (k === i ? { ...p, ...patch } : p)));

  const total = draftPoints.reduce((a, p) => a + (Number(p.awarded) || 0), 0);
  const totalMax = draftPoints.reduce((a, p) => a + (Number(p.max) || 0), 0);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await teacherFetch(`/api/assessments/${assessmentId}/edit-breakdown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          questionId,
          feedback: draftFeedback,
          points: draftPoints
            .map((p) => ({ ...p, point: String(p.point || "").trim() }))
            .filter((p) => p.point),
          applyMark,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.studentSession) {
        onSaved(data.studentSession);
        setEditing(false);
        setMsg({ ok: true, text: applyMark ? `✓ Saved - mark for this question set to ${Math.min(total, questionMax)}` : "✓ Saved" });
      } else {
        setMsg({ ok: false, text: "Not saved: " + (data.error || `server error ${res.status}`) });
      }
    } catch {
      setMsg({ ok: false, text: "Not saved: could not reach the server." });
    } finally {
      setSaving(false);
    }
  };

  const hasContent = (points && points.length > 0) || (feedback && feedback.trim());

  if (!editing) {
    return (
      <div className="space-y-1.5">
        {hasContent ? (
          <MarkPointsList points={points} feedback={feedback} feedbackLabel="Marker's feedback" />
        ) : (
          <div className="text-[11px] text-slate-500 italic">No marker's feedback or mark scheme points for this question.</div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-300 bg-white hover:bg-indigo-50 text-indigo-800 text-[11px] font-bold"
          >
            <Pencil className="w-3 h-3" /> {hasContent ? "Edit feedback & points" : "Add feedback & points"}
          </button>
          {msg && <span className={`text-[11px] font-semibold ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl border-2 border-indigo-300 bg-indigo-50/40 space-y-3 text-xs">
      <div className="font-bold text-indigo-900">Edit marker's feedback & mark scheme points (students see this version)</div>
      <div className="space-y-1">
        <label className="font-semibold text-slate-700">Feedback</label>
        <textarea
          value={draftFeedback}
          onChange={(e) => setDraftFeedback(e.target.value)}
          rows={3}
          className="w-full p-2 border border-slate-300 rounded-lg bg-white"
          placeholder="Leave empty to remove the feedback"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-slate-700">Mark scheme points</label>
          <span className="font-mono font-bold text-slate-700">
            {total}/{totalMax}
          </span>
        </div>
        {draftPoints.length === 0 && <div className="text-slate-500 italic">No points. Add one below, or save to remove them all.</div>}
        {draftPoints.map((p, i) => (
          <div key={i} className="p-2 rounded-lg border border-slate-200 bg-white space-y-1.5">
            <div className="flex items-start gap-2">
              <input
                value={p.point}
                onChange={(e) => update(i, { point: e.target.value })}
                className="flex-1 px-2 py-1 border border-slate-300 rounded"
                placeholder="Mark point, e.g. Uses len() to count the characters"
              />
              <button
                type="button"
                onClick={() => setDraftPoints((list) => list.filter((_, k) => k !== i))}
                className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50"
                title="Delete this point"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-600">Marks</span>
              <input
                type="number"
                min={0}
                value={p.awarded}
                onChange={(e) => update(i, { awarded: Math.max(0, Number(e.target.value) || 0) })}
                className="w-14 px-1.5 py-1 border border-slate-300 rounded font-mono"
              />
              <span className="text-slate-500">out of</span>
              <input
                type="number"
                min={1}
                value={p.max}
                onChange={(e) => update(i, { max: Math.max(1, Number(e.target.value) || 1) })}
                className="w-14 px-1.5 py-1 border border-slate-300 rounded font-mono"
              />
              <input
                value={p.reason || ""}
                onChange={(e) => update(i, { reason: e.target.value })}
                className="flex-1 min-w-[160px] px-2 py-1 border border-slate-300 rounded"
                placeholder="Reason (shown when the point is not fully gained)"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setDraftPoints((list) => [...list, { point: "", awarded: 0, max: 1 }])}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold"
        >
          <Plus className="w-3 h-3" /> Add point
        </button>
      </div>

      <label className="flex items-start gap-2 text-slate-700">
        <input type="checkbox" checked={applyMark} onChange={(e) => setApplyMark(e.target.checked)} className="mt-0.5" />
        <span>
          Also set this question's mark to the points total ({Math.min(total, questionMax)}/{questionMax}). Now: {currentMark}/
          {questionMax}.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={saving}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold"
        >
          Cancel
        </button>
        {msg && <span className={`font-semibold ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</span>}
      </div>
    </div>
  );
};
