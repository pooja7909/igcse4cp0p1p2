import React, { useEffect, useState } from "react";
import { X, ExternalLink, Download, ArrowLeft } from "lucide-react";
import { TeacherResource, ResourceTypeIcon, viewMode, TopicBadges, needsPieces, fetchResourceBlob } from "./resourceTypes";

// Uploaded web pages run in an opaque-origin sandbox (also enforced by the server's CSP header):
// they can run their own scripts but never see the app's storage or the teacher's login.
const PAGE_SANDBOX = "allow-scripts allow-forms allow-popups allow-modals allow-downloads";
// Other websites keep their own origin but can never navigate the app itself away
const LINK_SANDBOX = "allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads";

/**
 * Full-screen viewer for a resource. `src` is the address that shows the resource
 * (/api/resources/:id/view?class=CODE for students, a preview link for teachers, or the website).
 * `access` ("class=CODE" or "t=ticket") lets big PDFs/images be fetched in pieces and shown from a
 * blob: URL (never used for web pages, which always stay on the sandboxed /view route).
 */
export const ResourceViewer: React.FC<{ resource: TeacherResource; src: string; access?: string; onClose: () => void }> = ({ resource, src: viewSrc, access, onClose }) => {
  const mode = viewMode(resource);
  const big = needsPieces(resource) && (mode === "pdf" || mode === "image") && access !== undefined;
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    if (!big) return;
    let url: string | null = null;
    let gone = false;
    fetchResourceBlob(resource, access!, (f) => !gone && setProgress(f))
      .then((blob) => {
        if (gone) return;
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
      })
      .catch((e) => !gone && setLoadError(e?.message || "Could not open this file."));
    return () => {
      gone = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [big, resource.id, access]); // eslint-disable-line react-hooks/exhaustive-deps
  const src = big ? blobUrl || "" : viewSrc;
  // The browser's Back button (or a phone's back gesture) closes the viewer instead of leaving the hub
  const closedByBack = React.useRef(false);
  useEffect(() => {
    try {
      window.history.pushState({ ...(window.history.state || {}), resourceViewer: true }, "", window.location.href);
    } catch (e) {}
    const onPop = () => {
      closedByBack.current = true;
      onClose();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (!closedByBack.current) {
        try {
          if (window.history.state && window.history.state.resourceViewer) window.history.back();
        } catch (e) {}
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/70 flex flex-col" data-testid="resource-viewer" role="dialog" aria-label={resource.title}>
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-white border-b border-slate-200">
        <button
          type="button"
          onClick={onClose}
          data-testid="resource-viewer-back"
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <ResourceTypeIcon r={resource} />
        <div className="min-w-0 flex-1">
          <div className="font-bold text-slate-900 truncate">{resource.title}</div>
          <div className="text-[11px] text-slate-500 truncate">
            <TopicBadges topics={resource.topics} paper={resource.paper} />
          </div>
        </div>
        <a
          href={src || undefined}
          aria-disabled={!src}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="resource-open-new-tab"
          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-1"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Open in new tab
        </a>
        {mode !== "link" && mode !== "page" && (
          <a href={src || undefined} download={resource.fileName || true} className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 inline-flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Download
          </a>
        )}
        <button type="button" onClick={onClose} data-testid="resource-viewer-close" className="p-1.5 rounded-lg hover:bg-slate-100" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
      </div>
      {mode === "link" && (
        <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900">
          Some websites do not allow being shown inside another page. If this stays blank, use <b>Open in new tab</b>. Press <b>Back</b> (top left) to return to the hub.
        </div>
      )}
      <div className="flex-1 min-h-0 bg-slate-100">
        {big && !blobUrl ? (
          <div className="w-full h-full flex items-center justify-center p-6" data-testid="resource-loading">
            <div className="w-full max-w-sm p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-center">
              {loadError ? (
                <div className="text-sm text-rose-700">{loadError}</div>
              ) : (
                <>
                  <div className="text-sm font-semibold text-slate-700">Loading the file... {Math.round(progress * 100)}%</div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-purple-500 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
                  </div>
                </>
              )}
            </div>
          </div>
        ) : mode === "image" ? (
          <div className="w-full h-full overflow-auto flex items-start justify-center p-4">
            <img src={src} alt={resource.title} className="max-w-full h-auto bg-white shadow" />
          </div>
        ) : (
          <iframe
            key={src}
            title={resource.title}
            src={src}
            data-testid="resource-frame"
            className="block w-full h-full border-0 bg-white"
            referrerPolicy="no-referrer"
            {...(mode === "page" ? { sandbox: PAGE_SANDBOX } : mode === "link" ? { sandbox: LINK_SANDBOX } : {})}
          />
        )}
      </div>
    </div>
  );
};
