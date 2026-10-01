import React, { useEffect, useRef, useState } from "react";
import { FileText, Upload, Trash2, Loader2 } from "lucide-react";
import { teacherFetch } from "../../utils/teacherAuth";
import { setLibraryFiles } from "../../utils/pythonRunner";

interface LibraryFile {
  name: string;
  size: number;
  uploadedAt: number;
  content?: string;
}

/**
 * Data files (e.g. the .txt / .csv files supplied with a Paper 2 exam) that every
 * student program can open with open("FileName.txt"). Used both by the Run button
 * in the browser and by server-side marking.
 */
export const DataFilesManager: React.FC = () => {
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    try {
      const res = await fetch("/api/data-files?content=1");
      if (!res.ok) return;
      const data = await res.json();
      const list: LibraryFile[] = Array.isArray(data.files) ? data.files : [];
      setFiles(list);
      const map: Record<string, string> = {};
      for (const f of list) map[f.name] = f.content || "";
      setLibraryFiles(map);
    } catch {
      // offline: keep whatever is shown
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || !fileList.length) return;
    setBusy(true);
    setMessage(null);
    try {
      const payload: Array<{ name: string; content: string }> = [];
      for (let i = 0; i < fileList.length; i++) {
        const f = fileList[i];
        if (f.size > 1_500_000) {
          setMessage(`"${f.name}" is too large (max 1.5 MB).`);
          continue;
        }
        payload.push({ name: f.name, content: await f.text() });
      }
      if (payload.length) {
        const res = await teacherFetch("/api/data-files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: payload }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setMessage(data.error || "Upload failed.");
        } else {
          const rejected: string[] = data.rejected || [];
          setMessage(
            `Saved ${data.saved?.length || 0} file(s).` +
              (rejected.length
                ? ` Not saved (use simple names like Data.txt, max 1.5 MB): ${rejected.join(", ")}`
                : "")
          );
        }
      }
      await refresh();
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm(`Remove "${name}"? Programs that open this file will stop working.`)) return;
    setBusy(true);
    try {
      await teacherFetch(`/api/data-files/${encodeURIComponent(name)}`, { method: "DELETE" });
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">Data files for programs</h4>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload the .txt / .csv files supplied with a paper. Every student program can then open them by name,
            e.g. <code className="font-mono">open("Data.txt")</code>, including questions already in your bank.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60 shrink-0"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload data files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".txt,.csv,.dat,.json"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {message && <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2">{message}</div>}

      {files.length === 0 ? (
        <div className="text-xs text-slate-400">No data files uploaded yet.</div>
      ) : (
        <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
          {files.map((f) => (
            <li key={f.name} className="flex items-center justify-between px-3 py-2 text-xs">
              <span className="font-mono text-slate-800">{f.name}</span>
              <span className="flex items-center gap-3 text-slate-400">
                {(f.size / 1024).toFixed(1)} KB
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleDelete(f.name)}
                  className="text-rose-500 hover:text-rose-700"
                  title={`Remove ${f.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
