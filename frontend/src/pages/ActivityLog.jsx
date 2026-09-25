import { useEffect, useState, useCallback, useMemo } from "react";
import api from "@/lib/api";
import { RefreshCw, History } from "lucide-react";

const ACTIONS = {
  "user.create": { l: "Membuat Akun", cls: "bg-green-50 text-green-700" },
  "user.update": { l: "Mengubah Akun", cls: "bg-blue-50 text-blue-700" },
  "user.delete": { l: "Menghapus Akun", cls: "bg-red-50 text-red-700" },
  "user.activate": { l: "Mengaktifkan", cls: "bg-teal-50 text-teal-700" },
  "user.deactivate": { l: "Menonaktifkan", cls: "bg-amber-50 text-amber-700" },
  "user.reset_password": { l: "Reset Sandi", cls: "bg-purple-50 text-purple-700" },
};

const ROLE_LABEL = {
  superadmin: "Super Admin", admin: "Admin", keuangan: "Keuangan",
  approver: "Approver", user: "User (Pemohon)",
};

function fmtDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get("/audit-logs"); setLogs(data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(
    () => (filter === "all" ? logs : logs.filter((l) => l.action === filter)),
    [logs, filter]
  );

  return (
    <div className="space-y-5" data-testid="activity-log-page">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-[#14758a]" /> Log Aktivitas
          </h1>
          <p className="text-slate-500 text-sm mt-1">Jejak audit siapa membuat, mengubah, menghapus, menonaktifkan & mereset akun pengguna.</p>
        </div>
        <button data-testid="refresh-logs" onClick={load} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Muat Ulang
        </button>
      </div>

      <div className="flex flex-wrap gap-2" data-testid="log-filter">
        {[{ v: "all", l: "Semua" }, ...Object.entries(ACTIONS).map(([v, o]) => ({ v, l: o.l }))].map((a) => {
          const active = filter === a.v;
          const n = a.v === "all" ? logs.length : logs.filter((l) => l.action === a.v).length;
          return (
            <button key={a.v} onClick={() => setFilter(a.v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${active ? "bg-[#14758a] text-white border-[#14758a]" : "bg-white text-slate-600 border-slate-200 hover:border-[#14758a]"}`}>
              {a.l}<span className={`ml-1 ${active ? "text-teal-100" : "text-slate-400"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Waktu</th>
                <th className="text-left px-4 py-3 font-semibold">Dilakukan Oleh</th>
                <th className="text-left px-4 py-3 font-semibold">Aksi</th>
                <th className="text-left px-4 py-3 font-semibold">Target</th>
                <th className="text-left px-4 py-3 font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => {
                const a = ACTIONS[l.action] || { l: l.action, cls: "bg-slate-100 text-slate-600" };
                return (
                  <tr key={l.id || i} className="border-t border-slate-100 hover:bg-teal-50/40">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(l.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 font-medium">{l.actor_name || "-"}</div>
                      <div className="text-xs text-slate-400">{l.actor_email} · {ROLE_LABEL[l.actor_role] || l.actor_role}</div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${a.cls}`}>{a.l}</span></td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800">{l.target_name || "-"}</div>
                      <div className="text-xs text-slate-400">{l.target_email}{l.target_role ? ` · ${ROLE_LABEL[l.target_role] || l.target_role}` : ""}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{l.details || "-"}</td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-sm">Belum ada aktivitas tercatat.</td></tr>
              )}
              {loading && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-sm">Memuat…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
