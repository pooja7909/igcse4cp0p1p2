import React, { useEffect, useRef, useState } from "react";
import { FileUp, Link as LinkIcon, Eye, Pencil, Trash2, Share2, Replace, X, Check, ClipboardList, Sparkles, FolderOpen, RefreshCw } from "lucide-react";
import { teacherFetch } from "../../utils/teacherAuth";
import { prepareDocForUpload } from "../../utils/uploadHelper";
import { ResourceViewer } from "./ResourceViewer";
import {
  TeacherResource,
  ResourcePaper,
  RESOURCE_TOPICS,
  ResourceTypeIcon,
  TopicBadges,
  formatSize,
  extOf,
  canConvert,
  typeLabel,
  viewMode,
  MAX_RESOURCE_MB,
  needsPieces,
  fetchResourceBlob,
  downloadResource,
  BIG_FILE_BYTES,
} from "./resourceTypes";

/** A file handed to the existing "Upload / JSON" converter (same shape as its own uploads). */
export interface ConvertibleDoc {
  name: string;
  size: string;
  mimeType: string;
  base64: string; // data URL
  isPdf: boolean;
}
export type ConvertIntent = "bank" | "assessment";

type Destination = "hub" | ConvertIntent;

interface LearnClassSummary {
  id: string;
  name: string;
  code: string;
  resourceIds: string[];
}

interface PendingFile {
  key: string;
  file: File;
  title: string;
  dest: Destination;
  topics: string[];
  paper: ResourcePaper;
  status: "ready" | "uploading" | "saving" | "done" | "error";
  progress: number;
  error?: string;
  resource?: TeacherResource;
}

const DEST_LABEL: Record<Destination, string> = {
  hub: "Learning Hub resource - students can open it",
  bank: "Question bank - turn it into questions",
  assessment: "Assessment - make an assessment from it",
};

function defaultDestination(name: string): Destination {
  const e = extOf(name);
  // Word / PDF files that look like papers go to the question converter; everything else is for students
  if ((e === "pdf" || e === "docx") && /paper|exam|test|quiz|question|mark ?scheme|\bms\b|sample|specimen|mock/i.test(name)) return "bank";
  return "hub";
}

const readAsDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("Could not read the file."));
    r.readAsDataURL(blob);
  });

function textToDataUrl(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return "data:text/plain;base64," + btoa(bin);
}

/** Why a file cannot be uploaded (size limits), or undefined. */
function tooBigReason(file: File): string | undefined {
  if (file.size > MAX_RESOURCE_MB * 1024 * 1024) return `Too big (${formatSize(file.size)}). The limit is ${MAX_RESOURCE_MB} MB.`;
  // Web pages are always opened directly in a safe sandbox, which works up to 3.5 MB
  if (/\.(html?|svg)$/i.test(file.name) && file.size > BIG_FILE_BYTES)
    return `This web page is ${formatSize(file.size)}. Web pages can be at most 3.5 MB - usually big pictures are embedded in it. Make the pictures smaller or upload them as separate files.`;
  return undefined;
}

async function uploadFileBody(file: File, onProgress: (f: number) => void) {
  const why = tooBigReason(file);
  if (why) throw new Error(why);
  if (file.size === 0) throw new Error("This file is empty.");
  const dataUrl = await readAsDataUrl(file);
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const prepared = await prepareDocForUpload({ base64, name: file.name, mimeType: file.type }, onProgress, { forceChunks: true });
  if (!prepared?.uploadId) throw new Error("The file could not be uploaded.");
  return { fileName: file.name, upload: { uploadId: prepared.uploadId, totalChunks: prepared.totalChunks } };
}

/** Optional IGCSE topic (one unit from the question bank's topics), grouped by paper. */
const TopicPicker: React.FC<{ value: string[]; onChange: (v: string[]) => void }> = ({ value, onChange }) => (
  <select
    value={value[0] || ""}
    onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
    className="px-2 py-1 border border-slate-300 rounded-lg text-xs bg-white max-w-[260px]"
    aria-label="Topic"
    data-testid="resource-topic"
  >
    <option value="">No particular topic</option>
    {(["Paper 1", "Paper 2"] as const).map((paper) => (
      <optgroup key={paper} label={paper === "Paper 1" ? "Paper 1 - Principles of Computer Science" : "Paper 2 - Application of Computational Thinking"}>
        {RESOURCE_TOPICS.filter((t) => t.paper === paper).map((t) => (
          <option key={t.code} value={t.code}>
            {t.code} {t.title}
          </option>
        ))}
      </optgroup>
    ))}
  </select>
);

const PaperPicker: React.FC<{ value: string; onChange: (v: ResourcePaper) => void }> = ({ value, onChange }) => (
  <select value={value} onChange={(e) => onChange(e.target.value as ResourcePaper)} className="px-2 py-1 border border-slate-300 rounded-lg text-xs bg-white" aria-label="Paper" data-testid="resource-paper">
    <option value="both">Paper 1 and Paper 2</option>
    <option value="Paper 1">Paper 1 only</option>
    <option value="Paper 2">Paper 2 only</option>
  </select>
);

export const ResourcesTeacherPanel: React.FC<{
  onConvert: (doc: ConvertibleDoc, intent: ConvertIntent, resource: TeacherResource) => void;
}> = ({ onConvert }) => {
  const [resources, setResources] = useState<TeacherResource[]>([]);
  const [classes, setClasses] = useState<LearnClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [link, setLink] = useState({ url: "", title: "", description: "", topics: [] as string[], paper: "both" as ResourcePaper });
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<{ title: string; description: string; url: string; topics: string[]; paper: ResourcePaper }>({ title: "", description: "", url: "", topics: [], paper: "both" });
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareSel, setShareSel] = useState<string[]>([]);
  const [toConvert, setToConvert] = useState<{ resource: TeacherResource; intent: ConvertIntent }[]>([]);
  const [converting, setConverting] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ resource: TeacherResource; src: string; access?: string } | null>(null);
  const [downloading, setDownloading] = useState<{ id: string; pct: number } | null>(null);
  const [replacing, setReplacing] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<TeacherResource | null>(null);

  const flash = (text: string, ok = true) => {
    setMsg({ ok, text });
    if (ok) setTimeout(() => setMsg((m) => (m && m.text === text ? null : m)), 5000);
  };

  const load = async () => {
    try {
      const r = await teacherFetch("/api/resources");
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Could not load your resources.");
      setResources(d.resources || []);
      setClasses(d.classes || []);
    } catch (e: any) {
      flash(e?.message || "Could not load your resources.", false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  // ---------- adding files ----------
  const addFiles = (list: FileList | File[]) => {
    const files = Array.from(list);
    if (!files.length) return;
    setPending((p) => [
      ...p.filter((x) => x.status !== "done"),
      ...files.map((file, i) => ({
        key: `${Date.now()}_${i}_${file.name}`,
        file,
        title: file.name.replace(/\.[^.]+$/, ""),
        dest: defaultDestination(file.name),
        topics: [],
        paper: "both" as const,
        status: tooBigReason(file) ? ("error" as const) : ("ready" as const),
        progress: 0,
        error: tooBigReason(file),
      })),
    ]);
  };
  const patchPending = (key: string, patch: Partial<PendingFile>) => setPending((p) => p.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  const uploadAll = async () => {
    const todo = pending.filter((p) => p.status === "ready" || (p.status === "error" && !tooBigReason(p.file)));
    if (!todo.length) return;
    setBusy(true);
    const conversions: { resource: TeacherResource; intent: ConvertIntent }[] = [];
    let ok = 0;
    for (const p of todo) {
      patchPending(p.key, { status: "uploading", progress: 0, error: undefined });
      try {
        const body = await uploadFileBody(p.file, (f) => patchPending(p.key, { progress: f }));
        patchPending(p.key, { status: "saving", progress: 1 });
        const r = await teacherFetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "file", title: p.title, topics: p.topics, paper: p.paper, ...body }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || `Saving failed (${r.status})`);
        patchPending(p.key, { status: "done", resource: d.resource });
        ok++;
        if (p.dest !== "hub" && canConvert(p.file.name)) conversions.push({ resource: d.resource, intent: p.dest });
      } catch (e: any) {
        patchPending(p.key, { status: "error", error: e?.message || "Upload failed" });
      }
    }
    setBusy(false);
    await load();
    if (ok) flash(`✓ ${ok} file${ok > 1 ? "s" : ""} added to My Resources. Tick "Share with classes" to let students see them.`);
    if (conversions.length === 1) {
      startConvert(conversions[0].resource, conversions[0].intent);
    } else if (conversions.length > 1) {
      setToConvert((t) => [...t, ...conversions]);
    }
  };

  const addLink = async () => {
    setBusy(true);
    try {
      const r = await teacherFetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "link", ...link }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Could not add the link.");
      setLink({ url: "", title: "", description: "", topics: [], paper: "both" });
      setShowLink(false);
      await load();
      flash(`✓ Link "${d.resource.title}" added.`);
    } catch (e: any) {
      flash(e?.message || "Could not add the link.", false);
    } finally {
      setBusy(false);
    }
  };

  // ---------- question bank / assessment (the existing "Upload / JSON" converter) ----------
  const startConvert = async (res: TeacherResource, intent: ConvertIntent) => {
    setConverting(res.id);
    try {
      let doc: ConvertibleDoc;
      if (extOf(res.fileName) === "docx") {
        const r = await teacherFetch(`/api/resources/${encodeURIComponent(res.id)}/text`);
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || "Could not read the Word file.");
        doc = { name: res.fileName + " (text)", size: formatSize(res.size), mimeType: "text/plain", base64: textToDataUrl(d.text), isPdf: true };
      } else {
        // Big files come in pieces (one response may be at most ~4.5 MB on Vercel)
        const t = await teacherFetch(`/api/resources/${encodeURIComponent(res.id)}/ticket`);
        const td = await t.json().catch(() => ({}));
        if (!t.ok) throw new Error(td.error || "Could not open the file.");
        let blob: Blob;
        if (needsPieces(res)) {
          blob = await fetchResourceBlob(res, td.access);
        } else {
          const r = await fetch(td.url);
          if (!r.ok) throw new Error("Could not open the file.");
          blob = await r.blob();
        }
        const isPdf = res.mime === "application/pdf";
        const typed = blob.type ? blob : new Blob([blob], { type: res.mime });
        doc = { name: res.fileName, size: formatSize(res.size), mimeType: res.mime, base64: await readAsDataUrl(typed), isPdf };
      }
      setToConvert((t) => t.filter((x) => x.resource.id !== res.id));
      onConvert(doc, intent, res);
    } catch (e: any) {
      flash(e?.message || "Could not open the converter.", false);
    } finally {
      setConverting(null);
    }
  };

  // ---------- per-resource actions ----------
  const preview = async (res: TeacherResource) => {
    if (res.kind === "link") {
      setViewer({ resource: res, src: res.url || "" });
      return;
    }
    const r = await teacherFetch(`/api/resources/${encodeURIComponent(res.id)}/ticket`);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return flash(d.error || "Could not open the resource.", false);
    if (viewMode(res) === "download") {
      if (!needsPieces(res)) {
        window.open(d.url, "_blank", "noopener");
        return;
      }
      setDownloading({ id: res.id, pct: 0 });
      try {
        await downloadResource(res, d.access, (f) => setDownloading({ id: res.id, pct: Math.round(f * 100) }));
      } catch (e: any) {
        flash(e?.message || "Could not download the file.", false);
      } finally {
        setDownloading(null);
      }
      return;
    }
    setViewer({ resource: res, src: d.url, access: d.access });
  };

  const saveEdit = async (res: TeacherResource) => {
    const r = await teacherFetch(`/api/resources/${encodeURIComponent(res.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(res.kind === "link" ? edit : { ...edit, url: undefined }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return flash(d.error || "Could not save.", false);
    setResources((rs) => rs.map((x) => (x.id === res.id ? d.resource : x)));
    setEditId(null);
    flash("✓ Saved.");
  };

  const remove = async (res: TeacherResource) => {
    const shared = (res.classIds || []).length;
    if (!window.confirm(`Delete "${res.title}"?${shared ? ` It is shared with ${shared} class${shared > 1 ? "es" : ""} and will disappear for those students.` : ""} This cannot be undone.`)) return;
    const r = await teacherFetch(`/api/resources/${encodeURIComponent(res.id)}`, { method: "DELETE" });
    if (!r.ok) return flash("Could not delete.", false);
    setResources((rs) => rs.filter((x) => x.id !== res.id));
    flash(`Deleted "${res.title}".`);
  };

  const saveShare = async (res: TeacherResource) => {
    const r = await teacherFetch(`/api/resources/${encodeURIComponent(res.id)}/share`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classIds: shareSel }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return flash(d.error || "Could not share.", false);
    setResources((rs) => rs.map((x) => (x.id === res.id ? d.resource : x)));
    setClasses(d.classes || classes);
    setShareId(null);
    flash(shareSel.length ? `✓ "${res.title}" is shared with ${shareSel.length} class${shareSel.length > 1 ? "es" : ""}.` : `"${res.title}" is no longer shared.`);
  };

  const replaceFile = async (file: File) => {
    const res = replaceTarget.current;
    if (!res) return;
    setReplacing(res.id);
    try {
      const body = await uploadFileBody(file, () => {});
      const r = await teacherFetch(`/api/resources/${encodeURIComponent(res.id)}/file`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Could not replace the file.");
      setResources((rs) => rs.map((x) => (x.id === res.id ? d.resource : x)));
      flash(`✓ Replaced the file of "${res.title}". Students see the new version.`);
    } catch (e: any) {
      flash(e?.message || "Could not replace the file.", false);
    } finally {
      setReplacing(null);
    }
  };

  const className = (id: string) => classes.find((c) => c.id === id)?.name || "";
  const readyCount = pending.filter((p) => p.status === "ready").length;

  return (
    <div className="space-y-4" data-testid="resources-panel">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-700 to-indigo-700 text-white">
        <h2 className="text-xl font-bold inline-flex items-center gap-2">
          <FolderOpen className="w-5 h-5" /> My Resources
        </h2>
        <p className="text-sm text-sky-100">
          Upload your own web pages (.html), worksheets and sample papers (PDF, Word, PowerPoint, images) or add links to your websites. Then choose which
          Learning Hub classes can see each one. PDFs, Word files and images can also be turned into questions or an assessment.
        </p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl border text-sm font-semibold flex items-start justify-between gap-2 ${msg.ok ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900"}`} data-testid="resources-msg">
          <span>{msg.text}</span>
          <button type="button" onClick={() => setMsg(null)} aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ---------- Upload ---------- */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-slate-900 mr-auto">Add resources</h3>
          <button type="button" onClick={() => fileInput.current?.click()} data-testid="resources-upload-btn" className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold inline-flex items-center gap-1.5">
            <FileUp className="w-4 h-4" /> Upload files
          </button>
          <button type="button" onClick={() => setShowLink((s) => !s)} data-testid="resources-add-link-btn" className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 inline-flex items-center gap-1.5 hover:bg-slate-50">
            <LinkIcon className="w-4 h-4" /> Add a web link
          </button>
          <input
            ref={fileInput}
            type="file"
            multiple
            className="hidden"
            data-testid="resources-file-input"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInput.current?.click()}
          className={`p-5 rounded-xl border-2 border-dashed text-center cursor-pointer text-sm ${dragging ? "border-purple-500 bg-purple-50" : "border-slate-300 bg-slate-50 hover:border-purple-400"}`}
        >
          <div className="font-semibold text-slate-700">Drop files here, or click to choose</div>
          <div className="text-xs text-slate-500">Web pages (.html), PDF, Word, PowerPoint, Excel, images... up to {MAX_RESOURCE_MB} MB each. You can choose several at once.</div>
        </div>

        {showLink && (
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-2" data-testid="resources-link-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input value={link.url} onChange={(e) => setLink({ ...link, url: e.target.value })} placeholder="Web address, e.g. https://cs-timeline-five.vercel.app/" className="px-2.5 py-2 border border-slate-300 rounded-lg text-sm" data-testid="link-url" />
              <input value={link.title} onChange={(e) => setLink({ ...link, title: e.target.value })} placeholder="Title students see" className="px-2.5 py-2 border border-slate-300 rounded-lg text-sm" data-testid="link-title" />
            </div>
            <input value={link.description} onChange={(e) => setLink({ ...link, description: e.target.value })} placeholder="Short description (optional)" className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm" />
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-slate-600">Topic:</span>
              <TopicPicker value={link.topics} onChange={(topics) => setLink({ ...link, topics })} />
              <PaperPicker value={link.paper} onChange={(paper) => setLink({ ...link, paper })} />
              <button type="button" disabled={busy || !link.url.trim()} onClick={addLink} data-testid="link-save" className="ml-auto px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold disabled:opacity-50">
                Add link
              </button>
            </div>
          </div>
        )}

        {pending.length > 0 && (
          <div className="space-y-2" data-testid="resources-pending">
            <div className="text-sm font-bold text-slate-800">Where should each file go?</div>
            {pending.map((p) => {
              const convertible = canConvert(p.file.name);
              const locked = p.status !== "ready" && p.status !== "error";
              return (
                <div key={p.key} className="p-3 rounded-xl border border-slate-200 space-y-2" data-testid="pending-file">
                  <div className="flex flex-wrap items-center gap-2">
                    <ResourceTypeIcon r={{ kind: /\.html?$/i.test(p.file.name) ? "webpage" : "file", fileName: p.file.name, mime: p.file.type }} />
                    <input
                      value={p.title}
                      disabled={locked}
                      onChange={(e) => patchPending(p.key, { title: e.target.value })}
                      className="flex-1 min-w-[180px] px-2 py-1 border border-slate-300 rounded-lg text-sm font-semibold"
                      aria-label="Title"
                    />
                    <span className="text-xs text-slate-500">
                      {p.file.name} - {formatSize(p.file.size)}
                    </span>
                    {!locked && (
                      <button type="button" onClick={() => setPending((x) => x.filter((y) => y.key !== p.key))} className="p-1 rounded hover:bg-slate-100" aria-label="Remove from list">
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    {(["hub", "bank", "assessment"] as Destination[]).map((d) => {
                      const disabled = locked || (d !== "hub" && !convertible);
                      return (
                        <label key={d} className={`inline-flex items-center gap-2 ${disabled && d !== "hub" && !convertible ? "text-slate-400" : ""}`}>
                          <input type="radio" name={`dest-${p.key}`} checked={p.dest === d} disabled={disabled} onChange={() => patchPending(p.key, { dest: d })} data-testid={`dest-${d}`} />
                          {DEST_LABEL[d]}
                          {d !== "hub" && !convertible && d === "bank" && <span className="text-[11px]">(PDF, Word .docx and images only)</span>}
                        </label>
                      );
                    })}
                    {p.dest !== "hub" && <span className="text-[11px] text-slate-500 pl-6">The file is also kept in My Resources. You will check the questions before they are saved.</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-bold text-slate-600">Topic (optional):</span>
                    <TopicPicker value={p.topics} onChange={(topics) => !locked && patchPending(p.key, { topics })} />
                    <PaperPicker value={p.paper} onChange={(paper) => !locked && patchPending(p.key, { paper })} />
                  </div>
                  {p.status !== "ready" && (
                    <div className="text-xs">
                      {(p.status === "uploading" || p.status === "saving") && (
                        <div className="space-y-1">
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-purple-500 transition-all" style={{ width: `${Math.round(p.progress * 100)}%` }} />
                          </div>
                          <span className="text-slate-600">{p.status === "uploading" ? `Uploading... ${Math.round(p.progress * 100)}%` : "Saving..."}</span>
                        </div>
                      )}
                      {p.status === "done" && <span className="font-bold text-emerald-700" data-testid="pending-done">✓ Added</span>}
                      {p.status === "error" && <span className="font-bold text-rose-700">{p.error}</span>}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="flex items-center gap-2">
              <button type="button" disabled={busy || !readyCount} onClick={uploadAll} data-testid="resources-upload-all" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold disabled:opacity-40">
                {busy ? "Uploading..." : `Upload ${readyCount || ""} file${readyCount === 1 ? "" : "s"}`}
              </button>
              {!busy && pending.every((p) => p.status === "done" || p.status === "error") && (
                <button type="button" onClick={() => setPending([])} className="text-xs font-bold text-slate-500">
                  Clear list
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {toConvert.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
          <div className="font-bold text-amber-900">Ready to turn into questions</div>
          <div className="text-xs text-amber-800">The converter works on one paper at a time. Open each one when you are ready.</div>
          {toConvert.map(({ resource, intent }) => (
            <div key={resource.id} className="flex flex-wrap items-center gap-2 text-sm">
              <ResourceTypeIcon r={resource} className="w-4 h-4" />
              <span className="font-semibold">{resource.title}</span>
              <span className="text-xs text-amber-800">({intent === "assessment" ? "assessment" : "question bank"})</span>
              <button type="button" disabled={converting === resource.id} onClick={() => startConvert(resource, intent)} className="ml-auto px-3 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold disabled:opacity-50">
                {converting === resource.id ? "Opening..." : "Open in converter"}
              </button>
              <button type="button" onClick={() => setToConvert((t) => t.filter((x) => x.resource.id !== resource.id))} className="text-xs text-amber-800">
                Later
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ---------- Library ---------- */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-slate-900">Your library ({resources.length})</h3>
          <button type="button" onClick={load} className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-600 inline-flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
        {loading && <div className="text-sm text-slate-400">Loading...</div>}
        {!loading && resources.length === 0 && <div className="text-sm text-slate-500">Nothing here yet. Upload a file or add a link above.</div>}
        <div className="divide-y divide-slate-100">
          {resources.map((res) => (
            <div key={res.id} className="py-3 space-y-2" data-testid="resource-row">
              <div className="flex flex-wrap items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <ResourceTypeIcon r={res} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900" data-testid="resource-title">{res.title}</div>
                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>{typeLabel(res)}</span>
                    {res.kind === "link" ? <span className="truncate max-w-[280px]">{res.url}</span> : <span>{res.fileName} - {formatSize(res.size)}</span>}
                    <TopicBadges topics={res.topics} paper={res.paper} />
                  </div>
                  {res.description && <div className="text-xs text-slate-600 mt-0.5 whitespace-pre-line">{res.description}</div>}
                  <div className="text-[11px] mt-1">
                    {(res.classIds || []).length ? (
                      <span className="text-emerald-700 font-semibold">Shared with: {(res.classIds || []).map(className).filter(Boolean).join(", ")}</span>
                    ) : (
                      <span className="text-slate-400">Not shared with any class yet</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => preview(res)} data-testid="resource-preview" className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 inline-flex items-center gap-1 hover:bg-slate-50">
                    <Eye className="w-3.5 h-3.5" /> {downloading?.id === res.id ? `Downloading ${downloading.pct}%` : viewMode(res) === "download" ? "Download" : "View"}
                  </button>
                  <button
                    type="button"
                    data-testid="resource-share"
                    onClick={() => {
                      setShareId(shareId === res.id ? null : res.id);
                      setShareSel(res.classIds || []);
                    }}
                    className="px-2 py-1 rounded-lg border border-emerald-300 text-xs font-bold text-emerald-700 inline-flex items-center gap-1 hover:bg-emerald-50"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share with classes...
                  </button>
                  <button
                    type="button"
                    data-testid="resource-edit"
                    onClick={() => {
                      setEditId(editId === res.id ? null : res.id);
                      setEdit({ title: res.title, description: res.description, url: res.url || "", topics: res.topics || [], paper: res.paper || "both" });
                    }}
                    className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 inline-flex items-center gap-1 hover:bg-slate-50"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  {res.kind !== "link" && (
                    <button
                      type="button"
                      disabled={replacing === res.id}
                      onClick={() => {
                        replaceTarget.current = res;
                        replaceInput.current?.click();
                      }}
                      className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 inline-flex items-center gap-1 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <Replace className="w-3.5 h-3.5" /> {replacing === res.id ? "Replacing..." : "Replace file"}
                    </button>
                  )}
                  {res.kind === "file" && canConvert(res.fileName) && (
                    <>
                      <button type="button" disabled={converting === res.id} onClick={() => startConvert(res, "bank")} className="px-2 py-1 rounded-lg border border-purple-300 text-xs font-bold text-purple-700 inline-flex items-center gap-1 hover:bg-purple-50 disabled:opacity-50" title="Turn it into questions for the question bank">
                        <ClipboardList className="w-3.5 h-3.5" /> Make questions
                      </button>
                      <button type="button" disabled={converting === res.id} onClick={() => startConvert(res, "assessment")} className="px-2 py-1 rounded-lg border border-purple-300 text-xs font-bold text-purple-700 inline-flex items-center gap-1 hover:bg-purple-50 disabled:opacity-50" title="Make an assessment from it">
                        <Sparkles className="w-3.5 h-3.5" /> Make assessment
                      </button>
                    </>
                  )}
                  <button type="button" onClick={() => remove(res)} data-testid="resource-delete" className="px-2 py-1 rounded-lg text-xs font-bold text-rose-600 inline-flex items-center gap-1 hover:bg-rose-50">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>

              {shareId === res.id && (
                <div className="ml-12 p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2" data-testid="share-box">
                  <div className="text-xs font-bold text-emerald-900">Which Learning Hub classes can see "{res.title}"?</div>
                  {classes.length === 0 ? (
                    <div className="text-xs text-slate-600">You have no Learning Hub classes yet. Create one in the 🎓 Learning Hub tab.</div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {classes.map((c) => (
                        <label key={c.id} className="inline-flex items-center gap-1.5 text-sm">
                          <input
                            type="checkbox"
                            data-testid={`share-class-${c.code}`}
                            checked={shareSel.includes(c.id)}
                            onChange={(e) => setShareSel((s) => (e.target.checked ? [...s, c.id] : s.filter((x) => x !== c.id)))}
                          />
                          {c.name} <span className="text-[10px] font-mono text-slate-500">{c.code}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => saveShare(res)} data-testid="share-save" disabled={!classes.length} className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1 disabled:opacity-50">
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button type="button" onClick={() => setShareId(null)} className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {editId === res.id && (
                <div className="ml-12 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2" data-testid="edit-box">
                  <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold" aria-label="Title" />
                  {res.kind === "link" && (
                    <input value={edit.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm" aria-label="Web address" />
                  )}
                  <textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} rows={2} placeholder="Short description students see (optional)" className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm" />
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-bold text-slate-600">Topic:</span>
                    <TopicPicker value={edit.topics} onChange={(topics) => setEdit({ ...edit, topics })} />
                    <PaperPicker value={edit.paper} onChange={(paper) => setEdit({ ...edit, paper })} />
                    <button type="button" onClick={() => saveEdit(res)} data-testid="edit-save" className="ml-auto px-3 py-1 rounded-lg bg-purple-600 text-white font-bold">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditId(null)} className="px-3 py-1 rounded-lg font-bold text-slate-600">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <input
          ref={replaceInput}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) replaceFile(f);
          }}
        />
      </div>

      {viewer && <ResourceViewer resource={viewer.resource} src={viewer.src} access={viewer.access} onClose={() => setViewer(null)} />}
    </div>
  );
};

export default ResourcesTeacherPanel;
