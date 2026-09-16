import React, { useState } from "react";
import { Target, Users, Building2, Star, Camera, MessageSquare, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Panel, StatCard, Empty, Tag, Btn, Field, inputCls } from "../components/ui.jsx";
import { fmtDate, initials } from "../lib/data.js";

export function AdminDashboard({ db }) {
  const wargaList = db.users.filter((u) => u.role === "warga").sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const totalXP = db.reports.filter((r) => r.status === "approved").reduce((s, r) => s + (r.xpAwarded || 0), 0);
  const newFb = db.feedback.filter((f) => f.status === "baru").length;
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-2">
        <StatCard icon={<Target size={16} />} value={db.quests.length} label="Total Quest" />
        <StatCard icon={<Users size={16} />} value={wargaList.length} label="Total Warga" />
        <StatCard icon={<Building2 size={16} />} value={db.users.filter((u) => u.role === "petugas").length} label="Total Petugas" />
        <StatCard icon={<Star size={16} />} value={totalXP.toLocaleString("id-ID")} label="XP Diberikan" />
        <StatCard icon={<Camera size={16} />} value={db.reports.length} label="Total Laporan" />
      </div>
      <Panel title="Quest Terbaru">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-slate-400 text-[11px] uppercase border-b border-slate-100">
                <th className="py-2 pr-3">Judul</th>
                <th className="py-2 pr-3">Kategori</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Laporan</th>
              </tr>
            </thead>
            <tbody>
              {db.quests.slice().reverse().slice(0, 5).map((q) => (
                <tr key={q.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5 pr-3">{q.icon} {q.title}</td>
                  <td className="py-2.5 pr-3">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{q.category}</span>
                  </td>
                  <td className="py-2.5 pr-3"><Tag status={q.status} /></td>
                  <td className="py-2.5">{db.reports.filter((r) => r.questId === q.id).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="5 Warga Teraktif">
        {wargaList.slice(0, 5).map((u, i) => (
          <div key={u.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
            <div className="w-6 text-center font-bold text-slate-400 text-sm">{i + 1}</div>
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-[11px]">
              {initials(u.name)}
            </div>
            <div className="flex-1 text-[13px] font-semibold">{u.name}</div>
            <div className="text-[13px] font-bold text-green-700">{(u.xp || 0).toLocaleString("id-ID")} XP</div>
          </div>
        ))}
      </Panel>
    </>
  );
}

export function AdminUsers({ db, deleteUser, addPetugas }) {
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [showForm, setShowForm] = useState(false);
  const submit = () => {
    if (!form.name.trim() || !form.username.trim() || !form.password) return;
    addPetugas(form.name.trim(), form.username.trim(), form.password);
    setForm({ name: "", username: "", password: "" });
    setShowForm(false);
  };
  return (
    <>
      <Panel
        title="Tambah Akun Petugas"
        action={
          <Btn size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
            <PlusCircle size={14} />
            {showForm ? "Tutup" : "Tambah Petugas"}
          </Btn>
        }
      >
        {showForm ? (
          <div className="grid sm:grid-cols-3 gap-3 items-end">
            <Field label="Nama">
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Username">
              <input className={inputCls} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </Field>
            <Field label="Kata Sandi">
              <input className={inputCls} type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Field>
            <Btn variant="green" className="sm:col-span-3" onClick={submit}>
              Simpan Petugas Baru
            </Btn>
          </div>
        ) : (
          <p className="text-[13px] text-slate-400">Buat akun login untuk petugas desa baru yang akan mengelola quest.</p>
        )}
      </Panel>
      <Panel title="Kelola Pengguna">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-slate-400 text-[11px] uppercase border-b border-slate-100">
                <th className="py-2 pr-3">Nama</th>
                <th className="py-2 pr-3">Username</th>
                <th className="py-2 pr-3">Peran</th>
                <th className="py-2 pr-3">XP</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {db.users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5 pr-3">{u.name}</td>
                  <td className="py-2.5 pr-3 text-slate-400">@{u.username}</td>
                  <td className="py-2.5 pr-3 capitalize">{u.role}</td>
                  <td className="py-2.5 pr-3">{u.role === "warga" ? (u.xp || 0).toLocaleString("id-ID") : "—"}</td>
                  <td className="py-2.5">
                    {u.role !== "admin" && (
                      <Btn size="sm" variant="danger" onClick={() => deleteUser(u.id)}>
                        <Trash2 size={13} />
                        Hapus
                      </Btn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

export function AdminRewards({ db, saveReward, deleteReward, fulfillRedemption }) {
  const [editing, setEditing] = useState(null); // null | 'new' | id
  const [form, setForm] = useState({ name: "", icon: "🎁", xpCost: 500, stock: 10 });
  const openForm = (rw) => {
    if (rw) {
      setForm({ name: rw.name, icon: rw.icon, xpCost: rw.xpCost, stock: rw.stock });
      setEditing(rw.id);
    } else {
      setForm({ name: "", icon: "🎁", xpCost: 500, stock: 10 });
      setEditing("new");
    }
  };
  const submit = () => {
    if (!form.name.trim() || !form.xpCost) return;
    saveReward(editing, { ...form, xpCost: parseInt(form.xpCost, 10), stock: parseInt(form.stock, 10) });
    setEditing(null);
  };
  return (
    <>
      <Panel
        title="Kelola Reward"
        action={
          <Btn size="sm" variant="green" onClick={() => openForm(null)}>
            <PlusCircle size={14} />
            Tambah Reward
          </Btn>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-slate-400 text-[11px] uppercase border-b border-slate-100">
                <th className="py-2 pr-3">Reward</th>
                <th className="py-2 pr-3">Biaya XP</th>
                <th className="py-2 pr-3">Stok</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {db.rewards.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5 pr-3">{r.icon} {r.name}</td>
                  <td className="py-2.5 pr-3">{r.xpCost.toLocaleString("id-ID")} XP</td>
                  <td className="py-2.5 pr-3">{r.stock}</td>
                  <td className="py-2.5 flex gap-2">
                    <Btn size="sm" variant="outline" onClick={() => openForm(r)}>
                      <Pencil size={13} />
                    </Btn>
                    <Btn size="sm" variant="danger" onClick={() => deleteReward(r.id)}>
                      <Trash2 size={13} />
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {editing && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && setEditing(null)}
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-slate-800 mb-4">{editing === "new" ? "Tambah" : "Edit"} Reward</h3>
            <Field label="Nama Reward">
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Emoji Ikon">
              <input className={inputCls} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Biaya XP">
                <input type="number" className={inputCls} value={form.xpCost} onChange={(e) => setForm({ ...form, xpCost: e.target.value })} />
              </Field>
              <Field label="Stok">
                <input type="number" className={inputCls} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </Field>
            </div>
            <div className="flex gap-2 mt-2">
              <Btn variant="outline" className="flex-1" onClick={() => setEditing(null)}>
                Batal
              </Btn>
              <Btn variant="green" className="flex-1" onClick={submit}>
                Simpan
              </Btn>
            </div>
          </div>
        </div>
      )}

      <Panel title="Riwayat Penukaran Reward">
        {db.redemptions.length === 0 ? (
          <Empty icon="🎁" text="Belum ada penukaran reward." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-slate-400 text-[11px] uppercase border-b border-slate-100">
                  <th className="py-2 pr-3">Warga</th>
                  <th className="py-2 pr-3">Reward</th>
                  <th className="py-2 pr-3">Tanggal</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {db.redemptions.slice().reverse().map((rd) => {
                  const u = db.users.find((x) => x.id === rd.userId),
                    r = db.rewards.find((x) => x.id === rd.rewardId);
                  return (
                    <tr key={rd.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 pr-3">{u ? u.name : "-"}</td>
                      <td className="py-2.5 pr-3">{r ? `${r.icon} ${r.name}` : "-"}</td>
                      <td className="py-2.5 pr-3">{fmtDate(rd.ts)}</td>
                      <td className="py-2.5 pr-3"><Tag status={rd.status === "diambil" ? "approved" : "pending"} /></td>
                      <td className="py-2.5">
                        {rd.status !== "diambil" && (
                          <Btn size="sm" variant="green" onClick={() => fulfillRedemption(rd.id)}>
                            Tandai Diambil
                          </Btn>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
