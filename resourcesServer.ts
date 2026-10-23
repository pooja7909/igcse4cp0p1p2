// Teacher resources: the teacher's own web pages (.html), worksheets / sample papers (PDF, Word,
// PowerPoint, images, ...) and links to her websites. She chooses which Learning Hub classes see
// each one (stored as `resourceIds` on the learn class).
//
// Storage (same pattern as learnServer.ts):
// - metadata: in-memory `resourcesDb`, saved to data/resources_db.json locally and shared between
//   server copies by server.ts through SyncedCollection("resources");
// - file content: NOT kept in a SyncedCollection (that would load every file into every server copy).
//   With the shared database it is written once to the "resource_files" collection as base64 parts
//   (serverStore.ts writeBlob) and read on demand; locally it is a file in data/resource_files/.
//
// Security: uploaded HTML is served with a CSP sandbox (opaque origin), so a page can run its own
// scripts but can never read the app's storage (teacher token, student ids) or call the API as the app.
import type express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import zlib from "zlib";
import { learnClassesDb, saveLearnData } from "./learnServer.js";
import { isSharedStoreEnabled, readUpload, deleteUpload, writeBlob, readBlobParts, deleteBlob, BLOB_PART_BYTES } from "./serverStore.js";

export const resourcesDb: Record<string, any> = {};
/** Small settings record (e.g. whether the starter link has been added once). */
export const resourcesMeta: Record<string, any> = {};
const META_ID = "__meta";
const FILES_COLLECTION = "resource_files";

export const MAX_RESOURCE_BYTES = 15 * 1024 * 1024; // 15 MB per file
// Vercel refuses responses over 4.5 MB, so bigger files are fetched by the browser in pieces
// (/part/:n, each piece = 3 stored parts = 1.8 MB) and put back together there.
// Files above BIG_FILE_BYTES use pieces; web pages (and SVG) must stay on the sandboxed /view route,
// so they are limited to BIG_FILE_BYTES.
export const BIG_FILE_BYTES = 3.5 * 1024 * 1024;
const STORED_PARTS_PER_PIECE = 3;
export const PIECE_BYTES = STORED_PARTS_PER_PIECE * BLOB_PART_BYTES;
const mustUseView = (mime: string) => mime === "text/html" || mime === "image/svg+xml";
const MAX_TITLE = 160;
const MAX_DESCRIPTION = 2_000;
const MAX_URL = 2_000;
const TICKET_MS = 2 * 60 * 60 * 1000; // a teacher's preview link works for 2 hours

// IGCSE topic units (U01..U32, U99 = miscellaneous), the same codes as the question bank (IGCSE_UNITS in server.ts)
const isTopicCode = (c: string) => /^U(0[1-9]|[12][0-9]|3[0-2]|99)$/.test(c);
const TIMELINE_ID = "res_cs_timeline";

let dataFile = "";
let filesDir = "";

export function loadResourceData(dataDir: string) {
  dataFile = path.join(dataDir, "resources_db.json");
  filesDir = path.join(dataDir, "resource_files");
  try {
    if (fs.existsSync(dataFile)) {
      const d = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
      Object.assign(resourcesDb, d.resources || {});
      Object.assign(resourcesMeta, d.meta || {});
    }
  } catch (e) {
    console.warn("Could not load resources data:", e);
  }
}

function saveResourceData() {
  if (!dataFile) return;
  try {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify({ resources: resourcesDb, meta: resourcesMeta }));
  } catch (e) {
    console.warn("Could not save resources data:", e);
  }
}

// ---------- shared-database sync helpers (used by server.ts) ----------
export function resourcesForSync(): Record<string, any> {
  return { ...resourcesDb, [META_ID]: { ...resourcesMeta } };
}
export function applyRemoteResource(id: string, value: any | null) {
  if (id === META_ID) {
    if (value) Object.assign(resourcesMeta, value);
    return;
  }
  if (value === null) delete resourcesDb[id];
  else resourcesDb[id] = value;
}

// ---------- file content ----------
const fileCache = new Map<string, Buffer[]>(); // key: id@fileVersion
let fileCacheBytes = 0;
const FILE_CACHE_MAX = 40 * 1024 * 1024;

function cacheFile(key: string, parts: Buffer[]) {
  const size = parts.reduce((n, b) => n + b.length, 0);
  if (size > FILE_CACHE_MAX / 2) return;
  while (fileCacheBytes + size > FILE_CACHE_MAX && fileCache.size) {
    const first = fileCache.keys().next().value as string;
    fileCacheBytes -= (fileCache.get(first) || []).reduce((n, b) => n + b.length, 0);
    fileCache.delete(first);
  }
  fileCache.set(key, parts);
  fileCacheBytes += size;
}
function dropCached(id: string) {
  for (const k of [...fileCache.keys()]) {
    if (k.startsWith(id + "@")) {
      fileCacheBytes -= (fileCache.get(k) || []).reduce((n, b) => n + b.length, 0);
      fileCache.delete(k);
    }
  }
}

const localFile = (id: string) => path.join(filesDir, id.replace(/[^A-Za-z0-9_-]/g, "") + ".bin");

async function storeFile(id: string, base64: string) {
  dropCached(id);
  if (isSharedStoreEnabled()) {
    await writeBlob(FILES_COLLECTION, id, base64);
    return;
  }
  fs.mkdirSync(filesDir, { recursive: true });
  fs.writeFileSync(localFile(id), Buffer.from(base64, "base64"));
}

/** The file as one or more byte buffers (streamed one after the other), or null. */
async function loadFile(r: any): Promise<Buffer[] | null> {
  const key = `${r.id}@${r.fileVersion || 0}`;
  const hit = fileCache.get(key);
  if (hit) return hit;
  let parts: Buffer[] | null = null;
  if (isSharedStoreEnabled()) {
    const b64 = await readBlobParts(FILES_COLLECTION, r.id);
    if (b64) parts = b64.map((p) => Buffer.from(p, "base64"));
  } else {
    try {
      parts = [fs.readFileSync(localFile(r.id))];
    } catch {
      parts = null;
    }
  }
  if (parts) cacheFile(key, parts);
  return parts;
}

/** One piece (PIECE_BYTES) of a file, reading only the stored parts it needs. */
async function loadPiece(r: any, n: number): Promise<Buffer | null> {
  const hit = fileCache.get(`${r.id}@${r.fileVersion || 0}`);
  if (hit || !isSharedStoreEnabled()) {
    const parts = hit || (await loadFile(r));
    if (!parts) return null;
    const all = parts.length === 1 ? parts[0] : Buffer.concat(parts);
    const piece = all.subarray(n * PIECE_BYTES, (n + 1) * PIECE_BYTES);
    return piece.length ? piece : null;
  }
  const b64 = await readBlobParts(FILES_COLLECTION, r.id, { from: n * STORED_PARTS_PER_PIECE, to: (n + 1) * STORED_PARTS_PER_PIECE });
  return b64 ? Buffer.concat(b64.map((p) => Buffer.from(p, "base64"))) : null;
}

async function removeFile(id: string) {
  dropCached(id);
  try {
    if (isSharedStoreEnabled()) await deleteBlob(FILES_COLLECTION, id);
    else fs.rmSync(localFile(id), { force: true });
  } catch (e) {
    console.warn("[resources] Could not delete file", id, e);
  }
}

// ---------- validation ----------
const oneLine = (v: any, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const multiLine = (v: any, max: number) => String(v ?? "").replace(/\r\n/g, "\n").trim().slice(0, max);

function cleanFileName(n: any): string {
  const base = String(n ?? "").split(/[\\/]/).pop() || "";
  return base.replace(/[\u0000-\u001f\u007f"<>|*?]/g, "").replace(/\s+/g, " ").trim().slice(0, 140) || "file";
}
const extOf = (name: string) => (name.toLowerCase().match(/\.([a-z0-9]{1,6})$/) || [])[1] || "";

const MIME_BY_EXT: Record<string, string> = {
  html: "text/html",
  htm: "text/html",
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
  csv: "text/csv",
  py: "text/x-python",
  zip: "application/zip",
  mp4: "video/mp4",
  mp3: "audio/mpeg",
};
/** Types a browser can show safely inside the app (everything else is downloaded). */
const INLINE_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"]);

function mimeFor(fileName: string): string {
  return MIME_BY_EXT[extOf(fileName)] || "application/octet-stream";
}

function cleanTopics(v: any): string[] {
  const list = Array.isArray(v) ? v : typeof v === "string" && v ? [v] : [];
  const out: string[] = [];
  for (const t of list) {
    const c = String(t || "").trim().toUpperCase();
    if (isTopicCode(c) && !out.includes(c)) out.push(c);
  }
  return out;
}
/** Which IGCSE paper a resource is for: "Paper 1", "Paper 2" or "both" (default). */
const cleanPaper = (v: any) => (v === "Paper 1" || v === "Paper 2" ? v : "both");

function cleanUrl(v: any): string | null {
  const s = String(v ?? "").trim().slice(0, MAX_URL);
  if (!s) return null;
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(s) ? s : "https://" + s);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

function stripDataUrl(b64: string): string {
  const m = b64.match(/^data:[^;,]*(?:;[^,]*)?,(.*)$/s);
  return (m ? m[1] : b64).replace(/\s+/g, "");
}

const base64Bytes = (b64: string) => Math.floor((b64.length * 3) / 4) - (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0);

/** Reads the uploaded file (sent in pieces through /api/uploads/chunk, or inline when small). */
async function receiveFile(body: any): Promise<{ base64: string; bytes: number }> {
  let raw = "";
  const up = body?.upload;
  if (up && typeof up.uploadId === "string") {
    const total = Number(up.totalChunks) || 0;
    if (!/^[a-zA-Z0-9_-]{8,64}$/.test(up.uploadId) || total < 1 || total > 60) throw new Error("Invalid upload.");
    raw = await readUpload(up.uploadId, total);
    await deleteUpload(up.uploadId, total);
  } else if (typeof body?.base64 === "string") {
    raw = body.base64;
  }
  const base64 = stripDataUrl(raw);
  if (!base64) throw new Error("The file is empty or did not upload. Please try again.");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) throw new Error("The file did not upload correctly. Please try again.");
  const bytes = base64Bytes(base64);
  if (bytes > MAX_RESOURCE_BYTES) throw new Error(`The file is too big (${(bytes / 1048576).toFixed(1)} MB). The limit is 15 MB.`);
  return { base64, bytes };
}

function tooBigPage(bytes: number) {
  return `This web page is ${(bytes / 1048576).toFixed(1)} MB. Web pages (and SVG pictures) can be at most 3.5 MB - usually large pictures are embedded in it. Make the pictures smaller, or upload them as separate files.`;
}

function publicResource(r: any) {
  return {
    id: r.id,
    title: r.title,
    description: r.description || "",
    kind: r.kind,
    fileName: r.fileName || "",
    mime: r.mime || "",
    size: r.size || 0,
    url: r.kind === "link" ? r.url : undefined,
    topics: Array.isArray(r.topics) ? r.topics : [],
    paper: r.paper === "Paper 1" || r.paper === "Paper 2" ? r.paper : "both",
    updatedAt: r.updatedAt || r.createdAt,
  };
}

function teacherResource(r: any) {
  const classIds = Object.values(learnClassesDb)
    .filter((c: any) => c && Array.isArray(c.resourceIds) && c.resourceIds.includes(r.id))
    .map((c: any) => c.id);
  return { ...publicResource(r), createdAt: r.createdAt, authorId: r.authorId, authorName: r.authorName, classIds };
}

function findClassByCode(code: any): any | null {
  const c = String(code || "").trim().toUpperCase();
  if (!c) return null;
  return Object.values(learnClassesDb).find((x: any) => x && x.code === c) || null;
}

/** Adds the teacher's timeline website once, only into an empty library, and never again after that. */
function seedStarterResources() {
  if (resourcesMeta.starterSeeded) return false;
  resourcesMeta.starterSeeded = Date.now();
  if (Object.keys(resourcesDb).length === 0) {
    const now = Date.now();
    resourcesDb[TIMELINE_ID] = {
      id: TIMELINE_ID,
      kind: "link",
      title: "Computer Science Timeline",
      description: "Interactive timeline of the history of computer science (my website).",
      url: "https://cs-timeline-five.vercel.app/",
      fileName: "",
      mime: "",
      size: 0,
      topics: [],
      paper: "both",
      createdAt: now,
      updatedAt: now,
      authorId: "",
      authorName: "",
    };
  }
  return true;
}

/** Student requests that refer to a resource or class this server copy has not seen need fresh data. */
export function resourcesNeedsFresh(req: express.Request): boolean {
  if (req.method !== "GET") return true;
  const m = req.path.match(/^\/resources\/([^/]+)/);
  if (!m) return false;
  const r = resourcesDb[decodeURIComponent(m[1])];
  if (!r) return true;
  const code = (req.query as any)?.class;
  if (code) {
    const c = findClassByCode(code);
    if (!c || !Array.isArray(c.resourceIds) || !c.resourceIds.includes(r.id)) return true;
  }
  return false;
}

// ---------- .docx -> plain text (no extra packages: a tiny zip reader + zlib) ----------
function readZipEntry(buf: Buffer, wanted: string): Buffer | null {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65_557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return null;
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < count && p + 46 <= buf.length; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) return null;
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);
    if (name === wanted) {
      if (buf.readUInt32LE(localOffset) !== 0x04034b50) return null;
      const start = localOffset + 30 + buf.readUInt16LE(localOffset + 26) + buf.readUInt16LE(localOffset + 28);
      const data = buf.subarray(start, start + compSize);
      if (method === 0) return Buffer.from(data);
      if (method === 8) return zlib.inflateRawSync(data);
      return null;
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return null;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&");
}

export function docxToText(buf: Buffer): string | null {
  const xml = readZipEntry(buf, "word/document.xml");
  if (!xml) return null;
  const text = xml
    .toString("utf8")
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:(br|cr)\b[^>]*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<\/w:tc>/g, "\t")
    .replace(/<[^>]+>/g, "");
  return decodeXmlEntities(text).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ---------- routes ----------
export function registerResourceRoutes(
  app: express.Express,
  deps: {
    requireTeacher: express.RequestHandler;
    /** True when the request carries a valid teacher login (Authorization header). */
    isTeacher?: (req: express.Request) => boolean;
    /** HMAC-signs a string with the server's secret (used for short-lived preview links). */
    sign?: (payload: string) => string;
  }
) {
  const { requireTeacher } = deps;
  const sign =
    deps.sign ||
    ((payload: string) =>
      crypto
        .createHmac("sha256", process.env.TEACHER_TOKEN_SECRET || "edexcel-resources:" + (process.env.TEACHER_PASSCODE || ""))
        .update(payload)
        .digest("base64url"));
  const ticketFor = (id: string) => {
    const exp = Date.now() + TICKET_MS;
    return `${exp}.${sign(`resource-view:${id}:${exp}`)}`;
  };
  const ticketOk = (id: string, t: any) => {
    const m = String(t || "").match(/^(\d{10,16})\.([A-Za-z0-9_-]{20,100})$/);
    if (!m || Number(m[1]) < Date.now()) return false;
    const a = Buffer.from(m[2]);
    const b = Buffer.from(sign(`resource-view:${id}:${m[1]}`));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  };

  const learnClassSummaries = () =>
    Object.values(learnClassesDb)
      .filter(Boolean)
      .map((c: any) => ({ id: c.id, name: c.name, code: c.code, resourceIds: Array.isArray(c.resourceIds) ? c.resourceIds : [], createdAt: c.createdAt || 0 }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const list = () =>
    Object.values(resourcesDb)
      .filter(Boolean)
      .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0))
      .map(teacherResource);

  // ---- Teacher: library ----
  app.get("/api/resources", requireTeacher, (_req, res) => {
    if (seedStarterResources()) saveResourceData();
    res.json({ resources: list(), classes: learnClassSummaries(), maxBytes: MAX_RESOURCE_BYTES });
  });

  app.post("/api/resources", requireTeacher, async (req, res) => {
    try {
      const b = req.body || {};
      const teacher = (req as any).teacher;
      const kind = b.kind === "link" ? "link" : "file";
      const now = Date.now();
      const id = "res_" + now.toString(36) + crypto.randomBytes(4).toString("hex");
      const r: any = {
        id,
        title: "",
        description: multiLine(b.description, MAX_DESCRIPTION),
        topics: cleanTopics(b.topics),
        paper: cleanPaper(b.paper),
        createdAt: now,
        updatedAt: now,
        authorId: teacher?.id || "",
        authorName: teacher?.name || "",
      };
      if (kind === "link") {
        const url = cleanUrl(b.url);
        if (!url) {
          res.status(400).json({ error: "Please paste a full web address, e.g. https://example.com" });
          return;
        }
        Object.assign(r, { kind: "link", url, fileName: "", mime: "", size: 0 });
        r.title = oneLine(b.title, MAX_TITLE) || new URL(url).hostname;
      } else {
        const fileName = cleanFileName(b.fileName);
        const mime = mimeFor(fileName);
        const { base64, bytes } = await receiveFile(b);
        if (mustUseView(mime) && bytes > BIG_FILE_BYTES) throw new Error(tooBigPage(bytes));
        Object.assign(r, { kind: mime === "text/html" ? "webpage" : "file", fileName, mime, size: bytes, fileVersion: now });
        r.title = oneLine(b.title, MAX_TITLE) || fileName.replace(/\.[^.]+$/, "");
        await storeFile(id, base64);
      }
      resourcesDb[id] = r;
      if (!resourcesMeta.starterSeeded) resourcesMeta.starterSeeded = now; // her own library: never add the starter link later
      saveResourceData();
      res.json({ resource: teacherResource(r) });
    } catch (e: any) {
      res.status(400).json({ error: e?.message || "Could not save the resource." });
    }
  });

  app.put("/api/resources/:id", requireTeacher, (req, res) => {
    const r = resourcesDb[req.params.id];
    if (!r) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    const b = req.body || {};
    if (b.title !== undefined) {
      const t = oneLine(b.title, MAX_TITLE);
      if (!t) {
        res.status(400).json({ error: "Please give the resource a title." });
        return;
      }
      r.title = t;
    }
    if (b.description !== undefined) r.description = multiLine(b.description, MAX_DESCRIPTION);
    if (b.topics !== undefined) r.topics = cleanTopics(b.topics);
    if (b.paper !== undefined) r.paper = cleanPaper(b.paper);
    if (b.url !== undefined && r.kind === "link") {
      const url = cleanUrl(b.url);
      if (!url) {
        res.status(400).json({ error: "Please paste a full web address, e.g. https://example.com" });
        return;
      }
      r.url = url;
    }
    r.updatedAt = Date.now();
    saveResourceData();
    res.json({ resource: teacherResource(r) });
  });

  app.put("/api/resources/:id/file", requireTeacher, async (req, res) => {
    const r = resourcesDb[req.params.id];
    if (!r || r.kind === "link") {
      res.status(404).json({ error: "Resource not found (links have no file)." });
      return;
    }
    try {
      const fileName = cleanFileName(req.body?.fileName);
      const mime = mimeFor(fileName);
      const { base64, bytes } = await receiveFile(req.body);
      if (mustUseView(mime) && bytes > BIG_FILE_BYTES) throw new Error(tooBigPage(bytes));
      await storeFile(r.id, base64);
      const now = Date.now();
      Object.assign(r, { fileName, mime, size: bytes, kind: mime === "text/html" ? "webpage" : "file", fileVersion: now, updatedAt: now });
      saveResourceData();
      res.json({ resource: teacherResource(r) });
    } catch (e: any) {
      res.status(400).json({ error: e?.message || "Could not replace the file." });
    }
  });

  app.delete("/api/resources/:id", requireTeacher, async (req, res) => {
    const r = resourcesDb[req.params.id];
    if (!r) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    if (r.kind !== "link") await removeFile(r.id);
    delete resourcesDb[r.id];
    let classesChanged = false;
    for (const c of Object.values(learnClassesDb) as any[]) {
      if (c && Array.isArray(c.resourceIds) && c.resourceIds.includes(r.id)) {
        c.resourceIds = c.resourceIds.filter((x: string) => x !== r.id);
        classesChanged = true;
      }
    }
    resourcesMeta.starterSeeded = resourcesMeta.starterSeeded || Date.now();
    saveResourceData();
    if (classesChanged) saveLearnData();
    res.json({ success: true });
  });

  // Share one resource with a set of classes (added at the end of each class's list)
  app.put("/api/resources/:id/share", requireTeacher, (req, res) => {
    const r = resourcesDb[req.params.id];
    if (!r) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    const wanted = new Set((Array.isArray(req.body?.classIds) ? req.body.classIds : []).map(String));
    for (const c of Object.values(learnClassesDb) as any[]) {
      if (!c) continue;
      const ids: string[] = Array.isArray(c.resourceIds) ? c.resourceIds : [];
      const has = ids.includes(r.id);
      if (wanted.has(c.id) && !has) c.resourceIds = [...ids, r.id];
      else if (!wanted.has(c.id) && has) c.resourceIds = ids.filter((x) => x !== r.id);
    }
    saveLearnData();
    res.json({ resource: teacherResource(r), classes: learnClassSummaries() });
  });

  // The resources one class can see, in order (Learning Hub teacher panel)
  app.put("/api/learn/classes/:id/resources", requireTeacher, (req, res) => {
    const c = learnClassesDb[req.params.id];
    if (!c) {
      res.status(404).json({ error: "Class not found" });
      return;
    }
    const ids: string[] = [];
    for (const x of Array.isArray(req.body?.resourceIds) ? req.body.resourceIds : []) {
      const id = String(x);
      if (resourcesDb[id] && !ids.includes(id)) ids.push(id);
    }
    c.resourceIds = ids;
    saveLearnData();
    res.json({ resourceIds: ids });
  });

  // A short-lived link the teacher's browser can open (iframe / new tab) without sending her login
  app.get("/api/resources/:id/ticket", requireTeacher, (req, res) => {
    const r = resourcesDb[req.params.id];
    if (!r) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    const access = `t=${ticketFor(r.id)}`;
    res.json({ url: `/api/resources/${encodeURIComponent(r.id)}/view?${access}`, access });
  });

  // Plain text of a Word (.docx) file, so it can be turned into questions by the existing converter
  app.get("/api/resources/:id/text", requireTeacher, async (req, res) => {
    const r = resourcesDb[req.params.id];
    if (!r || r.kind === "link") {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    if (extOf(r.fileName) !== "docx") {
      res.status(400).json({ error: "Only Word .docx files can be read as text." });
      return;
    }
    const parts = await loadFile(r);
    const text = parts ? docxToText(Buffer.concat(parts)) : null;
    if (!text) {
      res.status(422).json({ error: "Could not read the text in this Word file. Save it as PDF and upload that instead." });
      return;
    }
    res.json({ text: text.slice(0, 400_000) });
  });

  // ---- Students: the resources shared with their class ----
  app.get("/api/learn/c/:code/resources", (req, res) => {
    const c = findClassByCode(req.params.code);
    if (!c) {
      res.status(404).json({ error: "This class link is not valid." });
      return;
    }
    const ids: string[] = Array.isArray(c.resourceIds) ? c.resourceIds : [];
    res.json({ resources: ids.map((id) => resourcesDb[id]).filter(Boolean).map(publicResource) });
  });

  // ---- Viewing a resource (students with a class code it is shared with; teachers) ----
  /** Teacher (login or preview ticket) or a student whose class code has this resource shared. */
  const canView = (req: express.Request, r: any) => {
    const q: any = req.query || {};
    if (deps.isTeacher?.(req)) return true;
    if (q.t && ticketOk(r.id, q.t)) return true;
    if (q.class) {
      const c = findClassByCode(q.class);
      return Boolean(c && Array.isArray(c.resourceIds) && c.resourceIds.includes(r.id));
    }
    return false;
  };
  /** Sends the 403/404 and returns null when the request may not see this resource. */
  const gate = (req: express.Request, res: express.Response) => {
    const r = resourcesDb[req.params.id];
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    if (!r || !canView(req, r)) {
      res.status(r ? 403 : 404).type("text/plain").send(r ? "This resource has not been shared with your class." : "Resource not found.");
      return null;
    }
    return r;
  };

  // Facts the browser needs to fetch a big file piece by piece
  app.get("/api/resources/:id/meta", (req, res) => {
    const r = gate(req, res);
    if (!r) return;
    if (r.kind === "link") {
      res.status(400).json({ error: "Links have no file." });
      return;
    }
    const size = r.size || 0;
    res.json({
      id: r.id,
      fileName: r.fileName,
      mime: r.mime,
      size,
      pieceBytes: PIECE_BYTES,
      parts: Math.max(1, Math.ceil(size / PIECE_BYTES)),
      viewOnly: mustUseView(r.mime), // web pages are only ever served by /view (sandboxed)
    });
  });

  // One piece of a file (binary). Never used for web pages, which must stay sandboxed on /view.
  app.get("/api/resources/:id/part/:n", async (req, res) => {
    const r = gate(req, res);
    if (!r) return;
    const n = Number(req.params.n);
    const parts = Math.max(1, Math.ceil((r.size || 0) / PIECE_BYTES));
    if (r.kind === "link" || mustUseView(r.mime) || !Number.isInteger(n) || n < 0 || n >= parts) {
      res.status(400).type("text/plain").send("Invalid part.");
      return;
    }
    try {
      const piece = await loadPiece(r, n);
      if (!piece) {
        res.status(404).type("text/plain").send("This part of the file is missing.");
        return;
      }
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", "attachment");
      res.setHeader("Cache-Control", "private, max-age=300");
      res.setHeader("X-Resource-Parts", String(parts));
      res.setHeader("X-Resource-Size", String(r.size || 0));
      res.setHeader("X-Resource-Mime", r.mime || "application/octet-stream");
      res.setHeader("X-Resource-Filename", encodeURIComponent(r.fileName || "file"));
      res.setHeader("Content-Length", String(piece.length));
      res.end(piece);
    } catch (e: any) {
      console.error("[resources] Could not serve part", r.id, n, e);
      res.status(500).type("text/plain").send("Could not load this part. Please try again.");
    }
  });

  app.get("/api/resources/:id/view", async (req, res) => {
    const r = gate(req, res);
    if (!r) return;
    // Testing aid (and a safety net): refuse single responses above this size, so big files must use /part
    const viewMax = Number(process.env.RESOURCE_VIEW_MAX_BYTES) || 0;
    if (viewMax && r.kind !== "link" && (r.size || 0) > viewMax) {
      res.status(413).type("text/plain").send("This file is too big to open in one go - please open it from the app.");
      return;
    }
    if (r.kind === "link") {
      res.redirect(302, r.url);
      return;
    }
    try {
      const parts = await loadFile(r);
      if (!parts) {
        res.status(404).type("text/plain").send("The file for this resource is missing. Ask your teacher to upload it again.");
        return;
      }
      const size = parts.reduce((n, b) => n + b.length, 0);
      const fileName = r.fileName || "file";
      const ascii = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
      const disposition = (how: string) => `${how}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
      res.setHeader("Cache-Control", "private, max-age=300");
      if (r.mime === "text/html") {
        // Opaque origin: the page may run its own scripts but can never touch the app's storage or API session
        res.setHeader("Content-Security-Policy", "sandbox allow-scripts allow-forms allow-popups allow-modals allow-downloads");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Content-Disposition", disposition("inline"));
      } else if (INLINE_TYPES.has(r.mime)) {
        // SVG can contain scripts: sandbox it too (PDFs must not be sandboxed or Chrome's viewer refuses them)
        if (r.mime === "image/svg+xml") res.setHeader("Content-Security-Policy", "sandbox");
        res.setHeader("Content-Type", r.mime);
        res.setHeader("Content-Disposition", disposition("inline"));
      } else {
        res.setHeader("Content-Type", r.mime || "application/octet-stream");
        res.setHeader("Content-Disposition", disposition("attachment"));
      }
      res.setHeader("Content-Length", String(size));
      // Written part by part (each stored part is at most ~600 KB)
      for (const p of parts) res.write(p);
      res.end();
    } catch (e: any) {
      console.error("[resources] Could not serve", r.id, e);
      if (!res.headersSent) res.status(500).type("text/plain").send("Could not load this resource. Please try again.");
      else res.end();
    }
  });
}
