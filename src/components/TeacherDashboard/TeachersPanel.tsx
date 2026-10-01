import React, { useEffect, useState } from "react";
import { Users, X, UserPlus, Trash2, Loader2 } from "lucide-react";
import { teacherFetch } from "../../utils/teacherAuth";

interface TeacherRow {
  id: string;
  name: string;
  email: string;
  createdAt?: number;
  isMe?: boolean;
}

/**
 * Teacher accounts. Each teacher logs in with their own passcode and sees their own
 * assessments by default; the question bank, grade boundaries and data files are shared.
 */
export const TeachersPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await teacherFetch("/api/teachers");
      const data = await res.json().catch(() => ({}));
      if (res.ok) setTeachers(data.teachers || []);
      else setError(data.error || "Could not load teachers.");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addTeacher = async () => {
    setError("");
    setSuccess("");
    if (name.trim().length < 2) return setError("Please enter your colleague's name.");
    if (passcode.length < 5) return setError("The passcode must be at least 5 characters long.");
    setBusy(true);
    try {
      const res = await teacherFetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), passcode, email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not add the teacher.");
      } else {
        setSuccess(`${name.trim()} can now log in with the passcode you chose.`);
        setName("");
        setPasscode("");
        setEmail("");
        await load();
      }
    } finally {
      setBusy(false);
    }
  };

  const removeTeacher = async (t: TeacherRow) => {
    if (
      !window.confirm(
        `Remove ${t.name}'s account? They will no longer be able to log in. Their assessments and student results are kept.`
      )
    )
      return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await teacherFetch(`/api/teachers/${encodeURIComponent(t.id)}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Could not remove the teacher.");
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Teachers</h3>
              <p className="text-[11px] text-slate-500">
                Each teacher has their own passcode and sees their own classes by default.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Accounts</h4>
          {loading ? (
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl">
              {teachers.map((t) => (
                <li key={t.id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {t.name} {t.isMe && <span className="text-[11px] font-bold text-purple-600">(you)</span>}
                    </div>
                    {!t.email.endsWith("@teachers.local") && <div className="text-[11px] text-slate-500">{t.email}</div>}
                  </div>
                  {!t.isMe && (
                    <button
                      disabled={busy}
                      onClick={() => removeTeacher(t)}
                      className="text-rose-500 hover:text-rose-700 disabled:opacity-50"
                      title={`Remove ${t.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Add a colleague</h4>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name, e.g. Ms Khan"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
          />
          <input
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Their passcode (at least 5 characters)"
            type="text"
            autoComplete="off"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            type="email"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
          />
          <p className="text-[11px] text-slate-500">
            Tell your colleague their passcode privately. They can change it later with “Change Passcode”.
          </p>

          {error && <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</div>}
          {success && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">{success}</div>
          )}

          <button
            disabled={busy}
            onClick={addTeacher}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Add teacher
          </button>
        </div>
      </div>
    </div>
  );
};
