import React from "react";
import { Globe, FileText, Image as ImageIcon, Presentation, FileSpreadsheet, Link2, File as FileIcon } from "lucide-react";
import { PAPER1_UNITS } from "../../utils/pastPaperUtils";

// IGCSE topic units a resource can be tagged with (same codes and titles as the question bank's
// IGCSE_UNITS catalogue in server.ts). Paper 1 = written theory, Paper 2 = Python programming.
export const RESOURCE_TOPICS: { code: string; title: string; paper: "Paper 1" | "Paper 2" }[] = (
  [
    ["U01", "Output and variables"],
    ["U02", "Input and data types"],
    ["U03", "Arithmetic and operators"],
    ["U04", "Selection"],
    ["U05", "String manipulation"],
    ["U06", "Iteration with while"],
    ["U07", "Iteration with for"],
    ["U08", "Lists"],
    ["U09", "Subprograms"],
    ["U10", "Standard algorithms"],
    ["U11", "Two-dimensional lists"],
    ["U12", "Validation and robust code"],
    ["U13", "Libraries: math and time"],
    ["U14", "Reading a program"],
    ["U15", "Trace tables"],
    ["U16", "Find and fix the error"],
    ["U17", "Test data and testing"],
    ["U18", "Searching: linear and binary"],
    ["U19", "Sorting: bubble and merge"],
    ["U20", "Exam-style 20-mark programs"],
    ["U21", "Mixed exam practice"],
    ["U22", "Pseudocode and flowcharts"],
    ["U23", "Exam theory & computational thinking"],
    ["U24", "Binary & Hexadecimal Representation"],
    ["U25", "Data Storage, Compression & IEC Prefixes"],
    ["U26", "Historical Ciphers & Encryption"],
    ["U27", "Von Neumann Architecture & Hardware"],
    ["U28", "Logic Gates & Truth Tables"],
    ["U29", "Operating Systems, Utilities & Translators"],
    ["U30", "Networks & the 4-Layer TCP/IP Model"],
    ["U31", "Network Security & Cyber Attacks"],
    ["U32", "Emerging Trends, Ethics & Legislation"],
  ] as const
).map(([code, title]) => ({ code, title, paper: PAPER1_UNITS.includes(code) ? "Paper 1" : "Paper 2" }));
export const RESOURCE_TOPIC_MAP: Record<string, { code: string; title: string; paper: string }> = Object.fromEntries(RESOURCE_TOPICS.map((t) => [t.code, t]));

export type ResourcePaper = "Paper 1" | "Paper 2" | "both";

// A teacher resource as the server sends it (see resourcesServer.ts)
export interface TeacherResource {
  id: string;
  title: string;
  description: string;
  kind: "webpage" | "file" | "link";
  fileName: string;
  mime: string;
  size: number;
  url?: string;
  topics: string[];
  paper: ResourcePaper;
  updatedAt?: number;
  createdAt?: number;
  authorName?: string;
  classIds?: string[];
}

export const MAX_RESOURCE_MB = 15;

export const extOf = (name: string) => ((name || "").toLowerCase().match(/\.([a-z0-9]{1,6})$/) || [])[1] || "";

export function formatSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/** How a resource is opened: inside the app (iframe / image) or downloaded. */
export function viewMode(r: Pick<TeacherResource, "kind" | "mime">): "page" | "pdf" | "image" | "link" | "download" {
  if (r.kind === "link") return "link";
  if (r.kind === "webpage" || r.mime === "text/html") return "page";
  if (r.mime === "application/pdf") return "pdf";
  if (/^image\/(png|jpeg|gif|webp|svg\+xml)$/.test(r.mime)) return "image";
  return "download";
}

/** PDFs, Word .docx and images can be turned into questions / an assessment. */
export function canConvert(fileName: string): boolean {
  return ["pdf", "docx", "png", "jpg", "jpeg", "webp", "gif"].includes(extOf(fileName));
}

export function typeLabel(r: Pick<TeacherResource, "kind" | "fileName" | "mime">): string {
  if (r.kind === "link") return "Web link";
  if (r.kind === "webpage") return "Web page";
  const e = extOf(r.fileName);
  if (e === "pdf") return "PDF";
  if (e === "docx" || e === "doc") return "Word";
  if (e === "pptx" || e === "ppt") return "PowerPoint";
  if (e === "xlsx" || e === "xls" || e === "csv") return "Spreadsheet";
  if (r.mime.startsWith("image/")) return "Image";
  return e ? e.toUpperCase() : "File";
}

export const ResourceTypeIcon: React.FC<{ r: Pick<TeacherResource, "kind" | "fileName" | "mime">; className?: string }> = ({ r, className = "w-5 h-5" }) => {
  if (r.kind === "link") return <Link2 className={`${className} text-sky-600`} />;
  if (r.kind === "webpage") return <Globe className={`${className} text-indigo-600`} />;
  const e = extOf(r.fileName);
  if (e === "pdf" || e === "docx" || e === "doc" || e === "txt") return <FileText className={`${className} text-rose-600`} />;
  if (e === "pptx" || e === "ppt") return <Presentation className={`${className} text-orange-600`} />;
  if (e === "xlsx" || e === "xls" || e === "csv") return <FileSpreadsheet className={`${className} text-emerald-600`} />;
  if (r.mime.startsWith("image/")) return <ImageIcon className={`${className} text-purple-600`} />;
  return <FileIcon className={`${className} text-slate-500`} />;
};

export const TopicBadges: React.FC<{ topics: string[]; paper?: string }> = ({ topics, paper }) => (
  <span className="inline-flex flex-wrap gap-1">
    {paper && paper !== "both" && (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">{paper}</span>
    )}
    {(topics || []).map((t) => (
      <span key={t} title={RESOURCE_TOPIC_MAP[t]?.title || t} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
        {RESOURCE_TOPIC_MAP[t] ? RESOURCE_TOPIC_MAP[t].title : t}
      </span>
    ))}
  </span>
);

// ---------- Big files: fetched in pieces (Vercel refuses single responses over 4.5 MB) ----------
export const BIG_FILE_BYTES = 3.5 * 1024 * 1024;

/**
 * True when the file must be fetched piece by piece and shown from a blob: URL.
 * Never for web pages / SVG: those always stay on the sandboxed /view route (a blob: URL would
 * run them with the app's own origin). The server limits those to 3.5 MB.
 */
export function needsPieces(r: Pick<TeacherResource, "kind" | "mime" | "size">): boolean {
  return r.kind !== "link" && r.mime !== "text/html" && r.mime !== "image/svg+xml" && (r.size || 0) > BIG_FILE_BYTES;
}

/**
 * Downloads a resource in pieces and puts it back together. `access` is the query string that
 * proves access: "class=CODE" (students) or the teacher's preview ticket "t=...".
 */
export async function fetchResourceBlob(r: Pick<TeacherResource, "id" | "mime">, access: string, onProgress?: (fraction: number) => void): Promise<Blob> {
  const base = `/api/resources/${encodeURIComponent(r.id)}`;
  const mr = await fetch(`${base}/meta?${access}`);
  const meta = await mr.json().catch(() => null);
  if (!mr.ok || !meta) throw new Error((meta && meta.error) || "Could not open this file.");
  if (meta.viewOnly) throw new Error("This file can only be opened directly.");
  const pieces: ArrayBuffer[] = [];
  onProgress?.(0);
  for (let n = 0; n < meta.parts; n++) {
    let buf: ArrayBuffer | null = null;
    for (let attempt = 0; attempt < 3 && !buf; attempt++) {
      const pr = await fetch(`${base}/part/${n}?${access}`);
      if (pr.ok) buf = await pr.arrayBuffer();
      else if (pr.status === 403 || pr.status === 404) throw new Error(await pr.text());
    }
    if (!buf) throw new Error("Could not download the file. Please check your internet connection and try again.");
    pieces.push(buf);
    onProgress?.((n + 1) / meta.parts);
  }
  const blob = new Blob(pieces, { type: meta.mime || r.mime || "application/octet-stream" });
  if (meta.size && blob.size !== meta.size) throw new Error("The file did not download completely. Please try again.");
  return blob;
}

/** Saves a big resource with its original file name. */
export async function downloadResource(r: Pick<TeacherResource, "id" | "mime" | "fileName">, access: string, onProgress?: (fraction: number) => void) {
  const blob = await fetchResourceBlob(r, access, onProgress);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = r.fileName || "file";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
