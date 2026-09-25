import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import DocumentDetail from "@/pages/DocumentDetail";
import { ArrowLeft, FileWarning, Loader2 } from "lucide-react";

export default function DocumentPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [doc, setDoc] = useState(null);
  const [tax, setTax] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | notfound

  const load = useCallback(async () => {
    try {
      const [d, t] = await Promise.all([
        api.get(`/documents/${id}`),
        api.get("/tax-settings"),
      ]);
      setDoc(d.data);
      setTax(t.data);
      setStatus("ok");
    } catch (e) {
      setStatus("notfound");
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400" data-testid="document-page-loading">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memuat dokumen…
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div className="max-w-lg mx-auto text-center py-20" data-testid="document-page-notfound">
        <FileWarning className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <h2 className="font-heading text-xl font-bold text-slate-800">Dokumen tidak ditemukan</h2>
        <p className="text-slate-500 text-sm mt-1">Dokumen mungkin telah dihapus atau tautan tidak valid.</p>
        <button data-testid="back-to-dashboard" onClick={() => nav("/")}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#14758a] hover:bg-[#106071] text-white text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const listRoute = { PPBJ: "/ppbj", PUM: "/pum", PP: "/pp", PTUM: "/ptum", KASKECIL: "/kaskecil", NRP: "/nrp" }[doc.doc_type] || "/";

  return (
    <div className="max-w-4xl mx-auto space-y-5" data-testid="document-page">
      <button data-testid="back-to-list" onClick={() => nav(listRoute)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#14758a]">
        <ArrowLeft className="w-4 h-4" /> Kembali ke daftar {doc.doc_type}
      </button>
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <DocumentDetail doc={doc} tax={tax} onChanged={load} />
      </div>
    </div>
  );
}
