import { useEffect, useState, useCallback, useMemo } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal";
import { Plus, Pencil, Trash2, ShieldCheck, KeyRound, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";

const INP = "w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14758a]";
const L = "block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5";
const ROLES = [
  { v: "superadmin", l: "Super Admin", superOnly: true },
  { v: "admin", l: "Admin" },
  { v: "keuangan", l: "Keuangan" },
  { v: "approver", l: "Approver (Otorisasi)" },
  { v: "user", l: "User (Pemohon)" },
];
const ROLE_LABEL = ROLES.reduce((a, r) => ({ ...a, [r.v]: r.l }), {});
const ROLE_CLS = {
  superadmin: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
  admin: "bg-purple-50 text-purple-700",
  keuangan: "bg-teal-50 text-teal-700",
  approver: "bg-blue-50 text-blue-700",
  user: "bg-slate-100 text-slate-600",
};

export default function UsersPage() {
  const { user: me } = useAuth();
  const isSuper = me?.role === "superadmin";
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");
  const [f, setF] = useState({ name: "", email: "", password: "", role: "user" });
  const [resetOpen, setResetOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPw, setResetPw] = useState("");

  const load = useCallback(async () => { const { data } = await api.get("/users"); setUsers(data); }, []);
  useEffect(() => { load(); }, [load]);

  // opsi peran: superadmin hanya dapat dipilih oleh super admin
  const roleOptions = useMemo(() => ROLES.filter((r) => !r.superOnly || isSuper), [isSuper]);

  const counts = useMemo(() => {
    const c = { all: users.length };
    for (const u of users) c[u.role] = (c[u.role] || 0) + 1;
    return c;
  }, [users]);

  const filteredUsers = useMemo(
    () => (filter === "all" ? users : users.filter((u) => u.role === filter)),
    [users, filter]
  );

  // apakah 'me' boleh mengelola baris user tertentu
  const canManage = (u) => (u.role === "superadmin" ? isSuper : true);

  const openNew = () => { setEditing(null); setF({ name: "", email: "", password: "", role: "user" }); setOpen(true); };
  const openEdit = (u) => { setEditing(u); setF({ name: u.name, email: u.email, password: "", role: u.role }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/users/${editing.id}`, { name: f.name, role: f.role });
      else await api.post("/auth/register", { name: f.name, email: f.email, password: f.password, role: f.role });
      toast.success("Pengguna tersimpan"); setOpen(false); load();
    } catch (err) { toast.error(err.response?.data?.detail || "Gagal"); }
  };

  const del = async (u) => {
    if (!window.confirm(`Hapus pengguna ${u.email}?`)) return;
    try { await api.delete(`/users/${u.id}`); toast.success("Dihapus"); load(); }
    catch (err) { toast.error(err.response?.data?.detail || "Gagal"); }
  };

  const toggleActive = async (u) => {
    const next = !u.active;
    if (!window.confirm(`${next ? "Aktifkan" : "Nonaktifkan"} akun ${u.email}?${next ? "" : " Pengguna tidak akan bisa login."}`)) return;
    try {
      await api.patch(`/users/${u.id}/active`, { active: next });
      toast.success(next ? "Akun diaktifkan" : "Akun dinonaktifkan"); load();
    } catch (err) { toast.error(err.response?.data?.detail || "Gagal"); }
  };

  const openReset = (u) => { setResetTarget(u); setResetPw(""); setResetOpen(true); };
  const doReset = async (e) => {
    e.preventDefault();
    if (resetPw.length < 6) { toast.error("Kata sandi minimal 6 karakter"); return; }
    try {
      await api.post(`/users/${resetTarget.id}/reset-password`, { password: resetPw });
      toast.success(`Kata sandi ${resetTarget.email} berhasil direset`); setResetOpen(false);
    } catch (err) { toast.error(err.response?.data?.detail || "Gagal"); }
  };

  return (
    <div className="space-y-5" data-testid="users-page">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900">Pengguna & Peran</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola akun sesuai matriks otorisasi perusahaan.</p>
        </div>
        <button data-testid="add-user" onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#14758a] hover:bg-[#106071] text-white text-sm font-semibold"><Plus className="w-4 h-4" /> Tambah Pengguna</button>
      </div>

      <div className="flex flex-wrap gap-2" data-testid="role-filter">
        {[{ v: "all", l: "Semua" }, ...ROLES].map((r) => {
          const active = filter === r.v;
          const n = counts[r.v] || 0;
          return (
            <button key={r.v} onClick={() => setFilter(r.v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${active ? "bg-[#14758a] text-white border-[#14758a]" : "bg-white text-slate-600 border-slate-200 hover:border-[#14758a]"}`}>
              {r.v === "superadmin" && <ShieldCheck className="w-3.5 h-3.5" />}
              {r.l}<span className={`ml-0.5 ${active ? "text-teal-100" : "text-slate-400"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr><th className="text-left px-4 py-3 font-semibold">Nama</th><th className="text-left px-4 py-3 font-semibold">Email</th><th className="text-left px-4 py-3 font-semibold">Peran</th><th className="text-left px-4 py-3 font-semibold">Status</th><th className="text-right px-4 py-3 font-semibold">Aksi</th></tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => {
              const manage = canManage(u);
              const inactive = u.active === false;
              return (
              <tr key={u.id} className={`border-t border-slate-100 hover:bg-teal-50/40 ${inactive ? "bg-slate-50/60" : ""}`}>
                <td className={`px-4 py-3 font-medium ${inactive ? "text-slate-400" : "text-slate-800"}`}>
                  {u.name}{u.id === me?.id && <span className="ml-2 text-[10px] font-semibold text-[#14758a]">(Anda)</span>}
                </td>
                <td className={`px-4 py-3 ${inactive ? "text-slate-400" : "text-slate-600"}`}>{u.email}</td>
                <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${ROLE_CLS[u.role] || "bg-slate-100 text-slate-600"}`}>{u.role === "superadmin" && <ShieldCheck className="w-3 h-3" />}{ROLE_LABEL[u.role] || u.role}</span></td>
                <td className="px-4 py-3">
                  <span data-testid={`status-${u.email}`} className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${inactive ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${inactive ? "bg-red-500" : "bg-green-500"}`} />{inactive ? "Nonaktif" : "Aktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button disabled={!manage} title={manage ? "Reset kata sandi" : "Hanya super admin"} onClick={() => openReset(u)} className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"><KeyRound className="w-4 h-4" /></button>
                    <button disabled={!manage || u.id === me?.id} title={u.id === me?.id ? "Tidak bisa ubah status akun sendiri" : (manage ? (inactive ? "Aktifkan" : "Nonaktifkan") : "Hanya super admin")} onClick={() => toggleActive(u)} className={`p-1.5 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed ${inactive ? "text-slate-400 hover:text-green-600" : "text-slate-500 hover:text-amber-600"}`}>{inactive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}</button>
                    <button disabled={!manage} title={manage ? "Edit" : "Hanya super admin"} onClick={() => openEdit(u)} className="p-1.5 text-slate-500 hover:text-[#f2941f] hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"><Pencil className="w-4 h-4" /></button>
                    <button disabled={!manage || u.id === me?.id} title={u.id === me?.id ? "Tidak bisa hapus akun sendiri" : (manage ? "Hapus" : "Hanya super admin")} onClick={() => del(u)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">Belum ada pengguna pada peran ini.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Pengguna" : "Tambah Pengguna"}>
        <form onSubmit={save} className="space-y-4">
          <div><label className={L}>Nama</label><input data-testid="user-name" required className={INP} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><label className={L}>Email</label><input data-testid="user-email" type="email" required disabled={!!editing} className={INP} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          {!editing && <div><label className={L}>Kata Sandi</label><input data-testid="user-password" type="password" required minLength={6} className={INP} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>}
          {editing && <p className="text-xs text-slate-400">Untuk mengubah kata sandi, gunakan tombol <span className="font-semibold text-purple-600">Reset Sandi</span> pada baris pengguna.</p>}
          <div><label className={L}>Peran</label><select data-testid="user-role" className={INP} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{roleOptions.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}</select></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-md border border-slate-300 text-sm">Batal</button><button type="submit" data-testid="save-user" className="px-5 py-2 rounded-md bg-[#14758a] text-white text-sm font-semibold">Simpan</button></div>
        </form>
      </Modal>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset Kata Sandi">
        <form onSubmit={doReset} className="space-y-4">
          <p className="text-sm text-slate-600">Setel kata sandi baru untuk <span className="font-semibold text-slate-800">{resetTarget?.email}</span>. Pengguna akan keluar dari semua sesi.</p>
          <div><label className={L}>Kata Sandi Baru</label><input data-testid="reset-password" type="password" required minLength={6} className={INP} value={resetPw} onChange={(e) => setResetPw(e.target.value)} placeholder="Minimal 6 karakter" /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setResetOpen(false)} className="px-4 py-2 rounded-md border border-slate-300 text-sm">Batal</button><button type="submit" data-testid="save-reset" className="px-5 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold">Reset Sandi</button></div>
        </form>
      </Modal>
    </div>
  );
}
