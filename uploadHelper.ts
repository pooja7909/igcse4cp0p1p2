import { teacherFetch } from "./teacherAuth";

/**
 * Vercel rejects request bodies larger than 4.5 MB, and past paper PDFs (plus their
 * mark schemes) are often bigger once base64-encoded. Small files are sent inline as
 * before; large files are uploaded in ~900 KB pieces and replaced by an uploadId that
 * the server reassembles (see /api/uploads/chunk in server.ts).
 */
const INLINE_LIMIT = 1_500_000; // characters of base64; two inline docs stay under 4.5 MB
const CHUNK_SIZE = 900_000;
const PARALLEL_UPLOADS = 3;

export interface UploadableDoc {
  base64: string;
  name: string;
  mimeType?: string;
}

export interface PreparedDoc {
  name: string;
  mimeType?: string;
  base64?: string;
  uploadId?: string;
  totalChunks?: number;
}

function newUploadId(): string {
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return "up_" + rand;
}

export async function prepareDocForUpload(
  doc: UploadableDoc | null | undefined,
  onProgress?: (fraction: number) => void,
  options: { forceChunks?: boolean } = {}
): Promise<PreparedDoc | undefined> {
  if (!doc || !doc.base64) return undefined;
  // forceChunks: upload once and refer to it by id (used when the same file is needed
  // by several requests, e.g. converting a paper question by question)
  if (!options.forceChunks && doc.base64.length <= INLINE_LIMIT) {
    return { base64: doc.base64, name: doc.name, mimeType: doc.mimeType };
  }

  const uploadId = newUploadId();
  const totalChunks = Math.ceil(doc.base64.length / CHUNK_SIZE);
  if (totalChunks > 60) {
    throw new Error(`"${doc.name}" is too large (max about 40 MB). Please upload a smaller PDF.`);
  }

  let done = 0;
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < totalChunks) {
      const index = nextIndex++;
      const data = doc.base64.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE);
      let lastError = "";
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await teacherFetch("/api/uploads/chunk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploadId, index, total: totalChunks, data }),
        });
        if (res.ok) {
          lastError = "";
          break;
        }
        if (res.status === 401) throw new Error("Your teacher session has expired. Please sign in again.");
        const err = await res.json().catch(() => ({}));
        lastError = err.error || `Upload failed (${res.status})`;
      }
      if (lastError) throw new Error(`Uploading "${doc.name}" failed: ${lastError}`);
      done++;
      onProgress?.(done / totalChunks);
    }
  };
  await Promise.all(Array.from({ length: Math.min(PARALLEL_UPLOADS, totalChunks) }, worker));

  return { uploadId, totalChunks, name: doc.name, mimeType: doc.mimeType };
}
