import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, X, ListChecks, Lightbulb, Target } from "lucide-react";
import { HELP } from "@/constants/help";

// Tombol + panel Bantuan kontekstual untuk tiap halaman modul.
export default function ModuleHelp({ id, className = "" }) {
  const [open, setOpen] = useState(false);
  const data = HELP[id];

  const onKey = useCallback((e) => { if (e.key === "Escape") setOpen(false); }, []);
  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onKey]);

  if (!data) return null;

  return (
    <>
      <button type="button" data-testid={`help-${id}`} onClick={() => setOpen(true)}
        title="Bantuan penggunaan halaman ini"
        className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-md border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:text-[#14758a] hover:border-[#14758a] transition-colors ${className}`}>
        <HelpCircle className="w-4 h-4" /> Bantuan
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
          data-testid={`help-panel-${id}`} onClick={() => setOpen(false)}>
          <div className="h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 px-5 py-4 bg-[#0d3c45] text-white">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] uppercase tracking-wide text-teal-200/80 font-semibold">Bantuan</div>
                <h3 className="font-heading font-bold text-base leading-tight">{data.title}</h3>
              </div>
              <button type="button" data-testid={`help-close-${id}`} onClick={() => setOpen(false)} aria-label="Tutup bantuan"
                className="w-8 h-8 inline-flex items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-[#0d3c45] font-semibold text-sm mb-1.5">
                  <Target className="w-4 h-4 text-[#14758a]" /> Tujuan
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{data.purpose}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[#0d3c45] font-semibold text-sm mb-2">
                  <ListChecks className="w-4 h-4 text-[#14758a]" /> Langkah-langkah
                </div>
                <ol className="space-y-2">
                  {data.steps.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-slate-600">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-teal-50 text-[#14758a] text-[11px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {data.tips?.length > 0 && (
                <div className="rounded-lg bg-orange-50 border border-orange-100 p-4">
                  <div className="flex items-center gap-2 text-[#0d3c45] font-semibold text-sm mb-2">
                    <Lightbulb className="w-4 h-4 text-[#f2941f]" /> Tips
                  </div>
                  <ul className="space-y-1.5">
                    {data.tips.map((t, i) => (
                      <li key={i} className="text-xs text-slate-600 leading-relaxed flex gap-2">
                        <span className="text-[#f2941f] font-bold">•</span> <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
