/**
 * Shared persistence for serverless hosting (Vercel).
 *
 * Why this exists: on Vercel every request can land on a different, short-lived
 * server instance, and each instance has its own private /tmp folder. Anything the
 * server kept in memory or in /tmp was invisible to other instances, so an
 * assessment created by the teacher "did not exist" when the student joined.
 *
 * This module stores every record as its own Firestore document so all instances
 * share one source of truth. Records are stored as JSON strings, which avoids
 * Firestore's restrictions (no `undefined`, no nested arrays such as trace-table
 * rows). Records bigger than Firestore's 1 MB document limit are split into parts.
 *
 * Two connection modes:
 *   1. FIREBASE_SERVICE_ACCOUNT env var set  -> firebase-admin (recommended; lets you
 *      lock the database down with security rules).
 *   2. Otherwise -> the regular Firebase web SDK using firebase-applet-config.json
 *      (works with the current open security rules).
 */
import fs from "fs";
import path from "path";

export type StoredDoc = { id: string; json: string | null; updatedAt: number };

interface Adapter {
  readSince(collection: string, since: number): Promise<StoredDoc[]>;
  readOne(collection: string, id: string): Promise<StoredDoc | null>;
  writeMany(collection: string, docs: StoredDoc[]): Promise<void>;
  getRaw(collection: string, id: string): Promise<any | null>;
  setRaw(collection: string, id: string, data: any): Promise<void>;
  deleteRaw(collection: string, id: string): Promise<void>;
}

const PREFIX = process.env.FIRESTORE_COLLECTION_PREFIX || "server_";
const PART_SIZE = 800_000; // characters per document part (well under the 1 MiB limit)
const BATCH_LIMIT = 400;

function loadFirebaseConfig(): any {
  try {
    const p = path.join(process.cwd(), "firebase-applet-config.json");
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return {};
  }
}

function chunkString(s: string, size: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += size) out.push(s.slice(i, i + size));
  return out.length ? out : [""];
}

async function createAdapter(): Promise<Adapter> {
  const fileCfg = loadFirebaseConfig();
  const projectId = process.env.FIREBASE_PROJECT_ID || fileCfg.projectId;
  const databaseId = process.env.FIRESTORE_DATABASE_ID || fileCfg.firestoreDatabaseId || "(default)";

  // ---------- Test mode: shared local folder (simulates Firestore for local testing) ----------
  if (process.env.STORE_TEST_DIR) {
    const dir = process.env.STORE_TEST_DIR;
    // Test-only operation counter (reads are billed per document, min 1 per query)
    const opsFile = path.join(dir, "ops-" + process.pid + ".json");
    const ops: any = { reads: 0, writes: 0, by: {} };
    const count = (r: number, w: number, key = "") => {
      ops.reads += r;
      ops.writes += w;
      if (key) ops.by[key] = (ops.by[key] || 0) + r + w;
      try { fs.writeFileSync(opsFile, JSON.stringify(ops)); } catch {}
    };
    const file = (col: string, id: string) => path.join(dir, col, encodeURIComponent(id) + ".json");
    const write = (col: string, id: string, data: any) => {
      fs.mkdirSync(path.join(dir, col), { recursive: true });
      fs.writeFileSync(file(col, id), JSON.stringify(data));
    };
    const read = (col: string, id: string) => {
      try { return JSON.parse(fs.readFileSync(file(col, id), "utf-8")); } catch { return null; }
    };
    return {
      async readSince(col, since) {
        if (process.env.STORE_TEST_FAIL) throw new Error(process.env.STORE_TEST_FAIL);
        const folder = path.join(dir, PREFIX + col);
        if (!fs.existsSync(folder)) { count(1, 0, "query-empty:" + col); return []; }
        const out: StoredDoc[] = [];
        for (const f of fs.readdirSync(folder)) {
          const id = decodeURIComponent(f.replace(/\.json$/, ""));
          const data = read(PREFIX + col, id);
          if (!data || !(data.updatedAt > since)) continue;
          if (data.deleted) { out.push({ id, json: null, updatedAt: data.updatedAt }); continue; }
          if (typeof data.json === "string") { out.push({ id, json: data.json, updatedAt: data.updatedAt }); continue; }
          if (data.parts) {
            const pieces: string[] = [];
            for (let i = 0; i < data.parts; i++) pieces.push(read(PREFIX + col + "_parts", `${data.partKey}__${i}`)?.data || "");
            out.push({ id, json: pieces.join(""), updatedAt: data.updatedAt });
          }
        }
        count(Math.max(1, out.length), 0, (out.length ? "query-docs:" : "query-empty:") + col);
        return out;
      },
      async writeMany(col, docs) {
        let n = 0;
        for (const doc of docs) for (const op of buildWrites(col, doc)) { write(op.col, op.id, op.data); n++; }
        count(0, n, "write:" + col);
      },
      async readOne(col, id) {
        count(1, 0, "guard-read:" + col);
        const data = read(PREFIX + col, id);
        if (!data) return null;
        if (data.deleted) return { id, json: null, updatedAt: data.updatedAt };
        if (typeof data.json === "string") return { id, json: data.json, updatedAt: data.updatedAt };
        if (data.parts) {
          const pieces: string[] = [];
          for (let i = 0; i < data.parts; i++) pieces.push(read(PREFIX + col + "_parts", `${data.partKey}__${i}`)?.data || "");
          return { id, json: pieces.join(""), updatedAt: data.updatedAt };
        }
        return null;
      },
      async getRaw(col, id) { return read(PREFIX + col, id); },
      async setRaw(col, id, data) { write(PREFIX + col, id, data); },
      async deleteRaw(col, id) { try { fs.unlinkSync(file(PREFIX + col, id)); } catch {} },
    };
  }

  // ---------- Mode 1: firebase-admin ----------
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    const app =
      getApps().find((a) => a.name === "edexcel-server") ||
      initializeApp({ credential: cert(sa), projectId: projectId || sa.project_id }, "edexcel-server");
    const db = databaseId && databaseId !== "(default)" ? getFirestore(app, databaseId) : getFirestore(app);

    return {
      async readSince(col, since) {
        const ref = db.collection(PREFIX + col);
        const snap = since > 0 ? await ref.where("updatedAt", ">", since).get() : await ref.get();
        const out: StoredDoc[] = [];
        for (const d of snap.docs) out.push(await assembleAdmin(db, col, d.id, d.data()));
        return out;
      },
      async writeMany(col, docs) {
        const ops: Array<(b: any) => void> = [];
        for (const doc of docs) {
          for (const op of buildWrites(col, doc)) {
            ops.push((b) => {
              const ref = db.collection(op.col).doc(op.id);
              op.data === null ? b.delete(ref) : b.set(ref, op.data);
            });
          }
        }
        for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
          const batch = db.batch();
          ops.slice(i, i + BATCH_LIMIT).forEach((fn) => fn(batch));
          await batch.commit();
        }
      },
      async readOne(col, id) {
        const snap = await db.collection(PREFIX + col).doc(id).get();
        return snap.exists ? assembleAdmin(db, col, id, snap.data()) : null;
      },
      async getRaw(col, id) {
        const s = await db.collection(PREFIX + col).doc(id).get();
        return s.exists ? s.data() : null;
      },
      async setRaw(col, id, data) {
        await db.collection(PREFIX + col).doc(id).set(data);
      },
      async deleteRaw(col, id) {
        await db.collection(PREFIX + col).doc(id).delete();
      },
    };
  }

  // ---------- Mode 2: Firebase web SDK ----------
  const { initializeApp, getApps } = await import("firebase/app");
  const fsSdk = await import("firebase/firestore");
  const cfg = { ...fileCfg, projectId };
  const app = getApps().find((a) => a.name === "edexcel-server") || initializeApp(cfg, "edexcel-server");
  const db = databaseId && databaseId !== "(default)" ? fsSdk.getFirestore(app, databaseId) : fsSdk.getFirestore(app);

  return {
    async readSince(col, since) {
      const ref = fsSdk.collection(db, PREFIX + col);
      const snap = since > 0 ? await fsSdk.getDocs(fsSdk.query(ref, fsSdk.where("updatedAt", ">", since))) : await fsSdk.getDocs(ref);
      const out: StoredDoc[] = [];
      for (const d of snap.docs) out.push(await assembleWeb(fsSdk, db, col, d.id, d.data()));
      return out;
    },
    async writeMany(col, docs) {
      const ops: Array<(b: any) => void> = [];
      for (const doc of docs) {
        for (const op of buildWrites(col, doc)) {
          ops.push((b) => {
            const ref = fsSdk.doc(db, op.col, op.id);
            op.data === null ? b.delete(ref) : b.set(ref, op.data);
          });
        }
      }
      for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
        const batch = fsSdk.writeBatch(db);
        ops.slice(i, i + BATCH_LIMIT).forEach((fn) => fn(batch));
        await batch.commit();
      }
    },
    async readOne(col, id) {
      const snap = await fsSdk.getDoc(fsSdk.doc(db, PREFIX + col, id));
      return snap.exists() ? assembleWeb(fsSdk, db, col, id, snap.data()) : null;
    },
    async getRaw(col, id) {
      const s = await fsSdk.getDoc(fsSdk.doc(db, PREFIX + col, id));
      return s.exists() ? s.data() : null;
    },
    async setRaw(col, id, data) {
      await fsSdk.setDoc(fsSdk.doc(db, PREFIX + col, id), data);
    },
    async deleteRaw(col, id) {
      await fsSdk.deleteDoc(fsSdk.doc(db, PREFIX + col, id));
    },
  };
}

/** Turns one logical record into the Firestore writes needed (main doc + optional parts). */
function buildWrites(col: string, doc: StoredDoc): Array<{ col: string; id: string; data: any | null }> {
  const main = PREFIX + col;
  const parts = PREFIX + col + "_parts";
  if (doc.json === null) {
    return [{ col: main, id: doc.id, data: { deleted: true, updatedAt: doc.updatedAt } }];
  }
  if (doc.json.length <= PART_SIZE) {
    return [{ col: main, id: doc.id, data: { json: doc.json, updatedAt: doc.updatedAt } }];
  }
  const chunks = chunkString(doc.json, PART_SIZE);
  const writes: Array<{ col: string; id: string; data: any }> = chunks.map((c, i) => ({
    col: parts,
    id: `${doc.id}__${doc.updatedAt}__${i}`,
    data: { data: c },
  }));
  writes.push({ col: main, id: doc.id, data: { parts: chunks.length, partKey: `${doc.id}__${doc.updatedAt}`, updatedAt: doc.updatedAt } });
  return writes;
}

async function assembleAdmin(db: any, col: string, id: string, data: any): Promise<StoredDoc> {
  if (data.deleted) return { id, json: null, updatedAt: data.updatedAt || 0 };
  if (typeof data.json === "string") return { id, json: data.json, updatedAt: data.updatedAt || 0 };
  if (data.parts) {
    const pieces: string[] = [];
    for (let i = 0; i < data.parts; i++) {
      const s = await db.collection(PREFIX + col + "_parts").doc(`${data.partKey}__${i}`).get();
      pieces.push(s.exists ? s.data().data : "");
    }
    return { id, json: pieces.join(""), updatedAt: data.updatedAt || 0 };
  }
  return { id, json: null, updatedAt: data.updatedAt || 0 };
}

async function assembleWeb(fsSdk: any, db: any, col: string, id: string, data: any): Promise<StoredDoc> {
  if (data.deleted) return { id, json: null, updatedAt: data.updatedAt || 0 };
  if (typeof data.json === "string") return { id, json: data.json, updatedAt: data.updatedAt || 0 };
  if (data.parts) {
    const pieces: string[] = [];
    for (let i = 0; i < data.parts; i++) {
      const s = await fsSdk.getDoc(fsSdk.doc(db, PREFIX + col + "_parts", `${data.partKey}__${i}`));
      pieces.push(s.exists() ? s.data().data : "");
    }
    return { id, json: pieces.join(""), updatedAt: data.updatedAt || 0 };
  }
  return { id, json: null, updatedAt: data.updatedAt || 0 };
}

let adapterPromise: Promise<Adapter> | null = null;
function adapter(): Promise<Adapter> {
  if (!adapterPromise) {
    adapterPromise = createAdapter().catch((e) => {
      adapterPromise = null;
      throw e;
    });
  }
  return adapterPromise;
}

export function isSharedStoreEnabled(): boolean {
  if (process.env.PERSIST_TO_FIRESTORE === "false") return false;
  return !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.PERSIST_TO_FIRESTORE === "true";
}

/**
 * Keeps an in-memory map of records in sync with Firestore.
 * - `pull()` fetches only documents changed since the last pull (cheap).
 * - `push()` writes only records whose JSON differs from what we last saw.
 * Records that are identical to the built-in seed data are never written.
 */
export interface SyncOptions {
  /**
   * Return a delay in ms to postpone writing this record (it stays "unsaved" and is
   * written by a later save). Used to save in-progress exam answers at most once a minute.
   */
  writeDelayMs?: (id: string, value: any) => number;
  /**
   * Called before overwriting a record that may have been changed elsewhere. Return
   * false to keep the database version (it is then copied into memory instead).
   */
  shouldOverwrite?: (id: string, local: any, remote: any) => boolean;
  /** Only consult shouldOverwrite for records where this returns true (saves reads). */
  needsOverwriteCheck?: (id: string, local: any) => boolean;
}

/**
 * Keeps an in-memory map of records in sync with Firestore while using as few
 * reads and writes as possible (the free plan allows ~50k reads / 20k writes a day):
 * - pull() fetches only documents changed since the newest one already seen.
 * - push() writes only records whose JSON actually changed.
 * Records identical to the built-in seed data are never written.
 */
export class SyncedCollection {
  private lastJson = new Map<string, string>();
  private lastWriteAt = new Map<string, number>(); // newest known save time per record (any server copy)
  private newestSeen = 0;
  public lastPullAt = 0;

  constructor(
    public readonly name: string,
    private readonly getAll: () => Record<string, any>,
    private readonly applyRemote: (id: string, value: any | null) => void,
    private readonly options: SyncOptions = {}
  ) {}

  /** Record the current in-memory state as "already saved" (used for built-in seed data). */
  captureBaseline() {
    this.lastJson.clear();
    for (const [id, v] of Object.entries(this.getAll())) {
      this.lastJson.set(id, JSON.stringify(v));
    }
  }

  async pull(): Promise<void> {
    const a = await adapter();
    // Small overlap covers clock differences between server instances (they are NTP-synced)
    const since = this.newestSeen ? this.newestSeen - 2_000 : 0;
    const startedAt = Date.now();
    const docs = await a.readSince(this.name, since);
    if (process.env.DEBUG_PULL && this.name === "students") console.log(`[pull] ${this.name} since=${since ? Date.now() - since + "ms ago" : "start"} -> ${docs.length}`);
    for (const d of docs) {
      if (d.updatedAt > this.newestSeen) this.newestSeen = d.updatedAt;
      this.noteSaved(d.id, d.updatedAt);
      this.applyDoc(d);
    }
    this.lastPullAt = startedAt;
  }

  private noteSaved(id: string, at: number) {
    if (at > (this.lastWriteAt.get(id) || 0)) this.lastWriteAt.set(id, at);
  }

  private applyDoc(d: StoredDoc) {
    const known = this.lastJson.get(d.id);
    if (d.json === null) {
      if (known !== undefined || this.getAll()[d.id] !== undefined) {
        this.applyRemote(d.id, null);
        this.lastJson.delete(d.id);
      }
      return;
    }
    if (known === d.json) return;
    try {
      this.applyRemote(d.id, JSON.parse(d.json));
      this.lastJson.set(d.id, d.json);
    } catch (e) {
      console.warn(`[store] Could not parse ${this.name}/${d.id}`, e);
    }
  }

  async push(): Promise<void> {
    const current = this.getAll();
    const now = Date.now();
    const writes: StoredDoc[] = [];
    const seen = new Set<string>();
    for (const [id, v] of Object.entries(current)) {
      seen.add(id);
      const json = JSON.stringify(v);
      if (this.lastJson.get(id) === json) continue;
      const delay = this.options.writeDelayMs ? this.options.writeDelayMs(id, v) : 0;
      if (delay > 0 && now - (this.lastWriteAt.get(id) || 0) < delay) continue; // saved later
      writes.push({ id, json, updatedAt: now });
    }
    for (const id of this.lastJson.keys()) {
      if (!seen.has(id)) writes.push({ id, json: null, updatedAt: now });
    }
    if (!writes.length) return;

    const a = await adapter();

    // Never let an out-of-date copy overwrite newer important data (e.g. a student who
    // has since submitted on another server instance): for those records, read just
    // that one document before writing (1 read per save, only when it matters).
    const finalWrites: StoredDoc[] = [];
    for (const w of writes) {
      if (w.json !== null && this.options.shouldOverwrite && this.options.needsOverwriteCheck?.(w.id, current[w.id])) {
        const remote = await a.readOne(this.name, w.id);
        if (remote) this.noteSaved(w.id, remote.updatedAt);
        // Another server copy saved this record very recently: let that save stand for now
        const delay = this.options.writeDelayMs ? this.options.writeDelayMs(w.id, current[w.id]) : 0;
        if (remote && remote.json !== null && delay > 0 && now - remote.updatedAt < delay) {
          if (remote.json !== this.lastJson.get(w.id)) {
            try {
              if (!this.options.shouldOverwrite(w.id, current[w.id], JSON.parse(remote.json))) {
                this.applyDoc(remote);
              }
            } catch {}
          }
          continue;
        }
        if (remote && remote.json !== null && remote.json !== this.lastJson.get(w.id)) {
          try {
            if (!this.options.shouldOverwrite(w.id, current[w.id], JSON.parse(remote.json))) {
              this.applyDoc(remote);
              continue;
            }
          } catch {}
        }
      }
      finalWrites.push(w);
    }
    if (!finalWrites.length) return;
    await a.writeMany(this.name, finalWrites);
    for (const w of finalWrites) {
      this.lastWriteAt.set(w.id, now);
      if (w.json === null) this.lastJson.delete(w.id);
      else this.lastJson.set(w.id, w.json);
    }
  }
}

// ---------- Temporary storage for large uploads sent in pieces ----------
const memoryUploads = new Map<string, string[]>();

export async function saveUploadChunk(uploadId: string, index: number, total: number, data: string): Promise<void> {
  if (!isSharedStoreEnabled()) {
    const arr = memoryUploads.get(uploadId) || new Array(total).fill("");
    arr[index] = data;
    memoryUploads.set(uploadId, arr);
    return;
  }
  const a = await adapter();
  await a.setRaw("uploads", `${uploadId}__${index}`, { data, total, createdAt: Date.now() });
}

export async function readUpload(uploadId: string, total: number): Promise<string> {
  if (!isSharedStoreEnabled()) {
    const arr = memoryUploads.get(uploadId);
    if (!arr || arr.length !== total) throw new Error("Upload not found or incomplete. Please re-upload the file.");
    return arr.join("");
  }
  const a = await adapter();
  const pieces: string[] = [];
  for (let i = 0; i < total; i++) {
    const d = await a.getRaw("uploads", `${uploadId}__${i}`);
    if (!d) throw new Error("Upload not found or incomplete. Please re-upload the file.");
    pieces.push(d.data);
  }
  return pieces.join("");
}

export async function deleteUpload(uploadId: string, total: number): Promise<void> {
  if (!isSharedStoreEnabled()) {
    memoryUploads.delete(uploadId);
    return;
  }
  try {
    const a = await adapter();
    await Promise.all(Array.from({ length: total }, (_, i) => a.deleteRaw("uploads", `${uploadId}__${i}`)));
  } catch (e) {
    console.warn("[store] Could not clean up upload", uploadId, e);
  }
}
