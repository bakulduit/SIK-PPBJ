import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${wide ? "max-w-4xl" : "max-w-2xl"} max-h-[90vh] flex flex-col animate-fade-up`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white rounded-t-xl flex-shrink-0">
          <h3 className="font-heading text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} data-testid="modal-close" className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
