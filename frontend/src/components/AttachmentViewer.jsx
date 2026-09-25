import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight, FileText, ExternalLink } from "lucide-react";

const BASE = process.env.REACT_APP_BACKEND_URL;

const IMG_RE = /\.(png|jpe?g|gif|webp|heic|heif|bmp|svg)$/i;

function IconBtn({ children, onClick, testid, label }) {
  return (
    <button type="button" data-testid={testid} onClick={onClick} aria-label={label}
      className="w-9 h-9 inline-flex items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors">
      {children}
    </button>
  );
}

export function AttachmentViewer({ attachments, index, onClose, onNavigate }) {
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const a = attachments?.[index];
  const href = a?.url ? `${BASE}${a.url}` : a?.link;
  const isImg = (a?.content_type || "").startsWith("image/") || (!a?.content_type && IMG_RE.test(href || ""));
  const isPdf = a?.content_type === "application/pdf" || /\.pdf$/i.test(href || "");
  const multiple = (attachments?.length || 0) > 1;

  useEffect(() => { setScale(1); setRotate(0); }, [index]);

  const onKey = useCallback((e) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowRight" && multiple) onNavigate(1);
    else if (e.key === "ArrowLeft" && multiple) onNavigate(-1);
    else if (e.key === "+" || e.key === "=") setScale((s) => Math.min(5, +(s + 0.25).toFixed(2)));
    else if (e.key === "-") setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)));
  }, [onClose, onNavigate, multiple]);

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  if (!a) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm animate-in fade-in duration-150"
      data-testid="attachment-viewer" onClick={onClose}>
      <div className="flex items-center gap-3 px-4 py-3 text-white" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate max-w-[50vw]">{a.name || "Lampiran"}</div>
          <div className="text-xs text-white/50">{index + 1} / {attachments.length}{a.url ? " · File terunggah" : a.link ? " · Link eksternal" : ""}</div>
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          {isImg && (
            <>
              <IconBtn testid="viewer-zoom-out" label="Perkecil" onClick={() => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)))}><ZoomOut className="w-5 h-5" /></IconBtn>
              <span className="text-xs w-12 text-center tabular text-white/80" data-testid="viewer-zoom-level">{Math.round(scale * 100)}%</span>
              <IconBtn testid="viewer-zoom-in" label="Perbesar" onClick={() => setScale((s) => Math.min(5, +(s + 0.25).toFixed(2)))}><ZoomIn className="w-5 h-5" /></IconBtn>
              <IconBtn testid="viewer-rotate" label="Putar" onClick={() => setRotate((r) => (r + 90) % 360)}><RotateCw className="w-5 h-5" /></IconBtn>
            </>
          )}
          {href && (
            <a href={href} target="_blank" rel="noreferrer" data-testid="viewer-download" aria-label="Unduh / buka di tab baru"
              className="w-9 h-9 inline-flex items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              <Download className="w-5 h-5" />
            </a>
          )}
          <IconBtn testid="viewer-close" label="Tutup" onClick={onClose}><X className="w-5 h-5" /></IconBtn>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-auto px-4 pb-6 relative" onClick={(e) => e.stopPropagation()}>
        {multiple && (
          <button type="button" data-testid="viewer-prev" onClick={() => onNavigate(-1)} aria-label="Sebelumnya"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {isImg ? (
          <img src={href} alt={a.name || "Lampiran"} data-testid="viewer-image"
            style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
            className="max-h-[80vh] max-w-full object-contain transition-transform duration-150 select-none shadow-2xl" draggable={false} />
        ) : isPdf ? (
          <iframe title={a.name || "PDF"} src={href} data-testid="viewer-pdf"
            className="w-full max-w-5xl bg-white rounded-md shadow-2xl" style={{ height: "80vh" }} />
        ) : (
          <div className="text-center text-white/80" data-testid="viewer-generic">
            <FileText className="w-20 h-20 mx-auto mb-4 opacity-50" />
            <p className="mb-3 text-sm">Pratinjau tidak tersedia untuk jenis file ini.</p>
            {href && (
              <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#5cc7d8] hover:underline font-semibold">
                Buka lampiran <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {multiple && (
          <button type="button" data-testid="viewer-next" onClick={() => onNavigate(1)} aria-label="Berikutnya"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}

export default AttachmentViewer;
