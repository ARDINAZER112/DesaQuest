import React, { useState } from "react";
import {
  Target,
  Camera,
  Users,
  Star,
  ClipboardList,
  PlusCircle,
  Pencil,
  Trash2,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Panel, StatCard, Empty, Tag, Btn, Field, inputCls } from "../components/ui.jsx";
import { fmtDate } from "../lib/data.js";

export function PetugasDashboard({ db }) {
  const activeQuests = db.quests.filter((q) => q.status === "aktif");
  const pending = db.reports.filter((r) => r.status === "pending").length;
  const totalXP = db.reports
    .filter((r) => r.status === "approved")
    .reduce((s, r) => s + (r.xpAwarded || 0), 0);
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-2">
        <StatCard icon={<Target size={16} />} value={activeQuests.length} label="Quest Aktif" />
        <StatCard icon={<Camera size={16} />} value={db.reports.length} label="Total Laporan" />
        <StatCard
          icon={<Users size={16} />}
          value={new Set(db.reports.map((r) => r.userId)).size}
          label="Warga Aktif"
        />
        <StatCard
          icon={<Star size={16} />}
          value={totalXP.toLocaleString("id-ID")}
          label="XP Diberikan"
        />
        <StatCard icon={<ClipboardList size={16} />} value={pending} label="Perlu Verifikasi" />
      </div>
      <Panel title="Quest Aktif Terbaru">
        {activeQuests.length === 0 ? (
          <Empty icon="🎯" text="Belum ada quest aktif." />
        ) : (
          activeQuests.map((q) => {
            const reports = db.reports.filter((r) => r.questId === q.id);
            const approved = reports.filter((r) => r.status === "approved").length;
            const pct = Math.min(100, Math.round((approved / 10) * 100));
            return (
              <div
                key={q.id}
                className="flex items-center gap-3.5 py-3 border-b border-slate-50 last:border-0"
              >
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-lg flex-shrink-0">
                  {q.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <b className="text-[13.5px] block">{q.title}</b>
                  <div className="text-[11.5px] text-slate-400 mb-1.5">
                    {reports.length} laporan ·{" "}
                    {reports.filter((r) => r.status === "pending").length} menunggu
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full"
                      style={{ width: pct + "%" }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </Panel>
    </>
  );
}

export function QuestForm({ quest, onSave, onCancel }) {
  const [f, setF] = useState(
    quest
      ? { ...quest, lat: quest.loc.lat, lng: quest.loc.lng }
      : {
          title: "",
          desc: "",
          category: "Jalan",
          status: "aktif",
          xpBase: 100,
          xpBonus: 20,
          start: "",
          end: "",
          lat: "",
          lng: "",
          radius: 100,
        }
  );
  const set = (k, v) => setF({ ...f, [k]: v });
  const grabLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setF((prev) => ({
          ...prev,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        })),
      () => {}
    );
  };
  const submit = () => {
    if (!f.title.trim() || f.lat === "" || f.lng === "") return;
    const icon =
      { Jalan: "🛣️", Drainase: "💧", Jembatan: "🌉", "Fasilitas Umum": "🏛️", Lainnya: "🚧" }[
        f.category
      ] || "🚧";
    onSave({
      id: quest?.id,
      title: f.title.trim(),
      desc: f.desc.trim(),
      category: f.category,
      icon,
      loc: { lat: parseFloat(f.lat), lng: parseFloat(f.lng) },
      radius: parseInt(f.radius, 10),
      xpBase: parseInt(f.xpBase, 10),
      xpBonus: parseInt(f.xpBonus || 0, 10),
      start: f.start,
      end: f.end,
      status: f.status,
    });
  };
  return (
    <Panel title={quest ? "Edit Quest" : "Buat Quest Baru"}>
      <Field label="Judul Quest">
        <input
          className={inputCls}
          placeholder="Contoh: Pembangunan Gorong-gorong RT 04"
          value={f.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <Field label="Deskripsi">
        <textarea
          className={inputCls}
          rows={3}
          placeholder="Jelaskan tugas pemantauan yang harus dilakukan warga..."
          value={f.desc}
          onChange={(e) => set("desc", e.target.value)}
        />
      </Field>
      <div className="grid sm:grid-cols-2 gap-3.5">
        <Field label="Kategori Pembangunan">
          <select
            className={inputCls}
            value={f.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {["Jalan", "Drainase", "Jembatan", "Fasilitas Umum", "Lainnya"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            className={inputCls}
            value={f.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="aktif">Aktif</option>
            <option value="selesai">Selesai</option>
          </select>
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-3.5">
        <Field label="Poin XP per Laporan">
          <input
            type="number"
            className={inputCls}
            value={f.xpBase}
            onChange={(e) => set("xpBase", e.target.value)}
          />
        </Field>
        <Field label="Poin Bonus (opsional)">
          <input
            type="number"
            className={inputCls}
            value={f.xpBonus}
            onChange={(e) => set("xpBonus", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-3.5">
        <Field label="Periode Mulai">
          <input
            type="date"
            className={inputCls}
            value={f.start}
            onChange={(e) => set("start", e.target.value)}
          />
        </Field>
        <Field label="Periode Selesai">
          <input
            type="date"
            className={inputCls}
            value={f.end}
            onChange={(e) => set("end", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Lokasi & Radius">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            className={inputCls}
            placeholder="Latitude"
            value={f.lat}
            onChange={(e) => set("lat", e.target.value)}
          />
          <input
            className={inputCls}
            placeholder="Longitude"
            value={f.lng}
            onChange={(e) => set("lng", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2.5 mt-2.5">
          <Btn size="sm" variant="outline" onClick={grabLocation}>
            <MapPin size={13} />
            Gunakan Lokasi Saat Ini
          </Btn>
          <small className="text-xs text-slate-400">atau isi koordinat manual</small>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            Radius Toleransi (meter)
          </label>
          <input
            type="number"
            min={10}
            max={500}
            className={inputCls}
            value={f.radius}
            onChange={(e) => set("radius", e.target.value)}
          />
        </div>
        <small className="block mt-1.5 text-xs text-slate-400">
          Warga hanya bisa mengirim laporan jika berada dalam radius ini dari lokasi proyek.
        </small>
      </Field>
      <div className="flex gap-2.5 mt-2">
        <Btn variant="outline" className="flex-1" onClick={onCancel}>
          Batal
        </Btn>
        <Btn variant="green" className="flex-1" onClick={submit}>
          Simpan Quest
        </Btn>
      </div>
    </Panel>
  );
}

export function QuestList({ db, onEdit, onDelete }) {
  return (
    <Panel
      title="Daftar Quest"
      action={
        <Btn size="sm" variant="green" onClick={() => onEdit("new")}>
          <PlusCircle size={14} />
          Buat Quest Baru
        </Btn>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-slate-400 text-[11px] uppercase border-b border-slate-100">
              <th className="py-2 pr-3">Quest</th>
              <th className="py-2 pr-3">Kategori</th>
              <th className="py-2 pr-3">Periode</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Laporan</th>
              <th className="py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {db.quests.map((q) => (
              <tr key={q.id} className="border-b border-slate-50 last:border-0">
                <td className="py-2.5 pr-3">
                  {q.icon} {q.title}
                </td>
                <td className="py-2.5 pr-3">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {q.category}
                  </span>
                </td>
                <td className="py-2.5 pr-3 text-[12px] text-slate-500">
                  {q.start} – {q.end}
                </td>
                <td className="py-2.5 pr-3">
                  <Tag status={q.status} />
                </td>
                <td className="py-2.5 pr-3">
                  {db.reports.filter((r) => r.questId === q.id).length}
                </td>
                <td className="py-2.5 flex gap-2">
                  <Btn size="sm" variant="outline" onClick={() => onEdit(q.id)}>
                    <Pencil size={13} />
                  </Btn>
                  <Btn size="sm" variant="danger" onClick={() => onDelete(q.id)}>
                    <Trash2 size={13} />
                  </Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function VerifikasiLaporan({ db, verify }) {
  const [xpVals, setXpVals] = useState({});
  const pend = db.reports.filter((r) => r.status === "pending").sort((a, b) => a.ts - b.ts);
  const done = db.reports
    .filter((r) => r.status !== "pending")
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 15);
  return (
    <>
      <Panel title={`Menunggu Verifikasi (${pend.length})`}>
        {pend.length === 0 ? (
          <Empty icon="✅" text="Semua laporan sudah diverifikasi." />
        ) : (
          pend.map((r) => {
            const q = db.quests.find((x) => x.id === r.questId),
              u = db.users.find((x) => x.id === r.userId);
            const valid = r.distance <= q.radius;
            return (
              <div
                key={r.id}
                className="flex gap-3.5 py-3.5 border-b border-slate-50 last:border-0 flex-wrap"
              >
                {r.photo ? (
                  <img src={r.photo} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Camera size={20} className="text-slate-300" />
                  </div>
                )}
                <div className="flex-1 min-w-[220px]">
                  <b className="text-[13.5px]">{u ? u.name : "-"}</b>{" "}
                  <span className="text-[12px] text-slate-400">→ {q?.title}</span>
                  <div className="text-[11.5px] text-slate-400 mt-0.5">
                    {fmtDate(r.ts)} · {valid ? "✅" : "⚠️"} {r.distance} m dari lokasi (radius{" "}
                    {q?.radius} m)
                  </div>
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <input
                      type="number"
                      className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                      value={xpVals[r.id] ?? q.xpBase}
                      onChange={(e) => setXpVals({ ...xpVals, [r.id]: e.target.value })}
                    />
                    <Btn
                      size="sm"
                      variant="green"
                      onClick={() => verify(r.id, "approve", xpVals[r.id] ?? q.xpBase)}
                    >
                      <CheckCircle2 size={13} />
                      Setujui & Beri XP
                    </Btn>
                    <Btn size="sm" variant="danger" onClick={() => verify(r.id, "reject")}>
                      <XCircle size={13} />
                      Tolak
                    </Btn>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </Panel>
      <Panel title="Riwayat Verifikasi">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-slate-400 text-[11px] uppercase border-b border-slate-100">
                <th className="py-2 pr-3">Warga</th>
                <th className="py-2 pr-3">Quest</th>
                <th className="py-2 pr-3">Jarak</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">XP</th>
              </tr>
            </thead>
            <tbody>
              {done.map((r) => {
                const q = db.quests.find((x) => x.id === r.questId),
                  u = db.users.find((x) => x.id === r.userId);
                return (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 pr-3">{u ? u.name : "-"}</td>
                    <td className="py-2.5 pr-3">{q ? q.title : "-"}</td>
                    <td className="py-2.5 pr-3">{r.distance} m</td>
                    <td className="py-2.5 pr-3">
                      <Tag status={r.status} />
                    </td>
                    <td className="py-2.5">{r.xpAwarded || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
